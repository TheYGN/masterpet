# Decisions Log — MasterPet

> תיעוד החלטות אסטרטגיות שעלו במהלך כתיבת PRDs. כל entry = 3 שאלות challenger + תשובות + תאריך.
> **כלל:** אסור "ככה החלטנו" — חייב נימוק. אם שאלה חזרה בסבב אחר, מסמנים שכבר נענתה.

---

## תוכן עניינים

- [PRD #3 — Products (קטלוג מוצרים)](#prd-3--products)
- [PRD #4 — CSV/Excel Import Engine](#prd-4--csv-import)
- [PRD #5 — Customers (לקוחות)](#prd-5--customers)
- [PRD #6 — Orders Management + Subscriptions](#prd-6--orders)
- [PRD #19a — Invoicing & Documents (PayPlus Integration)](#prd-19a--invoicing--documents)

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

## החלטה רוחבית — Responsive admin: desktop-first ל-MVP

**תאריך החלטה:** 2026-05-30 (עלה מ-QA e2e של PRD #5)
**status:** approved

**השאלה:** דפי ה-admin עושים overflow אופקי ב-375px (~408px). האם לתקן רספונסיביות עכשיו?

**הממצא:** לכל ה-admin אין שום תשתית רספונסיבית — אפס media queries, NavRail/TopBar/טבלאות בכל המידות px קבוע. תיקון אמיתי = כל ה-shell, ~3-5 ימים.

**התשובה (ירין):** **לדחות ל-P2.** ה-admin הוא desktop-first ל-MVP; הקצה הנייד של המוצר הוא **Courier PWA** (כבר P2 בעץ). אין סיבה שבעל עסק ינהל קטלוג/לקוחות/הזמנות מטלפון ב-MVP.

**Trade-off שנדחה:** תיקון נקודתי למסך הלקוחות בלבד (horizontal-scroll) — נדחה כי זה משאיר את שאר ה-admin שבור ב-375px ויוצר חוסר אחידות. או shell רספונסיבי מלא — נדחה כפרויקט נפרד ב-P2.

**flag לסקירה:** כשנכנסים ל-Phase 2 — "Responsive admin shell" כפריט עבודה ייעודי (נוסף ל-work-queue).

---

## PRD #19a — Invoicing & Documents

**תאריך החלטות:** 2026-05-30
**status:** draft (לפני אישור סופי — אחרי challenger pass)

### שאלה 1 (קטגוריה A — האם זה MVP?) — Scope של 5 סוגי מסמכים

**השאלה:** באמת צריך 5 סוגי מסמכים ב-MVP? עסק B2C טיפוסי בחודש הראשון משתמש רק ב-`tax_invoice_receipt` (סליקה מיידית). למה לא לחתוך ל-2-3 סוגים ולחסוך ~14 ימי פיתוח?

**התשובה (ירין):** הסכים — לצמצם את ה-MVP. **3 סוגים נשארים:** `tax_invoice_receipt` (תשלום מיידי B2C), `delivery_note` (משלוחים — חוקי), `credit_note` (חובה ל-Wizard לתיקון חשבונית — ראה שאלה 3). **2 סוגים נדחו ל-Phase 2:** `tax_invoice` (חוב נפרד) ו-`receipt` (קבלה נפרדת) — שניהם נדרשים רק לזרימת שוטף 30/60, ואין עדיין לקוחות B2B אמיתיים שמצדיקים זאת.

**Trade-off שנדחה:** לבנות את כל 5 ב-MVP "כי בכל מקרה נצטרך" → דחיית MVP ב-3-4 ימים על פיצ'ר ללא משתמשים פעילים. הארכיטקטורה (Adapter pattern, document_links) כבר תומכת בכל 5 הסוגים — הוספה ב-Phase 2 = ~1.5 יום פר סוג.

**השפעה על PRD #16 (אשראי לקוחות):** PRD #16 חוסם עד שיתווספו `tax_invoice` + `receipt` (שוטף 30/60 לא יכול לעבוד בלעדיהם). כשפיתוח #16 יגיע — חוזרים ל-#19a ומוסיפים את 2 הסוגים. סדר חדש בפועל: #19a (MVP, 3 docs) → #16 שלב 1 → השלמת 2 docs ב-#19a → #16 שלב 2.

**flag לסקירה:** כשמתחילים את PRD #16 — לאמת שאין שינוי דרישות שיגרום ל-`tax_invoice`/`receipt` להיראות אחרת ממה שתוכנן.

---

### שאלה 2 (קטגוריה B — מה אם המודל ישתנה?) — רפקטור FR-2a (orders.payplus_ref → payment_external_ref)

**השאלה:** הרפקטור משתמש ב-`RENAME COLUMN` — חד-כיווני וקשה ל-rollback. בלי traffic production עכשיו זה נראה בטוח, אבל מה אם תקלה תתגלה אחרי שכבר יש 5,000 הזמנות?

**התשובה (ירין):** לא לקחת סיכון. **לעשות dual-write transition** במקום RENAME ישיר. נוסיף את `payment_external_ref` כעמודה חדשה, נכתוב לשתי העמודות במקביל למשך 2-3 שבועות (sprint 8), ורק אחרי שכל הקוד יציב והמספרים מתאימים — נמחק את `payplus_ref`.

**Trade-off שנדחה:** RENAME מיידי → חוסך ~2 ימי פיתוח אבל יוצר risk של data loss במקרה של revert.

**עלות הוספה:** +2 ימים לאומדן (כתיבת dual-write + verification script שמשווה את הערכים בין 2 העמודות + migration סופית להסרת הישנה).

**flag לסקירה:** sprint 9 — לאמת שאין מקום בקוד שעדיין כותב/קורא רק מ-`payplus_ref` לפני הסרת העמודה.

---

### שאלה 3 (קטגוריה C — מי באמת ישתמש?) — Wizard לתיקון חשבונית (FR-12)

**השאלה:** ה-Wizard לוקח 2 ימי פיתוח לפיצ'ר שעסק טיפוסי משתמש בו 1-2 פעמים בחודש. למה לא פתרון ידני פושר (כפתורים נפרדים) ולחסוך 2 ימים?

**התשובה (ירין):** **כן צריך wizard.** בתחום של חנויות חיות — שינויים בלתי-צפויים קורים כל הזמן (לקוח שינה דעתו על מוצר, שליח טעה בכמות, החזרה בגלל אלרגיה של חיה). ה-flow הזה חייב להיות זורם וחכם, גם אם זה מאריך את העבודה במעט. UX ידני שדורש 4 פעולות נפרדות יוצר טעויות שיגרמו ל-credit_notes לא תקינים — בעיה חוקית.

**Trade-off שנדחה:** Flow ידני (כפתור "צור זיכוי" → כפתור "צור חשבונית חדשה" בנפרד) → חוסך 2 ימים, אבל פותח פתח לטעויות שעלולות לעלות יותר בתיקון מאשר 2 הימים שחסכנו.

**flag לסקירה:** sprint 12+ — אם בפועל הוא משמש פחות מ-1 פעם בחודש פר tenant ממוצע, לשקול לפשט.

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
