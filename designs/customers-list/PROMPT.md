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
- `designs/customers-list/MasterPet Customers List.html` — same <head>/<style> block as dashboard
- `designs/customers-list/main.jsx` — App + sections specific to this screen
- `designs/customers-list/data.jsx` — navItems (same order!) + realistic Hebrew sample data
- `designs/customers-list/parts.jsx` — COPY VERBATIM from dashboard-branch/parts.jsx

The active nav item on the rail must be "לקוחות" (group).

============================================================
NEVER
============================================================
- No English in the UI (except brand names)
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
Screen name: customers-list
Hebrew title: ניהול לקוחות
Active nav item: לקוחות (group)
Role: Business Owner (owner)

The 3-second test — what must the user understand within 3 seconds?
1. כמה לקוחות פעילים יש לי, ומה הערוץ המועדף הנפוץ ביותר שלהם?
2. האם הצטרפו לקוחות חדשים לאחרונה?
3. איך אני מוצא לקוח מסוים מהר ואיך אני מוסיף לקוח חדש?

============================================================
SECTION 1 — KPI Strip with View Toggle
============================================================
The KPI strip supports TWO display modes that the user toggles with a small
icon button in the top-right corner of the strip:

TOGGLE BUTTON (top-right corner of the KPI strip row):
  Two IconButtons in a segmented group (pill bg surface-container, gap 2px):
    - Left button: icon "grid_view" (16px) — activates FLAT mode
    - Right button: icon "view_agenda" (16px) — activates HERO mode (default/active)
  Active button: bg secondary-container, icon filled, color on-secondary-container
  Inactive button: bg transparent, icon outline, color on-surface-variant
  Label above toggle (12px, 600, uppercase, letter-spacing 0.4, on-surface-variant): "תצוגה"

DRAW THE MAIN DESIGN IN HERO MODE (default):

HERO MODE layout — 1 wide hero tile + 3 narrower tiles, same row, gap 16px:

  HERO TILE — "לקוחות פעילים" (flex: 1.5, min-width 280px):
    background: linear-gradient(135deg, #1B5E20 0%, #2E7D32 55%, #38656A 100%)
    boxShadow: 0 1px 3px rgba(27,94,32,0.20), 0 8px 24px -8px rgba(27,94,32,0.35)
    border-radius: 16px, padding: 20px
    color: var(--md-on-primary)
    Radial watermark in bottom-left corner: radial-gradient(circle at 0% 100%,
      rgba(255,255,255,0.10) 0%, transparent 65%)
    "HERO" pill top-right (inside tile): bg rgba(255,255,255,0.18), color #fff,
      font 10px 600 uppercase letter-spacing 0.6, border-radius 999, padding 2px 8px
    icon: group (28px, FILL 1, color rgba(255,255,255,0.85)) top-left
    value: 184 (48px, 700, #fff, class="num", letter-spacing -0.5)
    label: "לקוחות פעילים" (13px, 500, rgba(255,255,255,0.85))
    sub-label: "מתוך 189 רשומות סה״כ" (11px, 400, rgba(255,255,255,0.65))
    CTA pill at bottom-right: bg rgba(255,255,255,0.92), color #1B5E20, 12px 600
      icon: arrow_back (14px, flipped, ms-flip-rtl), text "כל הלקוחות", border-radius 999

  TILE 2 — "חדשים החודש" (flex: 1):
    bg: surface-container-low, border: 1px solid outline-variant
    icon: person_add (24px, FILL 1, color: var(--md-secondary))
    value: 12 (36px, 700, on-surface, class="num")
    label: "חדשים החודש" (12px, 600, uppercase, letter-spacing 0.4, on-surface-variant)
    sub-label: "+3 לעומת חודש שעבר" (11px, 400, color: var(--md-secondary))

  TILE 3 — "ערוץ מועדף: WhatsApp" (flex: 1):
    bg: var(--md-tertiary-container), border: none
    Top row: ChannelDot channel="whatsapp" (28×28) + label "ערוץ מועדף"
      (12px, 600, uppercase, letter-spacing 0.4, var(--md-on-tertiary-container))
    value: 71% (36px, 700, var(--md-on-tertiary-container), class="num")
    sub-label: "מתוך הלקוחות בוחרים WhatsApp" (11px, 400, rgba(0,32,34,0.70))

  TILE 4 — "לא פעילים" (flex: 1):
    bg: surface-container-lowest, border: 1px dashed outline-variant
    icon: person_off (24px, FILL 0, color: on-surface-variant)
    value: 5 (36px, 700, on-surface-variant, class="num")
    label: "לא פעילים" (12px, 600, uppercase, letter-spacing 0.4, on-surface-variant)
    sub-label: "הוסרו ידנית" (11px, 400, on-surface-variant)

FLAT MODE (draw as a labeled annotation BELOW the main design, inside a
  dashed-border annotation card with label "תצוגה חלופית — מצב שטוח"):
  4 tiles equal width (flex: 1 each), same gap 16px, same Card (elevation 1).
  Each tile = icon + value + label — no hero gradient, no gradient on any tile.
  Tile 1: icon group, value 184, label "לקוחות פעילים"
  Tile 2: icon person_add, value 12, label "חדשים החודש"
  Tile 3: ChannelDot whatsapp + value 71%, label "ערוץ מועדף"
  Tile 4: icon person_off, value 5, label "לא פעילים"

============================================================
SECTION 2 — Toolbar (Search + Filters + Actions)
============================================================
Card (elevation 1), border-radius 16px, padding 16px 24px.

ROW 1 — RTL, space-between:
  RIGHT side:
    FilledButton "הוסף לקוח" (filled variant, primary, icon: person_add, size md)
    FilledButton "ייבא מ-Excel" (outlined variant, icon: upload_file, size md) — gap 8px
  LEFT side:
    Search input, width ~420px:
      placeholder: "חיפוש לפי שם או טלפון..."
      right icon (RTL start): search (20px, on-surface-variant)
      bg: surface-container, border-radius: 999px, height: 40px
      border: 1px solid outline-variant
      focus: border primary, bg surface-container-lowest

ROW 2 — filter row, RTL, gap 8px:
  Status chips (pill, height 32px):
    "הכל" — ACTIVE: bg secondary-container, color on-secondary-container, no border
    "פעיל" — inactive: bg surface-container, color on-surface-variant, border 1px outline-variant
    "לא פעיל" — inactive: same style
  Divider: 1px solid outline-variant, height 20px, margin 0 8px
  Dropdown "סניף": trigger pill (32px height, outlined), icon: expand_more (16px), label "כל הסניפים"
  Spacer (flex: 1)
  Sort control (RTL end): "מיון: תאריך הצטרפות" (12px, on-surface-variant) + expand_more icon

============================================================
SECTION 3 — DataTable
============================================================
Card (elevation 1 = surface-container-low), border-radius 16px, overflow hidden,
no padding (table fills to edges).

TABLE HEADER ROW:
  bg: surface-container
  height: 44px
  columns (RTL order, right → left):
    שם מלא (flex:1, min 220px, sortable) | טלפון (130px) | עיר (100px) |
    ערוץ מועדף (88px, center) | סניף (120px) | סטטוס (88px, center) |
    הצטרף (110px, sortable) | פעולות (72px, center)
  header text: 11px, 600, uppercase, letter-spacing 0.4, on-surface-variant

TABLE ROWS — 8 data rows, height 60px each:
  bg: surface-container-lowest (odd) / surface-container-low (even)
  border-bottom: 1px solid outline-variant (except last)
  hover: bg surface-container-high, shadow-1
  On hover: "פעולות" column reveals 3 IconButtons:
    edit (edit, 20px), view (open_in_new, 20px), delete (delete, 20px, error on hover)

ROW DATA (RTL — right to left):

Row 1 — רחל כהן (normal, active):
  Avatar circle (36px, gradient #38656A→#1B5E20, initials "ר.כ" 13px #fff) + "רחל כהן" 14px 500
  טלפון: "052-111-2233" (13px, LTR isolated, on-surface-variant, class="num")
  עיר: "תל אביב" (13px)
  ערוץ: ChannelDot channel="whatsapp"
  סניף: "סניף ראשי" (13px)
  סטטוס: <StatusChip kind="filled-primary"> פעיל </StatusChip>
  הצטרף: "01/03/2026" (12px, on-surface-variant, class="num")

Row 2 — אבי לוי (normal, active):
  Avatar: initials "א.ל", gradient secondary (#52634F→#38656A)
  טלפון: "054-444-5566"
  עיר: "פתח תקווה"
  ערוץ: ChannelDot channel="phone"
  סניף: "סניף ראשי"
  סטטוס: <StatusChip kind="filled-primary"> פעיל </StatusChip>
  הצטרף: "15/02/2026"

Row 3 — מיכל שפירא (NEW badge — joined this month):
  Avatar: initials "מ.ש", gradient tertiary (#38656A→#52634F)
  שם: "מיכל שפירא" + small pill badge inline: bg primary-container, color on-primary-container,
    11px 600, "חדש" — placed to the left of the name (RTL end of name cell)
  טלפון: "050-777-8899"
  עיר: "רמת גן"
  ערוץ: ChannelDot channel="whatsapp"
  סניף: "סניף ראשי"
  סטטוס: <StatusChip kind="filled-primary"> פעיל </StatusChip>
  הצטרף: "22/04/2026"

Row 4 — יוסי אברהם (normal, active):
  Avatar: initials "י.א", gradient #52634F→#1B5E20
  טלפון: "053-222-3344"
  עיר: "גבעתיים"
  ערוץ: email IconButton equivalent — square ribbon 28×28,
    bg rgba(59,130,246,0.12), icon "mail" color #2563EB (16px)
  סניף: "סניף דרום"
  סטטוס: <StatusChip kind="filled-primary"> פעיל </StatusChip>
  הצטרף: "10/01/2026"

Row 5 — דנה גרין (NEW, active):
  Avatar: initials "ד.ג", gradient #38656A→#1B5E20
  שם: "דנה גרין" + "חדש" pill badge
  טלפון: "058-555-6677"
  עיר: "חולון"
  ערוץ: ChannelDot channel="whatsapp"
  סניף: "סניף ראשי"
  סטטוס: <StatusChip kind="filled-primary"> פעיל </StatusChip>
  הצטרף: "03/05/2026"

Row 6 — שלמה בן דוד (INACTIVE row):
  Avatar: initials "ש.ב", bg surface-container, color on-surface-variant, opacity 0.55
  שם: "שלמה בן דוד" (color: on-surface-variant, muted)
  טלפון: "052-888-9900" (muted)
  עיר: "בת ים"
  ערוץ: ChannelDot channel="phone" (opacity 0.5)
  סניף: "סניף דרום"
  סטטוס: <StatusChip kind="outlined"> לא פעיל </StatusChip>
  הצטרף: "05/12/2025"
  ROW BG: rgba(219,223,215,0.30) — slightly dimmed

Row 7 — נועה ישראלי (HOVER STATE — show this row as hovered):
  Avatar: initials "נ.י", gradient primary
  טלפון: "054-333-4455"
  עיר: "ראשל״צ"
  ערוץ: ChannelDot channel="whatsapp"
  סניף: "סניף ראשי"
  סטטוס: <StatusChip kind="filled-primary"> פעיל </StatusChip>
  הצטרף: "18/04/2026"
  ROW STATE: hovered — bg surface-container-high, shadow-1
  פעולות column VISIBLE: [edit] [open_in_new] [delete]

Row 8 — אמיר חדד (normal, active):
  Avatar: initials "א.ח", gradient tertiary
  טלפון: "050-123-4567"
  עיר: "הרצליה"
  ערוץ: ChannelDot channel="whatsapp"
  סניף: "סניף צפון"
  סטטוס: <StatusChip kind="filled-primary"> פעיל </StatusChip>
  הצטרף: "28/01/2026"

TABLE FOOTER:
  bg: surface-container, height 48px
  RTL right: "מציג 8 מתוך 184 לקוחות" (12px, on-surface-variant, class="num" on numbers)
  LEFT: pagination — < 1 2 3 ... 24 > (current page 1 highlighted, primary-container pill)
  CENTER: "שורות בעמוד: 10 ▾" (12px, dropdown)

============================================================
SECTION 4 — Empty State (shown as collapsed annotation panel)
============================================================
Draw as a labeled panel below the table with a dashed border and label
"[מצב ריק — כשאין לקוחות]" so the designer knows when to use it.

Card, padding 56px 24px, center-aligned, bg surface-container-lowest:
  icon: group (72px, FILL 0, color: outline)
  title: "אין לקוחות עדיין" (20px, 700, on-surface)
  sub: "הוסף לקוח ידנית או ייבא רשימה מ-Excel כדי להתחיל" (14px, 400, on-surface-variant)
  CTA row (gap 12px, center):
    FilledButton "הוסף לקוח" (filled, icon: person_add)
    FilledButton "ייבא מ-Excel" (outlined, icon: upload_file)

============================================================
REALISTIC HEBREW SAMPLE DATA
============================================================
Store name: "חיות הבית של אבי"
Date shown: "יום שני, 18 במאי 2026"

Customers summary:
  Total active: 184 | Total records: 189 | Inactive: 5
  New this month: 12 | Preferred WhatsApp: 71%

Branches: "סניף ראשי", "סניף דרום", "סניף צפון"

Row details (see rows above):
  1. רחל כהן — 052-111-2233 — תל אביב — WhatsApp — סניף ראשי — 01/03/2026
  2. אבי לוי — 054-444-5566 — פתח תקווה — טלפון — סניף ראשי — 15/02/2026
  3. מיכל שפירא — 050-777-8899 — רמת גן — WhatsApp — סניף ראשי — 22/04/2026 [NEW]
  4. יוסי אברהם — 053-222-3344 — גבעתיים — אימייל — סניף דרום — 10/01/2026
  5. דנה גרין — 058-555-6677 — חולון — WhatsApp — סניף ראשי — 03/05/2026 [NEW]
  6. שלמה בן דוד — 052-888-9900 — בת ים — טלפון — סניף דרום — 05/12/2025 [INACTIVE]
  7. נועה ישראלי — 054-333-4455 — ראשל״צ — WhatsApp — סניף ראשי — 18/04/2026 [HOVER]
  8. אמיר חדד — 050-123-4567 — הרצליה — WhatsApp — סניף צפון — 28/01/2026
