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
- <StatusChip kind>            — kinds: filled-primary | tonal-secondary | tonal-tertiary | outlined
- <IconButton icon label badge size filled>
- <FilledButton icon variant size>   — variants: filled | tonal | outlined | text | error
- <Card padding elevation>     — elevation 0..3
- <Sparkline data width height color>
- <ChannelDot channel>
- <NavItem item active hover onSelect>

============================================================
SHELL — REUSE, DO NOT REINVENT
============================================================
- Right-side Navigation Rail (88px, RTL), sticky, full height.
  Items (same order):
    דשבורד (space_dashboard)
    אינבוקס (inbox)
    הזמנות (receipt_long)
    מלאי (inventory_2)  ← ACTIVE
    לקוחות (group)
    נאמנות (loyalty)
    אוטומציות (bolt)
    הגדרות (settings)
  Active = secondary-container pill + filled icon.
  Bottom: avatar gradient #38656A→#1B5E20 + "PRO" badge.

- Top Bar (72px, sticky):
  Right: "חיות הבית של אבי" + "יום שני, 18 במאי 2026"
  Center: search "חיפוש לקוחות, הזמנות, מוצרים…" + ⌘K
  Left: help, notifications (badge 4), divider, "+ הזמנה חדשה"

- Main content: padding 24px 32px 48px, vertical flex, gap 32px.
Never redesign rail or top bar.

============================================================
RTL RULES (unchanged)
============================================================
Rail RIGHT. Flow right→left. Flipped arrows: .ms-flip-rtl.
padding-inline-start/end. borderInlineStart/End. insetInlineStart/End.
Numbers: <span class="num">. Currency: <span class="currency">.
Timestamps LEFT. Primary CTA RIGHT.

============================================================
SPACING & GEOMETRY (unchanged)
============================================================
Grid 8px. Card padding 24px. Section gap 32px. Card gap 16px.
Radius: pill=999, card=16, chip=8, badge=6-8.
Card border: 1px solid outline-variant always.

============================================================
SEVERITY PALETTE (unchanged)
============================================================
Error: bg=error-container, dot=error, CTA bg=error, label "דחוף"
Warning: bg=warning-container, dot=warning, icon=#A65F00, CTA bg=#A65F00, label "אזהרה"

============================================================
DELIVERY FORMAT
============================================================
- `designs/inventory-page/MasterPet Inventory Page.html`
- `designs/inventory-page/main.jsx`
- `designs/inventory-page/data.jsx`
- `designs/inventory-page/parts.jsx` — COPY VERBATIM from dashboard-branch/parts.jsx

Active nav: מלאי (inventory_2).

============================================================
NEVER
============================================================
No English UI (brand names OK). No Lorem Ipsum. No dark mode. No emoji.
No Heroicons/Lucide. No new fonts. No drop shadow on cards. No reinventing atoms.

============================================================
THIS SCREEN
============================================================
Screen name: inventory-page
Hebrew title: מלאי — Royal Canin Maxi Adult
Active nav item: מלאי (inventory_2)
Role: Warehouse (מנהל מחסן) — יכול לעדכן כמויות. רואה רק את הסניף שלו.

The 3-second test:
1. איזה מוצר אני מנהל מלאי עבורו, ואיזה variant דורש עדכון דחוף?
2. מה הכמות הנוכחית בכל variant ומה רמת ה-reorder?
3. איפה אני מזין את הכמות החדשה ושומר?

============================================================
SECTION 1 — PAGE HEADER
============================================================
BREADCRUMB (RTL):
  arrow_back flipped + "קטלוג מוצרים" (primary link)
  / "Royal Canin Maxi Adult" (primary link)
  / "מלאי" (on-surface, current)

CONTEXT STRIP (Card elevation 0 = surface-container-low, padding 16px 24px, border-radius 12px):
  Layout RTL: image | product info | branch info
  Image: 56×56 rounded square, bg: primary-container, icon: pets (28px, primary)
  Product info (right, flex:1):
    "Royal Canin Maxi Adult" (16px, 700, on-surface)
    chips: "כלב" (secondary-container) | "בוגר" | "רגיל"
  Branch badge (left, RTL end):
    label: "סניף" (11px, 600, uppercase, on-surface-variant)
    value: "סניף תל אביב" (14px, 600, on-surface, icon: store 16px)
    sub: "מנהל מחסן: יוסף כהן" (12px, on-surface-variant)

LOW STOCK ALERT (warning banner, full width, below context strip):
  bg: warning-container, border-radius 12px, padding 12px 16px
  icon: warning (20px, #A65F00) RTL start
  title: "אזהרה — 2 variants מתחת לרמת ה-reorder" (14px, 600, rgba(74,47,0,0.78))
  body: "יש לעדכן את הכמות לאחר קבלת הסחורה. גלול למטה לשורות המסומנות." (13px, rgba(74,47,0,0.78))
  CTA: "סמן הכל לעדכון" (FilledButton, size sm, bg #A65F00, color #fff)

============================================================
SECTION 2 — INVENTORY TABLE
============================================================
Card (elevation 1, border-radius 16px, overflow hidden, no extra padding).

SECTION HEADER ROW (above table, inside card, padding 16px 24px, border-bottom outline-variant):
  Right: "6 variants — סניף תל אביב" (16px, 700, on-surface)
  Left: FilledButton "שמור שינויים" (filled, primary, icon: save, size md, DISABLED state — grey — until a field is edited)

TABLE HEADER (bg: surface-container, height 44px):
  Columns RTL: variant (flex:1, min 200px) | כמות נוכחית (120px, center) | רמת reorder (120px, center) | מצב (90px, center) | עדכן כמות (160px, center)
  header text: 11px, 600, uppercase, letter-spacing 0.4, on-surface-variant
  "עדכן כמות" column: add edit icon (14px) in header

6 TABLE ROWS (64px each):

ROW 1 — גודל: 1kg / טעם: עוף (NORMAL):
  variant: "גודל: 1kg / טעם: עוף" (13px, on-surface) + sub "SKU: RC-MAXI-1KG-OF" (11px, monospace, on-surface-variant)
  כמות נוכחית: "23" (class="num", 20px, 700, primary)
  reorder: "5" (class="num", 14px, on-surface-variant)
  מצב: <StatusChip kind="filled-primary"> תקין </StatusChip>
  עדכן: NumberInput (height 36px, width 100px, value "23", border outline-variant, border-radius 8px, stepper +/- buttons) + FilledButton "עדכן" (tonal, size sm, disabled until changed)

ROW 2 — גודל: 1kg / טעם: ארנב (NORMAL):
  כמות: "11" (primary) | reorder: "3" | תקין
  עדכן: NumberInput "11" + "עדכן" (disabled)

ROW 3 — גודל: 2kg / טעם: עוף (NORMAL):
  כמות: "31" (primary) | reorder: "8" | תקין
  עדכן: NumberInput "31" + "עדכן" (disabled)

ROW 4 — גודל: 2kg / טעם: ארנב (NORMAL):
  כמות: "19" (primary) | reorder: "5" | תקין
  עדכן: NumberInput "19" + "עדכן" (disabled)

ROW 5 — גודל: 4kg / טעם: עוף (LOW STOCK + BEING EDITED):
  ROW BG: rgba(249,222,220,0.4) — error tint
  borderInlineStart: 3px solid error
  variant text: same format
  כמות נוכחית: "2" (20px, 700, color: error — not primary)
  reorder: "5" (14px, error weight 600 — shows it's below threshold)
  מצב: pill "מלאי נמוך" — bg error-container, color on-error-container, icon warning 12px
  עדכן:
    NumberInput ACTIVE — value "18" (being typed by warehouse user — user just received 16 units)
    border: 2px solid primary (focused)
    bg: surface-container-lowest
    +/- stepper buttons visible
    FilledButton "עדכן" — ENABLED now (tonal, primary) because value changed from 2 → 18
    Below input: diff badge "+16 יח'" (12px, 500, primary-container bg, primary text, border-radius 999)

ROW 6 — גודל: 4kg / טעם: ארנב (LOW STOCK):
  ROW BG: rgba(249,222,220,0.4)
  borderInlineStart: 3px solid error
  כמות: "1" (error color, 700)
  reorder: "3" (error, 600)
  מצב: "מלאי נמוך" pill (error-container)
  עדכן: NumberInput "1" (not yet edited, disabled "עדכן" button)

TABLE FOOTER (bg: surface-container, height 48px, padding 0 24px):
  Right: "עודכן לאחרונה: היום, 09:45" (12px, on-surface-variant, icon: update 14px)
  Left: FilledButton "שמור הכל" (filled, primary, size md) — enabled because Row 5 has a pending edit
         Note bubble beside it: "1 שינוי ממתין לשמירה" (12px, warning color, icon: pending 14px)

============================================================
SPECIAL STATES
============================================================
1. ROW 5 — EDIT IN PROGRESS:
   NumberInput value: "18" (changed from original "2")
   Diff badge: "+16 יח'" (green pill) — shows how many units being added
   "עדכן" button: enabled (tonal, primary, 36px height)
   "שמור הכל" footer button: enabled (filled, primary)
   "1 שינוי ממתין" note: visible in footer

2. LOW STOCK ROWS (5, 6):
   Left border: 3px solid error
   Background tint: error-container at 40% opacity
   Current qty: error color + heavier weight
   מצב chip: "מלאי נמוך" (error-container)

3. ROLE CONTEXT — Warehouse sees:
   NO cost_price column (hidden by RLS — column doesn't exist in this view)
   NO edit buttons for product name/attributes (read-only product info)
   CAN only update qty + reorder_level in the "עדכן כמות" column
   Branch selector is NOT shown (warehouse sees own branch only: "סניף תל אביב")

4. SAVE CONFIRMATION (show as a toast/snackbar at bottom of screen, appearing after save):
   Floating bar: bg inverse-surface (#2E3129), color inverse-on-surface (#F0F1EA)
   icon: check_circle (20px, primary-container)
   text: "מלאי עודכן בהצלחה — גודל: 4kg / טעם: עוף: 2 → 18 יח'"
   Duration: auto-dismiss after 4 seconds (show it as visible in mockup)

============================================================
REALISTIC HEBREW SAMPLE DATA
============================================================
Product: Royal Canin Maxi Adult
Branch: סניף תל אביב
Warehouse user: יוסף כהן
Last updated: היום, 09:45

Inventory rows (variant → current qty → reorder level → status):
  1kg עוף:   23 יח' | reorder 5  | תקין
  1kg ארנב:  11 יח' | reorder 3  | תקין
  2kg עוף:   31 יח' | reorder 8  | תקין
  2kg ארנב:  19 יח' | reorder 5  | תקין
  4kg עוף:    2 יח' | reorder 5  | מלאי נמוך ← being edited → 18 (received 16 units)
  4kg ארנב:   1 יח' | reorder 3  | מלאי נמוך

Toast after save: "גודל: 4kg / טעם: עוף — עודכן מ-2 ל-18 יח'"
