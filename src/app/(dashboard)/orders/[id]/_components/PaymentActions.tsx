'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { sendPaymentLinkAction } from '../../actions'

interface Props {
  orderId: string
  total: number
  paymentStatus: string
  paymentLink: string | null
  payplusRef: string | null
}

export function PaymentActions({ orderId, total, paymentStatus, paymentLink, payplusRef }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const sendLink = () => {
    setError(null); setSuccess(null)
    startTransition(async () => {
      const res = await sendPaymentLinkAction(orderId)
      if (res.error) { setError(res.error); return }
      setSuccess('קישור PayPlus נשלח בהצלחה')
      router.refresh()
    })
  }

  const PAYMENT_STATUS_LABELS: Record<string, string> = {
    unpaid: 'לא שולם', link_sent: 'קישור נשלח', paid: 'שולם', refunded: 'הוחזר',
  }

  return (
    <div>
      {/* Hero amount + status */}
      <div style={{
        padding: '12px 14px',
        background: 'var(--md-surface-container)',
        borderRadius: 12, marginBottom: 12,
        display: 'flex', flexDirection: 'column', gap: 6,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{
            fontSize: 11, fontWeight: 600, letterSpacing: 0.4, textTransform: 'uppercase',
            color: 'var(--md-on-surface-variant)',
          }}>לגבייה</span>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '3px 10px', borderRadius: 8,
            fontSize: 11, fontWeight: 600,
            background: paymentStatus === 'paid'
              ? 'var(--md-primary)' : 'var(--md-secondary-container)',
            color: paymentStatus === 'paid'
              ? '#fff' : 'var(--md-on-secondary-container)',
          }}>
            {PAYMENT_STATUS_LABELS[paymentStatus] ?? paymentStatus}
          </span>
        </div>
        <div className="currency num" style={{ fontSize: 26, fontWeight: 700, color: 'var(--md-on-surface)' }}>
          ₪{total.toLocaleString('he-IL', { minimumFractionDigits: 2 })}
        </div>
      </div>

      {payplusRef && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '8px 0', borderBottom: '1px solid var(--md-outline-variant)',
          fontSize: 12,
        }}>
          <span style={{ fontWeight: 600, letterSpacing: 0.4, textTransform: 'uppercase', color: 'var(--md-on-surface-variant)', fontSize: 11 }}>
            PayPlus Ref
          </span>
          <span style={{ color: 'var(--md-on-surface-variant)' }}>{payplusRef}</span>
        </div>
      )}

      {error && (
        <div style={{
          marginTop: 8, padding: '8px 12px', borderRadius: 8,
          background: 'rgba(179,38,30,0.08)', border: '1px solid rgba(179,38,30,0.25)',
          fontSize: 12, color: 'var(--md-error)',
        }}>{error}</div>
      )}
      {success && (
        <div style={{
          marginTop: 8, padding: '8px 12px', borderRadius: 8,
          background: 'rgba(27,94,32,0.08)', border: '1px solid rgba(27,94,32,0.25)',
          fontSize: 12, color: 'var(--md-primary)',
        }}>{success}</div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
        {paymentStatus !== 'paid' && (
          <button
            onClick={sendLink}
            disabled={isPending}
            style={{
              width: '100%', height: 40, borderRadius: 999,
              background: 'var(--md-secondary-container)',
              color: 'var(--md-on-secondary-container)',
              border: 'none', cursor: isPending ? 'wait' : 'pointer',
              fontFamily: 'inherit', fontWeight: 500, fontSize: 13,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              opacity: isPending ? 0.7 : 1,
            }}>
            <span className="ms" style={{ fontSize: 16 }}>send</span>
            {paymentLink ? 'שלח קישור תשלום שוב' : 'שלח קישור PayPlus'}
          </button>
        )}
      </div>
    </div>
  )
}
