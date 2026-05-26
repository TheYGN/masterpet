'use client'

import { useState } from 'react'
import type { OrderListItem } from '../types'
import { OrderStatusBadge, PaymentStatusBadge, SourceDot } from './StatusBadge'

const COLS = '100px minmax(180px,1fr) 200px 100px 110px 120px 72px 110px 80px'

const AVATAR_GRADIENTS = [
  'linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%)',
  'linear-gradient(135deg, #38656A 0%, #1B5E20 100%)',
  'linear-gradient(135deg, #52634F 0%, #38656A 100%)',
  'linear-gradient(135deg, #2E7D32 0%, #52634F 100%)',
  'linear-gradient(135deg, #38656A 0%, #2E7D32 100%)',
]

function avatarGradient(id: string) {
  let h = 0
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) & 0xffff
  return AVATAR_GRADIENTS[h % AVATAR_GRADIENTS.length]
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2)
  return parts[0][0] + '.' + parts[parts.length - 1][0]
}

interface Props {
  orders: OrderListItem[]
  total: number
  page: number
  pageSize: number
  onPageChange: (page: number) => void
  onOpenOrder: (id: string) => void
  onSendPaymentLink: (id: string) => void
}

export function OrdersTable({
  orders,
  total,
  page,
  pageSize,
  onPageChange,
  onOpenOrder,
  onSendPaymentLink,
}: Props) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  return (
    <div style={{
      background: 'var(--md-surface-container-low)',
      borderRadius: 16,
      border: '1px solid var(--md-outline-variant)',
      overflow: 'hidden',
    }}>
      <TableHeader />

      {orders.length === 0
        ? <EmptyState />
        : <div>
            {orders.map((order, i) => (
              <OrderRow
                key={order.id}
                order={order}
                zebra={i % 2 === 1}
                last={i === orders.length - 1}
                onOpen={() => onOpenOrder(order.id)}
                onSendLink={() => onSendPaymentLink(order.id)}
              />
            ))}
          </div>
      }

      <TableFooter
        showing={orders.length}
        total={total}
        page={page}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </div>
  )
}

function TableHeader() {
  const cell: React.CSSProperties = {
    fontSize: 11, fontWeight: 600, letterSpacing: 0.4,
    textTransform: 'uppercase',
    color: 'var(--md-on-surface-variant)',
    display: 'flex', alignItems: 'center', gap: 4,
  }
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: COLS,
      gap: 12, padding: '0 20px',
      height: 44, alignItems: 'center',
      background: 'var(--md-surface-container)',
      borderBottom: '1px solid var(--md-outline-variant)',
    }}>
      <div style={{ ...cell, cursor: 'pointer' }}>
        <span># הזמנה</span>
        <span className="ms" style={{ fontSize: 14, opacity: 0.5 }}>unfold_more</span>
      </div>
      <div style={cell}>לקוח</div>
      <div style={cell}>מוצרים</div>
      <div style={{ ...cell, cursor: 'pointer' }}>
        <span>סה״כ</span>
        <span className="ms" style={{ fontSize: 14 }}>arrow_downward</span>
      </div>
      <div style={{ ...cell, justifyContent: 'center' }}>תשלום</div>
      <div style={{ ...cell, justifyContent: 'center' }}>סטטוס</div>
      <div style={{ ...cell, justifyContent: 'center' }}>ערוץ</div>
      <div style={{ ...cell, cursor: 'pointer' }}>
        <span>תאריך</span>
        <span className="ms" style={{ fontSize: 14, opacity: 0.5 }}>unfold_more</span>
      </div>
      <div style={{ ...cell, justifyContent: 'center' }}>פעולות</div>
    </div>
  )
}

function OrderRow({ order, zebra, last, onOpen, onSendLink }: {
  order: OrderListItem
  zebra: boolean
  last: boolean
  onOpen: () => void
  onSendLink: () => void
}) {
  const [hover, setHover] = useState(false)
  const cancelled = order.status === 'cancelled'

  let bg: string
  if (cancelled) {
    bg = hover ? 'var(--md-surface-container-high)' : 'rgba(219,223,215,0.30)'
  } else if (hover) {
    bg = 'var(--md-surface-container-high)'
  } else {
    bg = zebra ? 'var(--md-surface-container-low)' : 'var(--md-surface-container-lowest)'
  }

  const textColor = cancelled ? 'var(--md-on-surface-variant)' : 'var(--md-on-surface)'
  const textOpacity = cancelled ? 0.75 : 1
  const grad = avatarGradient(order.customer_id)
  const ini = initials(order.customer_name)
  const shortId = order.id.slice(0, 6).toUpperCase()

  const dateStr = new Date(order.created_at).toLocaleString('he-IL', {
    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false,
  })

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={onOpen}
      style={{
        display: 'grid', gridTemplateColumns: COLS,
        gap: 12, padding: '0 20px',
        height: 64, alignItems: 'center',
        background: bg,
        borderBottom: last ? 'none' : '1px solid var(--md-outline-variant)',
        boxShadow: hover ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
        position: 'relative', zIndex: hover ? 1 : 0,
        transition: 'background 100ms ease, box-shadow 100ms ease',
        cursor: 'pointer',
      }}>

      {/* # הזמנה */}
      <div className="num" style={{ fontSize: 13, fontWeight: 500, color: textColor, opacity: textOpacity }}>
        #{shortId}
      </div>

      {/* לקוח */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          background: cancelled ? 'var(--md-surface-container)' : grad,
          color: cancelled ? 'var(--md-on-surface-variant)' : '#fff',
          opacity: cancelled ? 0.7 : 1,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, fontWeight: 600, flexShrink: 0, letterSpacing: 0.2,
        }}>
          {ini}
        </div>
        <span style={{
          fontSize: 14, fontWeight: 500, color: textColor, opacity: textOpacity,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {order.customer_name}
        </span>
      </div>

      {/* מוצרים */}
      <div style={{
        fontSize: 13, color: textColor, opacity: textOpacity,
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        direction: 'rtl',
      }}>
        {order.items_count === 1 ? '1 פריט' : `${order.items_count} פריטים`}
      </div>

      {/* סה״כ */}
      <div className="currency num" style={{ fontSize: 14, fontWeight: 600, color: textColor, opacity: textOpacity }}>
        ₪{order.total.toLocaleString('he-IL', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
      </div>

      {/* תשלום */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <PaymentStatusBadge status={order.payment_status} />
      </div>

      {/* סטטוס */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <OrderStatusBadge status={order.status} />
      </div>

      {/* ערוץ */}
      <div style={{ display: 'flex', justifyContent: 'center', opacity: cancelled ? 0.55 : 1 }}>
        <SourceDot source={order.source} />
      </div>

      {/* תאריך */}
      <div className="num" style={{ fontSize: 12, color: 'var(--md-on-surface-variant)' }}>
        {dateStr}
      </div>

      {/* פעולות */}
      <div
        style={{ display: 'flex', justifyContent: 'center', gap: 2 }}
        onClick={e => e.stopPropagation()}
      >
        {hover ? (
          <>
            <RowAction icon="open_in_new" label="פתח" onClick={onOpen} />
            <RowAction icon="send" label="שלח קישור תשלום" onClick={onSendLink} />
          </>
        ) : (
          <button title="פעולות" style={{
            width: 28, height: 28, borderRadius: '50%', border: 'none',
            background: 'transparent', cursor: 'pointer',
            color: 'var(--md-on-surface-variant)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            opacity: 0.55,
          }}>
            <span className="ms" style={{ fontSize: 18 }}>more_horiz</span>
          </button>
        )}
      </div>
    </div>
  )
}

function RowAction({ icon, label, onClick }: { icon: string; label: string; onClick: () => void }) {
  const [hover, setHover] = useState(false)
  return (
    <button
      title={label}
      aria-label={label}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={onClick}
      style={{
        width: 30, height: 30, borderRadius: '50%', border: 'none',
        background: hover ? 'var(--md-surface-container)' : 'transparent',
        cursor: 'pointer',
        color: 'var(--md-on-surface-variant)',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background 100ms ease',
      }}>
      <span className="ms" style={{ fontSize: 18 }}>{icon}</span>
    </button>
  )
}

function EmptyState() {
  return (
    <div style={{
      padding: '56px 24px',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
    }}>
      <span className="ms" style={{
        fontSize: 72, color: 'var(--md-outline)',
        fontVariationSettings: "'FILL' 0, 'wght' 400, 'opsz' 48",
      }}>receipt_long</span>
      <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--md-on-surface)' }}>
        אין הזמנות עדיין
      </div>
      <div style={{ fontSize: 14, color: 'var(--md-on-surface-variant)', textAlign: 'center', maxWidth: 480 }}>
        צור הזמנה ידנית או חכה לפניות מ-WhatsApp ו-WooCommerce
      </div>
    </div>
  )
}

function TableFooter({ showing, total, page, totalPages, onPageChange }: {
  showing: number
  total: number
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}) {
  return (
    <div style={{
      height: 48, padding: '0 20px',
      background: 'var(--md-surface-container)',
      borderTop: '1px solid var(--md-outline-variant)',
      display: 'grid', gridTemplateColumns: '1fr auto 1fr',
      alignItems: 'center', gap: 12,
    }}>
      <div style={{ fontSize: 12, color: 'var(--md-on-surface-variant)' }}>
        מציג{' '}
        <span className="num" style={{ fontWeight: 600, color: 'var(--md-on-surface)' }}>{showing}</span>{' '}
        מתוך{' '}
        <span className="num" style={{ fontWeight: 600, color: 'var(--md-on-surface)' }}>{total}</span>{' '}
        הזמנות
      </div>

      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        fontSize: 12, color: 'var(--md-on-surface-variant)',
      }}>
        שורות בעמוד:{' '}
        <span className="num" style={{ fontWeight: 600, color: 'var(--md-on-surface)' }}>10</span>
        <span className="ms" style={{ fontSize: 16 }}>expand_more</span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 4 }}>
        <PagerBtn icon="chevron_right" disabled={page <= 1} onClick={() => onPageChange(page - 1)} />
        {buildPageRange(page, totalPages).map((p, i) =>
          p === '…'
            ? <span key={`ellipsis-${i}`} className="num" style={{ fontSize: 13, color: 'var(--md-on-surface-variant)', padding: '0 4px' }}>...</span>
            : <PagerBtn key={p} active={p === page} onClick={() => onPageChange(p as number)}>{p}</PagerBtn>
        )}
        <PagerBtn icon="chevron_left" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)} />
      </div>
    </div>
  )
}

function buildPageRange(page: number, total: number): Array<number | '…'> {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1)
  const pages: Array<number | '…'> = [1]
  if (page > 3) pages.push('…')
  for (let p = Math.max(2, page - 1); p <= Math.min(total - 1, page + 1); p++) pages.push(p)
  if (page < total - 2) pages.push('…')
  pages.push(total)
  return pages
}

function PagerBtn({ active, disabled, icon, onClick, children }: {
  active?: boolean
  disabled?: boolean
  icon?: string
  onClick?: () => void
  children?: React.ReactNode
}) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      style={{
        minWidth: 28, height: 28, padding: '0 6px', borderRadius: 999,
        border: 'none',
        background: active ? 'var(--md-primary-container)' : 'transparent',
        color: active ? 'var(--md-on-primary-container)' : 'var(--md-on-surface-variant)',
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        fontFamily: 'inherit', fontSize: 12, fontWeight: 600,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      }}>
      {icon
        ? <span className="ms" style={{ fontSize: 18 }}>{icon}</span>
        : <span className="num">{children}</span>
      }
    </button>
  )
}
