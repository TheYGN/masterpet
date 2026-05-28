'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { CustomerListItem } from '../types'
import { deleteCustomerAction } from '../actions'

const CHANNEL_ICON: Record<string, { icon: string; color: string; bg: string; label: string }> = {
  whatsapp: { icon: 'chat', color: '#fff', bg: '#25D366', label: 'WhatsApp' },
  phone:    { icon: 'call', color: 'var(--md-secondary)', bg: 'var(--md-secondary-container)', label: 'טלפון' },
  email:    { icon: 'mail', color: '#2563EB', bg: 'rgba(59,130,246,0.12)', label: 'אימייל' },
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return name.slice(0, 2)
  return `${parts[0][0]}.${parts[parts.length - 1][0]}`
}

const GRADIENT_PAIRS = [
  ['#38656A', '#1B5E20'],
  ['#52634F', '#38656A'],
  ['#1B5E20', '#52634F'],
  ['#38656A', '#52634F'],
]

interface CustomersTableProps {
  customers: CustomerListItem[]
  role: string
  isLoading?: boolean
  onEdit: (customer: CustomerListItem) => void
}

export function CustomersTable({ customers, role, isLoading, onEdit }: CustomersTableProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [bulkSelected, setBulkSelected] = useState<Set<string>>(new Set())
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const canWrite = role === 'owner' || role === 'branch_manager'
  const canDelete = role === 'owner'

  const filtered = customers

  const toggleBulk = (id: string) => {
    setBulkSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const clearBulk = () => setBulkSelected(new Set())

  const toggleAll = () => {
    if (bulkSelected.size === filtered.length) {
      clearBulk()
    } else {
      setBulkSelected(new Set(filtered.map(c => c.id)))
    }
  }

  const handleBulkDelete = () => {
    if (!confirm(`למחוק ${bulkSelected.size} לקוחות? הפעולה אינה הפיכה.`)) return
    startTransition(async () => {
      let hasError = false;
      for (const id of bulkSelected) {
        const res = await deleteCustomerAction(id)
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
  }

  const handleDelete = (e: React.MouseEvent, customerId: string, name: string) => {
    e.stopPropagation()
    if (!confirm(`למחוק את "${name}"? הלקוח יוסר מהרשימה.`)) return
    startTransition(async () => {
      const result = await deleteCustomerAction(customerId)
      if (result.error) alert(result.error)
      else router.refresh()
    })
  }

  if (filtered.length === 0) {
    return (
      <div style={{
        background: 'var(--md-surface-container-lowest)',
        border: '1px dashed var(--md-outline-variant)',
        borderRadius: 16, padding: '56px 24px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 16,
      }}>
        <span className="ms" style={{ fontSize: 72, color: 'var(--md-outline)', fontVariationSettings: "'FILL' 0, 'wght' 300" }}>group</span>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--md-on-surface)' }}>אין לקוחות עדיין</div>
          <div style={{ fontSize: 14, color: 'var(--md-on-surface-variant)', marginTop: 4, maxWidth: 360 }}>
            הוסף לקוח ידנית או ייבא רשימה מ-Excel כדי להתחיל
          </div>
        </div>
      </div>
    )
  }

  const COLS = '40px 2fr 1fr 1fr 72px 1fr 1fr 1fr 80px'

  return (
    <div style={{
      background: 'var(--md-surface-container-low)',
      border: '1px solid var(--md-outline-variant)',
      borderRadius: 16, overflow: 'hidden',
      opacity: isPending || isLoading ? 0.6 : 1,
      transition: 'opacity 150ms ease',
    }}>
      {/* Header */}
      <div style={{
        display: 'grid', gridTemplateColumns: COLS,
        background: 'var(--md-surface-container)',
        height: 44, alignItems: 'center',
        padding: '0 16px', gap: 8,
        borderBottom: '1px solid var(--md-outline-variant)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <span
            onClick={toggleAll}
            style={{
              width: 18, height: 18, borderRadius: 4,
              border: `2px solid ${bulkSelected.size === filtered.length && filtered.length > 0 ? 'var(--md-primary)' : 'var(--md-outline)'}`,
              background: bulkSelected.size === filtered.length && filtered.length > 0 ? 'var(--md-primary)' : 'transparent',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            {bulkSelected.size === filtered.length && filtered.length > 0 && <span className="ms" style={{ fontSize: 14, color: '#fff' }}>check</span>}
          </span>
        </div>
        {['שם מלא', 'טלפון', 'עיר', 'ערוץ', 'סניף', 'סטטוס', 'הצטרף', 'פעולות'].map(col => (
          <span key={col} style={{
            fontSize: 11, fontWeight: 600, letterSpacing: 0.4,
            textTransform: 'uppercase', color: 'var(--md-on-surface-variant)',
            textAlign: col === 'ערוץ' || col === 'סטטוס' || col === 'פעולות' ? 'center' : 'start',
          }}>
            {col}
          </span>
        ))}
      </div>

      {/* Rows */}
      <div>
        {filtered.map((c, i) => {
          const hovered = hoveredId === c.id
          const inactive = c.status === 'inactive'
          const gradIdx = i % GRADIENT_PAIRS.length
          const [g1, g2] = GRADIENT_PAIRS[gradIdx]
          const ch = CHANNEL_ICON[c.preferred_channel] ?? CHANNEL_ICON.phone

          return (
            <div
              key={c.id}
              onClick={() => router.push(`/customers/${c.id}`)}
              onMouseEnter={() => setHoveredId(c.id)}
              onMouseLeave={() => setHoveredId(null)}
              style={{
                display: 'grid', gridTemplateColumns: COLS,
                padding: '0 16px', gap: 8, height: 60,
                alignItems: 'center', cursor: 'pointer',
                borderBottom: i < filtered.length - 1 ? '1px solid var(--md-outline-variant)' : undefined,
                background: hovered
                  ? 'var(--md-surface-container-high)'
                  : inactive
                    ? 'rgba(219,223,215,0.30)'
                    : i % 2 === 0 ? 'var(--md-surface-container-lowest)' : 'var(--md-surface-container-low)',
                boxShadow: hovered ? 'var(--shadow-1)' : undefined,
                transition: 'background 120ms ease',
                opacity: inactive ? 0.75 : 1,
              }}
            >
              {/* Checkbox */}
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <span
                  onClick={(e) => { e.stopPropagation(); toggleBulk(c.id) }}
                  style={{
                    width: 18, height: 18, borderRadius: 4,
                    border: `2px solid ${bulkSelected.has(c.id) ? 'var(--md-primary)' : hovered ? 'var(--md-primary)' : 'var(--md-outline)'}`,
                    background: bulkSelected.has(c.id) ? 'var(--md-primary)' : 'transparent',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', flexShrink: 0,
                  }}
                >
                  {bulkSelected.has(c.id) && <span className="ms" style={{ fontSize: 14, color: '#fff' }}>check</span>}
                </span>
              </div>

              {/* שם + אווטאר */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                  background: inactive
                    ? 'var(--md-surface-container)'
                    : `linear-gradient(135deg, ${g1} 0%, ${g2} 100%)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: inactive ? 'var(--md-on-surface-variant)' : '#fff',
                  fontSize: 13, fontWeight: 700, letterSpacing: 0.2,
                }}>
                  {initials(c.full_name)}
                </div>
                <span style={{
                  fontSize: 14, fontWeight: 500,
                  color: inactive ? 'var(--md-on-surface-variant)' : 'var(--md-on-surface)',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                  {c.full_name}
                </span>
              </div>

              {/* טלפון */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span className="num" style={{
                  fontSize: 13,
                  color: c.phone_is_placeholder ? 'var(--md-on-surface-variant)' : 'var(--md-on-surface-variant)',
                  textDecoration: c.phone_is_placeholder ? 'line-through' : undefined,
                  opacity: c.phone_is_placeholder ? 0.5 : 1,
                }}>
                  {c.phone}
                </span>
                {c.phone_is_placeholder && (
                  <span style={{
                    fontSize: 10, fontWeight: 600, letterSpacing: 0.3,
                    color: '#9a3412', background: '#fff7ed',
                    border: '1px solid #fed7aa',
                    borderRadius: 4, padding: '1px 5px',
                    display: 'inline-block', lineHeight: 1.6,
                  }}>
                    ללא טלפון
                  </span>
                )}
              </div>

              {/* עיר */}
              <span style={{ fontSize: 13, color: 'var(--md-on-surface-variant)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {c.city ?? '—'}
              </span>

              {/* ערוץ */}
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <span
                  title={ch.label}
                  style={{
                    width: 28, height: 28, borderRadius: 8,
                    background: ch.bg, color: ch.color,
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    opacity: inactive ? 0.5 : 1,
                  }}
                >
                  <span className="ms" style={{ fontSize: 16, fontVariationSettings: "'FILL' 1" }}>{ch.icon}</span>
                </span>
              </div>

              {/* סניף */}
              <span style={{ fontSize: 13, color: 'var(--md-on-surface-variant)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {c.branch_name ?? '—'}
              </span>

              {/* סטטוס */}
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center',
                  height: 24, padding: '0 10px', borderRadius: 8,
                  fontSize: 12, fontWeight: 600,
                  background: c.status === 'active' ? 'var(--md-primary-container)' : 'transparent',
                  color: c.status === 'active' ? 'var(--md-on-primary-container)' : 'var(--md-on-surface-variant)',
                  border: c.status === 'active' ? 'none' : '1px solid var(--md-outline-variant)',
                }}>
                  {c.status === 'active' ? 'פעיל' : 'לא פעיל'}
                </span>
              </div>

              {/* הצטרף */}
              <span className="num" style={{ fontSize: 12, color: 'var(--md-on-surface-variant)' }}>
                {formatDate(c.created_at)}
              </span>

              {/* פעולות */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                {hovered && canWrite && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onEdit(c) }}
                    title="עריכה"
                    style={{
                      width: 32, height: 32, borderRadius: 8,
                      background: 'transparent', border: 'none',
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', color: 'var(--md-on-surface-variant)',
                    }}
                  >
                    <span className="ms" style={{ fontSize: 18 }}>edit</span>
                  </button>
                )}
                {hovered && (
                  <button
                    onClick={(e) => { e.stopPropagation(); router.push(`/customers/${c.id}`) }}
                    title="כרטיס לקוח"
                    style={{
                      width: 32, height: 32, borderRadius: 8,
                      background: 'transparent', border: 'none',
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', color: 'var(--md-on-surface-variant)',
                    }}
                  >
                    <span className="ms" style={{ fontSize: 18 }}>open_in_new</span>
                  </button>
                )}
                {hovered && canDelete && (
                  <button
                    onClick={(e) => handleDelete(e, c.id, c.full_name)}
                    title="הסרה"
                    style={{
                      width: 32, height: 32, borderRadius: 8,
                      background: 'transparent', border: 'none',
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', color: 'var(--md-on-surface-variant)',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'var(--md-error)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--md-on-surface-variant)')}
                  >
                    <span className="ms" style={{ fontSize: 18 }}>delete</span>
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Bulk selection bar */}
      {bulkSelected.size > 0 && (
        <div style={{
          position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)',
          zIndex: 50,
          background: '#2E312E',
          color: '#F0F1EA',
          borderRadius: 999, padding: '10px 16px',
          boxShadow: 'var(--shadow-3)',
          display: 'flex', alignItems: 'center', gap: 16,
        }}>
          <button onClick={clearBulk} style={{
            width: 32, height: 32, borderRadius: '50%', border: 'none',
            background: 'rgba(255,255,255,0.08)', color: '#fff',
            cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span className="ms" style={{ fontSize: 18 }}>close</span>
          </button>
          <span style={{ fontSize: 14, fontWeight: 600 }}>
            <span className="num">{bulkSelected.size}</span> לקוחות נבחרו
          </span>
          <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.2)' }} />
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={toggleAll} style={{
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
            <button onClick={handleBulkDelete} style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              height: 32, padding: '0 14px', borderRadius: 999,
              background: 'rgba(179,38,30,0.20)',
              color: '#F9DEDC',
              border: '1px solid rgba(249,222,220,0.30)',
              cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: 500,
            }}>
              <span className="ms" style={{ fontSize: 16 }}>delete</span>
              מחיקה
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
