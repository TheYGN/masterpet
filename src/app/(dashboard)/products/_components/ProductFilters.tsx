'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import type { AnimalType } from '../types'

const ANIMAL_OPTIONS: Array<{ id: AnimalType | 'all'; label: string; icon: string }> = [
  { id: 'all',    label: 'הכל',       icon: '' },
  { id: 'dog',    label: 'כלב',       icon: 'pets' },
  { id: 'cat',    label: 'חתול',      icon: 'pets' },
  { id: 'rodent', label: 'מכרסמים',   icon: 'pest_control_rodent' },
  { id: 'bird',   label: 'ציפורים',   icon: 'yard' },
  { id: 'fish',   label: 'דגים',      icon: 'water' },
]

export function ProductFilters({ onNewProduct }: { onNewProduct: () => void }) {
  const router = useRouter()
  const sp = useSearchParams()

  const currentAnimal = sp.get('animal') ?? 'all'
  const currentSearch = sp.get('q') ?? ''

  const updateParam = useCallback((key: string, value: string | null) => {
    const params = new URLSearchParams(sp.toString())
    if (value && value !== 'all') {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`/products?${params.toString()}`)
  }, [sp, router])

  return (
    <div style={{
      background: 'var(--md-surface-container-low)',
      border: '1px solid var(--md-outline-variant)',
      borderRadius: 16, padding: '16px 24px',
      display: 'flex', flexDirection: 'column', gap: 14,
    }}>
      {/* Row 1: actions + search */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={onNewProduct}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              height: 40, padding: '0 20px', borderRadius: 999,
              background: 'var(--md-primary)', color: 'var(--md-on-primary)', border: 'none',
              fontFamily: 'inherit', fontSize: 14, fontWeight: 500, cursor: 'pointer',
            }}
          >
            <span className="ms" style={{ fontSize: 18 }}>add</span>
            <span>מוצר חדש</span>
          </button>
          <button style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            height: 40, padding: '0 16px', borderRadius: 999,
            background: 'transparent', color: 'var(--md-primary)',
            border: '1px solid var(--md-outline)',
            fontFamily: 'inherit', fontSize: 13, fontWeight: 500, cursor: 'pointer',
          }}>
            <span className="ms" style={{ fontSize: 18 }}>download</span>
            <span>ייצא CSV</span>
          </button>
        </div>

        {/* Search */}
        <div style={{ width: 420 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            height: 40, padding: '0 14px',
            background: 'var(--md-surface-container)',
            border: '1px solid var(--md-outline-variant)',
            borderRadius: 999,
          }}>
            <span className="ms" style={{ fontSize: 20, color: 'var(--md-outline-variant)' }}>search</span>
            <input
              defaultValue={currentSearch}
              placeholder="חיפוש לפי שם, SKU, ברקוד, ספק…"
              onChange={(e) => {
                const v = e.target.value
                const win = window as Window & typeof globalThis & { _searchTimer?: ReturnType<typeof setTimeout> }
                clearTimeout(win._searchTimer)
                win._searchTimer = setTimeout(() => updateParam('q', v || null), 300)
              }}
              style={{
                flex: 1, border: 'none', background: 'transparent', outline: 'none',
                fontFamily: 'inherit', fontSize: 13, color: 'var(--md-on-surface)',
                textAlign: 'right',
              }}
            />
          </div>
        </div>
      </div>

      {/* Row 2: animal chips + dropdowns */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        {ANIMAL_OPTIONS.map(opt => {
          const active = currentAnimal === opt.id
          return (
            <button
              key={opt.id}
              onClick={() => updateParam('animal', opt.id)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                height: 32, padding: '0 12px', borderRadius: 999,
                background: active ? 'var(--md-secondary-container)' : 'var(--md-surface-container)',
                color: active ? 'var(--md-on-secondary-container)' : 'var(--md-on-surface-variant)',
                border: active ? 'none' : '1px solid var(--md-outline-variant)',
                fontFamily: 'inherit', fontSize: 12, fontWeight: 500, cursor: 'pointer',
              }}
            >
              {active && <span className="ms" style={{ fontSize: 16 }}>check</span>}
              {!active && opt.icon && <span className="ms" style={{ fontSize: 16 }}>{opt.icon}</span>}
              <span>{opt.label}</span>
            </button>
          )
        })}

        <div style={{ width: 1, height: 20, background: 'var(--md-outline-variant)', margin: '0 4px' }} />

        {(['גיל', 'דיאטה', 'סטטוס'] as const).map(label => (
          <button key={label} style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            height: 32, padding: '0 12px', borderRadius: 999,
            background: 'transparent', color: 'var(--md-on-surface-variant)',
            border: '1px solid var(--md-outline-variant)',
            fontFamily: 'inherit', fontSize: 12, fontWeight: 500, cursor: 'pointer',
          }}>
            <span>{label}</span>
            <span className="ms" style={{ fontSize: 16 }}>expand_more</span>
          </button>
        ))}
      </div>
    </div>
  )
}
