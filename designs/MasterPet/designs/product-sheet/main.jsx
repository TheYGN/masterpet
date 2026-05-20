// ============ App: Product Sheet (over dimmed Products List) ============

const { useState: usePSState } = React;

function App() {
  return (
    <div style={{
      position: 'relative', width: 1440, margin: '0 auto',
      minHeight: '100vh', background: 'var(--md-surface)',
      overflow: 'hidden',
    }}>
      {/* Layer 1: dimmed ProductsList background (under scrim) */}
      <BackgroundLayer />

      {/* Layer 2: scrim — sits between bg content and the rail+topbar+sheet.
          IMPORTANT: rail + top bar must remain above the scrim. */}
      <div aria-hidden="true" style={{
        position: 'absolute', inset: 0,
        background: 'rgba(0, 0, 0, 0.32)',
        backdropFilter: 'blur(2px)',
        WebkitBackdropFilter: 'blur(2px)',
        pointerEvents: 'none',
        zIndex: 5,
      }} />

      {/* Layer 3: shell — rail + top bar above scrim */}
      <ShellOverlay />

      {/* Layer 4: Sheet panel on inline-start (left in RTL) */}
      <SheetPanel />
    </div>
  );
}

// ============================================================
// Background ProductsList (rendered, then dimmed)
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
      <div style={{ fontSize: 12, color: 'var(--md-on-surface-variant)', marginBottom: 4 }}>מלאי · קטלוג מוצרים</div>
      <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: 'var(--md-on-surface)' }}>קטלוג מוצרים</h1>
    </div>
  );
}

function BgKpiStrip() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
      {[
        { label: 'מוצרים פעילים', value: '47', tint: 'var(--md-surface-container-low)' },
        { label: 'מלאי נמוך', value: '6', tint: 'var(--md-warning-container)' },
        { label: 'variants פעילים', value: '134', tint: 'var(--md-surface-container-low)' },
        { label: 'הופסקו', value: '3', tint: 'var(--md-surface-container-lowest)' },
      ].map((k, i) => (
        <div key={i} style={{
          background: k.tint, padding: 20, borderRadius: 16, minHeight: 148,
          border: '1px solid var(--md-outline-variant)',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.4, textTransform: 'uppercase', color: 'var(--md-on-surface-variant)' }}>{k.label}</div>
          <div style={{ fontSize: 36, fontWeight: 700, color: 'var(--md-on-surface)' }}><span className="num">{k.value}</span></div>
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
    }} />
  );
}

function BgTable() {
  const { bgProducts } = window;
  return (
    <div style={{
      background: 'var(--md-surface-container-low)',
      border: '1px solid var(--md-outline-variant)',
      borderRadius: 16, overflow: 'hidden',
    }}>
      <div style={{
        height: 44, padding: '0 16px',
        background: 'var(--md-surface-container)',
        borderBottom: '1px solid var(--md-outline-variant)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        fontSize: 11, fontWeight: 600, color: 'var(--md-on-surface-variant)', textTransform: 'uppercase', letterSpacing: 0.4,
      }}>
        <span>שם מוצר</span>
        <span style={{ display: 'flex', gap: 64 }}>
          <span>Variants</span>
          <span>מלאי</span>
          <span>מחיר</span>
          <span>סטטוס</span>
        </span>
      </div>
      {bgProducts.map((p, i) => (
        <div key={i} style={{
          height: 64, padding: '0 16px',
          background: p.lowStock ? 'rgba(254,243,199,0.45)' :
                      p.status === 'inactive' ? 'rgba(219,223,215,0.25)' :
                      i % 2 === 0 ? 'var(--md-surface-container-lowest)' : 'var(--md-surface-container-low)',
          borderBottom: i === bgProducts.length - 1 ? 'none' : '1px solid var(--md-outline-variant)',
          borderInlineStart: p.lowStock ? '3px solid var(--md-warning)' : '3px solid transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
            <span style={{ width: 18, height: 18, borderRadius: 4, border: '2px solid var(--md-outline)' }} />
            <span style={{
              width: 40, height: 40, borderRadius: 8,
              background: 'var(--md-surface-container)',
              border: '1px solid var(--md-outline-variant)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--md-secondary)',
            }}>
              <span className="ms" style={{ fontSize: 22, fontVariationSettings: "'FILL' 1, 'wght' 400" }}>pets</span>
            </span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--md-on-surface)' }}>{p.name}</div>
              <div style={{ fontSize: 12, color: 'var(--md-on-surface-variant)' }}>{p.brand}</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 56 }}>
            <span style={{ fontSize: 12, fontWeight: 600 }}><span className="num">{p.variants}</span></span>
            <span style={{ fontSize: 14, color: p.lowStock ? 'var(--md-error)' : 'var(--md-on-surface)', fontWeight: p.lowStock ? 600 : 500 }}>
              <span className="num">{p.stock}</span> יח׳
            </span>
            <span className="currency" style={{ fontSize: 14, color: 'var(--md-on-surface)' }}>{p.price}</span>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              padding: '3px 12px', borderRadius: 8, fontSize: 12, fontWeight: 500,
              background: p.status === 'active' ? 'var(--md-primary)' : 'transparent',
              color: p.status === 'active' ? 'var(--md-on-primary)' : 'var(--md-on-surface-variant)',
              border: p.status === 'active' ? '1px solid var(--md-primary)' : '1px solid var(--md-outline-variant)',
              minWidth: 64, justifyContent: 'center',
            }}>{p.status === 'active' ? 'פעיל' : 'כבוי'}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// Shell (above scrim)
// ============================================================
function ShellOverlay() {
  return (
    <div style={{
      position: 'absolute', inset: 0,
      display: 'flex', flexDirection: 'row-reverse',
      pointerEvents: 'none', // children re-enable
      zIndex: 10,
    }}>
      <NavRail />
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <TopBar />
        {/* Spacer for content */}
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
      height: '100vh', pointerEvents: 'auto',
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
          <NavItem key={item.id} item={item} active={item.id === 'inventory'} />
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
function SheetPanel() {
  return (
    <aside style={{
      position: 'absolute', insetInlineStart: 0, top: 0,
      width: 720, height: '100vh',
      background: 'var(--md-surface-container-lowest)',
      boxShadow: 'var(--shadow-3)',
      borderInlineEnd: '1px solid var(--md-outline-variant)',
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
      background: 'var(--md-surface-container-lowest)',
      borderBottom: '1px solid var(--md-outline-variant)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
    }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--md-on-surface)', lineHeight: 1.2 }}>
          מוצר חדש
        </div>
        <nav style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--md-on-surface-variant)', marginTop: 2 }}>
          <span>קטלוג</span>
          <span className="ms ms-flip-rtl" style={{ fontSize: 14 }}>chevron_left</span>
          <span style={{ color: 'var(--md-on-surface)', fontWeight: 500 }}>מוצר חדש</span>
        </nav>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '4px 10px', borderRadius: 999,
          background: 'var(--md-surface-container)',
          fontSize: 11, color: 'var(--md-on-surface-variant)',
        }}>
          <span style={{ width: 6, height: 6, borderRadius: 3, background: 'var(--md-warning)', boxShadow: '0 0 0 4px rgba(245,158,11,0.18)' }} />
          טיוטה — לא נשמר
        </div>
        <button title="סגור" aria-label="סגור" style={{
          width: 40, height: 40, borderRadius: '50%', border: 'none',
          background: 'transparent', cursor: 'pointer',
          color: 'var(--md-on-surface-variant)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span className="ms" style={{ fontSize: 22 }}>close</span>
        </button>
      </div>
    </header>
  );
}

// ============================================================
// SHEET BODY (scrolled to Section D — A/B/C scrolled past)
// ============================================================
function SheetBody() {
  return (
    <div style={{
      flex: 1, overflowY: 'auto', minHeight: 0,
      background: 'var(--md-surface-container-lowest)',
      padding: '24px 24px 32px',
      display: 'flex', flexDirection: 'column', gap: 24,
    }}>
      <ScrollIndicator />
      <SectionVariants />
      <SectionInitialStock />
    </div>
  );
}

function ScrollIndicator() {
  // Visual hint that earlier sections (A/B/C) are above
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '8px 12px', borderRadius: 999,
      background: 'var(--md-surface-container-low)',
      border: '1px dashed var(--md-outline-variant)',
      fontSize: 11, color: 'var(--md-on-surface-variant)',
    }}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        <span className="ms" style={{ fontSize: 14 }}>expand_less</span>
        מוצר · טקסונומיה · attributes — הושלמו
      </span>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
        <span style={{
          width: 28, height: 6, borderRadius: 3, background: 'var(--md-primary)',
          boxShadow: 'inset -10px 0 0 0 var(--md-primary-container)',
        }} />
        <span><span className="num">4</span>/<span className="num">5</span></span>
      </span>
    </div>
  );
}

// ============================================================
// Section D — Variants Editor
// ============================================================
function SectionVariants() {
  const { variants } = window;
  return (
    <section>
      <SectionHeader title="עריכת variants" count={6} action={
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 12, color: 'var(--md-on-surface-variant)' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <span className="ms" style={{ fontSize: 14, color: 'var(--md-primary)' }}>auto_awesome</span>
              נוצרו אוטומטית מ-<span className="num">2</span> attributes
            </span>
          </span>
          <button style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            border: 'none', background: 'transparent', color: 'var(--md-on-surface-variant)',
            fontFamily: 'inherit', fontSize: 12, fontWeight: 500, cursor: 'pointer',
          }}>
            כווץ
            <span className="ms" style={{ fontSize: 18 }}>expand_less</span>
          </button>
        </div>
      } />

      <div style={{
        background: 'var(--md-surface-container-lowest)',
        border: '1px solid var(--md-outline-variant)',
        borderRadius: 12, overflow: 'hidden',
      }}>
        <VariantsTableHeader />
        {variants.map((v, i) => (
          <VariantRow key={v.id} v={v} last={i === variants.length - 1} />
        ))}
      </div>

      {/* Helper row */}
      <div style={{
        marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        fontSize: 11, color: 'var(--md-on-surface-variant)',
      }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <span className="ms" style={{ fontSize: 14 }}>lock_outline</span>
          עמודת "מחיר + מע״מ" מחושבת אוטומטית
        </span>
        <button style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          border: 'none', background: 'transparent', color: 'var(--md-primary)',
          fontFamily: 'inherit', fontSize: 12, fontWeight: 600, cursor: 'pointer',
        }}>
          <span className="ms" style={{ fontSize: 16 }}>edit_note</span>
          עריכה קבוצתית של מחירים
        </button>
      </div>
    </section>
  );
}

// Variant table column grid
const V_COLS = '1fr 132px 88px 92px 88px 132px 80px';

function VariantsTableHeader() {
  const cells = [
    { label: 'שם variant', align: 'start' },
    { label: 'SKU', align: 'start' },
    { label: 'מחיר', align: 'start', sub: '₪ ללא מע״מ' },
    { label: 'מחיר + מע״מ', align: 'start', lock: true },
    { label: 'מחיר עלות', align: 'start' },
    { label: 'ברקוד', align: 'start' },
    { label: 'סטטוס', align: 'center' },
  ];
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: V_COLS, gap: 12,
      height: 44, padding: '0 14px', alignItems: 'center',
      background: 'var(--md-surface-container)',
      borderBottom: '1px solid var(--md-outline-variant)',
    }}>
      {cells.map((c, i) => (
        <div key={i} style={{
          display: 'flex', alignItems: 'center', gap: 4,
          justifyContent: c.align === 'center' ? 'center' : 'flex-start',
          fontSize: 10, fontWeight: 600, letterSpacing: 0.4,
          textTransform: 'uppercase', color: 'var(--md-on-surface-variant)',
          minWidth: 0,
        }}>
          {c.lock && <span className="ms" style={{ fontSize: 12 }}>lock_outline</span>}
          <span>{c.label}</span>
          {c.sub && <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, opacity: 0.7, marginInlineStart: 2 }}>({c.sub})</span>}
        </div>
      ))}
    </div>
  );
}

function VariantRow({ v, last }) {
  const isFocused = v.focused;
  return (
    <div style={{
      position: 'relative',
      display: 'grid', gridTemplateColumns: V_COLS, gap: 12,
      padding: '12px 14px', alignItems: 'start',
      background: isFocused ? 'var(--md-surface-container-low)' : 'var(--md-surface-container-lowest)',
      borderBottom: last ? 'none' : '1px solid var(--md-outline-variant)',
      outline: isFocused ? '2px solid var(--md-primary)' : 'none',
      outlineOffset: -1,
    }}>
      {/* Variant name (chip pair) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
        <VariantChip label="גודל" value={v.sizeChip} />
        <span style={{ color: 'var(--md-outline-variant)', fontSize: 12 }}>·</span>
        <VariantChip label="טעם" value={v.flavorChip} />
      </div>

      {/* SKU */}
      <CellInput value={v.sku} mono focused={isFocused} />

      {/* Price */}
      <CellInput value={v.price} prefix="₪" currency focused={isFocused} primary={isFocused} />

      {/* Price + VAT (locked) */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 4,
        height: 32, padding: '0 10px', borderRadius: 8,
        background: 'var(--md-surface-container)',
        color: 'var(--md-on-surface-variant)',
        fontSize: 12,
      }}>
        <span className="ms" style={{ fontSize: 12, opacity: 0.6 }}>lock_outline</span>
        <span className="currency" style={{ fontWeight: 500 }}>₪{v.priceVat}</span>
      </div>

      {/* Cost */}
      <CellInput value={v.cost} prefix="₪" currency />

      {/* Barcode */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
        <CellInput value={v.barcode} mono error={!!v.barcodeError} />
        {v.barcodeError && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            fontSize: 11, color: 'var(--md-error)',
          }}>
            <span className="ms" style={{ fontSize: 12 }}>error</span>
            <span>{v.barcodeError}</span>
          </div>
        )}
      </div>

      {/* Status */}
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 4 }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          padding: '3px 10px', borderRadius: 8,
          background: 'var(--md-primary)', color: 'var(--md-on-primary)',
          fontSize: 11, fontWeight: 500,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: 3, background: '#9BE9A8' }} />
          פעיל
        </span>
      </div>
    </div>
  );
}

function VariantChip({ label, value }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '2px 8px', borderRadius: 6,
      background: 'var(--md-secondary-container)',
      color: 'var(--md-on-secondary-container)',
      fontSize: 11, fontWeight: 500, whiteSpace: 'nowrap',
    }}>
      <span style={{ opacity: 0.7 }}>{label}:</span>
      <span style={{ fontWeight: 600, direction: 'ltr' }}>{value}</span>
    </span>
  );
}

function CellInput({ value, mono, prefix, currency, focused, primary, error }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 4,
      height: 32, padding: prefix ? '0 8px 0 8px' : '0 10px',
      borderRadius: 8,
      background: 'var(--md-surface-container-lowest)',
      border: `1px solid ${error ? 'var(--md-error)' : (primary ? 'var(--md-primary)' : 'var(--md-outline-variant)')}`,
      boxShadow: primary ? '0 0 0 2px rgba(27,94,32,0.12)' : 'none',
      position: 'relative',
      minWidth: 0,
    }}>
      {prefix && (
        <span style={{ fontSize: 12, color: 'var(--md-on-surface-variant)', flexShrink: 0 }}>{prefix}</span>
      )}
      <span style={{
        flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        fontSize: mono ? 11 : 12,
        fontFamily: mono ? "'Roboto Mono', 'Heebo', monospace" : 'inherit',
        fontWeight: primary ? 600 : 500,
        color: 'var(--md-on-surface)',
        direction: (currency || mono) ? 'ltr' : 'inherit',
        textAlign: (currency || mono) ? 'left' : 'right',
        fontVariantNumeric: 'tabular-nums',
      }} className={currency ? 'currency' : (mono ? 'num' : '')}>
        {value}
      </span>
      {primary && (
        <span aria-hidden="true" style={{
          width: 1, height: 18, background: 'var(--md-primary)',
          animation: 'caretBlink 1s steps(2) infinite',
        }} />
      )}
    </div>
  );
}

// ============================================================
// Section E — Initial Stock (collapsed)
// ============================================================
function SectionInitialStock() {
  return (
    <section>
      <SectionHeader title="מלאי ראשוני" sub="אופציונלי" />
      <button style={{
        width: '100%', textAlign: 'right',
        padding: '16px 20px', borderRadius: 12,
        background: 'var(--md-surface-container-low)',
        border: '1px solid var(--md-outline-variant)',
        cursor: 'pointer', fontFamily: 'inherit',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
      }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10, color: 'var(--md-on-surface)' }}>
          <span style={{
            width: 32, height: 32, borderRadius: 10,
            background: 'var(--md-surface-container)',
            color: 'var(--md-on-surface-variant)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span className="ms" style={{ fontSize: 18 }}>inventory_2</span>
          </span>
          <span style={{ fontSize: 14, fontWeight: 600 }}>הגדרת מלאי התחלתי לכל variant</span>
        </span>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          fontSize: 12, color: 'var(--md-on-surface-variant)',
        }}>
          <span>ניתן להגדיר מאוחר יותר</span>
          <span className="ms" style={{ fontSize: 20 }}>expand_more</span>
        </span>
      </button>
    </section>
  );
}

// ============================================================
// Generic section header
// ============================================================
function SectionHeader({ title, count, sub, action }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      marginBottom: 12, gap: 12,
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <h3 style={{
          margin: 0, fontSize: 12, fontWeight: 700, letterSpacing: 0.6,
          textTransform: 'uppercase', color: 'var(--md-on-surface-variant)',
        }}>{title}</h3>
        {count != null && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            minWidth: 22, height: 20, padding: '0 6px', borderRadius: 6,
            background: 'var(--md-primary-container)', color: 'var(--md-on-primary-container)',
            fontSize: 11, fontWeight: 700,
          }}>
            <span className="num">{count}</span>
          </span>
        )}
        {sub && (
          <span style={{ fontSize: 12, color: 'var(--md-on-surface-variant)', textTransform: 'none', fontWeight: 400 }}>
            ({sub})
          </span>
        )}
      </div>
      {action}
    </div>
  );
}

// ============================================================
// Sheet Footer
// ============================================================
function SheetFooter() {
  const { FilledButton } = window;
  return (
    <footer style={{
      height: 72, padding: '0 24px', flexShrink: 0,
      background: 'var(--md-surface-container-lowest)',
      borderTop: '1px solid var(--md-outline-variant)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <FilledButton icon="check" variant="filled">שמור מוצר</FilledButton>
        <FilledButton icon="add" variant="tonal">שמור וצור variant נוסף</FilledButton>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 11, color: 'var(--md-on-surface-variant)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <span className="ms" style={{ fontSize: 14 }}>history</span>
          טיוטה אוטומטית לפני <span className="num">12</span> שניות
        </span>
        <button style={{
          height: 40, padding: '0 18px', borderRadius: 999,
          background: 'transparent', color: 'var(--md-on-surface-variant)', border: 'none',
          fontFamily: 'inherit', fontSize: 14, fontWeight: 500, cursor: 'pointer',
        }}>בטל</button>
      </div>
    </footer>
  );
}

// ============================================================
// Caret blink keyframes
// ============================================================
const styleTag = document.createElement('style');
styleTag.textContent = `@keyframes caretBlink { 0%, 100% { opacity: 1 } 50% { opacity: 0 } }`;
document.head.appendChild(styleTag);

// ---------- Mount ----------
ReactDOM.createRoot(document.getElementById('root')).render(<App />);
