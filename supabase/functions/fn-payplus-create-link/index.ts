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

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })

  try {
    const { order_id } = (await req.json()) as { order_id?: string }
    if (!order_id) return json({ error: 'order_id חסר' }, 400)

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    // Fetch order + customer + items
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .select(
        'id, tenant_id, total, notes, customer_id, customers!customer_id(full_name, phone, email), order_items(product_name, quantity, unit_price, vat_rate, total_price)',
      )
      .eq('id', order_id)
      .single()

    if (orderErr || !order) {
      console.error('[fn-payplus-create-link] order fetch failed', orderErr)
      return json({ error: 'הזמנה לא נמצאה' }, 404)
    }

    const PAYPLUS_API_KEY = Deno.env.get('PAYPLUS_API_KEY')
    const PAYPLUS_SECRET = Deno.env.get('PAYPLUS_SECRET')
    const PAYPLUS_PAGE_UID = Deno.env.get('PAYPLUS_PAGE_UID')
    const PAYPLUS_BASE_URL =
      Deno.env.get('PAYPLUS_BASE_URL') ?? 'https://sandbox.payplus.co.il/api/v1.0'

    // Credentials not configured yet — return mock URL for development
    if (!PAYPLUS_API_KEY || !PAYPLUS_SECRET || !PAYPLUS_PAGE_UID) {
      const mockUrl = `https://sandbox.payplus.co.il/mock?order=${order_id}&amount=${order.total}`
      await supabase
        .from('orders')
        .update({
          payment_link: mockUrl,
          payment_method: 'payplus_link',
          payment_status: 'link_sent',
          updated_at: new Date().toISOString(),
        })
        .eq('id', order_id)

      console.info('[fn-payplus-create-link] mock mode — PAYPLUS_API_KEY not set')
      return json({ payment_url: mockUrl, mock: true })
    }

    type Customer = { full_name: string; phone: string | null; email: string | null }
    type OrderItem = {
      product_name: string
      quantity: number
      unit_price: number
      vat_rate: number
      total_price: number
    }

    const customer = order.customers as unknown as Customer | null
    const items = (order.order_items ?? []) as unknown as OrderItem[]

    const payplusBody = {
      payment_page_uid: PAYPLUS_PAGE_UID,
      charge_currency: 'ILS',
      amount: order.total,
      full_name: customer?.full_name ?? 'לקוח',
      phone: customer?.phone ?? '',
      email: customer?.email ?? '',
      more_info: `הזמנה #${(order_id as string).slice(0, 8)}`,
      items: items.map((item) => ({
        name: item.product_name,
        quantity: item.quantity,
        price: item.unit_price,
        vat_type: item.vat_rate > 0 ? 1 : 0,
      })),
    }

    const payplusRes = await fetch(`${PAYPLUS_BASE_URL}/PaymentPages/generateLink`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `ApiKey ${PAYPLUS_API_KEY}:${PAYPLUS_SECRET}`,
      },
      body: JSON.stringify(payplusBody),
    })

    if (!payplusRes.ok) {
      const errBody = await payplusRes.text()
      console.error('[fn-payplus-create-link] PayPlus API error', payplusRes.status, errBody)
      return json({ error: 'שגיאה ב-PayPlus API' }, 502)
    }

    const payplusData = (await payplusRes.json()) as {
      payment_url?: string
      page_request_uid?: string
      error_message?: string
    }

    const paymentUrl = payplusData.payment_url
    if (!paymentUrl) {
      console.error('[fn-payplus-create-link] no payment_url in response', payplusData)
      return json({ error: 'PayPlus לא החזיר URL תשלום' }, 502)
    }

    const { error: updateErr } = await supabase
      .from('orders')
      .update({
        payment_link: paymentUrl,
        payment_method: 'payplus_link',
        payment_status: 'link_sent',
        payplus_ref: payplusData.page_request_uid ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', order_id)

    if (updateErr) {
      console.error('[fn-payplus-create-link] update failed', updateErr)
    }

    return json({ payment_url: paymentUrl })
  } catch (err) {
    console.error('[fn-payplus-create-link] unexpected error', err)
    return json({ error: 'שגיאה פנימית' }, 500)
  }
})
