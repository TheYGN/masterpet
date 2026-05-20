'use client'

import { useState, Suspense } from 'react'
import type { ProductListItem, ListProductsFilters } from '../types'
import { KpiStrip } from './KpiStrip'
import { ProductFilters } from './ProductFilters'
import { ProductsTable } from './ProductsTable'

interface ProductsClientProps {
  initialProducts: ProductListItem[]
  initialFilters: ListProductsFilters
}

export function ProductsClient({ initialProducts }: ProductsClientProps) {
  const [showNewSheet, setShowNewSheet] = useState(false)

  return (
    <>
      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24 }}>
        <div>
          <nav style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--md-on-surface-variant)', marginBottom: 4 }}>
            <span>מלאי</span>
            <span className="ms" style={{ fontSize: 14, transform: 'scaleX(-1)', display: 'inline-block' }}>chevron_left</span>
            <span style={{ color: 'var(--md-on-surface)', fontWeight: 500 }}>קטלוג מוצרים</span>
          </nav>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: 'var(--md-on-surface)', lineHeight: 1.3 }}>
            קטלוג מוצרים
          </h1>
          <div style={{ fontSize: 14, color: 'var(--md-on-surface-variant)', marginTop: 4 }}>
            ניהול כל המוצרים, המחירים והמלאי במקום אחד
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            height: 40, padding: '0 16px', borderRadius: 999,
            background: 'transparent', color: 'var(--md-primary)',
            border: '1px solid var(--md-outline)',
            fontFamily: 'inherit', fontSize: 13, fontWeight: 500, cursor: 'pointer',
          }}>
            <span className="ms" style={{ fontSize: 18 }}>upload_file</span>
            ייבוא מ-Excel
          </button>
        </div>
      </div>

      {/* KPI Strip */}
      <KpiStrip products={initialProducts} />

      {/* Filters Toolbar — wrapped in Suspense because useSearchParams needs it */}
      <Suspense fallback={null}>
        <ProductFilters onNewProduct={() => setShowNewSheet(true)} />
      </Suspense>

      {/* Table */}
      {initialProducts.length === 0 ? (
        <EmptyState onNewProduct={() => setShowNewSheet(true)} />
      ) : (
        <ProductsTable products={initialProducts} />
      )}

      {/* TODO: ProductSheet (שלב 2) */}
      {showNewSheet && (
        <div style={{ display: 'none' }}>
          {/* ProductSheet component — next phase */}
        </div>
      )}
    </>
  )
}

function EmptyState({ onNewProduct }: { onNewProduct: () => void }) {
  return (
    <div style={{
      background: 'var(--md-surface-container-low)',
      border: '1px dashed var(--md-outline-variant)',
      borderRadius: 16, padding: 48,
      display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 16,
    }}>
      <div style={{
        width: 96, height: 96, borderRadius: '50%',
        background: 'var(--md-surface-container)',
        color: 'var(--md-outline)',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <span className="ms" style={{ fontSize: 56, fontVariationSettings: "'FILL' 0, 'wght' 300" }}>inventory_2</span>
      </div>
      <div>
        <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--md-on-surface)' }}>
          אין מוצרים עדיין
        </div>
        <div style={{ fontSize: 14, color: 'var(--md-on-surface-variant)', marginTop: 4, maxWidth: 420 }}>
          ייבא את הקטלוג מ-Excel או הוסף מוצר ידנית כדי להתחיל לנהל את המלאי שלך.
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
        <button style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          height: 40, padding: '0 18px', borderRadius: 999,
          background: 'var(--md-primary)', color: 'var(--md-on-primary)', border: 'none',
          cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 500,
        }}>
          <span className="ms" style={{ fontSize: 18 }}>upload_file</span>
          ייבא מ-Excel
        </button>
        <button
          onClick={onNewProduct}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            height: 40, padding: '0 18px', borderRadius: 999,
            background: 'transparent', color: 'var(--md-primary)', border: '1px solid var(--md-outline)',
            cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 500,
          }}>
          <span className="ms" style={{ fontSize: 18 }}>add</span>
          הוסף מוצר
        </button>
      </div>
    </div>
  )
}
