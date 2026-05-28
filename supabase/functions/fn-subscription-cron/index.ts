import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  })
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })

  // Protect against unauthorized invocations (pg_cron passes this header)
  const CRON_SECRET = Deno.env.get('CRON_SECRET')
  if (CRON_SECRET) {
    const auth = req.headers.get('Authorization')
    if (auth !== `Bearer ${CRON_SECRET}`) {
      return json({ error: 'Unauthorized' }, 401)
    }
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD

  // Step 1 — fetch due subscriptions + items (without variant join to avoid FK name issues)
  const { data: subscriptions, error: fetchErr } = await supabase
    .from('subscriptions')
    .select(
      'id, tenant_id, branch_id, customer_id, created_by, frequency_days, subscription_items(variant_id, product_name, variant_desc, quantity)',
    )
    .eq('status', 'active')
    .lte('next_order_at', today)

  if (fetchErr) {
    console.error('[fn-subscription-cron] fetch subscriptions failed', fetchErr)
    return json({ error: 'fetch failed', detail: fetchErr.message }, 500)
  }

  if (!subscriptions || subscriptions.length === 0) {
    console.info('[fn-subscription-cron] no subscriptions due today')
    return json({ ok: 0, failed: 0, results: [], processed_at: new Date().toISOString() })
  }

  // Step 2 — batch fetch variant prices for all referenced variant_ids
  type SubItem = {
    variant_id: string | null
    product_name: string
    variant_desc: string | null
    quantity: number
  }

  type Sub = {
    id: string
    tenant_id: string
    branch_id: string
    customer_id: string
    created_by: string
    frequency_days: number
    subscription_items: SubItem[]
  }

  const allVariantIds = [
    ...new Set(
      (subscriptions as unknown as Sub[])
        .flatMap((s) => s.subscription_items.map((i) => i.variant_id))
        .filter((id): id is string => id !== null),
    ),
  ]

  type VariantRow = {
    id: string
    price: number
    cost_price: number | null
    sku: string | null
    products: { vat_rate: number } | null
  }

  const variantMap = new Map<string, VariantRow>()

  if (allVariantIds.length > 0) {
    const { data: variants, error: varErr } = await supabase
      .from('product_variants')
      .select('id, price, cost_price, sku, products!product_id(vat_rate)')
      .in('id', allVariantIds)
      .is('deleted_at', null)

    if (varErr) {
      console.error('[fn-subscription-cron] variant fetch failed', varErr)
      return json({ error: 'variant fetch failed', detail: varErr.message }, 500)
    }

    for (const v of variants ?? []) {
      variantMap.set(v.id as string, v as unknown as VariantRow)
    }
  }

  // Step 3 — process each subscription
  const results: Array<{ subscription_id: string; order_id?: string; error?: string }> = []

  for (const sub of subscriptions as unknown as Sub[]) {
    try {
      // Build order items with current catalog prices
      const resolvedItems = sub.subscription_items.map((si) => {
        const variant = si.variant_id ? variantMap.get(si.variant_id) : undefined
        const unit_price = variant?.price ?? 0
        const vat_rate = variant?.products?.vat_rate ?? 18
        const total_price = round2(si.quantity * unit_price)

        return {
          tenant_id: sub.tenant_id,
          variant_id: si.variant_id ?? null,
          product_name: si.product_name,
          variant_desc: si.variant_desc ?? null,
          sku: variant?.sku ?? null,
          quantity: si.quantity,
          unit_price,
          cost_price: variant?.cost_price ?? null,
          vat_rate,
          total_price,
          // order_id filled after insert
          order_id: '',
        }
      })

      // Compute totals
      const subtotal = round2(resolvedItems.reduce((s, i) => s + i.total_price, 0))
      const vat_amount = round2(
        resolvedItems.reduce((s, i) => s + round2(i.total_price * i.vat_rate / 100), 0),
      )
      const total = round2(subtotal + vat_amount)

      // Insert order
      const { data: order, error: orderErr } = await supabase
        .from('orders')
        .insert({
          tenant_id: sub.tenant_id,
          branch_id: sub.branch_id,
          customer_id: sub.customer_id,
          created_by: sub.created_by,
          subscription_id: sub.id,
          order_type: 'subscription',
          source: 'subscription_auto',
          status: 'pending',
          payment_status: 'unpaid',
          subtotal,
          discount: 0,
          vat_amount,
          total,
        })
        .select('id')
        .single()

      if (orderErr || !order) {
        console.error('[fn-subscription-cron] order insert failed', sub.id, orderErr)
        results.push({ subscription_id: sub.id, error: orderErr?.message ?? 'order insert failed' })
        continue
      }

      const orderId = order.id as string

      // Insert order_items
      const itemsPayload = resolvedItems.map((i) => ({ ...i, order_id: orderId }))
      const { error: itemsErr } = await supabase.from('order_items').insert(itemsPayload)

      if (itemsErr) {
        console.error('[fn-subscription-cron] items insert failed', sub.id, itemsErr)
        await supabase.from('orders').delete().eq('id', orderId)
        results.push({ subscription_id: sub.id, error: itemsErr.message })
        continue
      }

      // Advance next_order_at by frequency_days
      const nextDate = new Date()
      nextDate.setDate(nextDate.getDate() + sub.frequency_days)
      const nextOrderAt = nextDate.toISOString().split('T')[0]

      const { error: advanceErr } = await supabase
        .from('subscriptions')
        .update({ next_order_at: nextOrderAt, updated_at: new Date().toISOString() })
        .eq('id', sub.id)

      if (advanceErr) {
        console.error('[fn-subscription-cron] advance next_order_at failed', sub.id, advanceErr)
        // Not fatal — order was created successfully
      }

      results.push({ subscription_id: sub.id, order_id: orderId })
    } catch (err) {
      console.error('[fn-subscription-cron] error for sub', sub.id, err)
      results.push({ subscription_id: sub.id, error: String(err) })
    }
  }

  const ok = results.filter((r) => !r.error).length
  const failed = results.filter((r) => r.error).length

  console.info(
    `[fn-subscription-cron] done: ${ok} orders created, ${failed} failed, at ${today}`,
  )

  return json({ ok, failed, results, processed_at: new Date().toISOString() })
})
