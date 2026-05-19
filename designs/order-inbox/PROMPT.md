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
    אינבוקס (inbox) ← ACTIVE on this screen, badge: 12
    הזמנות (receipt_long)
    מלאי (inventory_2)
    לקוחות (group)
    נאמנות (loyalty)
    אוטומציות (bolt)
    הגדרות (settings)
  Active item gets MD3 navigation pill (secondary-container) + filled icon.
  Bottom of rail: avatar circle (gradient #38656A→#1B5E20) + "PRO" badge.

- Top Bar (72px tall, sticky):
  Right (RTL start): store name "חיות הבית של אבי" + Hebrew date "יום שני, 19 במאי 2026"
  Center: rounded search "חיפוש לקוחות, הזמנות, מוצרים…" + ⌘K kbd
  Left (RTL end): help IconButton, notifications IconButton (badge 4), divider,
                  FilledButton "+ הזמנה ידנית" (filled variant, icon: edit_note)

- Main content area: padding 24px 32px 48px, vertical flex with gap 24px.

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
- `designs/order-inbox/MasterPet Order Inbox.html` — same <head>/<style> block as dashboard
- `designs/order-inbox/main.jsx` — App + sections specific to this screen
- `designs/order-inbox/data.jsx` — navItems (same order!) + realistic Hebrew sample data
- `designs/order-inbox/parts.jsx` — COPY VERBATIM from dashboard-branch/parts.jsx

The active nav item on the rail must be "אינבוקס" (id: inbox), not "דשבורד".

============================================================
NEVER
============================================================
- No English in the UI (except brand names: WhatsApp, WooCommerce, Royal Canin, etc.)
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
Screen name: order-inbox
Hebrew title: אינבוקס הזמנות
Active nav item: inbox (badge: 12)
Role: Business Owner / Sales Rep

The 3-second test — what must the user understand within 3 seconds?
1. כמה הזמנות חדשות ממתינות לאישור עכשיו?
2. אילו הזמנות לא נענו מעל שעתיים (דחוף)?
3. מאיזה ערוץ הגיע רוב הלחץ — WhatsApp, טלפון, או WooCommerce?

============================================================
SECTION 1 — KPI Strip (4 tiles, grid 1fr 1fr 1fr 1fr)
============================================================

Tile 1 — HERO: "בהמתנה לאישור"
- Use HERO METRIC PATTERN (gradient green + watermark)
- Value: 12 (large, 36px bold)
- Sub-label: "הזמנות חדשות בכל הערוצים"
- CTA button (white pill): "אשר את הבאות" + arrow_back (flipped)
- "HERO" label pill in corner
- icon: inbox (FILL 1)

Tile 2 — WARNING: "ממתינות מעל שעתיים"
- Value: 3
- Background: var(--md-warning-container)
- Sub-label: "לקוחות מחכים — פנה אליהם מיד"
- Small inline warning dot (--md-warning)
- icon: schedule (FILL 1, warning color)

Tile 3 — CHANNEL: "WhatsApp פתוחות"
- Value: 8
- Background: rgba(37,211,102,0.10) — very light WhatsApp green tint
- Border: 1px solid rgba(37,211,102,0.25)
- Sub-label: "הודעות לא מטופלות"
- ChannelDot whatsapp (icon chat, color #25D366) at top of tile
- icon color: #25D366

Tile 4 — CHANNEL: "WooCommerce פתוחות"
- Value: 4
- Background: rgba(127,84,179,0.08) — very light WooCommerce purple tint
- Border: 1px solid rgba(127,84,179,0.20)
- Sub-label: "הזמנות אונליין ממתינות"
- ChannelDot woo (icon shopping_cart, color #7F54B3) at top
- icon color: #7F54B3

============================================================
SECTION 2 — Split View (full width, ~720px min-height)
============================================================

OUTER container: display flex, flexDirection row (RTL = list on right, detail on left), gap 0, borderRadius 16, border 1px outline-variant, overflow hidden, background surface-container-lowest.

RIGHT PANEL — Message List (width: 400px, flexShrink: 0)
borderInlineStart: 1px solid outline-variant
display: flex, flexDirection: column

  ► Filter bar (padding 16px 20px 0):
    - Row 1: Tab pills (inline-flex, gap 8):
        "הכל" badge 12 (active — secondary-container pill)
        "חדשות" badge 7
        "לא נענו" badge 3
        "VIP" badge 2
    - Row 2: Sort dropdown (right-aligned) + Search icon button
        Sort: "לפי דחיפות ▾" (outlined, 32px height, pill, fontSize 12)

  ► Message rows list (flex: 1, overflowY: auto):
    12 rows total. Each row (paddingInline 16px, paddingBlock 14px):
      - borderBottom: 1px solid outline-variant
      - background: hover → surface-container-high; selected → secondary-container at 35% opacity
      - cursor: pointer

    Row layout (RTL, right-to-left):
      [ChannelDot 28×28] [Customer + preview — flex:1, minWidth:0] [time + badge — right-aligned, LTR isolated]

    Customer area (flexDirection column, gap 2):
      Line 1: customer name (14px, 600) + [VIP gold star icon "star" 14px, color #F59E0B] if vip=true
      Line 2: message preview (13px, 400, truncated 1 line, color on-surface-variant)

    Time + badge area (display flex, flexDirection column, alignItems flex-end, gap 4):
      - time (12px, on-surface-variant, LTR direction)
      - unread badge (if >0): filled red circle, 18px, white number, fontSize 10

    WARNING ROWS (id 5 "אורי דהן" and id 7 "אבי שטרן"):
      - borderInlineStart: 3px solid var(--md-warning)  ← left border in LTR = inline-end in RTL context
      Wait — in RTL, "left" visually = inline-end. But the border should be on the RIGHT side visually (which is inline-start in RTL).
      Actually: add a visual accent on the RIGHT SIDE (inline-start) of the row.
      - Background: rgba(245,158,11,0.06)
      - A small "schedule" icon (14px, --md-warning color) next to the preview text

    SELECTED ROW (id 1 "דני כהן"): background var(--md-secondary-container)

    ALL 12 ROWS DATA:
    1.  ChannelDot: whatsapp · Name: דני כהן · VIP: ✓ · preview: "תוסיפו גם קופסת Whiskas אם אפשר" · time: "לפני 4 דק׳" · unread: 2 · status: new · SELECTED
    2.  ChannelDot: woo      · Name: מיכל לוי         · preview: "#WC-1052 — Hill's Kitten 2kg ×1" · time: "לפני 12 דק׳" · unread: 0 · status: new
    3.  ChannelDot: phone    · Name: יוסי אברהמי       · preview: "Acana Pacifica 11.4kg — לבדוק מחיר" · time: "לפני 18 דק׳" · unread: 1 · status: new
    4.  ChannelDot: whatsapp · Name: שירה רוזן · VIP: ✓ · preview: "תודה, מתי יישלח?" · time: "לפני 35 דק׳" · unread: 0 · status: processing
    5.  ChannelDot: whatsapp · Name: אורי דהן  · WARNING · preview: "גוגו לא אוכל מהשק הזה, אפשר להחליף?" · time: "לפני שעתיים ו-12 דק׳" · unread: 3 · status: new
    6.  ChannelDot: phone    · Name: תמר בן-עמי         · preview: "Pro Plan Sensitive Skin 3kg" · time: "לפני שעה" · unread: 0 · status: processing
    7.  ChannelDot: whatsapp · Name: אבי שטרן   · WARNING · preview: "מתי מגיעים שקי ה-Orijen שהזמנתי?" · time: "לפני שעתיים ו-34 דק׳" · unread: 1 · status: new
    8.  ChannelDot: woo      · Name: נועם ברק           · preview: "#WC-1049 — Bonzo Junior 15kg" · time: "לפני שעה וחצי" · unread: 0 · status: new
    9.  ChannelDot: whatsapp · Name: רותי פרץ            · preview: "כמה עולה Royal Canin Mini Junior?" · time: "לפני 3 שע׳" · unread: 0 · status: new
    10. ChannelDot: phone    · Name: עידן גולן           · preview: "מחיר Whiskas Adult 3.8kg לקופסאות" · time: "לפני 4 שע׳" · unread: 0 · status: new
    11. ChannelDot: whatsapp · Name: נטע אבני            · preview: "שלחתם כבר את ההזמנה שלי?" · time: "לפני 4 שע׳" · unread: 0 · status: processing
    12. ChannelDot: woo      · Name: אורית דוד           · preview: "הזמנה #WC-1047 — הומרה ל-#10251" · time: "לפני 5 שע׳" · unread: 0 · status: converted

  ► Footer of list:
    Empty-state button (dashed border, pill): "+ הוסף הזמנה ידנית" (icon: edit_note, 32px height, centered)

LEFT PANEL — Message Detail (flex: 1, display flex, flexDirection column)
Background: surface-container-lowest

  ► Detail Header (padding 20px 24px, borderBottom 1px outline-variant):
    Row: [Customer avatar (44px circle, gradient #38656A→#1B5E20, initials "דכ")] [Customer info column — flex:1] [Action buttons — inline-flex gap 8]

    Customer info column:
      Line 1: "דני כהן" (16px, 700) + VIP gold pill ("VIP", 10px, 700, gold bg rgba(245,158,11,0.15), color #A65F00, border 1px solid rgba(245,158,11,0.35), paddingInline 8)
      Line 2: "054-9231455 · כלב: רקס" (13px, on-surface-variant)
      Line 3: ChannelDot whatsapp (inline, 20px) + "הגיע דרך WhatsApp" (12px)

    Action buttons (inline-flex, gap 8, end-aligned in RTL):
      - IconButton: "phone" icon (label: "התקשר")
      - IconButton: "person_add" icon (label: "שייך לנציג") 
      - IconButton: "more_vert" icon (label: "עוד פעולות")

  ► DUPLICATE ALERT BANNER (just below header, full width):
    Use WARNING severity palette from DESIGN-SYSTEM:
      bg: --md-warning-container
      dot: --md-warning, label "אזהרה"
      icon: content_copy (20px, #A65F00)
      title: "נמצאה הזמנה דומה מ-40 דקות — WooCommerce #WC-1048"
      body: "אותו מספר טלפון שהגיש הזמנה ב-2 ערוצים שונים. האם לסמן האחת ככפולה?"
      CTA button: "סמן ככפולה" (bg #A65F00, white text, pill, 32px, icon: flag)
      Dismiss button (close icon, transparent, right-aligned)
    Padding: 14px 24px

  ► Order Summary Card (padding 16px 24px, borderBottom 1px outline-variant):
    Background: surface-container-low, no border-radius (full-width inset strip)
    Header row: "inbox" icon (16px, primary) + "הזמנה מפורטת" (13px, 600, primary) + "₪337" (14px, 700, on-surface, inline-end)
    Items list (gap 6, marginTop 8):
      Row: "Royal Canin Adult 4kg" · "×2" (num) · "₪298" (currency) [outlined]
      Row: "Whiskas Adult Tuna 400g" · "×1" (num) · "₪39" (currency) [outlined]
    Total row (marginTop 8, paddingTop 8, borderTop 1px outline-variant):
      "סה"כ" (13px, 500) · "₪337" (16px, 700, primary)

  ► Message Bubbles (flex: 1, overflowY: auto, padding 20px 24px, display flex, flexDirection column, gap 12):
    WhatsApp-style chat bubbles. RTL: customer bubbles RIGHT (start), store bubbles LEFT (end).

    Customer bubble (alignSelf: flex-start = RIGHT in RTL):
      Background: surface-container
      Border: 1px solid outline-variant
      BorderRadius: 4px 16px 16px 16px (right top flat = tail on right)
      Padding: 10px 14px
      Max-width: 70%
      Text: 14px, on-surface
      Time: 11px, on-surface-variant, displayed below text, dir=ltr

    Store bubble (alignSelf: flex-end = LEFT in RTL):
      Background: --md-primary-container
      BorderRadius: 16px 4px 16px 16px (left top flat = tail on left)
      Padding: 10px 14px
      Max-width: 70%

    Messages for selected conversation (דני כהן):
      1. Customer: "שלום, יש לכם Royal Canin Adult 4kg?" · time "09:42"
      2. Store:    "שלום דני! כן, יש לנו במלאי. המחיר ₪149 לשק." · time "09:43"
      3. Customer: "תזמינו לי 2 שקים בבקשה" · time "09:44"
      4. Customer: "תוסיפו גם קופסת Whiskas אם אפשר" · time "09:45"

    Date divider above messages: "יום שני, 19 במאי 2026" (12px, center, on-surface-variant, horizontal lines on both sides)

  ► Action Bar (padding 16px 24px, borderTop 1px outline-variant, background surface-container-low):
    display flex, justifyContent space-between, alignItems center

    RIGHT side (primary actions, RTL start):
      FilledButton filled icon="check" size=md: "המר להזמנה" (primary variant — green bg)
      FilledButton tonal icon="forum" size=md: "בקש הבהרה" (secondary-container bg)

    LEFT side (secondary actions, RTL end):
      FilledButton outlined icon="block" size=sm: "דחה הודעה" (outlined variant)
      FilledButton text icon="flag" size=sm: "סמן ככפולה" (text variant, error color — color: --md-error, border transparent)

============================================================
SPECIAL STATES SUMMARY
============================================================
1. Row 1 (דני כהן): selected (secondary-container bg), VIP star icon, unread badge 2
2. Rows 5, 7: warning state — inline-start border 3px warning color, light warning bg, schedule icon in preview
3. Duplicate alert banner: visible in detail panel (warning severity)
4. Row 12 (אורית דוד): status chip "הומר" (tonal-tertiary), no unread badge
5. Filter tab "הכל" is active (secondary-container pill)
6. Nav badge on "אינבוקס": 12

============================================================
REALISTIC HEBREW SAMPLE DATA
============================================================
Store name: "חיות הבית של אבי"
Date in TopBar: "יום שני, 19 במאי 2026"
Customer names (Israeli): דני כהן, מיכל לוי, יוסי אברהמי, שירה רוזן, אורי דהן, תמר בן-עמי, אבי שטרן, נועם ברק, רותי פרץ, עידן גולן, נטע אבני, אורית דוד
Pet names: רקס (כלב), לונה (חתול), בלקי (כלב), מילו (חתול), גוגו (כלב), נלה (כלב), צ׳רלי (כלב), לוקי (כלב), שוקו (חתול), בני (כלב), פיצי (חתול), בובו (כלב)
Brands used: Royal Canin, Hill's Science Plan, Acana Pacifica, Pro Plan, Whiskas, Orijen, Bonzo
Price range: ₪39–₪489
Relative timestamps in Hebrew: "לפני 4 דק׳", "לפני 12 דק׳", "לפני 18 דק׳", "לפני 35 דק׳", "לפני שעה", "לפני שעה וחצי", "לפני שעתיים ו-12 דק׳", "לפני שעתיים ו-34 דק׳", "לפני 3 שע׳", "לפני 4 שע׳", "לפני 5 שע׳"
