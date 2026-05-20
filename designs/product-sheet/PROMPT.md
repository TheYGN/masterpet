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
- `designs/product-sheet/MasterPet Product Sheet.html` — same <head>/<style> block as dashboard
- `designs/product-sheet/main.jsx` — App + sections specific to this screen
- `designs/product-sheet/data.jsx` — navItems (same order!) + realistic Hebrew sample data
- `designs/product-sheet/parts.jsx` — COPY VERBATIM from dashboard-branch/parts.jsx

The active nav item on the rail must be "מלאי" (inventory_2) — NOT "דשבורד".

============================================================
NEVER
============================================================
- No English in the UI (except brand names: Royal Canin, Hill's, Orijen, Acana, Pro Plan)
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
Screen name: product-sheet
Hebrew title: מוצר חדש
Active nav item: מלאי (inventory_2)
Role: Business Owner (owner)

The 3-second test — what must the user understand within 3 seconds?
1. היכן אני ממלא את פרטי המוצר הבסיסיים (שם, ספק, חיה)?
2. איך אני מגדיר attributes (גודל, טעם) והמערכת יוצרת את ה-variants אוטומטית?
3. איפה אני רואה את ה-variants שנוצרו ומעדכן מחיר לכל אחד?

============================================================
LAYOUT — SHEET PANEL OVER DIMMED BACKGROUND
============================================================
This screen shows the Sheet open over the ProductsList page.

BACKGROUND (dimmed):
  The ProductsList from the previous screen is visible behind the Sheet,
  but covered by a dark scrim: rgba(0, 0, 0, 0.32), full-screen overlay.
  The nav rail and top bar remain visible and NOT dimmed (z-index above scrim).
  The ProductsList content is blurred/dimmed — just enough to provide context.

SHEET PANEL:
  Position: fixed, inline-start: 0 (RTL: left edge of screen), top: 0
  Width: 720px
  Height: 100vh
  bg: surface-container-lowest (#FFFFFF)
  boxShadow: var(--shadow-3) (modal-level shadow)
  border-inline-end: 1px solid outline-variant
  display: flex, flex-direction: column

  ┌─────────────────────────────────────────────────┐
  │  HEADER (sticky, 64px)                          │
  ├─────────────────────────────────────────────────┤
  │  BODY (scrollable, flex: 1)                     │
  │    Section A — פרטי מוצר                       │
  │    Section B — טקסונומיה                        │
  │    Section C — AttributeBuilder                 │
  │    Section D — VariantsEditor                   │
  │    Section E — מלאי ראשוני                     │
  ├─────────────────────────────────────────────────┤
  │  FOOTER (sticky, 72px)                          │
  └─────────────────────────────────────────────────┘

============================================================
SHEET HEADER (sticky, 64px tall)
============================================================
bg: surface-container-lowest
border-bottom: 1px solid outline-variant
padding: 0 24px
layout: RTL, flex, align-items center, space-between

RIGHT (RTL start):
  Title: "מוצר חדש" (18px, 700, on-surface)
  Sub: "קטלוג → מוצר חדש" (12px, 400, on-surface-variant) — breadcrumb

LEFT (RTL end):
  IconButton: close (X, 24px, outlined) — closes Sheet, returns to ProductsList

============================================================
SHEET BODY — SECTION A: פרטי מוצר בסיסיים
============================================================
Section heading: "פרטי מוצר" (14px, 600, on-surface-variant, uppercase, letter-spacing 0.4)
padding: 24px, gap 16px between fields

Field 1 — שם מוצר (required):
  Label: "שם מוצר *" (12px, 500, on-surface-variant)
  Input: filled, value "Royal Canin Maxi Adult", height 44px, border-radius 8px
  bg: surface-container-low, border: 1px solid outline-variant
  focus: border primary, bg surface-container-lowest

Field 2 — תיאור (optional):
  Label: "תיאור" (12px, 500, on-surface-variant)
  Textarea: 3 rows, same styling, placeholder "תיאור קצר של המוצר (אופציונלי)"
  value: "מזון יבש לכלבים בוגרים מגזע גדול. עשיר בחלבון עם L-קרניטין לשמירה על שריר."

Field 3 — שם ספק:
  Label: "ספק" (12px, 500, on-surface-variant)
  Input: value "Royal Canin", icon right: local_shipping (16px, outline-variant)

Field 4 — תמונה (image_url):
  Label: "תמונה (URL)" (12px, 500, on-surface-variant)
  Input: value "https://example.com/royal-canin-maxi.jpg", icon: image (16px)
  Below input: preview box 80×80, bg: surface-container, border-radius 8px,
    icon: image (32px, outline-variant) centered — placeholder since URL is mock

Field 5 — מע"מ (VAT):
  Label: "שיעור מע״מ" (12px, 500, on-surface-variant)
  Select pill: "18%" selected, width 120px — dropdown chevron, outlined style
  Helper text: "ברירת מחדל: 18%"

============================================================
SHEET BODY — SECTION B: טקסונומיה
============================================================
Section heading: "טקסונומיה" (14px, 600, uppercase, on-surface-variant)
Card (elevation 0 = surface-container-low), padding 20px, border-radius 12px, border outline-variant

Row 1 — סוג חיה (required):
  Label: "סוג חיה *" (12px, 500, on-surface-variant)
  Filter chips row (pill 999, height 32px, gap 8px), single-select:
    "כלב" — SELECTED: bg secondary-container, color on-secondary-container, icon: pets (14px FILL 1)
    "חתול" — unselected: bg surface-container, border outline-variant, icon: pets (14px)
    "מכרסמים" — unselected, icon: pest_control_rodent (14px)
    "ציפורים" — unselected, icon: yard (14px)
    "דגים" — unselected, icon: water (14px)
    "אחר" — unselected

Row 2 — גיל:
  Label: "קבוצת גיל" (12px, 500, on-surface-variant)
  Filter chips, single-select:
    "גור/גורים" — unselected
    "בוגר" — SELECTED: secondary-container
    "זקן" — unselected
    "כל הגילאים" — unselected

Row 3 — דיאטה:
  Label: "סוג דיאטה" (12px, 500, on-surface-variant)
  Filter chips, single-select:
    "רגיל" — SELECTED: secondary-container
    "ללא גלוטן" — unselected
    "היפואלרגני" — unselected
    "סופר פרמיום" — unselected
    "טיפולי" — unselected

Row 4 — תגיות חופשיות:
  Label: "תגיות" (12px, 500, on-surface-variant)
  Tag input field: shows existing tags as deletable pills inside the input:
    Pill "מבצע" — secondary-container + X icon (12px)
    Pill "ממולץ" — secondary-container + X icon (12px)
    Cursor blinking for next tag entry
  Helper: "הקש Enter להוספת תגית"

============================================================
SHEET BODY — SECTION C: AttributeBuilder
============================================================
Section heading row: "attributes ו-variants" (14px, 600, uppercase, on-surface-variant)
  + TOGGLE right-aligned: "יצירת variants: [אוטומטי ●] [ידני]"
    Toggle switch: MD3 style — track 52×32, thumb 24×24
    "אוטומטי" state = ON (primary color track, white thumb)
    Label: "אוטומטי" (12px, 500, primary)
    Helper text below toggle: "המערכת תייצר את כל ההצלבות האפשריות"

Card (elevation 0 = surface-container-low), padding 20px, border-radius 12px

ATTRIBUTE 1 — "גודל" (complete, 3 values defined):
  Row layout: drag handle (drag_indicator, 16px, outline-variant) | name input | delete button
  Name input: "גודל" (filled, 160px wide)
  Values row (chips below, with + add):
    Pill "1kg" — bg primary-container, on-primary-container, X to delete (12px)
    Pill "2kg" — same style
    Pill "4kg" — same style
    [+ הוסף ערך] — outlined pill, dashed border outline-variant, on-surface-variant, icon: add (14px)

  Divider: 1px solid outline-variant, margin: 12px 0

ATTRIBUTE 2 — "טעם" (complete, 2 values defined):
  drag handle | name input "טעם" | delete button
  Values:
    Pill "עוף" — primary-container + X
    Pill "ארנב" — primary-container + X
    [+ הוסף ערך] — outlined dashed

  Divider: 1px solid outline-variant, margin: 12px 0

[+ הוסף attribute] button:
  full width, height 40px, border: 2px dashed outline-variant, border-radius 8px
  text: "+ הוסף attribute" (14px, 500, on-surface-variant)
  icon: add (18px) on the right (RTL start)
  hover: bg surface-container-high, border primary

VARIANTS PREVIEW BANNER (appears automatically after 2+ attributes with values):
  bg: primary-container (light green #B7F0BB)
  border-radius: 8px, padding: 12px 16px
  icon: auto_awesome (18px, FILL 1, primary) — right (RTL start)
  text: "יוצרים 6 variants מ-2 attributes (גודל × טעם)" (14px, 500, on-primary-container)
  sub: "כל variant יקבל SKU אוטומטי. תוכל לערוך מחיר וברקוד בשלב הבא" (12px, 400)

============================================================
SHEET BODY — SECTION D: VariantsEditor
============================================================
Section heading: "עריכת variants (6)" (14px, 600, uppercase, on-surface-variant)
Note: shown collapsed state with expand chevron, currently EXPANDED.

Table inside Card (elevation 0), border-radius 12px, overflow hidden.

TABLE HEADER (bg: surface-container, height 40px):
  Columns RTL order: שם variant (flex:1) | SKU (120px) | מחיר (₪ללא מע"מ) (100px) | מחיר כולל מע"מ (100px, read-only) | מחיר עלות (100px) | ברקוד (120px) | סטטוס (80px)
  header text: 11px, 600, uppercase, letter-spacing 0.4, on-surface-variant
  מחיר כולל מע"מ column header: "מחיר + מע״מ" with lock_outline (12px) icon — read-only indicator

6 TABLE ROWS (auto-generated from גודל × טעם):

Row 1 — "גודל: 1kg / טעם: עוף":
  שם: "גודל: 1kg / טעם: עוף" (13px, 400, on-surface, LTR chip pair)
  SKU: inline editable input "RC-MAXI-1KG-OF" (12px, monospace)
  מחיר: inline editable "85.00" (class="currency", ₪ prefix shown as prefix-adornment)
  מחיר+מע"מ: "100.30" read-only, bg: surface-container, color: on-surface-variant (calculated: 85×1.18)
  מחיר עלות: inline editable "54.00" (12px, on-surface)
  ברקוד: inline editable "729009023523" (12px, monospace)
  סטטוס: <StatusChip kind="filled-primary"> פעיל </StatusChip>

Row 2 — "גודל: 1kg / טעם: ארנב":
  SKU: "RC-MAXI-1KG-RA"
  מחיר: "92.00" | מע"מ: "108.56" | עלות: "58.00"
  ברקוד: "729009023530"

Row 3 — "גודל: 2kg / טעם: עוף":
  SKU: "RC-MAXI-2KG-OF"
  מחיר: "165.00" | מע"מ: "194.70" | עלות: "105.00"
  ברקוד: "729009023547"

Row 4 — "גודל: 2kg / טעם: ארנב":
  SKU: "RC-MAXI-2KG-RA"
  מחיר: "178.00" | מע"מ: "210.04" | עלות: "112.00"
  ברקוד: "729009023554"

Row 5 — "גודל: 4kg / טעם: עוף" (ACTIVE/FOCUSED ROW — show as currently focused for editing):
  bg: surface-container-low (focus tint)
  border: 1px solid primary (focused state on entire row)
  SKU: input focused with cursor "RC-MAXI-4KG-OF"
  מחיר input: focused, value "280.00", border: primary
  מע"מ: "330.40" (calculated)
  עלות: "178.00"
  ברקוד: "729009023561"

Row 6 — "גודל: 4kg / טעם: ארנב":
  SKU: "RC-MAXI-4KG-RA"
  מחיר: "295.00" | מע"מ: "348.10" | עלות: "188.00"
  ברקוד: "729009023578"

============================================================
SHEET BODY — SECTION E: מלאי ראשוני (collapsed)
============================================================
Section heading row with expand toggle (currently COLLAPSED):
  "מלאי ראשוני (אופציונלי)" (14px, 600, on-surface-variant)
  Right: expand_more icon (20px) + "ניתן להגדיר מאוחר יותר" label (12px, on-surface-variant)
  bg: surface-container-low, border-radius 12px, padding 16px 20px
  collapsed = just the header row, no content visible

============================================================
SHEET FOOTER (sticky, 72px)
============================================================
bg: surface-container-lowest
border-top: 1px solid outline-variant
padding: 0 24px
layout: RTL, flex, align-items center, space-between

RIGHT (RTL start — primary actions):
  FilledButton "שמור מוצר" (filled variant, primary, icon: check, size md)
  gap 8px
  FilledButton "שמור וצור variant נוסף" (tonal variant, icon: add, size md)

LEFT (RTL end — secondary):
  FilledButton "בטל" (text variant, no bg, on-surface-variant, size md)

============================================================
SPECIAL STATES / INTERACTIONS TO SHOW
============================================================
1. TOGGLE STATE — "אוטומטי" ON:
   Show the toggle in the ON position (primary-color track).
   The VariantsEditor section is visible and populated with all 6 variants.
   The preview banner "יוצרים 6 variants" is shown in primary-container.

2. FOCUSED ROW in VariantsEditor (Row 5):
   Border: 1px solid primary around the row.
   Price input: focused with primary border + cursor blinking.
   מחיר כולל מע"מ: updates live to 330.40 (shown with subtle animation hint — just show final value).

3. VALIDATION — show one error state on the "ברקוד" field of Row 1:
   Below the barcode input: tiny error text "ברקוד כבר קיים במערכת" (11px, error color)
   The barcode input border: error color (--md-error)
   This teaches the user that duplicate barcodes are caught inline.

4. SCRIM & BACKGROUND:
   Behind the Sheet panel (to the right, from 720px to screen right edge):
   Show the ProductsList dimmed with the scrim overlay rgba(0,0,0,0.32).
   The nav rail and top bar are visible above the scrim (they remain interactive).
   The ProductsList table rows are faintly visible through the scrim — just outlines.

5. SCROLLED STATE — show the Sheet body as scrolled to Section D (VariantsEditor).
   This means Sections A + B + C are scrolled past — not visible.
   Only Sections D (VariantsEditor, full) and E (מלאי ראשוני, collapsed) are visible.
   The sticky header and footer are always shown.

============================================================
REALISTIC HEBREW SAMPLE DATA
============================================================
Product being created:
  שם: "Royal Canin Maxi Adult"
  תיאור: "מזון יבש לכלבים בוגרים מגזע גדול. עשיר בחלבון עם L-קרניטין לשמירה על שריר."
  ספק: "Royal Canin"
  image_url: placeholder (icon only)
  VAT: 18%
  animal_type: כלב ✓ selected
  age_group: בוגר ✓ selected
  diet_type: רגיל ✓ selected
  tags: ["מבצע", "ממולץ"]

Attributes:
  Attribute 1: "גודל" → values: "1kg", "2kg", "4kg"
  Attribute 2: "טעם" → values: "עוף", "ארנב"
  → 6 auto-generated variants (3 × 2)

Variants pricing (price excl. VAT → price incl. VAT at 18%):
  1kg עוף:   ₪85.00  → ₪100.30  | עלות ₪54.00  | SKU RC-MAXI-1KG-OF | ברקוד 729009023523
  1kg ארנב:  ₪92.00  → ₪108.56  | עלות ₪58.00  | SKU RC-MAXI-1KG-RA | ברקוד 729009023530
  2kg עוף:   ₪165.00 → ₪194.70  | עלות ₪105.00 | SKU RC-MAXI-2KG-OF | ברקוד 729009023547
  2kg ארנב:  ₪178.00 → ₪210.04  | עלות ₪112.00 | SKU RC-MAXI-2KG-RA | ברקוד 729009023554
  4kg עוף:   ₪280.00 → ₪330.40  | עלות ₪178.00 | SKU RC-MAXI-4KG-OF | ברקוד 729009023561 ← FOCUSED
  4kg ארנב:  ₪295.00 → ₪348.10  | עלות ₪188.00 | SKU RC-MAXI-4KG-RA | ברקוד 729009023578

Error state: Row 1 (1kg עוף) barcode "729009023523" shows validation error "ברקוד כבר קיים במערכת"

Store context (background ProductsList dimmed behind scrim):
  "חיות הבית של אבי" — 47 products
