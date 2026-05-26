import type { OrdersKpi } from '../types'

export function OrdersKpiStrip({ kpi }: { kpi: OrdersKpi }) {
  return (
    <section style={{ display: 'flex', gap: 16, alignItems: 'stretch' }}>
      {/* Hero — הזמנות היום */}
      <div style={{
        flex: 1.5, minWidth: 280,
        background: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 55%, #38656A 100%)',
        color: '#fff',
        borderRadius: 16, padding: 20,
        boxShadow: '0 1px 3px rgba(27,94,32,0.20), 0 8px 24px -8px rgba(27,94,32,0.35)',
        position: 'relative', overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        minHeight: 168,
      }}>
        <div aria-hidden="true" style={{
          position: 'absolute', insetInlineStart: 0, bottom: 0,
          width: 260, height: 260,
          background: 'radial-gradient(circle at 0% 100%, rgba(255,255,255,0.10) 0%, transparent 65%)',
          pointerEvents: 'none',
        }} />
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <span style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'rgba(255,255,255,0.18)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span className="ms" style={{ fontSize: 22, color: 'rgba(255,255,255,0.92)', fontVariationSettings: "'FILL' 1, 'wght' 500, 'opsz' 24" }}>
              receipt_long
            </span>
          </span>
          <span style={{
            fontSize: 10, fontWeight: 600, letterSpacing: 0.6,
            padding: '2px 8px', borderRadius: 999,
            background: 'rgba(255,255,255,0.18)', color: '#fff',
            textTransform: 'uppercase',
          }}>HERO</span>
        </div>
        <div style={{ marginTop: 14, fontSize: 48, fontWeight: 700, letterSpacing: -0.5, lineHeight: 1, color: '#fff' }}>
          <span className="num">{kpi.today_orders}</span>
        </div>
        <div style={{ marginTop: 6, fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.85)' }}>
          הזמנות היום
        </div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', marginTop: 2 }}>
          {kpi.pending_orders > 0 && (
            <>{kpi.pending_orders} ממתינות לאישור</>
          )}
        </div>
      </div>

      {/* ממתינות */}
      <div style={{
        flex: 1, minWidth: 160,
        background: 'var(--md-warning-container)',
        border: '1px solid rgba(245,158,11,0.30)',
        borderRadius: 16, padding: 20,
        display: 'flex', flexDirection: 'column',
        minHeight: 168,
      }}>
        <span className="ms" style={{ fontSize: 24, color: '#A65F00', fontVariationSettings: "'FILL' 1, 'wght' 500, 'opsz' 24" }}>
          pending_actions
        </span>
        <div style={{ marginTop: 14, fontSize: 36, fontWeight: 700, lineHeight: 1.05, letterSpacing: -0.3, color: 'var(--md-on-surface)' }}>
          <span className="num">{kpi.pending_orders}</span>
        </div>
        <div style={{ marginTop: 8, fontSize: 12, fontWeight: 600, letterSpacing: 0.4, textTransform: 'uppercase', color: '#A65F00' }}>
          ממתינות לאישור
        </div>
      </div>

      {/* מנויים פעילים */}
      <div style={{
        flex: 1, minWidth: 160,
        background: 'var(--md-tertiary-container)',
        borderRadius: 16, padding: 20,
        display: 'flex', flexDirection: 'column',
        minHeight: 168,
      }}>
        <span className="ms" style={{ fontSize: 24, color: 'var(--md-on-tertiary-container)', fontVariationSettings: "'FILL' 1, 'wght' 500, 'opsz' 24" }}>
          autorenew
        </span>
        <div style={{ marginTop: 14, fontSize: 36, fontWeight: 700, lineHeight: 1.05, letterSpacing: -0.3, color: 'var(--md-on-tertiary-container)' }}>
          <span className="num">{kpi.active_subscriptions}</span>
        </div>
        <div style={{ marginTop: 8, fontSize: 12, fontWeight: 600, letterSpacing: 0.4, textTransform: 'uppercase', color: 'var(--md-on-tertiary-container)' }}>
          מנויים פעילים
        </div>
      </div>

      {/* סה"כ החודש */}
      <div style={{
        flex: 1, minWidth: 160,
        background: 'var(--md-surface-container-lowest)',
        border: '1px solid var(--md-outline-variant)',
        borderRadius: 16, padding: 20,
        display: 'flex', flexDirection: 'column',
        minHeight: 168,
      }}>
        <span className="ms" style={{ fontSize: 24, color: 'var(--md-secondary)', fontVariationSettings: "'FILL' 1, 'wght' 500, 'opsz' 24" }}>
          payments
        </span>
        <div style={{ marginTop: 14, fontSize: 30, fontWeight: 700, lineHeight: 1.05, letterSpacing: -0.3, color: 'var(--md-on-surface)' }}>
          <span className="currency num">₪{kpi.month_total.toLocaleString('he-IL', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
        </div>
        <div style={{ marginTop: 8, fontSize: 12, fontWeight: 600, letterSpacing: 0.4, textTransform: 'uppercase', color: 'var(--md-on-surface-variant)' }}>
          סה״כ החודש
        </div>
      </div>
    </section>
  )
}
