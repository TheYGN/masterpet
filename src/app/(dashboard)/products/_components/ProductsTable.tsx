'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { ProductListItem, ProductStatus } from '../types'
import { deleteProductAction, duplicateProductAction } from '../actions'
import { LowStockBadge } from './LowStockBadge'

const COLS = '40px 60px 1fr 96px 88px 100px 132px 96px 88px'

interface ProductsTableProps {
  products: ProductListItem[]
  total?: number
  page?: number
  onPageChange?: (page: number) => void
  onEdit?: (productId: string) => void
}

export function ProductsTable({ products, total = products.length, page = 1, onPageChange, onEdit }: ProductsTableProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [bulkSelected, setBulkSelected] = useState<Set<string>>(new Set())
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const toggleBulk = (id: string) => {
    setBulkSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const clearBulk = () => setBulkSelected(new Set())

  const toggleAll = () => {
    if (bulkSelected.size === products.length) {
      clearBulk()
    } else {
      setBulkSelected(new Set(products.map(p => p.id)))
    }
  }

  const handleDelete = (productId: string) => {
    if (!confirm('האם למחוק את המוצר? הפעולה אינה הפיכה.')) return
    startTransition(async () => {
      const result = await deleteProductAction(productId)
      if (result.error) alert(result.error)
      else router.refresh()
    })
  }

  const handleDuplicate = (productId: string) => {
    startTransition(async () => {
      const result = await duplicateProductAction(productId)
      if (result.error) alert(result.error)
      else router.refresh()
    })
  }

  const totalPages = Math.max(1, Math.ceil(total / 20))

  return (
    <>
      {/* Table */}
      <div style={{
        background: 'var(--md-surface-container-low)',
        border: '1px solid var(--md-outline-variant)',
        borderRadius: 16, overflow: 'hidden',
        opacity: isPending ? 0.6 : 1,
        transition: 'opacity 150ms ease',
      }}>
        <TableHeader 
          isAllSelected={bulkSelected.size > 0 && bulkSelected.size === products.length} 
          onToggleAll={toggleAll} 
        />
        <div>
          {products.map((p, i) => (
            <ProductRow
              key={p.id}
              product={p}
              index={i}
              last={i === products.length - 1}
              hovered={hoveredId === p.id}
              selected={bulkSelected.has(p.id)}
              onHover={(id) => setHoveredId(id)}
              onToggle={toggleBulk}
              onDelete={handleDelete}
              onDuplicate={handleDuplicate}
              onEdit={onEdit}
              onImageClick={setLightboxUrl}
            />
          ))}
          {products.length === 0 && (
            <div style={{
              padding: '48px 24px', textAlign: 'center',
              color: 'var(--md-on-surface-variant)', fontSize: 14,
            }}>
              אין מוצרים התואמים לסינון
            </div>
          )}
        </div>
        <TableFooter total={total} page={page} totalPages={totalPages} onPageChange={onPageChange} />
      </div>

      {/* Bulk selection bar */}
      {bulkSelected.size > 0 && (
        <BulkBar 
          count={bulkSelected.size} 
          onClear={clearBulk} 
          onSelectAll={toggleAll}
          onDelete={() => {
            if (!confirm(`האם למחוק ${bulkSelected.size} מוצרים?`)) return
            startTransition(async () => {
              let hasError = false;
              for (const id of bulkSelected) {
                const res = await deleteProductAction(id)
                if (res?.error) {
                  alert(res.error)
                  hasError = true
                  break
                }
              }
              if (!hasError) {
                clearBulk()
                router.refresh()
              }
            })
          }}
        />
      )}

      {/* Lightbox */}
      {lightboxUrl && (
        <div
          onClick={() => setLightboxUrl(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 100,
            background: 'rgba(0,0,0,0.82)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'zoom-out',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ position: 'relative', cursor: 'default' }}
          >
            <img
              src={lightboxUrl}
              alt="תמונת מוצר"
              style={{
                maxWidth: 'min(90vw, 900px)',
                maxHeight: '88vh',
                objectFit: 'contain',
                borderRadius: 12,
                boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
                display: 'block',
              }}
            />
            <button
              onClick={() => setLightboxUrl(null)}
              style={{
                position: 'absolute', top: -16, insetInlineEnd: -16,
                width: 36, height: 36, borderRadius: '50%',
                background: 'rgba(30,30,30,0.85)', border: '1.5px solid rgba(255,255,255,0.18)',
                color: '#fff', cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
              }}
            >
              <span className="ms" style={{ fontSize: 20 }}>close</span>
            </button>
          </div>
        </div>
      )}
    </>
  )
}

// ---- Table Header ----
function TableHeader({ isAllSelected, onToggleAll }: { isAllSelected?: boolean, onToggleAll?: () => void }) {
  const cells = [
    { label: '', sortable: false, align: 'center' },
    { label: 'תמונה', sortable: false, align: 'center' },
    { label: 'שם מוצר', sortable: true, align: 'start' },
    { label: 'חיה', sortable: false, align: 'start' },
    { label: 'Variants', sortable: false, align: 'center' },
    { label: 'מלאי', sortable: true, align: 'center' },
    { label: 'מחיר', sortable: true, align: 'start' },
    { label: 'סטטוס', sortable: false, align: 'center' },
    { label: 'פעולות', sortable: false, align: 'center' },
  ]
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: COLS, alignItems: 'center',
      background: 'var(--md-surface-container)',
      borderBottom: '1px solid var(--md-outline-variant)',
      height: 44, padding: '0 16px', gap: 12,
    }}>
      {cells.map((c, i) => (
        <div key={i} style={{
          display: 'flex', alignItems: 'center',
          justifyContent: c.align === 'center' ? 'center' : 'flex-start',
          gap: 4,
          fontSize: 11, fontWeight: 600, letterSpacing: 0.4,
          textTransform: 'uppercase', color: 'var(--md-on-surface-variant)',
          minWidth: 0,
        }}>
          {i === 0 ? (
            <span
              onClick={onToggleAll}
              style={{
                width: 18, height: 18, borderRadius: 4,
                border: `2px solid ${isAllSelected ? 'var(--md-primary)' : 'var(--md-outline)'}`,
                background: isAllSelected ? 'var(--md-primary)' : 'transparent',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              {isAllSelected && <span className="ms" style={{ fontSize: 14, color: '#fff' }}>check</span>}
            </span>
          ) : (
            <>
              <span>{c.label}</span>
              {c.sortable && (
                <span className="ms" style={{ fontSize: 16, color: 'var(--md-outline-variant)' }}>arrow_drop_down</span>
              )}
            </>
          )}
        </div>
      ))}
    </div>
  )
}

// ---- Product Row ----
interface ProductRowProps {
  product: ProductListItem
  index: number
  last: boolean
  hovered: boolean
  selected: boolean
  onHover: (id: string | null) => void
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onDuplicate: (id: string) => void
  onEdit?: (id: string) => void
  onImageClick?: (url: string) => void
}

function ProductRow({ product: p, index, last, hovered, selected, onHover, onToggle, onDelete, onDuplicate, onEdit, onImageClick }: ProductRowProps) {
  const isInactive = p.status === 'inactive' || p.status === 'discontinued'

  let bg: string
  if (p.low_stock) bg = 'rgba(254,243,199,0.45)'
  else if (isInactive) bg = 'rgba(219,223,215,0.25)'
  else if (hovered) bg = 'var(--md-surface-container-high)'
  else bg = index % 2 === 0 ? 'var(--md-surface-container-lowest)' : 'var(--md-surface-container-low)'

  return (
    <div
      style={{
        display: 'grid', gridTemplateColumns: COLS, alignItems: 'center', gap: 12,
        padding: '0 16px', minHeight: 64,
        background: bg,
        borderBottom: last ? 'none' : '1px solid var(--md-outline-variant)',
        borderInlineStart: p.low_stock ? '3px solid var(--md-warning)' : '3px solid transparent',
        boxShadow: hovered ? 'var(--shadow-1)' : 'none',
        transition: 'background 120ms ease',
        cursor: 'pointer',
      }}
      onMouseEnter={() => onHover(p.id)}
      onMouseLeave={() => onHover(null)}
      onClick={() => onEdit?.(p.id)}
    >
      {/* Checkbox */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <span
          onClick={(e) => { e.stopPropagation(); onToggle(p.id) }}
          style={{
            width: 18, height: 18, borderRadius: 4,
            border: `2px solid ${selected ? 'var(--md-primary)' : hovered ? 'var(--md-primary)' : 'var(--md-outline)'}`,
            background: selected ? 'var(--md-primary)' : 'transparent',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', flexShrink: 0,
          }}
        >
          {selected && <span className="ms" style={{ fontSize: 14, color: '#fff' }}>check</span>}
        </span>
      </div>

      {/* Image */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div style={{
          width: 40, height: 40, borderRadius: 8,
          background: 'var(--md-surface-container)',
          border: '1px solid var(--md-outline-variant)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--md-secondary)',
          opacity: isInactive ? 0.5 : 1,
          flexShrink: 0, overflow: 'hidden',
        }}>
          {p.image_url ? (
            <img
              src={p.image_url}
              alt={p.name}
              onClick={(e) => { e.stopPropagation(); onImageClick?.(p.image_url!) }}
              style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'zoom-in' }}
            />
          ) : (
            <span className="ms" style={{ fontSize: 22, fontVariationSettings: "'FILL' 1, 'wght' 400" }}>pets</span>
          )}
        </div>
      </div>

      {/* Name + tags */}
      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, gap: 2 }}>
        <span style={{
          fontSize: 14, fontWeight: 600,
          color: isInactive ? 'var(--md-on-surface-variant)' : 'var(--md-on-surface)',
          lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {p.name}
        </span>
        {p.tags.length > 0 && (
          <span style={{ fontSize: 12, color: 'var(--md-on-surface-variant)', lineHeight: 1.3 }}>
            {p.tags.slice(0, 2).join(' · ')}
          </span>
        )}
      </div>

      {/* Animal chip */}
      <div>
        <AnimalChip type={p.animal_type} muted={isInactive} />
      </div>

      {/* Variants */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          minWidth: 32, height: 22, padding: '0 8px', borderRadius: 8,
          background: 'var(--md-secondary-container)',
          color: 'var(--md-on-secondary-container)',
          fontSize: 12, fontWeight: 600,
        }}>
          <span className="num">{p.variants_count}</span>
        </span>
        {p.low_stock && <LowStockBadge />}
      </div>

      {/* Stock */}
      <div style={{ textAlign: 'center' }}>
        <span style={{
          fontSize: 14,
          fontWeight: p.low_stock ? 600 : 500,
          color: p.low_stock ? 'var(--md-error)' : isInactive ? 'var(--md-on-surface-variant)' : 'var(--md-on-surface)',
        }}>
          <span className="num">{p.total_qty}</span> יח׳
        </span>
      </div>

      {/* Price */}
      <div style={{ fontSize: 13, fontWeight: 500, color: isInactive ? 'var(--md-on-surface-variant)' : 'var(--md-on-surface)' }}>
        {p.min_price === null ? (
          <span style={{ color: 'var(--md-on-surface-variant)' }}>—</span>
        ) : p.max_price !== null ? (
          <span className="num" style={{ direction: 'ltr', unicodeBidi: 'isolate', display: 'inline-block' }}>₪{p.min_price.toLocaleString('he-IL')} – ₪{p.max_price.toLocaleString('he-IL')}</span>
        ) : (
          <span className="num" style={{ direction: 'ltr', unicodeBidi: 'isolate', display: 'inline-block' }}>₪{p.min_price.toLocaleString('he-IL')}</span>
        )}
      </div>

      {/* Status */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <StatusPill status={p.status} />
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
        {hovered ? (
          <>
            <RowIconBtn icon="edit" title="עריכה" onClick={() => onEdit?.(p.id)} />
            <RowIconBtn icon="content_copy" title="שכפול" onClick={() => onDuplicate(p.id)} />
            <RowIconBtn icon="delete" title="מחיקה" danger onClick={() => onDelete(p.id)} />
          </>
        ) : (
          <button style={{
            width: 28, height: 28, borderRadius: '50%', border: 'none',
            background: 'transparent', cursor: 'pointer',
            color: 'var(--md-on-surface-variant)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span className="ms" style={{ fontSize: 18 }}>more_vert</span>
          </button>
        )}
      </div>
    </div>
  )
}

// ---- Animal Chip ----
const ANIMAL_LABELS: Record<string, string> = {
  dog: 'כלב', cat: 'חתול', rodent: 'מכרסמים',
  bird: 'ציפורים', fish: 'דגים', reptile: 'זוחל', other: 'אחר',
}

function AnimalChip({ type, muted }: { type: string; muted: boolean }) {
  const isTertiary = type === 'cat'
  const bg = muted ? 'transparent'
    : isTertiary ? 'var(--md-tertiary-container)'
    : (type === 'dog' || type === 'rodent' || type === 'bird' || type === 'fish' || type === 'reptile') ? 'var(--md-secondary-container)'
    : 'var(--md-surface-container)'
  const fg = muted ? 'var(--md-on-surface-variant)'
    : isTertiary ? 'var(--md-on-tertiary-container)'
    : 'var(--md-on-secondary-container)'
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '3px 10px', borderRadius: 8,
      background: bg, color: fg,
      border: muted ? '1px solid var(--md-outline-variant)' : 'none',
      fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap',
    }}>
      <span className="ms" style={{ fontSize: 14 }}>pets</span>
      {ANIMAL_LABELS[type] ?? type}
    </span>
  )
}

// ---- Status Pill ----
function StatusPill({ status }: { status: ProductStatus }) {
  const styles: Record<ProductStatus, React.CSSProperties> = {
    active: { background: 'var(--md-primary)', color: 'var(--md-on-primary)', border: '1px solid var(--md-primary)' },
    inactive: { background: 'transparent', color: 'var(--md-on-surface-variant)', border: '1px solid var(--md-outline-variant)' },
    discontinued: { background: 'var(--md-surface-container)', color: 'var(--md-on-surface-variant)', border: '1px dashed var(--md-outline-variant)' },
  }
  const labels: Record<ProductStatus, string> = { active: 'פעיל', inactive: 'כבוי', discontinued: 'הופסק' }
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '3px 12px', borderRadius: 8,
      fontSize: 12, fontWeight: 500, letterSpacing: 0.1, whiteSpace: 'nowrap',
      ...styles[status],
    }}>
      {status === 'active' && <span style={{ width: 6, height: 6, borderRadius: 3, background: '#9BE9A8' }} />}
      {labels[status]}
    </span>
  )
}

// ---- Row Icon Button ----
function RowIconBtn({ icon, title, danger, onClick }: { icon: string; title: string; danger?: boolean; onClick: () => void }) {
  const [hov, setHov] = useState(false)
  return (
    <button
      title={title}
      onClick={(e) => { e.stopPropagation(); onClick() }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: 28, height: 28, borderRadius: '50%', border: 'none',
        background: hov ? (danger ? 'var(--md-error-container)' : 'var(--md-surface-container)') : 'transparent',
        cursor: 'pointer',
        color: danger && hov ? 'var(--md-error)' : 'var(--md-on-surface-variant)',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 120ms ease',
      }}
    >
      <span className="ms" style={{ fontSize: 18 }}>{icon}</span>
    </button>
  )
}

// ---- Table Footer ----
function TableFooter({ total, page, totalPages, onPageChange }: { total: number; page: number; totalPages: number; onPageChange?: (p: number) => void }) {
  return (
    <div style={{
      height: 48, padding: '0 20px',
      background: 'var(--md-surface-container)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
      borderTop: '1px solid var(--md-outline-variant)',
    }}>
      <div style={{ fontSize: 12, color: 'var(--md-on-surface-variant)' }}>
        מציג <span className="num">{total}</span> מוצרים
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <PageArrow disabled={page <= 1} onClick={() => onPageChange?.(page - 1)} icon="chevron_right" />
        <span style={{ fontSize: 12, fontWeight: 600, padding: '0 8px', color: 'var(--md-on-surface)' }}>
          <span className="num">{page}</span> / <span className="num">{totalPages}</span>
        </span>
        <PageArrow disabled={page >= totalPages} onClick={() => onPageChange?.(page + 1)} icon="chevron_left" />
      </div>
    </div>
  )
}

function PageArrow({ icon, disabled, onClick }: { icon: string; disabled: boolean; onClick: () => void }) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      style={{
        width: 28, height: 28, borderRadius: '50%', border: 'none',
        background: 'transparent',
        color: disabled ? 'var(--md-outline-variant)' : 'var(--md-on-surface-variant)',
        cursor: disabled ? 'default' : 'pointer',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <span className="ms" style={{ fontSize: 18 }}>{icon}</span>
    </button>
  )
}

// ---- Bulk Selection Bar ----
function BulkBar({ count, onClear, onSelectAll, onDelete }: { count: number; onClear: () => void; onSelectAll?: () => void; onDelete?: () => void }) {
  return (
    <div style={{
      position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)', zIndex: 50,
      background: '#2E312E',
      color: '#F0F1EA',
      borderRadius: 999, padding: '10px 16px',
      boxShadow: 'var(--shadow-3)',
      display: 'flex', alignItems: 'center', gap: 16,
    }}>
      <button onClick={onClear} style={{
        width: 32, height: 32, borderRadius: '50%', border: 'none',
        background: 'rgba(255,255,255,0.08)', color: '#fff',
        cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <span className="ms" style={{ fontSize: 18 }}>close</span>
      </button>
      <span style={{ fontSize: 14, fontWeight: 600 }}>
        <span className="num">{count}</span> מוצרים נבחרו
      </span>
      <div style={{ flex: 1 }} />
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={onSelectAll} style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          height: 32, padding: '0 14px', borderRadius: 999,
          background: 'rgba(255,255,255,0.10)',
          color: '#F0F1EA',
          border: 'none',
          cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: 500,
        }}>
          <span className="ms" style={{ fontSize: 16 }}>select_all</span>
          בחר הכל
        </button>
        {[
          { icon: 'toggle_on', label: 'הפעל', danger: false },
          { icon: 'toggle_off', label: 'כבה', danger: false },
        ].map(({ icon, label, danger }) => (
          <button key={label} style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            height: 32, padding: '0 14px', borderRadius: 999,
            background: danger ? 'rgba(179,38,30,0.20)' : 'rgba(255,255,255,0.10)',
            color: danger ? '#F9DEDC' : '#F0F1EA',
            border: danger ? '1px solid rgba(249,222,220,0.30)' : 'none',
            cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: 500,
          }}>
            <span className="ms" style={{ fontSize: 16 }}>{icon}</span>
            {label}
          </button>
        ))}
        <button onClick={onDelete} style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          height: 32, padding: '0 14px', borderRadius: 999,
          background: 'rgba(179,38,30,0.20)',
          color: '#F9DEDC',
          border: '1px solid rgba(249,222,220,0.30)',
          cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: 500,
        }}>
          <span className="ms" style={{ fontSize: 16 }}>delete</span>
          מחק
        </button>
      </div>
    </div>
  )
}
