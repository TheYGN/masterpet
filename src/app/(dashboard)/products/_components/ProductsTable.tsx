'use client'

import { useState, useTransition, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { ProductListItem, ProductStatus } from '../types'
import {
  bulkDeleteProductsAction,
  restoreProductsAction,
  duplicateProductAction,
} from '../actions'
import { createClient } from '@/lib/supabase/client'
import { LowStockBadge } from './LowStockBadge'
import { DeleteConfirmModal } from './DeleteConfirmModal'
import { ToastHost, type ToastSpec } from './Toast'

const COLS = '40px 60px 1fr 96px 88px 100px 132px 96px 88px'

/** Per-row collapse animation timing (DESIGN-SYSTEM §8 — gentle, not splashy). */
const ROW_ANIM_MS = 240
const ROW_STAGGER_MS = 30
/** Cap how many rows actually stagger so a 254-row wipe stays snappy. */
const MAX_STAGGERED_ROWS = 12
const UNDO_TOAST_MS = 6000

interface ProductsTableProps {
  products: ProductListItem[]
  total?: number
  page?: number
  onPageChange?: (page: number) => void
  onEdit?: (productId: string) => void
}

export function ProductsTable({
  products,
  total = products.length,
  page = 1,
  onPageChange,
  onEdit,
}: ProductsTableProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [bulkSelected, setBulkSelected] = useState<Set<string>>(new Set())
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  // --- Soft-delete UX state -------------------------------------------------
  /** Rows fully removed from view (optimistic). */
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set())
  /** Rows mid collapse-animation → ms delay each one started with. */
  const [animatingIds, setAnimatingIds] = useState<Map<string, number>>(new Map())
  /** Progress for the BulkBar while a delete is in flight. */
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null)
  const [toasts, setToasts] = useState<ToastSpec[]>([])
  /** Confirm modal — holds the ids pending confirmation. */
  const [confirm, setConfirm] = useState<{ ids: string[] } | null>(null)

  const toastSeq = useRef(0)
  /** ids this client itself just deleted — used to dedupe realtime echo. */
  const selfDeletedRef = useRef<Set<string>>(new Set())
  /**
   * Mirror of `removedIds` kept in a ref so the realtime handler (whose effect
   * only re-subscribes on `products`) always reads the *current* hidden set
   * rather than the value captured at subscribe time.
   */
  const removedIdsRef = useRef<Set<string>>(removedIds)
  /**
   * Mirror of `products` kept in a ref so the realtime handler can do its
   * visibility check against the *current* list without `products` being an
   * effect dependency — that lets the subscription mount once instead of
   * tearing down and re-joining (with a fresh async setAuth) on every change.
   */
  const productsRef = useRef<ProductListItem[]>(products)
  /** All timers spawned by a delete run — tracked so we can clear on unmount. */
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const clearProgressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Clear any in-flight delete timers if the component unmounts mid-animation
  // (e.g. user navigates away), so we never setState on an unmounted tree.
  useEffect(() => {
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
      if (progressTimerRef.current) clearInterval(progressTimerRef.current)
      if (clearProgressTimerRef.current) clearTimeout(clearProgressTimerRef.current)
    }
  }, [])

  // Keep the refs in lock-step with state/props for the realtime handler.
  useEffect(() => {
    removedIdsRef.current = removedIds
  }, [removedIds])
  useEffect(() => {
    productsRef.current = products
  }, [products])

  const pushToast = useCallback((t: Omit<ToastSpec, 'id'>): number => {
    const id = ++toastSeq.current
    setToasts((prev) => [...prev, { ...t, id }])
    return id
  }, [])

  const updateToast = useCallback((id: number, patch: Partial<ToastSpec>) => {
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)))
  }, [])

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toggleBulk = (id: string) => {
    setBulkSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const clearBulk = () => setBulkSelected(new Set())

  // Visible rows = source minus optimistically-removed ones.
  const visibleProducts = products.filter((p) => !removedIds.has(p.id))

  const toggleAll = () => {
    if (bulkSelected.size === visibleProducts.length) {
      clearBulk()
    } else {
      setBulkSelected(new Set(visibleProducts.map((p) => p.id)))
    }
  }

  // --- Undo toast (defined before runDelete so it can be a real dependency) --
  const showUndoToast = useCallback(
    (deletedIds: string[]) => {
      const count = deletedIds.length
      const toastId = pushToast({
        message: count === 1 ? 'המוצר נמחק' : `${count} מוצרים נמחקו`,
        duration: UNDO_TOAST_MS,
        action: {
          label: 'בטל',
          busyLabel: 'משחזר…',
          onClick: () => {
            updateToast(toastId, {
              action: {
                label: 'בטל',
                busyLabel: 'משחזר…',
                busy: true,
                onClick: () => {},
              },
            })
            startTransition(async () => {
              const res = await restoreProductsAction(deletedIds)
              if (!res.data) {
                updateToast(toastId, { action: undefined })
                dismissToast(toastId)
                pushToast({
                  message: 'לא הצלחנו לשחזר. רענן כדי לראות את המצב המעודכן.',
                  severity: 'error',
                  duration: 6000,
                })
                return
              }
              const { restoredIds } = res.data
              // Bring restored rows back into view immediately…
              setRemovedIds((prev) => {
                const next = new Set(prev)
                restoredIds.forEach((id) => next.delete(id))
                return next
              })
              restoredIds.forEach((id) => selfDeletedRef.current.delete(id))
              dismissToast(toastId)
              pushToast({
                message:
                  restoredIds.length === 1
                    ? 'המוצר שוחזר'
                    : `${restoredIds.length} מוצרים שוחזרו`,
                duration: 3500,
              })
              // …then resync with the server (revalidatePath already ran).
              router.refresh()
            })
          },
        },
      })
      // When the undo window closes the deletion is final; resync the list and
      // forget the echo-dedup ids so a future delete of the same product (after
      // some other user restores it) still surfaces a realtime toast.
      setTimeout(() => {
        deletedIds.forEach((id) => selfDeletedRef.current.delete(id))
        router.refresh()
      }, UNDO_TOAST_MS + 200)
    },
    [pushToast, updateToast, dismissToast, router]
  )

  // --- Core deletion flow (shared by single-row + bulk) ---------------------
  const runDelete = useCallback(
    (ids: string[]) => {
      if (ids.length === 0) return
      // Guard against overlapping runs: a second delete before the first one
      // settles would clobber the shared progress state and orphan timers.
      if (progress) return
      const total = ids.length

      // 1. Kick off the per-row collapse animation (staggered, capped).
      const starts = new Map<string, number>()
      ids.forEach((id, i) => {
        starts.set(id, Math.min(i, MAX_STAGGERED_ROWS) * ROW_STAGGER_MS)
      })
      setAnimatingIds((prev) => new Map([...prev, ...starts]))

      // 2. Optimistic progress: smoothly fill toward total as rows collapse.
      setProgress({ done: 0, total })

      // 3. After the longest animation, hide the rows for real.
      const lastDelay = Math.min(ids.length - 1, MAX_STAGGERED_ROWS) * ROW_STAGGER_MS
      const hideAfter = lastDelay + ROW_ANIM_MS
      const hideTimer = setTimeout(() => {
        setRemovedIds((prev) => new Set([...prev, ...ids]))
        setAnimatingIds((prev) => {
          const next = new Map(prev)
          ids.forEach((id) => next.delete(id))
          return next
        })
      }, hideAfter)
      hideTimerRef.current = hideTimer

      // Optimistic progress ticker — eases done→total across the animation.
      let tick = 0
      const ticks = Math.max(1, Math.ceil(hideAfter / 80))
      const progressTimer = setInterval(() => {
        tick++
        const done = Math.min(total, Math.round((tick / ticks) * total))
        setProgress((p) => (p ? { ...p, done } : p))
        if (tick >= ticks) clearInterval(progressTimer)
      }, 80)
      progressTimerRef.current = progressTimer

      ids.forEach((id) => selfDeletedRef.current.add(id))

      // 4. Fire the server action in the background.
      startTransition(async () => {
        const result = await bulkDeleteProductsAction(ids)

        clearTimeout(hideTimer)
        clearInterval(progressTimer)
        hideTimerRef.current = null
        progressTimerRef.current = null

        if (!result.data) {
          // Total failure — roll the rows back into view.
          setRemovedIds((prev) => {
            const next = new Set(prev)
            ids.forEach((id) => next.delete(id))
            return next
          })
          setAnimatingIds((prev) => {
            const next = new Map(prev)
            ids.forEach((id) => next.delete(id))
            return next
          })
          ids.forEach((id) => selfDeletedRef.current.delete(id))
          setProgress(null)
          pushToast({
            // Surface the server's explicit reason when present.
            message:
              result.error ?? 'המחיקה נכשלה. אף מוצר לא נמחק — אפשר לנסות שוב.',
            severity: 'error',
            duration: 6000,
          })
          return
        }

        const { deletedIds, failedIds } = result.data

        // Make sure deleted rows are hidden and snap progress to done=total.
        setRemovedIds((prev) => new Set([...prev, ...deletedIds]))
        setAnimatingIds((prev) => {
          const next = new Map(prev)
          ids.forEach((id) => next.delete(id))
          return next
        })
        // Roll back any rows the server reported as failed: they were never
        // added to removedIds (so no maxHeight:0 flash) and never marked as
        // animating here, so they simply stay in the list at full height. Then
        // re-select them so the BulkBar stays focused on what needs a retry.
        if (failedIds.length > 0) {
          setRemovedIds((prev) => {
            const next = new Set(prev)
            failedIds.forEach((id) => next.delete(id))
            return next
          })
          failedIds.forEach((id) => selfDeletedRef.current.delete(id))
          setBulkSelected(new Set(failedIds))
        } else {
          clearBulk()
        }
        setProgress({ done: deletedIds.length, total })
        // Let the filled bar read for a beat, then clear it.
        const clearTimer = setTimeout(() => {
          setProgress(null)
          clearProgressTimerRef.current = null
        }, 350)
        clearProgressTimerRef.current = clearTimer

        // Undo toast (only for the rows that actually got deleted).
        if (deletedIds.length > 0) {
          showUndoToast(deletedIds)
        }
        if (failedIds.length > 0 && deletedIds.length > 0) {
          pushToast({
            message: `${deletedIds.length} מתוך ${total} נמחקו, השאר נכשלו.`,
            severity: 'error',
            duration: 6000,
          })
        }
      })
    },
    [progress, pushToast, showUndoToast]
  )

  // --- Confirm-modal entry points -------------------------------------------
  const requestDelete = (ids: string[]) => {
    if (ids.length === 0) return
    setConfirm({ ids })
  }

  const handleConfirm = () => {
    if (!confirm) return
    const ids = confirm.ids
    setConfirm(null)
    runDelete(ids)
  }

  const handleDuplicate = (productId: string) => {
    startTransition(async () => {
      const result = await duplicateProductAction(productId)
      if (result.error) {
        pushToast({ message: result.error, severity: 'error', duration: 5000 })
      } else {
        router.refresh()
      }
    })
  }

  // --- Realtime: other users' deletes/restores ------------------------------
  useEffect(() => {
    const supabase = createClient()
    let channel: ReturnType<typeof supabase.channel> | null = null
    let cancelled = false

    // Realtime evaluates RLS on the postgres_changes stream against the JWT on
    // the socket. createBrowserClient only auto-wires realtime.setAuth on
    // SIGNED_IN / TOKEN_REFRESHED — NOT on the INITIAL_SESSION that fires when an
    // already-logged-in user loads the page. So with no explicit setAuth the
    // socket stays on the anon/publishable key and RLS blocks every row → no
    // events arrive. Pull the session JWT from cookies and set it before joining.
    const setup = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (cancelled) return
      if (session?.access_token) {
        await supabase.realtime.setAuth(session.access_token)
      }
      if (cancelled) return

      channel = supabase
        .channel('products-soft-delete')
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'products' },
          (payload) => {
            const newRow = payload.new as { id?: string; deleted_at?: string | null }
            const oldRow = payload.old as { id?: string; deleted_at?: string | null }
            const id = newRow?.id ?? oldRow?.id
            if (!id) return

            // NOTE: with RLS on, Supabase Realtime strips `payload.old` down to
            // the primary key, so `oldRow.deleted_at` is always undefined here. We
            // must decide solely from `new` + our local view of which rows hidden.
            const becameDeleted = !!newRow?.deleted_at
            // A restore is an UPDATE landing on deleted_at == null for a row this
            // client currently has hidden in `removedIds`. Plain edits (name/price)
            // also carry deleted_at == null, but their id is NOT hidden — so they
            // fall through and never trigger a refresh.
            const becameRestored = !newRow?.deleted_at && removedIdsRef.current.has(id)

            if (becameDeleted) {
              // Ignore the echo of our own delete.
              if (selfDeletedRef.current.has(id)) return
              // Only react if the row is actually visible in this list right now.
              const known = productsRef.current.some((p) => p.id === id)
              setRemovedIds((prev) => {
                if (!known || prev.has(id)) return prev
                pushToast({
                  message: 'מוצר הוסר על ידי משתמש אחר',
                  duration: 5000,
                })
                return new Set([...prev, id])
              })
            } else if (becameRestored) {
              // Ignore the echo of our own undo: when this client restores a row it
              // removes the id from selfDeletedRef *after* updating removedIds, so a
              // self-restore arrives with the id no longer in selfDeletedRef but also
              // no longer in removedIds — the becameRestored guard above won't fire.
              // A restore still in selfDeletedRef means another user restored a row
              // we deleted; let it through so the row comes back.
              setRemovedIds((prev) => {
                if (!prev.has(id)) return prev
                const next = new Set(prev)
                next.delete(id)
                return next
              })
              selfDeletedRef.current.delete(id)
              router.refresh()
            }
          }
        )
        .subscribe()
    }

    setup()

    return () => {
      cancelled = true
      if (channel) supabase.removeChannel(channel)
    }
    // Visibility/hidden checks read from refs, so this subscribes once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const totalPages = Math.max(1, Math.ceil(total / 20))

  return (
    <>
      {/* Table */}
      <div
        style={{
          background: 'var(--md-surface-container-low)',
          border: '1px solid var(--md-outline-variant)',
          borderRadius: 16,
          overflow: 'hidden',
          opacity: isPending && !progress ? 0.6 : 1,
          transition: 'opacity 150ms ease',
        }}
      >
        <TableHeader
          isAllSelected={
            bulkSelected.size > 0 && bulkSelected.size === visibleProducts.length
          }
          onToggleAll={toggleAll}
        />
        <div>
          {visibleProducts.map((p, i) => (
            <ProductRow
              key={p.id}
              product={p}
              index={i}
              last={i === visibleProducts.length - 1}
              hovered={hoveredId === p.id}
              selected={bulkSelected.has(p.id)}
              animDelay={animatingIds.get(p.id)}
              onHover={(id) => setHoveredId(id)}
              onToggle={toggleBulk}
              onDelete={(id) => requestDelete([id])}
              onDuplicate={handleDuplicate}
              onEdit={onEdit}
              onImageClick={setLightboxUrl}
            />
          ))}
          {visibleProducts.length === 0 && (
            <div
              style={{
                padding: '48px 24px',
                textAlign: 'center',
                color: 'var(--md-on-surface-variant)',
                fontSize: 14,
              }}
            >
              אין מוצרים התואמים לסינון
            </div>
          )}
        </div>
        <TableFooter
          total={total}
          page={page}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      </div>

      {/* Bulk selection bar — turns into a progress bar while deleting */}
      {(bulkSelected.size > 0 || progress) && (
        <BulkBar
          count={bulkSelected.size}
          progress={progress}
          onClear={clearBulk}
          onSelectAll={toggleAll}
          onDelete={() => requestDelete([...bulkSelected])}
        />
      )}

      {/* Confirm modal */}
      {confirm && (
        <DeleteConfirmModal
          count={confirm.ids.length}
          onConfirm={handleConfirm}
          onCancel={() => setConfirm(null)}
        />
      )}

      {/* Toasts (undo / errors / realtime) */}
      <ToastHost toasts={toasts} onDismiss={dismissToast} />

      {/* Lightbox */}
      {lightboxUrl && (
        <div
          onClick={() => setLightboxUrl(null)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            background: 'rgba(0,0,0,0.82)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'zoom-out',
          }}
        >
          <div onClick={(e) => e.stopPropagation()} style={{ position: 'relative', cursor: 'default' }}>
            <img
              src={lightboxUrl}
              alt="תמונת מוצר"
              style={{
                maxWidth: 'min(90vw, 900px)',
                maxHeight: '88vh',
                objectFit: 'contain',
                borderRadius: 12,
                boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
                display: 'block',
              }}
            />
            <button
              onClick={() => setLightboxUrl(null)}
              style={{
                position: 'absolute',
                top: -16,
                insetInlineEnd: -16,
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: 'rgba(30,30,30,0.85)',
                border: '1.5px solid rgba(255,255,255,0.18)',
                color: '#fff',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
              }}
            >
              <span className="ms" style={{ fontSize: 20 }}>
                close
              </span>
            </button>
          </div>
        </div>
      )}
    </>
  )
}

// ---- Table Header ----
function TableHeader({ isAllSelected, onToggleAll }: { isAllSelected?: boolean; onToggleAll?: () => void }) {
  const cells = [
    { label: '', sortable: false, align: 'center' },
    { label: 'תמונה', sortable: false, align: 'center' },
    { label: 'שם מוצר', sortable: true, align: 'start' },
    { label: 'חיה', sortable: false, align: 'start' },
    { label: 'Variants', sortable: false, align: 'center' },
    { label: 'מלאי', sortable: true, align: 'center' },
    { label: 'מחיר', sortable: true, align: 'start' },
    { label: 'סטטוס', sortable: false, align: 'center' },
    { label: 'פעולות', sortable: false, align: 'center' },
  ]
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: COLS,
        alignItems: 'center',
        background: 'var(--md-surface-container)',
        borderBottom: '1px solid var(--md-outline-variant)',
        height: 44,
        padding: '0 16px',
        gap: 12,
      }}
    >
      {cells.map((c, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: c.align === 'center' ? 'center' : 'flex-start',
            gap: 4,
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: 0.4,
            textTransform: 'uppercase',
            color: 'var(--md-on-surface-variant)',
            minWidth: 0,
          }}
        >
          {i === 0 ? (
            <span
              onClick={onToggleAll}
              style={{
                width: 18,
                height: 18,
                borderRadius: 4,
                border: `2px solid ${isAllSelected ? 'var(--md-primary)' : 'var(--md-outline)'}`,
                background: isAllSelected ? 'var(--md-primary)' : 'transparent',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              {isAllSelected && (
                <span className="ms" style={{ fontSize: 14, color: '#fff' }}>
                  check
                </span>
              )}
            </span>
          ) : (
            <>
              <span>{c.label}</span>
              {c.sortable && (
                <span className="ms" style={{ fontSize: 16, color: 'var(--md-outline-variant)' }}>
                  arrow_drop_down
                </span>
              )}
            </>
          )}
        </div>
      ))}
    </div>
  )
}

// ---- Product Row ----
interface ProductRowProps {
  product: ProductListItem
  index: number
  last: boolean
  hovered: boolean
  selected: boolean
  /** When set, this row is collapsing out; value = ms stagger delay. */
  animDelay?: number
  onHover: (id: string | null) => void
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onDuplicate: (id: string) => void
  onEdit?: (id: string) => void
  onImageClick?: (url: string) => void
}

function ProductRow({
  product: p,
  index,
  last,
  hovered,
  selected,
  animDelay,
  onHover,
  onToggle,
  onDelete,
  onDuplicate,
  onEdit,
  onImageClick,
}: ProductRowProps) {
  const isInactive = p.status === 'inactive' || p.status === 'discontinued'
  const isAnimating = animDelay !== undefined

  // Two-phase collapse: paint error bg + fade content, then collapse height.
  const [collapsed, setCollapsed] = useState(false)
  useEffect(() => {
    if (!isAnimating) return
    // Start the height collapse a touch after the fade begins.
    const t = setTimeout(() => setCollapsed(true), (animDelay ?? 0) + 90)
    return () => clearTimeout(t)
  }, [isAnimating, animDelay])

  let bg: string
  if (isAnimating) bg = 'var(--md-error-container)'
  else if (p.low_stock) bg = 'rgba(254,243,199,0.45)'
  else if (isInactive) bg = 'rgba(219,223,215,0.25)'
  else if (hovered) bg = 'var(--md-surface-container-high)'
  else bg = index % 2 === 0 ? 'var(--md-surface-container-lowest)' : 'var(--md-surface-container-low)'

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: COLS,
        alignItems: 'center',
        gap: 12,
        padding: collapsed ? '0 16px' : '0 16px',
        // Collapse via maxHeight/opacity so the grid row animates cleanly.
        maxHeight: collapsed ? 0 : 64,
        minHeight: collapsed ? 0 : 64,
        background: bg,
        borderBottom: last ? 'none' : '1px solid var(--md-outline-variant)',
        borderInlineStart: p.low_stock ? '3px solid var(--md-warning)' : '3px solid transparent',
        boxShadow: hovered && !isAnimating ? 'var(--shadow-1)' : 'none',
        overflow: 'hidden',
        opacity: collapsed ? 0 : isAnimating ? 0.55 : 1,
        transition: isAnimating
          ? `background 140ms ease, opacity 160ms ease, max-height ${ROW_ANIM_MS}ms ease, min-height ${ROW_ANIM_MS}ms ease`
          : 'background 120ms ease',
        transitionDelay: isAnimating ? `${animDelay}ms` : '0ms',
        cursor: isAnimating ? 'default' : 'pointer',
        pointerEvents: isAnimating ? 'none' : 'auto',
      }}
      onMouseEnter={() => !isAnimating && onHover(p.id)}
      onMouseLeave={() => !isAnimating && onHover(null)}
      onClick={() => !isAnimating && onEdit?.(p.id)}
    >
      {/* Checkbox */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <span
          onClick={(e) => {
            e.stopPropagation()
            onToggle(p.id)
          }}
          style={{
            width: 18,
            height: 18,
            borderRadius: 4,
            border: `2px solid ${selected ? 'var(--md-primary)' : hovered ? 'var(--md-primary)' : 'var(--md-outline)'}`,
            background: selected ? 'var(--md-primary)' : 'transparent',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          {selected && (
            <span className="ms" style={{ fontSize: 14, color: '#fff' }}>
              check
            </span>
          )}
        </span>
      </div>

      {/* Image */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 8,
            background: 'var(--md-surface-container)',
            border: '1px solid var(--md-outline-variant)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--md-secondary)',
            opacity: isInactive ? 0.5 : 1,
            flexShrink: 0,
            overflow: 'hidden',
          }}
        >
          {p.image_url ? (
            <img
              src={p.image_url}
              alt={p.name}
              onClick={(e) => {
                e.stopPropagation()
                onImageClick?.(p.image_url!)
              }}
              style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'zoom-in' }}
            />
          ) : (
            <span className="ms" style={{ fontSize: 22, fontVariationSettings: "'FILL' 1, 'wght' 400" }}>
              pets
            </span>
          )}
        </div>
      </div>

      {/* Name + tags */}
      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, gap: 2 }}>
        <span
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: isInactive ? 'var(--md-on-surface-variant)' : 'var(--md-on-surface)',
            lineHeight: 1.3,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {p.name}
        </span>
        {p.tags.length > 0 && (
          <span style={{ fontSize: 12, color: 'var(--md-on-surface-variant)', lineHeight: 1.3 }}>
            {p.tags.slice(0, 2).join(' · ')}
          </span>
        )}
      </div>

      {/* Animal chip */}
      <div>
        <AnimalChip type={p.animal_type} muted={isInactive} />
      </div>

      {/* Variants */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: 32,
            height: 22,
            padding: '0 8px',
            borderRadius: 8,
            background: 'var(--md-secondary-container)',
            color: 'var(--md-on-secondary-container)',
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          <span className="num">{p.variants_count}</span>
        </span>
        {p.low_stock && <LowStockBadge />}
      </div>

      {/* Stock */}
      <div style={{ textAlign: 'center' }}>
        <span
          style={{
            fontSize: 14,
            fontWeight: p.low_stock ? 600 : 500,
            color: p.low_stock
              ? 'var(--md-error)'
              : isInactive
                ? 'var(--md-on-surface-variant)'
                : 'var(--md-on-surface)',
          }}
        >
          <span className="num">{p.total_qty}</span> יח׳
        </span>
      </div>

      {/* Price */}
      <div
        style={{
          fontSize: 13,
          fontWeight: 500,
          color: isInactive ? 'var(--md-on-surface-variant)' : 'var(--md-on-surface)',
        }}
      >
        {p.min_price === null ? (
          <span style={{ color: 'var(--md-on-surface-variant)' }}>—</span>
        ) : p.max_price !== null ? (
          <span className="num" style={{ direction: 'ltr', unicodeBidi: 'isolate', display: 'inline-block' }}>
            ₪{p.min_price.toLocaleString('he-IL')} – ₪{p.max_price.toLocaleString('he-IL')}
          </span>
        ) : (
          <span className="num" style={{ direction: 'ltr', unicodeBidi: 'isolate', display: 'inline-block' }}>
            ₪{p.min_price.toLocaleString('he-IL')}
          </span>
        )}
      </div>

      {/* Status */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <StatusPill status={p.status} />
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
        {hovered ? (
          <>
            <RowIconBtn icon="edit" title="עריכה" onClick={() => onEdit?.(p.id)} />
            <RowIconBtn icon="content_copy" title="שכפול" onClick={() => onDuplicate(p.id)} />
            <RowIconBtn icon="delete" title="מחיקה" danger onClick={() => onDelete(p.id)} />
          </>
        ) : (
          <button
            style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              color: 'var(--md-on-surface-variant)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span className="ms" style={{ fontSize: 18 }}>
              more_vert
            </span>
          </button>
        )}
      </div>
    </div>
  )
}

// ---- Animal Chip ----
const ANIMAL_LABELS: Record<string, string> = {
  dog: 'כלב',
  cat: 'חתול',
  rodent: 'מכרסמים',
  bird: 'ציפורים',
  fish: 'דגים',
  reptile: 'זוחל',
  other: 'אחר',
}

function AnimalChip({ type, muted }: { type: string; muted: boolean }) {
  const isTertiary = type === 'cat'
  const bg = muted
    ? 'transparent'
    : isTertiary
      ? 'var(--md-tertiary-container)'
      : type === 'dog' || type === 'rodent' || type === 'bird' || type === 'fish' || type === 'reptile'
        ? 'var(--md-secondary-container)'
        : 'var(--md-surface-container)'
  const fg = muted
    ? 'var(--md-on-surface-variant)'
    : isTertiary
      ? 'var(--md-on-tertiary-container)'
      : 'var(--md-on-secondary-container)'
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '3px 10px',
        borderRadius: 8,
        background: bg,
        color: fg,
        border: muted ? '1px solid var(--md-outline-variant)' : 'none',
        fontSize: 12,
        fontWeight: 500,
        whiteSpace: 'nowrap',
      }}
    >
      <span className="ms" style={{ fontSize: 14 }}>
        pets
      </span>
      {ANIMAL_LABELS[type] ?? type}
    </span>
  )
}

// ---- Status Pill ----
function StatusPill({ status }: { status: ProductStatus }) {
  const styles: Record<ProductStatus, React.CSSProperties> = {
    active: { background: 'var(--md-primary)', color: 'var(--md-on-primary)', border: '1px solid var(--md-primary)' },
    inactive: {
      background: 'transparent',
      color: 'var(--md-on-surface-variant)',
      border: '1px solid var(--md-outline-variant)',
    },
    discontinued: {
      background: 'var(--md-surface-container)',
      color: 'var(--md-on-surface-variant)',
      border: '1px dashed var(--md-outline-variant)',
    },
  }
  const labels: Record<ProductStatus, string> = { active: 'פעיל', inactive: 'כבוי', discontinued: 'הופסק' }
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '3px 12px',
        borderRadius: 8,
        fontSize: 12,
        fontWeight: 500,
        letterSpacing: 0.1,
        whiteSpace: 'nowrap',
        ...styles[status],
      }}
    >
      {status === 'active' && <span style={{ width: 6, height: 6, borderRadius: 3, background: '#9BE9A8' }} />}
      {labels[status]}
    </span>
  )
}

// ---- Row Icon Button ----
function RowIconBtn({ icon, title, danger, onClick }: { icon: string; title: string; danger?: boolean; onClick: () => void }) {
  const [hov, setHov] = useState(false)
  return (
    <button
      title={title}
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: 28,
        height: 28,
        borderRadius: '50%',
        border: 'none',
        background: hov ? (danger ? 'var(--md-error-container)' : 'var(--md-surface-container)') : 'transparent',
        cursor: 'pointer',
        color: danger && hov ? 'var(--md-error)' : 'var(--md-on-surface-variant)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 120ms ease',
      }}
    >
      <span className="ms" style={{ fontSize: 18 }}>
        {icon}
      </span>
    </button>
  )
}

// ---- Table Footer ----
function TableFooter({
  total,
  page,
  totalPages,
  onPageChange,
}: {
  total: number
  page: number
  totalPages: number
  onPageChange?: (p: number) => void
}) {
  return (
    <div
      style={{
        height: 48,
        padding: '0 20px',
        background: 'var(--md-surface-container)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        borderTop: '1px solid var(--md-outline-variant)',
      }}
    >
      <div style={{ fontSize: 12, color: 'var(--md-on-surface-variant)' }}>
        מציג <span className="num">{total}</span> מוצרים
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <PageArrow disabled={page <= 1} onClick={() => onPageChange?.(page - 1)} icon="chevron_right" />
        <span style={{ fontSize: 12, fontWeight: 600, padding: '0 8px', color: 'var(--md-on-surface)' }}>
          <span className="num">{page}</span> / <span className="num">{totalPages}</span>
        </span>
        <PageArrow disabled={page >= totalPages} onClick={() => onPageChange?.(page + 1)} icon="chevron_left" />
      </div>
    </div>
  )
}

function PageArrow({ icon, disabled, onClick }: { icon: string; disabled: boolean; onClick: () => void }) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      style={{
        width: 28,
        height: 28,
        borderRadius: '50%',
        border: 'none',
        background: 'transparent',
        color: disabled ? 'var(--md-outline-variant)' : 'var(--md-on-surface-variant)',
        cursor: disabled ? 'default' : 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <span className="ms" style={{ fontSize: 18 }}>
        {icon}
      </span>
    </button>
  )
}

// ---- Bulk Selection Bar (doubles as delete-progress bar) ----
function BulkBar({
  count,
  progress,
  onClear,
  onSelectAll,
  onDelete,
}: {
  count: number
  progress: { done: number; total: number } | null
  onClear: () => void
  onSelectAll?: () => void
  onDelete?: () => void
}) {
  const deleting = !!progress
  const pct = deleting && progress.total > 0 ? Math.round((progress.done / progress.total) * 100) : 0
  const nearlyDone = deleting && progress.done >= progress.total

  return (
    <div
      dir="rtl"
      style={{
        position: 'fixed',
        bottom: 32,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 50,
        background: '#2E312E',
        color: '#F0F1EA',
        borderRadius: deleting ? 16 : 999,
        padding: deleting ? '12px 20px 14px' : '10px 16px',
        boxShadow: 'var(--shadow-3)',
        display: 'flex',
        flexDirection: deleting ? 'column' : 'row',
        alignItems: deleting ? 'stretch' : 'center',
        gap: deleting ? 8 : 16,
        minWidth: deleting ? 320 : undefined,
        transition: 'border-radius 160ms ease',
      }}
    >
      {deleting ? (
        <>
          <span style={{ fontSize: 14, fontWeight: 600, textAlign: 'center' }}>
            {nearlyDone ? (
              'כמעט סיימנו…'
            ) : (
              <>
                מוחק <span className="num">{progress.done}</span> מתוך{' '}
                <span className="num">{progress.total}</span>…
              </>
            )}
          </span>
          <div
            style={{
              height: 6,
              borderRadius: 3,
              background: 'rgba(255,255,255,0.12)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${pct}%`,
                background: 'var(--md-primary)',
                borderRadius: 3,
                transition: 'width 120ms ease',
              }}
            />
          </div>
        </>
      ) : (
        <>
          <button
            onClick={onClear}
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              border: 'none',
              background: 'rgba(255,255,255,0.08)',
              color: '#fff',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span className="ms" style={{ fontSize: 18 }}>
              close
            </span>
          </button>
          <span style={{ fontSize: 14, fontWeight: 600 }}>
            <span className="num">{count}</span> מוצרים נבחרו
          </span>
          <div style={{ flex: 1 }} />
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={onSelectAll}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                height: 32,
                padding: '0 14px',
                borderRadius: 999,
                background: 'rgba(255,255,255,0.10)',
                color: '#F0F1EA',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: 12,
                fontWeight: 500,
              }}
            >
              <span className="ms" style={{ fontSize: 16 }}>
                select_all
              </span>
              בחר הכל
            </button>
            {[
              { icon: 'toggle_on', label: 'הפעל' },
              { icon: 'toggle_off', label: 'כבה' },
            ].map(({ icon, label }) => (
              <button
                key={label}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  height: 32,
                  padding: '0 14px',
                  borderRadius: 999,
                  background: 'rgba(255,255,255,0.10)',
                  color: '#F0F1EA',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  fontSize: 12,
                  fontWeight: 500,
                }}
              >
                <span className="ms" style={{ fontSize: 16 }}>
                  {icon}
                </span>
                {label}
              </button>
            ))}
            <button
              onClick={onDelete}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                height: 32,
                padding: '0 14px',
                borderRadius: 999,
                background: 'rgba(179,38,30,0.20)',
                color: '#F9DEDC',
                border: '1px solid rgba(249,222,220,0.30)',
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: 12,
                fontWeight: 500,
              }}
            >
              <span className="ms" style={{ fontSize: 16 }}>
                delete
              </span>
              מחק
            </button>
          </div>
        </>
      )}
    </div>
  )
}
