'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { CustomerListItem } from '../../types'
import type { OrderListItem } from '../../../orders/types'
import { OrderHistoryTable } from './OrderHistoryTable'

const CHANNEL_LABEL: Record<string, string> = {
  whatsapp: 'WhatsApp',
  phone: 'טלפון',
  email: 'אימייל',
}
const CHANNEL_ICON: Record<string, { icon: string; color: string; bg: string }> = {
  whatsapp: { icon: 'chat',  color: '#fff',   bg: '#25D366' },
  phone:    { icon: 'call',  color: 'var(--md-secondary)', bg: 'var(--md-secondary-container)' },
  email:    { icon: 'mail',  color: '#2563EB', bg: 'rgba(59,130,246,0.12)' },
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function daysSince(iso: string) {
  const ms = Date.now() - new Date(iso).getTime()
  return Math.floor(ms / (1000 * 60 * 60 * 24))
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return name.slice(0, 2)
  return `${parts[0][0]}.${parts[parts.length - 1][0]}`
}

interface CustomerCardProps {
  customer: CustomerListItem
  role: string
  onEdit: () => void
  orders: OrderListItem[]
  ordersTotal: number
}

export function CustomerCard({ customer: c, role, onEdit, orders, ordersTotal }: CustomerCardProps) {
  const [activeTab, setActiveTab] = useState<'orders' | 'activity'>('orders')
  const router = useRouter()
  const canWrite = role === 'owner' || role === 'branch_manager'
  const ch = CHANNEL_ICON[c.preferred_channel] ?? CHANNEL_ICON.phone

  // Order stats — count is the accurate server total; sum is over the fetched
  // page (limit 200 in the loader, covers virtually all single-customer cases).
  const ordersSum = orders.reduce((acc, o) => acc + (o.total ?? 0), 0)
  const lastOrderAt = orders.length > 0 ? orders[0].created_at : null

  const DetailRow = ({ icon, label, value }: { icon: string; label: string; value: string }) => (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '8px 0' }}>
      <span className="ms" style={{ fontSize: 18, color: 'var(--md-on-surface-variant)', marginTop: 1, flexShrink: 0, fontVariationSettings: "'FILL' 0" }}>{icon}</span>
      <span style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.4, color: 'var(--md-on-surface-variant)', width: 84, flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 14, color: 'var(--md-on-surface)', flex: 1 }}>{value}</span>
    </div>
  )

  const StatRow = ({ label, value, sub }: { label: string; value: string; sub?: string }) => (
    <div style={{ padding: '12px 0', borderBottom: '1px solid var(--md-outline-variant)' }}>
      <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.4, color: 'var(--md-on-surface-variant)', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--md-on-surface-variant)', lineHeight: 1.2 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: 'var(--md-on-surface-variant)', marginTop: 2 }}>{sub}</div>}
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, height: 40 }}>
        <button
          onClick={() => router.back()}
          style={{
            width: 36, height: 36, borderRadius: 8,
            background: 'transparent', border: '1px solid var(--md-outline-variant)',
            cursor: 'pointer', color: 'var(--md-on-surface-variant)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <span className="ms ms-flip-rtl" style={{ fontSize: 20 }}>arrow_back</span>
        </button>
        <div style={{ width: 1, height: 16, background: 'var(--md-outline-variant)' }} />
        <nav style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: 'var(--md-on-surface-variant)' }}>
          <span style={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={() => router.push('/customers')}>לקוחות</span>
          <span className="ms" style={{ fontSize: 14 }}>chevron_left</span>
          <span style={{ color: 'var(--md-on-surface)', fontWeight: 500 }}>{c.full_name}</span>
        </nav>
      </div>

      {/* Header Card */}
      <div style={{
        background: 'var(--md-surface-container-low)',
        border: '1px solid var(--md-outline-variant)',
        borderRadius: 16, padding: 24,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg, #38656A 0%, #1B5E20 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 20, fontWeight: 700,
          }}>
            {initials(c.full_name)}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 22, fontWeight: 700, color: 'var(--md-on-surface)' }}>{c.full_name}</span>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{
                width: 24, height: 24, borderRadius: 6,
                background: ch.bg, color: ch.color,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span className="ms" style={{ fontSize: 14, fontVariationSettings: "'FILL' 1" }}>{ch.icon}</span>
              </span>
              <span className="num" style={{ fontSize: 14, fontWeight: 500, color: 'var(--md-on-surface)', direction: 'ltr', display: 'inline-block' }}>{c.phone}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, color: 'var(--md-on-surface-variant)' }}>
              {c.city && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span className="ms" style={{ fontSize: 16 }}>location_on</span>
                  {c.city}
                </span>
              )}
              {c.branch_name && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span className="ms" style={{ fontSize: 16 }}>storefront</span>
                  {c.branch_name}
                </span>
              )}
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span className="ms" style={{ fontSize: 14 }}>calendar_today</span>
                הצטרף ב-<span className="num" style={{ marginInlineStart: 2 }}>{formatDate(c.created_at)}</span>
                {' — לקוח מזה '}
                <span className="num" style={{ marginInlineStart: 2 }}>{daysSince(c.created_at)}</span> ימים
              </span>
            </div>
          </div>
        </div>
        {canWrite && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={onEdit}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                height: 40, padding: '0 16px', borderRadius: 999,
                background: 'transparent', color: 'var(--md-on-surface)',
                border: '1px solid var(--md-outline-variant)',
                cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 500,
              }}
            >
              <span className="ms" style={{ fontSize: 18 }}>edit</span>
              ערוך פרטים
            </button>
            <button style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              height: 40, padding: '0 16px', borderRadius: 999,
              background: 'var(--md-secondary-container)', color: 'var(--md-on-secondary-container)', border: 'none',
              cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 500,
            }}>
              <span className="ms" style={{ fontSize: 18 }}>send</span>
              שלח הודעה
            </button>
          </div>
        )}
      </div>

      {/* Two-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 24 }}>
        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* פרטי קשר */}
          <div style={{
            background: 'var(--md-surface-container-low)',
            border: '1px solid var(--md-outline-variant)',
            borderRadius: 16, padding: 24,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span className="ms" style={{ fontSize: 20, color: 'var(--md-primary)', fontVariationSettings: "'FILL' 1" }}>contact_page</span>
              <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--md-on-surface)' }}>פרטי קשר</span>
            </div>
            <div style={{ borderTop: '1px solid var(--md-outline-variant)', paddingTop: 12, display: 'flex', flexDirection: 'column' }}>
              <DetailRow icon="phone" label="טלפון" value={c.phone} />
              {c.email && <DetailRow icon="mail" label="אימייל" value={c.email} />}
              {(c.address || c.city) && <DetailRow icon="home" label="כתובת" value={[c.address, c.city].filter(Boolean).join(', ')} />}
              <DetailRow icon="chat" label="ערוץ מועדף" value={CHANNEL_LABEL[c.preferred_channel] ?? c.preferred_channel} />
              {c.branch_name && <DetailRow icon="storefront" label="סניף" value={c.branch_name} />}
            </div>
          </div>

          {/* הערות */}
          {c.notes && (
            <div style={{
              background: 'var(--md-surface-container-lowest)',
              border: '1px dashed var(--md-outline-variant)',
              borderRadius: 16, padding: 20,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <span className="ms" style={{ fontSize: 18, color: 'var(--md-on-surface-variant)', fontVariationSettings: "'FILL' 1" }}>notes</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--md-on-surface)' }}>הערות</span>
              </div>
              <p style={{ margin: 0, fontSize: 14, color: 'var(--md-on-surface-variant)', lineHeight: 1.7 }}>{c.notes}</p>
            </div>
          )}

          {/* היסטוריית הזמנות */}
          <div style={{
            background: 'var(--md-surface-container-low)',
            border: '1px solid var(--md-outline-variant)',
            borderRadius: 16, overflow: 'hidden',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center',
              background: 'var(--md-surface-container)',
              borderBottom: '1px solid var(--md-outline-variant)',
              height: 48,
            }}>
              {(['orders', 'activity'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    height: 48, padding: '0 20px', background: 'transparent',
                    border: 'none', borderBottom: activeTab === tab ? '2px solid var(--md-primary)' : '2px solid transparent',
                    cursor: 'pointer', fontFamily: 'inherit',
                    fontSize: 14, fontWeight: activeTab === tab ? 500 : 400,
                    color: activeTab === tab ? 'var(--md-primary)' : 'var(--md-on-surface-variant)',
                  }}
                >
                  <span className="ms" style={{ fontSize: 18, fontVariationSettings: `'FILL' ${activeTab === tab ? 1 : 0}` }}>
                    {tab === 'orders' ? 'receipt_long' : 'history'}
                  </span>
                  {tab === 'orders' ? 'הזמנות' : 'פעילות'}
                </button>
              ))}
            </div>
            {activeTab === 'orders' ? (
              <OrderHistoryTable orders={orders} />
            ) : (
              <div style={{
                padding: '48px 24px', textAlign: 'center',
                fontSize: 13, color: 'var(--md-on-surface-variant)',
              }}>
                יומן פעילות יתווסף בהמשך
              </div>
            )}
          </div>
        </div>

        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* נתוני לקוח */}
          <div style={{
            background: 'var(--md-surface-container-low)',
            border: '1px solid var(--md-outline-variant)',
            borderRadius: 16, padding: 20,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
              <span className="ms" style={{ fontSize: 18, color: 'var(--md-primary)', fontVariationSettings: "'FILL' 1" }}>insights</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--md-on-surface)' }}>נתוני לקוח</span>
            </div>
            <div style={{ borderTop: '1px solid var(--md-outline-variant)' }}>
              <StatRow
                label="סה״כ הזמנות"
                value={ordersTotal > 0 ? ordersTotal.toLocaleString('he-IL') : '0'}
                sub={ordersTotal > 0 ? undefined : 'טרם בוצעו הזמנות'}
              />
              <StatRow
                label="סכום כולל"
                value={`₪${ordersSum.toLocaleString('he-IL')}`}
                sub={ordersTotal > orders.length ? `מ-${orders.length} ההזמנות האחרונות` : undefined}
              />
              <div style={{ padding: '12px 0' }}>
                <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.4, color: 'var(--md-on-surface-variant)', marginBottom: 4 }}>הזמנה אחרונה</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--md-on-surface-variant)' }}>{lastOrderAt ? formatDate(lastOrderAt) : '—'}</div>
                {!lastOrderAt && <div style={{ fontSize: 11, color: 'var(--md-on-surface-variant)', marginTop: 2 }}>לא קיים עדיין</div>}
              </div>
            </div>
          </div>

          {/* מידע כללי */}
          <div style={{
            background: 'var(--md-surface-container-lowest)',
            border: '1px solid var(--md-outline-variant)',
            borderRadius: 16, padding: 20,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
              <span className="ms" style={{ fontSize: 18, color: 'var(--md-on-surface-variant)', fontVariationSettings: "'FILL' 0" }}>info</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--md-on-surface)' }}>מידע כללי</span>
            </div>
            <div style={{ borderTop: '1px solid var(--md-outline-variant)', display: 'flex', flexDirection: 'column', gap: 0 }}>
              {[
                { label: 'תאריך הצטרפות', value: formatDate(c.created_at) },
                { label: 'עדכון אחרון', value: formatDate(c.updated_at) },
                { label: 'מזהה לקוח', value: c.id.slice(0, 8).toUpperCase() },
              ].map(({ label, value }) => (
                <div key={label} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 0', borderBottom: '1px solid var(--md-outline-variant)',
                }}>
                  <span style={{ fontSize: 12, color: 'var(--md-on-surface-variant)' }}>{label}</span>
                  <span className="num" style={{ fontSize: 13, fontWeight: 500, color: 'var(--md-on-surface)', fontFamily: label === 'מזהה לקוח' ? 'monospace' : 'inherit' }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
