// ============ Main App — Customers List ============

const { useState: useAppState } = React;

function App() {
  const [selectedNav, setSelectedNav] = useAppState('crm');

  return (
    <div style={{ display: 'flex', flexDirection: 'row-reverse', minHeight: '100vh', width: 1440, margin: '0 auto', background: 'var(--md-surface)' }}>
      <NavRail selected={selectedNav} onSelect={setSelectedNav} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <TopBar />
        <main style={{ padding: '24px 32px 48px', display: 'flex', flexDirection: 'column', gap: 32 }}>
          <PageHeader />
          <KpiStrip />
          <Toolbar />
          <CustomersTable />
          <FlatModeAnnotation />
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
          <NavItem
            key={item.id}
            item={item}
            active={selected === item.id}
            onSelect={onSelect}
          />
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
  const { summary } = window;
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24 }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: 'var(--md-on-surface-variant)', marginBottom: 4 }}>
          <span>דשבורד</span>
          <span className="ms ms-flip-rtl" style={{ fontSize: 14, opacity: 0.6 }}>chevron_left</span>
          <span style={{ color: 'var(--md-on-surface)', fontWeight: 500 }}>לקוחות</span>
        </div>
        <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--md-on-surface)', lineHeight: 1.3 }}>
          ניהול לקוחות
        </div>
        <div style={{ fontSize: 14, color: 'var(--md-on-surface-variant)', marginTop: 4 }}>
          <span className="num" style={{ color: 'var(--md-primary)', fontWeight: 600 }}>{summary.active}</span> לקוחות פעילים
          {' · '}<span className="num" style={{ fontWeight: 600 }}>{summary.newThisMonth}</span> הצטרפו החודש
          {' · '}ערוץ מועדף נפוץ: <span style={{ fontWeight: 600 }}>WhatsApp</span> (<span className="num">{summary.whatsappPct}%</span>)
        </div>
      </div>
    </div>
  );
}

// ---------- KPI Strip (HERO mode with view toggle) ----------
function KpiStrip() {
  const { summary, ChannelDot } = window;
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {/* Toggle row */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-start', gap: 12 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
          <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: 0.4, textTransform: 'uppercase', color: 'var(--md-on-surface-variant)' }}>
            תצוגה
          </span>
          <ViewToggle active="hero" />
        </div>
      </div>

      {/* Tiles row */}
      <div style={{ display: 'flex', gap: 16, alignItems: 'stretch' }}>
        <HeroTile
          icon="group"
          value={184}
          label="לקוחות פעילים"
          subLabel={<>מתוך <span className="num">189</span> רשומות סה״כ</>}
          cta="כל הלקוחות"
        />
        <KpiTile
          icon="person_add"
          iconColor="var(--md-secondary)"
          value={12}
          label="חדשים החודש"
          subLabel="+3 לעומת חודש שעבר"
          subColor="var(--md-secondary)"
        />
        <TertiaryTile
          channel="whatsapp"
          value="71%"
          label="ערוץ מועדף"
          subLabel="מתוך הלקוחות בוחרים WhatsApp"
        />
        <KpiTile
          icon="person_off"
          iconColor="var(--md-on-surface-variant)"
          iconFill={0}
          value={5}
          label="לא פעילים"
          subLabel="הוסרו ידנית"
          valueColor="var(--md-on-surface-variant)"
          dashedBorder
          lowest
        />
      </div>
    </section>
  );
}

function ViewToggle({ active }) {
  const opts = [
    { id: 'flat', icon: 'grid_view' },
    { id: 'hero', icon: 'view_agenda' },
  ];
  return (
    <div style={{
      display: 'inline-flex',
      background: 'var(--md-surface-container)',
      borderRadius: 999, padding: 2, gap: 2,
      border: '1px solid var(--md-outline-variant)',
    }}>
      {opts.map(o => {
        const isActive = active === o.id;
        return (
          <button key={o.id} style={{
            width: 30, height: 30, borderRadius: 999, border: 'none',
            background: isActive ? 'var(--md-secondary-container)' : 'transparent',
            color: isActive ? 'var(--md-on-secondary-container)' : 'var(--md-on-surface-variant)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', transition: 'background 120ms ease',
          }}>
            <span className="ms" style={{
              fontSize: 16,
              fontVariationSettings: isActive ? "'FILL' 1, 'wght' 500, 'opsz' 20" : "'FILL' 0, 'wght' 400, 'opsz' 20",
            }}>{o.icon}</span>
          </button>
        );
      })}
    </div>
  );
}

function HeroTile({ icon, value, label, subLabel, cta }) {
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

      {/* Top row: icon + HERO pill */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <span style={{
          width: 36, height: 36, borderRadius: 10,
          background: 'rgba(255,255,255,0.18)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span className="ms" style={{
            fontSize: 22, color: 'rgba(255,255,255,0.92)',
            fontVariationSettings: "'FILL' 1, 'wght' 500, 'opsz' 24",
          }}>{icon}</span>
        </span>
        <span style={{
          fontSize: 10, fontWeight: 600, letterSpacing: 0.6,
          padding: '2px 8px', borderRadius: 999,
          background: 'rgba(255,255,255,0.18)', color: '#fff',
          textTransform: 'uppercase',
        }}>HERO</span>
      </div>

      {/* Value */}
      <div style={{
        marginTop: 14,
        fontSize: 48, fontWeight: 700, letterSpacing: -0.5, lineHeight: 1,
        color: '#fff',
      }}>
        <span className="num">{value}</span>
      </div>

      {/* Labels */}
      <div style={{ marginTop: 6, fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.85)' }}>
        {label}
      </div>
      <div style={{ fontSize: 11, fontWeight: 400, color: 'rgba(255,255,255,0.65)', marginTop: 2 }}>
        {subLabel}
      </div>

      {/* CTA pill */}
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
          <span>{cta}</span>
          <span className="ms ms-flip-rtl" style={{ fontSize: 14 }}>arrow_back</span>
        </button>
      </div>
    </div>
  );
}

function KpiTile({ icon, iconColor, iconFill = 1, value, label, subLabel, subColor, valueColor, dashedBorder, lowest }) {
  return (
    <div style={{
      flex: 1, minWidth: 160,
      background: lowest ? 'var(--md-surface-container-lowest)' : 'var(--md-surface-container-low)',
      border: dashedBorder ? '1px dashed var(--md-outline-variant)' : '1px solid var(--md-outline-variant)',
      borderRadius: 16, padding: 20,
      display: 'flex', flexDirection: 'column',
      minHeight: 168,
    }}>
      <span className="ms" style={{
        fontSize: 24, color: iconColor,
        fontVariationSettings: `'FILL' ${iconFill}, 'wght' 500, 'opsz' 24`,
      }}>{icon}</span>

      <div style={{
        marginTop: 14,
        fontSize: 36, fontWeight: 700, lineHeight: 1.05, letterSpacing: -0.3,
        color: valueColor || 'var(--md-on-surface)',
      }}>
        <span className="num">{value}</span>
      </div>

      <div style={{
        marginTop: 8,
        fontSize: 12, fontWeight: 600, letterSpacing: 0.4, textTransform: 'uppercase',
        color: 'var(--md-on-surface-variant)',
      }}>
        {label}
      </div>
      <div style={{ marginTop: 4, fontSize: 11, fontWeight: 400, color: subColor || 'var(--md-on-surface-variant)' }}>
        {subLabel}
      </div>
    </div>
  );
}

function TertiaryTile({ channel, value, label, subLabel }) {
  const { ChannelDot } = window;
  return (
    <div style={{
      flex: 1, minWidth: 160,
      background: 'var(--md-tertiary-container)',
      border: 'none',
      borderRadius: 16, padding: 20,
      display: 'flex', flexDirection: 'column',
      minHeight: 168,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <ChannelDot channel={channel} />
        <span style={{
          fontSize: 12, fontWeight: 600, letterSpacing: 0.4, textTransform: 'uppercase',
          color: 'var(--md-on-tertiary-container)',
        }}>{label}</span>
      </div>

      <div style={{
        marginTop: 14,
        fontSize: 36, fontWeight: 700, lineHeight: 1.05, letterSpacing: -0.3,
        color: 'var(--md-on-tertiary-container)',
      }}>
        <span className="num">{value}</span>
      </div>

      <div style={{
        marginTop: 'auto', paddingTop: 8,
        fontSize: 11, fontWeight: 400, color: 'rgba(0,32,34,0.70)',
      }}>
        {subLabel}
      </div>
    </div>
  );
}

// ---------- Toolbar ----------
function Toolbar() {
  const { FilledButton } = window;
  return (
    <div style={{
      background: 'var(--md-surface-container-low)',
      borderRadius: 16,
      border: '1px solid var(--md-outline-variant)',
      padding: '16px 24px',
      display: 'flex', flexDirection: 'column', gap: 14,
    }}>
      {/* Row 1: actions + search */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        {/* RIGHT (RTL start): actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <FilledButton icon="person_add" variant="filled" size="md">הוסף לקוח</FilledButton>
          <FilledButton icon="upload_file" variant="outlined" size="md">ייבא מ-Excel</FilledButton>
        </div>

        {/* LEFT (RTL end): search */}
        <div style={{ width: 420 }}>
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
              placeholder="חיפוש לפי שם או טלפון..."
              style={{
                flex: 1, border: 'none', background: 'transparent', outline: 'none',
                fontFamily: 'inherit', fontSize: 13, color: 'var(--md-on-surface)',
                textAlign: 'right',
              }}
            />
          </div>
        </div>
      </div>

      {/* Row 2: filters */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <FilterPill active>הכל</FilterPill>
        <FilterPill>פעיל</FilterPill>
        <FilterPill>לא פעיל</FilterPill>

        <div style={{ width: 1, height: 20, background: 'var(--md-outline-variant)', margin: '0 4px' }} />

        <FilterPill icon="expand_more">כל הסניפים</FilterPill>

        <div style={{ flex: 1 }} />

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          fontSize: 12, color: 'var(--md-on-surface-variant)',
          cursor: 'pointer',
        }}>
          <span>מיון: תאריך הצטרפות</span>
          <span className="ms" style={{ fontSize: 16 }}>expand_more</span>
        </div>
      </div>
    </div>
  );
}

function FilterPill({ active, icon, children }) {
  return (
    <button style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      height: 32, padding: icon ? '0 10px 0 12px' : '0 14px',
      borderRadius: 999,
      background: active ? 'var(--md-secondary-container)' : 'var(--md-surface-container)',
      color: active ? 'var(--md-on-secondary-container)' : 'var(--md-on-surface-variant)',
      border: active ? '1px solid transparent' : '1px solid var(--md-outline-variant)',
      cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 500,
      whiteSpace: 'nowrap',
    }}>
      <span>{children}</span>
      {icon && <span className="ms" style={{ fontSize: 16 }}>{icon}</span>}
    </button>
  );
}

// ---------- Customers DataTable ----------
function CustomersTable() {
  const { customers } = window;
  return (
    <div style={{
      background: 'var(--md-surface-container-low)',
      borderRadius: 16,
      border: '1px solid var(--md-outline-variant)',
      overflow: 'hidden',
    }}>
      <TableHeader />
      <div>
        {customers.map((c, i) => (
          <CustomerRow key={c.id} customer={c} zebra={i % 2 === 1} last={i === customers.length - 1} />
        ))}
      </div>
      <TableFooter />
    </div>
  );
}

const COLS = '1.2fr 130px 100px 88px 120px 88px 110px 72px';

function TableHeader() {
  const cell = {
    fontSize: 11, fontWeight: 600, letterSpacing: 0.4, textTransform: 'uppercase',
    color: 'var(--md-on-surface-variant)',
    display: 'flex', alignItems: 'center', gap: 4,
  };
  const sortable = {
    ...cell, cursor: 'pointer',
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
      <div style={sortable}>
        <span>שם מלא</span>
        <span className="ms" style={{ fontSize: 14 }}>arrow_downward</span>
      </div>
      <div style={cell}>טלפון</div>
      <div style={cell}>עיר</div>
      <div style={{ ...cell, justifyContent: 'center' }}>ערוץ מועדף</div>
      <div style={cell}>סניף</div>
      <div style={{ ...cell, justifyContent: 'center' }}>סטטוס</div>
      <div style={sortable}>
        <span>הצטרף</span>
        <span className="ms" style={{ fontSize: 14, opacity: 0.5 }}>unfold_more</span>
      </div>
      <div style={{ ...cell, justifyContent: 'center' }}>פעולות</div>
    </div>
  );
}

function CustomerRow({ customer: c, zebra, last }) {
  const { ChannelDot, StatusChip } = window;
  const [hover, setHover] = useAppState(false);
  const isHover = hover || c.forceHover;
  const inactive = c.status === 'inactive';

  let bg;
  if (inactive) {
    bg = isHover ? 'var(--md-surface-container-high)' : 'rgba(219,223,215,0.30)';
  } else if (isHover) {
    bg = 'var(--md-surface-container-high)';
  } else {
    bg = zebra ? 'var(--md-surface-container-low)' : 'var(--md-surface-container-lowest)';
  }

  const mutedColor = inactive ? 'var(--md-on-surface-variant)' : 'var(--md-on-surface)';
  const subColor = 'var(--md-on-surface-variant)';

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'grid',
        gridTemplateColumns: COLS,
        gap: 12, padding: '0 20px',
        height: 60, alignItems: 'center',
        background: bg,
        borderBottom: last ? 'none' : '1px solid var(--md-outline-variant)',
        boxShadow: isHover ? 'var(--shadow-1)' : 'none',
        position: 'relative', zIndex: isHover ? 1 : 0,
        transition: 'background 100ms ease, box-shadow 100ms ease',
        cursor: 'pointer',
      }}>
      {/* Name + avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
        <Avatar customer={c} muted={inactive} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          <span style={{
            fontSize: 14, fontWeight: 500, color: mutedColor,
            opacity: inactive ? 0.85 : 1,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>{c.name}</span>
          {c.isNew && (
            <span style={{
              fontSize: 11, fontWeight: 600, lineHeight: 1.2,
              padding: '2px 8px', borderRadius: 6,
              background: 'var(--md-primary-container)',
              color: 'var(--md-on-primary-container)',
              whiteSpace: 'nowrap',
            }}>חדש</span>
          )}
        </div>
      </div>

      {/* Phone */}
      <div className="num" style={{ fontSize: 13, color: subColor, opacity: inactive ? 0.7 : 1 }}>
        {c.phone}
      </div>

      {/* City */}
      <div style={{ fontSize: 13, color: mutedColor, opacity: inactive ? 0.75 : 1 }}>
        {c.city}
      </div>

      {/* Channel */}
      <div style={{ display: 'flex', justifyContent: 'center', opacity: inactive ? 0.5 : 1 }}>
        <ChannelDot channel={c.channel} />
      </div>

      {/* Branch */}
      <div style={{ fontSize: 13, color: mutedColor, opacity: inactive ? 0.75 : 1 }}>
        {c.branch}
      </div>

      {/* Status */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        {inactive
          ? <StatusChip kind="outlined">לא פעיל</StatusChip>
          : <StatusChip kind="filled-primary">פעיל</StatusChip>}
      </div>

      {/* Joined */}
      <div className="num" style={{ fontSize: 12, color: subColor }}>
        {c.joined}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
        {isHover ? (
          <>
            <RowAction icon="edit" label="ערוך" />
            <RowAction icon="open_in_new" label="פתח" />
            <RowAction icon="delete" label="מחק" danger />
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

function Avatar({ customer: c, muted }) {
  if (muted) {
    return (
      <div style={{
        width: 36, height: 36, borderRadius: '50%',
        background: 'var(--md-surface-container)',
        color: 'var(--md-on-surface-variant)',
        opacity: 0.55,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 13, fontWeight: 600,
        flexShrink: 0,
      }}>
        <span>{c.initials}</span>
      </div>
    );
  }
  return (
    <div style={{
      width: 36, height: 36, borderRadius: '50%',
      background: c.avatarGradient,
      color: '#fff',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 13, fontWeight: 600,
      flexShrink: 0,
    }}>
      <span>{c.initials}</span>
    </div>
  );
}

function RowAction({ icon, label, danger }) {
  const [hover, setHover] = useAppState(false);
  return (
    <button
      title={label} aria-label={label}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: 28, height: 28, borderRadius: '50%', border: 'none',
        background: hover ? (danger ? 'var(--md-error-container)' : 'var(--md-surface-container-high)') : 'transparent',
        cursor: 'pointer',
        color: hover && danger ? 'var(--md-error)' : 'var(--md-on-surface-variant)',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background 100ms ease, color 100ms ease',
      }}>
      <span className="ms" style={{ fontSize: 18 }}>{icon}</span>
    </button>
  );
}

function TableFooter() {
  return (
    <div style={{
      height: 48, padding: '0 20px',
      background: 'var(--md-surface-container)',
      borderTop: '1px solid var(--md-outline-variant)',
      display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 12,
    }}>
      {/* RIGHT (RTL start): count */}
      <div style={{ fontSize: 12, color: 'var(--md-on-surface-variant)' }}>
        מציג <span className="num" style={{ fontWeight: 600, color: 'var(--md-on-surface)' }}>8</span> מתוך <span className="num" style={{ fontWeight: 600, color: 'var(--md-on-surface)' }}>184</span> לקוחות
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
        <PagerButton>24</PagerButton>
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

// ---------- Annotation: Flat mode preview ----------
function FlatModeAnnotation() {
  const { ChannelDot } = window;
  return (
    <AnnotationFrame label="תצוגה חלופית — מצב שטוח">
      <div style={{ display: 'flex', gap: 16 }}>
        <FlatTile icon="group" iconColor="var(--md-primary)" value={184} label="לקוחות פעילים" />
        <FlatTile icon="person_add" iconColor="var(--md-secondary)" value={12} label="חדשים החודש" />
        <FlatTile channel="whatsapp" value="71%" label="ערוץ מועדף" />
        <FlatTile icon="person_off" iconColor="var(--md-on-surface-variant)" iconFill={0} value={5} label="לא פעילים" />
      </div>
    </AnnotationFrame>
  );
}

function FlatTile({ icon, iconColor, iconFill = 1, channel, value, label }) {
  const { ChannelDot } = window;
  return (
    <div style={{
      flex: 1,
      background: 'var(--md-surface-container-low)',
      border: '1px solid var(--md-outline-variant)',
      borderRadius: 16, padding: 20,
      display: 'flex', flexDirection: 'column', gap: 10,
      minHeight: 132,
    }}>
      {channel
        ? <ChannelDot channel={channel} />
        : (
          <span className="ms" style={{
            fontSize: 24, color: iconColor,
            fontVariationSettings: `'FILL' ${iconFill}, 'wght' 500, 'opsz' 24`,
          }}>{icon}</span>
        )}
      <div style={{ fontSize: 32, fontWeight: 700, lineHeight: 1.05, letterSpacing: -0.3, color: 'var(--md-on-surface)' }}>
        <span className="num">{value}</span>
      </div>
      <div style={{
        fontSize: 12, fontWeight: 600, letterSpacing: 0.4, textTransform: 'uppercase',
        color: 'var(--md-on-surface-variant)',
      }}>
        {label}
      </div>
    </div>
  );
}

// ---------- Annotation: Empty state ----------
function EmptyStateAnnotation() {
  const { FilledButton } = window;
  return (
    <AnnotationFrame label="מצב ריק — כשאין לקוחות">
      <div style={{
        background: 'var(--md-surface-container-lowest)',
        border: '1px solid var(--md-outline-variant)',
        borderRadius: 16, padding: '56px 24px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
      }}>
        <span className="ms" style={{
          fontSize: 72, color: 'var(--md-outline)',
          fontVariationSettings: "'FILL' 0, 'wght' 400, 'opsz' 48",
        }}>group</span>
        <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--md-on-surface)' }}>
          אין לקוחות עדיין
        </div>
        <div style={{ fontSize: 14, fontWeight: 400, color: 'var(--md-on-surface-variant)', textAlign: 'center' }}>
          הוסף לקוח ידנית או ייבא רשימה מ-Excel כדי להתחיל
        </div>
        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
          <FilledButton icon="person_add" variant="filled" size="md">הוסף לקוח</FilledButton>
          <FilledButton icon="upload_file" variant="outlined" size="md">ייבא מ-Excel</FilledButton>
        </div>
      </div>
    </AnnotationFrame>
  );
}

// ---------- Annotation frame ----------
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
