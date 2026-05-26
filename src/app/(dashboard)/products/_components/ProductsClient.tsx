'use client'

import { useState, Suspense, useTransition } from 'react'
import type { ProductListItem, ListProductsFilters, ProductWithVariants } from '../types'
import { getProductAction } from '../actions'
import { KpiStrip } from './KpiStrip'
import { ProductFilters } from './ProductFilters'
import { ProductsTable } from './ProductsTable'
import { ProductSheet } from './ProductSheet'
import { ImportModal } from './ImportModal'

interface ProductsClientProps {
  initialProducts: ProductListItem[]
  initialFilters: ListProductsFilters
}

export function ProductsClient({ initialProducts }: ProductsClientProps) {
  const [showNewSheet, setShowNewSheet] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [editingProduct, setEditingProduct] = useState<ProductWithVariants | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isLoadingProduct, startLoadProduct] = useTransition()

  const handleEdit = (productId: string) => {
    setLoadError(null)
    startLoadProduct(async () => {
      const result = await getProductAction(productId)
      if ('error' in result && result.error) {
        setLoadError(result.error)
        return
      }
      if (result.data) setEditingProduct(result.data)
    })
  }

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
          <button
            onClick={() => setShowImport(true)}
            style={{
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
        <ProductsTable products={initialProducts} onEdit={handleEdit} />
      )}

      {showNewSheet && (
        <ProductSheet onClose={() => setShowNewSheet(false)} />
      )}

      {editingProduct && (
        <ProductSheet
          mode="edit"
          initialProduct={editingProduct}
          onClose={() => setEditingProduct(null)}
        />
      )}

      {(isLoadingProduct || loadError) && (
        <LoadOverlay error={loadError} onDismiss={() => setLoadError(null)} />
      )}

      <ImportModal open={showImport} onClose={() => setShowImport(false)} />
    </>
  )
}

function LoadOverlay({ error, onDismiss }: { error: string | null; onDismiss: () => void }) {
  return (
    <div
      onClick={error ? onDismiss : undefined}
      style={{
        position: 'fixed', inset: 0, zIndex: 60,
        background: 'rgba(0,0,0,0.32)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: error ? 'pointer' : 'default',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          minWidth: 240, padding: '20px 24px', borderRadius: 16,
          background: 'var(--md-surface-container-high)',
          color: 'var(--md-on-surface)',
          display: 'flex', alignItems: 'center', gap: 12,
          boxShadow: 'var(--shadow-3)',
        }}
      >
        {error ? (
          <>
            <span className="ms" style={{ fontSize: 22, color: 'var(--md-error)' }}>error</span>
            <span style={{ fontSize: 14 }}>{error}</span>
            <button
              onClick={onDismiss}
              style={{
                marginInlineStart: 12, height: 32, padding: '0 14px', borderRadius: 999,
                background: 'var(--md-primary)', color: 'var(--md-on-primary)',
                border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 500,
              }}
            >
              סגור
            </button>
          </>
        ) : (
          <>
            <span className="ms" style={{ fontSize: 22, color: 'var(--md-primary)' }}>hourglass_top</span>
            <span style={{ fontSize: 14 }}>טוען מוצר…</span>
          </>
        )}
      </div>
    </div>
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
