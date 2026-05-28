import Link from 'next/link'

export default function OrderNotFound() {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      minHeight: '60vh', gap: 16, textAlign: 'center', padding: 32,
    }}>
      <span className="ms" style={{
        fontSize: 64, color: 'var(--md-on-surface-variant)', opacity: 0.35,
        fontVariationSettings: "'FILL' 0, 'wght' 300, 'opsz' 48",
      }}>receipt_long</span>

      <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--md-on-surface)' }}>
        הזמנה לא נמצאה
      </div>
      <div style={{ fontSize: 14, color: 'var(--md-on-surface-variant)', maxWidth: 320 }}>
        ייתכן שההזמנה נמחקה, או שהקישור שגוי.
      </div>

      <Link href="/orders" style={{
        marginTop: 8,
        height: 40, padding: '0 20px', borderRadius: 999,
        background: 'var(--md-primary)', color: 'var(--md-on-primary)',
        display: 'inline-flex', alignItems: 'center', gap: 8,
        textDecoration: 'none', fontSize: 14, fontWeight: 500,
      }}>
        <span className="ms ms-flip-rtl" style={{ fontSize: 18 }}>arrow_back</span>
        חזרה להזמנות
      </Link>
    </div>
  )
}
