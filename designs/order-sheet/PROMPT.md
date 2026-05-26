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
- `designs/order-sheet/MasterPet Order Sheet.html` — same <head>/<style> block as dashboard
- `designs/order-sheet/main.jsx` — App + Sheet component specific to this screen
- `designs/order-sheet/data.jsx` — navItems (same order!) + realistic Hebrew sample data
- `designs/order-sheet/parts.jsx` — COPY VERBATIM from dashboard-branch/parts.jsx

The active nav item on the rail must be "הזמנות" (receipt_long).
Show the Sheet overlaid on top of the blurred/dimmed orders-list background.

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
Screen name: order-sheet
Hebrew title: הזמנה חדשה
Active nav item: הזמנות (receipt_long)
Role: Sales Rep / Business Owner

The 3-second test — what must the user understand within 3 seconds?
1. איזה לקוח מזמין עכשיו?
2. מה בסל ומה הסכום הכולל?
3. האם אפשר לשמור ולשלוח קישור תשלום מיד?

============================================================
LAYOUT — Sheet overlaid on dimmed background
============================================================
Background: the orders-list page, dimmed with rgba(0,0,0,0.32) overlay.
Sheet panel: fixed, slides in from LEFT (RTL — new content comes from reading-end side).
  Width: 520px
  Height: 100vh
  bg: surface-container-lowest
  border-inline-end: 1px solid outline-variant (the edge facing the main content)
  box-shadow: --shadow-3
  display: flex, flex-direction: column (header + scrollable body + sticky footer)

============================================================
SHEET HEADER (sticky top, 64px)
============================================================
bg: surface-container-low, border-bottom: 1px solid outline-variant
padding: 0 24px
RTL row, space-between, align-center:

  RIGHT (RTL start):
    IconButton icon="close" (24px, on-surface-variant) — closes the sheet
    Divider: 1px solid outline-variant, height 20px, margin 0 12px
    icon: receipt_long (20px, FILL 1, var(--md-primary)) + "הזמנה חדשה" (16px, 600, on-surface)

  LEFT (RTL end):
    breadcrumb pill: bg surface-container, border 1px outline-variant, border-radius 999,
      padding 4px 12px, gap 6px
      icon: store (14px, on-surface-variant) + "חיות הבית של אבי" (12px, 500, on-surface-variant)

============================================================
SHEET BODY (scrollable, padding 24px, gap 24px between sections)
============================================================

--- SECTION A: בחירת לקוח ---
Label: "לקוח" (12px, 600, uppercase, letter-spacing 0.4, on-surface-variant), margin-bottom 8px

Combobox (full width):
  height: 48px, border-radius: 12px, border: 1px solid outline-variant
  bg: surface-container-lowest
  RTL row: icon "search" (20px, on-surface-variant) | placeholder "חיפוש לפי שם או טלפון..." | expand_more

SELECTED STATE (show as already selected — רחל כהן):
  bg: primary-container, border: 1px solid var(--md-primary)
  RTL row:
    avatar circle (32px, initials "ר.כ", gradient primary) +
    column: "רחל כהן" (14px, 600, on-primary-container) /
            "052-111-2233 | תל אביב" (12px, 400, rgba(0,33,6,0.70))
    LEFT end: IconButton icon="close" (16px, on-surface-variant) — clears selection

CUSTOMER MINI-CARD (appears after selection, bg: surface-container-low, border-radius 12px, padding 14px):
  RTL row, gap 12px:
    avatar 36px
    column:
      "רחל כהן" (14px, 600) | "052-111-2233" (12px, on-surface-variant)
      Row: ChannelDot channel="whatsapp" + "WhatsApp" (11px) | "תל אביב" (11px, on-surface-variant)
    LEFT end (spacer then):
      small pill "הזמנה קודמת: ₪298" (11px, 500, bg tertiary-container, color on-tertiary-container)

--- SECTION B: פריטי ההזמנה ---
Label: "פריטים" (12px, 600, uppercase, letter-spacing 0.4, on-surface-variant), margin-bottom 8px

ITEMS LIST (gap 8px):

  ITEM ROW 1 — filled (Royal Canin Adult 4kg × 2 = ₪298):
    Card (elevation 1, border-radius 12px, padding 12px 16px):
    RTL row:
      LEFT (action): IconButton icon="delete" (18px, on-surface-variant, hover: error)
      column (flex:1):
        Row 1: "Royal Canin Adult 4kg" (14px, 500, on-surface) + badge "× 2" (12px, 600, secondary-container)
               RIGHT: "₪298" (14px, 600, on-surface, class="currency num")
        Row 2: "SKU: RC-ADULT-4KG" (11px, on-surface-variant) + "↓ ₪149/יחידה" (11px, on-surface-variant)
      variant pill (below row 2): bg surface-container, border 1px outline-variant, border-radius 999
        "4 ק״ג · עוף ואורז" (12px, on-surface-variant)

  ITEM ROW 2 — filled (Hill's Science Diet Adult × 1 = ₪195):
    Same structure:
    "Hill's Science Diet Adult" (14px) + "× 1" badge
    RIGHT: "₪195" class="currency num"
    variant pill: "1 ק״ג · כבש"

  ADD ITEM ROW:
    Dashed border card (border: 1.5px dashed outline-variant, border-radius 12px, padding 12px 16px):
    RTL row, center:
      icon: add_circle (20px, primary) + "הוסף מוצר" (14px, 500, primary)

    DROPDOWN EXPANDED STATE (show as collapsed annotation below, dashed border label "[מצב פתוח — dropdown מוצרים]"):
      Full-width dropdown list, bg surface-container-lowest, border 1px outline-variant,
      border-radius 12px, shadow-2, padding 8px 0:
      Search input at top (same as combobox style, placeholder "חיפוש מוצר...")
      3 result rows (height 44px each):
        Row: product-icon placeholder 28px (bg primary-container, border-radius 8px) +
             "Acana Pacifica Cat 1.8kg" (14px) / "SKU: AC-CAT-18" (11px, on-surface-variant) +
             RIGHT: "₪239" (14px, 600, class="currency num")

--- SECTION C: הנחה ---
Label: "הנחה (אופציונלי)" (12px, 600, uppercase, letter-spacing 0.4, on-surface-variant)

Input row (RTL, gap 12px):
  Input field: width 160px, height 40px, border-radius 8px, border 1px outline-variant
    placeholder: "0", suffix "₪"
  FilledButton "הוסף" (outlined variant, size sm)

--- SECTION D: הערות ---
Label: "הערות" (12px, 600, uppercase, letter-spacing 0.4, on-surface-variant)

Textarea: full width, height 80px, border-radius 12px, border 1px outline-variant
  placeholder: "הערות לאריזה, כתובת מסירה, זמן מועדף..."
  bg: surface-container-lowest

============================================================
SHEET FOOTER (sticky bottom, bg surface-container-low, border-top: 1px solid outline-variant)
============================================================
Padding: 16px 24px, gap 12px, flex-direction: column

TOTALS SUMMARY (Card elevation 0, bg surface-container, border-radius 12px, padding 14px 16px):
  3 rows, space-between:
  Row 1: "סה״כ לפני מע״מ" (13px, on-surface-variant) | "₪ 410.09" (13px, on-surface, class="currency num")
  Row 2: "מע״מ 18%" (13px, on-surface-variant) | "₪73.82" (13px, on-surface, class="currency num")
  Divider: 1px solid outline-variant
  Row 3 (bold): "סה״כ לתשלום" (15px, 600, on-surface) | "₪483.91" (18px, 700, primary, class="currency num")

ACTIONS ROW (RTL, gap 12px):
  FilledButton "שמור הזמנה" (filled, icon: check, size lg, flex:1)
    → creates order in status "pending"
  FilledButton "שמור ושלח קישור PayPlus" (tonal, icon: send, size lg, flex:1)
    → creates order then sends PayPlus link

============================================================
REALISTIC HEBREW SAMPLE DATA
============================================================
Store: "חיות הבית של אבי"
Selected customer: רחל כהן | 052-111-2233 | תל אביב | WhatsApp | הזמנה קודמת: ₪298

Items in cart:
  1. Royal Canin Adult 4kg (SKU: RC-ADULT-4KG) × 2 → ₪298 (₪149/unit)
  2. Hill's Science Diet Adult 1kg (SKU: HS-ADULT-1KG) × 1 → ₪195

Totals:
  לפני מע״מ: ₪410.09 | מע״מ 18%: ₪73.82 | סה״כ: ₪483.91
