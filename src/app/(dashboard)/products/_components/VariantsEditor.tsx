'use client'

import { useState, useTransition } from 'react'
import { SectionHeader } from './sheet-shared'
import type { AttributeDraft } from './AttributeBuilder'
import type { VariantUnit } from '../types'

export const UNIT_LABELS: Record<VariantUnit, string> = {
  unit: 'יחידה',
  kg: 'ק"ג',
  liter: 'ליטר',
  pack: 'חבילה',
}

export interface VariantDraft {
  id: string
  /** e.g. { "גודל": "1kg", "טעם": "עוף" } */
  combination: Record<string, string>
  sku: string
  price: string
  costPrice: string
  barcode: string
  unit: VariantUnit
  status: 'active' | 'inactive'
  skuError?: string
  barcodeError?: string
  inventoryQty: string
  inventoryReorderLevel: string
  /** DB inventory row ID — present only in edit mode */
  inventoryId?: string
}

// ── Cartesian product ─────────────────────────────────────────────────────────

function cartesian(arrays: string[][]): string[][] {
  if (arrays.length === 0) return []
  return arrays.reduce<string[][]>(
    (acc, arr) => acc.flatMap(a => arr.map(b => [...a, b])),
    [[]],
  )
}

/** Re-compute variants list when attributes change. Keeps existing data for unchanged combos.
 *  Skips any combination whose JSON key is in removedKeys (user explicitly deleted it). */
export function syncVariants(
  attrs: AttributeDraft[],
  prev: VariantDraft[],
  removedKeys?: ReadonlySet<string>,
): VariantDraft[] {
  const valid = attrs.filter(a => a.name.trim() && a.values.length > 0)
  if (valid.length === 0) return []

  const combos = cartesian(valid.map(a => a.values))

  return combos.flatMap(combo => {
    const combination = Object.fromEntries(valid.map((a, i) => [a.name, combo[i]]))
    const key = JSON.stringify(combination)
    if (removedKeys?.has(key)) return []
    const existing = prev.find(v => JSON.stringify(v.combination) === key)
    return [
      existing ?? {
        id: crypto.randomUUID(),
        combination,
        sku: '',
        price: '',
        costPrice: '',
        barcode: '',
        unit: 'unit' as VariantUnit,
        status: 'active' as const,
        inventoryQty: '',
        inventoryReorderLevel: '',
      },
    ]
  })
}

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  attributes: AttributeDraft[]
  variants: VariantDraft[]
  vatRate: number
  onChange: (variants: VariantDraft[]) => void
  /** When provided, each row shows a delete button (create mode only) */
  onRemove?: (id: string) => void
  /** When provided, each row shows an archive button (edit mode only) */
  onArchive?: (id: string) => Promise<void>
}

export function VariantsEditor({ attributes, variants, vatRate, onChange, onRemove, onArchive }: Props) {
  const update = (id: string, patch: Partial<VariantDraft>) =>
    onChange(variants.map(v => (v.id === id ? { ...v, ...patch } : v)))

  if (variants.length === 0) {
    return (
      <section>
        <SectionHeader title="variants" />
        <div style={{
          padding: 24, borderRadius: 12, textAlign: 'center',
          background: 'var(--md-surface-container-low)',
          border: '1px dashed var(--md-outline-variant)',
          color: 'var(--md-on-surface-variant)', fontSize: 13,
        }}>
          הגדר attributes כדי לייצר variants אוטומטית
        </div>
      </section>
    )
  }

  const validAttrCount = attributes.filter(a => a.name.trim() && a.values.length > 0).length

  return (
    <section>
      <SectionHeader
        title="עריכת variants"
        count={variants.length}
        action={
          <span style={{
            fontSize: 12, color: 'var(--md-on-surface-variant)',
            display: 'inline-flex', alignItems: 'center', gap: 4,
          }}>
            <span className="ms" style={{ fontSize: 14, color: 'var(--md-primary)' }}>
              auto_awesome
            </span>
            נוצרו אוטומטית מ-
            <span className="num" style={{ margin: '0 1px' }}>{validAttrCount}</span>
            {' '}attributes
          </span>
        }
      />

      <div style={{
        background: 'var(--md-surface-container-lowest)',
        border: '1px solid var(--md-outline-variant)',
        borderRadius: 12, overflow: 'hidden',
      }}>
        {variants.map((v, i) => (
          <VariantRow
            key={v.id}
            v={v}
            index={i + 1}
            last={i === variants.length - 1}
            vatRate={vatRate}
            onUpdate={patch => update(v.id, patch)}
            onRemove={onRemove ? () => onRemove(v.id) : undefined}
            onArchive={onArchive ? () => onArchive(v.id) : undefined}
          />
        ))}
      </div>

      <div style={{
        marginTop: 6, fontSize: 11, color: 'var(--md-on-surface-variant)',
        display: 'inline-flex', alignItems: 'center', gap: 4,
      }}>
        <span className="ms" style={{ fontSize: 13 }}>lock_outline</span>
        מחיר + מע&quot;מ מחושב אוטומטית ({vatRate}%)
      </div>
    </section>
  )
}

// ── Variant Row (card layout) ─────────────────────────────────────────────────

function VariantRow({
  v,
  index,
  last,
  vatRate,
  onUpdate,
  onRemove,
  onArchive,
}: {
  v: VariantDraft
  index: number
  last: boolean
  vatRate: number
  onUpdate: (patch: Partial<VariantDraft>) => void
  onRemove?: () => void
  onArchive?: () => Promise<void>
}) {
  const [confirmArchive, setConfirmArchive] = useState(false)
  const [archivePending, startArchive] = useTransition()

  const priceNum = parseFloat(v.price)
  const priceWithVatNum =
    !isNaN(priceNum) && priceNum > 0
      ? (priceNum * (1 + vatRate / 100)).toFixed(2)
      : null

  const hasCombo = Object.keys(v.combination).length > 0
  const variantName = hasCombo
    ? Object.values(v.combination).join(' / ')
    : (v.sku || `variant ${index}`)

  const handleArchiveClick = () => {
    if (!confirmArchive) { setConfirmArchive(true); return }
    startArchive(async () => { await onArchive?.() })
  }

  return (
    <div style={{
      padding: '14px 16px',
      borderBottom: last ? 'none' : '1px solid var(--md-outline-variant)',
      display: 'flex', flexDirection: 'column', gap: 12,
      background: 'var(--md-surface-container-lowest)',
    }}>

      {/* Row 1: index + variant name + status toggle */}
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', gap: 8,
        direction: 'rtl',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          {/* index badge */}
          <span style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 20, height: 20, borderRadius: '50%',
            background: 'var(--md-primary-container)',
            color: 'var(--md-on-primary-container)',
            fontSize: 10, fontWeight: 700, flexShrink: 0,
          }}>
            {index}
          </span>
          <span style={{
            fontSize: 13, fontWeight: 600,
            color: hasCombo ? 'var(--md-on-surface)' : 'var(--md-on-surface-variant)',
            fontFamily: hasCombo ? 'inherit' : "'Roboto Mono', monospace",
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {variantName}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          <button
            type="button"
            onClick={() => onUpdate({ status: v.status === 'active' ? 'inactive' : 'active' })}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              padding: '4px 12px', borderRadius: 8, border: 'none',
              background:
                v.status === 'active' ? 'var(--md-primary)' : 'var(--md-surface-container-high)',
              color:
                v.status === 'active' ? 'var(--md-on-primary)' : 'var(--md-on-surface-variant)',
              fontSize: 12, fontWeight: 500, cursor: 'pointer',
              fontFamily: 'inherit', transition: 'all 120ms',
            }}
          >
            {v.status === 'active' ? (
              <>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#9BE9A8' }} />
                פעיל
              </>
            ) : 'כבוי'}
          </button>

          {onRemove && (
            <button
              type="button"
              onClick={onRemove}
              title="הסר variant זה"
              style={{
                width: 28, height: 28, borderRadius: '50%', border: 'none',
                background: 'transparent', cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--md-on-surface-variant)',
              }}
            >
              <span className="ms" style={{ fontSize: 18 }}>delete_outline</span>
            </button>
          )}

          {onArchive && (
            confirmArchive ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <button
                  type="button"
                  disabled={archivePending}
                  onClick={handleArchiveClick}
                  style={{
                    padding: '3px 10px', borderRadius: 8, border: 'none',
                    background: 'var(--md-error)', color: 'var(--md-on-error)',
                    fontSize: 11, fontWeight: 600, cursor: archivePending ? 'wait' : 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  {archivePending ? '…' : 'אשר מחיקה'}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmArchive(false)}
                  style={{
                    padding: '3px 8px', borderRadius: 8,
                    border: '1px solid var(--md-outline-variant)',
                    background: 'transparent', fontSize: 11,
                    color: 'var(--md-on-surface-variant)', cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  ביטול
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleArchiveClick}
                title="מחק variant (הנתונים ישמרו בהיסטוריית הזמנות)"
                style={{
                  width: 28, height: 28, borderRadius: '50%', border: 'none',
                  background: 'transparent', cursor: 'pointer',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--md-on-surface-variant)',
                }}
              >
                <span className="ms" style={{ fontSize: 18 }}>delete_outline</span>
              </button>
            )
          )}
        </div>
      </div>

      {/* Row 2: SKU + barcode + unit */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 10 }}>
        <FieldGroup label="SKU">
          <InlineInput
            value={v.sku}
            placeholder="IMP-..."
            onChange={sku => onUpdate({ sku, skuError: undefined })}
            mono
            error={!!v.skuError}
            errorMsg={v.skuError}
          />
        </FieldGroup>

        <FieldGroup label="ברקוד">
          <InlineInput
            value={v.barcode}
            placeholder="ברקוד"
            onChange={barcode => onUpdate({ barcode, barcodeError: undefined })}
            mono
            error={!!v.barcodeError}
            errorMsg={v.barcodeError}
          />
        </FieldGroup>

        <FieldGroup label="יחידה">
          <select
            value={v.unit}
            onChange={e => onUpdate({ unit: e.target.value as VariantUnit })}
            style={{
              height: 32, padding: '0 10px', borderRadius: 8,
              border: '1px solid var(--md-outline-variant)',
              background: 'var(--md-surface-container-lowest)',
              fontSize: 12, color: 'var(--md-on-surface)',
              fontFamily: 'inherit', cursor: 'pointer', direction: 'rtl',
            }}
          >
            {(Object.entries(UNIT_LABELS) as [VariantUnit, string][]).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        </FieldGroup>
      </div>

      {/* Row 3: price + price+vat (locked) + cost */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
        <FieldGroup label="מחיר" sub="ללא מע״מ">
          <InlineInput
            value={v.price}
            placeholder="0.00"
            onChange={price => onUpdate({ price })}
            prefix="₪"
            numeric
          />
        </FieldGroup>

        <FieldGroup label="מחיר + מע״מ" lock>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 4,
            direction: 'rtl',
            height: 32, padding: '0 10px', borderRadius: 8,
            background: 'var(--md-surface-container)',
            color: 'var(--md-on-surface-variant)', fontSize: 13,
          }}>
            {priceWithVatNum
              ? <><span className="num" style={{ fontWeight: 500 }}>{priceWithVatNum}</span><span style={{ fontSize: 11 }}>₪</span></>
              : <span>—</span>
            }
            <span className="ms" style={{ fontSize: 12, opacity: 0.5, marginRight: 'auto' }}>lock_outline</span>
          </div>
        </FieldGroup>

        <FieldGroup label="עלות">
          <InlineInput
            value={v.costPrice}
            placeholder="0.00"
            onChange={costPrice => onUpdate({ costPrice })}
            prefix="₪"
            numeric
          />
        </FieldGroup>
      </div>

      {/* Row 4: inventory */}
      <div style={{
        borderTop: '1px dashed var(--md-outline-variant)',
        paddingTop: 10,
        display: 'flex', flexDirection: 'column', gap: 8,
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          fontSize: 10, fontWeight: 600, letterSpacing: 0.4, textTransform: 'uppercase',
          color: 'var(--md-on-surface-variant)',
        }}>
          <span className="ms" style={{ fontSize: 13 }}>inventory_2</span>
          מלאי
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <FieldGroup label="כמות במלאי">
            <InlineInput
              value={v.inventoryQty}
              placeholder="0"
              onChange={inventoryQty => onUpdate({ inventoryQty })}
              numeric
            />
          </FieldGroup>
          <FieldGroup label="רמת התראה" sub="מינימום לפני הזמנה">
            <InlineInput
              value={v.inventoryReorderLevel}
              placeholder="0"
              onChange={inventoryReorderLevel => onUpdate({ inventoryReorderLevel })}
              numeric
            />
          </FieldGroup>
        </div>
      </div>

    </div>
  )
}

// ── Field Group (label + child) ────────────────────────────────────────────────

function FieldGroup({
  label,
  sub,
  lock,
  children,
}: {
  label: string
  sub?: string
  lock?: boolean
  children: React.ReactNode
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 3,
        fontSize: 10, fontWeight: 600, letterSpacing: 0.4,
        textTransform: 'uppercase', color: 'var(--md-on-surface-variant)',
      }}>
        {lock && <span className="ms" style={{ fontSize: 11 }}>lock_outline</span>}
        <span>{label}</span>
        {sub && (
          <span style={{ fontWeight: 400, opacity: 0.6, letterSpacing: 0, textTransform: 'none', fontSize: 9 }}>
            ({sub})
          </span>
        )}
      </div>
      {children}
    </div>
  )
}

// ── Inline Input ──────────────────────────────────────────────────────────────

function InlineInput({
  value,
  onChange,
  placeholder,
  mono,
  prefix,
  numeric,
  error,
  errorMsg,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  mono?: boolean
  prefix?: string
  numeric?: boolean
  error?: boolean
  errorMsg?: string
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0 }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 4,
        direction: 'rtl',
        height: 32, padding: '0 10px',
        borderRadius: 8,
        background: 'var(--md-surface-container-lowest)',
        border: `1px solid ${error ? 'var(--md-error)' : 'var(--md-outline-variant)'}`,
        boxSizing: 'border-box' as const,
      }}>
        <input
          type={numeric ? 'number' : 'text'}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          min={numeric ? '0' : undefined}
          step={numeric ? '0.01' : undefined}
          style={{
            flex: 1, minWidth: 0, border: 'none', background: 'transparent', outline: 'none',
            fontSize: mono ? 11 : 13,
            fontFamily: mono ? "'Roboto Mono', 'Heebo', monospace" : 'inherit',
            fontWeight: 500, color: 'var(--md-on-surface)',
            direction: 'rtl', textAlign: 'right',
          }}
        />
        {prefix && (
          <span style={{ fontSize: 11, color: 'var(--md-on-surface-variant)', flexShrink: 0 }}>
            {prefix}
          </span>
        )}
      </div>
      {error && errorMsg && (
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 3,
          fontSize: 10, color: 'var(--md-error)',
        }}>
          <span className="ms" style={{ fontSize: 11 }}>error</span>
          {errorMsg}
        </span>
      )}
    </div>
  )
}
