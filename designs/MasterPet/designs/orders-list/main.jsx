// ============ Main App — Orders List ============

const { useState: useAppState } = React;

function App() {
  const [selectedNav, setSelectedNav] = useAppState('orders');

  return (
    <div data-screen-label="Orders List" style={{ display: 'flex', flexDirection: 'row-reverse', minHeight: '100vh', width: 1440, margin: '0 auto', background: 'var(--md-surface)' }}>
      <NavRail selected={selectedNav} onSelect={setSelectedNav} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <TopBar />
        <main style={{ padding: '24px 32px 48px', display: 'flex', flexDirection: 'column', gap: 32 }}>
          <PageHeader />
          <KpiStrip />
          <ToolbarCard />
          <OrdersTable />
          <EmptyStateAnnotation />
        </main>
      </div>
    </div>
  );
}

// ---------- Navigation Rail (RIGHT side, RTL) ----------
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

// ---------- Top Bar ----------
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

// ---------- Page header ----------
function PageHeader() {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24 }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: 'var(--md-on-surface-variant)', marginBottom: 4 }}>
          <span>דשבורד</span>
          <span className="ms ms-flip-rtl" style={{ fontSize: 14, opacity: 0.6 }}>chevron_left</span>
          <span style={{ color: 'var(--md-on-surface)', fontWeight: 500 }}>הזמנות</span>
        </div>
        <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--md-on-surface)', lineHeight: 1.3 }}>
          ניהול הזמנות
        </div>
        <div style={{ fontSize: 14, color: 'var(--md-on-surface-variant)', marginTop: 4 }}>
          <span className="num" style={{ color: 'var(--md-primary)', fontWeight: 600 }}>23</span> הזמנות פתוחות היום
          {' · '}<span className="num" style={{ color: '#A65F00', fontWeight: 600, background: 'var(--md-warning-container)', padding: '1px 8px', borderRadius: 999 }}>7 ממתינות לאישור</span>
          {' · '}סה״כ החודש: <span className="currency num" style={{ fontWeight: 600, color: 'var(--md-on-surface)' }}>₪48,320</span>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// SECTION 1 — KPI Strip (HERO first)
// ============================================================
function KpiStrip() {
  return (
    <section style={{ display: 'flex', gap: 16, alignItems: 'stretch' }}>
      <HeroTile />
      <WarningTile />
      <TertiaryTile />
      <RevenueTile />
    </section>
  );
}

function HeroTile() {
  return (
    <div style={{
      flex: 1.5, minWidth: 280,
      background: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 55%, #38656A 100%)',
      color: 'var(--md-on-primary)',
      borderRadius: 16, padding: 20,
      boxShadow: '0 1px 3px rgba(27,94,32,0.20), 0 8px 24px -8px rgba(27,94,32,0.35)',
      position: 'relative', overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
      minHeight: 168,
    }}>
      <div aria-hidden="true" style={{
        position: 'absolute', insetInlineStart: 0, bottom: 0,
        width: 260, height: 260,
        background: 'radial-gradient(circle at 0% 100%, rgba(255,255,255,0.10) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <span style={{
          width: 36, height: 36, borderRadius: 10,
          background: 'rgba(255,255,255,0.18)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span className="ms" style={{
            fontSize: 22, color: 'rgba(255,255,255,0.92)',
            fontVariationSettings: "'FILL' 1, 'wght' 500, 'opsz' 24",
          }}>receipt_long</span>
        </span>
        <span style={{
          fontSize: 10, fontWeight: 600, letterSpacing: 0.6,
          padding: '2px 8px', borderRadius: 999,
          background: 'rgba(255,255,255,0.18)', color: '#fff',
          textTransform: 'uppercase',
        }}>HERO</span>
      </div>

      <div style={{
        marginTop: 14,
        fontSize: 48, fontWeight: 700, letterSpacing: -0.5, lineHeight: 1,
        color: '#fff',
      }}>
        <span className="num">23</span>
      </div>

      <div style={{ marginTop: 6, fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.85)' }}>
        הזמנות היום
      </div>
      <div style={{ fontSize: 11, fontWeight: 400, color: 'rgba(255,255,255,0.65)', marginTop: 2 }}>
        מתוך <span className="num">341</span> הזמנות החודש
      </div>

      <div style={{ marginTop: 'auto', paddingTop: 16, display: 'flex', justifyContent: 'flex-start' }}>
        <button style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '8px 16px', borderRadius: 999,
          background: 'rgba(255,255,255,0.92)', color: '#1B5E20',
          border: 'none', cursor: 'pointer',
          fontFamily: 'inherit', fontSize: 12, fontWeight: 600,
          boxShadow: '0 1px 3px rgba(0,0,0,0.10)',
          position: 'relative', zIndex: 1,
        }}>
          <span>לכל ההזמנות</span>
          <span className="ms ms-flip-rtl" style={{ fontSize: 14 }}>arrow_back</span>
        </button>
      </div>
    </div>
  );
}

function WarningTile() {
  return (
    <div style={{
      flex: 1, minWidth: 160,
      background: 'var(--md-warning-container)',
      border: '1px solid rgba(245,158,11,0.30)',
      borderRadius: 16, padding: 20,
      display: 'flex', flexDirection: 'column',
      minHeight: 168,
    }}>
      <span className="ms" style={{
        fontSize: 24, color: '#A65F00',
        fontVariationSettings: "'FILL' 1, 'wght' 500, 'opsz' 24",
      }}>pending_actions</span>

      <div style={{
        marginTop: 14,
        fontSize: 36, fontWeight: 700, lineHeight: 1.05, letterSpacing: -0.3,
        color: 'var(--md-on-surface)',
      }}>
        <span className="num">7</span>
      </div>

      <div style={{
        marginTop: 8,
        fontSize: 12, fontWeight: 600, letterSpacing: 0.4, textTransform: 'uppercase',
        color: '#A65F00',
      }}>
        ממתינות לאישור
      </div>
      <div style={{ marginTop: 4, fontSize: 11, fontWeight: 400, color: 'rgba(74,47,0,0.70)' }}>
        <span className="num">3</span> מעל שעה
      </div>
    </div>
  );
}

function TertiaryTile() {
  return (
    <div style={{
      flex: 1, minWidth: 160,
      background: 'var(--md-tertiary-container)',
      border: 'none',
      borderRadius: 16, padding: 20,
      display: 'flex', flexDirection: 'column',
      minHeight: 168,
    }}>
      <span className="ms" style={{
        fontSize: 24, color: 'var(--md-on-tertiary-container)',
        fontVariationSettings: "'FILL' 1, 'wght' 500, 'opsz' 24",
      }}>autorenew</span>

      <div style={{
        marginTop: 14,
        fontSize: 36, fontWeight: 700, lineHeight: 1.05, letterSpacing: -0.3,
        color: 'var(--md-on-tertiary-container)',
      }}>
        <span className="num">38</span>
      </div>

      <div style={{
        marginTop: 8,
        fontSize: 12, fontWeight: 600, letterSpacing: 0.4, textTransform: 'uppercase',
        color: 'var(--md-on-tertiary-container)',
      }}>
        מנויים פעילים
      </div>
      <div style={{ marginTop: 4, fontSize: 11, fontWeight: 400, color: 'rgba(0,32,34,0.70)' }}>
        הזמנה הבאה ב-<span className="num">20/05</span>
      </div>
    </div>
  );
}

function RevenueTile() {
  return (
    <div style={{
      flex: 1, minWidth: 160,
      background: 'var(--md-surface-container-lowest)',
      border: '1px solid var(--md-outline-variant)',
      borderRadius: 16, padding: 20,
      display: 'flex', flexDirection: 'column',
      minHeight: 168,
    }}>
      <span className="ms" style={{
        fontSize: 24, color: 'var(--md-secondary)',
        fontVariationSettings: "'FILL' 1, 'wght' 500, 'opsz' 24",
      }}>payments</span>

      <div style={{
        marginTop: 14,
        fontSize: 32, fontWeight: 700, lineHeight: 1.05, letterSpacing: -0.3,
        color: 'var(--md-on-surface)',
      }}>
        <span className="currency num">₪48,320</span>
      </div>

      <div style={{
        marginTop: 8,
        fontSize: 12, fontWeight: 600, letterSpacing: 0.4, textTransform: 'uppercase',
        color: 'var(--md-on-surface-variant)',
      }}>
        סה״כ החודש
      </div>
      <div style={{ marginTop: 4, fontSize: 11, fontWeight: 400, color: 'var(--md-secondary)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
        <span className="ms" style={{ fontSize: 14 }}>trending_up</span>
        <span>+<span className="num">12</span>% לעומת חודש שעבר</span>
      </div>
    </div>
  );
}

// ============================================================
// SECTION 2 — Tab bar + Toolbar (single card)
// ============================================================
function ToolbarCard() {
  return (
    <div style={{
      background: 'var(--md-surface-container-low)',
      borderRadius: 16,
      border: '1px solid var(--md-outline-variant)',
      overflow: 'hidden',
    }}>
      <TabBar />
      <ToolbarRow />
    </div>
  );
}

function TabBar() {
  const tabs = [
    { id: 'orders', label: 'הזמנות', active: true },
    { id: 'subs',   label: 'מנויים', active: false },
  ];
  return (
    <div style={{
      display: 'flex', flexDirection: 'row-reverse',
      height: 48,
      borderBottom: '1px solid var(--md-outline-variant)',
      paddingInlineStart: 20, paddingInlineEnd: 20,
      gap: 4,
    }}>
      {tabs.map(t => (
        <button key={t.id} style={{
          position: 'relative',
          padding: '0 16px',
          height: '100%',
          border: 'none', background: 'transparent',
          fontFamily: 'inherit',
          fontSize: 14, fontWeight: t.active ? 600 : 400,
          color: t.active ? 'var(--md-on-surface)' : 'var(--md-on-surface-variant)',
          cursor: 'pointer',
        }}>
          {t.label}
          {t.active && (
            <span style={{
              position: 'absolute', insetInlineStart: 12, insetInlineEnd: 12, bottom: -1, height: 3,
              background: 'var(--md-primary)', borderRadius: '3px 3px 0 0',
            }} />
          )}
        </button>
      ))}
    </div>
  );
}

function ToolbarRow() {
  const { FilledButton } = window;
  return (
    <div style={{
      padding: '12px 20px',
      display: 'flex', alignItems: 'center', gap: 12,
    }}>
      {/* RIGHT (RTL start): primary CTA */}
      <FilledButton icon="add" variant="filled" size="md">הזמנה חדשה</FilledButton>

      {/* CENTER: search */}
      <div style={{ width: 340, marginInlineStart: 8 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          height: 40, padding: '0 14px',
          background: 'var(--md-surface-container)',
          border: '1px solid var(--md-outline-variant)',
          borderRadius: 999,
          color: 'var(--md-on-surface-variant)',
        }}>
          <span className="ms" style={{ fontSize: 20 }}>search</span>
          <input
            placeholder="חיפוש לפי לקוח, מספר הזמנה..."
            style={{
              flex: 1, border: 'none', background: 'transparent', outline: 'none',
              fontFamily: 'inherit', fontSize: 13, color: 'var(--md-on-surface)',
              textAlign: 'right',
            }}
          />
        </div>
      </div>

      <div style={{ flex: 1 }} />

      {/* LEFT (RTL end): filters */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <FilterPill active>הכל</FilterPill>
        <FilterPill>ממתין</FilterPill>
        <FilterPill>אושר</FilterPill>
        <FilterPill>בדרך</FilterPill>
        <FilterPill>נמסר</FilterPill>

        <div style={{ width: 1, height: 20, background: 'var(--md-outline-variant)', margin: '0 4px' }} />

        <FilterPill icon="expand_more" iconStart="store">כל הערוצים</FilterPill>
        <FilterPill icon="expand_more" iconStart="calendar_today">כל הזמנים</FilterPill>
      </div>
    </div>
  );
}

function FilterPill({ active, icon, iconStart, children }) {
  return (
    <button style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      height: 32,
      padding: icon ? '0 8px 0 12px' : '0 14px',
      borderRadius: 999,
      background: active ? 'var(--md-secondary-container)' : 'var(--md-surface-container)',
      color: active ? 'var(--md-on-secondary-container)' : 'var(--md-on-surface-variant)',
      border: active ? '1px solid transparent' : '1px solid var(--md-outline-variant)',
      cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 500,
      whiteSpace: 'nowrap',
    }}>
      {iconStart && <span className="ms" style={{ fontSize: 16 }}>{iconStart}</span>}
      <span>{children}</span>
      {icon && <span className="ms" style={{ fontSize: 16 }}>{icon}</span>}
    </button>
  );
}

// ============================================================
// SECTION 3 — Orders DataTable
// ============================================================

// Column widths — RTL right-to-left visual order (grid is LTR but flex row-reverse content)
// Order in grid (visual right→left in RTL):
// # הזמנה | לקוח | מוצרים | סה״כ | תשלום | סטטוס | ערוץ | תאריך | פעולות
const COLS = '100px minmax(180px, 1fr) 200px 100px 110px 120px 72px 110px 80px';

function OrdersTable() {
  const { orders } = window;
  return (
    <div style={{
      background: 'var(--md-surface-container-low)',
      borderRadius: 16,
      border: '1px solid var(--md-outline-variant)',
      overflow: 'hidden',
    }}>
      <OrdersHeader />
      <div>
        {orders.map((o, i) => (
          <OrderRow key={o.id} order={o} zebra={i % 2 === 1} last={i === orders.length - 1} />
        ))}
      </div>
      <OrdersFooter />
    </div>
  );
}

function OrdersHeader() {
  const cell = {
    fontSize: 11, fontWeight: 600, letterSpacing: 0.4, textTransform: 'uppercase',
    color: 'var(--md-on-surface-variant)',
    display: 'flex', alignItems: 'center', gap: 4,
  };
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: COLS,
      gap: 12, padding: '0 20px',
      height: 44, alignItems: 'center',
      background: 'var(--md-surface-container)',
      borderBottom: '1px solid var(--md-outline-variant)',
    }}>
      <div style={{ ...cell, cursor: 'pointer' }}>
        <span># הזמנה</span>
        <span className="ms" style={{ fontSize: 14, opacity: 0.5 }}>unfold_more</span>
      </div>
      <div style={cell}>לקוח</div>
      <div style={cell}>מוצרים</div>
      <div style={{ ...cell, cursor: 'pointer' }}>
        <span>סה״כ</span>
        <span className="ms" style={{ fontSize: 14 }}>arrow_downward</span>
      </div>
      <div style={{ ...cell, justifyContent: 'center' }}>תשלום</div>
      <div style={{ ...cell, justifyContent: 'center' }}>סטטוס</div>
      <div style={{ ...cell, justifyContent: 'center' }}>ערוץ</div>
      <div style={{ ...cell, cursor: 'pointer' }}>
        <span>תאריך</span>
        <span className="ms" style={{ fontSize: 14, opacity: 0.5 }}>unfold_more</span>
      </div>
      <div style={{ ...cell, justifyContent: 'center' }}>פעולות</div>
    </div>
  );
}

function OrderRow({ order: o, zebra, last }) {
  const { ChannelDot, StatusChip, statusMap, paymentMap } = window;
  const [hover, setHover] = useAppState(false);
  const isHover = hover || o.forceHover;
  const cancelled = o.cancelled;

  let bg;
  if (cancelled) {
    bg = isHover ? 'var(--md-surface-container-high)' : 'rgba(219,223,215,0.30)';
  } else if (isHover) {
    bg = 'var(--md-surface-container-high)';
  } else {
    bg = zebra ? 'var(--md-surface-container-low)' : 'var(--md-surface-container-lowest)';
  }

  const subColor = 'var(--md-on-surface-variant)';
  const textColor = cancelled ? 'var(--md-on-surface-variant)' : 'var(--md-on-surface)';
  const textOpacity = cancelled ? 0.75 : 1;

  const st = statusMap[o.status];
  const pm = paymentMap[o.payment];

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'grid',
        gridTemplateColumns: COLS,
        gap: 12, padding: '0 20px',
        height: 64, alignItems: 'center',
        background: bg,
        borderBottom: last ? 'none' : '1px solid var(--md-outline-variant)',
        boxShadow: isHover ? 'var(--shadow-1)' : 'none',
        position: 'relative', zIndex: isHover ? 1 : 0,
        transition: 'background 100ms ease, box-shadow 100ms ease',
        cursor: 'pointer',
      }}>

      {/* # הזמנה */}
      <div className="num" style={{
        fontSize: 13, fontWeight: 500, color: textColor, opacity: textOpacity,
      }}>
        {o.id}
      </div>

      {/* לקוח */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          background: cancelled ? 'var(--md-surface-container)' : o.avatar,
          color: cancelled ? 'var(--md-on-surface-variant)' : '#fff',
          opacity: cancelled ? 0.7 : 1,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, fontWeight: 600, flexShrink: 0,
          letterSpacing: 0.2,
        }}>
          {o.initials}
        </div>
        <span style={{
          fontSize: 14, fontWeight: 500, color: textColor, opacity: textOpacity,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>{o.customer}</span>
      </div>

      {/* מוצרים */}
      <div style={{
        fontSize: 13, color: textColor, opacity: textOpacity,
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        direction: 'rtl',
      }}>
        {o.product}
      </div>

      {/* סה״כ */}
      <div className="currency num" style={{
        fontSize: 14, fontWeight: 600, color: textColor, opacity: textOpacity,
      }}>
        ₪{o.total.toLocaleString('en-US')}
      </div>

      {/* תשלום */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <StatusChip kind={pm.kind}>{pm.label}</StatusChip>
      </div>

      {/* סטטוס */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <StatusChip kind={st.kind}>{st.label}</StatusChip>
      </div>

      {/* ערוץ */}
      <div style={{ display: 'flex', justifyContent: 'center', opacity: cancelled ? 0.55 : 1 }}>
        <ChannelDot channel={o.channel} />
      </div>

      {/* תאריך */}
      <div className="num" style={{ fontSize: 12, color: subColor }}>
        {o.date}
      </div>

      {/* פעולות */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
        {isHover ? (
          <>
            <RowAction icon="open_in_new" label="פתח" />
            <RowAction icon="send" label="שלח קישור תשלום" />
          </>
        ) : (
          <button title="פעולות" style={{
            width: 28, height: 28, borderRadius: '50%', border: 'none',
            background: 'transparent', cursor: 'pointer',
            color: 'var(--md-on-surface-variant)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            opacity: 0.55,
          }}>
            <span className="ms" style={{ fontSize: 18 }}>more_horiz</span>
          </button>
        )}
      </div>
    </div>
  );
}

function RowAction({ icon, label }) {
  const [hover, setHover] = useAppState(false);
  return (
    <button
      title={label} aria-label={label}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: 30, height: 30, borderRadius: '50%', border: 'none',
        background: hover ? 'var(--md-surface-container)' : 'transparent',
        cursor: 'pointer',
        color: 'var(--md-on-surface-variant)',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background 100ms ease',
      }}>
      <span className="ms" style={{ fontSize: 18 }}>{icon}</span>
    </button>
  );
}

function OrdersFooter() {
  return (
    <div style={{
      height: 48, padding: '0 20px',
      background: 'var(--md-surface-container)',
      borderTop: '1px solid var(--md-outline-variant)',
      display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 12,
    }}>
      {/* RIGHT (RTL start): count */}
      <div style={{ fontSize: 12, color: 'var(--md-on-surface-variant)' }}>
        מציג <span className="num" style={{ fontWeight: 600, color: 'var(--md-on-surface)' }}>8</span> מתוך <span className="num" style={{ fontWeight: 600, color: 'var(--md-on-surface)' }}>341</span> הזמנות
      </div>

      {/* CENTER: rows per page */}
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--md-on-surface-variant)', cursor: 'pointer' }}>
        <span>שורות בעמוד: <span className="num" style={{ fontWeight: 600, color: 'var(--md-on-surface)' }}>10</span></span>
        <span className="ms" style={{ fontSize: 16 }}>expand_more</span>
      </div>

      {/* LEFT (RTL end): pagination */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 4 }}>
        <PagerButton icon="chevron_right" disabled />
        <PagerButton active>1</PagerButton>
        <PagerButton>2</PagerButton>
        <PagerButton>3</PagerButton>
        <span style={{ fontSize: 13, color: 'var(--md-on-surface-variant)', padding: '0 4px' }} className="num">...</span>
        <PagerButton>43</PagerButton>
        <PagerButton icon="chevron_left" />
      </div>
    </div>
  );
}

function PagerButton({ active, disabled, icon, children }) {
  return (
    <button disabled={disabled} style={{
      minWidth: 28, height: 28, padding: '0 6px', borderRadius: 999,
      border: 'none',
      background: active ? 'var(--md-primary-container)' : 'transparent',
      color: active ? 'var(--md-on-primary-container)' : 'var(--md-on-surface-variant)',
      cursor: disabled ? 'default' : 'pointer',
      opacity: disabled ? 0.4 : 1,
      fontFamily: 'inherit', fontSize: 12, fontWeight: 600,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {icon ? <span className="ms" style={{ fontSize: 18 }}>{icon}</span> : <span className="num">{children}</span>}
    </button>
  );
}

// ============================================================
// SECTION 4 — Empty State (annotation)
// ============================================================
function EmptyStateAnnotation() {
  const { FilledButton } = window;
  return (
    <AnnotationFrame label="מצב ריק — כשאין הזמנות">
      <div style={{
        background: 'var(--md-surface-container-lowest)',
        border: '1px solid var(--md-outline-variant)',
        borderRadius: 16, padding: '56px 24px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
      }}>
        <span className="ms" style={{
          fontSize: 72, color: 'var(--md-outline)',
          fontVariationSettings: "'FILL' 0, 'wght' 400, 'opsz' 48",
        }}>receipt_long</span>
        <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--md-on-surface)' }}>
          אין הזמנות עדיין
        </div>
        <div style={{ fontSize: 14, fontWeight: 400, color: 'var(--md-on-surface-variant)', textAlign: 'center', maxWidth: 480 }}>
          צור הזמנה ידנית או חכה לפניות מ-WhatsApp ו-WooCommerce
        </div>
        <div style={{ marginTop: 8 }}>
          <FilledButton icon="add" variant="filled" size="md">הזמנה חדשה</FilledButton>
        </div>
      </div>
    </AnnotationFrame>
  );
}

function AnnotationFrame({ label, children }) {
  return (
    <div style={{
      border: '1.5px dashed var(--md-outline)',
      borderRadius: 20, padding: 16, paddingTop: 28,
      position: 'relative',
      background: 'transparent',
    }}>
      <div style={{
        position: 'absolute', top: -11, insetInlineStart: 24,
        background: 'var(--md-surface)',
        padding: '2px 12px',
        fontSize: 11, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase',
        color: 'var(--md-on-surface-variant)',
        borderRadius: 4,
      }}>
        {label}
      </div>
      {children}
    </div>
  );
}

// ---------- Mount ----------
ReactDOM.createRoot(document.getElementById('root')).render(<App />);
