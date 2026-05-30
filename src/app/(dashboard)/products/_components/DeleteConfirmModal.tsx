'use client'

import { useEffect, useState } from 'react'

interface DeleteConfirmModalProps {
  count: number
  onConfirm: () => void
  onCancel: () => void
  /** Dialog heading. Defaults to the products copy. */
  title?: string
  /** Body micro-copy builder (singular vs plural). Defaults to the products copy. */
  bodyText?: (count: number) => string
  /** Primary CTA label builder. Defaults to the products copy. */
  confirmLabel?: (count: number) => string
}

/**
 * Destructive-confirm dialog. DESIGN-SYSTEM §10 severity = Error:
 *   container bg --md-error-container, primary CTA bg --md-error.
 * Singular/plural micro-copy supplied by hebrew-rtl-expert.
 * Motion (§8): gentle scrim fade + 160ms scale-in, no bounce.
 *
 * Copy is parameterized (title/bodyText/confirmLabel) so other modules (e.g.
 * customers) can reuse it; the defaults preserve the original products copy.
 */
export function DeleteConfirmModal({
  count,
  onConfirm,
  onCancel,
  title: titleProp,
  bodyText,
  confirmLabel: confirmLabelProp,
}: DeleteConfirmModalProps) {
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const raf = requestAnimationFrame(() => setShown(true))
    return () => cancelAnimationFrame(raf)
  }, [])

  // Esc always cancels. Enter is intentionally NOT bound globally — for a
  // destructive dialog it must follow the focused button (native button
  // behavior), so a stray Enter never force-confirms.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onCancel])

  const isSingle = count === 1
  const title = titleProp ?? 'מחיקת מוצרים'
  const body = bodyText
    ? bodyText(count)
    : isSingle
      ? 'המוצר יימחק מהקטלוג. יהיו לך כמה שניות לבטל — אחרי זה המחיקה סופית.'
      : `${count} מוצרים יימחקו מהקטלוג. יהיו לך כמה שניות לבטל — אחרי זה המחיקה סופית.`
  const confirmLabel = confirmLabelProp
    ? confirmLabelProp(count)
    : isSingle
      ? 'מחק מוצר'
      : `מחק ${count} מוצרים`

  return (
    <div
      dir="rtl"
      onClick={onCancel}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 80,
        background: 'rgba(0,0,0,0.32)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: shown ? 1 : 0,
        transition: 'opacity 160ms ease',
        cursor: 'default',
      }}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-modal-title"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 'min(92vw, 420px)',
          padding: 24,
          borderRadius: 16,
          background: 'var(--md-error-container)',
          color: 'var(--md-on-error-container)',
          boxShadow: 'var(--shadow-3)',
          transform: shown ? 'scale(1)' : 'scale(0.96)',
          opacity: shown ? 1 : 0,
          transition: 'transform 160ms ease, opacity 160ms ease',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <span className="ms" style={{ fontSize: 26, color: 'var(--md-error)' }}>
            delete
          </span>
          <h2 id="delete-modal-title" style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>
            {title}
          </h2>
        </div>
        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5 }}>{body}</p>
        <div style={{ display: 'flex', justifyContent: 'flex-start', gap: 8, marginTop: 24 }}>
          <button
            onClick={onConfirm}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              height: 40,
              padding: '0 18px',
              borderRadius: 999,
              background: 'var(--md-error)',
              color: 'var(--md-on-error)',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            <span className="ms" style={{ fontSize: 18 }}>
              delete
            </span>
            {confirmLabel}
          </button>
          <button
            onClick={onCancel}
            autoFocus
            style={{
              height: 40,
              padding: '0 18px',
              borderRadius: 999,
              background: 'transparent',
              color: 'var(--md-on-error-container)',
              border: '1px solid var(--md-error)',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            ביטול
          </button>
        </div>
      </div>
    </div>
  )
}
