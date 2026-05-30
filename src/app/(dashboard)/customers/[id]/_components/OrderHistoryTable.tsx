import Link from 'next/link'
import type { OrderListItem } from '../../../orders/types'
import { OrderStatusBadge, PaymentStatusBadge } from '../../../orders/_components/StatusBadge'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

const COLS = '92px 1fr 88px 96px 96px'

export function OrderHistoryTable({ orders }: { orders: OrderListItem[] }) {
  if (orders.length === 0) {
    return (
      <div style={{
        padding: '56px 24px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 12,
      }}>
        <span className="ms" style={{
          fontSize: 64, color: 'var(--md-outline)',
          fontVariationSettings: "'FILL' 0, 'wght' 300",
        }}>receipt_long</span>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--md-on-surface)' }}>אין הזמנות עדיין</div>
          <div style={{ fontSize: 14, color: 'var(--md-on-surface-variant)', marginTop: 4, maxWidth: 320 }}>
            הזמנות הלקוח יופיעו כאן לאחר ביצוע ההזמנה הראשונה
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div style={{
        display: 'grid', gridTemplateColumns: COLS, gap: 8,
        padding: '10px 20px', alignItems: 'center',
        borderBottom: '1px solid var(--md-outline-variant)',
        fontSize: 11, fontWeight: 600, letterSpacing: 0.4,
        textTransform: 'uppercase', color: 'var(--md-on-surface-variant)',
      }}>
        <span>מס׳</span>
        <span>תאריך</span>
        <span>סטטוס</span>
        <span>תשלום</span>
        <span style={{ textAlign: 'start' }}>סכום</span>
      </div>

      {/* Rows */}
      {orders.map((o, i) => (
        <Link
          key={o.id}
          href={`/orders/${o.id}`}
          style={{
            display: 'grid', gridTemplateColumns: COLS, gap: 8,
            padding: '12px 20px', alignItems: 'center',
            borderBottom: i < orders.length - 1 ? '1px solid var(--md-outline-variant)' : undefined,
            textDecoration: 'none', color: 'inherit',
          }}
        >
          <span className="num" style={{ fontSize: 13, fontWeight: 600, color: 'var(--md-on-surface)' }}>
            #{o.id.slice(0, 6).toUpperCase()}
          </span>
          <span className="num" style={{ fontSize: 13, color: 'var(--md-on-surface-variant)' }}>
            {formatDate(o.created_at)}
          </span>
          <span><OrderStatusBadge status={o.status} /></span>
          <span><PaymentStatusBadge status={o.payment_status} /></span>
          <span className="num" style={{ fontSize: 13, fontWeight: 600, color: 'var(--md-on-surface)' }}>
            ₪{(o.total ?? 0).toLocaleString('he-IL')}
          </span>
        </Link>
      ))}
    </div>
  )
}
