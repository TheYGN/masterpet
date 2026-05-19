# MasterPet — תבנית פרומפט למסכים חדשים

מסמך הזה נותן לך **שלד פרומפט קבוע** שמבטיח שכל מסך חדש שתבקש יישאר נאמן ל-DNA שנקבע ב-`DESIGN-SYSTEM.md` ולקו של מסך הדשבורד הקיים.

---

## איך להשתמש

1. העתק את **חלק A** (Static block — קבוע, לא משנים) כמו שהוא.
2. ערוך את **חלק B** (Variable block — מה מיוחד למסך הזה).
3. צרף את הסקילים: **Hi-fi design**, **Interactive prototype**, **Design System**.
4. שלח.

---

## חלק A — Static block (העתק כמו שהוא, לכל מסך)

```
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
- `designs/<screen-slug>/MasterPet <ScreenName>.html` — same <head>/<style> block as dashboard
- `designs/<screen-slug>/main.jsx` — App + sections specific to this screen
- `designs/<screen-slug>/data.jsx` — navItems (same order!) + realistic Hebrew sample data
- `designs/<screen-slug>/parts.jsx` — COPY VERBATIM from dashboard-branch/parts.jsx
- `designs/<screen-slug>/chart.jsx` — only if this screen has charts

The active nav item on the rail must be the one matching this screen (not "דשבורד").

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
```

---

## חלק B — Variable block (אתה ממלא לכל מסך מחדש)

```
============================================================
THIS SCREEN
============================================================
Screen name: <slug, e.g., order-inbox>
Hebrew title: <e.g., אינבוקס הזמנות>
Active nav item: <e.g., inbox>
Role: <e.g., Business Owner | Sales Rep | Picker>

The 3-second test — what must the user understand within 3 seconds?
1. <...>
2. <...>
3. <...>

Sections (top to bottom, RTL):

Section 1 — <name>
<describe layout, contents, exact MD3 components, data structure>

Section 2 — <name>
<...>

(continue for each section)

Special states / interactions to show:
- <e.g., hover on an order row reveals quick actions>
- <e.g., one item in "Error" severity and one in "Warning">
- <e.g., empty state for the second tab>

Realistic Hebrew sample data:
- <names of customers — Israeli first names>
- <pet names>
- <product brands — Royal Canin, Hill's, Acana, Pro Plan, Whiskas, Orijen, Bonzo>
- <realistic ₪ ranges per order: ₪80-600>
- <relative time stamps in Hebrew: "לפני 4 דק׳", "לפני שעה", "לפני 3 שע׳">
```

---

## דוגמה: איך יראה פרומפט מלא ל"אינבוקס הזמנות"

```
[Static block from חלק A — verbatim]

============================================================
THIS SCREEN
============================================================
Screen name: order-inbox
Hebrew title: אינבוקס הזמנות
Active nav item: inbox
Role: Business Owner

The 3-second test:
1. כמה הזמנות חדשות חיכו לי מאז שיצאתי מהמסך הקודם?
2. איזה הזמנה דורשת תגובה דחופה (מעל שעתיים, לקוח VIP, וכו׳)?
3. מאיזה ערוץ הגיע רוב הלחץ עכשיו?

Section 1 — KPI strip (4 tiles):
- "בהמתנה לאישור" (hero, big number, CTA "אשר את הבאות")
- "ממתינות מעל שעתיים" (warning color)
- "WhatsApp פתוחות" (channel-tinted)
- "טלפון פתוחות" (channel-tinted)

Section 2 — Split view (50/50)
LEFT: Threaded conversation list (WhatsApp-style preview, last message snippet,
unread count badge, channel dot, time, urgency dot).
RIGHT: Selected conversation detail — message bubbles in chronological order,
order summary card on top (product, qty, ₪), action buttons row at bottom
(אשר הזמנה / בקש הבהרה / השב ידנית).

Section 3 — Filter/sort bar above the list:
chips: הכל / חדשות / לא נענו / VIP, sort dropdown: "לפי דחיפות" / "לפי זמן".

Special states:
- One thread marked as VIP (gold dot accent)
- One thread in "ממתין מעל שעתיים" warning state (warning border)
- Selected thread shown expanded on the right
- Empty state for the "VIP" filter if no matches

Sample data:
- 12 conversations, mix of WhatsApp (8), phone (3), WooCommerce (1)
- Last messages in natural Hebrew: "האם יש 4kg של רויאל קנין?",
  "תודה, מתי יישלח?", "החתול לא אוכל מהשק הזה"
- ₪ range: ₪95-520
```

---

## איך אני (Claude) אקבל את הפרומפט הזה ואעבוד

כשתשלח לי פרומפט שמתחיל ב-"You are designing a screen for MasterPet" + Static block:
1. אקרא את `designs/DESIGN-SYSTEM.md` כדי לוודא שאני עדיין מסונכרן.
2. אסתכל על `designs/dashboard-branch/` כרפרנס ויזואלי.
3. אבנה את התיקייה החדשה תחת `designs/<slug>/`.
4. אעתיק `parts.jsx` ו-`<style>` ה-HTML **בייט-לבייט** מהדשבורד.
5. אכתוב רק `main.jsx`, `data.jsx`, ו-`chart.jsx` אם צריך.
6. ב-`data.jsx` — `navItems` תמיד באותו סדר, רק ה-active משתנה.
