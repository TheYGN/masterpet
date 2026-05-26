// ============ Customer Sheet — Edit Mode (primary) + Create Mode annotation ============

const { useState: useCSState } = React;

function App() {
  return (
    <div style={{
      width: 1440, margin: '0 auto', background: 'var(--md-surface)',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* === STAGE 1: Live screen — dimmed list + sheet in EDIT mode === */}
      <div style={{
        position: 'relative', width: 1440, height: '100vh', minHeight: 860,
        overflow: 'hidden', background: 'var(--md-surface)',
      }}>
        <BackgroundLayer />

        {/* Scrim above bg, below shell + sheet */}
        <div aria-hidden="true" style={{
          position: 'absolute', inset: 0,
          background: 'rgba(0,0,0,0.35)',
          backdropFilter: 'blur(2px)',
          WebkitBackdropFilter: 'blur(2px)',
          pointerEvents: 'none',
          zIndex: 5,
        }} />

        <ShellOverlay />

        <SheetPanel mode="edit" />
      </div>

      {/* === STAGE 2: Create-mode annotation === */}
      <div style={{ padding: '56px 32px 64px', background: 'var(--md-surface)' }}>
        <CreateModeAnnotation />
      </div>
    </div>
  );
}

// ============================================================
// BACKGROUND — dimmed CustomersList (for context only)
// ============================================================
function BackgroundLayer() {
  return (
    <div aria-hidden="true" style={{
      position: 'absolute', inset: 0,
      display: 'flex', flexDirection: 'row-reverse',
      filter: 'saturate(0.7)',
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
      <div style={{ fontSize: 12, color: 'var(--md-on-surface-variant)', marginBottom: 4 }}>דשבורד · לקוחות</div>
      <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: 'var(--md-on-surface)' }}>ניהול לקוחות</h1>
      <div style={{ fontSize: 14, color: 'var(--md-on-surface-variant)', marginTop: 4 }}>
        <span className="num" style={{ color: 'var(--md-primary)', fontWeight: 600 }}>184</span> לקוחות פעילים
        {' · '}<span className="num" style={{ fontWeight: 600 }}>12</span> הצטרפו החודש
      </div>
    </div>
  );
}

function BgKpiStrip() {
  const tiles = [
    { label: 'לקוחות פעילים',  value: '184', tint: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 55%, #38656A 100%)', light: true },
    { label: 'חדשים החודש',   value: '12',  tint: 'var(--md-surface-container-low)' },
    { label: 'ערוץ מועדף',     value: '71%', tint: 'var(--md-tertiary-container)' },
    { label: 'לא פעילים',      value: '5',   tint: 'var(--md-surface-container-lowest)' },
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
          <div style={{ fontSize: 40, fontWeight: 700, lineHeight: 1 }}>
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
      borderRadius: 16, padding: '16px 24px', height: 116,
      display: 'flex', alignItems: 'center', gap: 12,
    }}>
      <div style={{ display: 'flex', gap: 8 }}>
        <div style={{ width: 132, height: 40, borderRadius: 999, background: 'var(--md-primary)', opacity: 0.85 }} />
        <div style={{ width: 132, height: 40, borderRadius: 999, background: 'transparent', border: '1px solid var(--md-outline)' }} />
      </div>
      <div style={{ flex: 1 }} />
      <div style={{ width: 420, height: 40, borderRadius: 999, background: 'var(--md-surface-container)' }} />
    </div>
  );
}

function BgTable() {
  const { ghostCustomers } = window;
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
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        fontSize: 11, fontWeight: 600, color: 'var(--md-on-surface-variant)',
        textTransform: 'uppercase', letterSpacing: 0.4,
      }}>
        <span>שם מלא</span>
        <span style={{ display: 'flex', gap: 64 }}>
          <span>טלפון</span>
          <span>עיר</span>
          <span>ערוץ</span>
          <span>סטטוס</span>
        </span>
      </div>
      {ghostCustomers.map((c, i) => (
        <div key={i} style={{
          height: 60, padding: '0 20px',
          background: c.selected
            ? 'var(--md-primary-container)'
            : (c.status === 'inactive' ? 'rgba(219,223,215,0.30)'
            : (i % 2 === 0 ? 'var(--md-surface-container-lowest)' : 'var(--md-surface-container-low)')),
          borderBottom: i === ghostCustomers.length - 1 ? 'none' : '1px solid var(--md-outline-variant)',
          borderInlineStart: c.selected ? '3px solid var(--md-primary)' : '3px solid transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'linear-gradient(135deg, #38656A 0%, #1B5E20 100%)',
            }} />
            <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--md-on-surface)' }}>{c.name}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 56, fontSize: 13, color: 'var(--md-on-surface-variant)' }}>
            <span className="num">{c.phone}</span>
            <span>{c.city}</span>
            <span style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--md-surface-container)' }} />
            <span style={{
              display: 'inline-flex', padding: '3px 12px', borderRadius: 8, fontSize: 12, fontWeight: 500,
              background: c.status === 'active' ? 'var(--md-primary)' : 'transparent',
              color: c.status === 'active' ? '#fff' : 'var(--md-on-surface-variant)',
              border: c.status === 'active' ? 'none' : '1px solid var(--md-outline-variant)',
              minWidth: 64, justifyContent: 'center',
            }}>{c.status === 'active' ? 'פעיל' : 'לא פעיל'}</span>
          </div>
        </div>
      ))}
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
// SHEET PANEL
// ============================================================
function SheetPanel({ mode }) {
  return (
    <aside style={{
      position: 'absolute', insetInlineStart: 0, top: 0,
      width: 680, height: '100%',
      background: 'var(--md-surface-container-lowest)',
      boxShadow: 'var(--shadow-3)',
      borderInlineEnd: '1px solid var(--md-outline-variant)',
      display: 'flex', flexDirection: 'column',
      zIndex: 20,
    }}>
      <SheetHeader mode={mode} />
      <SheetBody mode={mode} />
      <SheetFooter mode={mode} />
    </aside>
  );
}

function SheetHeader({ mode }) {
  const isEdit = mode === 'edit';
  return (
    <header style={{
      height: 64, padding: '0 24px', flexShrink: 0,
      background: 'var(--md-surface-container-low)',
      borderBottom: '1px solid var(--md-outline-variant)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
    }}>
      {/* RIGHT (RTL start): close + breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
        <button title="סגור" aria-label="סגור" style={{
          width: 40, height: 40, borderRadius: '50%', border: 'none',
          background: 'transparent', cursor: 'pointer',
          color: 'var(--md-on-surface-variant)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span className="ms" style={{ fontSize: 22 }}>close</span>
        </button>
        <div style={{ width: 1, height: 24, background: 'var(--md-outline-variant)' }} />
        {isEdit ? (
          <nav style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--md-on-surface-variant)' }}>
            <span style={{ cursor: 'pointer' }}>לקוחות</span>
            <span className="ms ms-flip-rtl" style={{ fontSize: 14, opacity: 0.6 }}>chevron_left</span>
            <span style={{ color: 'var(--md-on-surface)', fontWeight: 500 }}>רחל כהן</span>
          </nav>
        ) : (
          <nav style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--md-on-surface-variant)' }}>
            <span>לקוחות</span>
            <span className="ms ms-flip-rtl" style={{ fontSize: 14, opacity: 0.6 }}>chevron_left</span>
            <span style={{ color: 'var(--md-on-surface)', fontWeight: 500 }}>לקוח חדש</span>
          </nav>
        )}
      </div>

      {/* LEFT (RTL end): title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {isEdit && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '4px 10px', borderRadius: 999,
            background: 'var(--md-surface-container)',
            fontSize: 11, color: 'var(--md-on-surface-variant)',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: 3, background: 'var(--md-warning)', boxShadow: '0 0 0 4px rgba(245,158,11,0.18)' }} />
            שינויים לא שמורים
          </span>
        )}
        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--md-on-surface)', lineHeight: 1.2 }}>
          {isEdit ? 'עריכת רחל כהן' : 'לקוח חדש'}
        </div>
      </div>
    </header>
  );
}

// ============================================================
// SHEET BODY
// ============================================================
function SheetBody({ mode }) {
  const isEdit = mode === 'edit';
  return (
    <div style={{
      flex: 1, overflowY: 'auto', minHeight: 0,
      background: 'var(--md-surface-container-lowest)',
      padding: '24px',
      display: 'flex', flexDirection: 'column', gap: 24,
    }}>
      {isEdit && <CustomerSummaryStrip />}

      {/* Group 1: contact */}
      <FieldGroup label="פרטי קשר">
        <Field label="שם מלא" required>
          <TextInput value={isEdit ? 'רחל כהן' : ''} placeholder="לדוגמה: רחל כהן" />
        </Field>

        <Field
          label="טלפון"
          required
          hint={isEdit ? null : 'מספר הטלפון ייחודי לכל לקוח בעסק'}
          error={isEdit ? 'מספר הטלפון כבר רשום ללקוח אחר' : null}
        >
          <TextInput
            value={isEdit ? '052-111-2233' : ''}
            placeholder="05X-XXX-XXXX"
            ltr
            error={isEdit}
          />
        </Field>

        <Field label="אימייל">
          <TextInput value={isEdit ? 'rachel.cohen@gmail.com' : ''} placeholder="example@email.com" ltr />
        </Field>
      </FieldGroup>

      {/* Group 2: address */}
      <FieldGroup label="כתובת">
        <Field label="כתובת">
          <TextInput value={isEdit ? 'רחוב הרצל 14, דירה 3' : ''} placeholder="רחוב, מספר בית, דירה" />
        </Field>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Field label="עיר">
            <TextInput value={isEdit ? 'תל אביב' : ''} placeholder="שם העיר" />
          </Field>
          <Field label="מיקוד">
            <TextInput value={isEdit ? '6473814' : ''} placeholder="מיקוד (אופציונלי)" ltr />
          </Field>
        </div>
      </FieldGroup>

      {/* Group 3: preferences */}
      <FieldGroup label="העדפות">
        <Field label="ערוץ מועדף לתקשורת" required>
          <ChannelToggle selected={isEdit ? 'whatsapp' : 'whatsapp'} />
        </Field>

        <Field label="סניף משויך" hint="הסניף שאחראי על לקוח זה">
          <BranchSelect value={isEdit ? 'סניף ראשי' : 'בחר סניף...'} placeholder={!isEdit} />
        </Field>

        <Field label="הערות">
          <Textarea
            value={isEdit ? 'לקוחה קבועה. רוכשת בעיקר מזון לחתול. מעדיפה מסירה עצמית.' : ''}
            placeholder="הערות חופשיות על הלקוח, העדפות, מידע רלוונטי..."
          />
        </Field>
      </FieldGroup>

      {/* Group 4: status */}
      <FieldGroup label="סטטוס">
        <Field label="סטטוס לקוח">
          <StatusToggle selected={isEdit ? 'active' : 'active'} />
        </Field>
      </FieldGroup>
    </div>
  );
}

// ============================================================
// Customer summary strip (edit mode only — context about the customer)
// ============================================================
function CustomerSummaryStrip() {
  const { customer } = window;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 16,
      padding: '14px 16px', borderRadius: 12,
      background: 'var(--md-surface-container-low)',
      border: '1px solid var(--md-outline-variant)',
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: '50%',
        background: 'linear-gradient(135deg, #38656A 0%, #1B5E20 100%)',
        color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 16, fontWeight: 700, flexShrink: 0,
      }}>
        <span>ר.כ</span>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--md-on-surface)' }}>{customer.name}</span>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '2px 8px', borderRadius: 6,
            background: 'var(--md-primary)', color: 'var(--md-on-primary)',
            fontSize: 11, fontWeight: 500,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: 3, background: '#9BE9A8' }} />
            פעיל
          </span>
        </div>
        <div style={{ fontSize: 11, color: 'var(--md-on-surface-variant)', marginTop: 2 }}>
          מזהה <span className="num" style={{ fontFamily: "'Roboto Mono', 'Heebo', monospace" }}>{customer.customerId}</span>
          {' · '}הצטרף <span className="num">{customer.joined}</span>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 24 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--md-on-surface)', lineHeight: 1 }}>
            <span className="num">{customer.totalOrders}</span>
          </div>
          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 0.4, textTransform: 'uppercase', color: 'var(--md-on-surface-variant)', marginTop: 2 }}>
            הזמנות
          </div>
        </div>
        <div style={{ width: 1, background: 'var(--md-outline-variant)' }} />
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--md-on-surface)', lineHeight: 1 }}>
            <span className="currency">₪{customer.lifetimeValue}</span>
          </div>
          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 0.4, textTransform: 'uppercase', color: 'var(--md-on-surface-variant)', marginTop: 2 }}>
            סה״כ
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Field group + Field + Inputs
// ============================================================
function FieldGroup({ label, children }) {
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <h3 style={{
          margin: 0, fontSize: 11, fontWeight: 600, letterSpacing: 0.6,
          textTransform: 'uppercase', color: 'var(--md-on-surface-variant)',
        }}>{label}</h3>
        <div style={{ flex: 1, height: 1, background: 'var(--md-outline-variant)' }} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {children}
      </div>
    </section>
  );
}

function Field({ label, required, hint, error, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{
        fontSize: 12, fontWeight: 500, color: 'var(--md-on-surface-variant)',
        display: 'inline-flex', alignItems: 'center', gap: 4,
      }}>
        <span>{label}</span>
        {required && <span style={{ color: 'var(--md-error)', fontWeight: 700 }}>*</span>}
      </label>
      {children}
      {error ? (
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          fontSize: 12, color: 'var(--md-error)', fontWeight: 500,
        }}>
          <span className="ms" style={{ fontSize: 14 }}>error</span>
          <span>{error}</span>
        </div>
      ) : hint ? (
        <div style={{ fontSize: 11, color: 'var(--md-on-surface-variant)' }}>
          {hint}
        </div>
      ) : null}
    </div>
  );
}

function TextInput({ value, placeholder, ltr, error }) {
  const isEmpty = !value;
  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      height: 44, padding: '0 12px',
      borderRadius: 8,
      background: error ? 'rgba(179,38,30,0.04)' : 'var(--md-surface-container-lowest)',
      border: error ? '2px solid var(--md-error)' : '1px solid var(--md-outline-variant)',
      // adjust padding by 1px to keep content stable when border thickens
      paddingInlineStart: error ? 11 : 12,
      paddingInlineEnd: error ? 11 : 12,
    }}>
      <span className={ltr ? 'num' : ''} style={{
        flex: 1, minWidth: 0,
        fontFamily: 'inherit', fontSize: 14,
        color: isEmpty ? 'var(--md-on-surface-variant)' : 'var(--md-on-surface)',
        opacity: isEmpty ? 0.55 : 1,
        direction: ltr ? 'ltr' : 'inherit',
        textAlign: ltr ? 'left' : 'right',
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
      }}>
        {isEmpty ? placeholder : value}
      </span>
      {error && (
        <span className="ms" style={{ fontSize: 18, color: 'var(--md-error)', marginInlineStart: 6 }}>error</span>
      )}
    </div>
  );
}

function Textarea({ value, placeholder }) {
  const isEmpty = !value;
  return (
    <div style={{
      minHeight: 88, padding: '10px 12px',
      borderRadius: 8,
      background: 'var(--md-surface-container-lowest)',
      border: '1px solid var(--md-outline-variant)',
      fontFamily: 'inherit', fontSize: 14, lineHeight: 1.5,
      color: isEmpty ? 'var(--md-on-surface-variant)' : 'var(--md-on-surface)',
      opacity: isEmpty ? 0.55 : 1,
    }}>
      {isEmpty ? placeholder : value}
    </div>
  );
}

// ---------- Channel toggle (3 segmented buttons) ----------
function ChannelToggle({ selected }) {
  const opts = [
    { id: 'whatsapp', icon: 'chat',  label: 'WhatsApp', color: '#25D366' },
    { id: 'phone',    icon: 'call',  label: 'טלפון',    color: '#52634F' },
    { id: 'email',    icon: 'mail',  label: 'אימייל',   color: '#2563EB' },
  ];
  return (
    <div style={{ display: 'flex', height: 44, width: '100%' }}>
      {opts.map((o, i) => {
        const active = selected === o.id;
        // RTL: first item visually on right with right side rounded; last on left with left side rounded
        const isFirst = i === 0;
        const isLast = i === opts.length - 1;
        const radius = isFirst
          ? '999px 8px 8px 999px'   // RTL: right side fully rounded
          : isLast
          ? '8px 999px 999px 8px'   // RTL: left side fully rounded
          : '8px';
        return (
          <button key={o.id} style={{
            flex: 1,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            border: active ? '1px solid transparent' : '1px solid var(--md-outline-variant)',
            background: active ? 'var(--md-secondary-container)' : 'var(--md-surface-container-lowest)',
            color: active ? 'var(--md-on-secondary-container)' : 'var(--md-on-surface-variant)',
            cursor: 'pointer', fontFamily: 'inherit',
            fontSize: 14, fontWeight: active ? 600 : 500,
            borderRadius: radius,
            // avoid double-border on adjoining edges
            marginInlineStart: i === 0 ? 0 : -1,
            position: 'relative',
            zIndex: active ? 1 : 0,
          }}>
            {active ? (
              <span style={{
                width: 22, height: 22, borderRadius: 6,
                background: o.color + '24', color: o.color,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span className="ms" style={{ fontSize: 14, fontVariationSettings: "'FILL' 1, 'wght' 500" }}>{o.icon}</span>
              </span>
            ) : (
              <span className="ms" style={{ fontSize: 20, color: 'var(--md-on-surface-variant)' }}>{o.icon}</span>
            )}
            <span>{o.label}</span>
            {active && <span className="ms" style={{ fontSize: 16 }}>check</span>}
          </button>
        );
      })}
    </div>
  );
}

// ---------- Status toggle (פעיל / לא פעיל) ----------
function StatusToggle({ selected }) {
  const opts = [
    { id: 'active',   icon: 'check_circle', label: 'פעיל' },
    { id: 'inactive', icon: 'cancel',       label: 'לא פעיל' },
  ];
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      {opts.map(o => {
        const active = selected === o.id;
        return (
          <button key={o.id} style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            height: 40, padding: '0 18px', borderRadius: 999,
            border: active
              ? '1px solid transparent'
              : '1px solid var(--md-outline-variant)',
            background: active
              ? (o.id === 'active' ? 'var(--md-primary-container)' : 'var(--md-surface-container)')
              : 'var(--md-surface-container-lowest)',
            color: active
              ? (o.id === 'active' ? 'var(--md-on-primary-container)' : 'var(--md-on-surface)')
              : 'var(--md-on-surface-variant)',
            cursor: 'pointer', fontFamily: 'inherit',
            fontSize: 14, fontWeight: active ? 600 : 500,
          }}>
            <span className="ms" style={{
              fontSize: 18,
              fontVariationSettings: active ? "'FILL' 1, 'wght' 500" : "'FILL' 0, 'wght' 400",
            }}>{o.icon}</span>
            <span>{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ---------- Branch select ----------
function BranchSelect({ value, placeholder }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      height: 44, padding: '0 12px', borderRadius: 8,
      background: 'var(--md-surface-container-lowest)',
      border: '1px solid var(--md-outline-variant)',
      cursor: 'pointer',
    }}>
      <span style={{
        fontSize: 14,
        color: placeholder ? 'var(--md-on-surface-variant)' : 'var(--md-on-surface)',
        opacity: placeholder ? 0.55 : 1,
      }}>{value}</span>
      <span className="ms" style={{ fontSize: 22, color: 'var(--md-on-surface-variant)' }}>expand_more</span>
    </div>
  );
}

// ============================================================
// SHEET FOOTER
// ============================================================
function SheetFooter({ mode }) {
  const { FilledButton } = window;
  const isEdit = mode === 'edit';
  return (
    <footer style={{
      height: 72, padding: '0 24px', flexShrink: 0,
      background: 'var(--md-surface-container-low)',
      borderTop: '1px solid var(--md-outline-variant)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
    }}>
      {/* RIGHT (RTL start): secondary actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button style={{
          height: 40, padding: '0 18px', borderRadius: 999,
          background: 'transparent', color: 'var(--md-on-surface-variant)', border: 'none',
          fontFamily: 'inherit', fontSize: 14, fontWeight: 500, cursor: 'pointer',
        }}>ביטול</button>
        {isEdit && (
          <>
            <div style={{ width: 1, height: 24, background: 'var(--md-outline-variant)' }} />
            <button style={{
              height: 40, padding: '0 14px', borderRadius: 999,
              background: 'transparent', color: 'var(--md-error)', border: 'none',
              fontFamily: 'inherit', fontSize: 14, fontWeight: 500, cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 6,
            }}>
              <span className="ms" style={{ fontSize: 18 }}>delete_outline</span>
              <span>מחק לקוח</span>
            </button>
          </>
        )}
      </div>

      {/* LEFT (RTL end): primary action */}
      <FilledButton icon="check" variant="filled">
        {isEdit ? 'עדכן לקוח' : 'שמור לקוח'}
      </FilledButton>
    </footer>
  );
}

// ============================================================
// CREATE-MODE ANNOTATION (smaller, condensed)
// ============================================================
function CreateModeAnnotation() {
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
        [מצב יצירה — לקוח חדש]
      </div>

      <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }}>
        {/* Caption column */}
        <div style={{ width: 320, flexShrink: 0, paddingTop: 8 }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--md-on-surface)', marginBottom: 10 }}>
            הוספת לקוח חדש
          </div>
          <div style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--md-on-surface-variant)' }}>
            כאשר לוחצים <strong style={{ color: 'var(--md-on-surface)' }}>"הוסף לקוח"</strong> מסרגל הלקוחות,
            ה-sheet נפתח באותה צורה אך:
          </div>
          <ul style={{ margin: '12px 0 0', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              ['title',  'הכותרת הופכת ל"לקוח חדש" (ללא ערך קודם)'],
              ['empty',  'כל השדות ריקים — מציגים placeholder בלבד'],
              ['hint',   'אין שגיאת ולידציה לטלפון — רק טקסט הנחיה'],
              ['button', 'כפתור הפעולה הראשי הופך ל"שמור לקוח"'],
              ['delete', 'אין כפתור מחיקה בכותרת התחתונה'],
            ].map(([k, txt]) => (
              <li key={k} style={{ display: 'flex', gap: 8, fontSize: 12, color: 'var(--md-on-surface-variant)' }}>
                <span className="ms" style={{ fontSize: 16, color: 'var(--md-primary)', flexShrink: 0, marginTop: 2 }}>change_history</span>
                <span style={{ flex: 1 }}>{txt}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Mini sheet preview */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-start' }}>
          <div style={{
            width: 680,
            background: 'var(--md-surface-container-lowest)',
            borderRadius: 16,
            border: '1px solid var(--md-outline-variant)',
            boxShadow: 'var(--shadow-2)',
            overflow: 'hidden',
            display: 'flex', flexDirection: 'column',
          }}>
            <SheetHeader mode="create" />
            <div style={{
              padding: 24, display: 'flex', flexDirection: 'column', gap: 18,
              background: 'var(--md-surface-container-lowest)',
            }}>
              <FieldGroup label="פרטי קשר">
                <Field label="שם מלא" required>
                  <TextInput value="" placeholder="לדוגמה: רחל כהן" />
                </Field>

                <Field
                  label="טלפון"
                  required
                  hint="מספר הטלפון ייחודי לכל לקוח בעסק"
                >
                  <TextInput value="" placeholder="05X-XXX-XXXX" ltr />
                </Field>
              </FieldGroup>

              <ScrollHint />
            </div>
            <SheetFooter mode="create" />
          </div>
        </div>
      </div>
    </div>
  );
}

function ScrollHint() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      padding: '10px 12px', borderRadius: 999,
      background: 'var(--md-surface-container-low)',
      border: '1px dashed var(--md-outline-variant)',
      fontSize: 11, color: 'var(--md-on-surface-variant)',
    }}>
      <span className="ms" style={{ fontSize: 16 }}>more_horiz</span>
      <span>שדות נוספים — כתובת, העדפות, סטטוס</span>
    </div>
  );
}

// ---------- Mount ----------
ReactDOM.createRoot(document.getElementById('root')).render(<App />);
