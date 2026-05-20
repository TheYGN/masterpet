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
- <ChannelDot channel>         — channels: whatsapp | phone | woo
- <NavItem item active hover onSelect>

============================================================
SHELL — REUSE, DO NOT REINVENT
============================================================
- Right-side Navigation Rail (88px wide, RTL), sticky, full height.
  Items (same order every screen):
    דשבורד (space_dashboard)
    אינבוקס (inbox)
    הזמנות (receipt_long)
    מלאי (inventory_2)  ← ACTIVE on this screen
    לקוחות (group)
    נאמנות (loyalty)
    אוטומציות (bolt)
    הגדרות (settings)
  Active = secondary-container pill + filled icon.
  Bottom: avatar gradient #38656A→#1B5E20 + "PRO" badge.

- Top Bar (72px, sticky):
  Right: "חיות הבית של אבי" + "יום שני, 18 במאי 2026"
  Center: search "חיפוש לקוחות, הזמנות, מוצרים…" + ⌘K
  Left: help, notifications (badge 4), divider, "+ הזמנה חדשה" (filled)

- Main content: padding 24px 32px 48px, vertical flex, gap 32px.
Never redesign rail or top bar.

============================================================
RTL RULES (unchanged)
============================================================
- Rail: RIGHT. Flow: right→left. Flipped arrows: .ms-flip-rtl.
- padding-inline-start/end. borderInlineStart/End. insetInlineStart/End.
- Numbers: <span class="num">. Currency: <span class="currency"> ₪ before number.
- Timestamps: LEFT (secondary). Primary CTA: RIGHT of each row.

============================================================
SPACING & GEOMETRY (unchanged)
============================================================
Grid 8px. Card padding 24px (KPI 20px). Section gap 32px. Card gap 16px.
Radius: pill=999, card=16, chip=8, badge=6-8, avatar=50%.
Card border: 1px solid outline-variant always.

============================================================
SEVERITY PALETTE (unchanged)
============================================================
Error: bg=error-container, dot=error, CTA bg=error, label "דחוף"
Warning: bg=warning-container, dot=warning, icon=#A65F00, CTA bg=#A65F00, label "אזהרה"

============================================================
DELIVERY FORMAT
============================================================
- `designs/product-detail/MasterPet Product Detail.html`
- `designs/product-detail/main.jsx`
- `designs/product-detail/data.jsx`
- `designs/product-detail/parts.jsx` — COPY VERBATIM from dashboard-branch/parts.jsx

Active nav: מלאי (inventory_2).

============================================================
NEVER
============================================================
No English UI (brand names OK). No Lorem Ipsum. No dark mode. No emoji.
No Heroicons/Lucide. No new fonts. No drop shadow on cards. No reinventing atoms.

============================================================
THIS SCREEN
============================================================
Screen name: product-detail
Hebrew title: פרטי מוצר — Royal Canin Maxi Adult
Active nav item: מלאי (inventory_2)
Role: Business Owner (owner)

The 3-second test:
1. איזה מוצר אני רואה, מה הסטטוס שלו, ויש בו התראות (מלאי נמוך)?
2. כמה variants יש לו ומה טווח המחירים?
3. לאיזה tab אני רוצה לנווט — פרטים, variants, מלאי, היסטוריה?

============================================================
SECTION 1 — PAGE HEADER (breadcrumb + product hero)
============================================================
BREADCRUMB row (full width, RTL):
  icon: arrow_back (20px, flipped → points right) + "קטלוג מוצרים" (text button, 14px, primary)
  separator: / (on-surface-variant)
  current: "Royal Canin Maxi Adult" (14px, on-surface, non-clickable)

PRODUCT HERO CARD (Card elevation 1, padding 24px):
  Layout: RTL, two columns — image left (120px) | details right (flex: 1)

  IMAGE AREA (left, 120×120):
    Rounded square bg: primary-container (light green #B7F0BB)
    border-radius: 16px, border: 1px solid outline-variant
    icon: pets (48px, FILL 1, primary) centered — image placeholder

  DETAILS AREA (right column, RTL = reading starts from right):
    Row 1: Product name "Royal Canin Maxi Adult" (22px, 700, on-surface)
           + <StatusChip kind="filled-primary"> פעיל </StatusChip> (inline right)
    Row 2: Chips row (gap 8px):
           animal chip "כלב" (secondary-container, icon: pets 14px)
           age chip "בוגר" (secondary-container)
           diet chip "רגיל" (secondary-container)
    Row 3: "ספק: Royal Canin" (13px, on-surface-variant, icon: local_shipping 16px)
           gap 16px
           "נוצר: 18 במאי 2026" (13px, on-surface-variant, icon: calendar_today 14px)
    Row 4: Tags row — pills "מבצע" (tertiary-container) | "ממולץ" (tertiary-container)
    Row 5: STATS strip (4 mini-stats, gap 24px, border-top outline-variant, padding-top 16px, margin-top 12px):
           "6 variants" (icon: category 16px, secondary)
           "134 יח' מלאי" (icon: inventory_2 16px, primary)
           "₪85 – ₪295" (icon: payments 16px, on-surface-variant, class="currency")
           "מע"מ 18%" (icon: receipt 16px, on-surface-variant)

  ACTION BUTTONS row (RTL end = left of card):
    FilledButton "ערוך מוצר" (tonal variant, icon: edit, size md)
    FilledButton "שכפל" (outlined, icon: content_copy, size md)
    FilledButton "השבת" (text, icon: block, size md, error color on hover)

  LOW STOCK ALERT BANNER (full-width below hero card, warning severity):
    bg: warning-container, border-radius: 12px, padding: 12px 16px
    icon: warning (20px, #A65F00) right (RTL start)
    title: "אזהרה — מלאי נמוך ב-2 variants" (14px, 600, rgba(74,47,0,0.78))
    body: "Orijen Original 11.4kg — נותרו 2 יח' (reorder: 5). לחץ על טאב מלאי לפרטים." (13px, rgba(74,47,0,0.78))
    CTA right: FilledButton "עבור למלאי" (size sm, bg #A65F00, color #fff, icon: arrow_back flipped)

============================================================
SECTION 2 — TABS + TAB CONTENT
============================================================
TAB BAR (MD3 style, full-width, bg: surface-container-lowest, border-bottom: outline-variant):
  Tab 1: "פרטים" (icon: info 18px) — inactive
  Tab 2: "Variants" (icon: category 18px) — ACTIVE (indicator: 3px primary underline, label: primary color)
  Tab 3: "מלאי" (icon: inventory_2 18px, badge: "2" error-color dot) — inactive, badge = 2 low-stock
  Tab 4: "היסטוריה" (icon: history 18px) — inactive

  Active tab indicator: 3px underline bottom, color: primary, label 14px 600 primary.
  Inactive tabs: 14px 500 on-surface-variant.

TAB CONTENT — "Variants" tab is active (show this tab's content):

VARIANTS TAB CONTENT:
  Sub-header row (RTL, space-between):
    Right: "6 variants פעילים" (14px, 500, on-surface-variant)
    Left: FilledButton "+ הוסף variant ידני" (outlined, icon: add, size sm)

  VARIANTS TABLE (Card elevation 1, border-radius 16px, overflow hidden):

    HEADER ROW (bg: surface-container, height 44px):
      Columns RTL: שם variant (flex:1) | SKU (140px) | מחיר (₪ללא מע"מ) (110px) | מחיר+מע"מ (110px) | מחיר עלות (100px, owner-only) | ברקוד (130px) | מלאי (80px, center) | סטטוס (90px, center)
      header style: 11px, 600, uppercase, letter-spacing 0.4, on-surface-variant

    ROW 1 — "גודל: 1kg / טעם: עוף":
      שם: text "גודל: 1kg / טעם: עוף" (13px, on-surface)
      SKU: "RC-MAXI-1KG-OF" (12px, monospace, on-surface-variant)
      מחיר: "₪85.00" (class="currency")
      מחיר+מע"מ: "₪100.30" (on-surface-variant, 13px)
      עלות: "₪54.00" (13px, primary — owner sees this)
      ברקוד: "729009023523" (12px, monospace)
      מלאי: "23" (num, 13px, 500, on-surface)
      סטטוס: <StatusChip kind="filled-primary"> פעיל </StatusChip>

    ROW 2 — "גודל: 1kg / טעם: ארנב":
      SKU: RC-MAXI-1KG-RA | ₪92.00 | ₪108.56 | ₪58.00 | 729009023530 | מלאי: 11 | פעיל

    ROW 3 — "גודל: 2kg / טעם: עוף":
      SKU: RC-MAXI-2KG-OF | ₪165.00 | ₪194.70 | ₪105.00 | 729009023547 | מלאי: 31 | פעיל

    ROW 4 — "גודל: 2kg / טעם: ארנב":
      SKU: RC-MAXI-2KG-RA | ₪178.00 | ₪210.04 | ₪112.00 | 729009023554 | מלאי: 19 | פעיל

    ROW 5 — "גודל: 4kg / טעם: עוף" (LOW STOCK):
      SKU: RC-MAXI-4KG-OF | ₪280.00 | ₪330.40 | ₪178.00 | 729009023561
      מלאי: "2" — color: error, 600 weight
      סטטוס: פעיל
      LowStockBadge: pill below SKU — "מלאי נמוך (reorder: 5)" bg: error-container, color: on-error-container, icon: warning 12px
      ROW BG: rgba(249,222,220,0.35) — error tint
      borderInlineStart: 3px solid error

    ROW 6 — "גודל: 4kg / טעם: ארנב" (LOW STOCK):
      SKU: RC-MAXI-4KG-RA | ₪295.00 | ₪348.10 | ₪188.00 | 729009023578
      מלאי: "1" — color: error, 600 weight
      LowStockBadge: "מלאי נמוך (reorder: 3)"
      ROW BG: rgba(249,222,220,0.35)
      borderInlineStart: 3px solid error

    TABLE FOOTER (bg: surface-container, height 44px, padding 0 24px):
      Right: "6 variants" (12px, on-surface-variant)
      Left: [actions row if bulk-selected — currently none selected, show placeholder]

============================================================
SPECIAL STATES
============================================================
1. TAB BADGE — "מלאי" tab has a small red dot badge "2" (error circle 18px) in the top-right corner of the tab label, hinting 2 low-stock variants need attention.

2. LOW STOCK ROWS (5, 6): left border 3px error + bg tint + badge pill inline under SKU.

3. OWNER PRIVILEGE — "מחיר עלות" column visible with real values (₪54–₪188). A small lock_open icon (12px, primary) appears in the column header tooltip area, indicating "גלוי רק לבעל העסק".

4. HOVER on a variant row — reveal 2 action icons at the row's inline-end (left in RTL):
   edit (20px, on-surface-variant) | more_vert (20px) for [הפסק variant / ערוך / שכפל]

5. TABS TRANSITION hint — "פרטים" tab content (not shown) would contain the form fields from ProductSheet; "מלאי" tab would show InventoryTable; "היסטוריה" would show an audit timeline. Show the tab bar with the inactive tabs clearly labeled so the user knows what's available.

============================================================
REALISTIC HEBREW SAMPLE DATA
============================================================
Product: Royal Canin Maxi Adult
Supplier: Royal Canin
Animal: כלב | Age: בוגר | Diet: רגיל
Tags: מבצע, ממולץ
Status: פעיל
Created: 18 במאי 2026
Total inventory (all branches combined): 134 יח'
Low stock variants: 2 (4kg עוף: 2 יח' left; 4kg ארנב: 1 יח' left)
Price range: ₪85 (1kg עוף) – ₪295 (4kg ארנב) excl. VAT
VAT: 18%
