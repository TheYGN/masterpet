import { notFound } from 'next/navigation'
import Link from 'next/link'
import { requireActiveTenant } from '@/app/lib/dal'
import { getOrderAction } from '../actions'
import { StatusStepper } from '../_components/StatusStepper'
import { OrderStatusBadge, PaymentStatusBadge, SourceDot } from '../_components/StatusBadge'
import { PaymentActions } from './_components/PaymentActions'

const SOURCE_LABELS: Record<string, string> = {
  manual: 'ידני', woocommerce: 'WooCommerce', whatsapp: 'WhatsApp',
  subscription_auto: 'מנוי אוטומטי',
}
const ORDER_TYPE_LABELS: Record<string, string> = {
  one_time: 'חד-פעמי', subscription: 'מנוי',
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  await requireActiveTenant()

  const result = await getOrderAction(id)
  if (!result.data) notFound()

  const { order, items, customer } = result.data

  const createdAtStr = new Date(order.created_at).toLocaleString('he-IL', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: false,
  })
  const shortId = order.id.slice(0, 6).toUpperCase()

  return (
    <div style={{ padding: '24px 32px 48px', display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24 }}>
        {/* Breadcrumb + title */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Link href="/orders" style={{
              width: 32, height: 32, borderRadius: '50%',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--md-on-surface-variant)', textDecoration: 'none',
            }}>
              <span className="ms ms-flip-rtl" style={{ fontSize: 20 }}>arrow_back</span>
            </Link>
            <span style={{ fontSize: 13, color: 'var(--md-on-surface-variant)' }}>הזמנות</span>
            <span className="ms ms-flip-rtl" style={{ fontSize: 16, color: 'var(--md-on-surface-variant)', opacity: 0.6 }}>
              chevron_left
            </span>
            <span className="num" style={{ fontSize: 13, color: 'var(--md-on-surface)', fontWeight: 600 }}>
              #{shortId}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--md-on-surface)', lineHeight: 1.2 }}>
              הזמנה <span className="num">#{shortId}</span>
            </div>
            <SourceDot source={order.source} />
            <span style={{ fontSize: 13, color: 'var(--md-on-surface-variant)' }}>
              נוצרה <span className="num">{createdAtStr}</span>
            </span>
          </div>
        </div>

        {/* Current status badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <OrderStatusBadge status={order.status} />
          <PaymentStatusBadge status={order.payment_status} />
        </div>
      </div>

      {/* Two-column layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 460px',
        direction: 'rtl',
        gap: 24,
        alignItems: 'start',
      }}>
        {/* Main column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>
          {/* Status stepper */}
          <StatusStepper
            orderId={order.id}
            status={order.status}
            lastUpdatedAt={new Date(order.updated_at).toLocaleString('he-IL', {
              day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false,
            })}
          />

          {/* Items card */}
          <div style={{
            background: 'var(--md-surface-container-lowest)',
            border: '1px solid var(--md-outline-variant)',
            borderRadius: 16, padding: 24,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className="ms" style={{
                fontSize: 20, color: 'var(--md-secondary)',
                fontVariationSettings: "'FILL' 1, 'wght' 500, 'opsz' 24",
              }}>receipt</span>
              <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--md-on-surface)' }}>פריטים</span>
              <div style={{ flex: 1 }} />
              <span style={{ fontSize: 13, color: 'var(--md-on-surface-variant)' }}>
                <span className="num">{items.length}</span> פריטים
              </span>
            </div>

            {/* Items table */}
            <div style={{ marginTop: 16 }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(0,1fr) 80px 130px 130px',
                gap: 16, padding: '8px 0',
                borderBottom: '1px solid var(--md-outline-variant)',
                fontSize: 11, fontWeight: 600, letterSpacing: 0.4, textTransform: 'uppercase',
                color: 'var(--md-on-surface-variant)',
              }}>
                <div>מוצר</div>
                <div style={{ textAlign: 'center' }}>כמות</div>
                <div>מחיר יחידה</div>
                <div>סה״כ</div>
              </div>

              {items.map((item, i) => (
                <div key={item.id} style={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(0,1fr) 80px 130px 130px',
                  gap: 16, padding: '14px 0',
                  borderBottom: i === items.length - 1 ? 'none' : '1px solid var(--md-outline-variant)',
                  alignItems: 'center',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 10, flexShrink: 0,
                      background: 'var(--md-surface-container)',
                      border: '1px solid var(--md-outline-variant)',
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      color: 'var(--md-on-surface-variant)',
                    }}>
                      <span className="ms" style={{ fontSize: 22, fontVariationSettings: "'FILL' 1, 'wght' 500" }}>
                        pets
                      </span>
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{
                        fontSize: 14, fontWeight: 500, color: 'var(--md-on-surface)',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      }}>{item.product_name}</div>
                      <div style={{ fontSize: 11, color: 'var(--md-on-surface-variant)', marginTop: 1 }}>
                        {item.sku && <span>SKU: <span className="num">{item.sku}</span></span>}
                        {item.variant_desc && <span> · {item.variant_desc}</span>}
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <span className="num" style={{
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      minWidth: 32, height: 28, padding: '0 10px', borderRadius: 999,
                      background: 'var(--md-surface-container)',
                      fontSize: 13, fontWeight: 600, color: 'var(--md-on-surface)',
                    }}>{item.quantity}</span>
                  </div>
                  <div className="currency num" style={{ fontSize: 14, color: 'var(--md-on-surface)' }}>
                    ₪{item.unit_price.toFixed(2)}
                  </div>
                  <div className="currency num" style={{ fontSize: 14, fontWeight: 600, color: 'var(--md-on-surface)' }}>
                    ₪{item.total_price.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <TotalsRow label="סה״כ לפני מע״מ" value={`₪${order.subtotal.toFixed(2)}`} />
              {order.discount > 0 && (
                <TotalsRow label="הנחה" value={`-₪${order.discount.toFixed(2)}`} color="var(--md-error)" />
              )}
              <TotalsRow label='מע"מ' value={`₪${order.vat_amount.toFixed(2)}`} />
              <div style={{ width: 320, height: 1, background: 'var(--md-outline-variant)', margin: '4px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', maxWidth: 320 }}>
                <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--md-on-surface)' }}>סה״כ לתשלום</span>
                <span className="currency num" style={{ fontSize: 22, fontWeight: 700, color: 'var(--md-primary)' }}>
                  ₪{order.total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Notes card — only if there are notes */}
          {order.notes && (
            <div style={{
              background: 'var(--md-surface-container-lowest)',
              border: '1px solid var(--md-outline-variant)',
              borderRadius: 16, padding: 24,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className="ms" style={{
                  fontSize: 20, color: 'var(--md-secondary)',
                  fontVariationSettings: "'FILL' 1, 'wght' 500, 'opsz' 24",
                }}>notes</span>
                <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--md-on-surface)' }}>הערות</span>
              </div>
              <div style={{
                marginTop: 12, fontSize: 14, color: 'var(--md-on-surface)',
                background: 'var(--md-surface-container)',
                borderRadius: 12, padding: '12px 16px',
                borderInlineStart: '3px solid var(--md-secondary)',
              }}>
                {order.notes}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Customer card */}
          <div style={{
            background: 'var(--md-surface-container-lowest)',
            border: '1px solid var(--md-outline-variant)',
            borderRadius: 16, padding: 20,
          }}>
            <div style={{
              fontSize: 11, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase',
              color: 'var(--md-on-surface-variant)', marginBottom: 14,
            }}>פרטי לקוח</div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
                background: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%)',
                color: '#fff',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 700, letterSpacing: 0.5,
              }}>
                {customer.full_name.slice(0, 2)}
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--md-on-surface)' }}>
                  {customer.full_name}
                </div>
              </div>
            </div>

            <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column' }}>
              {customer.phone && <KVRow k="טלפון" value={<span className="num">{customer.phone}</span>} />}
              {customer.address && <KVRow k="כתובת" value={customer.address} />}
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
              <Link href={`/customers/${customer.id}`} style={{
                height: 36, padding: '0 14px', borderRadius: 999,
                background: 'transparent', color: 'var(--md-primary)',
                border: '1px solid var(--md-outline)',
                display: 'inline-flex', alignItems: 'center', gap: 6,
                textDecoration: 'none', fontSize: 13, fontWeight: 500,
              }}>
                <span className="ms" style={{ fontSize: 16 }}>open_in_new</span>
                כרטיס לקוח
              </Link>
            </div>
          </div>

          {/* Payment card */}
          <div style={{
            background: 'var(--md-surface-container-lowest)',
            border: '1px solid var(--md-outline-variant)',
            borderRadius: 16, padding: 20,
          }}>
            <div style={{
              fontSize: 11, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase',
              color: 'var(--md-on-surface-variant)', marginBottom: 14,
            }}>סטטוס תשלום</div>
            <PaymentActions
              orderId={order.id}
              total={order.total}
              paymentStatus={order.payment_status}
              paymentLink={order.payment_link}
              payplusRef={order.payplus_ref}
            />
          </div>

          {/* Order meta card */}
          <div style={{
            background: 'var(--md-surface-container-lowest)',
            border: '1px solid var(--md-outline-variant)',
            borderRadius: 16, padding: 20,
          }}>
            <div style={{
              fontSize: 11, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase',
              color: 'var(--md-on-surface-variant)', marginBottom: 14,
            }}>פרטי הזמנה</div>
            <KVRow k="מספר הזמנה" value={<span className="num">#{shortId}</span>} />
            <KVRow k="נוצרה ב" value={<span className="num">{createdAtStr}</span>} />
            <KVRow k="ערוץ מקור" value={
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <SourceDot source={order.source} />
                {SOURCE_LABELS[order.source] ?? order.source}
              </span>
            } />
            <KVRow k="סוג הזמנה" value={ORDER_TYPE_LABELS[order.order_type] ?? order.order_type} />
            {order.delivery_date && (
              <KVRow k="תאריך מסירה" value={
                <span style={{
                  color: 'var(--md-on-primary-container)', fontWeight: 600,
                  background: 'var(--md-primary-container)', padding: '2px 10px', borderRadius: 999,
                }} className="num">
                  {new Date(order.delivery_date).toLocaleDateString('he-IL')}
                </span>
              } />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Shared sub-components ────────────────────────────────────────────────────

function TotalsRow({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', maxWidth: 320 }}>
      <span style={{ fontSize: 13, color: 'var(--md-on-surface-variant)' }}>{label}</span>
      <span className="currency num" style={{ fontSize: 13, color: color ?? 'var(--md-on-surface)' }}>{value}</span>
    </div>
  )
}

function KVRow({ k, value }: { k: string; value: React.ReactNode }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: 12, padding: '8px 0',
      borderBottom: '1px solid var(--md-outline-variant)',
    }}>
      <span style={{
        fontSize: 11, fontWeight: 600, letterSpacing: 0.4, textTransform: 'uppercase',
        color: 'var(--md-on-surface-variant)',
      }}>{k}</span>
      <span style={{ fontSize: 13, color: 'var(--md-on-surface)', fontWeight: 500 }}>{value}</span>
    </div>
  )
}
