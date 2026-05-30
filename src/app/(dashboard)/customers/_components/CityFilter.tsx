'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

interface CityFilterProps {
  cities: string[]
  /** Selected city, or undefined for "all cities". */
  value: string | undefined
  onChange: (city: string | undefined) => void
}

/**
 * Searchable single-select city dropdown for the customers toolbar.
 * Styled to match the status pills / search bar (RTL, Material tokens).
 * Self-contained — no external dependency; the city list is filtered in memory.
 */
export function CityFilter({ cities, value, onChange }: CityFilterProps) {
  const [open, setOpen] = useState(false)
  const [term, setTerm] = useState('')
  const rootRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Close on outside click + Escape.
  useEffect(() => {
    if (!open) return
    function onPointerDown(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  // Focus the search field when the menu opens.
  useEffect(() => {
    if (open) {
      setTerm('')
      // defer so the input is mounted
      const t = setTimeout(() => inputRef.current?.focus(), 0)
      return () => clearTimeout(t)
    }
  }, [open])

  const filtered = useMemo(() => {
    const q = term.trim()
    if (!q) return cities
    return cities.filter(c => c.includes(q))
  }, [cities, term])

  const active = Boolean(value)

  function select(city: string | undefined) {
    onChange(city)
    setOpen(false)
  }

  return (
    <div ref={rootRef} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          height: 32, padding: '0 12px', borderRadius: 999,
          background: active ? 'var(--md-secondary-container)' : 'var(--md-surface-container)',
          color: active ? 'var(--md-on-secondary-container)' : 'var(--md-on-surface-variant)',
          border: active ? 'none' : '1px solid var(--md-outline-variant)',
          fontFamily: 'inherit', fontSize: 13, fontWeight: active ? 600 : 400,
          cursor: 'pointer', transition: 'background 120ms',
        }}
      >
        <span className="ms" style={{ fontSize: 16 }}>location_on</span>
        {value ?? 'כל הערים'}
        <span className="ms" style={{ fontSize: 16, opacity: 0.7 }}>
          {open ? 'expand_less' : 'expand_more'}
        </span>
      </button>

      {open && (
        <div
          style={{
            position: 'absolute', top: 'calc(100% + 6px)', insetInlineStart: 0,
            zIndex: 40, width: 240,
            background: 'var(--md-surface-container-lowest)',
            border: '1px solid var(--md-outline-variant)',
            borderRadius: 12, boxShadow: 'var(--shadow-2)',
            overflow: 'hidden',
            display: 'flex', flexDirection: 'column',
          }}
        >
          {/* Search field */}
          <div style={{ padding: 8, borderBottom: '1px solid var(--md-outline-variant)' }}>
            <input
              ref={inputRef}
              type="text"
              value={term}
              onChange={e => setTerm(e.target.value)}
              placeholder="חיפוש עיר..."
              style={{
                width: '100%', height: 34, padding: '0 12px',
                borderRadius: 8, border: '1px solid var(--md-outline-variant)',
                background: 'var(--md-surface-container)', fontSize: 13,
                color: 'var(--md-on-surface)', fontFamily: 'inherit', outline: 'none',
                direction: 'rtl', boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Options */}
          <div style={{ maxHeight: 260, overflowY: 'auto', padding: 4 }}>
            <Option label="כל הערים" selected={!value} onClick={() => select(undefined)} />
            {filtered.map(city => (
              <Option key={city} label={city} selected={city === value} onClick={() => select(city)} />
            ))}
            {filtered.length === 0 && (
              <div style={{ padding: '12px 12px', fontSize: 13, color: 'var(--md-on-surface-variant)', textAlign: 'center' }}>
                לא נמצאו ערים
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function Option({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
        width: '100%', height: 36, padding: '0 10px', borderRadius: 8,
        background: selected ? 'var(--md-secondary-container)' : 'transparent',
        color: selected ? 'var(--md-on-secondary-container)' : 'var(--md-on-surface)',
        border: 'none', cursor: 'pointer',
        fontFamily: 'inherit', fontSize: 13, fontWeight: selected ? 600 : 400,
        textAlign: 'start',
      }}
      onMouseEnter={e => { if (!selected) e.currentTarget.style.background = 'var(--md-surface-container-high)' }}
      onMouseLeave={e => { if (!selected) e.currentTarget.style.background = 'transparent' }}
    >
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
      {selected && <span className="ms" style={{ fontSize: 16 }}>check</span>}
    </button>
  )
}
