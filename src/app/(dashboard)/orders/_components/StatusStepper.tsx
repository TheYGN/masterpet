'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { OrderStatus } from '../types'
import { updateOrderStatusAction, cancelOrderAction } from '../actions'

// Statuses from which cancellation is allowed (mirrors ORDER_STATUS_TRANSITIONS on the server)
const CANCELLABLE: readonly OrderStatus[] = ['pending', 'confirmed', 'preparing']
import { getNextStatus, getStatusLabel } from './StatusBadge'

// ─── Step definitions ─────────────────────────────────────────────────────────

const STEPS: Array<{ status: OrderStatus; icon: string; label: string }> = [
  { status: 'pending',    icon: 'hourglass_empty', label: 'ממתין' },
  { status: 'confirmed',  icon: 'check_circle',    label: 'אושר' },
  { status: 'preparing',  icon: 'inventory_2',     label: 'בהכנה' },
  { status: 'in_transit', icon: 'local_shipping',  label: 'בדרך' },
  { status: 'delivered',  icon: 'done_all',        label: 'נמסר' },
]

type StepState = 'done' | 'current' | 'upcoming' | 'ghost'

function getStepState(stepStatus: OrderStatus, currentStatus: OrderStatus): StepState {
  if (currentStatus === 'cancelled') return 'ghost'
  const stepIdx = STEPS.findIndex(s => s.status === stepStatus)
  const curIdx  = STEPS.findIndex(s => s.status === currentStatus)
  if (stepIdx < curIdx) return 'done'
  if (stepIdx === curIdx) return 'current'
  return 'upcoming'
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  orderId: string
  status: OrderStatus
  lastUpdatedBy?: string
  lastUpdatedAt?: string
}

// ─── Main component ───────────────────────────────────────────────────────────

export function StatusStepper({ orderId, status, lastUpdatedBy, lastUpdatedAt }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const nextStatus = getNextStatus(status)
  const canCancel  = CANCELLABLE.includes(status)

  const advance = () => {
    if (!nextStatus) return
    setError(null)
    startTransition(async () => {
      const res = await updateOrderStatusAction(orderId, nextStatus)
      if (res.error) { setError(res.error); return }
      router.refresh()
    })
  }

  const cancel = () => {
    setError(null)
    startTransition(async () => {
      const res = await cancelOrderAction(orderId)
      if (res.error) { setError(res.error); return }
      router.refresh()
    })
  }

  const nextLabel = nextStatus ? getStatusLabel(nextStatus) : null

  return (
    <div style={{
      background: 'var(--md-surface-container-lowest)',
      border: '1px solid var(--md-outline-variant)',
      borderRadius: 16, padding: 24,
    }}>
      {/* Card header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span className="ms" style={{
          fontSize: 20, color: 'var(--md-primary)',
          fontVariationSettings: "'FILL' 1, 'wght' 500, 'opsz' 24",
        }}>timeline</span>
        <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--md-on-surface)' }}>
          מסלול ההזמנה
        </span>
      </div>

      {/* Stepper */}
      <div style={{
        marginTop: 24,
        display: 'flex', flexDirection: 'row-reverse', alignItems: 'flex-start',
      }}>
        {STEPS.map((step, i) => {
          const state = getStepState(step.status, status)
          const next  = STEPS[i + 1]
          return (
            <StepAndConnector
              key={step.status}
              step={step}
              state={state}
              nextState={next ? getStepState(next.status, status) : undefined}
            />
          )
        })}
      </div>

      {/* Error */}
      {error && (
        <div style={{
          marginTop: 12, padding: '8px 12px', borderRadius: 8,
          background: 'rgba(179,38,30,0.08)',
          border: '1px solid rgba(179,38,30,0.25)',
          fontSize: 12, color: 'var(--md-error)',
        }}>
          {error}
        </div>
      )}

      {/* CTA row */}
      {status !== 'delivered' && status !== 'cancelled' && (
        <div style={{
          marginTop: 24, paddingTop: 16,
          borderTop: '1px dashed var(--md-outline-variant)',
          display: 'flex', flexDirection: 'row-reverse', alignItems: 'center', gap: 12,
        }}>
          {nextLabel && (
            <button
              onClick={advance}
              disabled={isPending}
              style={{
                height: 40, padding: '0 20px', borderRadius: 999,
                background: 'var(--md-primary)', color: 'var(--md-on-primary)',
                border: 'none', cursor: isPending ? 'wait' : 'pointer',
                fontFamily: 'inherit', fontWeight: 500, fontSize: 14,
                display: 'inline-flex', alignItems: 'center', gap: 8,
                opacity: isPending ? 0.7 : 1,
              }}>
              <span className="ms" style={{ fontSize: 18 }}>arrow_forward</span>
              קדם לשלב הבא: {nextLabel}
            </button>
          )}

          {canCancel && (
            <button
              onClick={cancel}
              disabled={isPending}
              style={{
                height: 36, padding: '0 16px', borderRadius: 999,
                background: 'transparent',
                color: 'var(--md-error)',
                border: '1px solid rgba(179,38,30,0.35)',
                cursor: isPending ? 'wait' : 'pointer',
                fontFamily: 'inherit', fontWeight: 500, fontSize: 13,
                display: 'inline-flex', alignItems: 'center', gap: 6,
                opacity: isPending ? 0.7 : 1,
              }}>
              <span className="ms" style={{ fontSize: 16 }}>cancel</span>
              בטל הזמנה
            </button>
          )}

          <div style={{ flex: 1 }} />

          {lastUpdatedBy && lastUpdatedAt && (
            <div style={{
              fontSize: 12, color: 'var(--md-on-surface-variant)',
              display: 'inline-flex', alignItems: 'center', gap: 6,
            }}>
              <span className="ms" style={{ fontSize: 14 }}>person</span>
              <span>עודכן ע״י {lastUpdatedBy} · <span className="num">{lastUpdatedAt}</span></span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Step + Connector ─────────────────────────────────────────────────────────

function StepAndConnector({ step, state, nextState }: {
  step: { icon: string; label: string }
  state: StepState
  nextState?: StepState
}) {
  const isDone    = state === 'done'
  const isCurrent = state === 'current'
  const isGhost   = state === 'ghost'

  let circleBg: string
  let circleBorder: string
  let iconColor: string
  let iconFill: number

  if (isDone) {
    circleBg = 'var(--md-primary)'; circleBorder = '2px solid var(--md-primary)'
    iconColor = '#fff'; iconFill = 1
  } else if (isCurrent) {
    circleBg = 'var(--md-primary-container)'; circleBorder = '2px solid var(--md-primary)'
    iconColor = 'var(--md-primary)'; iconFill = 1
  } else if (isGhost) {
    circleBg = 'var(--md-surface-container)'; circleBorder = '1px dashed var(--md-outline-variant)'
    iconColor = 'var(--md-on-surface-variant)'; iconFill = 0
  } else {
    circleBg = 'var(--md-surface-container)'; circleBorder = '1.5px solid var(--md-outline-variant)'
    iconColor = 'var(--md-on-surface-variant)'; iconFill = 0
  }

  const labelColor  = isDone || isCurrent ? 'var(--md-primary)' : 'var(--md-on-surface-variant)'
  const labelWeight = isDone || isCurrent ? 600 : 500

  // Connector style after this step
  let connectorBg: string | undefined
  let connectorDashed = false
  let connectorOpacity = 1

  if (nextState) {
    if (isDone && (nextState === 'done' || nextState === 'current')) {
      connectorBg = 'var(--md-primary)'
    } else {
      connectorDashed = true
      if (nextState === 'ghost' || isGhost) connectorOpacity = 0.5
    }
  }

  return (
    <>
      {/* Step node */}
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: 8, minWidth: 72, flexShrink: 0,
        opacity: isGhost ? 0.4 : 1,
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          background: circleBg, border: circleBorder,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          boxSizing: 'border-box',
        }}>
          <span className="ms" style={{
            fontSize: 18, color: iconColor,
            fontVariationSettings: `'FILL' ${iconFill}, 'wght' ${iconFill ? 600 : 400}, 'opsz' 20`,
          }}>{step.icon}</span>
        </div>
        <div style={{
          fontSize: 11, fontWeight: labelWeight, color: labelColor,
          textAlign: 'center', lineHeight: 1.2,
        }}>
          {step.label}
        </div>
      </div>

      {/* Connector (right-to-left in RTL, visually between steps) */}
      {nextState && (
        <div style={{
          flex: 1, minWidth: 16,
          marginTop: 19,
          height: 2,
          opacity: connectorOpacity,
          ...(connectorBg
            ? { background: connectorBg }
            : {
                backgroundImage: 'linear-gradient(to right, var(--md-outline-variant) 50%, transparent 0)',
                backgroundSize: '8px 2px',
                backgroundRepeat: 'repeat-x',
                backgroundPosition: 'center',
              }
          ),
        }} />
      )}
    </>
  )
}
