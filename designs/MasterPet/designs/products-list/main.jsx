// ============ App: Products List (Catalog) ============

const { useState: usePLState } = React;

function App() {
  const [selectedNav, setSelectedNav] = usePLState('inventory');
  return (
    <div style={{
      display: 'flex', flexDirection: 'row-reverse',
      minHeight: '100vh', width: 1440, margin: '0 auto',
      background: 'var(--md-surface)',
    }}>
      <NavRail selected={selectedNav} onSelect={setSelectedNav} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <TopBar />
        <main style={{ padding: '24px 32px 48px', display: 'flex', flexDirection: 'column', gap: 32 }}>
          <PageHeader />
          <KpiStrip />
          <Toolbar />
          <DataTable />
          <BulkSelectionBar />
          <EmptyStatePreview />
        </main>
      </div>
    </div>
  );
}

// ---------- Nav Rail (verbatim shell) ----------
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
          borderRadius: 999, color: 'var(--md-on-surface-variant)',
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
        <nav style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--md-on-surface-variant)', marginBottom: 4 }}>
          <span>מלאי</span>
          <span className="ms ms-flip-rtl" style={{ fontSize: 14 }}>chevron_left</span>
          <span style={{ color: 'var(--md-on-surface)', fontWeight: 500 }}>קטלוג מוצרים</span>
        </nav>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: 'var(--md-on-surface)', lineHeight: 1.3 }}>
          קטלוג מוצרים
        </h1>
        <div style={{ fontSize: 14, color: 'var(--md-on-surface-variant)', marginTop: 4 }}>
          ניהול כל המוצרים, המחירים והמלאי במקום אחד · עדכון אחרון לפני <span className="num">3</span> דקות
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          height: 40, padding: '0 16px', borderRadius: 999,
          background: 'transparent', color: 'var(--md-primary)',
          border: '1px solid var(--md-outline)',
          fontFamily: 'inherit', fontSize: 13, fontWeight: 500, cursor: 'pointer',
        }}>
          <span className="ms" style={{ fontSize: 18 }}>upload_file</span>
          ייבוא מ-Excel
        </button>
        <button style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          height: 40, padding: '0 16px', borderRadius: 999,
          background: 'transparent', color: 'var(--md-primary)',
          border: '1px solid var(--md-outline)',
          fontFamily: 'inherit', fontSize: 13, fontWeight: 500, cursor: 'pointer',
        }}>
          <span className="ms" style={{ fontSize: 18 }}>print</span>
          הדפס קטלוג
        </button>
      </div>
    </div>
  );
}

// ---------- KPI Strip ----------
function KpiStrip() {
  const { kpiSummary } = window;
  return (
    <section style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
      <KpiTile
        icon="inventory_2"
        iconColor="var(--md-primary)"
        iconBg="var(--md-primary-container)"
        label="מוצרים פעילים"
        value={kpiSummary.activeProducts}
        sub={<><span className="num">+2</span> השבוע</>}
        bg="var(--md-surface-container-low)"
      />
      <KpiWarningTile value={kpiSummary.lowStock} />
      <KpiTile
        icon="category"
        iconColor="var(--md-secondary)"
        iconBg="var(--md-secondary-container)"
        label="variants פעילים"
        value={kpiSummary.activeVariants}
        sub={<>בממוצע <span className="num">2.9</span> לכל מוצר</>}
        bg="var(--md-surface-container-low)"
      />
      <KpiTile
        icon="block"
        iconColor="var(--md-outline)"
        iconBg="var(--md-surface-container-high)"
        label="הופסקו"
        value={kpiSummary.discontinued}
        valueColor="var(--md-on-surface-variant)"
        sub={<>החודש</>}
        bg="var(--md-surface-container-lowest)"
        border="1px dashed var(--md-outline-variant)"
        iconFill={0}
      />
    </section>
  );
}

function KpiTile({ icon, iconColor, iconBg, label, value, sub, bg, valueColor, border, iconFill = 1 }) {
  return (
    <div style={{
      background: bg, padding: 20, borderRadius: 16,
      border: border || '1px solid var(--md-outline-variant)',
      minHeight: 148, display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <span style={{
          width: 36, height: 36, borderRadius: 12,
          background: iconBg, color: iconColor,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span className="ms" style={{
            fontSize: 22,
            fontVariationSettings: `'FILL' ${iconFill}, 'wght' 500, 'GRAD' 0, 'opsz' 24`,
          }}>{icon}</span>
        </span>
        <span style={{
          fontSize: 11, fontWeight: 600, letterSpacing: 0.4,
          textTransform: 'uppercase',
          color: 'var(--md-on-surface-variant)',
        }}>
          {label}
        </span>
      </div>

      <div style={{
        marginTop: 12, fontSize: 36, fontWeight: 700,
        letterSpacing: -0.5, lineHeight: 1.1,
        color: valueColor || 'var(--md-on-surface)',
      }}>
        <span className="num">{value}</span>
      </div>
      {sub && (
        <div style={{ marginTop: 'auto', paddingTop: 12, fontSize: 12, color: 'var(--md-on-surface-variant)' }}>
          {sub}
        </div>
      )}
    </div>
  );
}

function KpiWarningTile({ value }) {
  return (
    <div style={{
      background: 'var(--md-warning-container)',
      padding: 20, borderRadius: 16,
      border: '1px solid var(--md-warning)',
      minHeight: 148, display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <span style={{
          width: 36, height: 36, borderRadius: 12,
          background: 'rgba(245,158,11,0.20)', color: '#A65F00',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span className="ms" style={{ fontSize: 22, fontVariationSettings: "'FILL' 1, 'wght' 500" }}>warning</span>
        </span>
        <span style={{
          fontSize: 11, fontWeight: 600, letterSpacing: 0.4,
          textTransform: 'uppercase',
          color: '#A65F00',
        }}>
          מלאי נמוך
        </span>
      </div>

      <div style={{
        marginTop: 12, fontSize: 36, fontWeight: 700,
        letterSpacing: -0.5, lineHeight: 1.1,
        color: '#A65F00',
      }}>
        <span className="num">{value}</span>
      </div>
      <div style={{ fontSize: 12, color: 'rgba(74,47,0,0.78)', marginTop: 2 }}>
        <span className="num">variants</span> מתחת לרמת ה-<span style={{ direction: 'ltr', unicodeBidi: 'isolate' }}>reorder</span>
      </div>

      <div style={{ marginTop: 'auto', paddingTop: 14 }}>
        <button style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          height: 32, padding: '0 14px', borderRadius: 999,
          background: '#A65F00', color: '#fff', border: 'none',
          fontFamily: 'inherit', fontSize: 12, fontWeight: 600,
          cursor: 'pointer',
        }}>
          <span>טפל עכשיו</span>
          <span className="ms ms-flip-rtl" style={{ fontSize: 16 }}>arrow_back</span>
        </button>
      </div>
    </div>
  );
}

// ---------- Toolbar ----------
function Toolbar() {
  const { animalFilters, FilledButton } = window;
  const [animal, setAnimal] = usePLState('all');
  const [searchFocus, setSearchFocus] = usePLState(false);

  return (
    <div style={{
      background: 'var(--md-surface-container-low)',
      border: '1px solid var(--md-outline-variant)',
      borderRadius: 16, padding: '16px 24px',
      display: 'flex', flexDirection: 'column', gap: 14,
    }}>
      {/* Row 1: actions + search */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <FilledButton icon="add" variant="filled">מוצר חדש</FilledButton>
          <FilledButton icon="download" variant="outlined">ייצא CSV</FilledButton>
        </div>

        <div style={{ width: 420 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            height: 40, padding: '0 14px',
            background: searchFocus ? 'var(--md-surface-container-lowest)' : 'var(--md-surface-container)',
            border: `1px solid ${searchFocus ? 'var(--md-primary)' : 'var(--md-outline-variant)'}`,
            borderRadius: 999,
          }}>
            <span className="ms" style={{ fontSize: 20, color: 'var(--md-outline-variant)' }}>search</span>
            <input
              onFocus={() => setSearchFocus(true)}
              onBlur={() => setSearchFocus(false)}
              placeholder="חיפוש לפי שם, SKU, ברקוד, ספק…"
              style={{
                flex: 1, border: 'none', background: 'transparent', outline: 'none',
                fontFamily: 'inherit', fontSize: 13, color: 'var(--md-on-surface)',
                textAlign: 'right',
              }}
            />
          </div>
        </div>
      </div>

      {/* Row 2: filter chips + dropdowns + sort */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        {animalFilters.map(f => {
          const active = animal === f.id;
          return (
            <button
              key={f.id}
              onClick={() => setAnimal(f.id)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                height: 32, padding: '0 12px',
                borderRadius: 999,
                background: active ? 'var(--md-secondary-container)' : 'var(--md-surface-container)',
                color: active ? 'var(--md-on-secondary-container)' : 'var(--md-on-surface-variant)',
                border: active ? 'none' : '1px solid var(--md-outline-variant)',
                fontFamily: 'inherit', fontSize: 12, fontWeight: 500,
                cursor: 'pointer',
              }}>
              {active && <span className="ms" style={{ fontSize: 16 }}>check</span>}
              {!active && f.icon && <span className="ms" style={{ fontSize: 16 }}>{f.icon}</span>}
              <span>{f.label}</span>
              {f.id !== 'all' && (
                <span className="num" style={{
                  background: active ? 'rgba(0,0,0,0.08)' : 'var(--md-surface-container-high)',
                  padding: '0 6px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                }}>{f.count}</span>
              )}
            </button>
          );
        })}

        <div style={{ width: 1, height: 20, background: 'var(--md-outline-variant)', margin: '0 4px' }} />

        {['גיל', 'דיאטה', 'סטטוס'].map(label => (
          <button key={label} style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            height: 32, padding: '0 12px', borderRadius: 999,
            background: 'transparent', color: 'var(--md-on-surface-variant)',
            border: '1px solid var(--md-outline-variant)',
            fontFamily: 'inherit', fontSize: 12, fontWeight: 500,
            cursor: 'pointer',
          }}>
            <span>{label}</span>
            <span className="ms" style={{ fontSize: 16 }}>expand_more</span>
          </button>
        ))}

        <div style={{ flex: 1 }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 12, color: 'var(--md-on-surface-variant)' }}>מיון:</span>
          <button style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            height: 28, padding: '0 8px', borderRadius: 8,
            background: 'transparent', color: 'var(--md-on-surface)',
            border: 'none',
            fontFamily: 'inherit', fontSize: 12, fontWeight: 600,
            cursor: 'pointer',
          }}>
            שם א-ת
            <span className="ms" style={{ fontSize: 16, color: 'var(--md-on-surface-variant)' }}>expand_more</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------- DataTable ----------
const COLS = '40px 60px 1fr 96px 88px 100px 132px 96px 88px';

function DataTable() {
  const { products } = window;
  return (
    <div style={{
      background: 'var(--md-surface-container-low)',
      border: '1px solid var(--md-outline-variant)',
      borderRadius: 16, overflow: 'hidden',
    }}>
      <TableHeader />
      <div>
        {products.map((p, i) => (
          <ProductRow key={p.id} product={p} index={i} last={i === products.length - 1} />
        ))}
      </div>
      <TableFooter />
    </div>
  );
}

function TableHeader() {
  const cells = [
    { label: '', sortable: false, align: 'center' },
    { label: 'תמונה', sortable: false, align: 'center' },
    { label: 'שם מוצר', sortable: true, align: 'start' },
    { label: 'חיה', sortable: false, align: 'start' },
    { label: 'Variants', sortable: false, align: 'center' },
    { label: 'מלאי', sortable: true, align: 'center' },
    { label: 'מחיר', sortable: true, align: 'start' },
    { label: 'סטטוס', sortable: false, align: 'center' },
    { label: 'פעולות', sortable: false, align: 'center' },
  ];
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: COLS, alignItems: 'center',
      background: 'var(--md-surface-container)',
      borderBottom: '1px solid var(--md-outline-variant)',
      height: 44, padding: '0 16px', gap: 12,
    }}>
      {cells.map((c, i) => (
        <div key={i} style={{
          display: 'flex', alignItems: 'center',
          justifyContent: c.align === 'center' ? 'center' : 'flex-start',
          gap: 4,
          fontSize: 11, fontWeight: 600, letterSpacing: 0.4,
          textTransform: 'uppercase', color: 'var(--md-on-surface-variant)',
          minWidth: 0,
        }}>
          {i === 0 ? (
            <span style={{
              width: 18, height: 18, borderRadius: 4,
              border: '2px solid var(--md-outline)',
              display: 'inline-block',
            }} />
          ) : (
            <>
              <span>{c.label}</span>
              {c.sortable && (
                <span className="ms" style={{ fontSize: 16, color: 'var(--md-outline-variant)' }}>arrow_drop_down</span>
              )}
            </>
          )}
        </div>
      ))}
    </div>
  );
}

function ProductRow({ product: p, index, last }) {
  const { animalChip, IconButton } = window;
  const chip = animalChip[p.animal];
  const isHover = p.hovered;
  const isInactive = p.inactive;

  let bg;
  if (p.lowStock) bg = 'rgba(254,243,199,0.45)';
  else if (isInactive) bg = 'rgba(219,223,215,0.25)';
  else if (isHover) bg = 'var(--md-surface-container-high)';
  else bg = index % 2 === 0 ? 'var(--md-surface-container-lowest)' : 'var(--md-surface-container-low)';

  return (
    <div style={{
      position: 'relative',
      display: 'grid', gridTemplateColumns: COLS, alignItems: 'center', gap: 12,
      padding: '0 16px', minHeight: 64,
      background: bg,
      borderBottom: last ? 'none' : '1px solid var(--md-outline-variant)',
      borderInlineStart: p.lowStock ? '3px solid var(--md-warning)' : '3px solid transparent',
      boxShadow: isHover ? 'var(--shadow-1)' : 'none',
      transition: 'background 120ms ease',
    }}>
      {/* Checkbox */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <span style={{
          width: 18, height: 18, borderRadius: 4,
          border: `2px solid ${isHover ? 'var(--md-primary)' : 'var(--md-outline)'}`,
          background: isHover ? 'var(--md-surface-container-lowest)' : 'transparent',
          display: 'inline-block',
        }} />
      </div>

      {/* Image */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div style={{
          width: 40, height: 40, borderRadius: 8,
          background: p.imgTint,
          border: '1px solid var(--md-outline-variant)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--md-secondary)',
          opacity: isInactive ? 0.5 : 1,
        }}>
          <span className="ms" style={{ fontSize: 22, fontVariationSettings: "'FILL' 1, 'wght' 400" }}>pets</span>
        </div>
      </div>

      {/* Name + brand */}
      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, gap: 2 }}>
        <span style={{
          fontSize: 14, fontWeight: 600,
          color: isInactive ? 'var(--md-on-surface-variant)' : 'var(--md-on-surface)',
          lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {p.name}
        </span>
        <span style={{ fontSize: 12, color: 'var(--md-on-surface-variant)', lineHeight: 1.3 }}>
          {p.brand}
        </span>
      </div>

      {/* Animal chip */}
      <div>
        <AnimalChip kind={chip.kind} icon={chip.icon} label={chip.label} muted={isInactive} />
      </div>

      {/* Variants */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          minWidth: 32, height: 22, padding: '0 8px', borderRadius: 8,
          background: 'var(--md-secondary-container)',
          color: 'var(--md-on-secondary-container)',
          fontSize: 12, fontWeight: 600,
        }}>
          <span className="num">{p.variants}</span>
        </span>
        {p.lowStock && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 3,
            padding: '1px 6px', borderRadius: 6,
            background: 'var(--md-error-container)',
            color: 'var(--md-on-error-container)',
            fontSize: 10, fontWeight: 600, lineHeight: 1.3,
            whiteSpace: 'nowrap',
          }}>
            <span className="ms" style={{ fontSize: 12 }}>warning</span>
            <span className="num">{p.lowStockCount}</span> נמוך
          </span>
        )}
      </div>

      {/* Stock */}
      <div style={{ textAlign: 'center' }}>
        <span style={{
          fontSize: 14,
          fontWeight: p.lowStock ? 600 : 500,
          color: p.lowStock ? 'var(--md-error)' : (isInactive ? 'var(--md-on-surface-variant)' : 'var(--md-on-surface)'),
        }}>
          <span className="num">{p.stock}</span> יח׳
        </span>
      </div>

      {/* Price */}
      <div className="currency" style={{
        fontSize: 14, fontWeight: 500,
        color: isInactive ? 'var(--md-on-surface-variant)' : 'var(--md-on-surface)',
      }}>
        {p.priceMin === p.priceMax
          ? <>₪{p.priceMin}</>
          : <>₪{p.priceMin} – ₪{p.priceMax}</>}
      </div>

      {/* Status */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        {p.status === 'active'
          ? <StatusPill kind="filled-primary">פעיל</StatusPill>
          : <StatusPill kind="outlined">כבוי</StatusPill>}
      </div>

      {/* Actions (revealed on hover or showcase row) */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
        {isHover ? (
          <>
            <RowIcon icon="edit" title="עריכה" />
            <RowIcon icon="content_copy" title="שכפול" />
            <RowIcon icon="delete" title="מחיקה" danger />
          </>
        ) : (
          <button title="עוד" style={{
            width: 28, height: 28, borderRadius: '50%', border: 'none',
            background: 'transparent', cursor: 'pointer',
            color: 'var(--md-on-surface-variant)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span className="ms" style={{ fontSize: 18 }}>more_vert</span>
          </button>
        )}
      </div>
    </div>
  );
}

function AnimalChip({ kind, icon, label, muted }) {
  const bg = muted ? 'transparent' : (kind === 'tertiary' ? 'var(--md-tertiary-container)' : 'var(--md-secondary-container)');
  const fg = muted ? 'var(--md-on-surface-variant)' : (kind === 'tertiary' ? 'var(--md-on-tertiary-container)' : 'var(--md-on-secondary-container)');
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '3px 10px', borderRadius: 8,
      background: bg, color: fg,
      border: muted ? '1px solid var(--md-outline-variant)' : 'none',
      fontSize: 12, fontWeight: 500,
    }}>
      <span className="ms" style={{ fontSize: 14 }}>{icon}</span>
      {label}
    </span>
  );
}

function StatusPill({ kind, children }) {
  const styles = kind === 'filled-primary' ? {
    background: 'var(--md-primary)', color: 'var(--md-on-primary)', border: '1px solid var(--md-primary)',
  } : {
    background: 'transparent', color: 'var(--md-on-surface-variant)', border: '1px solid var(--md-outline-variant)',
  };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '3px 12px', borderRadius: 8,
      fontSize: 12, fontWeight: 500, letterSpacing: 0.1, whiteSpace: 'nowrap',
      ...styles,
    }}>
      {kind === 'filled-primary' && (
        <span style={{ width: 6, height: 6, borderRadius: 3, background: '#9BE9A8' }} />
      )}
      {children}
    </span>
  );
}

function RowIcon({ icon, title, danger }) {
  const [hover, setHover] = usePLState(false);
  return (
    <button
      title={title}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: 28, height: 28, borderRadius: '50%', border: 'none',
        background: hover ? (danger ? 'var(--md-error-container)' : 'var(--md-surface-container)') : 'transparent',
        cursor: 'pointer',
        color: danger && hover ? 'var(--md-error)' : 'var(--md-on-surface-variant)',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 120ms ease',
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
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
      borderTop: '1px solid var(--md-outline-variant)',
    }}>
      {/* RTL start = right */}
      <div style={{ fontSize: 12, color: 'var(--md-on-surface-variant)' }}>
        מציג <span className="num">7</span> מתוך <span className="num">47</span> מוצרים
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--md-on-surface-variant)' }}>
          <span>שורות בעמוד:</span>
          <button style={{
            display: 'inline-flex', alignItems: 'center', gap: 2,
            border: 'none', background: 'transparent',
            fontFamily: 'inherit', fontSize: 12, fontWeight: 600,
            color: 'var(--md-on-surface)', cursor: 'pointer',
          }}>
            <span className="num">10</span>
            <span className="ms" style={{ fontSize: 14, color: 'var(--md-on-surface-variant)' }}>expand_more</span>
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <PageArrow icon="chevron_right" disabled />
        {[1, 2, 3].map(n => (
          <PageNum key={n} num={n} active={n === 1} />
        ))}
        <span style={{ padding: '0 6px', color: 'var(--md-on-surface-variant)' }}>…</span>
        <PageNum num={8} />
        <PageArrow icon="chevron_left" />
      </div>
    </div>
  );
}

function PageNum({ num, active }) {
  return (
    <button style={{
      width: 28, height: 28, borderRadius: 999, border: 'none',
      background: active ? 'var(--md-primary-container)' : 'transparent',
      color: active ? 'var(--md-on-primary-container)' : 'var(--md-on-surface-variant)',
      fontFamily: 'inherit', fontSize: 12, fontWeight: active ? 700 : 500,
      cursor: 'pointer',
    }}>
      <span className="num">{num}</span>
    </button>
  );
}

function PageArrow({ icon, disabled }) {
  return (
    <button disabled={disabled} style={{
      width: 28, height: 28, borderRadius: '50%', border: 'none',
      background: 'transparent',
      color: disabled ? 'var(--md-outline-variant)' : 'var(--md-on-surface-variant)',
      cursor: disabled ? 'default' : 'pointer',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <span className="ms" style={{ fontSize: 18 }}>{icon}</span>
    </button>
  );
}

// ---------- Bulk Selection Bar (preview peek state) ----------
function BulkSelectionBar() {
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.4, textTransform: 'uppercase', color: 'var(--md-on-surface-variant)', marginBottom: 8 }}>
        מצב בחירה מרובה (מופיע כאשר נבחרו פריטים)
      </div>
      <div style={{
        background: 'var(--md-inverse-surface)',
        color: 'var(--md-inverse-on-surface)',
        borderRadius: 999, padding: '10px 16px',
        boxShadow: 'var(--shadow-2)',
        display: 'flex', alignItems: 'center', gap: 16,
      }}>
        {/* RTL start: close + count */}
        <button title="סגור" style={{
          width: 32, height: 32, borderRadius: '50%', border: 'none',
          background: 'rgba(255,255,255,0.08)', color: '#fff',
          cursor: 'pointer',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span className="ms" style={{ fontSize: 18 }}>close</span>
        </button>
        <span style={{ fontSize: 14, fontWeight: 600 }}>
          <span className="num">3</span> מוצרים נבחרו
        </span>

        <div style={{ flex: 1 }} />

        <div style={{ display: 'flex', gap: 8 }}>
          <BulkBtn icon="toggle_on" label="הפעל" />
          <BulkBtn icon="toggle_off" label="כבה" />
          <BulkBtn icon="edit" label="עריכה קבוצתית" />
          <BulkBtn icon="delete" label="מחק" danger />
        </div>
      </div>
    </div>
  );
}

function BulkBtn({ icon, label, danger }) {
  return (
    <button style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      height: 32, padding: '0 14px', borderRadius: 999,
      background: danger ? 'rgba(179,38,30,0.20)' : 'rgba(255,255,255,0.10)',
      color: danger ? '#F9DEDC' : '#F0F1EA',
      border: danger ? '1px solid rgba(249,222,220,0.30)' : 'none',
      cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: 500,
    }}>
      <span className="ms" style={{ fontSize: 16 }}>{icon}</span>
      {label}
    </button>
  );
}

// ---------- Empty State preview ----------
function EmptyStatePreview() {
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.4, textTransform: 'uppercase', color: 'var(--md-on-surface-variant)', marginBottom: 8 }}>
        מצב ריק (כשאין מוצרים)
      </div>
      <div style={{
        background: 'var(--md-surface-container-low)',
        border: '1px dashed var(--md-outline-variant)',
        borderRadius: 16, padding: 48,
        display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 16,
      }}>
        <div style={{
          width: 96, height: 96, borderRadius: '50%',
          background: 'var(--md-surface-container)',
          color: 'var(--md-outline)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span className="ms" style={{ fontSize: 56, fontVariationSettings: "'FILL' 0, 'wght' 300" }}>inventory_2</span>
        </div>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--md-on-surface)' }}>
            אין מוצרים עדיין
          </div>
          <div style={{ fontSize: 14, color: 'var(--md-on-surface-variant)', marginTop: 4, maxWidth: 420 }}>
            ייבא את הקטלוג מ-Excel או הוסף מוצר ידנית כדי להתחיל לנהל את המלאי שלך.
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          <button style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            height: 40, padding: '0 18px', borderRadius: 999,
            background: 'var(--md-primary)', color: 'var(--md-on-primary)', border: 'none',
            cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 500,
          }}>
            <span className="ms" style={{ fontSize: 18 }}>upload_file</span>
            ייבא מ-Excel
          </button>
          <button style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            height: 40, padding: '0 18px', borderRadius: 999,
            background: 'transparent', color: 'var(--md-primary)', border: '1px solid var(--md-outline)',
            cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 500,
          }}>
            <span className="ms" style={{ fontSize: 18 }}>add</span>
            הוסף מוצר
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------- Mount ----------
ReactDOM.createRoot(document.getElementById('root')).render(<App />);
