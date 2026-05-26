import type { OrderStatus, PaymentStatus, OrderSource } from '../types'

// ─── Order status ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<OrderStatus, { label: string; bg: string; color: string; border?: string }> = {
  pending:    { label: 'ממתין',  bg: 'var(--md-secondary-container)', color: 'var(--md-on-secondary-container)' },
  confirmed:  { label: 'אושר',   bg: 'var(--md-tertiary-container)',  color: 'var(--md-on-tertiary-container)' },
  preparing:  { label: 'בהכנה',  bg: 'var(--md-secondary-container)', color: 'var(--md-on-secondary-container)' },
  in_transit: { label: 'בדרך',   bg: 'var(--md-tertiary-container)',  color: 'var(--md-on-tertiary-container)' },
  delivered:  { label: 'נמסר',   bg: 'var(--md-primary)',            color: '#fff' },
  cancelled:  { label: 'בוטל',   bg: 'transparent',                  color: 'var(--md-error)', border: '1px solid rgba(179,38,30,0.45)' },
}

const PAYMENT_CONFIG: Record<PaymentStatus, { label: string; bg: string; color: string; border?: string }> = {
  paid:      { label: 'שולם',       bg: 'var(--md-primary)',           color: '#fff' },
  unpaid:    { label: 'לא שולם',    bg: 'transparent',                 color: 'var(--md-error)', border: '1px solid rgba(179,38,30,0.45)' },
  link_sent: { label: 'קישור נשלח', bg: 'var(--md-secondary-container)', color: 'var(--md-on-secondary-container)' },
  refunded:  { label: 'הוחזר',      bg: 'var(--md-surface-container-high)', color: 'var(--md-on-surface-variant)' },
}

const SOURCE_CONFIG: Record<OrderSource, { icon: string; color: string; bg: string }> = {
  manual:            { icon: 'edit_note',      color: 'var(--md-secondary)',  bg: 'var(--md-secondary-container)' },
  woocommerce:       { icon: 'shopping_cart',  color: '#7F54B3',              bg: '#7F54B31F' },
  whatsapp:          { icon: 'chat',           color: '#25D366',              bg: '#25D3661F' },
  subscription_auto: { icon: 'autorenew',      color: 'var(--md-tertiary)',   bg: 'var(--md-tertiary-container)' },
}

// ─── Components ──────────────────────────────────────────────────────────────

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const cfg = STATUS_CONFIG[status]
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '3px 10px', borderRadius: 8,
      fontSize: 11, fontWeight: 600,
      background: cfg.bg, color: cfg.color,
      border: cfg.border ?? 'none',
      whiteSpace: 'nowrap',
    }}>
      {cfg.label}
    </span>
  )
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const cfg = PAYMENT_CONFIG[status]
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '3px 10px', borderRadius: 8,
      fontSize: 11, fontWeight: 600,
      background: cfg.bg, color: cfg.color,
      border: cfg.border ?? 'none',
      whiteSpace: 'nowrap',
    }}>
      {cfg.label}
    </span>
  )
}

export function SourceDot({ source }: { source: OrderSource }) {
  const cfg = SOURCE_CONFIG[source]
  return (
    <span title={source} style={{
      width: 26, height: 26, borderRadius: 8,
      background: cfg.bg, color: cfg.color,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <span className="ms" style={{ fontSize: 14, fontVariationSettings: "'FILL' 1, 'wght' 500" }}>
        {cfg.icon}
      </span>
    </span>
  )
}

export function getStatusLabel(status: OrderStatus) { return STATUS_CONFIG[status]?.label ?? status }
export function getNextStatus(status: OrderStatus): OrderStatus | null {
  const map: Partial<Record<OrderStatus, OrderStatus>> = {
    pending: 'confirmed', confirmed: 'preparing', preparing: 'in_transit', in_transit: 'delivered',
  }
  return map[status] ?? null
}
