// ============ Main App ============

const { useState: useAppState, useEffect } = React;

function App() {
  const [selectedNav, setSelectedNav] = useAppState('dashboard');

  return (
    <div style={{ display: 'flex', flexDirection: 'row-reverse', minHeight: '100vh', width: 1440, margin: '0 auto', background: 'var(--md-surface)' }}>
      <NavRail selected={selectedNav} onSelect={setSelectedNav} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <TopBar />
        <main style={{ padding: '24px 32px 48px', display: 'flex', flexDirection: 'column', gap: 32 }}>
          <DashboardHeader />
          <KpiStrip />
          <TwoColumn />
          <ChartSection />
        </main>
      </div>
    </div>
  );
}

// ---------- Navigation Rail (RIGHT side, RTL) ----------
function NavRail({ selected, onSelect }) {
  const { navItems, IconButton } = window;
  return (
    <aside style={{
      width: 88, flexShrink: 0,
      background: 'var(--md-surface-container-low)',
      borderInlineStart: '1px solid var(--md-outline-variant)',
      display: 'flex', flexDirection: 'column',
      position: 'sticky', top: 0, height: '100vh',
    }}>
      {/* Logo */}
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

      {/* Nav items */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4, padding: '12px 8px', overflowY: 'auto' }}>
        {navItems.map(item => (
          <NavItem
            key={item.id}
            item={item}
            active={selected === item.id}
            hover={item.id === 'orders'}  /* show hover state on הזמנות per spec */
            onSelect={onSelect}
          />
        ))}
      </nav>

      {/* Bottom: avatar + store + plan badge */}
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
      {/* Right (start in RTL): store identity */}
      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 220 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--md-on-surface)', lineHeight: 1.3 }}>
          חיות הבית של אבי
        </div>
        <div style={{ fontSize: 13, color: 'var(--md-on-surface-variant)', lineHeight: 1.3 }}>
          יום שני, <span className="num">18 במאי 2026</span>
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

      {/* Left (end in RTL): actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <IconButton icon="help_outline" label="עזרה" />
        <IconButton icon="notifications" label="התראות" badge={4} />
        <div style={{ width: 1, height: 28, background: 'var(--md-outline-variant)', margin: '0 4px' }} />
        <FilledButton icon="add" variant="filled">הזמנה חדשה</FilledButton>
      </div>
    </header>
  );
}

// ---------- Greeting + period selector ----------
function DashboardHeader() {
  const [period, setPeriod] = useAppState('today');
  const opts = [
    { id: 'today', label: 'היום' },
    { id: 'week',  label: 'השבוע' },
    { id: 'month', label: 'החודש' },
  ];
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24 }}>
      <div>
        <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--md-on-surface)', lineHeight: 1.3 }}>
          בוקר טוב, אבי
        </div>
        <div style={{ fontSize: 14, color: 'var(--md-on-surface-variant)', marginTop: 4 }}>
          ככה נראה הבוקר שלך: <span style={{ color: 'var(--md-primary)', fontWeight: 600 }}><span className="num">23</span> הזמנות פתוחות</span>, <span style={{ color: 'var(--md-error)', fontWeight: 600 }}><span className="num">8</span> לקוחות שצריך לפנות אליהם</span> והכנסות גבוהות ב-<span className="num">18%</span> מאתמול.
        </div>
      </div>

      {/* Segmented period */}
      <div style={{
        display: 'inline-flex',
        background: 'var(--md-surface-container)',
        borderRadius: 999, padding: 4,
        border: '1px solid var(--md-outline-variant)',
      }}>
        {opts.map(o => (
          <button
            key={o.id}
            onClick={() => setPeriod(o.id)}
            style={{
              padding: '6px 16px', borderRadius: 999, border: 'none',
              background: period === o.id ? 'var(--md-primary)' : 'transparent',
              color: period === o.id ? 'var(--md-on-primary)' : 'var(--md-on-surface-variant)',
              fontFamily: 'inherit', fontSize: 13, fontWeight: 500,
              cursor: 'pointer', transition: 'all 120ms ease',
            }}>
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ---------- KPI Strip ----------
function KpiStrip() {
  return (
    <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.18fr 1fr', gap: 16 }}>
      <KpiTile
        icon="payments"
        label="הכנסות היום"
        value={<><span style={{ fontSize: 22, fontWeight: 500, color: 'var(--md-on-surface-variant)' }}>₪</span><span className="num">12,450</span></>}
        delta={{ dir: 'up', text: '+18% מאתמול' }}
        accent={<Sparkline data={window.sparkRevenue} width={104} height={36} />}
      />
      <KpiTile
        icon="receipt_long"
        label="הזמנות פתוחות"
        value={<span className="num">23</span>}
        subline={<><span style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: 'var(--md-warning-container)', color: 'var(--md-on-warning-container)',
          padding: '3px 10px', borderRadius: 999, fontSize: 12, fontWeight: 600,
        }}>
          <span className="num">5</span> ממתינות לאישור
        </span></>}
        delta={{ dir: 'up', text: '+4 מאתמול' }}
      />
      <KpiTile hero
        icon="pet_supplies"
        label="לקוחות עומדים לאזול"
        value={<><span className="num">8</span> <span style={{ fontSize: 18, fontWeight: 500, opacity: 0.85 }}>לקוחות</span></>}
        subline={<span style={{ opacity: 0.92 }}>בשבוע הקרוב · <span className="num">₪3,840</span> פוטנציאל</span>}
        cta="פנה אליהם עכשיו"
        runOut={window.runOutPreview}
      />
      <KpiTile
        icon="inventory_2"
        label="מלאי בסכנה"
        value={<><span className="num">3</span> <span style={{ fontSize: 18, fontWeight: 500, color: 'var(--md-on-surface-variant)' }}>פריטים</span></>}
        subline={<span style={{ color: 'var(--md-on-surface-variant)', fontSize: 13 }}>מתחת ל-<span className="num">20%</span> מהמינימום</span>}
        stockPreview={window.lowStockPreview}
      />
    </section>
  );
}

function KpiTile({ icon, label, value, subline, delta, accent, hero, cta, runOut, stockPreview }) {
  const { Sparkline } = window;
  const heroStyle = hero ? {
    background: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 55%, #38656A 100%)',
    color: 'var(--md-on-primary)',
    border: 'none',
    boxShadow: '0 1px 3px rgba(27,94,32,0.20), 0 8px 24px -8px rgba(27,94,32,0.35)',
    position: 'relative',
    overflow: 'hidden',
  } : {};
  return (
    <div style={{
      background: 'var(--md-surface-container-low)',
      borderRadius: 16, padding: 20,
      border: '1px solid var(--md-outline-variant)',
      display: 'flex', flexDirection: 'column',
      minHeight: 168,
      position: 'relative',
      ...heroStyle,
    }}>
      {hero && (
        <div aria-hidden="true" style={{
          position: 'absolute', insetInlineStart: -40, top: -40,
          width: 200, height: 200, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.10), rgba(255,255,255,0) 70%)',
          pointerEvents: 'none',
        }} />
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{
            width: 32, height: 32, borderRadius: 10,
            background: hero ? 'rgba(255,255,255,0.18)' : 'var(--md-primary-container)',
            color: hero ? 'var(--md-on-primary)' : 'var(--md-on-primary-container)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span className="ms" style={{ fontSize: 18, fontVariationSettings: "'FILL' 1, 'wght' 500" }}>{icon}</span>
          </span>
          <span style={{
            fontSize: 13, fontWeight: 500,
            color: hero ? 'rgba(255,255,255,0.92)' : 'var(--md-on-surface-variant)',
            letterSpacing: 0.1,
          }}>{label}</span>
        </div>
        {hero && (
          <span style={{
            fontSize: 10, fontWeight: 700, letterSpacing: 0.8,
            padding: '4px 8px', borderRadius: 999,
            background: 'rgba(255,255,255,0.18)', color: '#fff',
            textTransform: 'uppercase',
          }}>HERO</span>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 }}>
        <div style={{
          fontSize: 36, fontWeight: 700, letterSpacing: -0.5, lineHeight: 1.1,
          color: hero ? 'var(--md-on-primary)' : 'var(--md-on-surface)',
        }}>
          {value}
        </div>
        {accent && <div style={{ marginBottom: 4 }}>{accent}</div>}
      </div>

      {subline && (
        <div style={{ marginTop: 6, fontSize: 13, color: hero ? 'rgba(255,255,255,0.92)' : 'var(--md-on-surface-variant)' }}>
          {subline}
        </div>
      )}

      {delta && (
        <div style={{
          marginTop: 'auto', paddingTop: 12, display: 'inline-flex', alignItems: 'center', gap: 6,
          fontSize: 12, fontWeight: 600,
          color: delta.dir === 'up' ? 'var(--md-primary)' : 'var(--md-error)',
        }}>
          <span className="ms" style={{ fontSize: 16 }}>{delta.dir === 'up' ? 'trending_up' : 'trending_down'}</span>
          <span>{delta.text}</span>
          <span style={{ color: 'var(--md-on-surface-variant)', fontWeight: 400 }}>· מול שבוע שעבר</span>
        </div>
      )}

      {/* Hero CTA */}
      {hero && cta && (
        <div style={{ marginTop: 'auto', paddingTop: 16 }}>
          {/* Mini preview of customers */}
          <div style={{ display: 'flex', alignItems: 'center', gap: -4, marginBottom: 12 }}>
            {runOut && runOut.slice(0, 4).map((r, i) => (
              <div key={i} title={`${r.customer} · ${r.pet}`} style={{
                width: 26, height: 26, borderRadius: '50%',
                background: 'rgba(255,255,255,0.20)',
                border: '2px solid #1B5E20',
                marginInlineStart: i === 0 ? 0 : -8,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 600, color: '#fff',
              }}>
                {r.customer.split(' ')[0][0]}{r.customer.split(' ')[1] ? r.customer.split(' ')[1][0] : ''}
              </div>
            ))}
            <div style={{
              width: 26, height: 26, borderRadius: '50%',
              background: 'rgba(255,255,255,0.12)', border: '2px solid #1B5E20',
              marginInlineStart: -8,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 10, fontWeight: 700, color: '#fff',
            }}>
              <span className="num">+4</span>
            </div>
          </div>
          <button style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '10px 18px', borderRadius: 999,
            background: '#fff', color: 'var(--md-primary)',
            border: 'none', cursor: 'pointer',
            fontFamily: 'inherit', fontSize: 13, fontWeight: 600,
            boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
          }}>
            <span>{cta}</span>
            <span className="ms ms-flip-rtl" style={{ fontSize: 18 }}>arrow_back</span>
          </button>
        </div>
      )}

      {/* Stock preview */}
      {stockPreview && (
        <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {stockPreview.map((s, i) => {
            const pct = Math.round((s.left / s.min) * 100);
            return (
              <div key={i} style={{ fontSize: 11, color: 'var(--md-on-surface-variant)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 180 }}>
                    {s.name}
                  </span>
                  <span className="num" style={{ fontWeight: 600, color: pct < 50 ? 'var(--md-error)' : 'var(--md-warning)' }}>
                    {s.left}/{s.min}
                  </span>
                </div>
                <div style={{ height: 4, background: 'var(--md-surface-container-high)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', width: `${Math.min(100, pct)}%`,
                    background: pct < 50 ? 'var(--md-error)' : 'var(--md-warning)',
                    borderRadius: 2,
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ---------- Two-col: Order Stream + Alerts ----------
function TwoColumn() {
  return (
    <section style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 16 }}>
      <OrderStream />
      <AlertsColumn />
    </section>
  );
}

function OrderStream() {
  const { orders, statusMap, ChannelDot, StatusChip, FilledButton, IconButton } = window;
  const [filter, setFilter] = useAppState('all');
  const filters = [
    { id: 'all', label: 'הכל', count: orders.length },
    { id: 'new', label: 'חדשות', count: orders.filter(o => o.status === 'new').length },
    { id: 'processing', label: 'בטיפול', count: orders.filter(o => o.status === 'processing').length },
    { id: 'shipped', label: 'נשלחו', count: orders.filter(o => o.status === 'shipped').length },
  ];
  const visible = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  return (
    <div style={{
      background: 'var(--md-surface-container-low)',
      borderRadius: 16,
      border: '1px solid var(--md-outline-variant)',
      display: 'flex', flexDirection: 'column',
      minHeight: 600,
    }}>
      {/* Header */}
      <div style={{ padding: '20px 24px 12px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--md-on-surface)' }}>הזמנות אחרונות</h2>
            <p style={{ margin: '2px 0 0', fontSize: 13, color: 'var(--md-on-surface-variant)' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 6, height: 6, borderRadius: 3, background: '#22C55E', boxShadow: '0 0 0 4px rgba(34,197,94,0.18)' }} />
                בזמן אמת
              </span>
              {' · '}<span className="num">23</span> פתוחות מתוך <span className="num">{orders.length}</span> בהצגה
            </p>
          </div>
          <a href="#" style={{
            fontSize: 13, fontWeight: 500, color: 'var(--md-primary)',
            textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4,
          }}>
            כל ההזמנות
            <span className="ms ms-flip-rtl" style={{ fontSize: 18 }}>arrow_back</span>
          </a>
        </div>

        {/* Filter chips */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {filters.map(f => (
            <button key={f.id}
              onClick={() => setFilter(f.id)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '6px 14px', borderRadius: 8,
                background: filter === f.id ? 'var(--md-secondary-container)' : 'transparent',
                color: filter === f.id ? 'var(--md-on-secondary-container)' : 'var(--md-on-surface-variant)',
                border: `1px solid ${filter === f.id ? 'transparent' : 'var(--md-outline-variant)'}`,
                cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 500,
              }}>
              {filter === f.id && <span className="ms" style={{ fontSize: 16 }}>check</span>}
              <span>{f.label}</span>
              <span className="num" style={{
                background: filter === f.id ? 'rgba(0,0,0,0.08)' : 'var(--md-surface-container-high)',
                padding: '0 6px', borderRadius: 6, fontSize: 11, fontWeight: 600,
              }}>{f.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* List header */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '36px 1fr 1.4fr 110px 90px 120px',
        gap: 16, padding: '10px 24px',
        fontSize: 11, fontWeight: 600, color: 'var(--md-on-surface-variant)',
        letterSpacing: 0.4, textTransform: 'uppercase',
        borderBottom: '1px solid var(--md-outline-variant)',
      }}>
        <div></div>
        <div>לקוח</div>
        <div>מוצר</div>
        <div>סטטוס</div>
        <div style={{ textAlign: 'start' }}>סכום</div>
        <div style={{ textAlign: 'start' }}>פעולות</div>
      </div>

      {/* List */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {visible.map((o, i) => <OrderRow key={o.id} order={o} last={i === visible.length - 1} />)}
      </div>
    </div>
  );
}

function OrderRow({ order, last }) {
  const { statusMap, channelMap, ChannelDot, StatusChip } = window;
  const [hover, setHover] = useAppState(false);
  const st = statusMap[order.status];
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'grid',
        gridTemplateColumns: '36px 1fr 1.4fr 110px 90px 120px',
        gap: 16, padding: '14px 24px', alignItems: 'center',
        borderBottom: last ? 'none' : '1px solid var(--md-outline-variant)',
        background: hover ? 'var(--md-surface-container)' : 'transparent',
        transition: 'background 100ms ease',
        cursor: 'pointer',
      }}>
      <ChannelDot channel={order.channel} />

      {/* Customer */}
      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--md-on-surface)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>{order.customer}</span>
          <span className="num" style={{ fontSize: 11, color: 'var(--md-on-surface-variant)', fontWeight: 500 }}>{order.id}</span>
        </div>
        <div style={{ fontSize: 12, color: 'var(--md-on-surface-variant)', display: 'flex', alignItems: 'center', gap: 5 }}>
          <span className="ms" style={{ fontSize: 13 }}>pets</span>
          <span>{order.pet}</span>
        </div>
      </div>

      {/* Product */}
      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <div style={{ fontSize: 13, color: 'var(--md-on-surface)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {order.product}
        </div>
        <div style={{ fontSize: 11, color: 'var(--md-on-surface-variant)' }}>
          <span className="num">{order.qty}</span> פריטים · <span className="num">{order.time}</span>
        </div>
      </div>

      {/* Status */}
      <div>
        <StatusChip kind={st.kind}>{st.label}</StatusChip>
      </div>

      {/* Amount */}
      <div className="currency" style={{ fontSize: 14, fontWeight: 600, color: 'var(--md-on-surface)' }}>
        ₪{order.price.toLocaleString('en-US')}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-start' }}>
        {order.status === 'new' ? (
          <>
            <button style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              padding: '6px 12px', borderRadius: 999,
              background: 'var(--md-primary)', color: 'var(--md-on-primary)',
              border: 'none', cursor: 'pointer', fontFamily: 'inherit',
              fontSize: 12, fontWeight: 500,
            }}>
              <span className="ms" style={{ fontSize: 14 }}>check</span>
              אישור
            </button>
            <button title="עוד" style={{
              width: 28, height: 28, borderRadius: '50%', border: 'none',
              background: 'transparent', cursor: 'pointer',
              color: 'var(--md-on-surface-variant)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span className="ms" style={{ fontSize: 18 }}>more_vert</span>
            </button>
          </>
        ) : order.status === 'processing' ? (
          <button style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '6px 12px', borderRadius: 999,
            background: 'var(--md-secondary-container)', color: 'var(--md-on-secondary-container)',
            border: 'none', cursor: 'pointer', fontFamily: 'inherit',
            fontSize: 12, fontWeight: 500,
          }}>
            <span className="ms" style={{ fontSize: 14 }}>local_shipping</span>
            הקצה שליח
          </button>
        ) : (
          <button title="פעולות" style={{
            width: 28, height: 28, borderRadius: '50%', border: 'none',
            background: 'transparent', cursor: 'pointer',
            color: 'var(--md-on-surface-variant)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span className="ms" style={{ fontSize: 18 }}>more_horiz</span>
          </button>
        )}
      </div>
    </div>
  );
}

function AlertsColumn() {
  const { alerts } = window;
  return (
    <div style={{
      background: 'var(--md-surface-container-low)',
      borderRadius: 16,
      border: '1px solid var(--md-outline-variant)',
      display: 'flex', flexDirection: 'column',
      minHeight: 600,
    }}>
      <div style={{ padding: '20px 20px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--md-on-surface)' }}>
            דורש תשומת לב
          </h2>
          <p style={{ margin: '2px 0 0', fontSize: 13, color: 'var(--md-on-surface-variant)' }}>
            <span className="num">{alerts.length}</span> פריטים פתוחים
          </p>
        </div>
        <button style={{
          width: 32, height: 32, borderRadius: '50%', border: 'none',
          background: 'transparent', cursor: 'pointer',
          color: 'var(--md-on-surface-variant)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span className="ms" style={{ fontSize: 20 }}>tune</span>
        </button>
      </div>

      <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {alerts.map((a, i) => <AlertCard key={i} alert={a} />)}
        <button style={{
          marginTop: 4, padding: '10px', borderRadius: 12,
          background: 'transparent', border: '1px dashed var(--md-outline-variant)',
          color: 'var(--md-on-surface-variant)', cursor: 'pointer',
          fontFamily: 'inherit', fontSize: 13, fontWeight: 500,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        }}>
          <span className="ms" style={{ fontSize: 16 }}>expand_more</span>
          הצג עוד <span className="num">3</span>
        </button>
      </div>
    </div>
  );
}

function AlertCard({ alert }) {
  const isError = alert.sev === 'error';
  const palette = isError ? {
    bg: 'var(--md-error-container)',
    border: 'transparent',
    dot: 'var(--md-error)',
    iconBg: 'rgba(179, 38, 30, 0.10)',
    iconColor: 'var(--md-error)',
    title: 'var(--md-on-error-container)',
    body: 'rgba(65, 14, 11, 0.78)',
    btnBg: 'var(--md-error)',
    btnColor: '#fff',
    label: 'דחוף',
  } : {
    bg: 'var(--md-warning-container)',
    border: 'transparent',
    dot: 'var(--md-warning)',
    iconBg: 'rgba(245, 158, 11, 0.14)',
    iconColor: '#A65F00',
    title: 'var(--md-on-warning-container)',
    body: 'rgba(74, 47, 0, 0.78)',
    btnBg: '#A65F00',
    btnColor: '#fff',
    label: 'אזהרה',
  };
  return (
    <div style={{
      background: palette.bg, borderRadius: 12, padding: 14,
      border: `1px solid ${palette.border}`,
      display: 'flex', gap: 12,
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10, flexShrink: 0,
        background: palette.iconBg, color: palette.iconColor,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <span className="ms" style={{ fontSize: 20, fontVariationSettings: "'FILL' 1, 'wght' 500" }}>{alert.icon}</span>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
          <span style={{ width: 8, height: 8, borderRadius: 4, background: palette.dot, flexShrink: 0 }} />
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.6, color: palette.dot, textTransform: 'uppercase' }}>
            {palette.label}
          </span>
        </div>
        <div style={{ fontSize: 13, fontWeight: 600, color: palette.title, lineHeight: 1.45, marginBottom: 4 }}>
          {alert.title}
        </div>
        <div style={{ fontSize: 12, color: palette.body, lineHeight: 1.5, marginBottom: 10 }}>
          {alert.body}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
          <button style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '6px 14px', borderRadius: 999,
            background: palette.btnBg, color: palette.btnColor, border: 'none',
            cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: 600,
          }}>
            <span className="ms" style={{ fontSize: 14 }}>{alert.ctaIcon}</span>
            {alert.cta}
          </button>
          <button title="התעלם" style={{
            width: 28, height: 28, borderRadius: '50%', border: 'none',
            background: 'transparent', cursor: 'pointer',
            color: palette.body,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span className="ms" style={{ fontSize: 16 }}>close</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------- Chart Section ----------
function ChartSection() {
  const { RevenueChart, chartDays } = window;
  const totalRev = chartDays.reduce((s, d) => s + d.total, 0);
  const totalManual = chartDays.reduce((s, d) => s + d.manual, 0);
  const totalDigital = chartDays.reduce((s, d) => s + d.digital, 0);
  return (
    <div style={{
      background: 'var(--md-surface-container-low)',
      borderRadius: 16, padding: '24px 24px 8px',
      border: '1px solid var(--md-outline-variant)',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap', marginBottom: 20 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--md-on-surface)' }}>
            מגמת הכנסות — <span className="num">30</span> הימים האחרונים
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--md-on-surface-variant)' }}>
            סך הכנסות החודש: <span className="currency" style={{ fontWeight: 600, color: 'var(--md-on-surface)' }}>₪{totalRev.toLocaleString('en-US')}</span>
            {' · '}עליה של <span style={{ color: 'var(--md-primary)', fontWeight: 600 }}>+<span className="num">12.4</span>%</span> מהחודש הקודם
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <Legend dotColor="var(--md-primary)" label="ידני (טלפון + WhatsApp)" value={totalManual} />
          <Legend dotColor="var(--md-tertiary)" label="דיגיטלי (WooCommerce)" value={totalDigital} />
          <div style={{
            display: 'inline-flex',
            background: 'var(--md-surface-container)',
            borderRadius: 999, padding: 4, border: '1px solid var(--md-outline-variant)',
          }}>
            {['7י', '30י', '90י'].map((l, i) => (
              <button key={i} style={{
                padding: '4px 12px', borderRadius: 999, border: 'none',
                background: i === 1 ? 'var(--md-surface-container-lowest)' : 'transparent',
                color: i === 1 ? 'var(--md-on-surface)' : 'var(--md-on-surface-variant)',
                fontFamily: 'inherit', fontSize: 12, fontWeight: 600,
                cursor: 'pointer',
                boxShadow: i === 1 ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
              }}>{l}</button>
            ))}
          </div>
        </div>
      </div>

      <RevenueChart data={chartDays} />
    </div>
  );
}

function Legend({ dotColor, label, value }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--md-on-surface-variant)' }}>
        <span style={{ width: 10, height: 10, borderRadius: 2, background: dotColor }} />
        <span>{label}</span>
      </div>
      <div className="currency" style={{ fontSize: 14, fontWeight: 700, color: 'var(--md-on-surface)', paddingInlineStart: 16 }}>
        ₪{value.toLocaleString('en-US')}
      </div>
    </div>
  );
}

// ---------- Mount ----------
ReactDOM.createRoot(document.getElementById('root')).render(<App />);
