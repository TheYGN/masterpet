// ============ Customer Card — main screen ============

const { useState: useCCState } = React;

function App() {
  return (
    <div style={{
      display: 'flex', flexDirection: 'row-reverse',
      minHeight: '100vh', width: 1440, margin: '0 auto',
      background: 'var(--md-surface)',
    }}>
      <NavRail />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <TopBar />
        <main style={{
          padding: '24px 32px 48px',
          display: 'flex', flexDirection: 'column', gap: 24,
        }}>
          <Breadcrumb />
          <CustomerHeader />
          <TwoColumn />
        </main>
      </div>
    </div>
  );
}

// ============================================================
// SHELL — Nav Rail + Top Bar (verbatim from dashboard)
// ============================================================
function NavRail() {
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
          <NavItem key={item.id} item={item} active={item.id === 'crm'} />
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
      <div style={{ flex: 1, maxWidth: 560, margin: '0 auto' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          height: 48, padding: '0 16px',
          background: 'var(--md-surface-container)',
          borderRadius: 999, color: 'var(--md-on-surface-variant)',
        }}>
          <span className="ms" style={{ fontSize: 22 }}>search</span>
          <input
            placeholder="חיפוש לקוחות, הזמנות, מוצרים…"
            style={{
              flex: 1, border: 'none', background: 'transparent', outline: 'none',
              fontFamily: 'inherit', fontSize: 14, color: 'var(--md-on-surface)', textAlign: 'right',
            }}
          />
          <kbd style={{
            fontFamily: 'inherit', fontSize: 11, fontWeight: 600,
            padding: '2px 6px', borderRadius: 4,
            background: 'var(--md-surface-container-high)',
            color: 'var(--md-on-surface-variant)',
            border: '1px solid var(--md-outline-variant)', direction: 'ltr',
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

// ============================================================
// SECTION 1 — Breadcrumb + back
// ============================================================
function Breadcrumb() {
  return (
    <div style={{
      height: 40, display: 'flex', alignItems: 'center', gap: 8,
    }}>
      <button
        aria-label="חזרה לרשימת הלקוחות"
        title="חזרה לרשימת הלקוחות"
        style={{
          width: 32, height: 32, borderRadius: 999, border: '1px solid var(--md-outline-variant)',
          background: 'transparent', cursor: 'pointer',
          color: 'var(--md-on-surface-variant)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        }}>
        <span className="ms ms-flip-rtl" style={{ fontSize: 20 }}>arrow_back</span>
      </button>
      <div style={{ width: 1, height: 16, background: 'var(--md-outline-variant)' }} />
      <nav style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
        <a href="#" style={{
          color: 'var(--md-on-surface-variant)', textDecoration: 'none',
        }} onMouseOver={(e) => e.currentTarget.style.textDecoration = 'underline'}
          onMouseOut={(e) => e.currentTarget.style.textDecoration = 'none'}>
          לקוחות
        </a>
        <span className="ms ms-flip-rtl" style={{ fontSize: 16, color: 'var(--md-on-surface-variant)', opacity: 0.6 }}>chevron_left</span>
        <span style={{ color: 'var(--md-on-surface)', fontWeight: 500 }}>רחל כהן</span>
      </nav>
    </div>
  );
}

// ============================================================
// SECTION 2 — Customer Header Card
// ============================================================
function CustomerHeader() {
  const { customer, StatusChip, ChannelDot, FilledButton } = window;
  return (
    <div style={{
      background: 'var(--md-surface-container-low)',
      border: '1px solid var(--md-outline-variant)',
      borderRadius: 16, padding: 24,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24,
    }}>
      {/* RTL start (right visually) — avatar + identity */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, minWidth: 0 }}>
        <div style={{
          width: 56, height: 56, borderRadius: '50%',
          background: 'linear-gradient(135deg, #38656A 0%, #1B5E20 100%)',
          color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20, fontWeight: 700, flexShrink: 0,
          boxShadow: 'inset 0 0 0 3px var(--md-surface-container-low)',
        }}>
          <span>{customer.initials}</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
          {/* Row 1 — name + status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h1 style={{
              margin: 0, fontSize: 22, fontWeight: 700, lineHeight: 1.2,
              color: 'var(--md-on-surface)',
            }}>{customer.name}</h1>
            <StatusChip kind="filled-primary">פעיל</StatusChip>
          </div>

          {/* Row 2 — channel + phone */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ChannelDot channel={customer.channel} />
            <span className="num" style={{
              fontSize: 14, fontWeight: 500, color: 'var(--md-on-surface)',
            }}>{customer.phone}</span>
          </div>

          {/* Row 3 — city + branch */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            fontSize: 13, color: 'var(--md-on-surface-variant)',
          }}>
            <span className="ms" style={{ fontSize: 16 }}>location_on</span>
            <span>{customer.city}</span>
            <span style={{ opacity: 0.5, padding: '0 6px' }}>·</span>
            <span className="ms" style={{ fontSize: 16 }}>storefront</span>
            <span>{customer.branch}</span>
          </div>

          {/* Row 4 — joined */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            fontSize: 13, color: 'var(--md-on-surface-variant)',
          }}>
            <span className="ms" style={{ fontSize: 14 }}>calendar_today</span>
            <span>הצטרף ב-<span className="num">{customer.joined}</span></span>
            <span>— לקוח מזה <span className="num">{customer.daysSinceJoined}</span> ימים</span>
          </div>
        </div>
      </div>

      {/* RTL end (left visually) — actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, position: 'relative' }}>
        <FilledButton icon="edit" variant="outlined">ערוך פרטים</FilledButton>
        <FilledButton icon="send" variant="tonal">שלח הודעה</FilledButton>
        <RoleAnnotation />
      </div>
    </div>
  );
}

// ---------- Role-visibility annotation (positioned under buttons) ----------
function RoleAnnotation() {
  return (
    <div style={{
      position: 'absolute', top: 'calc(100% + 8px)', insetInlineEnd: 0,
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '4px 10px', borderRadius: 999,
      background: 'transparent',
      border: '1px dashed var(--md-outline)',
      fontSize: 11, color: 'var(--md-on-surface-variant)',
      whiteSpace: 'nowrap',
    }}>
      <span className="ms" style={{ fontSize: 13, color: 'var(--md-on-surface-variant)' }}>visibility_off</span>
      <span>[כפתורי עריכה — לא מוצגים לroles: sales, warehouse]</span>
    </div>
  );
}

// ============================================================
// SECTION 3 — Two-Column Layout
// ============================================================
function TwoColumn() {
  return (
    <section style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 24, marginTop: 16 }}>
      {/* RIGHT visually = first item in row-reverse RTL grid (auto handles direction) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>
        <ContactCard />
        <NotesCard />
        <HistoryCard />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>
        <StatsCard />
        <GeneralInfoCard />
      </div>
    </section>
  );
}

// ============================================================
// CARD A — פרטי קשר
// ============================================================
function ContactCard() {
  const { customer, ChannelDot } = window;
  return (
    <div style={{
      background: 'var(--md-surface-container-low)',
      border: '1px solid var(--md-outline-variant)',
      borderRadius: 16, padding: 24,
    }}>
      <CardHeader icon="contact_page" iconColor="var(--md-primary)" title="פרטי קשר" titleSize={16} />
      <Separator />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <DetailRow icon="phone" label="טלפון">
          <span className="num" style={{ fontSize: 14, fontWeight: 500, color: 'var(--md-on-surface)' }}>
            {customer.phone}
          </span>
        </DetailRow>
        <DetailRow icon="mail" label="אימייל">
          <span className="num" style={{
            fontSize: 14, color: 'var(--md-on-surface)',
            direction: 'ltr', unicodeBidi: 'isolate',
          }}>{customer.email}</span>
        </DetailRow>
        <DetailRow icon="home" label="כתובת">
          <span style={{ fontSize: 14, color: 'var(--md-on-surface)' }}>{customer.address}</span>
        </DetailRow>
        <DetailRow icon="chat" iconColor="#25D366" label="ערוץ מועדף">
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <ChannelDot channel={customer.channel} />
            <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--md-on-surface)' }}>{customer.channelLabel}</span>
          </span>
        </DetailRow>
        <DetailRow icon="storefront" label="סניף">
          <span style={{ fontSize: 14, color: 'var(--md-on-surface)' }}>{customer.branch}</span>
        </DetailRow>
      </div>
    </div>
  );
}

function DetailRow({ icon, iconColor, label, children }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 12,
    }}>
      <span className="ms" style={{
        fontSize: 18, color: iconColor || 'var(--md-on-surface-variant)', flexShrink: 0,
        marginTop: 2,
      }}>{icon}</span>
      <span style={{
        width: 80, flexShrink: 0,
        fontSize: 11, fontWeight: 600, letterSpacing: 0.4, textTransform: 'uppercase',
        color: 'var(--md-on-surface-variant)',
        paddingTop: 3,
      }}>{label}</span>
      <span style={{ flex: 1, minWidth: 0 }}>{children}</span>
    </div>
  );
}

// ============================================================
// CARD B — הערות
// ============================================================
function NotesCard() {
  const { customer } = window;
  return (
    <div style={{
      background: 'var(--md-surface-container-lowest)',
      border: '1px dashed var(--md-outline-variant)',
      borderRadius: 16, padding: 20,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <span className="ms" style={{
          fontSize: 18, color: 'var(--md-on-surface-variant)',
          fontVariationSettings: "'FILL' 1, 'wght' 500",
        }}>notes</span>
        <h3 style={{
          margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--md-on-surface)',
        }}>הערות</h3>
      </div>
      <p style={{
        margin: 0, fontSize: 14, fontWeight: 400, lineHeight: 1.7,
        color: 'var(--md-on-surface-variant)',
      }}>
        {customer.notes}
      </p>
    </div>
  );
}

// ============================================================
// CARD C — היסטוריית הזמנות (tabs + empty state)
// ============================================================
function HistoryCard() {
  const [tab, setTab] = useCCState('orders');
  return (
    <div style={{
      background: 'var(--md-surface-container-low)',
      border: '1px solid var(--md-outline-variant)',
      borderRadius: 16, overflow: 'hidden',
    }}>
      {/* Tab bar */}
      <div style={{
        height: 48, background: 'var(--md-surface-container)',
        borderBottom: '1px solid var(--md-outline-variant)',
        display: 'flex', alignItems: 'stretch', paddingInlineStart: 24, gap: 4,
      }}>
        <Tab id="orders" icon="receipt_long" label="הזמנות" active={tab === 'orders'} onSelect={setTab} />
        <Tab id="activity" icon="bolt" label="פעילות" active={tab === 'activity'} onSelect={setTab} />
      </div>

      {/* Content */}
      {tab === 'orders' && <OrdersEmptyState />}
      {tab === 'activity' && <ActivityEmptyState />}
    </div>
  );
}

function Tab({ id, icon, label, active, onSelect }) {
  const [hover, setHover] = useCCState(false);
  return (
    <button
      onClick={() => onSelect(id)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        padding: '0 16px', border: 'none',
        background: hover && !active ? 'var(--md-surface-container-high)' : 'transparent',
        color: active ? 'var(--md-primary)' : 'var(--md-on-surface-variant)',
        cursor: 'pointer', fontFamily: 'inherit',
        fontSize: 14, fontWeight: active ? 500 : 400,
        position: 'relative',
        transition: 'background 120ms ease',
      }}>
      <span className="ms" style={{
        fontSize: 18,
        fontVariationSettings: active ? "'FILL' 1, 'wght' 500" : "'FILL' 0, 'wght' 400",
      }}>{icon}</span>
      <span>{label}</span>
      {active && (
        <span style={{
          position: 'absolute', insetInlineStart: 12, insetInlineEnd: 12,
          bottom: 0, height: 2, background: 'var(--md-primary)',
          borderRadius: '2px 2px 0 0',
        }} />
      )}
    </button>
  );
}

function OrdersEmptyState() {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '56px 24px', gap: 12, textAlign: 'center',
    }}>
      <div style={{
        width: 96, height: 96, borderRadius: '50%',
        background: 'var(--md-surface-container)',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 4,
      }}>
        <span className="ms" style={{
          fontSize: 64, color: 'var(--md-outline)',
          fontVariationSettings: "'FILL' 0, 'wght' 300",
        }}>receipt_long</span>
      </div>
      <div style={{
        fontSize: 18, fontWeight: 700, color: 'var(--md-on-surface)',
        lineHeight: 1.3,
      }}>אין הזמנות עדיין</div>
      <div style={{
        fontSize: 14, fontWeight: 400, color: 'var(--md-on-surface-variant)',
        lineHeight: 1.6, maxWidth: 320,
      }}>
        הזמנות הלקוח יופיעו כאן לאחר ביצוע ההזמנה הראשונה
      </div>
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '6px 12px', borderRadius: 999,
        background: 'var(--md-surface-container)',
        border: '1px solid var(--md-outline-variant)',
        fontSize: 12, color: 'var(--md-on-surface-variant)',
        marginTop: 8,
      }}>
        <span className="ms" style={{ fontSize: 14 }}>schedule</span>
        <span>יופעל לאחר הטמעת מודול ההזמנות</span>
      </div>
    </div>
  );
}

function ActivityEmptyState() {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '56px 24px', gap: 12, textAlign: 'center',
    }}>
      <div style={{
        width: 96, height: 96, borderRadius: '50%',
        background: 'var(--md-surface-container)',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 4,
      }}>
        <span className="ms" style={{
          fontSize: 64, color: 'var(--md-outline)',
          fontVariationSettings: "'FILL' 0, 'wght' 300",
        }}>bolt</span>
      </div>
      <div style={{
        fontSize: 18, fontWeight: 700, color: 'var(--md-on-surface)',
        lineHeight: 1.3,
      }}>אין פעילות עדיין</div>
      <div style={{
        fontSize: 14, fontWeight: 400, color: 'var(--md-on-surface-variant)',
        lineHeight: 1.6, maxWidth: 320,
      }}>
        אירועים על הלקוח (הודעות, עדכוני סטטוס) יופיעו כאן
      </div>
    </div>
  );
}

// ============================================================
// CARD D — נתוני לקוח (stats)
// ============================================================
function StatsCard() {
  return (
    <div style={{
      background: 'var(--md-surface-container-low)',
      border: '1px solid var(--md-outline-variant)',
      borderRadius: 16, padding: 20,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 style={{
          margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--md-on-surface)',
        }}>נתוני לקוח</h3>
        <span style={{
          width: 32, height: 32, borderRadius: 10,
          background: 'var(--md-primary-container)',
          color: 'var(--md-on-primary-container)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span className="ms" style={{
            fontSize: 18, fontVariationSettings: "'FILL' 1, 'wght' 500",
          }}>insights</span>
        </span>
      </div>
      <Separator />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <StatRow label="סה״כ הזמנות" value="—" sub="טרם בוצעו הזמנות" />
        <StatRow label="סכום כולל" valueElement={
          <span style={{ fontSize: 22, fontWeight: 700, color: 'var(--md-on-surface-variant)' }}>
            <span className="currency">₪—</span>
          </span>
        } sub="נתון זמין לאחר הזמנה ראשונה" />
        <StatRow label="הזמנה אחרונה" value="—" sub="לא קיים עדיין" />
      </div>

      <div style={{
        marginTop: 18, paddingTop: 14,
        borderTop: '1px dashed var(--md-outline-variant)',
        fontSize: 11, fontStyle: 'italic', color: 'var(--md-on-surface-variant)',
        lineHeight: 1.5,
      }}>
        נתונים אלה יחושבו אוטומטית לאחר הטמעת מודול ההזמנות
      </div>
    </div>
  );
}

function StatRow({ label, value, valueElement, sub }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <div style={{
        fontSize: 11, fontWeight: 600, letterSpacing: 0.4, textTransform: 'uppercase',
        color: 'var(--md-on-surface-variant)',
      }}>{label}</div>
      {valueElement ? valueElement : (
        <div style={{
          fontSize: 22, fontWeight: 700, lineHeight: 1.1,
          color: 'var(--md-on-surface-variant)',
        }}>{value}</div>
      )}
      <div style={{ fontSize: 11, color: 'var(--md-on-surface-variant)', marginTop: 2 }}>
        {sub}
      </div>
    </div>
  );
}

// ============================================================
// CARD E — מידע כללי
// ============================================================
function GeneralInfoCard() {
  const { customer } = window;
  return (
    <div style={{
      background: 'var(--md-surface-container-lowest)',
      border: '1px solid var(--md-outline-variant)',
      borderRadius: 16, padding: 20,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 style={{
          margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--md-on-surface)',
        }}>מידע כללי</h3>
        <span className="ms" style={{ fontSize: 18, color: 'var(--md-on-surface-variant)' }}>info</span>
      </div>
      <Separator />

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <InfoRow label="תאריך הצטרפות" value={<span className="num">{customer.joined}</span>} />
        <InfoRow label="עדכון אחרון"   value={<span className="num">{customer.lastUpdated}</span>} />
        <InfoRow label="מזהה לקוח"      value={
          <span className="num" style={{
            fontFamily: "'Roboto Mono', 'Heebo', monospace",
            fontSize: 12, color: 'var(--md-on-surface-variant)',
          }}>{customer.customerId}</span>
        } last />
      </div>
    </div>
  );
}

function InfoRow({ label, value, last }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '10px 0',
      borderBottom: last ? 'none' : '1px solid var(--md-outline-variant)',
    }}>
      <span style={{ fontSize: 13, color: 'var(--md-on-surface-variant)' }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--md-on-surface)' }}>{value}</span>
    </div>
  );
}

// ============================================================
// Shared bits
// ============================================================
function CardHeader({ icon, iconColor, title, titleSize = 14 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span className="ms" style={{
        fontSize: 20, color: iconColor || 'var(--md-on-surface-variant)',
        fontVariationSettings: "'FILL' 1, 'wght' 500",
      }}>{icon}</span>
      <h3 style={{
        margin: 0, fontSize: titleSize, fontWeight: 700, color: 'var(--md-on-surface)',
      }}>{title}</h3>
    </div>
  );
}

function Separator() {
  return (
    <div style={{
      height: 1, background: 'var(--md-outline-variant)',
      margin: '12px 0',
    }} />
  );
}

// ---------- Mount ----------
ReactDOM.createRoot(document.getElementById('root')).render(<App />);
