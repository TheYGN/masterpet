// ============ App: Order Inbox ============

const { useState: useInboxState } = React;

function App() {
  const [selectedNav, setSelectedNav] = useInboxState('inbox');
  return (
    <div style={{
      display: 'flex', flexDirection: 'row-reverse',
      minHeight: '100vh', width: 1440, margin: '0 auto',
      background: 'var(--md-surface)',
    }}>
      <NavRail selected={selectedNav} onSelect={setSelectedNav} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <TopBar />
        <main style={{ padding: '24px 32px 48px', display: 'flex', flexDirection: 'column', gap: 24 }}>
          <InboxHeader />
          <KpiStrip />
          <SplitView />
        </main>
      </div>
    </div>
  );
}

// ---------- Nav Rail (verbatim from dashboard) ----------
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
          background: 'var(--md-primary)', color: 'var(--md-on-primary)',
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
        padding: '16px 8px 20px', borderTop: '1px solid var(--md-outline-variant)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
      }}>
        <div style={{
          width: 44, height: 44, borderRadius: '50%',
          background: 'linear-gradient(135deg, #38656A 0%, #1B5E20 100%)',
          color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
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
          padding: '2px 8px', borderRadius: 999, textTransform: 'uppercase',
        }}>PRO</div>
      </div>
    </aside>
  );
}

// ---------- Top Bar (matches dashboard, screen-specific CTA) ----------
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
          יום שני, <span className="num">19 במאי 2026</span>
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
        <FilledButton icon="edit_note" variant="filled">הזמנה ידנית</FilledButton>
      </div>
    </header>
  );
}

// ---------- Page header strip ----------
function InboxHeader() {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24 }}>
      <div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 600, color: 'var(--md-on-surface-variant)', letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 4 }}>
          <span className="ms" style={{ fontSize: 16 }}>inbox</span>
          תיבת ההודעות הנכנסות
        </div>
        <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--md-on-surface)', lineHeight: 1.3 }}>
          אינבוקס הזמנות
        </div>
        <div style={{ fontSize: 14, color: 'var(--md-on-surface-variant)', marginTop: 4 }}>
          <span className="num">12</span> הודעות פתוחות · <span style={{ color: 'var(--md-error)', fontWeight: 600 }}><span className="num">3</span> ממתינות מעל שעתיים</span> · רוב הלחץ הגיע מ-<span style={{ fontWeight: 600 }}>WhatsApp</span> ({<span className="num">8</span>} שיחות)
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          height: 40, padding: '0 16px', borderRadius: 999,
          background: 'transparent',
          color: 'var(--md-primary)',
          border: '1px solid var(--md-outline)',
          fontFamily: 'inherit', fontSize: 13, fontWeight: 500,
          cursor: 'pointer',
        }}>
          <span className="ms" style={{ fontSize: 18 }}>filter_alt</span>
          סינון
        </button>
        <button style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          height: 40, padding: '0 16px', borderRadius: 999,
          background: 'transparent',
          color: 'var(--md-primary)',
          border: '1px solid var(--md-outline)',
          fontFamily: 'inherit', fontSize: 13, fontWeight: 500,
          cursor: 'pointer',
        }}>
          <span className="ms" style={{ fontSize: 18 }}>done_all</span>
          סמן הכל כנקראו
        </button>
      </div>
    </div>
  );
}

// ---------- KPI Strip ----------
function KpiStrip() {
  return (
    <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 16 }}>
      <KpiHero />
      <KpiWarning />
      <KpiChannel
        bg="rgba(37, 211, 102, 0.10)"
        border="1px solid rgba(37, 211, 102, 0.30)"
        iconBg="rgba(37, 211, 102, 0.18)"
        iconColor="#25D366"
        chIcon="chat"
        chColor="#25D366"
        label="WhatsApp פתוחות"
        value={8}
        sub="הודעות לא מטופלות"
        accent="WhatsApp"
        miniIcons={['mark_chat_unread', 'thumb_up', 'photo_camera']}
      />
      <KpiChannel
        bg="rgba(127, 84, 179, 0.08)"
        border="1px solid rgba(127, 84, 179, 0.25)"
        iconBg="rgba(127, 84, 179, 0.18)"
        iconColor="#7F54B3"
        chIcon="shopping_cart"
        chColor="#7F54B3"
        label="WooCommerce פתוחות"
        value={4}
        sub="הזמנות אונליין ממתינות"
        accent="WooCommerce"
        miniIcons={['receipt_long', 'credit_card', 'local_shipping']}
      />
    </section>
  );
}

function KpiHero() {
  return (
    <div style={{
      position: 'relative', overflow: 'hidden',
      borderRadius: 16, padding: 20,
      background: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 55%, #38656A 100%)',
      color: 'var(--md-on-primary)',
      boxShadow: '0 1px 3px rgba(27,94,32,0.20), 0 8px 24px -8px rgba(27,94,32,0.35)',
      minHeight: 168, display: 'flex', flexDirection: 'column',
    }}>
      <div aria-hidden="true" style={{
        position: 'absolute', insetInlineStart: -40, top: -40,
        width: 220, height: 220, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,255,255,0.10), rgba(255,255,255,0) 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{
            width: 32, height: 32, borderRadius: 10,
            background: 'rgba(255,255,255,0.18)', color: '#fff',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span className="ms" style={{ fontSize: 18, fontVariationSettings: "'FILL' 1, 'wght' 500" }}>inbox</span>
          </span>
          <span style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.92)' }}>
            בהמתנה לאישור
          </span>
        </div>
        <span style={{
          fontSize: 10, fontWeight: 700, letterSpacing: 0.8,
          padding: '4px 8px', borderRadius: 999,
          background: 'rgba(255,255,255,0.18)', color: '#fff',
          textTransform: 'uppercase',
        }}>HERO</span>
      </div>

      <div style={{ marginTop: 12, fontSize: 36, fontWeight: 700, letterSpacing: -0.5, lineHeight: 1.1 }}>
        <span className="num">12</span>
      </div>
      <div style={{ marginTop: 4, fontSize: 13, color: 'rgba(255,255,255,0.92)' }}>
        הזמנות חדשות בכל הערוצים
      </div>

      <div style={{ marginTop: 'auto', paddingTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '10px 18px', borderRadius: 999,
          background: '#fff', color: 'var(--md-primary)',
          border: 'none', cursor: 'pointer',
          fontFamily: 'inherit', fontSize: 13, fontWeight: 600,
          boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
        }}>
          <span>אשר את הבאות</span>
          <span className="ms ms-flip-rtl" style={{ fontSize: 18 }}>arrow_back</span>
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'rgba(255,255,255,0.85)' }}>
          <span style={{ width: 6, height: 6, borderRadius: 3, background: '#9BE9A8', boxShadow: '0 0 0 4px rgba(155,233,168,0.20)' }} />
          חי כרגע
        </div>
      </div>
    </div>
  );
}

function KpiWarning() {
  return (
    <div style={{
      borderRadius: 16, padding: 20,
      background: 'var(--md-warning-container)',
      border: '1px solid rgba(245,158,11,0.25)',
      minHeight: 168, display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{
            width: 32, height: 32, borderRadius: 10,
            background: 'rgba(245,158,11,0.18)', color: '#A65F00',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span className="ms" style={{ fontSize: 18, fontVariationSettings: "'FILL' 1, 'wght' 500" }}>schedule</span>
          </span>
          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--md-on-warning-container)' }}>
            ממתינות מעל שעתיים
          </span>
        </div>
        <span style={{
          width: 10, height: 10, borderRadius: 5,
          background: 'var(--md-warning)',
          boxShadow: '0 0 0 4px rgba(245,158,11,0.18)',
        }} />
      </div>

      <div style={{ marginTop: 12, fontSize: 36, fontWeight: 700, letterSpacing: -0.5, lineHeight: 1.1, color: 'var(--md-on-warning-container)' }}>
        <span className="num">3</span>
      </div>
      <div style={{ marginTop: 4, fontSize: 13, color: 'rgba(74,47,0,0.78)' }}>
        לקוחות מחכים — פנה אליהם מיד
      </div>

      <div style={{ marginTop: 'auto', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
        {[
          { name: 'אורי דהן', t: 'שעתיים ו-12 דק׳' },
          { name: 'אבי שטרן', t: 'שעתיים ו-34 דק׳' },
          { name: 'אורית דוד', t: 'שלוש שעות ו-04 דק׳' },
        ].map((r, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: 'rgba(74,47,0,0.78)' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <span className="ms" style={{ fontSize: 12, color: 'var(--md-warning)' }}>chevron_left</span>
              <span style={{ color: 'var(--md-on-warning-container)', fontWeight: 500 }}>{r.name}</span>
            </span>
            <span style={{ direction: 'rtl' }}>{r.t}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function KpiChannel({ bg, border, iconBg, iconColor, chIcon, label, value, sub, accent, miniIcons }) {
  return (
    <div style={{
      borderRadius: 16, padding: 20,
      background: bg, border,
      minHeight: 168, display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{
            width: 32, height: 32, borderRadius: 10,
            background: iconBg, color: iconColor,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span className="ms" style={{ fontSize: 18, fontVariationSettings: "'FILL' 1, 'wght' 500" }}>{chIcon}</span>
          </span>
          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--md-on-surface-variant)' }}>{label}</span>
        </div>
        <span style={{
          fontSize: 10, fontWeight: 700, letterSpacing: 0.6,
          padding: '3px 8px', borderRadius: 999,
          background: iconBg, color: iconColor,
        }}>{accent}</span>
      </div>

      <div style={{ marginTop: 12, fontSize: 36, fontWeight: 700, letterSpacing: -0.5, lineHeight: 1.1, color: iconColor }}>
        <span className="num">{value}</span>
      </div>
      <div style={{ marginTop: 4, fontSize: 13, color: 'var(--md-on-surface-variant)' }}>{sub}</div>

      <div style={{ marginTop: 'auto', paddingTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {miniIcons.map((m, i) => (
            <span key={i} style={{
              width: 22, height: 22, borderRadius: 6,
              background: iconBg, color: iconColor,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span className="ms" style={{ fontSize: 14 }}>{m}</span>
            </span>
          ))}
        </div>
        <a href="#" style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          fontSize: 12, fontWeight: 600, color: iconColor, textDecoration: 'none',
        }}>
          פתח ערוץ
          <span className="ms ms-flip-rtl" style={{ fontSize: 16 }}>arrow_back</span>
        </a>
      </div>
    </div>
  );
}

// ---------- Split View ----------
function SplitView() {
  return (
    <section style={{
      display: 'flex', flexDirection: 'row',
      borderRadius: 16, overflow: 'hidden',
      border: '1px solid var(--md-outline-variant)',
      background: 'var(--md-surface-container-lowest)',
      minHeight: 720,
    }}>
      <MessageDetail />
      <MessageList />
    </section>
  );
}

// ---------- Message List (right side, RTL start) ----------
function MessageList() {
  const { inboxRows, channelMap, ChannelDot } = window;
  const [selectedId, setSelectedId] = useInboxState(1);
  const [activeTab, setActiveTab] = useInboxState('all');
  const tabs = [
    { id: 'all',    label: 'הכל',    count: 12 },
    { id: 'new',    label: 'חדשות',  count: 7 },
    { id: 'late',   label: 'לא נענו', count: 3 },
    { id: 'vip',    label: 'VIP',    count: 2 },
  ];

  return (
    <div style={{
      width: 400, flexShrink: 0,
      borderInlineStart: '1px solid var(--md-outline-variant)',
      display: 'flex', flexDirection: 'column',
      background: 'var(--md-surface-container-low)',
    }}>
      {/* Filter bar */}
      <div style={{ padding: '16px 20px 12px', display: 'flex', flexDirection: 'column', gap: 12, borderBottom: '1px solid var(--md-outline-variant)' }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {tabs.map(t => (
            <button key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '6px 12px', borderRadius: 999,
                background: activeTab === t.id ? 'var(--md-secondary-container)' : 'transparent',
                color: activeTab === t.id ? 'var(--md-on-secondary-container)' : 'var(--md-on-surface-variant)',
                border: `1px solid ${activeTab === t.id ? 'transparent' : 'var(--md-outline-variant)'}`,
                cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: 500,
              }}>
              <span>{t.label}</span>
              <span className="num" style={{
                background: activeTab === t.id ? 'rgba(0,0,0,0.08)' : 'var(--md-surface-container-high)',
                padding: '0 6px', borderRadius: 6, fontSize: 11, fontWeight: 600,
              }}>{t.count}</span>
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            height: 32, padding: '0 12px', borderRadius: 999,
            background: 'transparent', color: 'var(--md-on-surface-variant)',
            border: '1px solid var(--md-outline-variant)',
            fontFamily: 'inherit', fontSize: 12, fontWeight: 500,
            cursor: 'pointer',
          }}>
            <span>לפי דחיפות</span>
            <span className="ms" style={{ fontSize: 16 }}>expand_more</span>
          </button>
          <div style={{ display: 'flex', gap: 4 }}>
            <button title="חיפוש" style={{
              width: 32, height: 32, borderRadius: '50%', border: 'none', background: 'transparent', cursor: 'pointer',
              color: 'var(--md-on-surface-variant)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span className="ms" style={{ fontSize: 18 }}>search</span>
            </button>
            <button title="ארגז כלים" style={{
              width: 32, height: 32, borderRadius: '50%', border: 'none', background: 'transparent', cursor: 'pointer',
              color: 'var(--md-on-surface-variant)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span className="ms" style={{ fontSize: 18 }}>tune</span>
            </button>
          </div>
        </div>
      </div>

      {/* Rows */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        {inboxRows.map((row, i) => (
          <InboxRow
            key={row.id}
            row={row}
            selected={selectedId === row.id}
            onSelect={() => setSelectedId(row.id)}
          />
        ))}
      </div>

      {/* Footer */}
      <div style={{ padding: 16, borderTop: '1px solid var(--md-outline-variant)' }}>
        <button style={{
          width: '100%', height: 36, borderRadius: 999,
          background: 'transparent', color: 'var(--md-on-surface-variant)',
          border: '1px dashed var(--md-outline-variant)',
          fontFamily: 'inherit', fontSize: 13, fontWeight: 500,
          cursor: 'pointer',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        }}>
          <span className="ms" style={{ fontSize: 16 }}>edit_note</span>
          הוסף הזמנה ידנית
        </button>
      </div>
    </div>
  );
}

function InboxRow({ row, selected, onSelect }) {
  const { ChannelDot } = window;
  const [hover, setHover] = useInboxState(false);
  const baseBg = selected
    ? 'var(--md-secondary-container)'
    : row.warning
      ? 'rgba(245,158,11,0.06)'
      : hover ? 'var(--md-surface-container-high)' : 'transparent';

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={onSelect}
      style={{
        position: 'relative',
        display: 'flex', alignItems: 'flex-start', gap: 12,
        padding: '14px 16px',
        borderBottom: '1px solid var(--md-outline-variant)',
        background: baseBg,
        cursor: 'pointer',
        transition: 'background 100ms ease',
      }}>
      {row.warning && (
        <span style={{
          position: 'absolute', insetInlineStart: 0, top: 0, bottom: 0,
          width: 3, background: 'var(--md-warning)',
        }} />
      )}
      <ChannelDot channel={row.channel} />

      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
          <span style={{ fontSize: 14, fontWeight: row.unread > 0 ? 700 : 600, color: 'var(--md-on-surface)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {row.name}
          </span>
          {row.vip && (
            <span className="ms" title="VIP" style={{ fontSize: 14, color: '#F59E0B', fontVariationSettings: "'FILL' 1, 'wght' 600" }}>star</span>
          )}
          {row.status === 'converted' && (
            <span style={{
              fontSize: 10, fontWeight: 600, padding: '1px 8px', borderRadius: 6,
              background: 'var(--md-tertiary-container)', color: 'var(--md-on-tertiary-container)',
              border: '1px solid var(--md-tertiary-container)',
              marginInlineStart: 4,
            }}>הומר</span>
          )}
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 4,
          fontSize: 13, color: 'var(--md-on-surface-variant)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {row.warning && (
            <span className="ms" style={{ fontSize: 14, color: 'var(--md-warning)', flexShrink: 0 }}>schedule</span>
          )}
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.preview}</span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
        <span style={{ fontSize: 11, color: row.warning ? 'var(--md-warning)' : 'var(--md-on-surface-variant)', fontWeight: row.warning ? 600 : 400, direction: 'rtl' }}>
          {row.time}
        </span>
        {row.unread > 0 && (
          <span style={{
            minWidth: 18, height: 18, padding: '0 5px',
            borderRadius: 9, background: 'var(--md-error)', color: '#fff',
            fontSize: 10, fontWeight: 700,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span className="num">{row.unread}</span>
          </span>
        )}
      </div>
    </div>
  );
}

// ---------- Message Detail (left side) ----------
function MessageDetail() {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--md-surface-container-lowest)', minWidth: 0 }}>
      <DetailHeader />
      <DuplicateBanner />
      <OrderSummary />
      <MessageBubbles />
      <ActionBar />
    </div>
  );
}

function DetailHeader() {
  const { selectedConvo, IconButton, ChannelDot } = window;
  return (
    <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--md-outline-variant)', display: 'flex', alignItems: 'center', gap: 14 }}>
      <div style={{
        width: 44, height: 44, borderRadius: '50%',
        background: 'linear-gradient(135deg, #38656A 0%, #1B5E20 100%)',
        color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 16, fontWeight: 700,
        boxShadow: 'inset 0 0 0 2px var(--md-surface-container-lowest)',
        position: 'relative', flexShrink: 0,
      }}>
        <span>{selectedConvo.initials}</span>
        <span style={{
          position: 'absolute', bottom: -2, left: -2,
          width: 14, height: 14, borderRadius: '50%',
          background: '#25D366', border: '2px solid var(--md-surface-container-lowest)',
        }} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--md-on-surface)' }}>{selectedConvo.customer}</span>
          {selectedConvo.vip && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              fontSize: 10, fontWeight: 700, letterSpacing: 0.4,
              padding: '2px 8px', borderRadius: 999,
              background: 'rgba(245,158,11,0.15)', color: '#A65F00',
              border: '1px solid rgba(245,158,11,0.35)',
            }}>
              <span className="ms" style={{ fontSize: 12, color: '#F59E0B', fontVariationSettings: "'FILL' 1, 'wght' 600" }}>star</span>
              VIP
            </span>
          )}
          <span style={{
            fontSize: 11, fontWeight: 500, padding: '2px 8px', borderRadius: 6,
            background: 'var(--md-surface-container)', color: 'var(--md-on-surface-variant)',
          }}>
            הזמנה <span className="num">#10248</span>
          </span>
        </div>
        <div style={{ fontSize: 13, color: 'var(--md-on-surface-variant)', marginTop: 2 }}>
          <span className="num">{selectedConvo.phone}</span> · {selectedConvo.petKind}: {selectedConvo.pet}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4, fontSize: 12, color: 'var(--md-on-surface-variant)' }}>
          <ChannelDot channel={selectedConvo.channel} />
          הגיע דרך WhatsApp · התחיל ב-<span className="num">09:42</span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <IconButton icon="phone" label="התקשר" />
        <IconButton icon="person_add" label="שייך לנציג" />
        <IconButton icon="more_vert" label="עוד פעולות" />
      </div>
    </div>
  );
}

function DuplicateBanner() {
  const { selectedConvo } = window;
  return (
    <div style={{
      padding: '14px 24px',
      background: 'var(--md-warning-container)',
      borderBottom: '1px solid rgba(245,158,11,0.25)',
      display: 'flex', gap: 14, alignItems: 'flex-start',
    }}>
      <span style={{
        width: 36, height: 36, borderRadius: 10, flexShrink: 0,
        background: 'rgba(245,158,11,0.18)', color: '#A65F00',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <span className="ms" style={{ fontSize: 20, fontVariationSettings: "'FILL' 1, 'wght' 500" }}>content_copy</span>
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
          <span style={{ width: 8, height: 8, borderRadius: 4, background: 'var(--md-warning)' }} />
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.6, color: 'var(--md-warning)', textTransform: 'uppercase' }}>אזהרה</span>
        </div>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--md-on-warning-container)', lineHeight: 1.45 }}>
          {selectedConvo.duplicate.title}
        </div>
        <div style={{ fontSize: 12, color: 'rgba(74,47,0,0.78)', marginTop: 4, lineHeight: 1.5 }}>
          {selectedConvo.duplicate.body}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
        <button style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          height: 32, padding: '0 14px', borderRadius: 999,
          background: '#A65F00', color: '#fff', border: 'none',
          cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: 600,
        }}>
          <span className="ms" style={{ fontSize: 14 }}>flag</span>
          סמן ככפולה
        </button>
        <button title="התעלם" style={{
          width: 28, height: 28, borderRadius: '50%', border: 'none',
          background: 'transparent', cursor: 'pointer',
          color: 'rgba(74,47,0,0.78)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span className="ms" style={{ fontSize: 16 }}>close</span>
        </button>
      </div>
    </div>
  );
}

function OrderSummary() {
  const { selectedConvo } = window;
  return (
    <div style={{
      padding: '16px 24px',
      background: 'var(--md-surface-container-low)',
      borderBottom: '1px solid var(--md-outline-variant)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="ms" style={{ fontSize: 18, color: 'var(--md-primary)' }}>inbox</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--md-primary)' }}>הזמנה מפורטת</span>
          <span style={{
            fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 6,
            background: 'var(--md-primary-container)', color: 'var(--md-on-primary-container)',
          }}>טיוטה</span>
        </div>
        <div className="currency" style={{ fontSize: 16, fontWeight: 700, color: 'var(--md-on-surface)' }}>
          ₪{selectedConvo.summary.total.toLocaleString('en-US')}
        </div>
      </div>

      <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
        {selectedConvo.summary.items.map((it, i) => (
          <div key={i} style={{
            display: 'grid',
            gridTemplateColumns: '1fr 60px 90px',
            gap: 12, alignItems: 'center',
            padding: '6px 10px', borderRadius: 8,
            background: 'var(--md-surface-container-lowest)',
            border: '1px solid var(--md-outline-variant)',
          }}>
            <span style={{ fontSize: 13, color: 'var(--md-on-surface)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {it.name}
            </span>
            <span style={{ fontSize: 12, color: 'var(--md-on-surface-variant)' }}>
              <span className="num">×{it.qty}</span>
            </span>
            <span className="currency" style={{ fontSize: 13, fontWeight: 600, color: 'var(--md-on-surface)', textAlign: 'start' }}>
              ₪{it.price.toLocaleString('en-US')}
            </span>
          </div>
        ))}
      </div>

      <div style={{
        marginTop: 10, paddingTop: 8,
        borderTop: '1px solid var(--md-outline-variant)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--md-on-surface-variant)' }}>סה״כ</span>
        <span className="currency" style={{ fontSize: 16, fontWeight: 700, color: 'var(--md-primary)' }}>
          ₪{selectedConvo.summary.total.toLocaleString('en-US')}
        </span>
      </div>
    </div>
  );
}

function MessageBubbles() {
  const { selectedConvo } = window;
  return (
    <div style={{
      flex: 1, overflowY: 'auto',
      padding: '20px 24px',
      display: 'flex', flexDirection: 'column', gap: 12,
      background: 'var(--md-surface-container-lowest)',
      backgroundImage: 'radial-gradient(var(--md-surface-container) 1px, transparent 1px)',
      backgroundSize: '20px 20px',
    }}>
      {/* Date divider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '0 auto', maxWidth: '60%' }}>
        <span style={{ flex: 1, height: 1, background: 'var(--md-outline-variant)' }} />
        <span style={{
          fontSize: 11, fontWeight: 500, color: 'var(--md-on-surface-variant)',
          padding: '4px 12px', borderRadius: 999,
          background: 'var(--md-surface-container)',
        }}>{selectedConvo.dateLabel}</span>
        <span style={{ flex: 1, height: 1, background: 'var(--md-outline-variant)' }} />
      </div>

      {selectedConvo.messages.map((m, i) => <Bubble key={i} msg={m} />)}

      {/* Typing indicator */}
      <div style={{ alignSelf: 'flex-start', maxWidth: '70%' }}>
        <div style={{
          background: 'var(--md-surface-container)', border: '1px solid var(--md-outline-variant)',
          borderRadius: '4px 16px 16px 16px',
          padding: '10px 14px',
          display: 'inline-flex', alignItems: 'center', gap: 4,
        }}>
          {[0, 1, 2].map(i => (
            <span key={i} style={{
              width: 6, height: 6, borderRadius: 3, background: 'var(--md-outline)',
              animation: `bounce 1.2s ${i * 0.15}s infinite ease-in-out`,
            }} />
          ))}
        </div>
        <div style={{ fontSize: 10, color: 'var(--md-on-surface-variant)', marginTop: 4, paddingInlineStart: 4 }}>דני מקליד…</div>
      </div>

      <style>{`@keyframes bounce { 0%, 60%, 100% { transform: translateY(0); opacity: 0.4; } 30% { transform: translateY(-4px); opacity: 1; } }`}</style>
    </div>
  );
}

function Bubble({ msg }) {
  const isCustomer = msg.from === 'customer';
  return (
    <div style={{ alignSelf: isCustomer ? 'flex-start' : 'flex-end', maxWidth: '70%' }}>
      <div style={{
        background: isCustomer ? 'var(--md-surface-container)' : 'var(--md-primary-container)',
        color: isCustomer ? 'var(--md-on-surface)' : 'var(--md-on-primary-container)',
        border: isCustomer ? '1px solid var(--md-outline-variant)' : '1px solid transparent',
        borderRadius: isCustomer ? '4px 16px 16px 16px' : '16px 4px 16px 16px',
        padding: '10px 14px',
        fontSize: 14, lineHeight: 1.5,
      }}>
        {msg.text}
      </div>
      <div style={{
        fontSize: 11, color: 'var(--md-on-surface-variant)',
        marginTop: 4,
        textAlign: isCustomer ? 'start' : 'end',
        paddingInlineStart: isCustomer ? 6 : 0,
        paddingInlineEnd: isCustomer ? 0 : 6,
        display: 'flex', justifyContent: isCustomer ? 'flex-start' : 'flex-end',
        alignItems: 'center', gap: 4,
      }}>
        <span className="num" style={{ direction: 'ltr' }}>{msg.time}</span>
        {!isCustomer && (
          <span className="ms" style={{ fontSize: 13, color: '#25D366' }}>done_all</span>
        )}
      </div>
    </div>
  );
}

function ActionBar() {
  const { FilledButton } = window;
  return (
    <div style={{
      padding: '16px 24px',
      borderTop: '1px solid var(--md-outline-variant)',
      background: 'var(--md-surface-container-low)',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12,
    }}>
      <div style={{ display: 'flex', gap: 8 }}>
        <FilledButton icon="check" variant="filled">המר להזמנה</FilledButton>
        <FilledButton icon="forum" variant="tonal">בקש הבהרה</FilledButton>
      </div>
      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
        <button style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          height: 32, padding: '0 14px', borderRadius: 999,
          background: 'transparent', color: 'var(--md-on-surface-variant)',
          border: '1px solid var(--md-outline)',
          fontFamily: 'inherit', fontSize: 12, fontWeight: 500,
          cursor: 'pointer',
        }}>
          <span className="ms" style={{ fontSize: 14 }}>block</span>
          דחה הודעה
        </button>
        <button style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          height: 32, padding: '0 12px', borderRadius: 999,
          background: 'transparent', color: 'var(--md-error)',
          border: 'none',
          fontFamily: 'inherit', fontSize: 12, fontWeight: 500,
          cursor: 'pointer',
        }}>
          <span className="ms" style={{ fontSize: 14 }}>flag</span>
          סמן ככפולה
        </button>
      </div>
    </div>
  );
}

// ---------- Mount ----------
ReactDOM.createRoot(document.getElementById('root')).render(<App />);
