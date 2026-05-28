# Decisions Log — MasterPet

> תיעוד החלטות אסטרטגיות שעלו במהלך כתיבת PRDs. כל entry = 3 שאלות challenger + תשובות + תאריך.
> **כלל:** אסור "ככה החלטנו" — חייב נימוק. אם שאלה חזרה בסבב אחר, מסמנים שכבר נענתה.

---

## תוכן עניינים

- [PRD #3 — Products (קטלוג מוצרים)](#prd-3--products)
- [PRD #4 — CSV/Excel Import Engine](#prd-4--csv-import)
- [PRD #5 — Customers (לקוחות)](#prd-5--customers)
- [PRD #6 — Orders Management + Subscriptions](#prd-6--orders)

---

## PRD #3 — Products

**תאריך החלטות:** 2026-05-20 (תועד retroactively ב-2026-05-26)
**status:** done

### שאלה 1 (קטגוריה A — האם זה MVP?) — Hybrid Taxonomy

**השאלה:** למה גם קטגוריות קבועות (`animal_type`, `age_group`, `diet_type`) **וגם** tags חופשיים? למה לא רק tags?

**התשובה (ירין):** הקטגוריות הקבועות נדרשות ל-filtering מהיר ול-reports (KPI לפי animal_type). Tags חופשיים הם ל-marketing/inventory tagging. שני שימושים שונים, לא חפיפה.

**Trade-off שנדחה:** לוותר על קטגוריות קבועות → אובדן יכולת filtering structured + KPIs חיוניים.

**flag לסקירה בעוד 6 חודשים:** האם משתמשים בפועל ב-tags? אם < 20% מהמוצרים תויגו → לבטל את ה-tags.

---

### שאלה 2 (קטגוריה B — מה אם המודל ישתנה?) — VAT 18% Hard-coded

**השאלה:** VAT 18% hard-coded על variants. מה אם תרצה להציע ב-USA או באירופה? Tax Engine עכשיו, או refactor כואב בעוד 8 חודשים?

**התשובה (ירין):** MVP = ישראל בלבד. Tax Engine מוקדם מדי. בעוד יש tax field per variant — לא קבוע ב-code, רק default ל-18.

**Trade-off שנדחה:** Tax Engine עם tax_rules table → 5 ימי פיתוח נוספים ב-MVP, לא מצדיק כשאין לקוח US.

**flag לסקירה בעוד 6 חודשים:** אם יש pipeline לקוח B2B מחו"ל → לבנות Tax Engine לפני ה-deal, לא אחרי.

---

### שאלה 3 (קטגוריה C — מי באמת ישתמש?) — cost_price hiding ברמת SELECT

**השאלה:** הסתרת `cost_price` מ-non-owners ברמת SELECT (לא post-filter). יש use-case אמיתי שעובד shipping צריך לראות מוצר *בלי* מחיר עלות? או שזה bureaucracy?

**התשובה (ירין):** Owner-only. הגנה מפני delivery worker → screenshot של מחירי עלות → מתחרה. לא bureaucracy — חוק עסקי.

**Trade-off שנדחה:** RLS על column-level (Postgres אין native) → לפצל לטבלה נפרדת או לעשות post-filter ב-app. שתי האופציות חלשות יותר. SELECT-level הוא הכי clean.

**flag לסקירה:** אם owner מתלונן ש-non-owner אומר "אני לא רואה מחיר" → ייתכן רגרסיה ב-RLS.

---

## PRD #4 — CSV Import

**תאריך החלטות:** 2026-05-25 (תועד retroactively ב-2026-05-26)
**status:** done

### שאלה 1 (קטגוריה A) — Generic Engine vs Per-Table Importer

**השאלה:** מנגנון Import גנרי לכל הטבלאות = 8 ימי פיתוח. Per-table importers = 2-3 ימים לטבלה. למה גנרי ב-MVP?

**התשובה (ירין):** יהיו 4-5 טבלאות שצריכות import (products, customers, orders, suppliers, inventory). 5 × 3 ימים = 15 ימים. גנרי = 8. ROI ברור.

**Trade-off שנדחה:** Per-table → הרבה duplication, schema drift בין importers, UI לא עקבית.

---

### שאלה 2 (קטגוריה B) — Conflict Strategy (skip/merge/replace)

**השאלה:** 3 אופציות לטיפול בכפילויות. מה אם המודל ישתנה ויהיו 5 אופציות (custom merge rules per-column)?

**התשובה (ירין):** השלוש האלה מכסות 95% מהמקרים. אם מישהו ירצה custom merge → fallback ל-export + edit + re-import. לא מצדיק UI מורכב ב-MVP.

**flag:** אם 3+ לקוחות מבקשים "merge רק עמודה X" → לבנות UI לconflict rules per-column.

---

### שאלה 3 (קטגוריה C) — DuplicateDialog בתוך הקובץ

**השאלה:** intra-file duplicates זה edge case אמיתי? כמה לקוחות באמת מעלים קובץ עם כפילויות?

**התשובה (ירין):** כן. Excel exports מ-POS ישנים מכילים כפילויות. בלי DuplicateDialog → row אחד "מנצח" שקט בלי שהמשתמש יודע.

**Trade-off שנדחה:** לדחות לכפילויות vs DB → המשתמש מקבל שגיאה אחרי 5 דקות של import. UX גרוע.

---

## PRD #5 — Customers

**תאריך החלטות:** 2026-05-26 (תועד retroactively)
**status:** done

### שאלה 1 (קטגוריה A) — Pet Profile כטבלה נפרדת

**השאלה:** למה pets בטבלה נפרדת מ-customers? למה לא JSONB column על customers?

**התשובה (ירין):** Pet-centric features עתידיים (vaccination reminders, dietary plans) דורשים pets כישות first-class. JSONB יחסום אותם.

**Trade-off שנדחה:** JSONB → מהיר ב-MVP אבל refactor כואב כשנכניס pet features.

---

### שאלה 2 (קטגוריה B) — Phone number כ-VARCHAR

**השאלה:** Phone כ-VARCHAR(20). מה אם תוסיף לקוחות בינלאומיים?

**התשובה (ירין):** MVP = ישראל. Format לא קבוע — VARCHAR מאפשר "050-1234567" / "+972501234567" / "0501234567". E.164 normalization יקרה ב-app layer.

**flag:** אם נוסיף international → להוסיף `phone_e164` field נורמליזציה.

---

### שאלה 3 (קטגוריה C) — 3,097 שורות seed data

**השאלה:** למה seed 3,097 לקוחות לפני שיש לקוח אמיתי?

**התשובה (ירין):** Demo data לפגישות מכירה + load testing על RLS. בלי 3K rows אי-אפשר לדעת אם listCustomersAction מהיר.

---

## PRD #6 — Orders

**תאריך החלטות:** 2026-05-26
**status:** done

### שאלה 1 (קטגוריה A) — Subscriptions כטבלה נפרדת

**השאלה:** למה subscriptions טבלה נפרדת ולא flag על orders (`is_subscription` + `recurring_interval`)?

**התשובה (ירין):** Subscription = template, Order = instance. אותו subscription יוצר N orders. Flag על orders יחייב duplication של template fields על כל order. נורמליזציה נכונה.

**Trade-off שנדחה:** Flag-based → פשוט יותר ב-MVP אבל קשה לעשות "edit subscription template" בלי לערוך כל order ID.

---

### שאלה 2 (קטגוריה B) — PayPlus Mock Mode מההתחלה

**השאלה:** למה ל-deploy `fn-payplus-create-link` עם mock-mode במקום לחכות ל-credentials אמיתיים?

**התשובה (ירין):** Demo לפגישות עסקיות + לבדוק את ה-flow end-to-end לפני שמשלמים ל-PayPlus. כל tenant יחבר את חשבונו דרך מסך הגדרות (PRD עתידי).

**flag:** לפני production go-live → לוודא ש-mock-mode נסגר ושיש tenant_integrations table.

---

### שאלה 3 (קטגוריה C) — Status transitions חד-כיווניות

**השאלה:** `ORDER_STATUS_TRANSITIONS` חוסם החזרה מ-`in_transit` ל-`preparing`. יש לקוח אמיתי שיגיד "טעיתי, החזר ל-preparing"?

**התשובה (ירין):** כן ייתכן, אבל זה דרך `cancelOrderAction` + יצירת order חדש. חד-כיווני שומר על audit trail נקי. Backwards transitions שוברים reports.

**Trade-off שנדחה:** Free transitions → גמיש יותר, אבל מקשה על KPI ("ממוצע זמן ל-delivered" חסר משמעות אם orders חוזרים אחורה).

---

## פורמט לכל entry חדש

```markdown
## PRD #N — [שם]

**תאריך החלטות:** YYYY-MM-DD
**status:** draft | approved | done

### שאלה 1 (קטגוריה A — האם זה MVP?) — [נושא]

**השאלה:** [שאלה ספציפית של challenger]

**התשובה (ירין):** [התשובה האמיתית]

**Trade-off שנדחה:** [אופציה אלטרנטיבית + למה לא]

**flag לסקירה בעוד X חודשים:** [תנאי לחזרה לדיון] (אופציונלי)

### שאלה 2 (קטגוריה B — מה אם המודל ישתנה?) — [נושא]
...

### שאלה 3 (קטגוריה C — מי באמת ישתמש?) — [נושא]
...
```

---

**אחזקה:** `challenger.md` מעדכן את הקובץ הזה אוטומטית בכל PRD חדש שעובר אתגור. ירין מאשר את התשובות לפני שה-PRD יוצא ל-product-manager.
