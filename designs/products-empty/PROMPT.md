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
- <StatusChip kind>
- <IconButton icon label badge size filled>
- <FilledButton icon variant size>
- <Card padding elevation>
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
Rail RIGHT. Flow right→left. padding-inline-start/end. insetInlineStart/End.
Numbers: <span class="num">. Currency: <span class="currency">.

============================================================
SPACING & GEOMETRY (unchanged)
============================================================
Grid 8px. Card padding 24px. Section gap 32px. Card gap 16px.
Radius: pill=999, card=16, chip=8.
Card border: 1px solid outline-variant always.

============================================================
DELIVERY FORMAT
============================================================
- `designs/products-empty/MasterPet Products Empty.html`
- `designs/products-empty/main.jsx`
- `designs/products-empty/data.jsx`
- `designs/products-empty/parts.jsx` — COPY VERBATIM from dashboard-branch/parts.jsx

Active nav: מלאי (inventory_2).

============================================================
NEVER
============================================================
No English UI (brand names OK). No Lorem Ipsum. No dark mode. No emoji.
No Heroicons/Lucide. No new fonts. No drop shadow on cards. No reinventing atoms.

============================================================
THIS SCREEN
============================================================
Screen name: products-empty
Hebrew title: קטלוג מוצרים — מצב ריק
Active nav item: מלאי (inventory_2)
Role: Business Owner (owner) — onboarding ראשוני, אין עדיין מוצרים

The 3-second test:
1. אין לי עדיין מוצרים במערכת — המסך מודיע לי על כך בבירור.
2. אני מבין מה עלי לעשות — יש לי שתי דרכים להתחיל: ייבוא מ-Excel או הוספה ידנית.
3. ברור לי איזו אופציה מומלצת ולמה.

============================================================
SECTION 1 — PAGE HEADER (minimal, no KPI tiles)
============================================================
Page title row (RTL, full width):
  Right: "קטלוג מוצרים" (24px, 700, on-surface)
  Left: FilledButton "+ מוצר חדש" (filled, primary, icon: add, size md, visible but secondary to the empty state CTAs)

Sub-title: "מוצרים, variants ומלאי לכל הסניפים" (14px, 400, on-surface-variant)

No KPI tiles — the strip is omitted entirely when there are 0 products.
The space below the header goes directly to the onboarding zone.

============================================================
SECTION 2 — ONBOARDING HERO CARD (main empty state)
============================================================
Card (elevation 1 = surface-container-low), full content-area width, border-radius 20px, padding 56px 48px.
Layout: vertical, center-aligned.

TOP ILLUSTRATION AREA (center):
  Circle bg: primary-container (#B7F0BB), diameter 120px, border-radius 50%
  Inner icon: inventory_2 (64px, FILL 1, color: primary #1B5E20)
  Below circle: subtle decorative ring — two dashed concentric circles (radius 80px, 110px)
    each 1px dashed, outline-variant color, opacity 0.5 (decorative only, no meaning)

TITLE:
  "הקטלוג שלך ריק" (24px, 700, on-surface, center-aligned, margin-top 24px)

BODY:
  "כדי לקבל הזמנות, לחשב אזילה ולסנכרן עם WooCommerce — צריך קודם להוסיף את המוצרים שלך."
  (15px, 400, on-surface-variant, center-aligned, max-width 480px, line-height 1.6)

DIVIDER: thin 1px outline-variant, margin 32px 0

TWO OPTIONS ROW (RTL, gap 24px, center):

  OPTION A — ייבא מ-Excel (RECOMMENDED — visually prominent):
    Card (elevation 0 = surface-container, border-radius 16px, padding 28px 24px, width: 320px)
    border: 2px solid primary (highlighted — recommended)
    RECOMMENDED badge: absolute top-right corner, pill bg primary, color on-primary, 11px 600 uppercase, "מומלץ"
    icon: upload_file (40px, FILL 1, primary) — top center
    title: "ייבא מ-Excel / CSV" (16px, 700, on-surface, margin-top 12px)
    body: "יש לך קטלוג קיים ב-Excel? ממפה, מאמת ומייבא תוך דקות — מאות מוצרים בבת אחת."
          (13px, 400, on-surface-variant, line-height 1.6)
    bullets list (RTL, margin-top 12px, gap 6px):
      "✓ תמיכה ב-CSV ו-XLSX"    — icon: check (14px, primary) + text 13px
      "✓ preview לפני שמירה"
      "✓ rollback אם יש שגיאה"
    CTA: FilledButton "ייבא מ-Excel" (filled variant, primary, full-width 100%, icon: upload_file, size md, margin-top 20px)
    Note: "PRD #4 — CSV Import Engine" label in tiny text at bottom of card (11px, outline, visible only to designer — add as a design annotation, not shown in production)

  OPTION B — הוסף ידנית:
    Card (elevation 0 = surface-container-low, border-radius 16px, padding 28px 24px, width: 320px)
    border: 1px solid outline-variant (standard)
    icon: add_box (40px, FILL 0, secondary) — top center
    title: "הוסף מוצר ידנית" (16px, 700, on-surface, margin-top 12px)
    body: "מוסיף מוצר אחד בכל פעם — טוב להתחיל, מומלץ לקטלוג קטן (עד 20 מוצרים)."
          (13px, 400, on-surface-variant, line-height 1.6)
    bullets list:
      "✓ שם, תיאור, תמונה"
      "✓ attributes ו-variants"
      "✓ מלאי לפי סניף"
    CTA: FilledButton "הוסף מוצר" (outlined variant, full-width, icon: add, size md, margin-top 20px)

BOTTOM HELP ROW (below both cards, center):
  icon: help_outline (16px, on-surface-variant)
  text: "לא בטוח איך להתחיל?" (13px, on-surface-variant)
  link: "צפה בסרטון הדרכה (3 דק׳)" (13px, primary, underline — external link icon: open_in_new 12px)

============================================================
SECTION 3 — WHAT'S NEXT STRIP (below hero card)
============================================================
Three step cards in a horizontal row (gap 16px), each 1/3 width.
These show the owner the onboarding path ahead — visual progress indicator.

Card style: elevation 0 = surface-container-low, border-radius 12px, padding 16px 20px.
Each card has: step number pill | icon | title | short description.

Step 1 — מוצרים (CURRENT STEP — highlighted):
  Step pill: "1" — bg primary, color on-primary, 28×28, border-radius 50%
  icon: inventory_2 (24px, primary)
  title: "הוסף מוצרים" (14px, 700, on-surface)
  body: "הגדר קטלוג עם variants, מחיר ומלאי" (12px, on-surface-variant)
  border: 2px solid primary
  bg: primary-container (light green tint)

Step 2 — לקוחות (locked):
  Step pill: "2" — bg surface-container-highest, color on-surface-variant
  icon: group (24px, FILL 0, outline)
  title: "ייבא לקוחות" (14px, 600, on-surface-variant)
  body: "רשימת לקוחות עם פרופיל חיה" (12px, on-surface-variant)
  border: 1px dashed outline-variant
  opacity: 0.7 — locked appearance

Step 3 — הזמנות (locked):
  Step pill: "3" — same locked style
  icon: receipt_long (24px, FILL 0, outline)
  title: "קבל הזמנות" (14px, 600, on-surface-variant)
  body: "WhatsApp, טלפון ו-WooCommerce מאוחדים" (12px, on-surface-variant)
  border: 1px dashed outline-variant
  opacity: 0.7

============================================================
SPECIAL STATES
============================================================
1. RECOMMENDED badge on Option A:
   Absolute positioned, corner pill (border-radius 999), bg: primary, color: on-primary.
   Text "מומלץ" — 11px, 600, uppercase, letter-spacing 0.3.
   Position: top 12px, insetInlineEnd: 12px (RTL: appears in top-LEFT corner of the card).

2. OPTION CARDS hover:
   Option A hover: shadow-2, border-color stays primary (already highlighted)
   Option B hover: border-color → secondary, shadow-1

3. STEP PROGRESS — Step 1 is the active/current step:
   Primary border + primary-container bg to distinguish from locked steps.
   Steps 2 and 3 are locked (lower opacity + dashed border).

4. TOP BAR "+ הזמנה חדשה" button:
   Still visible in the top bar but would be disabled or would prompt
   "אין מוצרים עדיין — הוסף מוצר קודם" tooltip if clicked.
   Show it in its normal state — the disabled state is a runtime behavior.

============================================================
REALISTIC HEBREW SAMPLE DATA
============================================================
Store: "חיות הבית של אבי"
Tenant: onboarding — 0 products, 0 variants, 0 inventory rows
Date: "יום שני, 18 במאי 2026"
Owner: אבי לוי (shown in avatar tooltip)

Import option context:
  "ייבא מ-Excel" leads to PRD #4 (CSV Import Engine) — not yet built.
  In the mockup, the button triggers a "בקרוב" toast or goes directly to the import flow.
  Show the button as fully clickable (not disabled) — the flow will be wired later.

Help link: external (not routed in app — opens a Loom/YouTube tutorial).
