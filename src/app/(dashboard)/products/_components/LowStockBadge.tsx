/**
 * Shared badge — shows "מלאי נמוך" on ProductsList rows and other surfaces.
 */
export function LowStockBadge({ count }: { count?: number }) {
  return (
    <span
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 3,
        padding: '1px 6px', borderRadius: 6,
        background: 'var(--md-error-container)',
        color: 'var(--md-on-error-container)',
        fontSize: 10, fontWeight: 600, lineHeight: 1.3,
        whiteSpace: 'nowrap',
      }}
    >
      <span className="ms" style={{ fontSize: 12 }}>warning</span>
      {count != null ? <><span className="num">{count}</span> נמוך</> : 'מלאי נמוך'}
    </span>
  )
}
