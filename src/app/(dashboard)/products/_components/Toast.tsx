'use client'

import { useEffect, useState } from 'react'

export type ToastSeverity = 'neutral' | 'error'

export interface ToastAction {
  label: string
  onClick: () => void
  /** While true the action button shows a busy label and is disabled. */
  busy?: boolean
  /** Replaces the label while busy (e.g. "משחזר…"). */
  busyLabel?: string
}

export interface ToastSpec {
  id: number
  message: string
  severity?: ToastSeverity
  /** ms before auto-dismiss. 0 / undefined → sticky until manually closed. */
  duration?: number
  action?: ToastAction
}

/**
 * Single dark snackbar (Material 3 snackbar feel — DESIGN-SYSTEM §motion: subtle,
 * functional). Slides up + fades in on mount, fades out on dismiss. RTL aware.
 */
function ToastItem({ toast, onDismiss }: { toast: ToastSpec; onDismiss: (id: number) => void }) {
  const [shown, setShown] = useState(false)

  useEffect(() => {
    // next frame → trigger enter transition
    const raf = requestAnimationFrame(() => setShown(true))
    return () => cancelAnimationFrame(raf)
  }, [])

  useEffect(() => {
    if (!toast.duration || toast.action?.busy) return
    const t = setTimeout(() => onDismiss(toast.id), toast.duration)
    return () => clearTimeout(t)
  }, [toast.id, toast.duration, toast.action?.busy, onDismiss])

  const isError = toast.severity === 'error'
  const action = toast.action

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        minWidth: 280,
        maxWidth: 'min(92vw, 480px)',
        padding: action ? '8px 8px 8px 20px' : '12px 20px',
        borderRadius: 12,
        background: isError ? 'var(--md-error-container)' : '#2E312E',
        color: isError ? 'var(--md-on-error-container)' : '#F0F1EA',
        boxShadow: 'var(--shadow-3)',
        fontSize: 14,
        fontWeight: 500,
        opacity: shown ? 1 : 0,
        transform: shown ? 'translateY(0)' : 'translateY(8px)',
        transition: 'opacity 160ms ease, transform 160ms ease',
        pointerEvents: 'auto',
      }}
    >
      {isError && (
        <span className="ms" style={{ fontSize: 20, flexShrink: 0 }}>
          error
        </span>
      )}
      <span style={{ flex: 1, lineHeight: 1.4 }}>{toast.message}</span>
      {action && (
        <button
          onClick={() => {
            if (action.busy) return
            action.onClick()
          }}
          disabled={action.busy}
          style={{
            flexShrink: 0,
            height: 32,
            padding: '0 14px',
            borderRadius: 999,
            border: 'none',
            background: isError ? 'transparent' : 'rgba(255,255,255,0.12)',
            color: isError ? 'var(--md-error)' : '#A8D5B5',
            fontFamily: 'inherit',
            fontSize: 13,
            fontWeight: 600,
            cursor: action.busy ? 'default' : 'pointer',
            opacity: action.busy ? 0.7 : 1,
            transition: 'background 120ms ease',
          }}
        >
          {action.busy ? action.busyLabel ?? action.label : action.label}
        </button>
      )}
    </div>
  )
}

/**
 * Bottom-center stacked toast host. Render once near the table root and feed it
 * the live toast list + a dismiss callback. Stays clear of the BulkBar (which
 * lives at bottom: 32) by sitting above it when both are visible.
 */
export function ToastHost({
  toasts,
  onDismiss,
}: {
  toasts: ToastSpec[]
  onDismiss: (id: number) => void
}) {
  if (toasts.length === 0) return null
  return (
    <div
      dir="rtl"
      style={{
        position: 'fixed',
        bottom: 96,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 70,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        pointerEvents: 'none',
      }}
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  )
}
