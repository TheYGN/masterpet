You are designing a screen for MasterPet — a B2B SaaS logistics management
platform for Israeli pet food businesses. This screen must visually match
the Business Owner Dashboard already designed in `designs/dashboard-branch/`.
Treat that dashboard as the visual source of truth.

============================================================
PRODUCT CONTEXT (unchanged)
============================================================
MasterPet unifies three channels into one: WhatsApp orders, phone orders,
and WooCommerce orders. It also predicts when a pet will run out of food
before the owner notices, then reaches out automatically. Two core pains:
(1) tool fragmentation, (2) customer churn from missed reorders.

Primary users: small-to-medium Israeli pet food store owners.
They are not technical. Every second they spend navigating = lost money.

============================================================
HARD TECHNICAL CONSTRAINTS (unchanged)
============================================================
- Framework: Next.js 14 App Router + React 18
- Component library: shadcn/ui
- Styling: Tailwind CSS — every design token maps to a Tailwind class
- Direction: RTL (Hebrew) — layout flips completely
- Design system: Material Design 3 (MD3)
- Typography: Heebo (Hebrew, primary) + Roboto (fallback), line-height 1.6
- Icons: Material Symbols Outlined ONLY (no emojis, no Heroicons, no Lucide)
- Color palette: derive from MD3 seed #1B5E20 (deep forest green)
- Light mode only

============================================================
EXACT MD3 TOKENS (copy these verbatim into :root — DO NOT invent new ones)
============================================================
:root {
  --md-primary: #1B5E20;
  --md-on-primary: #FFFFFF;
  --md-primary-container: #B7F0BB;
  --md-on-primary-container: #002106;

  --md-secondary: #52634F;
  --md-on-secondary: #FFFFFF;
  --md-secondary-container: #D5E8CF;
  --md-on-secondary-container: #101F10;

  --md-tertiary: #38656A;
  --md-on-tertiary: #FFFFFF;
  --md-tertiary-container: #BCEBF1;
  --md-on-tertiary-container: #002022;

  --md-error: #B3261E;
  --md-on-error: #FFFFFF;
  --md-error-container: #F9DEDC;
  --md-on-error-container: #410E0B;

  --md-warning: #F59E0B;
  --md-on-warning: #FFFFFF;
  --md-warning-container: #FEF3C7;
  --md-on-warning-container: #4A2F00;

  --md-surface: #FAFAFA;
  --md-surface-dim: #DBDFD7;
  --md-surface-bright: #FAFDF5;
  --md-surface-container-lowest: #FFFFFF;
  --md-surface-container-low: #F5F7F1;
  --md-surface-container: #EFF2EC;
  --md-surface-container-high: #E9ECE6;
  --md-surface-container-highest: #E4E7E1;

  --md-on-surface: #191D17;
  --md-on-surface-variant: #43483F;
  --md-outline: #73796F;
  --md-outline-variant: #C3C8BC;
  --md-inverse-surface: #2E3129;
  --md-inverse-on-surface: #F0F1EA;

  --shadow-1: 0 1px 2px 0 rgba(0,0,0,0.04), 0 1px 3px 1px rgba(0,0,0,0.04);
  --shadow-2: 0 1px 2px 0 rgba(0,0,0,0.06), 0 2px 6px 2px rgba(0,0,0,0.06);
  --shadow-3: 0 4px 8px 0 rgba(0,0,0,0.08), 0 8px 24px 4px rgba(0,0,0,0.06);
}

Use Heebo via Google Fonts. Material Symbols Outlined via Google Fonts.
Elevation = tonal surfaces (NOT drop shadows). Shadows reserved for hover/modal only.

============================================================
SHARED ATOMS — REUSE, DO NOT REINVENT
============================================================
These components already exist in `designs/dashboard-branch/parts.jsx`.
Copy that file verbatim into the new screen folder, then build on top:

- <StatusChip kind>            — kinds: filled-primary | tonal-secondary | tonal-tertiary | outlined
- <IconButton icon label badge size filled>
- <FilledButton icon variant size>   — variants: filled | tonal | outlined | text | error
- <Card padding elevation>     — elevation 0..3 (maps to surface-container-{lowest..high})
- <Sparkline data width height color>
- <ChannelDot channel>         — channels: whatsapp | phone | woo
- <NavItem item active hover onSelect>

============================================================
SHELL — REUSE, DO NOT REINVENT
============================================================
Every screen wraps in the same shell from the dashboard:

- Right-side Navigation Rail (88px wide, RTL), sticky, full height.
  Items (with this order):
    דשבורד (space_dashboard)
    אינבוקס (inbox)
    הזמנות (receipt_long)
    מלאי (inventory_2)
    לקוחות (group)
    נאמנות (loyalty)
    אוטומציות (bolt)
    הגדרות (settings)
  Active item gets MD3 navigation pill (secondary-container) + filled icon.
  Bottom of rail: avatar circle (gradient #38656A→#1B5E20) + "PRO" badge.

- Top Bar (72px tall, sticky):
  Right (RTL start): store name "חיות הבית של אבי" + Hebrew date "יום שני, 18 במאי 2026"
  Center: rounded search "חיפוש לקוחות, הזמנות, מוצרים…" + ⌘K kbd
  Left (RTL end): help IconButton, notifications IconButton (badge 4), divider,
                  FilledButton "+ הזמנה חדשה" (filled variant)

- Main content area: padding 24px 32px 48px, vertical flex with gap 32px.

Never redesign the rail or top bar — copy verbatim from main.jsx.

============================================================
RTL RULES (unchanged)
============================================================
- Navigation rail: RIGHT side
- Reading flow: right → left
- Directional icons: use `.ms-flip-rtl` (transform scaleX(-1))
- "Back" arrow = arrow_back, flipped → points RIGHT
- padding-inline-start/end, NEVER padding-left/right
- borderInlineStart/End, insetInlineStart/End
- Timestamps appear on the LEFT (they are secondary in RTL)
- Primary CTA appears on the RIGHT of each row
- Hebrew numerals = Western Arabic (0-9). Wrap every number in <span className="num">.
- Currency: ₪ before the number (₪12,450). Wrap in <span className="currency">.

============================================================
SPACING & GEOMETRY (unchanged)
============================================================
- Grid: 8px
- Card padding: 24px (KPI tile 20px; AlertCard 14px)
- Section gap: 32px
- Card gap inside section: 16px
- Border radius: pill=999, card=16, status chip=8, mini badge=6-8, avatar=50%
- Card border: always 1px solid var(--md-outline-variant)

============================================================
HERO METRIC PATTERN (use only if this screen has ONE killer metric)
============================================================
- Background: linear-gradient(135deg, #1B5E20 0%, #2E7D32 55%, #38656A 100%)
- Color: var(--md-on-primary), no border
- boxShadow: 0 1px 3px rgba(27,94,32,0.20), 0 8px 24px -8px rgba(27,94,32,0.35)
- Add radial watermark in corner (rgba(255,255,255,0.10) → 0)
- "HERO" pill in white-on-transparent corner badge
- CTA pill: white bg, primary text, arrow_back (flipped) icon

============================================================
SEVERITY PALETTE FOR ALERTS / BANNERS (unchanged)
============================================================
Error:   bg=error-container, dot=error, body=rgba(65,14,11,0.78),
         CTA bg=error, label "דחוף"
Warning: bg=warning-container, dot=warning, icon=#A65F00,
         body=rgba(74,47,0,0.78), CTA bg=#A65F00, label "אזהרה"

============================================================
DELIVERY FORMAT
============================================================
Produce a high-fidelity desktop mockup at 1440px width as:
- `designs/products-list/MasterPet Products List.html` — same <head>/<style> block as dashboard
- `designs/products-list/main.jsx` — App + sections specific to this screen
- `designs/products-list/data.jsx` — navItems (same order!) + realistic Hebrew sample data
- `designs/products-list/parts.jsx` — COPY VERBATIM from dashboard-branch/parts.jsx

The active nav item on the rail must be "מלאי" (inventory_2) — NOT "דשבורד".

============================================================
NEVER
============================================================
- No English in the UI (except brand names: Royal Canin, Hill's, Orijen, Acana, Pro Plan, Whiskas)
- No Lorem Ipsum — use realistic Hebrew pet-food-store data
- No dark mode
- No emoji, no Heroicons, no Lucide
- No new fonts
- No drop shadow on cards (tonal only)
- No reinventing StatusChip / Card / IconButton / NavItem — use the shared atoms
- No AI/prediction features visible as "AI" (Phase 2) — rule-based language only

============================================================
THIS SCREEN
============================================================
Screen name: products-list
Hebrew title: קטלוג מוצרים
Active nav item: מלאי (inventory_2)
Role: Business Owner (owner)

The 3-second test — what must the user understand within 3 seconds?
1. כמה מוצרים פעילים יש לי עכשיו, ובאיזה מצב המלאי הכולל?
2. אילו מוצרים דורשים תשומת לב דחופה — מלאי נמוך, כבויים, הופסקו?
3. איך אני מוצא מוצר ספציפי מהר, ואיך אני מוסיף מוצר חדש?

============================================================
SECTION 1 — KPI Strip
============================================================
4 tiles in a horizontal row, equal width, gap 16px.
Tiles use Card (elevation 1 = surface-container-low). Padding 20px.
No hero gradient in this section — this is a management screen, not a revenue dashboard.

Tile 1 — "מוצרים פעילים"
  icon: inventory_2 (24px, FILL 1, color: var(--md-primary))
  value: 47 (36px, 700 weight, tabular-nums, class="num")
  label: "מוצרים פעילים" (12px, 600, uppercase, letter-spacing 0.4, on-surface-variant)
  bg: surface-container-low

Tile 2 — "מלאי נמוך" (WARNING tile — most attention-grabbing)
  bg: var(--md-warning-container)   ← #FEF3C7
  border: 1px solid var(--md-warning)
  icon: warning (24px, FILL 1, color: #A65F00)
  value: 6 (36px, 700, color: #A65F00, class="num")
  sub-label: "variants מתחת לרמת ה-reorder" (12px, 400, rgba(74,47,0,0.78))
  label: "מלאי נמוך" (12px, 600, uppercase, letter-spacing 0.4, #A65F00)
  CTA pill at bottom: "טפל עכשיו" (FilledButton, tonal variant, size sm, bg #A65F00, color #fff, icon: arrow_back flipped)

Tile 3 — "Variants פעילים"
  icon: category (24px, FILL 1, color: var(--md-secondary))
  value: 134 (36px, 700, tabular-nums, class="num")
  label: "variants פעילים" (12px, 600, uppercase, on-surface-variant)
  bg: surface-container-low

Tile 4 — "הופסקו"
  icon: block (24px, FILL 0, color: var(--md-outline))
  value: 3 (36px, 700, tabular-nums, class="num", color: on-surface-variant)
  label: "הופסקו" (12px, 600, uppercase, on-surface-variant)
  bg: surface-container-lowest
  border: 1px dashed var(--md-outline-variant)

============================================================
SECTION 2 — Toolbar (Search + Filters + Actions)
============================================================
Layout: two rows, inside a Card (elevation 1), padding 16px 24px, border-radius 16px.

ROW 1 (top row) — RTL, space-between:
  RIGHT side: 
    FilledButton "+ מוצר חדש" (filled variant, primary, icon: add, size md)
    FilledButton "ייצא CSV" (outlined variant, icon: download, size md)  ← gap 8px from above
  LEFT side (RTL end = left visually):
    Search input, width ~420px:
      placeholder: "חיפוש לפי שם, SKU, ברקוד, ספק..."
      right icon (RTL start): search (20px, outline-variant)
      bg: surface-container, border-radius: 999px, height: 40px
      border: 1px solid outline-variant
      focus: border primary, bg surface-container-lowest

ROW 2 (filter row) — RTL, gap 8px:
  Animal-type filter chips (pill shape, 999 radius, height 32px):
    "הכל" — ACTIVE: bg secondary-container, color on-secondary-container, border none
    "כלב" — inactive: bg surface-container, color on-surface-variant, border 1px outline-variant, icon: pets (16px)
    "חתול" — inactive: same style, icon: pets (16px)
    "מכרסמים" — inactive: icon: pest_control_rodent (16px)
    "ציפורים" — inactive: icon: yard (16px)
    "דגים" — inactive: icon: water (16px)
  Divider: 1px solid outline-variant, height 20px, margin 0 8px
  Dropdown "גיל": trigger pill (32px height, outlined), icon: expand_more (16px), label "גיל"
  Dropdown "דיאטה": same style, label "דיאטה"
  Dropdown "סטטוס": same style, label "סטטוס"
  Spacer (flex: 1)
  Sort control (RTL end): "מיון: שם א-ת" (text small, on-surface-variant) + dropdown icon

============================================================
SECTION 3 — DataTable
============================================================
Card (elevation 1 = surface-container-low), border-radius 16px, overflow hidden, no padding (table fills to edges).

TABLE HEADER ROW:
  bg: surface-container (one shade darker than rows)
  height: 44px
  columns (RTL order, right → left):
    Checkbox (24px) | תמונה (60px) | שם מוצר (flex:1, min 220px, sortable ▼) | חיה (96px) | Variants (80px, center) | מלאי (100px, center, sortable) | מחיר (120px, sortable) | סטטוס (96px, center) | פעולות (72px, center)
  header text: 11px, 600, uppercase, letter-spacing 0.4, on-surface-variant
  sortable columns: show sort_by_alpha / arrow_drop_down icon (16px, outline-variant) on hover

TABLE ROWS — 7 data rows:
  height: 64px per row
  bg: surface-container-lowest (white)
  alternate: odd rows surface-container-lowest, even rows surface-container-low
  border-bottom: 1px solid outline-variant (except last row)
  hover: bg surface-container-high, shadow-1 on the row (subtle lift)
  On hover: "פעולות" column reveals 3 IconButtons: edit (edit, 20px), duplicate (content_copy, 20px), delete (delete, 20px, error color on hover)

ROW DATA (RTL columns — right to left in reading order):

Row 1 — Royal Canin Maxi Adult (normal row):
  Checkbox: unchecked
  תמונה: rounded square 40×40, bg surface-container, icon: pets (24px, secondary) centered (placeholder — no real image)
  שם: "Royal Canin Maxi Adult" bold 14px / "Royal Canin" sub 12px on-surface-variant
  חיה: small pill chip "כלב" — tonal bg secondary-container, on-secondary-container, icon: pets 14px
  Variants: "3" (tonal chip, secondary-container, 12px, 500, class="num")
  מלאי: "23 יח'" (14px, 500, on-surface, class="num")
  מחיר: "₪85 – ₪280" (14px, 400, class="currency", LTR isolated)
  סטטוס: <StatusChip kind="filled-primary"> פעיל </StatusChip>
  פעולות: hidden (shown on hover)

Row 2 — Hill's Science Diet (normal row):
  Checkbox: unchecked
  תמונה: placeholder, icon: pets, bg primary-container tint (rgba(183,240,187,0.3))
  שם: "Hill's Science Diet לחתולים" bold / "Hill's" sub
  חיה: "חתול" chip — tonal tertiary-container
  Variants: "2"
  מלאי: "8 יח'"
  מחיר: "₪149 – ₪265"
  סטטוס: <StatusChip kind="filled-primary"> פעיל </StatusChip>

Row 3 — Orijen Original (LOW STOCK WARNING ROW):
  Checkbox: unchecked
  תמונה: placeholder, bg surface-container
  שם: "Orijen Original" bold / "Champion Petfoods" sub
  חיה: "כלב" chip
  Variants: pill "4 variants" + LOW STOCK BADGE inline below:
    badge: small pill, bg error-container, color on-error-container, icon: warning 12px, text "2 מלאי נמוך" 11px 600
  מלאי: "3 יח'" — color: var(--md-error), 500 weight (low stock = red number)
  מחיר: "₪139 – ₪890"
  סטטוס: <StatusChip kind="filled-primary"> פעיל </StatusChip>
  ROW BACKGROUND: very subtle warning tint — rgba(254,243,199,0.45) instead of white
  LEFT BORDER: borderInlineStart: 3px solid var(--md-warning)

Row 4 — Royal Canin Persian Adult (normal row):
  Checkbox: unchecked
  תמונה: placeholder, icon: pets, bg primary-container tint
  שם: "Royal Canin Persian Adult" bold / "Royal Canin" sub
  חיה: "חתול" chip — tertiary-container
  Variants: "2"
  מלאי: "12 יח'"
  מחיר: "₪195 – ₪340"
  סטטוס: <StatusChip kind="filled-primary"> פעיל </StatusChip>

Row 5 — Acana Pacifica (LOW STOCK WARNING ROW):
  Checkbox: unchecked
  תמונה: placeholder, bg surface-container
  שם: "Acana Pacifica" bold / "Champion Petfoods" sub
  חיה: "כלב" chip
  Variants: pill "3 variants" + badge "1 מלאי נמוך" (error-container, small)
  מלאי: "1 יח'" — color: var(--md-error), 600 weight
  מחיר: "₪119 – ₪560"
  סטטוס: <StatusChip kind="filled-primary"> פעיל </StatusChip>
  ROW BACKGROUND: rgba(254,243,199,0.45) warning tint
  LEFT BORDER: 3px solid var(--md-warning)

Row 6 — Pro Plan Sensitive (normal row, HOVER STATE — show this row as hovered):
  Checkbox: unchecked (but hover: shows checkbox + row highlight)
  תמונה: placeholder
  שם: "Pro Plan Sensitive" bold / "Nestlé Purina" sub
  חיה: "כלב" chip
  Variants: "3"
  מלאי: "31 יח'"
  מחיר: "₪98 – ₪395"
  סטטוס: <StatusChip kind="filled-primary"> פעיל </StatusChip>
  ROW STATE: hovered — bg surface-container-high, shadow-1
  פעולות column VISIBLE (hover revealed): 3 IconButtons [edit] [content_copy] [delete]

Row 7 — Whiskas Sterilised (INACTIVE row):
  Checkbox: unchecked
  תמונה: placeholder, opacity 0.5 (inactive)
  שם: "Whiskas Sterilised" 14px, color on-surface-variant (muted) / "Mars Petcare" sub
  חיה: "חתול" chip — muted (outlined, not tonal)
  Variants: "1"
  מלאי: "0 יח'" — color on-surface-variant
  מחיר: "₪65"
  סטטוס: <StatusChip kind="outlined"> כבוי </StatusChip>
  ROW BACKGROUND: rgba(219,223,215,0.25) — slightly dimmed

TABLE FOOTER:
  bg: surface-container
  height: 48px
  RTL: right side: "מציג 7 מתוך 47 מוצרים" (12px, on-surface-variant)
  LEFT side: pagination — < 1 2 3 ... 8 > (icon buttons, current page highlighted with primary-container pill)
  Center: "שורות בעמוד: 10 ▾" (dropdown, 12px)

============================================================
SPECIAL STATES / INTERACTIONS
============================================================
1. LowStockBadge rows (rows 3, 5):
   - Left border 3px solid warning (borderInlineStart in RTL = left)
   - Row background: rgba(254,243,199,0.45)
   - Inventory number: error color, 600 weight
   - Badge: small pill below variants count — icon warning 12px + Hebrew text

2. Hover row (row 6 pre-hovered):
   - bg: surface-container-high
   - shadow-1 applied to entire row
   - פעולות column: 3 icon buttons appear (edit, content_copy, delete)
   - delete button: on its own hover = color switches to error

3. Bulk selection bar (show as a floating bar at BOTTOM of the table, currently hidden — draw it in a collapsed/peek state at bottom edge to hint its existence):
   - bg: inverse-surface (dark green)
   - color: inverse-on-surface
   - text: "3 מוצרים נבחרו"
   - CTAs: "הפעל" (tonal, white-ish) | "כבה" | "מחק" (error tint)
   - close: X icon-button, right side (RTL start)

4. Empty state (draw it as a COLLAPSED panel below the toolbar, labeled "מצב ריק (כשאין מוצרים)" so designer knows when to use it):
   - Card, padding 48px, center-aligned
   - Icon: inventory_2 (64px, FILL 0, color: outline)
   - Title: "אין מוצרים עדיין" (18px, 700, on-surface)
   - Sub: "ייבא את הקטלוג מ-Excel או הוסף מוצר ידנית" (14px, 400, on-surface-variant)
   - CTA row: FilledButton "ייבא מ-Excel" (filled, icon: upload_file) + FilledButton "הוסף מוצר" (outlined, icon: add)

============================================================
REALISTIC HEBREW SAMPLE DATA
============================================================
Store name: "חיות הבית של אבי"
Date shown: "יום שני, 18 במאי 2026"

Products (see rows above). Additional details for data.jsx:
- Suppliers used: Royal Canin, Hill's Pet Nutrition, Champion Petfoods, Nestlé Purina, Mars Petcare
- Animal types: כלב (4), חתול (3)
- Total: 47 products in system, 7 shown in current page
- Low stock count: 6 variants total (shown as 6 in KPI tile)
- Variants total: 134 active

Price ranges per product:
  Royal Canin Maxi Adult:   ₪85 (1kg) / ₪165 (2kg) / ₪280 (4kg)
  Hill's Science Diet:      ₪149 (1.5kg) / ₪265 (3kg)
  Orijen Original:          ₪139 (2kg) / ₪320 (6kg) / ₪560 (11.4kg) / ₪890 (17kg)
  Royal Canin Persian:      ₪195 (2kg) / ₪340 (4kg)
  Acana Pacifica:           ₪119 (2kg) / ₪289 (6kg) / ₪560 (11.4kg)
  Pro Plan Sensitive:       ₪98 (3kg) / ₪215 (7kg) / ₪395 (14kg)
  Whiskas Sterilised:       ₪65 (1.5kg)

Low stock detail (for badge tooltips / hover):
  Orijen Original 11.4kg — נותרו 2 יח', רמת reorder: 5
  Orijen Original 17kg   — נותרו 1 יח', רמת reorder: 3
  Acana Pacifica 11.4kg  — נותרו 1 יח', רמת reorder: 4
  (3 additional in other products not shown in this page)
