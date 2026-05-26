export function OrderHistoryTable() {
  return (
    <div style={{
      padding: '56px 24px',
      display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 16,
    }}>
      <span className="ms" style={{
        fontSize: 64, color: 'var(--md-outline)',
        fontVariationSettings: "'FILL' 0, 'wght' 300",
      }}>receipt_long</span>
      <div>
        <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--md-on-surface)' }}>אין הזמנות עדיין</div>
        <div style={{ fontSize: 14, color: 'var(--md-on-surface-variant)', marginTop: 4, maxWidth: 320 }}>
          הזמנות הלקוח יופיעו כאן לאחר ביצוע ההזמנה הראשונה
        </div>
      </div>
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        height: 28, padding: '0 12px', borderRadius: 999,
        background: 'var(--md-surface-container)', border: '1px solid var(--md-outline-variant)',
        fontSize: 12, color: 'var(--md-on-surface-variant)',
      }}>
        <span className="ms" style={{ fontSize: 14 }}>schedule</span>
        יופעל לאחר הטמעת מודול ההזמנות
      </div>
    </div>
  )
}
