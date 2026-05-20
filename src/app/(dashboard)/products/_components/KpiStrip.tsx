import type { ReactNode } from 'react'
import type { ProductListItem } from '../types'

interface KpiData {
  activeProducts: number
  lowStockCount: number
  activeVariants: number
  discontinued: number
}

function computeKpis(products: ProductListItem[]): KpiData {
  let activeProducts = 0, lowStockCount = 0, activeVariants = 0, discontinued = 0
  for (const p of products) {
    if (p.status === 'active') {
      activeProducts++
      activeVariants += p.variants_count
    }
    if (p.status === 'discontinued') discontinued++
    if (p.low_stock) lowStockCount++
  }
  return { activeProducts, lowStockCount, activeVariants, discontinued }
}

export function KpiStrip({ products }: { products: ProductListItem[] }) {
  const kpi = computeKpis(products)
  return (
    <section style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
      {/* Tile 1 — Active products */}
      <KpiTile
        icon="inventory_2"
        iconColor="var(--md-primary)"
        iconBg="var(--md-primary-container)"
        label="מוצרים פעילים"
        value={kpi.activeProducts}
        sub={null}
        bg="var(--md-surface-container-low)"
      />

      {/* Tile 2 — Low stock (warning) */}
      <div style={{
        background: 'var(--md-warning-container)',
        padding: 20, borderRadius: 16,
        border: '1px solid var(--md-warning)',
        minHeight: 148, display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <span style={{
            width: 36, height: 36, borderRadius: 12,
            background: 'rgba(245,158,11,0.20)', color: '#A65F00',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span className="ms" style={{ fontSize: 22, fontVariationSettings: "'FILL' 1, 'wght' 500" }}>warning</span>
          </span>
          <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.4, textTransform: 'uppercase', color: '#A65F00' }}>
            מלאי נמוך
          </span>
        </div>
        <div style={{ marginTop: 12, fontSize: 36, fontWeight: 700, letterSpacing: -0.5, lineHeight: 1.1, color: '#A65F00' }}>
          <span className="num">{kpi.lowStockCount}</span>
        </div>
        <div style={{ fontSize: 12, color: 'rgba(74,47,0,0.78)', marginTop: 2 }}>
          מוצרים מתחת לרמת ה-reorder
        </div>
        <div style={{ marginTop: 'auto', paddingTop: 14 }}>
          <button style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            height: 32, padding: '0 14px', borderRadius: 999,
            background: '#A65F00', color: '#fff', border: 'none',
            fontFamily: 'inherit', fontSize: 12, fontWeight: 600, cursor: 'pointer',
          }}>
            <span>טפל עכשיו</span>
            <span className="ms" style={{ fontSize: 16, transform: 'scaleX(-1)', display: 'inline-block' }}>arrow_back</span>
          </button>
        </div>
      </div>

      {/* Tile 3 — Active variants */}
      <KpiTile
        icon="category"
        iconColor="var(--md-secondary)"
        iconBg="var(--md-secondary-container)"
        label="variants פעילים"
        value={kpi.activeVariants}
        sub={null}
        bg="var(--md-surface-container-low)"
      />

      {/* Tile 4 — Discontinued */}
      <KpiTile
        icon="block"
        iconColor="var(--md-outline)"
        iconBg="var(--md-surface-container-high)"
        iconFill={0}
        label="הופסקו"
        value={kpi.discontinued}
        valueColor="var(--md-on-surface-variant)"
        sub={null}
        bg="var(--md-surface-container-lowest)"
        border="1px dashed var(--md-outline-variant)"
      />
    </section>
  )
}

function KpiTile({
  icon, iconColor, iconBg, iconFill = 1,
  label, value, sub, bg, valueColor, border,
}: {
  icon: string; iconColor: string; iconBg: string; iconFill?: number
  label: string; value: number; sub: ReactNode | null
  bg: string; valueColor?: string; border?: string
}) {
  return (
    <div style={{
      background: bg, padding: 20, borderRadius: 16,
      border: border ?? '1px solid var(--md-outline-variant)',
      minHeight: 148, display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <span style={{
          width: 36, height: 36, borderRadius: 12,
          background: iconBg, color: iconColor,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span className="ms" style={{ fontSize: 22, fontVariationSettings: `'FILL' ${iconFill}, 'wght' 500` }}>{icon}</span>
        </span>
        <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.4, textTransform: 'uppercase', color: 'var(--md-on-surface-variant)' }}>
          {label}
        </span>
      </div>
      <div style={{ marginTop: 12, fontSize: 36, fontWeight: 700, letterSpacing: -0.5, lineHeight: 1.1, color: valueColor ?? 'var(--md-on-surface)' }}>
        <span className="num">{value}</span>
      </div>
      {sub && (
        <div style={{ marginTop: 'auto', paddingTop: 12, fontSize: 12, color: 'var(--md-on-surface-variant)' }}>
          {sub}
        </div>
      )}
    </div>
  )
}
