'use client'

import type React from 'react'

export function SectionHeader({
  title,
  count,
  sub,
  action,
}: {
  title: string
  count?: number
  sub?: string
  action?: React.ReactNode
}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      marginBottom: 12, gap: 12,
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <h3 style={{
          margin: 0, fontSize: 12, fontWeight: 700, letterSpacing: 0.6,
          textTransform: 'uppercase', color: 'var(--md-on-surface-variant)',
        }}>
          {title}
        </h3>
        {count != null && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            minWidth: 22, height: 20, padding: '0 6px', borderRadius: 6,
            background: 'var(--md-primary-container)', color: 'var(--md-on-primary-container)',
            fontSize: 11, fontWeight: 700,
          }}>
            <span className="num">{count}</span>
          </span>
        )}
        {sub && (
          <span style={{ fontSize: 12, color: 'var(--md-on-surface-variant)', fontWeight: 400 }}>
            ({sub})
          </span>
        )}
      </div>
      {action}
    </div>
  )
}

export function FormRow({
  label,
  required,
  children,
  hint,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
  hint?: string
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{
        fontSize: 12, fontWeight: 600, color: 'var(--md-on-surface-variant)',
        display: 'flex', alignItems: 'center', gap: 3,
      }}>
        {label}
        {required && (
          <span style={{ color: 'var(--md-error)', fontSize: 13, lineHeight: 1 }}>*</span>
        )}
      </label>
      {children}
      {hint && (
        <span style={{ fontSize: 11, color: 'var(--md-on-surface-variant)' }}>{hint}</span>
      )}
    </div>
  )
}

export function TextInput({
  value,
  onChange,
  onBlur,
  placeholder,
  disabled,
  mono,
  error,
}: {
  value: string
  onChange: (v: string) => void
  onBlur?: () => void
  placeholder?: string
  disabled?: boolean
  mono?: boolean
  error?: boolean
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      onBlur={onBlur}
      placeholder={placeholder}
      disabled={disabled}
      style={{
        width: '100%', height: 40, padding: '0 12px',
        borderRadius: 8,
        background: 'var(--md-surface-container-lowest)',
        border: `1px solid ${error ? 'var(--md-error)' : 'var(--md-outline-variant)'}`,
        fontFamily: mono ? "'Roboto Mono', monospace" : 'inherit',
        fontSize: 13,
        color: disabled ? 'var(--md-on-surface-variant)' : 'var(--md-on-surface)',
        outline: 'none', direction: 'rtl', boxSizing: 'border-box',
      }}
    />
  )
}

export function SelectInput<T extends string>({
  value,
  onChange,
  options,
  disabled,
}: {
  value: T
  onChange: (v: T) => void
  options: Array<{ value: T; label: string }>
  disabled?: boolean
}) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value as T)}
      disabled={disabled}
      style={{
        width: '100%', height: 40, padding: '0 12px',
        borderRadius: 8,
        background: 'var(--md-surface-container-lowest)',
        border: '1px solid var(--md-outline-variant)',
        fontFamily: 'inherit', fontSize: 13,
        color: 'var(--md-on-surface)', outline: 'none',
        cursor: 'pointer', direction: 'rtl', boxSizing: 'border-box',
      }}
    >
      {options.map(o => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  )
}
