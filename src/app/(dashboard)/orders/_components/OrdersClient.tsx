'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { OrderListItem, OrdersKpi, OrderStatus } from '../types'
import { listOrdersAction, sendPaymentLinkAction } from '../actions'
import { OrdersKpiStrip } from './OrdersKpiStrip'
import { OrdersTable } from './OrdersTable'
import { OrderSheet } from './OrderSheet'

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  initialOrders: OrderListItem[]
  initialTotal: number
  kpi: OrdersKpi
  branchId: string
  role: string
}

// ─── Status filter pills ──────────────────────────────────────────────────────

const STATUS_FILTERS: Array<{ value: OrderStatus | null; label: string }> = [
  { value: null,          label: 'הכל' },
  { value: 'pending',     label: 'ממתין' },
  { value: 'confirmed',   label: 'אושר' },
  { value: 'preparing',   label: 'בהכנה' },
  { value: 'in_transit',  label: 'בדרך' },
  { value: 'delivered',   label: 'נמסר' },
  { value: 'cancelled',   label: 'בוטל' },
]

const PAGE_SIZE = 10

// ─── Component ────────────────────────────────────────────────────────────────

export function OrdersClient({ initialOrders, initialTotal, kpi, branchId }: Props) {
  const router = useRouter()

  // Tab
  const [tab, setTab] = useState<'orders' | 'subs'>('orders')

  // Filters
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<OrderStatus | null>(null)
  const [page, setPage] = useState(1)

  // Data
  const [orders, setOrders] = useState(initialOrders)
  const [total, setTotal] = useState(initialTotal)

  // Sheet
  const [showSheet, setShowSheet] = useState(false)

  const [isPending, startTransition] = useTransition()

  // Reload orders with current filters
  const reload = (opts?: {
    search?: string
    status?: OrderStatus | null
    page?: number
  }) => {
    const s = opts?.search ?? search
    const st = opts?.status !== undefined ? opts.status : statusFilter
    const p = opts?.page ?? page

    startTransition(async () => {
      const res = await listOrdersAction({
        search: s.trim() || undefined,
        status: st ?? undefined,
        limit: PAGE_SIZE,
        offset: (p - 1) * PAGE_SIZE,
      })
      if (res.data) {
        setOrders(res.data.orders)
        setTotal(res.data.total)
      }
    })
  }

  const handleSearch = (q: string) => {
    setSearch(q)
    setPage(1)
    reload({ search: q, page: 1 })
  }

  const handleStatusFilter = (s: OrderStatus | null) => {
    setStatusFilter(s)
    setPage(1)
    reload({ status: s, page: 1 })
  }

  const handlePageChange = (p: number) => {
    setPage(p)
    reload({ page: p })
  }

  const handleOpenOrder = (id: string) => {
    router.push(`/orders/${id}`)
  }

  const handleSendPaymentLink = (id: string) => {
    startTransition(async () => {
      await sendPaymentLinkAction(id)
    })
  }

  const handleOrderCreated = (_id: string) => {
    setShowSheet(false)
    setPage(1)
    reload({ page: 1 })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {/* KPI Strip */}
      <OrdersKpiStrip kpi={kpi} />

      {/* Toolbar card: tabs + search + filters */}
      <div style={{
        background: 'var(--md-surface-container-low)',
        borderRadius: 16,
        border: '1px solid var(--md-outline-variant)',
        overflow: 'hidden',
      }}>
        {/* Tab bar */}
        <div style={{
          display: 'flex', flexDirection: 'row-reverse',
          height: 48,
          borderBottom: '1px solid var(--md-outline-variant)',
          paddingInlineStart: 20, paddingInlineEnd: 20,
          gap: 4,
        }}>
          {(['orders', 'subs'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                position: 'relative',
                padding: '0 16px', height: '100%',
                border: 'none', background: 'transparent',
                fontFamily: 'inherit',
                fontSize: 14, fontWeight: tab === t ? 600 : 400,
                color: tab === t ? 'var(--md-on-surface)' : 'var(--md-on-surface-variant)',
                cursor: 'pointer',
              }}>
              {t === 'orders' ? 'הזמנות' : 'מנויים'}
              {tab === t && (
                <span style={{
                  position: 'absolute', insetInlineStart: 12, insetInlineEnd: 12, bottom: -1, height: 3,
                  background: 'var(--md-primary)', borderRadius: '3px 3px 0 0',
                }} />
              )}
            </button>
          ))}
        </div>

        {/* Toolbar row */}
        <div style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* New order button */}
          <button
            onClick={() => setShowSheet(true)}
            style={{
              height: 40, padding: '0 20px', borderRadius: 999,
              background: 'var(--md-primary)', color: 'var(--md-on-primary)',
              border: 'none', cursor: 'pointer',
              fontFamily: 'inherit', fontSize: 13, fontWeight: 500,
              display: 'inline-flex', alignItems: 'center', gap: 6,
              flexShrink: 0,
            }}>
            <span className="ms" style={{ fontSize: 18 }}>add</span>
            הזמנה חדשה
          </button>

          {/* Search */}
          <div style={{ width: 300 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              height: 40, padding: '0 14px',
              background: 'var(--md-surface-container)',
              border: '1px solid var(--md-outline-variant)',
              borderRadius: 999, color: 'var(--md-on-surface-variant)',
            }}>
              <span className="ms" style={{ fontSize: 20 }}>search</span>
              <input
                value={search}
                onChange={e => handleSearch(e.target.value)}
                placeholder="חיפוש לפי לקוח, מספר הזמנה..."
                style={{
                  flex: 1, border: 'none', background: 'transparent', outline: 'none',
                  fontFamily: 'inherit', fontSize: 13, color: 'var(--md-on-surface)',
                  textAlign: 'right',
                }}
              />
              {search && (
                <button onClick={() => handleSearch('')} style={{
                  border: 'none', background: 'transparent', cursor: 'pointer',
                  color: 'var(--md-on-surface-variant)', padding: 0, lineHeight: 0,
                }}>
                  <span className="ms" style={{ fontSize: 16 }}>close</span>
                </button>
              )}
            </div>
          </div>

          <div style={{ flex: 1 }} />

          {/* Status filter pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'nowrap', overflow: 'auto' }}>
            {STATUS_FILTERS.map(f => (
              <FilterPill
                key={f.label}
                active={statusFilter === f.value}
                onClick={() => handleStatusFilter(f.value)}
              >
                {f.label}
              </FilterPill>
            ))}
          </div>
        </div>
      </div>

      {/* Loading overlay on filter change */}
      <div style={{ position: 'relative', opacity: isPending ? 0.65 : 1, transition: 'opacity 150ms ease' }}>
        {tab === 'orders' && (
          <OrdersTable
            orders={orders}
            total={total}
            page={page}
            pageSize={PAGE_SIZE}
            onPageChange={handlePageChange}
            onOpenOrder={handleOpenOrder}
            onSendPaymentLink={handleSendPaymentLink}
          />
        )}
        {tab === 'subs' && (
          <SubscriptionsPlaceholder />
        )}
      </div>

      {/* New order sheet */}
      <OrderSheet
        open={showSheet}
        branchId={branchId}
        onClose={() => setShowSheet(false)}
        onCreated={handleOrderCreated}
      />
    </div>
  )
}

// ─── Filter Pill ──────────────────────────────────────────────────────────────

function FilterPill({ active, onClick, children }: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center',
        height: 32, padding: '0 14px', borderRadius: 999,
        background: active ? 'var(--md-secondary-container)' : 'var(--md-surface-container)',
        color: active ? 'var(--md-on-secondary-container)' : 'var(--md-on-surface-variant)',
        border: active ? '1px solid transparent' : '1px solid var(--md-outline-variant)',
        cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 500,
        whiteSpace: 'nowrap', flexShrink: 0,
      }}>
      {children}
    </button>
  )
}

// ─── Subscriptions tab placeholder ───────────────────────────────────────────

function SubscriptionsPlaceholder() {
  return (
    <div style={{
      background: 'var(--md-surface-container-low)',
      borderRadius: 16,
      border: '1px solid var(--md-outline-variant)',
      padding: '48px 24px',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
    }}>
      <span className="ms" style={{
        fontSize: 64, color: 'var(--md-outline)',
        fontVariationSettings: "'FILL' 0, 'wght' 400, 'opsz' 48",
      }}>autorenew</span>
      <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--md-on-surface)' }}>
        ניהול מנויים
      </div>
      <div style={{ fontSize: 14, color: 'var(--md-on-surface-variant)', textAlign: 'center', maxWidth: 360 }}>
        כאן יוצגו המנויים הפעילים. בשלב זה נמצא בפיתוח.
      </div>
    </div>
  )
}
