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
- `designs/customer-sheet/MasterPet Customer Sheet.html` — same <head>/<style> block as dashboard
- `designs/customer-sheet/main.jsx` — App + sections specific to this screen
- `designs/customer-sheet/data.jsx` — navItems (same order!) + realistic Hebrew sample data
- `designs/customer-sheet/parts.jsx` — COPY VERBATIM from dashboard-branch/parts.jsx

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
Screen name: customer-sheet
Hebrew title: Sheet לקוח — הוספה ועריכה
Active nav item: לקוחות (group)
Role: Business Owner (owner) / Branch Manager

The 3-second test — what must the user understand within 3 seconds?
1. האם אני מוסיף לקוח חדש או עורך קיים?
2. אילו שדות הם חובה ואילו אופציונליים?
3. מה ערוץ התקשורת המועדף של הלקוח?

============================================================
LAYOUT — SHEET OVER DIMMED BACKGROUND
============================================================
The full screen shows:
  - LEFT area (behind sheet): customers-list page DIMMED — apply
    rgba(0,0,0,0.35) overlay over the blurred list content.
    Show only the shell (nav rail + top bar) and a ghosted KPI strip + table
    through the dim. Do NOT render full list detail — it's just background context.
  - RIGHT side: Sheet panel, fixed, 680px wide, full viewport height,
    bg surface-container-lowest (#FFFFFF), shadow-3 on the left edge (RTL: insetInlineStart),
    slides in from right (RTL direction).

DRAW THE SCREEN IN **EDIT MODE** as the main/primary design
(title "עריכת רחל כהן", pre-filled data, button "עדכן לקוח").

Then draw **CREATE MODE** as a labeled annotation variant below,
inside a dashed-border annotation card with label "[מצב יצירה — לקוח חדש]"
(title "לקוח חדש", all fields empty, button "שמור לקוח").

============================================================
SHEET STRUCTURE (EDIT MODE — primary)
============================================================

SHEET HEADER (sticky, bg surface-container-low, border-bottom 1px outline-variant):
  height: 64px, padding: 0 24px
  RIGHT (RTL start):
    IconButton close (close, 24px, outlined) — closes the sheet
    Divider vertical 1px outline-variant
    Breadcrumb: "לקוחות" (12px, on-surface-variant, clickable) >
                "רחל כהן" (12px, on-surface, 500, current page)
  LEFT (RTL end):
    Title: "עריכת רחל כהן" (16px, 700, on-surface)

SHEET BODY (scrollable, padding 24px):
  Vertical flex, gap 24px. Fields grouped in logical sections.

  --- GROUP 1: פרטי קשר ---
  Section label: "פרטי קשר" (11px, 600, uppercase, letter-spacing 0.6, on-surface-variant)
  Separator line below label (1px, outline-variant)

  FIELD: שם מלא *
    label: "שם מלא" + red asterisk (error color, 12px)
    input: pre-filled "רחל כהן" (14px, on-surface)
    height 44px, border-radius 8px, border 1px outline-variant, padding 0 12px
    focus: border 2px primary

  FIELD: טלפון *
    label: "טלפון" + red asterisk
    input: "052-111-2233" (14px, LTR direction for the number, class="num")
    RTL note: label on right, input content is LTR-isolated (number stays left-to-right)
    placeholder (empty): "05X-XXX-XXXX"
    hint text below: "מספר הטלפון ייחודי לכל לקוח בעסק" (11px, on-surface-variant)

    SHOW VALIDATION ERROR STATE on this field (the primary error to display):
      border: 2px solid var(--md-error)
      bg: rgba(179,38,30,0.04)
      Error message below input: icon "error" (14px, error) + "מספר הטלפון כבר רשום ללקוח אחר"
        (12px, error color)

  FIELD: אימייל
    label: "אימייל" (no asterisk = optional)
    input: "rachel.cohen@gmail.com" (14px)

  --- GROUP 2: כתובת ---
  Section label: "כתובת" (11px, 600, uppercase, letter-spacing 0.6)

  FIELD: כתובת
    label: "כתובת"
    input: "רחוב הרצל 14, דירה 3" (14px)
    placeholder: "רחוב, מספר בית, דירה"

  FIELD: עיר
    label: "עיר"
    input: "תל אביב" (14px)
    placeholder: "שם העיר"
    width: 50% of body width (inline next to another field if desired)

  --- GROUP 3: העדפות ---
  Section label: "העדפות" (11px, 600, uppercase, letter-spacing 0.6)

  FIELD: ערוץ מועדף *
    label: "ערוץ מועדף לתקשורת" + red asterisk
    Three-button toggle group (pill shape, height 40px, full row width):
      Each button = ChannelDot icon (20px) + channel label
      OPTION 1 — "WhatsApp" (SELECTED/ACTIVE):
        bg: secondary-container, color: on-secondary-container
        ChannelDot whatsapp (20px), label "WhatsApp" (14px, 500)
        border-radius: 999 8 8 999 (RTL: right side rounded fully, left squared)
      OPTION 2 — "טלפון" (inactive):
        bg: surface-container, color: on-surface-variant
        icon: call (20px, on-surface-variant), label "טלפון"
        border: 1px outline-variant
      OPTION 3 — "אימייל" (inactive):
        bg: surface-container, color: on-surface-variant
        icon: mail (20px, on-surface-variant), label "אימייל"
        border-radius: 8 999 999 8 (RTL: left side rounded fully)

  FIELD: סניף משויך
    label: "סניף משויך"
    Select dropdown trigger: "סניף ראשי" (14px, on-surface) + expand_more icon
    height 44px, border 1px outline-variant, border-radius 8px
    hint: "הסניף שאחראי על לקוח זה" (11px, on-surface-variant)

  FIELD: הערות
    label: "הערות"
    Textarea, height 80px, border 1px outline-variant, border-radius 8px, padding 10px 12px
    content: "לקוחה קבועה. רוכשת בעיקר מזון לחתול. מעדיפה מסירה עצמית."
    placeholder (empty): "הערות חופשיות על הלקוח, העדפות, מידע רלוונטי..."

  --- GROUP 4: סטטוס ---
  Section label: "סטטוס" (11px, 600, uppercase, letter-spacing 0.6)

  FIELD: סטטוס לקוח
    Two-option toggle (not radio — pill buttons):
      "פעיל" (SELECTED): bg primary-container, color on-primary-container, icon check_circle 16px
      "לא פעיל" (inactive): bg surface-container, color on-surface-variant, icon cancel 16px

SHEET FOOTER (sticky, bg surface-container-low, border-top 1px outline-variant):
  height: 64px, padding: 0 24px
  RIGHT (RTL start — secondary action):
    FilledButton "ביטול" (text variant, no bg, color on-surface-variant)
  LEFT (RTL end — primary action):
    FilledButton "עדכן לקוח" (filled variant, primary, icon: check, size md)

============================================================
ANNOTATION: CREATE MODE VARIANT
============================================================
Below the main sheet design, draw a labeled annotation block:
"[מצב יצירה — לקוח חדש]"

Show just the HEADER + first 2 fields + footer — enough to illustrate the differences:
  HEADER: title "לקוח חדש" (no breadcrumb path, just title)
           close button remains
  All inputs: EMPTY (show placeholders)
  Phone field: NO error state — just the hint text below
  FOOTER: button text changes to "שמור לקוח" (same filled primary style)

============================================================
REALISTIC HEBREW SAMPLE DATA (edit mode — רחל כהן)
============================================================
Customer: רחל כהן
Phone: 052-111-2233 (shown with error state — duplicate phone)
Email: rachel.cohen@gmail.com
Address: רחוב הרצל 14, דירה 3
City: תל אביב
Preferred channel: WhatsApp (selected)
Branch: סניף ראשי
Notes: לקוחה קבועה. רוכשת בעיקר מזון לחתול. מעדיפה מסירה עצמית.
Status: פעיל

Branches available in Select dropdown:
  סניף ראשי (selected), סניף דרום, סניף צפון
