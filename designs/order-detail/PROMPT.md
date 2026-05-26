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
- `designs/order-detail/MasterPet Order Detail.html` — same <head>/<style> block as dashboard
- `designs/order-detail/main.jsx` — App + sections specific to this screen
- `designs/order-detail/data.jsx` — navItems (same order!) + realistic Hebrew sample data
- `designs/order-detail/parts.jsx` — COPY VERBATIM from dashboard-branch/parts.jsx

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
Screen name: order-detail
Hebrew title: פרטי הזמנה #1041
Active nav item: הזמנות (receipt_long)
Role: Business Owner (owner) — sees all fields including cost_price and profit

The 3-second test — what must the user understand within 3 seconds?
1. מה שלב ההזמנה עכשיו ומה הצעד הבא?
2. מה נכלל בהזמנה, כמה שולם, ומה נותר לגבות?
3. מה פרטי הלקוח ואיך מתקשרים אליו?

============================================================
LAYOUT — 2 columns (main 65% + sidebar 35%)
============================================================
RTL layout: sidebar on LEFT (reading-end), main on RIGHT (reading-start).
Gap between columns: 24px.

============================================================
PAGE HEADER (above 2 columns, full width)
============================================================
RTL row, space-between, align-center:

  RIGHT (RTL start):
    breadcrumb: FilledButton icon="arrow_back" variant="text" (flipped, ms-flip-rtl) →
      "הזמנות" (text, on-surface-variant) / chevron_left (16px, on-surface-variant) /
      "הזמנה #1041" (14px, 600, on-surface)
    gap 16px
    title: "הזמנה #1041" (24px, 700, on-surface) + ChannelDot channel="whatsapp" (20px, gap 8px)

  LEFT (RTL end):
    StatusChip kind="tonal-secondary" text="בהכנה" (16px, the current status)
    gap 8px
    FilledButton "קדם לשלב הבא" (filled, icon: arrow_forward, flipped ms-flip-rtl) — advances to in_transit
    gap 8px
    IconButton icon="more_vert" (3-dot menu)

============================================================
MAIN COLUMN — RIGHT side (65%)
============================================================

--- CARD A: StatusStepper ---
Card (elevation 1, border-radius 16px, padding 24px):
  Title row: icon "timeline" (20px, FILL 1, primary) + "מסלול ההזמנה" (15px, 600, on-surface)
  spacing: margin-top 24px

  STEPPER (horizontal, RTL — starts from RIGHT):
  6 steps in a row, connected by lines. RTL: step 1 is rightmost, step 6 is leftmost.

  Steps (right → left):
    1. ממתין (pending) — COMPLETED: circle filled primary (#1B5E20), icon: check (white, 18px FILL 1)
       below: "ממתין" (11px, 600, primary) / "18/05, 09:14" (10px, on-surface-variant)
    2. אושר (confirmed) — COMPLETED: same filled primary + check
       below: "אושר" (11px, 600, primary) / "18/05, 09:22" (10px, on-surface-variant)
    3. בהכנה (preparing) — CURRENT / ACTIVE: circle bg=primary-container, border 2px solid primary,
       icon: inventory_2 (18px, FILL 1, primary) — pulsing dot or ring to indicate current
       below: "בהכנה" (11px, 600, primary) / "עדכון אחרון לפני 12 דק׳" (10px, on-surface-variant)
    4. בדרך (in_transit) — UPCOMING: circle bg=surface-container, border 1.5px solid outline-variant,
       icon: local_shipping (18px, outline, on-surface-variant)
       below: "בדרך" (11px, on-surface-variant)
    5. נמסר (delivered) — UPCOMING: circle bg=surface-container, border 1.5px solid outline-variant,
       icon: check_circle (18px, outline, on-surface-variant)
       below: "נמסר" (11px, on-surface-variant)
    6. בוטל (cancelled) — GHOST (shown dimmed at the edge):
       circle bg=surface-container, border 1px dashed outline-variant, opacity: 0.4
       icon: cancel (16px, on-surface-variant)
       below: "בוטל" (11px, on-surface-variant, opacity: 0.4)

  Connecting lines between steps:
    Completed→Completed: bg=primary (solid)
    Completed→Current: bg=primary (solid, then dashes to current)
    Current→Upcoming: bg=outline-variant (dashed)
    All lines: height 2px

  CTA below stepper (RTL end, margin-top 16px):
    FilledButton "קדם לשלב הבא: בדרך" (filled, icon: local_shipping, gap 8px)
    gap 12px
    FilledButton "בטל הזמנה" (error variant, icon: cancel, size sm)

--- CARD B: פריטי ההזמנה ---
Card (elevation 1, border-radius 16px, padding 24px):
  Header row: icon "receipt" (20px, FILL 1, secondary) + "פריטים" (15px, 600, on-surface)
              LEFT: "2 פריטים" (13px, on-surface-variant, class="num")

  Table (full width, no outer borders, internal separators):
    Header: "מוצר" | "כמות" | "מחיר יחידה" | "סה״כ" (11px, 600, uppercase, letter-spacing 0.4, on-surface-variant)
    Row 1 (Royal Canin):
      מוצר: "Royal Canin Adult 4kg" (14px, 500) / "SKU: RC-ADULT-4KG | 4 ק״ג · עוף ואורז" (11px, on-surface-variant)
      כמות: "2" (14px, class="num")
      מחיר יחידה: "₪149.00" (14px, class="currency num")
      סה״כ: "₪298.00" (14px, 600, class="currency num")
    Row 2 (Hill's):
      מוצר: "Hill's Science Diet Adult" (14px, 500) / "SKU: HS-ADULT-1KG | 1 ק״ג · כבש" (11px, on-surface-variant)
      כמות: "1"
      מחיר יחידה: "₪195.00"
      סה״כ: "₪195.00"

    Separator
    TOTALS BLOCK (RTL, align-end, column):
      Row: "סה״כ לפני מע״מ" (13px, on-surface-variant) | "₪410.09" (13px, class="currency num")
      Row: "מע״מ 18%" (13px, on-surface-variant) | "₪73.82" (13px, class="currency num")
      Row (bold, slightly larger): "סה״כ לתשלום" (15px, 600) | "₪483.91" (18px, 700, primary, class="currency num")

    OWNER-ONLY BLOCK (visible only to owner — show with a subtle lock icon to indicate visibility):
      bg: surface-container, border-radius 10px, padding 10px 14px, margin-top 8px
      RTL row, gap 24px:
        "עלות כוללת" (12px, on-surface-variant) + lock (14px, on-surface-variant) |
          "₪280.00" (13px, 600, on-surface, class="currency num")
        "רווח גולמי" (12px, on-surface-variant) |
          "₪203.91" (13px, 600, secondary, class="currency num")
        "שיעור רווח" (12px, on-surface-variant) |
          "42.2%" (13px, 600, var(--md-secondary), class="num")

--- CARD C: הערות ---
Card (elevation 1, border-radius 16px, padding 24px):
  Header row: icon "notes" (20px, FILL 1, on-surface-variant) + "הערות" (15px, 600, on-surface)
  Content: "להכניס לשקית ירוקה, המשלוח בין 14:00-16:00" (14px, on-surface)

============================================================
SIDEBAR — LEFT side (35%)
============================================================

--- SIDEBAR CARD A: לקוח ---
Card (elevation 1, border-radius 16px, padding 20px):
  Header: "פרטי לקוח" (13px, 600, uppercase, letter-spacing 0.4, on-surface-variant)
  gap 16px

  Customer row:
    avatar circle (44px, initials "ר.כ", gradient primary) +
    column: "רחל כהן" (16px, 600, on-surface) / "לקוחה קבועה" (12px, tertiary)

  Divider

  Fields (key → value, RTL row space-between, 11px uppercase key, 13px value):
    "טלפון" | "052-111-2233" (class="num", LTR isolation)
    "עיר" | "תל אביב"
    "ערוץ מועדף" | ChannelDot channel="whatsapp" + "WhatsApp" (13px)
    "סניף" | "סניף ראשי"

  Action buttons row (gap 8px, margin-top 8px):
    FilledButton "התקשר" (outlined, icon: phone, size sm)
    FilledButton "WhatsApp" (tonal, icon: chat, size sm)
    FilledButton "כרטיס לקוח" (text, icon: open_in_new, size sm)

--- SIDEBAR CARD B: תשלום ---
Card (elevation 1, border-radius 16px, padding 20px):
  Header: "סטטוס תשלום" (13px, 600, uppercase, letter-spacing 0.4, on-surface-variant)

  Payment status row (space-between):
    "סטטוס" | StatusChip kind="tonal-secondary" text="קישור נשלח"

  Fields:
    "אמצעי תשלום" | "PayPlus Link"
    "קישור נשלח" | "18/05, 09:30" (class="num")
    "PayPlus Ref" | "—" (לא שולם עדיין)

  CTA buttons (gap 8px, margin-top 12px):
    FilledButton "שלח קישור תשלום שוב" (tonal, icon: send, full width)
    FilledButton "סמן כשולם ידנית" (outlined, icon: check, full width, size sm)

--- SIDEBAR CARD C: פרטי הזמנה ---
Card (elevation 1, border-radius 16px, padding 20px):
  Header: "פרטי הזמנה" (13px, 600, uppercase, letter-spacing 0.4, on-surface-variant)

  Fields (key → value, RTL, space-between):
    "מספר הזמנה" | "#1041" (class="num")
    "נוצרה ב" | "18/05/2026, 09:14"
    "נוצרה על ידי" | "שרה לוי (מכירות)"
    "ערוץ מקור" | ChannelDot channel="whatsapp" + "WhatsApp ידני"
    "סוג הזמנה" | "חד פעמית"
    "תאריך מסירה" | "19/05/2026"

============================================================
REALISTIC HEBREW SAMPLE DATA
============================================================
Store: "חיות הבית של אבי"
Order: #1041 | status: preparing | payment: link_sent | channel: whatsapp | manual

Customer: רחל כהן | 052-111-2233 | תל אביב | WhatsApp | סניף ראשי

Items:
  1. Royal Canin Adult 4kg (RC-ADULT-4KG) × 2 → ₪298 (₪149/unit, עלות ₪95/unit)
  2. Hill's Science Diet Adult 1kg (HS-ADULT-1KG) × 1 → ₪195 (עלות ₪140/unit)

Totals:
  לפני מע״מ: ₪410.09 | מע״מ: ₪73.82 | סה״כ: ₪483.91
  עלות: ₪280.00 | רווח: ₪203.91 | שיעור: 42.2%

Timeline:
  ממתין: 18/05, 09:14 (created by שרה לוי)
  אושר: 18/05, 09:22 (by אבי כהן — owner)
  בהכנה: 18/05, 09:30 — עדכון לפני 12 דק׳

Notes: "להכניס לשקית ירוקה, המשלוח בין 14:00-16:00"
PayPlus link sent: 18/05, 09:30
