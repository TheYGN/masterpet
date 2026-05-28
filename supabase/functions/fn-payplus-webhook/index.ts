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

// Verify PayPlus HMAC-SHA256 signature using Web Crypto (no external deps)
async function verifySignature(secret: string, body: string, signature: string): Promise<boolean> {
  try {
    const encoder = new TextEncoder()
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify'],
    )
    const sigBytes = new Uint8Array(
      signature.match(/.{2}/g)!.map((byte) => parseInt(byte, 16)),
    )
    return await crypto.subtle.verify('HMAC', key, sigBytes, encoder.encode(body))
  } catch {
    return false
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })

  try {
    const rawBody = await req.text()

    let payload: Record<string, unknown>
    try {
      payload = JSON.parse(rawBody)
    } catch {
      return json({ error: 'invalid JSON' }, 400)
    }

    // Verify signature if PAYPLUS_WEBHOOK_SECRET is configured
    const WEBHOOK_SECRET = Deno.env.get('PAYPLUS_WEBHOOK_SECRET')
    if (WEBHOOK_SECRET) {
      const signature =
        req.headers.get('x-payplus-signature') ??
        req.headers.get('x-signature') ??
        ''
      const valid = await verifySignature(WEBHOOK_SECRET, rawBody, signature)
      if (!valid) {
        console.warn('[fn-payplus-webhook] invalid signature')
        return json({ error: 'invalid signature' }, 401)
      }
    }

    // PayPlus transaction fields:
    // status_code: 1 = approved, others = declined/error
    // page_request_uid: our internal reference (stored in orders.payplus_ref)
    // transaction_uid: PayPlus transaction ID
    const statusCode = payload.status_code as number
    const payplusRef =
      (payload.page_request_uid as string) ?? (payload.transaction_uid as string)

    // Only process approved transactions
    if (statusCode !== 1) {
      console.info('[fn-payplus-webhook] non-approved status_code', statusCode)
      return json({ ok: true })
    }

    if (!payplusRef) {
      console.error('[fn-payplus-webhook] missing payplus_ref in payload', payload)
      return json({ error: 'payplus_ref חסר' }, 400)
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    // Find order by payplus_ref
    const { data: order, error: findErr } = await supabase
      .from('orders')
      .select('id, status, tenant_id')
      .eq('payplus_ref', payplusRef)
      .maybeSingle()

    if (findErr) {
      console.error('[fn-payplus-webhook] find order failed', findErr)
      return json({ error: 'DB error' }, 500)
    }

    if (!order) {
      // Unknown ref — return 200 to stop PayPlus retries
      console.warn('[fn-payplus-webhook] order not found for ref', payplusRef)
      return json({ ok: true })
    }

    // Build update: always set paid, advance pending→confirmed
    const updates: Record<string, string> = {
      payment_status: 'paid',
      updated_at: new Date().toISOString(),
    }
    if (order.status === 'pending') {
      updates.status = 'confirmed'
    }

    const { error: updateErr } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', order.id)

    if (updateErr) {
      console.error('[fn-payplus-webhook] update failed', updateErr)
      return json({ error: 'update failed' }, 500)
    }

    // Audit log (service_role bypasses RLS)
    await supabase.from('audit_logs').insert({
      tenant_id: order.tenant_id,
      actor_id: null,
      actor_role: 'system',
      action: 'order.payment_received',
      target_type: 'order',
      target_id: order.id,
      metadata: {
        payplus_ref: payplusRef,
        amount: payload.amount,
        transaction_uid: payload.transaction_uid,
      },
    })

    console.info('[fn-payplus-webhook] payment confirmed for order', order.id)
    return json({ ok: true })
  } catch (err) {
    console.error('[fn-payplus-webhook] unexpected error', err)
    return json({ error: 'שגיאה פנימית' }, 500)
  }
})
