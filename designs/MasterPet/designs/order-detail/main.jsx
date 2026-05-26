// ============ Main App — Order Detail #1041 ============

const { useState: useAppState } = React;

function App() {
  const [selectedNav, setSelectedNav] = useAppState('orders');

  return (
    <div data-screen-label="Order Detail #1041" style={{ display: 'flex', flexDirection: 'row-reverse', minHeight: '100vh', width: 1440, margin: '0 auto', background: 'var(--md-surface)' }}>
      <NavRail selected={selectedNav} onSelect={setSelectedNav} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <TopBar />
        <main style={{ padding: '24px 32px 48px', display: 'flex', flexDirection: 'column', gap: 24 }}>
          <PageHeader />
          <TwoColumns />
        </main>
      </div>
    </div>
  );
}

// =====================================================================
// SHELL — Navigation Rail (RIGHT, RTL) — copied verbatim from dashboard
// =====================================================================
function NavRail({ selected, onSelect }) {
  const { navItems, NavItem } = window;
  return (
    <aside style={{
      width: 88, flexShrink: 0,
      background: 'var(--md-surface-container-low)',
      borderInlineStart: '1px solid var(--md-outline-variant)',
      display: 'flex', flexDirection: 'column',
      position: 'sticky', top: 0, height: '100vh',
    }}>
      <div style={{ padding: '20px 0 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 14,
          background: 'var(--md-primary)',
          color: 'var(--md-on-primary)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 1px 4px rgba(27,94,32,0.25)',
        }}>
          <span className="ms" style={{ fontSize: 24, fontVariationSettings: "'FILL' 1, 'wght' 600" }}>pets</span>
        </div>
      </div>

      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4, padding: '12px 8px', overflowY: 'auto' }}>
        {navItems.map(item => (
          <NavItem key={item.id} item={item} active={selected === item.id} onSelect={onSelect} />
        ))}
      </nav>

      <div style={{
        padding: '16px 8px 20px',
        borderTop: '1px solid var(--md-outline-variant)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
      }}>
        <div style={{
          width: 44, height: 44, borderRadius: '50%',
          background: 'linear-gradient(135deg, #38656A 0%, #1B5E20 100%)',
          color: '#fff',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16, fontWeight: 700,
          boxShadow: 'inset 0 0 0 2px var(--md-surface-container-low)',
          position: 'relative',
        }}>
          <span>אבי</span>
          <span style={{
            position: 'absolute', bottom: -2, left: -2,
            width: 14, height: 14, borderRadius: '50%',
            background: '#22C55E', border: '2px solid var(--md-surface-container-low)',
          }} />
        </div>
        <div style={{
          fontSize: 10, fontWeight: 700, letterSpacing: 0.6,
          color: 'var(--md-on-primary-container)',
          background: 'var(--md-primary-container)',
          padding: '2px 8px', borderRadius: 999,
          textTransform: 'uppercase',
        }}>PRO</div>
      </div>
    </aside>
  );
}

function TopBar() {
  const { IconButton, FilledButton } = window;
  return (
    <header style={{
      height: 72, padding: '0 32px',
      display: 'flex', alignItems: 'center', gap: 24,
      background: 'var(--md-surface)',
      borderBottom: '1px solid var(--md-outline-variant)',
      position: 'sticky', top: 0, zIndex: 10,
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 220 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--md-on-surface)', lineHeight: 1.3 }}>
          חיות הבית של אבי
        </div>
        <div style={{ fontSize: 13, color: 'var(--md-on-surface-variant)', lineHeight: 1.3 }}>
          יום שני, <span className="num">18 במאי 2026</span>
        </div>
      </div>

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
            style={{
              flex: 1, border: 'none', background: 'transparent', outline: 'none',
              fontFamily: 'inherit', fontSize: 14, color: 'var(--md-on-surface)',
              textAlign: 'right',
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

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <IconButton icon="help_outline" label="עזרה" />
        <IconButton icon="notifications" label="התראות" badge={4} />
        <div style={{ width: 1, height: 28, background: 'var(--md-outline-variant)', margin: '0 4px' }} />
        <FilledButton icon="add" variant="filled">הזמנה חדשה</FilledButton>
      </div>
    </header>
  );
}

// =====================================================================
// PAGE HEADER
// =====================================================================
function PageHeader() {
  const { StatusChip, FilledButton, IconButton, ChannelDot, order } = window;
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24 }}>
      {/* RIGHT (RTL start) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 32, height: 32, borderRadius: '50%',
            border: 'none', background: 'transparent',
            color: 'var(--md-on-surface-variant)',
            cursor: 'pointer',
            marginInlineEnd: 4,
          }} title="חזרה" aria-label="חזרה">
            <span className="ms ms-flip-rtl" style={{ fontSize: 20 }}>arrow_back</span>
          </button>
          <span style={{ fontSize: 13, color: 'var(--md-on-surface-variant)' }}>הזמנות</span>
          <span className="ms ms-flip-rtl" style={{ fontSize: 16, color: 'var(--md-on-surface-variant)', opacity: 0.6 }}>chevron_left</span>
          <span style={{ fontSize: 13, color: 'var(--md-on-surface)', fontWeight: 600 }}>
            <span className="num">#1041</span>
          </span>
        </div>

        {/* title row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--md-on-surface)', lineHeight: 1.2 }}>
            הזמנה <span className="num">#1041</span>
          </div>
          <ChannelDot channel={order.channel} />
          <span style={{ fontSize: 13, color: 'var(--md-on-surface-variant)' }}>
            נוצרה <span className="num">18/05/2026, 09:14</span>
          </span>
        </div>
      </div>

      {/* LEFT (RTL end) — current status + advance action */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <StatusChip kind="tonal-secondary">
          <span className="ms" style={{ fontSize: 14, fontVariationSettings: "'FILL' 1, 'wght' 500" }}>inventory_2</span>
          <span>בהכנה</span>
        </StatusChip>
        <div style={{ width: 8 }} />
        <FilledButton icon="arrow_forward" variant="filled">
          קדם לשלב הבא
        </FilledButton>
        <IconButton icon="more_vert" label="פעולות נוספות" />
      </div>
    </div>
  );
}

// =====================================================================
// TWO-COLUMN LAYOUT — main right (65%) + sidebar left (35%)
// =====================================================================
function TwoColumns() {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 460px',
      direction: 'rtl',
      gap: 24,
      alignItems: 'start',
    }}>
      {/* RIGHT (RTL start) — main column */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>
        <StatusStepperCard />
        <ItemsCard />
        <NotesCard />
      </div>

      {/* LEFT (RTL end) — sidebar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <CustomerCard />
        <PaymentCard />
        <OrderMetaCard />
      </div>
    </div>
  );
}

// =====================================================================
// CARD A — Status Stepper
// =====================================================================
function CardHeader({ icon, title, primary, right }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span className="ms" style={{
        fontSize: 20,
        color: primary ? 'var(--md-primary)' : 'var(--md-secondary)',
        fontVariationSettings: "'FILL' 1, 'wght' 500, 'opsz' 24",
      }}>{icon}</span>
      <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--md-on-surface)' }}>{title}</div>
      <div style={{ flex: 1 }} />
      {right}
    </div>
  );
}

function StatusStepperCard() {
  const { Card, FilledButton, timeline } = window;
  return (
    <Card elevation={1} padding={24}>
      <CardHeader icon="timeline" title="מסלול ההזמנה" primary />

      {/* Stepper — flex row-reverse so RTL: step 1 rightmost */}
      <div style={{ marginTop: 24, display: 'flex', flexDirection: 'row-reverse', alignItems: 'flex-start' }}>
        {timeline.map((step, i) => {
          const next = timeline[i + 1];
          return (
            <React.Fragment key={step.key}>
              <Step step={step} />
              {next && <Connector from={step.state} to={next.state} />}
            </React.Fragment>
          );
        })}
      </div>

      {/* CTA row — RTL end (visually left) */}
      <div style={{
        marginTop: 24, paddingTop: 16,
        borderTop: '1px dashed var(--md-outline-variant)',
        display: 'flex', flexDirection: 'row-reverse', alignItems: 'center', gap: 12,
      }}>
        <FilledButton icon="local_shipping" variant="filled">קדם לשלב הבא: בדרך</FilledButton>
        <FilledButton icon="cancel" variant="error" size="sm">בטל הזמנה</FilledButton>
        <div style={{ flex: 1 }} />
        <div style={{ fontSize: 12, color: 'var(--md-on-surface-variant)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span className="ms" style={{ fontSize: 14 }}>person</span>
          <span>אושר על ידי אבי כהן · <span className="num">18/05, 09:22</span></span>
        </div>
      </div>
    </Card>
  );
}

function Step({ step }) {
  const isCurrent = step.state === 'current';
  const isDone    = step.state === 'done';
  const isGhost   = step.state === 'ghost';

  let circleStyle;
  let iconColor;
  let iconFill = 0;
  if (isDone) {
    circleStyle = {
      background: 'var(--md-primary)',
      border: '2px solid var(--md-primary)',
    };
    iconColor = '#fff';
    iconFill = 1;
  } else if (isCurrent) {
    circleStyle = {
      background: 'var(--md-primary-container)',
      border: '2px solid var(--md-primary)',
    };
    iconColor = 'var(--md-primary)';
    iconFill = 1;
  } else if (isGhost) {
    circleStyle = {
      background: 'var(--md-surface-container)',
      border: '1px dashed var(--md-outline-variant)',
      opacity: 0.4,
    };
    iconColor = 'var(--md-on-surface-variant)';
  } else { // upcoming
    circleStyle = {
      background: 'var(--md-surface-container)',
      border: '1.5px solid var(--md-outline-variant)',
    };
    iconColor = 'var(--md-on-surface-variant)';
  }

  const labelColor = isDone || isCurrent ? 'var(--md-primary)' : 'var(--md-on-surface-variant)';
  const labelWeight = isDone || isCurrent ? 600 : 500;
  const labelOpacity = isGhost ? 0.4 : 1;

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      gap: 8, minWidth: 72, flexShrink: 0,
    }}>
      <div className={isCurrent ? 'stepper-current' : ''} style={{
        width: 40, height: 40, borderRadius: '50%',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        ...circleStyle,
        boxSizing: 'border-box',
      }}>
        <span className="ms" style={{
          fontSize: 18,
          color: iconColor,
          fontVariationSettings: `'FILL' ${iconFill}, 'wght' ${iconFill ? 600 : 400}, 'opsz' 20`,
        }}>{step.icon}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, opacity: labelOpacity }}>
        <div style={{ fontSize: 11, fontWeight: labelWeight, color: labelColor, lineHeight: 1.2 }}>
          {step.label}
        </div>
        {step.time && (
          <div className={/[0-9]/.test(step.time) && step.time.match(/^\d/) ? 'num' : ''} style={{
            fontSize: 10, color: 'var(--md-on-surface-variant)', lineHeight: 1.2, whiteSpace: 'nowrap',
          }}>
            {step.time}
          </div>
        )}
      </div>
    </div>
  );
}

function Connector({ from, to }) {
  // States: done | current | upcoming | ghost
  // Solid primary when both endpoints are completed (done→done) or done→current.
  // After current → outline-variant dashed.
  // Around ghost → outline-variant dashed (already dimmed).
  let style;
  if (from === 'done' && (to === 'done' || to === 'current')) {
    style = { background: 'var(--md-primary)', height: 2 };
  } else if (from === 'current' && to === 'upcoming') {
    style = {
      backgroundImage: 'linear-gradient(to right, var(--md-outline-variant) 50%, transparent 0)',
      backgroundSize: '8px 2px',
      backgroundRepeat: 'repeat-x',
      backgroundPosition: 'center',
      height: 2,
    };
  } else {
    style = {
      backgroundImage: 'linear-gradient(to right, var(--md-outline-variant) 50%, transparent 0)',
      backgroundSize: '8px 2px',
      backgroundRepeat: 'repeat-x',
      backgroundPosition: 'center',
      height: 2,
      opacity: to === 'ghost' || from === 'ghost' ? 0.5 : 1,
    };
  }
  return (
    <div style={{
      flex: 1, minWidth: 16,
      marginTop: 19, // align with 40px circle center
      ...style,
    }} />
  );
}

// =====================================================================
// CARD B — Items
// =====================================================================
function ItemsCard() {
  const { Card, items, totals } = window;
  return (
    <Card elevation={1} padding={24}>
      <CardHeader
        icon="receipt"
        title="פריטים"
        right={<div style={{ fontSize: 13, color: 'var(--md-on-surface-variant)' }}>
          <span className="num">{items.length}</span> פריטים
        </div>}
      />

      {/* Table */}
      <div style={{ marginTop: 16 }}>
        {/* header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) 80px 130px 130px',
          gap: 16,
          padding: '8px 0',
          borderBottom: '1px solid var(--md-outline-variant)',
          fontSize: 11, fontWeight: 600, letterSpacing: 0.4, textTransform: 'uppercase',
          color: 'var(--md-on-surface-variant)',
        }}>
          <div>מוצר</div>
          <div style={{ textAlign: 'center' }}>כמות</div>
          <div style={{ textAlign: 'start' }}>מחיר יחידה</div>
          <div style={{ textAlign: 'start' }}>סה״כ</div>
        </div>

        {items.map((it, i) => (
          <ItemRow key={i} item={it} last={i === items.length - 1} />
        ))}
      </div>

      {/* Totals */}
      <div style={{
        marginTop: 16,
        display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
        gap: 6,
      }}>
        <TotalsRow label="סה״כ לפני מע״מ" value={`₪${totals.subtotal.toFixed(2)}`} />
        <TotalsRow label="מע״מ 18%" value={`₪${totals.vat.toFixed(2)}`} />
        <div style={{
          width: 320, height: 1, background: 'var(--md-outline-variant)', margin: '4px 0',
        }} />
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
          width: 320,
        }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--md-on-surface)' }}>סה״כ לתשלום</span>
          <span className="currency num" style={{ fontSize: 22, fontWeight: 700, color: 'var(--md-primary)' }}>
            ₪{totals.total.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Owner-only block */}
      <OwnerOnlyBlock />
    </Card>
  );
}

function ItemRow({ item, last }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'minmax(0, 1fr) 80px 130px 130px',
      gap: 16,
      padding: '14px 0',
      borderBottom: last ? 'none' : '1px solid var(--md-outline-variant)',
      alignItems: 'center',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 10,
          background: 'var(--md-surface-container)',
          border: '1px solid var(--md-outline-variant)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
          color: 'var(--md-on-surface-variant)',
        }}>
          <span className="ms" style={{ fontSize: 22, fontVariationSettings: "'FILL' 1, 'wght' 500" }}>pets</span>
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{
            fontSize: 14, fontWeight: 500, color: 'var(--md-on-surface)',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>{item.name}</div>
          <div style={{ fontSize: 11, color: 'var(--md-on-surface-variant)', marginTop: 1 }}>
            <span style={{ direction: 'ltr', unicodeBidi: 'isolate' }}>SKU: {item.sku}</span>
            <span> · {item.meta}</span>
          </div>
        </div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <span className="num" style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          minWidth: 32, height: 28, padding: '0 10px',
          borderRadius: 999,
          background: 'var(--md-surface-container)',
          fontSize: 13, fontWeight: 600, color: 'var(--md-on-surface)',
        }}>{item.qty}</span>
      </div>
      <div className="currency num" style={{ fontSize: 14, color: 'var(--md-on-surface)' }}>
        ₪{item.unitPrice.toFixed(2)}
      </div>
      <div className="currency num" style={{ fontSize: 14, fontWeight: 600, color: 'var(--md-on-surface)' }}>
        ₪{item.lineTotal.toFixed(2)}
      </div>
    </div>
  );
}

function TotalsRow({ label, value }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
      width: 320,
    }}>
      <span style={{ fontSize: 13, color: 'var(--md-on-surface-variant)' }}>{label}</span>
      <span className="currency num" style={{ fontSize: 13, color: 'var(--md-on-surface)' }}>{value}</span>
    </div>
  );
}

function OwnerOnlyBlock() {
  const { totals } = window;
  return (
    <div style={{
      marginTop: 16,
      background: 'var(--md-surface-container)',
      borderRadius: 10,
      padding: '12px 16px',
      display: 'flex', flexDirection: 'row-reverse', alignItems: 'center', gap: 0,
      border: '1px dashed var(--md-outline-variant)',
    }}>
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        paddingInlineEnd: 16,
        borderInlineEnd: '1px solid var(--md-outline-variant)',
      }}>
        <span className="ms" style={{ fontSize: 14, color: 'var(--md-on-surface-variant)' }}>lock</span>
        <span style={{
          fontSize: 10, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase',
          color: 'var(--md-on-surface-variant)',
        }}>בעלים בלבד</span>
      </div>

      <OwnerMetric label="עלות כוללת" value={`₪${totals.cost.toFixed(2)}`} color="var(--md-on-surface)" />
      <OwnerMetric label="רווח גולמי" value={`₪${totals.profit.toFixed(2)}`} color="var(--md-secondary)" />
      <OwnerMetric label="שיעור רווח" value={`${totals.margin}%`} color="var(--md-secondary)" suffix />
    </div>
  );
}

function OwnerMetric({ label, value, color, suffix }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 2,
      paddingInline: 20,
      flex: 1,
    }}>
      <div style={{ fontSize: 11, color: 'var(--md-on-surface-variant)' }}>{label}</div>
      <div className={suffix ? 'num' : 'currency num'} style={{ fontSize: 14, fontWeight: 700, color }}>
        {value}
      </div>
    </div>
  );
}

// =====================================================================
// CARD C — Notes
// =====================================================================
function NotesCard() {
  const { Card, order } = window;
  return (
    <Card elevation={1} padding={24}>
      <CardHeader icon="notes" title="הערות" />
      <div style={{
        marginTop: 12,
        fontSize: 14, color: 'var(--md-on-surface)',
        background: 'var(--md-surface-container)',
        borderRadius: 12, padding: '12px 16px',
        borderInlineStart: '3px solid var(--md-secondary)',
      }}>
        {order.notes}
      </div>
    </Card>
  );
}

// =====================================================================
// SIDEBAR CARDS
// =====================================================================
function SidebarHeader({ children }) {
  return (
    <div style={{
      fontSize: 11, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase',
      color: 'var(--md-on-surface-variant)',
      marginBottom: 14,
    }}>{children}</div>
  );
}

function KV({ k, children }) {
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
      <span style={{ fontSize: 13, color: 'var(--md-on-surface)', fontWeight: 500 }}>{children}</span>
    </div>
  );
}

function CustomerCard() {
  const { Card, ChannelDot, FilledButton, customer } = window;
  return (
    <Card elevation={1} padding={20}>
      <SidebarHeader>פרטי לקוח</SidebarHeader>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 44, height: 44, borderRadius: '50%',
          background: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%)',
          color: '#fff',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, fontWeight: 700, letterSpacing: 0.5,
          flexShrink: 0,
        }}>{customer.initials}</div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--md-on-surface)', lineHeight: 1.25 }}>
            {customer.name}
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--md-tertiary)', fontWeight: 500 }}>
            <span className="ms" style={{ fontSize: 14, fontVariationSettings: "'FILL' 1, 'wght' 500" }}>verified_user</span>
            <span>{customer.tag}</span>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <KV k="טלפון">
          <span className="num" style={{ direction: 'ltr', unicodeBidi: 'isolate' }}>{customer.phone}</span>
        </KV>
        <KV k="עיר">{customer.city}</KV>
        <KV k="ערוץ מועדף">
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <ChannelDot channel={customer.preferredChannel} />
            {customer.preferredChannelLabel}
          </span>
        </KV>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '8px 0' }}>
          <span style={{
            fontSize: 11, fontWeight: 600, letterSpacing: 0.4, textTransform: 'uppercase',
            color: 'var(--md-on-surface-variant)',
          }}>סניף</span>
          <span style={{ fontSize: 13, color: 'var(--md-on-surface)', fontWeight: 500 }}>{customer.branch}</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
        <FilledButton icon="phone" variant="outlined" size="sm">התקשר</FilledButton>
        <FilledButton icon="chat" variant="tonal" size="sm">WhatsApp</FilledButton>
        <FilledButton icon="open_in_new" variant="text" size="sm">כרטיס לקוח</FilledButton>
      </div>
    </Card>
  );
}

function PaymentCard() {
  const { Card, StatusChip, FilledButton, payment, totals } = window;
  return (
    <Card elevation={1} padding={20}>
      <SidebarHeader>סטטוס תשלום</SidebarHeader>

      {/* Hero amount + status */}
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
        gap: 6,
        padding: '12px 14px',
        background: 'var(--md-surface-container)',
        borderRadius: 12,
        marginBottom: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.4, textTransform: 'uppercase', color: 'var(--md-on-surface-variant)' }}>
            לגבייה
          </span>
          <StatusChip kind="tonal-secondary">
            <span className="ms" style={{ fontSize: 12, fontVariationSettings: "'FILL' 1, 'wght' 500" }}>schedule_send</span>
            {payment.statusLabel}
          </StatusChip>
        </div>
        <div className="currency num" style={{ fontSize: 26, fontWeight: 700, color: 'var(--md-on-surface)', lineHeight: 1.1 }}>
          ₪{totals.total.toFixed(2)}
        </div>
      </div>

      <div>
        <KV k="אמצעי תשלום">
          <span style={{ direction: 'ltr', unicodeBidi: 'isolate' }}>{payment.method}</span>
        </KV>
        <KV k="קישור נשלח">
          <span className="num">{payment.linkSentAt}</span>
        </KV>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '8px 0' }}>
          <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.4, textTransform: 'uppercase', color: 'var(--md-on-surface-variant)' }}>
            PayPlus Ref
          </span>
          <span style={{ fontSize: 13, color: 'var(--md-on-surface-variant)' }}>
            {payment.ref} <span style={{ fontSize: 11 }}>(לא שולם עדיין)</span>
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
        <div style={{ display: 'flex' }}>
          <div style={{ flex: 1 }}>
            <FilledButtonFull icon="send" variant="tonal">שלח קישור תשלום שוב</FilledButtonFull>
          </div>
        </div>
        <div style={{ display: 'flex' }}>
          <div style={{ flex: 1 }}>
            <FilledButtonFull icon="check" variant="outlined" size="sm">סמן כשולם ידנית</FilledButtonFull>
          </div>
        </div>
      </div>
    </Card>
  );
}

// Full-width variant of FilledButton (the shared atom centers content; we just stretch the wrapper)
function FilledButtonFull({ icon, variant, size, children }) {
  const { FilledButton } = window;
  return (
    <div style={{ display: 'block', width: '100%' }}>
      <button
        className="state-layer"
        style={{
          width: '100%',
          ...({
            filled:   { background: 'var(--md-primary)', color: 'var(--md-on-primary)', border: '1px solid var(--md-primary)' },
            tonal:    { background: 'var(--md-secondary-container)', color: 'var(--md-on-secondary-container)', border: '1px solid var(--md-secondary-container)' },
            outlined: { background: 'transparent', color: 'var(--md-primary)', border: '1px solid var(--md-outline)' },
            text:     { background: 'transparent', color: 'var(--md-primary)', border: '1px solid transparent' },
            error:    { background: 'var(--md-error-container)', color: 'var(--md-on-error-container)', border: '1px solid var(--md-error-container)' },
          })[variant || 'filled'],
          ...({
            sm: { padding: '6px 12px', fontSize: 13, height: 36 },
            md: { padding: '10px 20px', fontSize: 14, height: 40 },
          })[size || 'md'],
          borderRadius: 999,
          fontFamily: 'inherit', fontWeight: 500, letterSpacing: 0.1,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          cursor: 'pointer', whiteSpace: 'nowrap',
          transition: 'background 120ms ease',
        }}>
        {icon && <span className="ms" style={{ fontSize: 18 }}>{icon}</span>}
        <span>{children}</span>
      </button>
    </div>
  );
}

function OrderMetaCard() {
  const { Card, ChannelDot, order } = window;
  return (
    <Card elevation={1} padding={20}>
      <SidebarHeader>פרטי הזמנה</SidebarHeader>
      <KV k="מספר הזמנה"><span className="num">{order.id}</span></KV>
      <KV k="נוצרה ב"><span className="num">{order.createdAt}</span></KV>
      <KV k="נוצרה על ידי">{order.createdBy}</KV>
      <KV k="ערוץ מקור">
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <ChannelDot channel={order.channel} />
          {order.channelLabel}
        </span>
      </KV>
      <KV k="סוג הזמנה">{order.orderType}</KV>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '8px 0' }}>
        <span style={{
          fontSize: 11, fontWeight: 600, letterSpacing: 0.4, textTransform: 'uppercase',
          color: 'var(--md-on-surface-variant)',
        }}>תאריך מסירה</span>
        <span style={{
          fontSize: 13, color: 'var(--md-on-primary-container)', fontWeight: 600,
          background: 'var(--md-primary-container)', padding: '2px 10px', borderRadius: 999,
        }} className="num">{order.deliveryDate}</span>
      </div>
    </Card>
  );
}

// =====================================================================
// Mount
// =====================================================================
ReactDOM.createRoot(document.getElementById('root')).render(<App />);
