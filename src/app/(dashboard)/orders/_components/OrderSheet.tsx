'use client'

import { useState, useTransition } from 'react'
import type { CustomerListItem } from '../../customers/types'
import type { ProductListItem } from '../../products/types'
import { listCustomersAction } from '../../customers/actions'
import { listProductsAction } from '../../products/actions'
import { createOrderAction, sendPaymentLinkAction } from '../actions'
import type { CreateOrderItemInput } from '../types'

// ─── Local types ─────────────────────────────────────────────────────────────

interface CartItem {
  localId: string
  variant_id: string | null
  product_name: string
  sku: string | null
  unit_price: number
  vat_rate: number
  quantity: number
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function computeTotals(items: CartItem[], discount: number) {
  const subtotal = items.reduce((s, i) => s + i.quantity * i.unit_price, 0)
  const rawVat = items.reduce((s, i) => s + i.quantity * i.unit_price * (i.vat_rate / 100), 0)
  const effectiveVat = subtotal > 0 ? rawVat * (subtotal - discount) / subtotal : 0
  const total = subtotal - discount + effectiveVat
  return { subtotal, vat: effectiveVat, total }
}

function customerInitials(name: string) {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2)
  return `${parts[0][0]}.${parts[parts.length - 1][0]}`
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  open: boolean
  branchId: string
  onClose: () => void
  onCreated: (orderId: string) => void
}

// ─── Main component ───────────────────────────────────────────────────────────

export function OrderSheet({ open, branchId, onClose, onCreated }: Props) {
  const [customer, setCustomer] = useState<CustomerListItem | null>(null)
  const [customerQuery, setCustomerQuery] = useState('')
  const [customerResults, setCustomerResults] = useState<CustomerListItem[]>([])
  const [showCustomerDrop, setShowCustomerDrop] = useState(false)

  const [items, setItems] = useState<CartItem[]>([])
  const [productQuery, setProductQuery] = useState('')
  const [productResults, setProductResults] = useState<ProductListItem[]>([])
  const [showProductDrop, setShowProductDrop] = useState(false)

  const [discount, setDiscount] = useState(0)
  const [notes, setNotes] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const { subtotal, vat, total } = computeTotals(items, discount)

  // Customer search
  const searchCustomers = (q: string) => {
    setCustomerQuery(q)
    if (!q.trim()) { setCustomerResults([]); return }
    startTransition(async () => {
      const res = await listCustomersAction({ search: q, limit: 8 })
      if (res.data) setCustomerResults(res.data.customers)
    })
  }

  // Product search
  const searchProducts = (q: string) => {
    setProductQuery(q)
    if (!q.trim()) { setProductResults([]); return }
    startTransition(async () => {
      const res = await listProductsAction({ search: q, limit: 8 })
      if (res.data) setProductResults(res.data)
    })
  }

  const addProduct = (p: ProductListItem) => {
    if (p.min_price == null) {
      setError('למוצר זה אין מחיר מוגדר — יש להגדיר מחיר בקטלוג המוצרים')
      return
    }
    setItems(prev => [...prev, {
      localId: crypto.randomUUID(),
      variant_id: null,
      product_name: p.name,
      sku: null,
      unit_price: p.min_price!,
      vat_rate: p.vat_rate,
      quantity: 1,
    }])
    setProductQuery('')
    setProductResults([])
    setShowProductDrop(false)
  }

  const removeItem = (localId: string) =>
    setItems(prev => prev.filter(i => i.localId !== localId))

  const updateQty = (localId: string, qty: number) => {
    if (qty < 1) return
    setItems(prev => prev.map(i => i.localId === localId ? { ...i, quantity: qty } : i))
  }

  const handleSubmit = (withLink: boolean) => {
    if (!customer) { setError('יש לבחור לקוח'); return }
    if (items.length === 0) { setError('יש להוסיף לפחות מוצר אחד'); return }
    setError(null)

    const orderItems: CreateOrderItemInput[] = items.map(i => ({
      variant_id: i.variant_id,
      product_name: i.product_name,
      sku: i.sku,
      quantity: i.quantity,
      unit_price: i.unit_price,
      vat_rate: i.vat_rate,
    }))

    startTransition(async () => {
      const res = await createOrderAction({
        customer_id: customer.id,
        branch_id: branchId,
        items: orderItems,
        discount: discount > 0 ? discount : undefined,
        notes: notes.trim() || undefined,
        source: 'manual',
      })

      if (res.error) { setError(res.error); return }

      if (withLink && res.data) {
        const linkRes = await sendPaymentLinkAction(res.data.orderId)
        if (linkRes.error) {
          setError(`ההזמנה נשמרה — שליחת קישור PayPlus נכשלה: ${linkRes.error}`)
          onCreated(res.data.orderId)
          return
        }
      }

      if (res.data) onCreated(res.data.orderId)
    })
  }

  if (!open) return null

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50 }}>
      {/* Scrim */}
      <div
        aria-hidden="true"
        onClick={onClose}
        style={{
          position: 'absolute', inset: 0,
          background: 'rgba(0,0,0,0.32)',
          backdropFilter: 'blur(2px)',
        }}
      />

      {/* Sheet panel */}
      <aside style={{
        position: 'absolute', insetInlineEnd: 0, top: 0,
        width: 520, height: '100%',
        background: 'var(--md-surface-container-lowest)',
        boxShadow: '-4px 0 24px rgba(0,0,0,0.15)',
        borderInlineStart: '1px solid var(--md-outline-variant)',
        display: 'flex', flexDirection: 'column',
        zIndex: 20,
      }}>
        {/* ── Header ── */}
        <header style={{
          height: 64, padding: '0 24px', flexShrink: 0,
          background: 'var(--md-surface-container-low)',
          borderBottom: '1px solid var(--md-outline-variant)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
            <button onClick={onClose} title="סגור" aria-label="סגור" style={{
              width: 40, height: 40, borderRadius: '50%', border: 'none',
              background: 'transparent', cursor: 'pointer',
              color: 'var(--md-on-surface-variant)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span className="ms" style={{ fontSize: 24 }}>close</span>
            </button>
            <div style={{ width: 1, height: 20, background: 'var(--md-outline-variant)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="ms" style={{
                fontSize: 20, color: 'var(--md-primary)',
                fontVariationSettings: "'FILL' 1, 'wght' 500, 'opsz' 20",
              }}>receipt_long</span>
              <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--md-on-surface)' }}>
                הזמנה חדשה
              </span>
            </div>
          </div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '4px 12px', borderRadius: 999,
            background: 'var(--md-surface-container)',
            border: '1px solid var(--md-outline-variant)',
          }}>
            <span className="ms" style={{ fontSize: 14, color: 'var(--md-on-surface-variant)' }}>store</span>
            <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--md-on-surface-variant)' }}>סניף</span>
          </div>
        </header>

        {/* ── Body ── */}
        <div style={{
          flex: 1, overflowY: 'auto', minHeight: 0,
          padding: 24,
          display: 'flex', flexDirection: 'column', gap: 24,
        }}>
          {error && (
            <div style={{
              padding: '10px 14px', borderRadius: 10,
              background: 'rgba(179,38,30,0.08)',
              border: '1px solid rgba(179,38,30,0.25)',
              fontSize: 13, color: 'var(--md-error)',
            }}>
              {error}
            </div>
          )}

          {/* Customer */}
          <section>
            <SectionLabel>לקוח</SectionLabel>
            {customer ? (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12,
                height: 56, padding: '0 14px 0 6px',
                borderRadius: 12,
                background: 'var(--md-primary-container)',
                border: '1px solid var(--md-primary)',
              }}>
                <Avatar name={customer.full_name} size={32} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--md-on-primary-container)', lineHeight: 1.3 }}>
                    {customer.full_name}
                  </div>
                  <div style={{ fontSize: 12, color: 'rgba(0,33,6,0.70)', lineHeight: 1.3 }}>
                    <span className="num">{customer.phone}</span>
                    {customer.city && ` · ${customer.city}`}
                  </div>
                </div>
                <button onClick={() => setCustomer(null)} title="נקה בחירה" style={{
                  width: 32, height: 32, borderRadius: '50%', border: 'none',
                  background: 'transparent', cursor: 'pointer',
                  color: 'var(--md-on-primary-container)',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span className="ms" style={{ fontSize: 18 }}>close</span>
                </button>
              </div>
            ) : (
              <div style={{ position: 'relative' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  height: 48, padding: '0 14px',
                  borderRadius: 12,
                  background: 'var(--md-surface-container-lowest)',
                  border: '1px solid var(--md-outline-variant)',
                }}>
                  <span className="ms" style={{ fontSize: 20, color: 'var(--md-on-surface-variant)' }}>
                    person_search
                  </span>
                  <input
                    value={customerQuery}
                    onChange={e => { searchCustomers(e.target.value); setShowCustomerDrop(true) }}
                    onFocus={() => setShowCustomerDrop(true)}
                    onBlur={() => setTimeout(() => setShowCustomerDrop(false), 150)}
                    placeholder="חיפוש לפי שם או טלפון..."
                    style={{
                      flex: 1, border: 'none', background: 'transparent', outline: 'none',
                      fontFamily: 'inherit', fontSize: 14, color: 'var(--md-on-surface)',
                      textAlign: 'right',
                    }}
                  />
                </div>
                {showCustomerDrop && customerResults.length > 0 && (
                  <div style={{
                    position: 'absolute', top: '100%', insetInlineStart: 0, insetInlineEnd: 0,
                    marginTop: 4, zIndex: 100,
                    background: 'var(--md-surface-container-lowest)',
                    border: '1px solid var(--md-outline-variant)',
                    borderRadius: 12, overflow: 'hidden',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                  }}>
                    {customerResults.map(c => (
                      <button
                        key={c.id}
                        onMouseDown={() => { setCustomer(c); setShowCustomerDrop(false); setCustomerQuery('') }}
                        style={{
                          width: '100%', padding: '10px 14px',
                          border: 'none', borderBottom: '1px solid var(--md-outline-variant)',
                          background: 'transparent', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', gap: 10,
                          textAlign: 'right', fontFamily: 'inherit',
                        }}>
                        <Avatar name={c.full_name} size={28} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--md-on-surface)' }}>
                            {c.full_name}
                          </div>
                          <div className="num" style={{ fontSize: 11, color: 'var(--md-on-surface-variant)' }}>
                            {c.phone}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Items */}
          <section>
            <SectionLabel>פריטים</SectionLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {items.map(item => (
                <CartItemRow
                  key={item.localId}
                  item={item}
                  onRemove={() => removeItem(item.localId)}
                  onQtyChange={qty => updateQty(item.localId, qty)}
                />
              ))}

              {/* Add product */}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowProductDrop(v => !v)}
                  style={{
                    width: '100%', background: 'transparent',
                    border: showProductDrop
                      ? '1.5px solid var(--md-primary)'
                      : '1.5px dashed var(--md-outline-variant)',
                    borderRadius: 12, padding: '14px 16px',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    cursor: 'pointer', fontFamily: 'inherit', color: 'var(--md-primary)',
                  }}>
                  <span className="ms" style={{
                    fontSize: 20, color: 'var(--md-primary)',
                    fontVariationSettings: "'FILL' 1, 'wght' 500, 'opsz' 20",
                  }}>add_circle</span>
                  <span style={{ fontSize: 14, fontWeight: 500 }}>הוסף מוצר</span>
                </button>

                {showProductDrop && (
                  <div style={{
                    position: 'absolute', top: '100%', insetInlineStart: 0, insetInlineEnd: 0,
                    marginTop: 4, zIndex: 100,
                    background: 'var(--md-surface-container-lowest)',
                    border: '1px solid var(--md-outline-variant)',
                    borderRadius: 12, overflow: 'hidden',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                  }}>
                    {/* Search input */}
                    <div style={{ padding: '8px', borderBottom: '1px solid var(--md-outline-variant)' }}>
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        height: 40, padding: '0 12px',
                        background: 'var(--md-surface-container-low)',
                        borderRadius: 8, color: 'var(--md-on-surface-variant)',
                      }}>
                        <span className="ms" style={{ fontSize: 18 }}>search</span>
                        <input
                          autoFocus
                          value={productQuery}
                          onChange={e => searchProducts(e.target.value)}
                          placeholder="חיפוש מוצר..."
                          style={{
                            flex: 1, border: 'none', background: 'transparent', outline: 'none',
                            fontFamily: 'inherit', fontSize: 13, color: 'var(--md-on-surface)',
                            textAlign: 'right',
                          }}
                        />
                        <button onClick={() => setShowProductDrop(false)} style={{
                          border: 'none', background: 'transparent', cursor: 'pointer',
                          color: 'var(--md-on-surface-variant)',
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <span className="ms" style={{ fontSize: 18 }}>close</span>
                        </button>
                      </div>
                    </div>

                    {/* Results */}
                    <div style={{ maxHeight: 240, overflowY: 'auto' }}>
                      {productResults.length === 0 && (
                        <div style={{
                          padding: '16px', fontSize: 13,
                          color: 'var(--md-on-surface-variant)', textAlign: 'center',
                        }}>
                          {productQuery.trim() ? 'לא נמצאו מוצרים' : 'הקלד שם מוצר לחיפוש...'}
                        </div>
                      )}
                      {productResults.map(p => (
                        <button
                          key={p.id}
                          onClick={() => addProduct(p)}
                          disabled={p.min_price == null}
                          style={{
                            width: '100%', height: 56, padding: '0 12px',
                            border: 'none', borderBottom: '1px solid var(--md-outline-variant)',
                            background: 'transparent', cursor: p.min_price == null ? 'not-allowed' : 'pointer',
                            display: 'flex', alignItems: 'center', gap: 10,
                            textAlign: 'right', fontFamily: 'inherit',
                            opacity: p.min_price == null ? 0.5 : 1,
                          }}>
                          <span style={{
                            width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                            background: 'var(--md-primary-container)',
                            color: 'var(--md-on-primary-container)',
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            <span className="ms" style={{ fontSize: 18 }}>pets</span>
                          </span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{
                              fontSize: 14, fontWeight: 500, color: 'var(--md-on-surface)',
                              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                            }}>{p.name}</div>
                            {p.low_stock && (
                              <div style={{ fontSize: 11, color: '#A65F00' }}>מלאי נמוך</div>
                            )}
                            {p.min_price == null && (
                              <div style={{ fontSize: 11, color: 'var(--md-error)' }}>אין מחיר מוגדר</div>
                            )}
                          </div>
                          {p.min_price != null && (
                            <span className="currency num" style={{
                              fontSize: 14, fontWeight: 600, color: 'var(--md-on-surface)', flexShrink: 0,
                            }}>
                              ₪{p.min_price.toLocaleString('he-IL', { minimumFractionDigits: 0 })}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Discount */}
          <section>
            <SectionLabel>הנחה (אופציונלי)</SectionLabel>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 160, height: 40, borderRadius: 8,
                border: '1px solid var(--md-outline-variant)',
                background: 'var(--md-surface-container-lowest)',
                padding: '0 12px',
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <input
                  type="number" min={0}
                  value={discount || ''}
                  onChange={e => setDiscount(Math.max(0, Number(e.target.value)))}
                  placeholder="0"
                  style={{
                    flex: 1, border: 'none', background: 'transparent', outline: 'none',
                    fontFamily: 'inherit', fontSize: 14, color: 'var(--md-on-surface)',
                    textAlign: 'right',
                  }}
                />
                <span style={{ fontSize: 14, color: 'var(--md-on-surface-variant)', fontWeight: 500 }}>₪</span>
              </div>
            </div>
          </section>

          {/* Notes */}
          <section>
            <SectionLabel>הערות</SectionLabel>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="הערות לאריזה, כתובת מסירה, זמן מועדף..."
              rows={3}
              style={{
                width: '100%', boxSizing: 'border-box',
                padding: '10px 12px', borderRadius: 12,
                background: 'var(--md-surface-container-lowest)',
                border: '1px solid var(--md-outline-variant)',
                fontSize: 14, lineHeight: 1.5, color: 'var(--md-on-surface)',
                fontFamily: 'inherit', resize: 'vertical', outline: 'none',
              }}
            />
          </section>
        </div>

        {/* ── Footer ── */}
        <footer style={{
          padding: '16px 24px', flexShrink: 0,
          background: 'var(--md-surface-container-low)',
          borderTop: '1px solid var(--md-outline-variant)',
          display: 'flex', flexDirection: 'column', gap: 12,
        }}>
          {/* Totals */}
          <div style={{
            background: 'var(--md-surface-container)',
            borderRadius: 12, padding: '14px 16px',
            display: 'flex', flexDirection: 'column', gap: 8,
          }}>
            <TotalsRow label="סה״כ לפני מע״מ" value={`₪${subtotal.toFixed(2)}`} />
            {discount > 0 && (
              <TotalsRow label="הנחה" value={`-₪${discount.toFixed(2)}`} color="var(--md-error)" />
            )}
            <TotalsRow label='מע"מ 18%' value={`₪${vat.toFixed(2)}`} />
            <div style={{ height: 1, background: 'var(--md-outline-variant)' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--md-on-surface)' }}>
                סה״כ לתשלום
              </span>
              <span className="currency num" style={{ fontSize: 18, fontWeight: 700, color: 'var(--md-primary)' }}>
                ₪{total.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 12 }}>
            <FooterBtn
              variant="filled"
              icon="check"
              label="שמור הזמנה"
              disabled={isPending}
              onClick={() => handleSubmit(false)}
            />
            <FooterBtn
              variant="tonal"
              icon="send"
              label="שמור ושלח PayPlus"
              disabled={isPending}
              onClick={() => handleSubmit(true)}
            />
          </div>
        </footer>
      </aside>
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: 12, fontWeight: 600, letterSpacing: 0.4, textTransform: 'uppercase',
      color: 'var(--md-on-surface-variant)', marginBottom: 8,
    }}>
      {children}
    </div>
  )
}

function Avatar({ name, size }: { name: string; size: number }) {
  const GRADS = [
    'linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%)',
    'linear-gradient(135deg, #38656A 0%, #1B5E20 100%)',
    'linear-gradient(135deg, #52634F 0%, #38656A 100%)',
    'linear-gradient(135deg, #2E7D32 0%, #52634F 100%)',
  ]
  let h = 0
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) & 0xffff
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: GRADS[h % GRADS.length], color: '#fff',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.34, fontWeight: 700, letterSpacing: 0.2,
    }}>
      {customerInitials(name)}
    </div>
  )
}

function CartItemRow({ item, onRemove, onQtyChange }: {
  item: CartItem
  onRemove: () => void
  onQtyChange: (qty: number) => void
}) {
  const lineTotal = item.quantity * item.unit_price
  return (
    <div style={{
      background: 'var(--md-surface-container-low)',
      border: '1px solid var(--md-outline-variant)',
      borderRadius: 12, padding: '12px 16px',
      display: 'flex', alignItems: 'flex-start', gap: 12,
    }}>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
            <span style={{
              fontSize: 14, fontWeight: 500, color: 'var(--md-on-surface)',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {item.product_name}
            </span>
            {/* Qty stepper */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
              <button
                onClick={() => onQtyChange(item.quantity - 1)}
                disabled={item.quantity <= 1}
                style={{
                  width: 22, height: 22, borderRadius: '50%', border: 'none',
                  background: 'var(--md-surface-container)', cursor: 'pointer',
                  color: 'var(--md-on-surface-variant)',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, opacity: item.quantity <= 1 ? 0.4 : 1,
                }}>−</button>
              <span style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                padding: '2px 8px', borderRadius: 6, minWidth: 36,
                background: 'var(--md-secondary-container)',
                color: 'var(--md-on-secondary-container)',
                fontSize: 12, fontWeight: 600,
              }}>
                <span className="num">×{item.quantity}</span>
              </span>
              <button
                onClick={() => onQtyChange(item.quantity + 1)}
                style={{
                  width: 22, height: 22, borderRadius: '50%', border: 'none',
                  background: 'var(--md-surface-container)', cursor: 'pointer',
                  color: 'var(--md-on-surface-variant)',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14,
                }}>+</button>
            </div>
          </div>
          <span className="currency num" style={{
            fontSize: 14, fontWeight: 600, color: 'var(--md-on-surface)', flexShrink: 0,
          }}>
            ₪{lineTotal.toLocaleString('he-IL', { minimumFractionDigits: 0 })}
          </span>
        </div>
        <div style={{ fontSize: 11, color: 'var(--md-on-surface-variant)' }}>
          <span className="currency num">₪{item.unit_price}/יחידה</span>
          {item.sku && <> · SKU: <span className="num" style={{ fontFamily: 'monospace' }}>{item.sku}</span></>}
        </div>
      </div>
      <button onClick={onRemove} title="הסר" style={{
        width: 32, height: 32, borderRadius: '50%', border: 'none',
        background: 'transparent', cursor: 'pointer',
        color: 'var(--md-on-surface-variant)',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <span className="ms" style={{ fontSize: 18 }}>delete</span>
      </button>
    </div>
  )
}

function TotalsRow({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: 13, color: 'var(--md-on-surface-variant)' }}>{label}</span>
      <span className="currency num" style={{ fontSize: 13, color: color ?? 'var(--md-on-surface)' }}>
        {value}
      </span>
    </div>
  )
}

function FooterBtn({ variant, icon, label, disabled, onClick }: {
  variant: 'filled' | 'tonal'
  icon: string
  label: string
  disabled: boolean
  onClick: () => void
}) {
  const bg = variant === 'filled' ? 'var(--md-primary)' : 'var(--md-secondary-container)'
  const color = variant === 'filled' ? 'var(--md-on-primary)' : 'var(--md-on-secondary-container)'
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        flex: 1, height: 48, borderRadius: 999,
        background: bg, color,
        border: 'none', cursor: disabled ? 'wait' : 'pointer',
        fontFamily: 'inherit', fontWeight: 600, fontSize: 14,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        opacity: disabled ? 0.7 : 1, whiteSpace: 'nowrap',
        transition: 'opacity 100ms ease',
      }}>
      <span>{label}</span>
      <span className="ms" style={{ fontSize: 20 }}>{icon}</span>
    </button>
  )
}
