# MasterPet — Design System

**Source of truth** לעיצוב כל מסך בפלטפורמה. כל פרומפט עיצוב חדש מתייחס לקובץ הזה.

המקור המומחש: `designs/dashboard-branch/` (הדשבורד הראשון של Business Owner). כל מסך חדש חייב להישאר נאמן ל-DNA העיצובי שנקבע שם — אותם tokens, אותם רכיבים, אותו ריתמוס, אותם דפוסי RTL.

---

## 1. DNA — מה לא משתנה לעולם

| נושא | החלטה |
|---|---|
| **Design Language** | Material Design 3 (MD3) — color system, elevation, motion, component naming |
| **Seed color** | `#1B5E20` (deep forest green — צבע המותג של דומיין מזון לחיות) |
| **Direction** | RTL מלא (עברית). Navigation rail מימין, reading flow ימין→שמאל, חיצים מתהפכים |
| **Framework** | Next.js 14 App Router + React 18 |
| **UI Library** | shadcn/ui |
| **Styling** | Tailwind CSS — כל token ממופה ל-class |
| **Typography** | Heebo (Hebrew, primary) + Roboto (fallback), Material Symbols Outlined לאייקונים |
| **Icons** | Material Symbols Outlined בלבד. **אין** emojis, **אין** Heuroicons, **אין** Lucide |
| **Numbers** | Western Arabic (0-9), LTR isolated, tabular-nums. מטבע: `₪` לפני המספר (`₪12,450`) |
| **Mode** | Light mode בלבד ל-MVP |
| **Width** | Desktop 1440px (responsive scaling יבוא בהמשך) |

---

## 2. Color Tokens (MD3, light, seed #1B5E20)

```css
:root {
  /* Primary — מותג */
  --md-primary: #1B5E20;
  --md-on-primary: #FFFFFF;
  --md-primary-container: #B7F0BB;
  --md-on-primary-container: #002106;

  /* Secondary — תמיכה, סטטוסים "בטיפול" */
  --md-secondary: #52634F;
  --md-on-secondary: #FFFFFF;
  --md-secondary-container: #D5E8CF;
  --md-on-secondary-container: #101F10;

  /* Tertiary — accent, סטטוסים "נשלח", סדרות "דיגיטליות" */
  --md-tertiary: #38656A;
  --md-on-tertiary: #FFFFFF;
  --md-tertiary-container: #BCEBF1;
  --md-on-tertiary-container: #002022;

  /* Error — דחוף, ביטולים */
  --md-error: #B3261E;
  --md-on-error: #FFFFFF;
  --md-error-container: #F9DEDC;
  --md-on-error-container: #410E0B;

  /* Warning — לא סטנדרטי MD3, מוגדר ל-MasterPet */
  --md-warning: #F59E0B;
  --md-on-warning: #FFFFFF;
  --md-warning-container: #FEF3C7;
  --md-on-warning-container: #4A2F00;

  /* Surfaces — רמות elevation (tonal, לא drop-shadow) */
  --md-surface: #FAFAFA;
  --md-surface-dim: #DBDFD7;
  --md-surface-bright: #FAFDF5;
  --md-surface-container-lowest: #FFFFFF;
  --md-surface-container-low: #F5F7F1;    /* כרטיסים סטנדרטיים */
  --md-surface-container: #EFF2EC;        /* search bar, segmented */
  --md-surface-container-high: #E9ECE6;   /* hover, dropdowns */
  --md-surface-container-highest: #E4E7E1;

  --md-on-surface: #191D17;
  --md-on-surface-variant: #43483F;
  --md-outline: #73796F;
  --md-outline-variant: #C3C8BC;          /* borders של כרטיסים */
  --md-inverse-surface: #2E3129;          /* tooltips */
  --md-inverse-on-surface: #F0F1EA;

  /* Shadows — שמורות ל-hover / modal בלבד. ברירת מחדל: tonal surface */
  --shadow-1: 0 1px 2px 0 rgba(0,0,0,0.04), 0 1px 3px 1px rgba(0,0,0,0.04);
  --shadow-2: 0 1px 2px 0 rgba(0,0,0,0.06), 0 2px 6px 2px rgba(0,0,0,0.06);
  --shadow-3: 0 4px 8px 0 rgba(0,0,0,0.08), 0 8px 24px 4px rgba(0,0,0,0.06);
}
```

**כלל זהב:** elevation מושג ע״י **tonal surfaces** (`surface-container-low/med/high`), **לא** drop shadows. shadows שמורות ל-hover, dropdown ומודאל בלבד.

---

## 3. Typography

```css
body {
  font-family: 'Heebo', 'Roboto', system-ui, -apple-system, sans-serif;
  font-feature-settings: "ss01" on, "cv11" on;
  line-height: 1.6;  /* מינימום לעברית */
}
```

| תפקיד | גודל | משקל | line-height |
|---|---|---|---|
| Display (greeting "בוקר טוב, אבי") | 28px | 700 | 1.3 |
| H2 כרטיס ("הזמנות אחרונות") | 18px | 700 | 1.4 |
| KPI value | 36px | 700, letter-spacing: -0.5 | 1.1 |
| Body | 14px | 400-500 | 1.6 |
| Meta / sub | 12-13px | 400 | 1.45 |
| Caption / label | 11px | 600, letter-spacing: 0.4, uppercase | 1.2 |
| Status chip | 12px | 500, letter-spacing: 0.1 | 1.2 |

**מספרים** — תמיד עם class `num` (LTR isolated + tabular-nums). **מטבע** — תמיד עם class `currency` (LTR isolated, `₪` לפני המספר).

---

## 4. Spacing & Geometry

- **Grid:** 8px
- **Card padding:** 24px (חוץ מ-KPI tile = 20px, AlertCard = 14px)
- **Section gap:** 32px
- **Card gap בתוך section:** 16px
- **Border radius:**
  - Pill / button / chip: `999px`
  - Card: `16px`
  - Status chip מלבני: `8px`
  - Mini badge / counter: `6-8px`
  - Avatar / dot: `50%`
- **Card border:** `1px solid var(--md-outline-variant)` תמיד.

---

## 5. רכיבים מובנים (משותפים, ב-`parts.jsx`)

הרכיבים הבאים נבנו פעם אחת ועוברים `Object.assign(window, ...)`. **כל מסך חדש חייב להשתמש בהם** ולא לכתוב גרסאות מקבילות.

### `<StatusChip kind={kind}>` 
4 גרסאות MD3:
- `filled-primary` — חדש / פעולה ראשית
- `tonal-secondary` — בטיפול / משני
- `tonal-tertiary` — נשלח / accent
- `outlined` — הושלם / muted

### `<IconButton icon label badge size filled>`
כפתור אייקון עגול, עם state layer ב-hover, badge אופציונלי בפינה (RTL: `insetInlineEnd`).

### `<FilledButton icon variant size>`
5 variants: `filled` (primary), `tonal`, `outlined`, `text`, `error`. 2 sizes: `sm` (32px), `md` (40px). תמיד pill (`borderRadius: 999`).

### `<Card padding elevation>`
elevation 0-3 ממופה ל-`surface-container-{lowest/low/-/high}`. ברירת מחדל: 1.

### `<Sparkline data width height color>`
SVG עם gradient fill + נקודה אחרונה מובלטת. ברירת מחדל: `var(--md-primary)`.

### `<ChannelDot channel>`
ribbon מרובע 28×28 עם רקע שקוף (12% מהצבע) + אייקון בצבע מלא. ערוצים מוגדרים ב-`channelMap`:
- `whatsapp` → `#25D366`, icon `chat`
- `phone` → `#52634F`, icon `call`
- `woo` → `#7F54B3`, icon `shopping_cart`

### `<NavItem item active hover onSelect>`
פריט ברייל ניווט — pill 56×32 ל-active, אייקון ממולא (FILL 1) ב-active, label 12px מתחת. badge בפינה.

---

## 6. דפוסי RTL

| כלל | יישום |
|---|---|
| Navigation rail | מימין (`flexDirection: 'row-reverse'` ב-shell) |
| Reading flow | ימין → שמאל בכל row |
| חיצים directional | `.ms-flip-rtl` (transform scaleX(-1)). חץ "אחורה" → `arrow_back` שמתהפך → מצביע ימין |
| Timestamps | משמאל (משני ב-RTL) |
| Primary CTA | מימין בכל row |
| Padding | תמיד `padding-inline-start/-end`, לא `padding-left/-right` |
| Borders | `borderInlineStart/-End` |
| Insets | `insetInlineStart/-End` (חשוב לבאדג'ים) |
| מספרים בתוך עברית | תמיד `<span className="num">` כדי שלא יתהפכו |

---

## 7. Iconography

- **רק** Material Symbols Outlined.
- ברירת מחדל: `FILL 0, wght 400`.
- אייקון של פריט active: `FILL 1, wght 500`.
- אייקון של ערוץ (ChannelDot) / KPI hero: `FILL 1, wght 500`.
- גדלים סטנדרטיים: 14 / 16 / 18 / 20 / 22 / 24 (KPI badge: 18).

**אייקונים שכבר בשימוש:**
| תחום | אייקון |
|---|---|
| Pets / חיה | `pets`, `pet_supplies` |
| Orders | `receipt_long`, `inbox` |
| Inventory | `inventory_2` |
| CRM | `group` |
| Loyalty | `loyalty` |
| Automations | `bolt` |
| Settings | `settings` |
| Dashboard | `space_dashboard` |
| Money | `payments` |
| Shipping | `local_shipping` |
| WhatsApp | `chat` |
| Phone | `call` |
| WooCommerce | `shopping_cart` |
| Trend | `trending_up`, `trending_down` |
| Alert (error) | אייקון תחום + dot אדום |
| Alert (warning) | אייקון תחום + dot כתום |
| Approve | `check` |
| Send msg | `send`, `forum` |

---

## 8. Motion

| אינטראקציה | duration | easing |
|---|---|---|
| Hover (background) | 100-160ms | `ease` |
| State layer ripple | 120ms | `ease` |
| Tab transition | 120ms | `ease` |

ללא splash animations, ללא bouncy easing. הכל עדין ופונקציונלי.

---

## 9. Hero metric — איך מסמנים "המטריקה הכי חשובה במסך"

הדשבורד הגדיר דפוס שיש לחזור עליו במסכים נוספים שיש בהם metric "killer":

```jsx
// gradient ירוק עמוק + watermark + תווית HERO + CTA לבן עם accent ירוק
background: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 55%, #38656A 100%)';
color: 'var(--md-on-primary)';
boxShadow: '0 1px 3px rgba(27,94,32,0.20), 0 8px 24px -8px rgba(27,94,32,0.35)';
// + radial watermark בפינה
// + תווית HERO uppercase pill לבן שקוף
// + CTA pill לבן עם טקסט primary
```

יש להשתמש בו **רק** ל-1 metric למסך. אם אין hero — אל תייצר.

---

## 10. Severity palette ל-alerts / banners

תמיד באותם 2 רמות:

**Error (דחוף):**
- bg: `--md-error-container`
- dot/title: `--md-error`
- icon bg: `rgba(179, 38, 30, 0.10)`
- body: `rgba(65, 14, 11, 0.78)`
- CTA: bg `--md-error`, color `#fff`
- label uppercase: "דחוף"

**Warning (אזהרה):**
- bg: `--md-warning-container`
- dot: `--md-warning`
- icon color: `#A65F00`
- body: `rgba(74, 47, 0, 0.78)`
- CTA: bg `#A65F00`, color `#fff`
- label uppercase: "אזהרה"

---

## 11. מבנה קבצים של מסך

Claude Design מייצא **ZIP** שמוחלץ ל-`designs/MasterPet/` — תיקייה אחת שמחליפה את עצמה בשלמות בכל עדכון:

```
designs/
├── DESIGN-SYSTEM.md           ← הקובץ הזה
├── PROMPT-TEMPLATE.md         ← תבנית פרומפט
├── dashboard-branch/          ← גרסה ישנה, שמורה כ-reference בלבד
├── <slug>/                    ← תיקיות PROMPT.md בלבד (ללא קבצי עיצוב)
│   ├── README.md
│   └── PROMPT.md
└── MasterPet/                 ← ✅ source of truth לכל העיצובים (Claude Design)
    ├── MasterPet Dashboard.html
    ├── parts.jsx
    ├── main.jsx
    ├── data.jsx
    ├── chart.jsx
    └── designs/
        ├── order-inbox/
        │   ├── MasterPet Order Inbox.html
        │   ├── parts.jsx
        │   ├── main.jsx
        │   └── data.jsx
        └── <slug>/
            └── ...
```

**כתובות קבצים:**
- דשבורד: `designs/MasterPet/MasterPet Dashboard.html`
- מסך X: `designs/MasterPet/designs/<slug>/MasterPet <Name>.html`

**עדכון עיצוב:** המשתמש מחלץ ZIP חדש מ-Claude Design → `designs/MasterPet/` מוחלפת בשלמות. אין צורך לסדר ידנית.

**סוכנים שמממשים UI:** קוראים את קובץ ה-HTML + JSX של המסך הרלוונטי מתוך `designs/MasterPet/`.

---

## 12. מה לעולם לא לעשות

- אין emoji בשום מקום בממשק
- אין אנגלית בטקסטים מול המשתמש (שמות מותגים בלבד: WhatsApp, WooCommerce, Royal Canin וכו׳)
- אין Lorem Ipsum — תמיד דאטה עברית ריאליסטית של עסק קטן-בינוני ישראלי למזון לחיות
- אין dark mode עדיין
- אין widgets ניתנים להזזה (פאזה 2)
- אין צבעים מחוץ ל-palette
- אין drop shadow על כרטיסים (רק tonal)
- אין fonts אחרים
- אין Heroicons / Lucide / FontAwesome
