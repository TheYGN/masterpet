// ============ Main App — Order Sheet (New Order) ============

const { useState: useOSState } = React;

function App() {
  return (
    <div data-screen-label="Order Sheet — New Order" style={{
      width: 1440, margin: '0 auto', background: 'var(--md-surface)',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* === STAGE: Live screen — dimmed Orders List + Sheet === */}
      <div style={{
        position: 'relative', width: 1440, height: '100vh', minHeight: 920,
        overflow: 'hidden', background: 'var(--md-surface)',
      }}>
        <BackgroundLayer />

        {/* Scrim */}
        <div aria-hidden="true" style={{
          position: 'absolute', inset: 0,
          background: 'rgba(0,0,0,0.32)',
          backdropFilter: 'blur(2px)',
          WebkitBackdropFilter: 'blur(2px)',
          pointerEvents: 'none',
          zIndex: 5,
        }} />

        <ShellOverlay />
        <SheetPanel />
      </div>

      {/* === Below the fold: dropdown-expanded annotation === */}
      <div style={{ padding: '56px 32px 64px', background: 'var(--md-surface)' }}>
        <DropdownAnnotation />
      </div>
    </div>
  );
}

// ============================================================
// BACKGROUND — simplified Orders List (for context only)
// ============================================================
function BackgroundLayer() {
  return (
    <div aria-hidden="true" style={{
      position: 'absolute', inset: 0,
      display: 'flex', flexDirection: 'row-reverse',
      filter: 'saturate(0.75)',
    }}>
      <div style={{ width: 88, flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <div style={{ height: 72 }} />
        <main style={{ padding: '24px 32px 48px', display: 'flex', flexDirection: 'column', gap: 32 }}>
          <BgPageHeader />
          <BgKpiStrip />
          <BgToolbar />
          <BgTable />
        </main>
      </div>
    </div>
  );
}

function BgPageHeader() {
  return (
    <div>
      <div style={{ fontSize: 12, color: 'var(--md-on-surface-variant)', marginBottom: 4 }}>
        דשבורד · הזמנות
      </div>
      <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: 'var(--md-on-surface)' }}>
        ניהול הזמנות
      </h1>
      <div style={{ fontSize: 14, color: 'var(--md-on-surface-variant)', marginTop: 4 }}>
        <span className="num" style={{ color: 'var(--md-primary)', fontWeight: 600 }}>23</span> הזמנות פתוחות היום
      </div>
    </div>
  );
}

function BgKpiStrip() {
  const tiles = [
    { label: 'הזמנות היום',   value: '23',     tint: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 55%, #38656A 100%)', light: true },
    { label: 'ממתינות',       value: '7',      tint: 'var(--md-warning-container)' },
    { label: 'מנויים פעילים', value: '38',     tint: 'var(--md-tertiary-container)' },
    { label: 'סה״כ החודש',    value: '₪48,320', tint: 'var(--md-surface-container-lowest)' },
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
      {tiles.map((k, i) => (
        <div key={i} style={{
          background: k.tint, padding: 20, borderRadius: 16, minHeight: 168,
          border: k.light ? 'none' : '1px solid var(--md-outline-variant)',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          color: k.light ? '#fff' : 'var(--md-on-surface)',
        }}>
          <div style={{
            fontSize: 11, fontWeight: 600, letterSpacing: 0.4,
            textTransform: 'uppercase',
            color: k.light ? 'rgba(255,255,255,0.85)' : 'var(--md-on-surface-variant)',
          }}>{k.label}</div>
          <div style={{ fontSize: 36, fontWeight: 700, lineHeight: 1 }}>
            <span className="num">{k.value}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function BgToolbar() {
  return (
    <div style={{
      background: 'var(--md-surface-container-low)',
      border: '1px solid var(--md-outline-variant)',
      borderRadius: 16, padding: '16px 20px', height: 108,
      display: 'flex', flexDirection: 'column', gap: 12,
    }}>
      <div style={{ display: 'flex', gap: 24, alignItems: 'center', height: 32 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--md-on-surface)', position: 'relative' }}>
          הזמנות
          <span style={{ position: 'absolute', insetInlineStart: 0, insetInlineEnd: 0, bottom: -12, height: 3, background: 'var(--md-primary)', borderRadius: 3 }} />
        </span>
        <span style={{ fontSize: 14, color: 'var(--md-on-surface-variant)' }}>מנויים</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
        <div style={{ height: 40, padding: '0 18px', borderRadius: 999, background: 'var(--md-primary)', display: 'inline-flex', alignItems: 'center', color: '#fff', fontSize: 13, fontWeight: 500 }}>+ הזמנה חדשה</div>
        <div style={{ flex: 1, height: 40, borderRadius: 999, background: 'var(--md-surface-container)', maxWidth: 320 }} />
        <div style={{ flex: 1 }} />
        <div style={{ height: 32, padding: '0 14px', borderRadius: 999, background: 'var(--md-secondary-container)', display: 'inline-flex', alignItems: 'center', color: 'var(--md-on-secondary-container)', fontSize: 13, fontWeight: 500 }}>הכל</div>
        <div style={{ height: 32, padding: '0 14px', borderRadius: 999, background: 'var(--md-surface-container)', border: '1px solid var(--md-outline-variant)', display: 'inline-flex', alignItems: 'center', color: 'var(--md-on-surface-variant)', fontSize: 13 }}>ממתין</div>
        <div style={{ height: 32, padding: '0 14px', borderRadius: 999, background: 'var(--md-surface-container)', border: '1px solid var(--md-outline-variant)', display: 'inline-flex', alignItems: 'center', color: 'var(--md-on-surface-variant)', fontSize: 13 }}>אושר</div>
        <div style={{ height: 32, padding: '0 14px', borderRadius: 999, background: 'var(--md-surface-container)', border: '1px solid var(--md-outline-variant)', display: 'inline-flex', alignItems: 'center', color: 'var(--md-on-surface-variant)', fontSize: 13 }}>בדרך</div>
      </div>
    </div>
  );
}

function BgTable() {
  const { ghostOrders, statusMap, paymentMap, channelMap } = window;
  return (
    <div style={{
      background: 'var(--md-surface-container-low)',
      border: '1px solid var(--md-outline-variant)',
      borderRadius: 16, overflow: 'hidden',
    }}>
      <div style={{
        height: 44, padding: '0 20px',
        background: 'var(--md-surface-container)',
        borderBottom: '1px solid var(--md-outline-variant)',
        display: 'grid',
        gridTemplateColumns: '90px minmax(160px, 1fr) 200px 90px 110px 110px 60px 90px',
        gap: 12, alignItems: 'center',
        fontSize: 11, fontWeight: 600, color: 'var(--md-on-surface-variant)',
        textTransform: 'uppercase', letterSpacing: 0.4,
      }}>
        <span># הזמנה</span>
        <span>לקוח</span>
        <span>מוצרים</span>
        <span>סה״כ</span>
        <span style={{ textAlign: 'center' }}>תשלום</span>
        <span style={{ textAlign: 'center' }}>סטטוס</span>
        <span style={{ textAlign: 'center' }}>ערוץ</span>
        <span>תאריך</span>
      </div>
      {ghostOrders.map((o, i) => {
        const st = statusMap[o.status];
        const pm = paymentMap[o.payment];
        const ch = channelMap[o.channel];
        return (
          <div key={o.id} style={{
            height: 60, padding: '0 20px',
            background: i % 2 === 1 ? 'var(--md-surface-container-low)' : 'var(--md-surface-container-lowest)',
            borderBottom: i === ghostOrders.length - 1 ? 'none' : '1px solid var(--md-outline-variant)',
            display: 'grid',
            gridTemplateColumns: '90px minmax(160px, 1fr) 200px 90px 110px 110px 60px 90px',
            gap: 12, alignItems: 'center',
          }}>
            <span className="num" style={{ fontSize: 13, fontWeight: 500, color: 'var(--md-on-surface)' }}>{o.id}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
              <span style={{
                width: 28, height: 28, borderRadius: '50%',
                background: 'linear-gradient(135deg, #38656A 0%, #1B5E20 100%)',
                flexShrink: 0,
              }} />
              <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--md-on-surface)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{o.customer}</span>
            </div>
            <span style={{ fontSize: 12, color: 'var(--md-on-surface)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{o.product}</span>
            <span className="currency num" style={{ fontSize: 13, fontWeight: 600, color: 'var(--md-on-surface)' }}>₪{o.total}</span>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center',
                padding: '3px 10px', borderRadius: 8, fontSize: 11, fontWeight: 500,
                background: pm.kind === 'filled-primary' ? 'var(--md-primary)' : pm.kind === 'tonal-secondary' ? 'var(--md-secondary-container)' : 'transparent',
                color:      pm.kind === 'filled-primary' ? '#fff' : pm.kind === 'tonal-secondary' ? 'var(--md-on-secondary-container)' : 'var(--md-error)',
                border:     pm.kind === 'outlined-error' ? '1px solid rgba(179,38,30,0.45)' : 'none',
              }}>{pm.label}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center',
                padding: '3px 10px', borderRadius: 8, fontSize: 11, fontWeight: 500,
                background: st.kind === 'filled-primary' ? 'var(--md-primary)' : st.kind === 'tonal-secondary' ? 'var(--md-secondary-container)' : st.kind === 'tonal-tertiary' ? 'var(--md-tertiary-container)' : 'transparent',
                color:      st.kind === 'filled-primary' ? '#fff' : st.kind === 'tonal-secondary' ? 'var(--md-on-secondary-container)' : st.kind === 'tonal-tertiary' ? 'var(--md-on-tertiary-container)' : 'var(--md-error)',
                border:     st.kind === 'outlined-error' ? '1px solid rgba(179,38,30,0.45)' : 'none',
              }}>{st.label}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <span style={{
                width: 26, height: 26, borderRadius: 8,
                background: ch.color + '1F', color: ch.color,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span className="ms" style={{ fontSize: 14, fontVariationSettings: "'FILL' 1, 'wght' 500" }}>{ch.icon}</span>
              </span>
            </div>
            <span className="num" style={{ fontSize: 11, color: 'var(--md-on-surface-variant)' }}>{o.date}</span>
          </div>
        );
      })}
    </div>
  );
}

// ============================================================
// SHELL — rail + top bar above scrim
// ============================================================
function ShellOverlay() {
  return (
    <div style={{
      position: 'absolute', inset: 0,
      display: 'flex', flexDirection: 'row-reverse',
      pointerEvents: 'none',
      zIndex: 10,
    }}>
      <NavRail />
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <TopBar />
        <div style={{ flex: 1 }} />
      </div>
    </div>
  );
}

function NavRail() {
  const { navItems, NavItem } = window;
  return (
    <aside style={{
      width: 88, flexShrink: 0,
      background: 'var(--md-surface-container-low)',
      borderInlineStart: '1px solid var(--md-outline-variant)',
      display: 'flex', flexDirection: 'column',
      height: '100%', pointerEvents: 'auto',
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
          <NavItem key={item.id} item={item} active={item.id === 'orders'} />
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
      pointerEvents: 'auto',
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
// SHEET PANEL — 520px, visual LEFT (reading-end in RTL)
// ============================================================
function SheetPanel() {
  return (
    <aside style={{
      position: 'absolute', insetInlineEnd: 0, top: 0,
      width: 520, height: '100%',
      background: 'var(--md-surface-container-lowest)',
      boxShadow: 'var(--shadow-3)',
      borderInlineStart: '1px solid var(--md-outline-variant)',
      display: 'flex', flexDirection: 'column',
      zIndex: 20,
    }}>
      <SheetHeader />
      <SheetBody />
      <SheetFooter />
    </aside>
  );
}

function SheetHeader() {
  return (
    <header style={{
      height: 64, padding: '0 24px', flexShrink: 0,
      background: 'var(--md-surface-container-low)',
      borderBottom: '1px solid var(--md-outline-variant)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
    }}>
      {/* RIGHT (RTL start): close + title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
        <button title="סגור" aria-label="סגור" style={{
          width: 40, height: 40, borderRadius: '50%', border: 'none',
          background: 'transparent', cursor: 'pointer',
          color: 'var(--md-on-surface-variant)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span className="ms" style={{ fontSize: 24 }}>close</span>
        </button>
        <div style={{ width: 1, height: 20, background: 'var(--md-outline-variant)', margin: '0 0' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="ms" style={{
            fontSize: 20, color: 'var(--md-primary)',
            fontVariationSettings: "'FILL' 1, 'wght' 500, 'opsz' 20",
          }}>receipt_long</span>
          <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--md-on-surface)', lineHeight: 1.2 }}>
            הזמנה חדשה
          </div>
        </div>
      </div>

      {/* LEFT (RTL end): breadcrumb pill */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '4px 12px', borderRadius: 999,
        background: 'var(--md-surface-container)',
        border: '1px solid var(--md-outline-variant)',
      }}>
        <span className="ms" style={{ fontSize: 14, color: 'var(--md-on-surface-variant)' }}>store</span>
        <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--md-on-surface-variant)' }}>
          חיות הבית של אבי
        </span>
      </div>
    </header>
  );
}

// ============================================================
// SHEET BODY
// ============================================================
function SheetBody() {
  return (
    <div style={{
      flex: 1, overflowY: 'auto', minHeight: 0,
      background: 'var(--md-surface-container-lowest)',
      padding: 24,
      display: 'flex', flexDirection: 'column', gap: 24,
    }}>
      <SectionCustomer />
      <SectionItems />
      <SectionDiscount />
      <SectionNotes />
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <div style={{
      fontSize: 12, fontWeight: 600, letterSpacing: 0.4,
      textTransform: 'uppercase',
      color: 'var(--md-on-surface-variant)',
      marginBottom: 8,
    }}>{children}</div>
  );
}

// --- A: Customer ---
function SectionCustomer() {
  const { customer, ChannelDot } = window;
  return (
    <section>
      <SectionLabel>לקוח</SectionLabel>

      {/* Combobox — selected state (רחל כהן) */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        height: 56, padding: '0 14px 0 6px',
        borderRadius: 12,
        background: 'var(--md-primary-container)',
        border: '1px solid var(--md-primary)',
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          background: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%)',
          color: '#fff',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, fontWeight: 700, letterSpacing: 0.2, flexShrink: 0,
        }}>
          <span>{customer.initials}</span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--md-on-primary-container)', lineHeight: 1.3 }}>
            {customer.name}
          </div>
          <div style={{ fontSize: 12, color: 'rgba(0,33,6,0.70)', lineHeight: 1.3 }}>
            <span className="num">{customer.phone}</span> · {customer.city}
          </div>
        </div>
        <button title="נקה בחירה" aria-label="נקה בחירה" style={{
          width: 32, height: 32, borderRadius: '50%', border: 'none',
          background: 'transparent', cursor: 'pointer',
          color: 'var(--md-on-primary-container)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <span className="ms" style={{ fontSize: 18 }}>close</span>
        </button>
      </div>

      {/* Mini-card with extra info */}
      <div style={{
        marginTop: 10,
        display: 'flex', alignItems: 'center', gap: 12,
        padding: 14, borderRadius: 12,
        background: 'var(--md-surface-container-low)',
        border: '1px solid var(--md-outline-variant)',
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          background: 'linear-gradient(135deg, #38656A 0%, #1B5E20 100%)',
          color: '#fff',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, fontWeight: 700, flexShrink: 0,
        }}>
          <span>{customer.initials}</span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--md-on-surface)' }}>{customer.name}</span>
            <span className="num" style={{ fontSize: 12, color: 'var(--md-on-surface-variant)' }}>{customer.phone}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
            <ChannelDot channel={customer.channel} />
            <span style={{ fontSize: 11, color: 'var(--md-on-surface-variant)' }}>WhatsApp</span>
            <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--md-outline-variant)' }} />
            <span style={{ fontSize: 11, color: 'var(--md-on-surface-variant)' }}>{customer.city}</span>
          </div>
        </div>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          padding: '4px 10px', borderRadius: 999,
          background: 'var(--md-tertiary-container)',
          color: 'var(--md-on-tertiary-container)',
          fontSize: 11, fontWeight: 500,
          whiteSpace: 'nowrap', flexShrink: 0,
        }}>
          <span className="ms" style={{ fontSize: 14 }}>history</span>
          <span>הזמנה קודמת: <span className="currency num" style={{ fontWeight: 600 }}>₪{customer.lastOrderTotal}</span></span>
        </span>
      </div>
    </section>
  );
}

// --- B: Items ---
function SectionItems() {
  const { cartItems } = window;
  return (
    <section>
      <SectionLabel>פריטים</SectionLabel>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {cartItems.map(item => <CartItemRow key={item.id} item={item} />)}
        <AddItemRow />
      </div>
    </section>
  );
}

function CartItemRow({ item }) {
  return (
    <div style={{
      background: 'var(--md-surface-container-low)',
      border: '1px solid var(--md-outline-variant)',
      borderRadius: 12,
      padding: '12px 16px',
      display: 'flex', alignItems: 'flex-start', gap: 12,
    }}>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
        {/* Row 1: name + qty badge | total */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
            <span style={{
              fontSize: 14, fontWeight: 500, color: 'var(--md-on-surface)',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>{item.name}</span>
            <span style={{
              display: 'inline-flex', alignItems: 'center',
              padding: '2px 8px', borderRadius: 6,
              background: 'var(--md-secondary-container)',
              color: 'var(--md-on-secondary-container)',
              fontSize: 12, fontWeight: 600,
              flexShrink: 0,
            }}>
              <span className="num">× {item.qty}</span>
            </span>
          </div>
          <span className="currency num" style={{
            fontSize: 14, fontWeight: 600, color: 'var(--md-on-surface)',
            flexShrink: 0,
          }}>₪{item.total}</span>
        </div>

        {/* Row 2: sku + unit price */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 11, color: 'var(--md-on-surface-variant)' }}>
          <span>SKU: <span className="num" style={{ fontFamily: "'Roboto Mono', 'Heebo', monospace" }}>{item.sku}</span></span>
          <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--md-outline-variant)' }} />
          <span className="currency num">₪{item.unitPrice}/יחידה</span>
        </div>

        {/* Variant pill */}
        <div>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '3px 10px', borderRadius: 999,
            background: 'var(--md-surface-container)',
            border: '1px solid var(--md-outline-variant)',
            fontSize: 12, color: 'var(--md-on-surface-variant)',
          }}>
            <span className="ms" style={{ fontSize: 12 }}>local_dining</span>
            <span>{item.variant}</span>
          </span>
        </div>
      </div>

      <button title="הסר" aria-label="הסר" style={{
        width: 32, height: 32, borderRadius: '50%', border: 'none',
        background: 'transparent', cursor: 'pointer',
        color: 'var(--md-on-surface-variant)',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <span className="ms" style={{ fontSize: 18 }}>delete</span>
      </button>
    </div>
  );
}

function AddItemRow() {
  return (
    <button style={{
      width: '100%',
      background: 'transparent',
      border: '1.5px dashed var(--md-outline-variant)',
      borderRadius: 12,
      padding: '14px 16px',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      cursor: 'pointer', fontFamily: 'inherit',
      color: 'var(--md-primary)',
    }}>
      <span className="ms" style={{
        fontSize: 20, color: 'var(--md-primary)',
        fontVariationSettings: "'FILL' 1, 'wght' 500, 'opsz' 20",
      }}>add_circle</span>
      <span style={{ fontSize: 14, fontWeight: 500 }}>הוסף מוצר</span>
    </button>
  );
}

// --- C: Discount ---
function SectionDiscount() {
  return (
    <section>
      <SectionLabel>הנחה (אופציונלי)</SectionLabel>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 160, height: 40, borderRadius: 8,
          border: '1px solid var(--md-outline-variant)',
          background: 'var(--md-surface-container-lowest)',
          padding: '0 12px',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span className="num" style={{
            flex: 1, fontSize: 14, color: 'var(--md-on-surface-variant)',
            opacity: 0.55, textAlign: 'right',
          }}>0</span>
          <span style={{ fontSize: 14, color: 'var(--md-on-surface-variant)', fontWeight: 500 }}>₪</span>
        </div>
        <button style={{
          height: 40, padding: '0 18px', borderRadius: 999,
          background: 'transparent',
          border: '1px solid var(--md-outline)',
          color: 'var(--md-primary)',
          cursor: 'pointer', fontFamily: 'inherit',
          fontSize: 14, fontWeight: 500,
          display: 'inline-flex', alignItems: 'center', gap: 6,
        }}>
          <span className="ms" style={{ fontSize: 16 }}>add</span>
          <span>הוסף</span>
        </button>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 11, color: 'var(--md-on-surface-variant)' }}>
          או באחוזים
        </span>
      </div>
    </section>
  );
}

// --- D: Notes ---
function SectionNotes() {
  return (
    <section>
      <SectionLabel>הערות</SectionLabel>
      <div style={{
        minHeight: 80, padding: '10px 12px',
        borderRadius: 12,
        background: 'var(--md-surface-container-lowest)',
        border: '1px solid var(--md-outline-variant)',
        fontSize: 14, lineHeight: 1.5,
        color: 'var(--md-on-surface-variant)',
        opacity: 0.55,
      }}>
        הערות לאריזה, כתובת מסירה, זמן מועדף...
      </div>
    </section>
  );
}

// ============================================================
// SHEET FOOTER
// ============================================================
function SheetFooter() {
  const { totals } = window;
  return (
    <footer style={{
      padding: '16px 24px', flexShrink: 0,
      background: 'var(--md-surface-container-low)',
      borderTop: '1px solid var(--md-outline-variant)',
      display: 'flex', flexDirection: 'column', gap: 12,
    }}>
      {/* Totals summary */}
      <div style={{
        background: 'var(--md-surface-container)',
        borderRadius: 12,
        padding: '14px 16px',
        display: 'flex', flexDirection: 'column', gap: 8,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 13, color: 'var(--md-on-surface-variant)' }}>סה״כ לפני מע״מ</span>
          <span className="currency num" style={{ fontSize: 13, color: 'var(--md-on-surface)', fontVariantNumeric: 'tabular-nums' }}>
            ₪{totals.subtotal.toFixed(2)}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 13, color: 'var(--md-on-surface-variant)' }}>מע״מ <span className="num">18</span>%</span>
          <span className="currency num" style={{ fontSize: 13, color: 'var(--md-on-surface)' }}>
            ₪{totals.vat.toFixed(2)}
          </span>
        </div>
        <div style={{ height: 1, background: 'var(--md-outline-variant)' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--md-on-surface)' }}>סה״כ לתשלום</span>
          <span className="currency num" style={{ fontSize: 18, fontWeight: 700, color: 'var(--md-primary)' }}>
            ₪{totals.total.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Actions row */}
      <div style={{ display: 'flex', gap: 12 }}>
        <FooterAction variant="filled" icon="check" label="שמור הזמנה" />
        <FooterAction variant="tonal" icon="send" label="שמור ושלח קישור PayPlus" />
      </div>
    </footer>
  );
}

function FooterAction({ variant, icon, label }) {
  const variants = {
    filled: { background: 'var(--md-primary)',             color: 'var(--md-on-primary)',             border: '1px solid var(--md-primary)' },
    tonal:  { background: 'var(--md-secondary-container)', color: 'var(--md-on-secondary-container)', border: '1px solid var(--md-secondary-container)' },
  };
  return (
    <button className="state-layer" style={{
      ...variants[variant],
      flex: 1, height: 48, borderRadius: 999,
      fontFamily: 'inherit', fontWeight: 600, fontSize: 14, letterSpacing: 0.1,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      cursor: 'pointer', whiteSpace: 'nowrap',
    }}>
      <span className="ms" style={{ fontSize: 20 }}>{icon}</span>
      <span>{label}</span>
    </button>
  );
}

// ============================================================
// DROPDOWN-EXPANDED ANNOTATION (below the fold)
// ============================================================
function DropdownAnnotation() {
  const { productResults } = window;
  return (
    <div style={{
      border: '1.5px dashed var(--md-outline)',
      borderRadius: 20, padding: 28, paddingTop: 36,
      position: 'relative', background: 'transparent',
    }}>
      <div style={{
        position: 'absolute', top: -11, insetInlineStart: 32,
        background: 'var(--md-surface)',
        padding: '2px 12px',
        fontSize: 11, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase',
        color: 'var(--md-on-surface-variant)',
        borderRadius: 4,
      }}>
        [מצב פתוח — dropdown מוצרים]
      </div>

      <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }}>
        {/* Caption */}
        <div style={{ width: 320, flexShrink: 0, paddingTop: 8 }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--md-on-surface)', marginBottom: 10 }}>
            בחירת מוצר מהמלאי
          </div>
          <div style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--md-on-surface-variant)' }}>
            לחיצה על <strong style={{ color: 'var(--md-on-surface)' }}>"הוסף מוצר"</strong> פותחת
            dropdown עם חיפוש חופשי על כל המלאי. בחירת שורה מוסיפה את המוצר
            לסל בכמות <span className="num">1</span> ומעדכנת את הסיכום בתחתית.
          </div>
          <ul style={{ margin: '12px 0 0', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              ['search',  'חיפוש לפי שם מוצר או SKU'],
              ['filter',  'תוצאות ממוינות לפי תדירות שימוש'],
              ['inventory', 'מוצרים אזולי-מלאי מסומנים בנפרד'],
            ].map(([icon, txt]) => (
              <li key={icon} style={{ display: 'flex', gap: 8, fontSize: 12, color: 'var(--md-on-surface-variant)' }}>
                <span className="ms" style={{ fontSize: 16, color: 'var(--md-primary)', flexShrink: 0, marginTop: 2 }}>{icon}</span>
                <span style={{ flex: 1 }}>{txt}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Dropdown mock */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-start' }}>
          <div style={{ width: 472, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {/* The "add item" trigger row (open state) */}
            <div style={{
              background: 'var(--md-surface-container-lowest)',
              border: '1.5px solid var(--md-primary)',
              borderRadius: 12,
              padding: '12px 16px',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              color: 'var(--md-primary)',
            }}>
              <span className="ms" style={{
                fontSize: 20, color: 'var(--md-primary)',
                fontVariationSettings: "'FILL' 1, 'wght' 500, 'opsz' 20",
              }}>add_circle</span>
              <span style={{ fontSize: 14, fontWeight: 500 }}>הוסף מוצר</span>
            </div>

            {/* Dropdown panel */}
            <div style={{
              background: 'var(--md-surface-container-lowest)',
              border: '1px solid var(--md-outline-variant)',
              borderRadius: 12,
              boxShadow: 'var(--shadow-2)',
              padding: '8px 0',
              display: 'flex', flexDirection: 'column',
            }}>
              {/* Search input */}
              <div style={{ padding: '4px 8px 10px 8px', borderBottom: '1px solid var(--md-outline-variant)' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  height: 40, padding: '0 12px',
                  background: 'var(--md-surface-container-low)',
                  borderRadius: 8,
                  color: 'var(--md-on-surface-variant)',
                }}>
                  <span className="ms" style={{ fontSize: 18 }}>search</span>
                  <span style={{ flex: 1, fontSize: 13, opacity: 0.7 }}>חיפוש מוצר...</span>
                </div>
              </div>

              {/* Results */}
              {productResults.map((p, i) => (
                <div key={p.sku} style={{
                  height: 56, padding: '0 12px',
                  display: 'flex', alignItems: 'center', gap: 10,
                  background: i === 0 ? 'var(--md-surface-container-low)' : 'transparent',
                  cursor: 'pointer',
                }}>
                  <span style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: 'var(--md-primary-container)',
                    color: 'var(--md-on-primary-container)',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <span className="ms" style={{ fontSize: 18 }}>pets</span>
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--md-on-surface)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {p.name}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--md-on-surface-variant)' }}>
                      SKU: <span className="num" style={{ fontFamily: "'Roboto Mono', 'Heebo', monospace" }}>{p.sku}</span>
                    </div>
                  </div>
                  <span className="currency num" style={{ fontSize: 14, fontWeight: 600, color: 'var(--md-on-surface)', flexShrink: 0 }}>
                    ₪{p.price}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- Mount ----------
ReactDOM.createRoot(document.getElementById('root')).render(<App />);
