'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { CustomerListItem, CreateCustomerInput, PreferredChannel, CustomerStatus } from '../types'
import { createCustomerAction, updateCustomerAction } from '../actions'
import { FormRow, SectionHeader, TextInput, SelectInput } from '../../products/_components/sheet-shared'

interface Branch { id: string; name: string }

interface CustomerSheetProps {
  mode?: 'create' | 'edit'
  initialCustomer?: CustomerListItem
  branches: Branch[]
  onClose: () => void
  /** Called on successful save so a client list can refetch without reload. */
  onSaved?: () => void
}

const CHANNEL_OPTIONS: Array<{ value: PreferredChannel; label: string; icon: string }> = [
  { value: 'whatsapp', label: 'WhatsApp', icon: 'chat' },
  { value: 'phone',   label: 'טלפון',    icon: 'call' },
  { value: 'email',   label: 'אימייל',   icon: 'mail' },
]

function emptyForm(): CreateCustomerInput {
  return {
    full_name: '', phone: '', email: '', address: '', city: '',
    preferred_channel: 'whatsapp', notes: '', branch_id: '', status: 'active',
  }
}

function fromCustomer(c: CustomerListItem): CreateCustomerInput {
  return {
    full_name: c.full_name,
    phone: c.phone,
    email: c.email ?? '',
    address: c.address ?? '',
    city: c.city ?? '',
    preferred_channel: c.preferred_channel,
    notes: c.notes ?? '',
    branch_id: c.branch_id ?? '',
    status: c.status,
  }
}

export function CustomerSheet({ mode = 'create', initialCustomer, branches, onClose, onSaved }: CustomerSheetProps) {
  const [form, setForm] = useState<CreateCustomerInput>(
    mode === 'edit' && initialCustomer ? fromCustomer(initialCustomer) : emptyForm()
  )
  const [errors, setErrors] = useState<Partial<Record<keyof CreateCustomerInput, string>>>({})
  const [globalError, setGlobalError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const set = <K extends keyof CreateCustomerInput>(key: K, value: CreateCustomerInput[K]) => {
    setForm(prev => ({ ...prev, [key]: value }))
    setErrors(prev => ({ ...prev, [key]: undefined }))
    setGlobalError(null)
  }

  const validate = (): boolean => {
    const errs: Partial<Record<keyof CreateCustomerInput, string>> = {}
    if (!form.full_name.trim() || form.full_name.trim().length < 2)
      errs.full_name = 'שם חייב להכיל לפחות 2 תווים'
    if (!form.phone.trim()) errs.phone = 'שדה חובה'
    if (Object.keys(errs).length > 0) { setErrors(errs); return false }
    return true
  }

  const handleSubmit = () => {
    if (!validate()) return
    setGlobalError(null)

    startTransition(async () => {
      const payload: CreateCustomerInput = {
        ...form,
        email: form.email?.trim() || undefined,
        address: form.address?.trim() || undefined,
        city: form.city?.trim() || undefined,
        notes: form.notes?.trim() || undefined,
        branch_id: form.branch_id?.trim() || undefined,
      }

      let result
      if (mode === 'edit' && initialCustomer) {
        result = await updateCustomerAction(initialCustomer.id, payload)
      } else {
        result = await createCustomerAction(payload)
      }

      if (result.error) {
        if (result.error.includes('טלפון')) setErrors(prev => ({ ...prev, phone: result.error }))
        else setGlobalError(result.error)
        return
      }

      onSaved?.()
      router.refresh()
      onClose()
    })
  }

  const title = mode === 'edit' && initialCustomer
    ? `עריכת ${initialCustomer.full_name}`
    : 'לקוח חדש'
  const submitLabel = mode === 'edit' ? 'עדכן לקוח' : 'שמור לקוח'

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 50,
          background: 'rgba(0,0,0,0.35)',
        }}
      />

      {/* Sheet panel */}
      <div style={{
        position: 'fixed', top: 0, insetInlineEnd: 0, bottom: 0,
        width: 680, zIndex: 51,
        background: 'var(--md-surface-container-lowest)',
        boxShadow: '-4px 0 24px rgba(0,0,0,0.12)',
        display: 'flex', flexDirection: 'column',
        overflowY: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          height: 64, padding: '0 24px', flexShrink: 0,
          background: 'var(--md-surface-container-low)',
          borderBottom: '1px solid var(--md-outline-variant)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={onClose}
              style={{
                width: 36, height: 36, borderRadius: 8,
                background: 'transparent', border: '1px solid var(--md-outline-variant)',
                cursor: 'pointer', color: 'var(--md-on-surface-variant)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <span className="ms" style={{ fontSize: 20 }}>close</span>
            </button>
            <div style={{ width: 1, height: 20, background: 'var(--md-outline-variant)' }} />
            <nav style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--md-on-surface-variant)' }}>
              <span style={{ cursor: 'pointer' }} onClick={onClose}>לקוחות</span>
              <span className="ms" style={{ fontSize: 14 }}>chevron_left</span>
              <span style={{ color: 'var(--md-on-surface)', fontWeight: 500 }}>{title}</span>
            </nav>
          </div>
          <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--md-on-surface)' }}>{title}</span>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 28 }}>

          {/* Group 1 — פרטי קשר */}
          <div>
            <SectionHeader title="פרטי קשר" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 12 }}>
              <FormRow label="שם מלא" required hint={errors.full_name}>
                <TextInput
                  value={form.full_name}
                  onChange={v => set('full_name', v)}
                  placeholder="שם מלא של הלקוח"
                  error={!!errors.full_name}
                />
              </FormRow>

              <FormRow label="טלפון" required hint={errors.phone ?? 'מספר הטלפון ייחודי לכל לקוח בעסק'}>
                <TextInput
                  value={form.phone}
                  onChange={v => set('phone', v)}
                  placeholder="05X-XXX-XXXX"
                  error={!!errors.phone}
                />
              </FormRow>

              <FormRow label="אימייל">
                <TextInput
                  value={form.email ?? ''}
                  onChange={v => set('email', v)}
                  placeholder="example@email.com"
                />
              </FormRow>
            </div>
          </div>

          {/* Group 2 — כתובת */}
          <div>
            <SectionHeader title="כתובת" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 12 }}>
              <FormRow label="כתובת">
                <TextInput
                  value={form.address ?? ''}
                  onChange={v => set('address', v)}
                  placeholder="רחוב, מספר בית, דירה"
                />
              </FormRow>

              <FormRow label="עיר">
                <TextInput
                  value={form.city ?? ''}
                  onChange={v => set('city', v)}
                  placeholder="שם העיר"
                />
              </FormRow>
            </div>
          </div>

          {/* Group 3 — העדפות */}
          <div>
            <SectionHeader title="העדפות" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 12 }}>
              <FormRow label="ערוץ מועדף לתקשורת" required>
                <div style={{ display: 'flex', gap: 0, borderRadius: 8, overflow: 'hidden', border: '1px solid var(--md-outline-variant)' }}>
                  {CHANNEL_OPTIONS.map((ch, idx) => {
                    const active = form.preferred_channel === ch.value
                    return (
                      <button
                        key={ch.value}
                        onClick={() => set('preferred_channel', ch.value)}
                        style={{
                          flex: 1, height: 40, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                          background: active ? 'var(--md-secondary-container)' : 'var(--md-surface-container)',
                          color: active ? 'var(--md-on-secondary-container)' : 'var(--md-on-surface-variant)',
                          border: 'none',
                          borderInlineEnd: idx < CHANNEL_OPTIONS.length - 1 ? '1px solid var(--md-outline-variant)' : 'none',
                          cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: active ? 600 : 400,
                          transition: 'background 120ms',
                        }}
                      >
                        <span className="ms" style={{ fontSize: 18, fontVariationSettings: `'FILL' ${active ? 1 : 0}` }}>{ch.icon}</span>
                        {ch.label}
                      </button>
                    )
                  })}
                </div>
              </FormRow>

              {branches.length > 0 && (
                <FormRow label="סניף משויך" hint="הסניף שאחראי על לקוח זה">
                  <SelectInput
                    value={(form.branch_id ?? '') as string}
                    onChange={v => set('branch_id', v)}
                    options={[
                      { value: '', label: '— ללא סניף —' },
                      ...branches.map(b => ({ value: b.id, label: b.name })),
                    ]}
                  />
                </FormRow>
              )}

              <FormRow label="הערות">
                <textarea
                  value={form.notes ?? ''}
                  onChange={e => set('notes', e.target.value)}
                  placeholder="הערות חופשיות, העדפות, מידע רלוונטי..."
                  rows={3}
                  style={{
                    width: '100%', padding: '10px 12px', borderRadius: 8, resize: 'vertical',
                    background: 'var(--md-surface-container-lowest)',
                    border: '1px solid var(--md-outline-variant)',
                    fontFamily: 'inherit', fontSize: 13, color: 'var(--md-on-surface)',
                    outline: 'none', direction: 'rtl', boxSizing: 'border-box',
                    minHeight: 80,
                  }}
                />
              </FormRow>
            </div>
          </div>

          {/* Group 4 — סטטוס */}
          <div>
            <SectionHeader title="סטטוס" />
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              {(['active', 'inactive'] as CustomerStatus[]).map(s => {
                const active = form.status === s
                return (
                  <button
                    key={s}
                    onClick={() => set('status', s)}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      height: 36, padding: '0 16px', borderRadius: 999,
                      background: active ? 'var(--md-primary-container)' : 'var(--md-surface-container)',
                      color: active ? 'var(--md-on-primary-container)' : 'var(--md-on-surface-variant)',
                      border: active ? 'none' : '1px solid var(--md-outline-variant)',
                      cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: active ? 600 : 400,
                    }}
                  >
                    <span className="ms" style={{ fontSize: 16 }}>{active ? (s === 'active' ? 'check_circle' : 'cancel') : (s === 'active' ? 'check_circle' : 'cancel')}</span>
                    {s === 'active' ? 'פעיל' : 'לא פעיל'}
                  </button>
                )
              })}
            </div>
          </div>

          {globalError && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 14px', borderRadius: 8,
              background: 'var(--md-error-container)', color: 'var(--md-on-error-container)',
              fontSize: 13,
            }}>
              <span className="ms" style={{ fontSize: 18 }}>error</span>
              {globalError}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          height: 64, padding: '0 24px', flexShrink: 0,
          background: 'var(--md-surface-container-low)',
          borderTop: '1px solid var(--md-outline-variant)',
        }}>
          <button
            onClick={onClose}
            style={{
              height: 40, padding: '0 16px', borderRadius: 999,
              background: 'transparent', color: 'var(--md-on-surface-variant)', border: 'none',
              cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 500,
            }}
          >
            ביטול
          </button>
          <button
            onClick={handleSubmit}
            disabled={isPending}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              height: 40, padding: '0 20px', borderRadius: 999,
              background: isPending ? 'var(--md-surface-container)' : 'var(--md-primary)',
              color: isPending ? 'var(--md-on-surface-variant)' : 'var(--md-on-primary)',
              border: 'none', cursor: isPending ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit', fontSize: 13, fontWeight: 600,
              transition: 'background 150ms',
            }}
          >
            <span className="ms" style={{ fontSize: 18 }}>{isPending ? 'hourglass_top' : 'check'}</span>
            {isPending ? 'שומר...' : submitLabel}
          </button>
        </div>
      </div>
    </>
  )
}
