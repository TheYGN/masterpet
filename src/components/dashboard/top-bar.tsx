import type { Session } from '@/app/lib/definitions';

const DAYS_HE = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
const MONTHS_HE = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'];

function formatDateHe(date: Date) {
  const day = DAYS_HE[date.getDay()];
  const num = date.getDate();
  const month = MONTHS_HE[date.getMonth()];
  const year = date.getFullYear();
  return `יום ${day}, ${num} ב${month} ${year}`;
}

export function TopBar({ session }: { session: Session }) {
  const today = formatDateHe(new Date());

  return (
    <header
      dir="rtl"
      style={{
        height: 72, padding: '0 32px',
        display: 'flex', alignItems: 'center', gap: 24,
        background: 'var(--md-surface)',
        borderBottom: '1px solid var(--md-outline-variant)',
        position: 'sticky', top: 0, zIndex: 10,
      }}
    >
      {/* Right (start in RTL): store identity */}
      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 220 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--md-on-surface)', lineHeight: 1.3 }}>
          {session.tenant?.name ?? session.profile.email}
        </div>
        <div style={{ fontSize: 13, color: 'var(--md-on-surface-variant)', lineHeight: 1.3 }}>
          {today}
        </div>
      </div>

      {/* Center: search */}
      <div style={{ flex: 1, maxWidth: 560, margin: '0 auto', position: 'relative' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          height: 48, padding: '0 16px',
          background: 'var(--md-surface-container)',
          borderRadius: 999,
          color: 'var(--md-on-surface-variant)',
        }}>
          <span className="ms" style={{ fontSize: 22 }}>search</span>
          <input
            placeholder="חיפוש לקוחות, הזמנות, מוצרים…"
            readOnly
            style={{
              flex: 1, border: 'none', background: 'transparent', outline: 'none',
              fontFamily: 'inherit', fontSize: 14, color: 'var(--md-on-surface)',
              textAlign: 'right', cursor: 'text',
            }}
          />
          <kbd style={{
            fontFamily: 'inherit', fontSize: 11, fontWeight: 600,
            padding: '2px 6px', borderRadius: 4,
            background: 'var(--md-surface-container-high)',
            color: 'var(--md-on-surface-variant)',
            border: '1px solid var(--md-outline-variant)',
            direction: 'ltr',
          }}>⌘K</kbd>
        </div>
      </div>

      {/* Left (end in RTL): actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          title="עזרה"
          style={{
            width: 40, height: 40, borderRadius: '50%', border: 'none',
            background: 'transparent', cursor: 'pointer',
            color: 'var(--md-on-surface-variant)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 120ms ease',
          }}
        >
          <span className="ms" style={{ fontSize: 22 }}>help_outline</span>
        </button>
        <button
          title="התראות"
          style={{
            width: 40, height: 40, borderRadius: '50%', border: 'none',
            background: 'transparent', cursor: 'pointer',
            color: 'var(--md-on-surface-variant)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative',
            transition: 'background 120ms ease',
          }}
        >
          <span className="ms" style={{ fontSize: 22 }}>notifications</span>
        </button>
        <div style={{ width: 1, height: 28, background: 'var(--md-outline-variant)', margin: '0 4px' }} />
        <button
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '0 20px', height: 40, borderRadius: 999,
            background: 'var(--md-primary)', color: 'var(--md-on-primary)',
            border: 'none', cursor: 'pointer',
            fontFamily: 'inherit', fontSize: 14, fontWeight: 600,
          }}
        >
          <span className="ms" style={{ fontSize: 18 }}>add</span>
          <span>הזמנה חדשה</span>
        </button>
      </div>
    </header>
  );
}
