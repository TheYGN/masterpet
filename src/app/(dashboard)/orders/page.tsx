import { requireActiveTenant } from '@/app/lib/dal'
import { listOrdersAction, getOrdersKpiAction } from './actions'
import { OrdersClient } from './_components/OrdersClient'

const PAGE_SIZE = 10

export default async function OrdersPage() {
  const session = await requireActiveTenant()

  const [kpiResult, ordersResult] = await Promise.all([
    getOrdersKpiAction(),
    listOrdersAction({ limit: PAGE_SIZE, offset: 0 }),
  ])

  const kpi = kpiResult.data ?? {
    today_orders: 0,
    pending_orders: 0,
    active_subscriptions: 0,
    month_total: 0,
  }
  const initialOrders = ordersResult.data?.orders ?? []
  const initialTotal = ordersResult.data?.total ?? 0

  return (
    <div style={{ padding: '24px 32px 48px', display: 'flex', flexDirection: 'column', gap: 32 }}>
      {/* Page header */}
      <div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          fontSize: 12, color: 'var(--md-on-surface-variant)', marginBottom: 4,
        }}>
          <span>דשבורד</span>
          <span className="ms ms-flip-rtl" style={{ fontSize: 14, opacity: 0.6 }}>chevron_left</span>
          <span style={{ color: 'var(--md-on-surface)', fontWeight: 500 }}>הזמנות</span>
        </div>
        <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--md-on-surface)', lineHeight: 1.3 }}>
          ניהול הזמנות
        </div>
        {kpi.pending_orders > 0 && (
          <div style={{ fontSize: 14, color: 'var(--md-on-surface-variant)', marginTop: 4 }}>
            <span className="num" style={{
              color: '#A65F00', fontWeight: 600,
              background: 'var(--md-warning-container)', padding: '1px 8px', borderRadius: 999,
            }}>
              {kpi.pending_orders} ממתינות לאישור
            </span>
          </div>
        )}
      </div>

      <OrdersClient
        initialOrders={initialOrders}
        initialTotal={initialTotal}
        kpi={kpi}
        branchId={session.profile.branch_id ?? ''}
        role={session.profile.role}
      />
    </div>
  )
}
