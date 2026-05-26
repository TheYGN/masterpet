import type { CustomerKpis } from '../types'

export function CustomerKpiStrip({ kpis }: { kpis: CustomerKpis }) {
  return (
    <section style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr', gap: 16 }}>
      {/* Hero tile — לקוחות פעילים */}
      <div style={{
        background: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 55%, #38656A 100%)',
        padding: 20, borderRadius: 16,
        boxShadow: '0 1px 3px rgba(27,94,32,0.20), 0 8px 24px -8px rgba(27,94,32,0.35)',
        minHeight: 148, display: 'flex', flexDirection: 'column',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', bottom: 0, insetInlineStart: 0,
          width: 160, height: 160, borderRadius: '50%',
          background: 'radial-gradient(circle at 0% 100%, rgba(255,255,255,0.10) 0%, transparent 65%)',
          pointerEvents: 'none',
        }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, position: 'relative' }}>
          <span className="ms" style={{ fontSize: 28, fontVariationSettings: "'FILL' 1, 'wght' 500", color: 'rgba(255,255,255,0.85)' }}>group</span>
          <span style={{
            background: 'rgba(255,255,255,0.18)', color: '#fff',
            fontSize: 10, fontWeight: 600, letterSpacing: 0.6, textTransform: 'uppercase',
            borderRadius: 999, padding: '2px 8px',
          }}>HERO</span>
        </div>
        <div style={{ marginTop: 12, fontSize: 48, fontWeight: 700, letterSpacing: -0.5, lineHeight: 1.1, color: '#fff', position: 'relative' }}>
          <span className="num">{kpis.active.toLocaleString()}</span>
        </div>
        <div style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.85)', marginTop: 2 }}>
          לקוחות פעילים
        </div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', marginTop: 2 }}>
          מתוך <span className="num">{(kpis.active + kpis.inactive).toLocaleString()}</span> רשומות סה״כ
        </div>
        <div style={{ marginTop: 'auto', paddingTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            background: 'rgba(255,255,255,0.92)', color: '#1B5E20',
            fontSize: 12, fontWeight: 600, borderRadius: 999, padding: '4px 12px',
          }}>
            כל הלקוחות
            <span className="ms ms-flip-rtl" style={{ fontSize: 14 }}>arrow_back</span>
          </span>
        </div>
      </div>

      {/* חדשים החודש */}
      <div style={{
        background: 'var(--md-surface-container-low)', padding: 20, borderRadius: 16,
        border: '1px solid var(--md-outline-variant)', minHeight: 148, display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <span style={{
            width: 36, height: 36, borderRadius: 12,
            background: 'var(--md-secondary-container)', color: 'var(--md-secondary)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span className="ms" style={{ fontSize: 22, fontVariationSettings: "'FILL' 1, 'wght' 500" }}>person_add</span>
          </span>
          <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.4, textTransform: 'uppercase', color: 'var(--md-on-surface-variant)' }}>
            חדשים החודש
          </span>
        </div>
        <div style={{ marginTop: 12, fontSize: 36, fontWeight: 700, letterSpacing: -0.5, lineHeight: 1.1, color: 'var(--md-on-surface)' }}>
          <span className="num">{kpis.newThisMonth.toLocaleString()}</span>
        </div>
        <div style={{ fontSize: 12, color: 'var(--md-secondary)', marginTop: 4 }}>
          הצטרפו החודש
        </div>
      </div>

      {/* ערוץ מועדף */}
      <div style={{
        background: 'var(--md-tertiary-container)', padding: 20, borderRadius: 16,
        border: '1px solid var(--md-tertiary-container)', minHeight: 148, display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <span style={{
            width: 28, height: 28, borderRadius: 8,
            background: '#25D366', color: '#fff',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span className="ms" style={{ fontSize: 18, fontVariationSettings: "'FILL' 1" }}>chat</span>
          </span>
          <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.4, textTransform: 'uppercase', color: 'var(--md-on-tertiary-container)' }}>
            ערוץ מועדף
          </span>
        </div>
        <div style={{ marginTop: 12, fontSize: 36, fontWeight: 700, letterSpacing: -0.5, lineHeight: 1.1, color: 'var(--md-on-tertiary-container)' }}>
          <span className="num">{kpis.whatsappPct}</span>%
        </div>
        <div style={{ fontSize: 11, color: 'rgba(0,32,34,0.70)', marginTop: 4 }}>
          מהלקוחות בוחרים WhatsApp
        </div>
      </div>

      {/* לא פעילים */}
      <div style={{
        background: 'var(--md-surface-container-lowest)', padding: 20, borderRadius: 16,
        border: '1px dashed var(--md-outline-variant)', minHeight: 148, display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <span style={{
            width: 36, height: 36, borderRadius: 12,
            background: 'var(--md-surface-container)', color: 'var(--md-on-surface-variant)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span className="ms" style={{ fontSize: 22, fontVariationSettings: "'FILL' 0, 'wght' 400" }}>person_off</span>
          </span>
          <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.4, textTransform: 'uppercase', color: 'var(--md-on-surface-variant)' }}>
            לא פעילים
          </span>
        </div>
        <div style={{ marginTop: 12, fontSize: 36, fontWeight: 700, letterSpacing: -0.5, lineHeight: 1.1, color: 'var(--md-on-surface-variant)' }}>
          <span className="num">{kpis.inactive.toLocaleString()}</span>
        </div>
        <div style={{ fontSize: 12, color: 'var(--md-on-surface-variant)', marginTop: 4 }}>
          הוסרו ידנית
        </div>
      </div>
    </section>
  )
}
