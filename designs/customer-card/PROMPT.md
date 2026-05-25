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
- `designs/customer-card/MasterPet Customer Card.html` — same <head>/<style> block as dashboard
- `designs/customer-card/main.jsx` — App + sections specific to this screen
- `designs/customer-card/data.jsx` — navItems (same order!) + realistic Hebrew sample data
- `designs/customer-card/parts.jsx` — COPY VERBATIM from dashboard-branch/parts.jsx

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
Screen name: customer-card
Hebrew title: כרטיס לקוח
Active nav item: לקוחות (group)
Role: Business Owner (owner) — all roles can view; only owner/branch_manager see edit button

The 3-second test — what must the user understand within 3 seconds?
1. מי הלקוח הזה ואיך יוצרים איתו קשר?
2. מה הסטטוס שלו ולאיזה סניף הוא משויך?
3. האם יש לו היסטוריית הזמנות?

============================================================
SECTION 1 — Breadcrumb + Back Navigation
============================================================
Height 40px, RTL, gap 8px, padding 0 (no card — bare row).
  IconButton (arrow_back, 20px, ms-flip-rtl, outlined, no fill) — back to list
  Divider 1px vertical, outline-variant, height 16px
  Breadcrumb: "לקוחות" (13px, on-surface-variant, underline on hover) >
              "רחל כהן" (13px, on-surface, 500, current — no underline)

============================================================
SECTION 2 — Customer Header Card
============================================================
Card (elevation 1 = surface-container-low), border-radius 16px, padding 24px.
Layout: horizontal row, RTL, space-between, align-center.

LEFT group (RTL start = right side visually):
  Avatar circle (56px, gradient #38656A→#1B5E20, initials "ר.כ" 20px #fff bold)
  gap 16px
  Text stack:
    Row 1: "רחל כהן" (22px, 700, on-surface) + StatusChip kind="filled-primary" "פעיל" (inline, gap 8px)
    Row 2: ChannelDot channel="whatsapp" (24px) + "052-111-2233" (14px, 500, on-surface, class="num", LTR isolated) — gap 8px
    Row 3: icon "location_on" (16px, on-surface-variant) + "תל אביב" (13px, on-surface-variant) +
            "  ·  " separator +
            icon "storefront" (16px, on-surface-variant) + "סניף ראשי" (13px, on-surface-variant)
    Row 4: icon "calendar_today" (14px, on-surface-variant) + "הצטרף ב-" + "01/03/2026" (13px, on-surface-variant, class="num") +
            " — לקוח מזה " + "78 ימים" (13px, on-surface-variant, class="num")

RIGHT group (RTL end = left side visually) — action buttons:
  FilledButton "ערוך פרטים" (outlined variant, icon: edit, size md)
  FilledButton "שלח הודעה" (tonal variant, icon: send, size md, color: secondary)
    — gap 8px between buttons

============================================================
SECTION 3 — Two-Column Layout
============================================================
Two columns, RTL (right column = primary info, left column = secondary stats).
Gap 24px between columns. Right column: flex 1.6. Left column: flex 1.

--- RIGHT COLUMN (primary) ---

CARD A: פרטי קשר
  Card (elevation 1), padding 24px, border-radius 16px.
  Header row: icon "contact_page" (20px, FILL 1, primary) + "פרטי קשר" (16px, 700, on-surface)
  Separator 1px outline-variant, margin 12px 0.
  Detail rows (gap 12px each, RTL, align-start):
    Row: icon "phone" (18px, outline, on-surface-variant) + "טלפון" label (12px, 600, uppercase, on-surface-variant, 80px fixed) + "052-111-2233" value (14px, on-surface, class="num", LTR isolated)
    Row: icon "mail" (18px, outline, on-surface-variant) + "אימייל" + "rachel.cohen@gmail.com" (14px)
    Row: icon "home" (18px, outline) + "כתובת" + "רחוב הרצל 14, דירה 3, תל אביב" (14px)
    Row: icon "chat" (18px, outline, #25D366) + "ערוץ מועדף" + ChannelDot whatsapp + "WhatsApp" (14px, 500)
    Row: icon "storefront" (18px, outline) + "סניף" + "סניף ראשי" (14px)

CARD B: הערות
  Card (elevation 0 = surface-container-lowest), padding 20px, border-radius 16px,
  border: 1px dashed outline-variant.
  Header row: icon "notes" (18px, FILL 1, on-surface-variant) + "הערות" (14px, 600, on-surface)
  Content: "לקוחה קבועה. רוכשת בעיקר מזון לחתול. מעדיפה מסירה עצמית."
    (14px, 400, on-surface-variant, line-height 1.7)

CARD C: היסטוריית הזמנות (tabs)
  Card (elevation 1), border-radius 16px, overflow hidden.
  Tab bar (sticky top of card, bg surface-container, border-bottom 1px outline-variant, height 48px):
    Tab 1 "הזמנות" (14px, 500) — ACTIVE: primary color underline 2px, filled icon receipt_long
    Tab 2 "פעילות" (14px, 400, on-surface-variant) — inactive

  Tab 1 content — EMPTY STATE (הזמנות tab):
    Centered, padding 56px 24px.
    icon: receipt_long (64px, FILL 0, color: outline)
    title: "אין הזמנות עדיין" (18px, 700, on-surface)
    sub: "הזמנות הלקוח יופיעו כאן לאחר ביצוע ההזמנה הראשונה" (14px, 400, on-surface-variant, max-width 320px, center)
    Note annotation in small pill below sub (bg surface-container, border 1px outline-variant,
      12px, on-surface-variant): "יופעל לאחר הטמעת מודול ההזמנות"

--- LEFT COLUMN (secondary stats) ---

CARD D: נתוני לקוח
  Card (elevation 1), padding 20px, border-radius 16px.
  Header: "נתוני לקוח" (14px, 700, on-surface), icon "insights" (18px, FILL 1, primary)
  Separator.
  Stat rows (gap 16px):
    Stat: label "סה״כ הזמנות" (12px, 600, uppercase, on-surface-variant) + value "—" (22px, 700, on-surface-variant)
      sub: "טרם בוצעו הזמנות" (11px, on-surface-variant)
    Stat: label "סכום כולל" + value "₪—" (class="currency")
      sub: "נתון זמין לאחר הזמנה ראשונה"
    Stat: label "הזמנה אחרונה" + value "—"
      sub: "לא קיים עדיין"
  Note at bottom (small, italic, on-surface-variant):
    "נתונים אלה יחושבו אוטומטית לאחר הטמעת מודול ההזמנות"

CARD E: מידע כללי
  Card (elevation 0), padding 20px, border-radius 16px, border 1px solid outline-variant.
  Header: "מידע כללי" (14px, 700), icon "info" (18px, outline, on-surface-variant)
  Separator.
  Info rows:
    "תאריך הצטרפות" / "01/03/2026" (class="num")
    "עדכון אחרון" / "18/05/2026" (class="num")
    "מזהה לקוח" / "CUS-0042" (class="num", 12px monospace, on-surface-variant)

============================================================
SPECIAL STATES
============================================================
1. The orders tab shows a prominent empty state — not just a blank area.
   The empty state must feel intentional: centered icon + text + annotation pill.

2. The action buttons (ערוך פרטים / שלח הודעה) are only visible to
   owner and branch_manager. Draw them as visible (owner view).
   Add a small annotation note: "[כפתורי עריכה — לא מוצגים לroles: sales, warehouse]"

3. Customer avatar initials must match the name — "ר.כ" for "רחל כהן".

============================================================
REALISTIC HEBREW SAMPLE DATA
============================================================
Customer: רחל כהן
Phone: 052-111-2233
Email: rachel.cohen@gmail.com
Address: רחוב הרצל 14, דירה 3
City: תל אביב
Preferred channel: WhatsApp
Branch: סניף ראשי
Join date: 01/03/2026
Last updated: 18/05/2026
Internal ID: CUS-0042
Notes: לקוחה קבועה. רוכשת בעיקר מזון לחתול. מעדיפה מסירה עצמית.
Status: פעיל
Days since joined: 78 ימים

Store name: "חיות הבית של אבי"
Date shown: "יום שני, 18 במאי 2026"
