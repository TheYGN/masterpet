'use client'

import { useState } from 'react'
import { SectionHeader } from './sheet-shared'

export interface AttributeDraft {
  id: string
  name: string
  values: string[]
}

interface Props {
  attributes: AttributeDraft[]
  onChange: (attrs: AttributeDraft[]) => void
  /** Attribute IDs locked because active variants reference them (cannot be deleted) */
  lockedAttrIds?: ReadonlySet<string>
  /** Attribute IDs that exist in DB but have no active variants — show trash, not lock */
  deletableExistingAttrIds?: ReadonlySet<string>
  /** Called when the user deletes an existing (DB) attribute with no active variants */
  onDeleteExisting?: (id: string) => void
  /** Per attribute ID: which value strings cannot be removed */
  lockedValueSets?: ReadonlyMap<string, ReadonlySet<string>>
  /** Hide the "N variants will be created" badge (use in edit mode) */
  hideVariantCount?: boolean
}

export function AttributeBuilder({
  attributes,
  onChange,
  lockedAttrIds,
  deletableExistingAttrIds,
  onDeleteExisting,
  lockedValueSets,
  hideVariantCount,
}: Props) {
  const validAttrs = attributes.filter(a => a.name.trim() && a.values.length > 0)
  const variantCount =
    hideVariantCount ? 0 : (validAttrs.length === 0 ? 0 : validAttrs.reduce((acc, a) => acc * a.values.length, 1))

  const addAttr = () =>
    onChange([...attributes, { id: crypto.randomUUID(), name: '', values: [] }])

  const removeAttr = (id: string) => onChange(attributes.filter(a => a.id !== id))

  const updateName = (id: string, name: string) =>
    onChange(attributes.map(a => (a.id === id ? { ...a, name } : a)))

  const addValue = (attrId: string, value: string) => {
    const t = value.trim()
    if (!t) return
    onChange(
      attributes.map(a => {
        if (a.id !== attrId || a.values.includes(t)) return a
        return { ...a, values: [...a.values, t] }
      }),
    )
  }

  const removeValue = (attrId: string, value: string) =>
    onChange(
      attributes.map(a =>
        a.id === attrId ? { ...a, values: a.values.filter(v => v !== value) } : a,
      ),
    )

  return (
    <section>
      <SectionHeader
        title="attributes"
        count={validAttrs.length > 0 ? validAttrs.length : undefined}
        action={
          variantCount > 0 ? (
            <span style={{
              fontSize: 12, color: 'var(--md-on-surface-variant)',
              display: 'inline-flex', alignItems: 'center', gap: 4,
            }}>
              <span className="ms" style={{ fontSize: 14, color: 'var(--md-primary)' }}>
                auto_awesome
              </span>
              יוצרים{' '}
              <strong className="num" style={{ color: 'var(--md-on-surface)', margin: '0 2px' }}>
                {variantCount}
              </strong>{' '}
              variants
            </span>
          ) : null
        }
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {attributes.map(attr => {
          const isLocked = lockedAttrIds?.has(attr.id) ?? false
          const isDeletableExisting = !isLocked && (deletableExistingAttrIds?.has(attr.id) ?? false)
          return (
            <AttributeRow
              key={attr.id}
              attr={attr}
              onNameChange={name => updateName(attr.id, name)}
              onAddValue={val => addValue(attr.id, val)}
              onRemoveValue={val => removeValue(attr.id, val)}
              onRemove={isDeletableExisting ? () => onDeleteExisting?.(attr.id) : () => removeAttr(attr.id)}
              nameLocked={isLocked || isDeletableExisting}
              removeLocked={isLocked}
              lockedValues={lockedValueSets?.get(attr.id)}
            />
          )
        })}

        <button
          type="button"
          onClick={addAttr}
          style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            padding: '10px 0', borderRadius: 12,
            background: 'transparent',
            border: '1px dashed var(--md-outline-variant)',
            color: 'var(--md-primary)', cursor: 'pointer',
            fontFamily: 'inherit', fontSize: 13, fontWeight: 500,
            width: '100%',
          }}
        >
          <span className="ms" style={{ fontSize: 18 }}>add</span>
          הוסף attribute (גודל, טעם, צבע…)
        </button>
      </div>
    </section>
  )
}

// ── Attribute Row ─────────────────────────────────────────────────────────────

function AttributeRow({
  attr,
  onNameChange,
  onAddValue,
  onRemoveValue,
  onRemove,
  nameLocked,
  removeLocked,
  lockedValues,
}: {
  attr: AttributeDraft
  onNameChange: (name: string) => void
  onAddValue: (val: string) => void
  onRemoveValue: (val: string) => void
  onRemove: () => void
  nameLocked?: boolean
  /** true = show lock icon, no delete. false/undefined = show trash icon */
  removeLocked?: boolean
  lockedValues?: ReadonlySet<string>
}) {
  const [inputVal, setInputVal] = useState('')

  const commit = () => {
    if (!inputVal.trim()) return
    onAddValue(inputVal.trim())
    setInputVal('')
  }

  return (
    <div style={{
      background: 'var(--md-surface-container-low)',
      border: '1px solid var(--md-outline-variant)',
      borderRadius: 12, padding: 14,
    }}>
      {/* Name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <input
          type="text"
          placeholder="שם attribute — לדוגמה: גודל, טעם, צבע"
          value={attr.name}
          onChange={e => !nameLocked && onNameChange(e.target.value)}
          readOnly={nameLocked}
          style={{
            flex: 1, height: 36, padding: '0 12px', borderRadius: 8,
            background: nameLocked
              ? 'var(--md-surface-container)'
              : 'var(--md-surface-container-lowest)',
            border: '1px solid var(--md-outline-variant)',
            fontFamily: 'inherit', fontSize: 13,
            color: nameLocked ? 'var(--md-on-surface-variant)' : 'var(--md-on-surface)',
            outline: 'none', direction: 'rtl', boxSizing: 'border-box' as const,
            cursor: nameLocked ? 'default' : undefined,
          }}
        />
        {!removeLocked && (
          <button
            type="button"
            onClick={onRemove}
            title="הסר attribute"
            style={{
              width: 32, height: 32, borderRadius: '50%',
              border: 'none', background: 'transparent',
              color: 'var(--md-on-surface-variant)', cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <span className="ms" style={{ fontSize: 18 }}>delete_outline</span>
          </button>
        )}
        {removeLocked && (
          <span
            title="תכונה קיימת — לא ניתן למחוק כל עוד יש variants פעילים"
            style={{
              width: 32, height: 32, display: 'inline-flex',
              alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              color: 'var(--md-on-surface-variant)', opacity: 0.5,
            }}
          >
            <span className="ms" style={{ fontSize: 18 }}>lock_outline</span>
          </span>
        )}
      </div>

      {/* Values */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
        {attr.values.map(val => (
          <ValueChip
            key={val}
            value={val}
            onRemove={() => onRemoveValue(val)}
            locked={lockedValues?.has(val)}
          />
        ))}

        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <input
            type="text"
            placeholder="ערך חדש…"
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') { e.preventDefault(); commit() }
            }}
            style={{
              width: 110, height: 28, padding: '0 10px', borderRadius: 8,
              background: 'var(--md-surface-container-lowest)',
              border: '1px dashed var(--md-outline-variant)',
              fontFamily: 'inherit', fontSize: 12,
              color: 'var(--md-on-surface)', outline: 'none', direction: 'rtl',
            }}
          />
          {inputVal.trim() && (
            <button
              type="button"
              onClick={commit}
              style={{
                width: 26, height: 26, borderRadius: '50%',
                border: 'none', background: 'var(--md-primary)',
                color: 'var(--md-on-primary)', cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <span className="ms" style={{ fontSize: 14 }}>add</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Value Chip ────────────────────────────────────────────────────────────────

function ValueChip({ value, onRemove, locked }: { value: string; onRemove: () => void; locked?: boolean }) {
  const [hov, setHov] = useState(false)
  return (
    <span
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 3,
        padding: '3px 6px 3px 10px', borderRadius: 8,
        background: 'var(--md-secondary-container)',
        color: 'var(--md-on-secondary-container)',
        fontSize: 12, fontWeight: 500,
      }}
    >
      {value}
      {!locked && (
        <button
          type="button"
          onClick={onRemove}
          style={{
            width: 16, height: 16, borderRadius: '50%', border: 'none',
            background: hov ? 'rgba(16,31,16,0.15)' : 'transparent',
            color: 'var(--md-on-secondary-container)', cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            padding: 0, flexShrink: 0, transition: 'background 100ms',
          }}
        >
          <span className="ms" style={{ fontSize: 12 }}>close</span>
        </button>
      )}
    </span>
  )
}
