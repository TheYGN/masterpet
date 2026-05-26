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
- `designs/orders-list/MasterPet Orders List.html` — same <head>/<style> block as dashboard
- `designs/orders-list/main.jsx` — App + sections specific to this screen
- `designs/orders-list/data.jsx` — navItems (same order!) + realistic Hebrew sample data
- `designs/orders-list/parts.jsx` — COPY VERBATIM from dashboard-branch/parts.jsx

The active nav item on the rail must be "הזמנות" (receipt_long).

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
Screen name: orders-list
Hebrew title: ניהול הזמנות
Active nav item: הזמנות (receipt_long)
Role: Business Owner (owner)

The 3-second test — what must the user understand within 3 seconds?
1. כמה הזמנות חדשות יש היום, ומה ממתין לטיפול?
2. מי מהלקוחות הזמין ומה סטטוס התשלום שלהם?
3. איך פותחים הזמנה חדשה או מוצאים הזמנה ספציפית?

============================================================
SECTION 1 — KPI Strip (4 tiles, HERO on first)
============================================================
4 tiles in one row, gap 16px:

HERO TILE — "הזמנות היום" (flex: 1.5, min-width 280px):
  background: linear-gradient(135deg, #1B5E20 0%, #2E7D32 55%, #38656A 100%)
  boxShadow: 0 1px 3px rgba(27,94,32,0.20), 0 8px 24px -8px rgba(27,94,32,0.35)
  border-radius: 16px, padding: 20px, color: var(--md-on-primary)
  Radial watermark bottom-left corner: radial-gradient(circle at 0% 100%,
    rgba(255,255,255,0.10) 0%, transparent 65%)
  "HERO" pill top-right (inside tile): bg rgba(255,255,255,0.18), color #fff,
    10px 600 uppercase letter-spacing 0.6, border-radius 999, padding 2px 8px
  icon: receipt_long (28px, FILL 1, color rgba(255,255,255,0.85)) top-left
  value: 23 (48px, 700, #fff, class="num", letter-spacing -0.5)
  label: "הזמנות היום" (13px, 500, rgba(255,255,255,0.85))
  sub-label: "מתוך 341 הזמנות החודש" (11px, 400, rgba(255,255,255,0.65))
  CTA pill bottom-right: bg rgba(255,255,255,0.92), color #1B5E20, 12px 600
    icon: arrow_back (14px, flipped, ms-flip-rtl), text "לכל ההזמנות", border-radius 999

TILE 2 — "ממתינות לאישור" (flex: 1):
  bg: warning-container, border: 1px solid rgba(245,158,11,0.30)
  icon: pending_actions (24px, FILL 1, color: #A65F00)
  value: 7 (36px, 700, on-surface, class="num")
  label: "ממתינות לאישור" (12px, 600, uppercase, letter-spacing 0.4, #A65F00)
  sub-label: "3 מעל שעה" (11px, 400, rgba(74,47,0,0.70))

TILE 3 — "מנויים פעילים" (flex: 1):
  bg: tertiary-container, border: none
  icon: autorenew (24px, FILL 1, color: var(--md-on-tertiary-container))
  value: 38 (36px, 700, on-tertiary-container, class="num")
  label: "מנויים פעילים" (12px, 600, uppercase, letter-spacing 0.4, on-tertiary-container)
  sub-label: "הזמנה הבאה ב-20/05" (11px, 400, rgba(0,32,34,0.70))

TILE 4 — "סה״כ החודש" (flex: 1):
  bg: surface-container-lowest, border: 1px solid outline-variant
  icon: payments (24px, FILL 1, color: var(--md-secondary))
  value: "₪48,320" (32px, 700, on-surface, class="num currency")
  label: "סה״כ החודש" (12px, 600, uppercase, letter-spacing 0.4, on-surface-variant)
  sub-label: "+12% לעומת חודש שעבר" (11px, 400, color: var(--md-secondary))

============================================================
SECTION 2 — Tab bar + Toolbar
============================================================
Card (elevation 1), border-radius 16px, padding 0.

TAB BAR (inside card top):
  Two tabs, RTL, height 48px, border-bottom: 1px solid outline-variant:
  - "הזמנות" (active — indicator line primary, text on-surface, 14px 600)
  - "מנויים" (inactive — text on-surface-variant, 14px 400)

TOOLBAR ROW (inside card, below tabs), padding 12px 20px, gap 12px:
  RIGHT side (RTL start):
    FilledButton "+ הזמנה חדשה" (filled, icon: add, size md)

  CENTER (search):
    Search input, width ~340px:
      placeholder: "חיפוש לפי לקוח, מספר הזמנה..."
      right icon (RTL start): search (20px, on-surface-variant)
      bg: surface-container, border-radius: 999px, height: 40px
      border: 1px solid outline-variant

  LEFT side (RTL end, gap 8px):
    Status chips row (pill, height 32px):
      "הכל" — ACTIVE: bg secondary-container, color on-secondary-container, no border
      "ממתין" — inactive: bg surface-container, color on-surface-variant, border 1px outline-variant
      "אושר" — inactive: same
      "בדרך" — inactive: same
      "נמסר" — inactive: same
    Divider: 1px solid outline-variant, height 20px, margin 0 8px
    Dropdown "מקור": trigger pill (32px, outlined), icon: expand_more, label "כל הערוצים"
    Dropdown "תאריך": trigger pill (32px, outlined), icon: calendar_today, label "כל הזמנים"

============================================================
SECTION 3 — Orders DataTable
============================================================
Card (elevation 1 = surface-container-low), border-radius 16px, overflow hidden,
no padding (table fills to edges).

TABLE HEADER ROW:
  bg: surface-container, height: 44px
  columns (RTL order, right → left):
    # הזמנה (100px, sortable) | לקוח (flex:1, min 180px) | מוצרים (200px) |
    סה״כ (100px, sortable) | תשלום (100px, center) | סטטוס (110px, center) |
    ערוץ (72px, center) | תאריך (110px, sortable) | פעולות (72px, center)
  header text: 11px, 600, uppercase, letter-spacing 0.4, on-surface-variant

TABLE ROWS — 8 data rows, height 64px each:
  bg: surface-container-lowest (odd) / surface-container-low (even)
  border-bottom: 1px solid outline-variant (except last)
  hover: bg surface-container-high, shadow-1
  On hover: "פעולות" column reveals 2 IconButtons: open_in_new (view), send (שלח קישור תשלום)

ROW DATA (RTL — right to left):

Row 1 — #1041 | רחל כהן | Royal Canin Adult 4kg × 2 | ₪298 | unpaid | pending | whatsapp | 18/05:
  # הזמנה: "#1041" (13px, 500, on-surface, class="num")
  לקוח: avatar circle (32px initials "ר.כ" gradient primary) + "רחל כהן" (14px 500)
  מוצרים: "Royal Canin Adult 4kg × 2" (13px) — truncate if long
  סה״כ: "₪298" (14px, 600, on-surface, class="currency num")
  תשלום: StatusChip kind="outlined" text="לא שולם" (red-tinted outlined)
  סטטוס: StatusChip kind="tonal-secondary" text="ממתין"
  ערוץ: ChannelDot channel="whatsapp"
  תאריך: "18/05, 09:14" (12px, on-surface-variant, class="num")

Row 2 — #1040 | אבי לוי | Hill's Science Diet × 1 + Acana × 1 | ₪445 | paid | confirmed | phone | 18/05:
  סה״כ: "₪445" class="currency num"
  תשלום: StatusChip kind="filled-primary" text="שולם"
  סטטוס: StatusChip kind="tonal-tertiary" text="אושר"
  ערוץ: ChannelDot channel="phone"

Row 3 — #1039 | מיכל שפירא | Orijen Cat Original 1.8kg × 3 | ₪612 | link_sent | preparing | whatsapp | 17/05:
  תשלום: StatusChip kind="tonal-secondary" text="קישור נשלח"
  סטטוס: StatusChip kind="tonal-secondary" text="בהכנה"

Row 4 — #1038 | יוסי אברהם | Pro Plan Sensitive × 2 | ₪334 | paid | in_transit | woo | 17/05:
  סטטוס: StatusChip kind="tonal-tertiary" text="בדרך"
  ערוץ: ChannelDot channel="woo"
  תשלום: StatusChip kind="filled-primary" text="שולם"

Row 5 — #1037 | דנה גרין | Whiskas Tuna 85g × 12 | ₪189 | paid | delivered | whatsapp | 16/05:
  סטטוס: StatusChip kind="filled-primary" text="נמסר"
  תשלום: StatusChip kind="filled-primary" text="שולם"

Row 6 — #1036 | שלמה בן דוד | Bonzo Beef Adult 3kg × 1 | ₪127 | unpaid | cancelled | phone | 15/05:
  ROW BG: rgba(219,223,215,0.30) — dimmed
  סטטוס: StatusChip kind="outlined" text="בוטל" (error color — red outlined)
  תשלום: StatusChip kind="outlined" text="לא שולם"

Row 7 — #1035 | נועה ישראלי | Royal Canin Kitten × 2 + Hill's Adult × 1 | ₪391 | paid | delivered | whatsapp | 15/05 (HOVER STATE):
  ROW STATE: hovered — bg surface-container-high, shadow-1
  פעולות column VISIBLE: [open_in_new] [send]
  סטטוס: StatusChip kind="filled-primary" text="נמסר"
  תשלום: StatusChip kind="filled-primary" text="שולם"

Row 8 — #1034 | אמיר חדד | Acana Pacifica Cat 1.8kg × 2 | ₪478 | link_sent | preparing | whatsapp | 14/05:
  סטטוס: StatusChip kind="tonal-secondary" text="בהכנה"
  תשלום: StatusChip kind="tonal-secondary" text="קישור נשלח"

TABLE FOOTER:
  bg: surface-container, height 48px
  RTL right: "מציג 8 מתוך 341 הזמנות" (12px, on-surface-variant, class="num" on numbers)
  LEFT: pagination — < 1 2 3 ... 43 > (current page 1 highlighted, primary-container pill)
  CENTER: "שורות בעמוד: 10 ▾" (12px, dropdown)

============================================================
SECTION 4 — Empty State (collapsed annotation panel below table)
============================================================
Draw as a labeled panel with dashed border, label "[מצב ריק — כשאין הזמנות]":

Card, padding 56px 24px, center-aligned, bg surface-container-lowest:
  icon: receipt_long (72px, FILL 0, color: outline)
  title: "אין הזמנות עדיין" (20px, 700, on-surface)
  sub: "צור הזמנה ידנית או חכה לפניות מ-WhatsApp ו-WooCommerce" (14px, 400, on-surface-variant)
  CTA: FilledButton "+ הזמנה חדשה" (filled, icon: add)

============================================================
REALISTIC HEBREW SAMPLE DATA
============================================================
Store name: "חיות הבית של אבי"
Date shown: "יום שני, 18 במאי 2026"

KPI values:
  הזמנות היום: 23 | מתוך 341 החודש
  ממתינות לאישור: 7 | 3 מעל שעה
  מנויים פעילים: 38 | הזמנה הבאה ב-20/05
  סה״כ החודש: ₪48,320 | +12%

Order rows: (see rows 1-8 above)
Branches: "סניף ראשי", "סניף דרום", "סניף צפון"
