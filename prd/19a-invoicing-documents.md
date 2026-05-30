# PRD #19a: Invoicing & Documents (PayPlus Integration)

**פאזה:** MVP — Sprint 7-8
**תאריך:** 2026-05-30
**סטטוס:** ✅ **Ready** (עבר challenger pass + roadmap-strategist — ראה decisions-log)
**מספור:** 19a — תת-מודול של סעיף 19 בעץ ("הנהלת חשבונות פנימית"). זה החלק החוקי-מסמכי שיוצא לפני הכרטסת המלאה (P2).

## Out of Scope (Phase 2)

**הוצאו במכוון מ-MVP** ע"י challenger pass (2026-05-30, decisions-log החלטה 1):

- ❌ **`tax_invoice`** (חשבונית מס נפרדת, ללא קבלה) — נדרש רק לזרימת שוטף 30/60. ייתוסף ב-PRD #16
- ❌ **`receipt`** (קבלה נפרדת, ללא חשבונית) — נדרש רק לזרימת שוטף 30/60. ייתוסף ב-PRD #16
- ❌ **`inv_proforma`** (חשבונית עסקה / פרופורמה) — בונוס שזיהינו ב-PayPlus, לא נדרש ל-MVP
- ❌ **`crt_return`** (תעודת החזרה) — בונוס נוסף
- ❌ Morning כספק חלופי — Phase 2, כש-tenant ספציפי יבקש

**הסיבה לדחייה:** הארכיטקטורה (Adapter pattern, document_links עם close_doc/cancel_doc) **כבר תומכת** בכל הסוגים האלה. הוספה עתידית = ~1.5 יום פר סוג, ללא שינוי DB.

---

## 1. סקירה כללית

המודול מנפיק ומנהל את כל המסמכים החשבונאיים שהעסק מוציא ללקוחותיו: **תעודות משלוח, חשבוניות מס, קבלות, חשבוניות מס-קבלה וחשבוניות זיכוי**. ההפקה בפועל נעשית דרך ספק חיצוני — **ב-MVP: PayPlus** (סליקה + חשבוניות באותה פלטפורמה). הספק הוא רשם הספרים החוקי שמנפיק מספר רץ ושומר את ה-PDF. MasterPet שומרת מצביעים, מטא-דאטה, ורציפות חשבונאית בין מסמכים.

המודול תומך בשני תרחישי עבודה במקביל:
- **תשלום מיידי** (B2C, WhatsApp + PayPlus): הזמנה → תעודת משלוח → סליקה → חשבונית מס-קבלה.
- **שוטף 30/60** (B2B): הזמנה → תעודת משלוח → ... → חשבונית מס מאחדת בסוף חודש → ... → קבלה כשהתשלום חל.

הארכיטקטורה בנויה **שני Adapters נפרדים** — `PaymentProvider` (סליקה) ו-`InvoiceProvider` (חשבוניות). ב-MVP PayPlus מממש את שניהם, אבל הם נבחרים **בנפרד** פר tenant — כך שב-Phase 2 ניתן להוסיף ספקי סליקה אחרים (Tranzila/Cardcom) או ספקי חשבוניות אחרים (Morning/iCount/EZcount) ולערבב חופשי בלי שינוי בשאר המערכת.

**הערה לרפקטור:** המודול כולל רפקטור של אינטגרציית PayPlus הקיימת מ-PRD #6 — מעבר משמות קשוחים (`fn-payplus-create-link`, `orders.payplus_ref`) לשמות נייטרליים לספק (`fn-create-payment-link`, `orders.payment_external_ref`) דרך ה-PaymentProvider adapter.

---

## 2. הבעיה שנפתרת

| | |
|---|---|
| **כאב** | בלי מודול חשבוניות, MasterPet לא יכולה לשרת עסקים אמיתיים בישראל. שוטף 30/60 (סעיף 16 בעץ) לא ניתן להוצאה לפועל כי אין הפרדה בין חשבונית-חוב לקבלה. תעודת משלוח לא מונפקת בכלל — הפרה של חוק ניהול ספרים כאשר סחורה יוצאת לפני חשבונית. |
| **מצב קיים** | אין. ב-PRD #6 (Orders) רק `payment_status` 4-ערכי שמתעד מצב תשלום, לא מסמכים. אין טבלת מסמכים, אין אינטגרציה ל-Morning, אין מספרים רצים. |
| **מה יקרה אם לא נבנה** | אי-אפשר להשיק MVP לעסקים B2B (חנויות גדולות שעובדות בשוטף). הפרות חוק במכירות לפי חשבוניות. אין יכולת להפיק דוח חייבים אמיתי (סעיף 16). הנהלת חשבונות פנימית (סעיף 19, P2) לא תוכל להיבנות. |

---

## 3. User Stories

### בעל עסק (owner)
- As an **owner**, I want לראות בסוף החודש את כל החשבוניות-טיוטה שהמערכת הכינה ללקוחות שוטף 30/60, לבדוק כל אחת, ולאשר/לדחות בלחיצה — כדי שלא תצא חשבונית שגויה בלי שראיתי אותה.
- As an **owner**, I want לקבוע ברירת מחדל פר לקוח (תשלום מיידי / שוטף 30 / שוטף 60) שתחול אוטומטית על כל הזמנה — אבל גם לעקוף ברמת הזמנה בודדת.
- As an **owner**, I want לתקן חשבונית שהונפקה בטעות דרך wizard מובנה שאחראי על כל החוקיות — credit_note ראשון, חשבונית חדשה לאחר מכן — בלי שאצטרך לדעת את הלוגיקה החוקית.
- As an **owner**, I want לראות בכרטיס לקוח את כל המסמכים שהונפקו אליו ואת הקשרים ביניהם (איזו חשבונית מאגדת איזו תעודה).

### מנהל סניף (branch_manager)
- As a **branch_manager**, I want להפיק תעודת משלוח בלחיצה מתוך פרטי הזמנה — כדי שהשליח יצא עם המסמך החוקי.
- As a **branch_manager**, I want להפיק קבלה ידנית ללקוח ששילם במזומן בסניף.

### עובד מכירות (sales)
- As a **sales**, I want כשאני שולח קישור PayPlus ללקוח B2C, שהמערכת אוטומטית תוציא חשבונית מס-קבלה ברגע שהתשלום מתקבל — בלי שאצטרך לעשות כלום.

### מנהל מחסן / שליח (warehouse / courier)
- As a **warehouse**, I want להפיק תעודת משלוח בעת אריזת ההזמנה ולצרף תמונה של המשלוח לפני יציאתו לדרך — כדי שיש הוכחה ויזואלית שהסחורה יצאה כפי שצריך.

---

## 4. Functional Requirements

| # | דרישה | עדיפות |
|---|---|---|
| FR-1 | **3 סוגי מסמכים ב-MVP:** `tax_invoice_receipt` (תשלום מיידי B2C), `delivery_note` (משלוחים), `credit_note` (לתיקון חשבוניות). **2 סוגים נדחו ל-Phase 2** (`tax_invoice` + `receipt` נפרדים) — נדרשים רק לשוטף 30/60 כש-PRD #16 יגיע. מספר רץ נפרד לכל סוג מנוהל ע"י PayPlus. ראה decisions-log החלטה 1 | Must Have |
| FR-2 | **שני Adapters נפרדים:** `PaymentProvider` (סליקה) + `InvoiceProvider` (חשבוניות). ב-MVP PayPlus מממש את שניהם. שני dropdowns במסך הגדרות — `payment_provider` + `invoice_provider` — בלתי תלויים. ב-P2 ניתן להוסיף Tranzila/Cardcom (סליקה), Morning/iCount/EZcount (חשבוניות) ולערבב חופשי | Must Have |
| FR-2a | **רפקטור PRD #6 לניטרליות-ספק (סליקה) — Dual-write transition (בטוח ל-rollback):** שלב 1 — מוסיפים `orders.payment_external_ref` + `orders.payment_provider` (לצד `orders.payplus_ref` הקיים). שלב 2 — כל קוד חדש כותב לשתי העמודות, קוד ישן ממשיך לקרוא מ-`payplus_ref`. שלב 3 — אחרי 2-3 שבועות + verification script שמשווה ערכים — מסירים את `payplus_ref`. במקביל: `fn-payplus-create-link` → `fn-create-payment-link`, `fn-payplus-webhook` → `fn-payment-webhook`. ראה decisions-log החלטה 2 | Must Have |
| FR-2b | **הצפנת credentials של ספקים:** כל ה-API keys/secrets בטבלאות `payment_provider_settings` ו-`invoice_provider_settings` מוצפנים באמצעות Supabase Vault. ההצפנה תיעשה אוטומטית בעת INSERT/UPDATE דרך wrapper function. הקוד שלנו מפענח רק כשצריך לבצע API call (in-memory בלבד, לא נשמר בלוגים). אם super_admin זדוני יקרא את ה-DB, יראה ג'יבריש בלבד | Must Have |
| FR-2c | **התראות פנים-מערכת (Internal Notifications):** טבלה חדשה `internal_notifications` + פעמון ב-TopBar עם counter אדום. סוגי התראות ב-MVP: `invoice_drafts_pending` (יש לך X חשבוניות-טיוטה לאישור). יישלח אוטומטית ע"י `fn-monthly-invoice-cron`. לחיצה על הפעמון פותחת dropdown עם הרשימה + לינקים ישירים למסך הרלוונטי. אופצית "סמן כנקרא" / "סמן הכל כנקרא" | Must Have |
| FR-3 | **טבלה פולימורפית `accounting_documents`** + טבלת קישור `document_links` (M:N) — חשבונית יכולה לאגד N תעודות, קבלה יכולה לכסות N חשבוניות | Must Have |
| FR-4 | **State machine נפרד למסמכים:** `draft → issued → cancelled_by_credit_note`, +state `error` ל-retry סנכרון Morning. מנותק לחלוטין מ-`orders.payment_status` | Must Have |
| FR-5 | **תעודת משלוח — ידני בלבד ב-MVP:** כפתור "הפק תעודת משלוח" ב-OrderDetail, פותח דיאלוג אישור (לקוח/פריטים/הערה), שולח ל-Morning, מקבל מספר + PDF | Must Have |
| FR-6 | **Proof-of-delivery:** תעודת משלוח יכולה לקבל תמונה דרך PWA של שליח (PRD #9) — תמונה נשמרת ב-Supabase Storage, URL נשמר ב-`accounting_documents.proof_image_url`. אופציונלי ב-MVP אבל ה-schema מוכן | Must Have |
| FR-7 | **תשלום מיידי B2C (auto):** webhook של PayPlus מטריגר `fn-payplus-webhook` → קורא ל-Morning → יוצר `tax_invoice_receipt` → מצרף ב-`document_links` לתעודת המשלוח המקורית (אם הייתה) | Must Have |
| FR-8 | **שוטף 30/60 — אישור בעלים:** cron חודשי (1 לחודש 03:00) סורק את כל ההזמנות שיש להן `payment_terms IN ('net_30','net_60')` ועדיין `payment_status='unpaid'`, מאגד פר לקוח, ויוצר חשבונית מס בסטטוס `draft`. שולח התראה ל-owner ב-Inbox פנימי + מייל | Must Have |
| FR-9 | **מסך "חשבוניות לאישור":** רשימת כל ה-drafts, כל אחד עם preview + סכום + N תעודות שמאוגדות. כפתורי "אשר ושלח" / "ערוך" / "מחק טיוטה". רק owner רואה את המסך | Must Have |
| FR-10 | **קבלה ידנית למזומן/העברה:** כפתור "צור קבלה" ב-OrderDetail כש-`payment_method IN ('cash','transfer')` — דיאלוג עם סכום + שיטה → Morning → קבלה. מקושר אוטומטית לחשבונית הקודמת אם קיימת | Must Have |
| FR-11 | **payment_terms ברמת הזמנה:** שדה `payment_terms` ב-orders (`immediate / net_30 / net_60`), נבחר ידנית בעת יצירת הזמנה. Default מהזמנה הקודמת של אותו לקוח, אבל אפשר לשנות | Must Have |
| FR-12 | **Wizard לתיקון חשבונית:** כפתור "תקן חשבונית" — (1) יוצר credit_note אוטומטי שמבטל את המקור, (2) פותח טופס עם פריטים מקוריים לעריכה, (3) מציג preview חשבונית חדשה, (4) Save → יוצר חשבונית חדשה. כל שלושת המסמכים מקושרים ב-`document_links`. ⚠️ דורש שכל 3 סוגי המסמכים ב-FR-1 קיימים. ראה decisions-log החלטה 3 | Must Have |
| FR-13 | **מסך "מסמכים" בכרטיס לקוח:** טאב חדש שמציג את כל המסמכים של הלקוח עם timeline ויזואלי + קישוריות בין מסמכים (חצים מתעודה לחשבונית לקבלה) | Must Have |
| FR-14 | **ייצוא PDF:** כל מסמך — קישור להורדת PDF ש-Morning מנפיק. נשמר `pdf_url` ב-DB אבל לא הקובץ עצמו (Morning מאחסן) | Must Have |
| FR-15 | **שליחת מסמך ללקוח:** כפתור "שלח ללקוח" — שולח ל-WhatsApp את ה-PDF דרך Green API (PRD #13). תיעוד `sent_at` + `sent_via` | Should Have |
| FR-16 | **Retry queue:** מסמכים שנכשלו בסנכרון ל-Morning (state `error`) — רשימה בדשבורד admin עם כפתור "נסה שוב" + לוג שגיאה | Should Have |
| FR-17 | **חיפוש מסמכים גלובלי:** חיפוש לפי מספר רץ, סכום, לקוח | Should Have |
| FR-18 | **ייצוא ל-CSV/Excel:** כל הרשימה לרואה חשבון | Nice to Have |

---

## 5. UI/UX

### כיוון
RTL, עברית. תאריכים DD/MM/YYYY. סכומים עם ₪ ופסיק ל-thousands.

### Routes (Next.js 16 App Router)

- `app/(dashboard)/documents/page.tsx` — רשימת כל המסמכים (DataTable + filters)
- `app/(dashboard)/documents/drafts/page.tsx` — מסך "חשבוניות לאישור" (rendered רק ל-owner)
- `app/(dashboard)/documents/[id]/page.tsx` — מסך מסמך בודד (preview + רציפות)
- `app/(dashboard)/customers/[id]/page.tsx` — *תוספת לקיים:* טאב חדש "מסמכים" עם timeline
- `app/(dashboard)/orders/[id]/page.tsx` — *תוספת לקיים:* בלוק "מסמכים חשבונאיים" + כפתורי הפקה
- `app/(dashboard)/settings/integrations/page.tsx` — מסך הגדרות: שני dropdowns נפרדים (ספק סליקה + ספק חשבוניות) + credentials פר ספק + טסט חיבור פר ספק

### shadcn/ui Components

`DataTable`, `Sheet` (יצירה ידנית), `Dialog` (אישור הפקה + Wizard תיקון), `Badge` (סטטוס מסמך), `Card`, `Tabs` (בכרטיס לקוח), `Stepper` (Wizard תיקון 4-שלבים), `Alert` (התראת drafts ממתינים), `Skeleton` (טעינה)

### Flow 1 — תשלום מיידי B2C (אוטומטי, ללא התערבות)

1. עובד מכירות יוצר הזמנה, בוחר `payment_terms='immediate'`
2. לוחץ "שלח קישור תשלום" — `fn-payplus-create-link` רץ כרגיל
3. לקוח משלם → PayPlus webhook → `fn-payplus-webhook`
4. ה-webhook עכשיו עושה שלושה דברים בעסקה אחת:
   - מעדכן `orders.payment_status='paid'`
   - קורא ל-Morning → יוצר `tax_invoice_receipt`
   - יוצר רשומה ב-`accounting_documents` (status='issued') + רשומה ב-`document_links` שמקשרת לתעודת המשלוח (אם הייתה)
5. עובד רואה ב-OrderDetail badge ירוק "חשבונית מס-קבלה הופקה #2547" עם קישור ל-PDF
6. ב-PRD #15 (notifications) — אוטומטית ה-PDF נשלח ללקוח ב-WhatsApp

### Flow 2 — שוטף 30 (B2B, אישור בעלים)

1. כל החודש: branch_manager יוצר הזמנות עם `payment_terms='net_30'`, מפיק תעודות משלוח ידנית כשהסחורה יוצאת
2. **1 לחודש 03:00** — `fn-monthly-invoice-cron` רץ:
   - SELECT orders WHERE payment_terms='net_30' AND payment_status='unpaid' AND created_at BETWEEN start_of_prev_month AND end_of_prev_month
   - GROUP BY customer_id
   - לכל לקוח: INSERT accounting_documents (doc_type='tax_invoice', status='draft', subtotal=SUM, ...) + N רשומות document_links לתעודות המשלוח
3. **בעל העסק** מקבל ב-08:00 התראה ב-Inbox פנימי + מייל: "יש לך 7 חשבוניות-טיוטה ממתינות לאישור"
4. owner נכנס ל-`/documents/drafts` — רואה רשימה:
   ```
   ┌──────────────────────────────────────────────────────────┐
   │ חנות חיות "פרא" — סניף מודיעין                          │
   │ 12 תעודות משלוח | סה"כ: ₪18,420 כולל מע"מ              │
   │ [👁 תצוגה מקדימה]  [✏ ערוך]  [✓ אשר ושלח]  [🗑 מחק]   │
   ├──────────────────────────────────────────────────────────┤
   │ ...                                                       │
   ```
5. לוחץ "תצוגה מקדימה" — Dialog עם רשימת כל הפריטים מכל התעודות + סכום סופי
6. לוחץ "אשר ושלח":
   - `issueInvoiceAction` קורא ל-Morning → מקבל מספר רץ + PDF URL
   - מעדכן `accounting_documents.status='issued'`, מוסיף `external_doc_number`
   - אופציונלי: שולח ל-WhatsApp של הלקוח
7. הזמנות שאוגדו ב-חשבונית — `orders.invoice_id` מתעדכן (FK חדש)

### Flow 3 — תעודת משלוח עם תמונה (Warehouse PWA)

1. warehouse פותח הזמנה ב-PWA, אורז סחורה
2. לוחץ "הפק תעודת משלוח" — Dialog עם פריטים, כפתור "צלם תמונה של המשלוח"
3. צילום → upload ל-Supabase Storage, URL נשמר
4. שמירה → `fn-issue-document` קורא ל-Morning → תעודת משלוח עם מספר רץ
5. PDF נשלח אוטומטית לוואטסאפ של הלקוח (אם PRD #13 מחובר) — "המשלוח שלך יצא, צילום מצורף"
6. בכרטיס ההזמנה: badge "תעודת משלוח #1247 + 📷"

### Flow 4 — Wizard לתיקון חשבונית

1. owner פותח חשבונית שהונפקה, לוחץ "תקן חשבונית"
2. **Stepper 4-שלבים:**
   - **שלב 1 — הבהרה:** הסבר משפטי קצר: "החשבונית כבר הונפקה. לפי החוק נוציא חשבונית זיכוי שמבטלת אותה, ואז חשבונית חדשה. שני המסמכים יישלחו ללקוח." [המשך] / [ביטול]
   - **שלב 2 — אישור זיכוי:** preview של credit_note (זהה לחשבונית המקורית, סכום שלילי). [אשר זיכוי]
   - **שלב 3 — חשבונית חדשה:** טופס עריכה עם הפריטים המקוריים. אפשר לערוך כמויות, מחירים, להוסיף/למחוק. סכום כולל מחושב חי.
   - **שלב 4 — preview + אישור סופי:** מציג את שני המסמכים זה ליד זה (זיכוי + חשבונית חדשה). [אשר והפק שניים]
3. בלחיצה — שתי קריאות ל-Morning ב-transaction:
   - credit_note → מספר רץ
   - tax_invoice חדשה → מספר רץ
4. `document_links` מתעדכן: credit_note מקושר לחשבונית המקורית, החשבונית החדשה מקושרת לאותן תעודות משלוח של המקורית
5. badge בכרטיס: "חשבונית #2547 בוטלה ע"י זיכוי #2548 → חשבונית חדשה #2549"

### Empty States

- `/documents` ריק: "עדיין אין מסמכים. ההזמנה הראשונה שתפיק תיצור אוטומטית את המסמך הראשון."
- `/documents/drafts` ריק: "אין חשבוניות-טיוטה ממתינות לאישור. הצ'ק החודשי הבא: 1 ל-[חודש הבא] בשעה 03:00."
- כרטיס לקוח, טאב מסמכים ריק: "ללקוח זה עדיין לא הופק שום מסמך."

### Loading / Error States
כל פעולת Morning יכולה להיכשל (timeout, credentials פגי תוקף, חריגת מכסת API). כל קריאה עוטפת try/catch — אם נכשל, המסמך נשאר `status='error'` + הודעת toast אדומה: "Morning לא הגיב, המסמך נשמר כטיוטה. נסה שוב מ-`/documents/drafts`."

---

## 6. Technical Spec

### DB Schema (Supabase)

```sql
-- =========================================
-- 1a. הגדרות ספק סליקה פר tenant
-- =========================================
CREATE TABLE payment_provider_settings (
  tenant_id           UUID        PRIMARY KEY REFERENCES tenants(id) ON DELETE CASCADE,
  provider            TEXT        NOT NULL DEFAULT 'payplus'
                                  CHECK (provider IN ('payplus')),  -- P2: 'tranzila', 'cardcom', 'zcredit'
  api_key_encrypted   TEXT,                                          -- מוצפן ב-Vault
  api_secret_encrypted TEXT,
  terminal_id         TEXT,                                          -- מסוף סליקה (PayPlus)
  webhook_secret      TEXT,                                          -- secret לאימות חתימת webhook
  is_sandbox          BOOLEAN     NOT NULL DEFAULT true,
  last_tested_at      TIMESTAMPTZ,
  last_test_status    TEXT        CHECK (last_test_status IN ('success','failed')),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE payment_provider_settings ENABLE ROW LEVEL SECURITY;
FORCE ROW LEVEL SECURITY ON payment_provider_settings;

CREATE POLICY "payment_settings_tenant_isolation" ON payment_provider_settings
  FOR ALL USING (tenant_id = current_tenant_id());

CREATE POLICY "payment_settings_owner_only" ON payment_provider_settings
  FOR INSERT WITH CHECK (current_user_role() = 'owner');
CREATE POLICY "payment_settings_owner_update" ON payment_provider_settings
  FOR UPDATE USING (current_user_role() = 'owner');


-- =========================================
-- 1b. הגדרות ספק חשבוניות פר tenant (נפרד מסליקה)
-- =========================================
CREATE TABLE invoice_provider_settings (
  tenant_id           UUID        PRIMARY KEY REFERENCES tenants(id) ON DELETE CASCADE,
  provider            TEXT        NOT NULL DEFAULT 'payplus'
                                  CHECK (provider IN ('payplus')),  -- P2: 'morning', 'icount', 'ezcount'
  api_key_encrypted   TEXT,                                          -- מוצפן ב-Vault (יכול להיות זהה ל-payment אם אותו ספק)
  api_secret_encrypted TEXT,
  company_id_external TEXT,                                          -- ID העסק אצל ספק החשבוניות
  vat_id              TEXT,                                          -- ח.פ./עוסק מורשה
  is_sandbox          BOOLEAN     NOT NULL DEFAULT true,
  last_tested_at      TIMESTAMPTZ,
  last_test_status    TEXT        CHECK (last_test_status IN ('success','failed')),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE invoice_provider_settings ENABLE ROW LEVEL SECURITY;
FORCE ROW LEVEL SECURITY ON invoice_provider_settings;

CREATE POLICY "invoice_settings_tenant_isolation" ON invoice_provider_settings
  FOR ALL USING (tenant_id = current_tenant_id());

CREATE POLICY "invoice_settings_owner_only" ON invoice_provider_settings
  FOR INSERT WITH CHECK (current_user_role() = 'owner');
CREATE POLICY "invoice_settings_owner_update" ON invoice_provider_settings
  FOR UPDATE USING (current_user_role() = 'owner');

-- הערה: שתי הטבלאות נפרדות בכוונה — כל ספק עם credentials משלו, ה-tenant
-- בוחר אותם **בנפרד**. גם אם PayPlus משמש לשניהם (MVP), כל אחד מוגדר ב-row משלו.
--
-- 🔒 הצפנה (FR-2b): העמודות api_key_encrypted / api_secret_encrypted / webhook_secret
-- נשמרות מוצפנות דרך Supabase Vault. INSERT/UPDATE עוברים דרך wrapper function
-- שמצפינה לפני שמירה. SELECT דרך view ייעודי שמפענח רק לקריאות API (ב-Edge Function בלבד,
-- אף פעם לא ישירות לקליינט). super_admin שיקרא את ה-table יראה bytea ג'יבריש.


-- =========================================
-- 1c. התראות פנים-מערכת (FR-2c) — לאישור חשבוניות וכו'
-- =========================================
CREATE TABLE internal_notifications (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID        NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id         UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  notification_type TEXT      NOT NULL
                              CHECK (notification_type IN (
                                'invoice_drafts_pending',     -- חשבוניות שוטף 30 ממתינות
                                'document_error',             -- מסמך נכשל בסנכרון
                                'provider_connection_failed'  -- חיבור Morning/PayPlus נכשל
                              )),
  payload         JSONB       NOT NULL DEFAULT '{}'::jsonb,  -- {count: 7, link: "/documents/drafts"}
  read_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE internal_notifications ENABLE ROW LEVEL SECURITY;
FORCE ROW LEVEL SECURITY ON internal_notifications;

-- משתמש רואה רק את ההתראות של עצמו (בתוך ה-tenant שלו)
CREATE POLICY "notifications_user_isolation" ON internal_notifications
  FOR ALL USING (
    tenant_id = current_tenant_id()
    AND user_id = current_user_id()
  );

CREATE INDEX notifications_unread
  ON internal_notifications (tenant_id, user_id)
  WHERE read_at IS NULL;


-- =========================================
-- 2. הטבלה הראשית — מסמכים חשבונאיים
-- =========================================
CREATE TABLE accounting_documents (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           UUID        NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  branch_id           UUID        NOT NULL REFERENCES branches(id),
  customer_id         UUID        NOT NULL REFERENCES customers(id),
  created_by          UUID        NOT NULL REFERENCES users(id),

  doc_type            TEXT        NOT NULL
                                  CHECK (doc_type IN (
                                    'delivery_note',
                                    'tax_invoice',
                                    'receipt',
                                    'tax_invoice_receipt',
                                    'credit_note'
                                  )),

  status              TEXT        NOT NULL DEFAULT 'draft'
                                  CHECK (status IN (
                                    'draft',                    -- טרם הופק ב-Morning
                                    'issued',                   -- הופק במורנינג עם מספר רץ
                                    'cancelled_by_credit_note', -- בוטל ע"י credit_note
                                    'error'                     -- כשל סנכרון, ניתן ל-retry
                                  )),

  -- מספור — מנוהל ע"י Morning
  external_provider   TEXT        NOT NULL DEFAULT 'payplus',        -- ב-MVP PayPlus, P2: morning/icount/...
  external_doc_id     TEXT,                                          -- ID פנימי אצל הספק
  external_doc_number TEXT,                                          -- המספר הרץ החוקי (לדוגמה "2547")
  pdf_url             TEXT,                                          -- URL ל-PDF אצל הספק

  -- סכומים (snapshot בעת ההפקה)
  subtotal            NUMERIC(12,2) NOT NULL DEFAULT 0,
  discount            NUMERIC(12,2) NOT NULL DEFAULT 0,
  vat_rate            NUMERIC(5,2)  NOT NULL DEFAULT 18,
  vat_amount          NUMERIC(12,2) NOT NULL DEFAULT 0,
  total               NUMERIC(12,2) NOT NULL DEFAULT 0,
  currency            TEXT          NOT NULL DEFAULT 'ILS',

  -- שדות ספציפיים לסוג
  payment_method      TEXT          CHECK (payment_method IN ('payplus','cash','transfer','credit_card','check')),
  proof_image_url     TEXT,                                          -- רק delivery_note
  gps_lat             NUMERIC(10,6),                                 -- רק delivery_note (אופציונלי)
  gps_lng             NUMERIC(10,6),

  -- שליחה
  sent_to_customer_at TIMESTAMPTZ,
  sent_via            TEXT          CHECK (sent_via IN ('whatsapp','email','sms')),

  -- audit
  issued_at           TIMESTAMPTZ,                                   -- מתי הופק במורנינג (אחרי draft)
  error_message       TEXT,                                          -- אם status='error'
  retry_count         INT           NOT NULL DEFAULT 0,

  notes               TEXT,

  created_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

ALTER TABLE accounting_documents ENABLE ROW LEVEL SECURITY;
FORCE ROW LEVEL SECURITY ON accounting_documents;

CREATE POLICY "docs_tenant_isolation" ON accounting_documents
  FOR ALL USING (tenant_id = current_tenant_id());

-- sales/warehouse רואים רק את הסניף שלהם
CREATE POLICY "docs_branch_isolation" ON accounting_documents
  FOR SELECT USING (
    current_user_role() IN ('owner','super_admin')
    OR branch_id = current_branch_id()
  );

-- רק owner יכול לראות drafts של חשבוניות חודשיות (אישור)
-- (drafts של delivery_note כן נראים ל-warehouse)
CREATE POLICY "docs_drafts_owner_only" ON accounting_documents
  FOR SELECT USING (
    status != 'draft'
    OR doc_type IN ('delivery_note')
    OR current_user_role() = 'owner'
  );


-- =========================================
-- 3. פירוט שורות (snapshot של פריטים)
-- =========================================
CREATE TABLE accounting_document_lines (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id     UUID        NOT NULL REFERENCES accounting_documents(id) ON DELETE CASCADE,
  tenant_id       UUID        NOT NULL REFERENCES tenants(id),
  order_item_id   UUID        REFERENCES order_items(id),  -- nullable אם נמחק
  line_number     INT         NOT NULL,                    -- 1, 2, 3 בתוך המסמך

  product_name    TEXT        NOT NULL,                    -- snapshot
  variant_desc    TEXT,                                    -- snapshot
  sku             TEXT,                                    -- snapshot
  quantity        NUMERIC(10,3) NOT NULL,
  unit_price      NUMERIC(12,2) NOT NULL,
  vat_rate        NUMERIC(5,2)  NOT NULL DEFAULT 18,
  total_price     NUMERIC(12,2) NOT NULL,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (document_id, line_number)
);

ALTER TABLE accounting_document_lines ENABLE ROW LEVEL SECURITY;
FORCE ROW LEVEL SECURITY ON accounting_document_lines;

CREATE POLICY "doc_lines_tenant_isolation" ON accounting_document_lines
  FOR ALL USING (tenant_id = current_tenant_id());


-- =========================================
-- 4. קישורי רציפות M:N — תעודה→חשבונית→קבלה
-- =========================================
CREATE TABLE document_links (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           UUID        NOT NULL REFERENCES tenants(id),
  parent_document_id  UUID        NOT NULL REFERENCES accounting_documents(id) ON DELETE CASCADE,
  child_document_id   UUID        NOT NULL REFERENCES accounting_documents(id) ON DELETE CASCADE,
  link_type           TEXT        NOT NULL
                                  CHECK (link_type IN (
                                    'invoice_aggregates_delivery_note',  -- חשבונית מאגדת תעודה
                                    'receipt_pays_invoice',              -- קבלה משלמת חשבונית
                                    'credit_note_cancels_invoice',       -- זיכוי מבטל חשבונית
                                    'invoice_replaces_cancelled',        -- חשבונית חדשה אחרי זיכוי
                                    'tax_invoice_receipt_for_delivery'   -- חשבונית מס-קבלה מיידית לתעודה
                                  )),
  amount_allocated    NUMERIC(12,2),                       -- כמה מהיתרה של ההורה נכנס לילד
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (parent_document_id, child_document_id, link_type)
);

ALTER TABLE document_links ENABLE ROW LEVEL SECURITY;
FORCE ROW LEVEL SECURITY ON document_links;

CREATE POLICY "doc_links_tenant_isolation" ON document_links
  FOR ALL USING (tenant_id = current_tenant_id());

CREATE INDEX doc_links_parent ON document_links (parent_document_id);
CREATE INDEX doc_links_child ON document_links (child_document_id);


-- =========================================
-- 5. תוספות לטבלאות קיימות
-- =========================================

-- orders — payment_terms ברמת הזמנה (לפי החלטה: per-order, לא per-customer)
ALTER TABLE orders ADD COLUMN payment_terms TEXT NOT NULL DEFAULT 'immediate'
  CHECK (payment_terms IN ('immediate','net_30','net_60'));

ALTER TABLE orders ADD COLUMN invoice_document_id UUID
  REFERENCES accounting_documents(id);  -- מה החשבונית שאיגדה את ההזמנה הזו

-- רפקטור FR-2a: ניטרליות לספק סליקה (שמות חדשים במקום payplus-specific)
ALTER TABLE orders RENAME COLUMN payplus_ref TO payment_external_ref;
ALTER TABLE orders ADD COLUMN payment_provider TEXT DEFAULT 'payplus'
  CHECK (payment_provider IN ('payplus'));  -- P2: 'tranzila','cardcom','zcredit'

-- payment_method הקיים — להוסיף את הערך הניטרלי 'payment_link' (במקום 'payplus_link' הספציפי)
-- שינוי לא-breaking: payplus_link נשאר תקף ל-backwards compat, payment_link נוסף
ALTER TABLE orders DROP CONSTRAINT orders_payment_method_check;
ALTER TABLE orders ADD CONSTRAINT orders_payment_method_check
  CHECK (payment_method IN ('payment_link','payplus_link','woocommerce','cash','transfer','credit'));

CREATE INDEX orders_payment_terms_unpaid ON orders (tenant_id, payment_terms)
  WHERE payment_status = 'unpaid' AND payment_terms IN ('net_30','net_60');


-- =========================================
-- 6. Indexes
-- =========================================
CREATE INDEX docs_tenant_customer ON accounting_documents (tenant_id, customer_id, created_at DESC);
CREATE INDEX docs_tenant_status ON accounting_documents (tenant_id, status, doc_type);
CREATE INDEX docs_drafts ON accounting_documents (tenant_id, status) WHERE status = 'draft';
CREATE INDEX docs_external_number ON accounting_documents (tenant_id, external_doc_number);
```

### Edge Functions

| Function | Trigger | מטרה |
|---|---|---|
| `fn-issue-document` | HTTP POST (Server Action) | מקבל `document_id`, טוען את ה-`InvoiceProvider` adapter לפי `invoice_provider_settings.provider` (ב-MVP: PayPlus), קורא ל-adapter, מעדכן `external_doc_id`, `external_doc_number`, `pdf_url`, `status='issued'`. במקרה כשל — `status='error'` + לוג. |
| `fn-create-payment-link` | HTTP POST (Server Action) | *רפקטור מ-`fn-payplus-create-link` של PRD #6.* טוען את ה-`PaymentProvider` adapter לפי `payment_provider_settings.provider`, קורא ל-adapter, מחזיר URL, מעדכן `orders.payment_external_ref` + `orders.payment_provider`. |
| `fn-payment-webhook` | HTTP POST (webhook) | *רפקטור מ-`fn-payplus-webhook`.* URL paths נפרדים לכל ספק (`/webhook/payments/payplus`, `/webhook/payments/tranzila` בעתיד) — כל path מזהה ספק, טוען adapter, מאמת חתימה. אחרי `payment_status='paid'`: יוצר אוטומטית `tax_invoice_receipt` ב-DB → קורא `fn-issue-document` → מקשר ל-`delivery_note` (אם הייתה) ב-`document_links`. |
| `fn-monthly-invoice-cron` | Cron — 1 לחודש 03:00 (pg_cron) | סורק orders שוטף 30/60 שעדיין unpaid מהחודש הקודם, GROUP BY customer, יוצר `tax_invoice` בסטטוס `draft` עם `document_links` לתעודות המשלוח. שולח התראה ל-owner ב-Inbox פנימי. (ניטרלי לספק — קורא ל-`fn-issue-document` רק כשה-owner מאשר.) |
| `fn-send-document-whatsapp` | HTTP POST (Server Action) | שולח את ה-`pdf_url` של מסמך ללקוח דרך Green API. מעדכן `sent_to_customer_at` + `sent_via='whatsapp'`. דורש PRD #13. |
| `fn-retry-document` | HTTP POST (Server Action) | רק לסטטוס `error` — מגדיל `retry_count`, קורא שוב ל-`fn-issue-document`. |

### Server Actions

| Action | Role | מה עושה |
|---|---|---|
| `createDeliveryNoteAction` | sales, branch_manager, warehouse, owner | יוצר `accounting_documents` (delivery_note, draft) + lines מ-`order_items`. קורא ל-`fn-issue-document` ישר. |
| `createReceiptAction` | branch_manager, owner | קבלה ידנית למזומן/העברה. דורש `order_id` + `payment_method`. אם קיימת חשבונית — מקשר ב-`document_links`. |
| `previewDraftInvoiceAction` | owner | מחזיר preview של חשבונית-draft + N תעודות שהיא תאגד. |
| `approveDraftInvoiceAction` | owner | משנה `status='issued'` ע"י קריאה ל-`fn-issue-document`. מעדכן `orders.invoice_document_id` לכל הזמנה רלוונטית. |
| `editDraftInvoiceAction` | owner | מתיר עריכת lines של חשבונית-draft (לפני שהונפקה). אסור אחרי `issued`. |
| `deleteDraftInvoiceAction` | owner | מוחק חשבונית-draft. רק drafts — `issued` לא ניתן למחיקה. |
| `correctInvoiceAction` | owner | Wizard לתיקון: יוצר credit_note, מוציא ב-Morning, ואז יוצר tax_invoice חדשה עם הפריטים החדשים, מקשר ב-`document_links`. עסקה אחת (transactional). |
| `uploadDeliveryProofAction` | warehouse, courier | מעלה תמונה ל-Supabase Storage, מעדכן `proof_image_url` + `gps_lat/lng` ב-`accounting_documents`. |
| `listDocumentsAction` | כל roles (לפי RLS) | רשימה עם filters: doc_type, status, customer, date range. |
| `listDraftsAction` | owner | רק drafts ממתינים לאישור. |
| `getDocumentChainAction` | כל roles | מחזיר מסמך + כל הקשרים שלו (parent + children) ל-timeline ב-UI. |
| `sendDocumentToCustomerAction` | sales, branch_manager, owner | קורא ל-`fn-send-document-whatsapp`. |
| `testPaymentProviderConnectionAction` | owner | קורא ל-PaymentProvider.testConnection() עם credentials מ-`payment_provider_settings`, מעדכן `last_tested_at` + `last_test_status`. |
| `testInvoiceProviderConnectionAction` | owner | קורא ל-InvoiceProvider.testConnection() עם credentials מ-`invoice_provider_settings`, מעדכן `last_tested_at` + `last_test_status`. |
| `listNotificationsAction` | כל roles | מחזיר את ההתראות של המשתמש הנוכחי (unread first). pagination. |
| `markNotificationReadAction` | כל roles | מעדכן `read_at` להתראה ספציפית. |
| `markAllNotificationsReadAction` | כל roles | מעדכן `read_at` לכל ההתראות הלא-קרואות של המשתמש. |

### Frontend Components

| Component | Path | מטרה |
|---|---|---|
| `DocumentsTable` | `documents/_components/DocumentsTable.tsx` | DataTable מלאה + filters + סינון לפי סטטוס |
| `DocumentBadge` | `documents/_components/DocumentBadge.tsx` | Badge קטן (סוג + מספר רץ + צבע סטטוס) — לשימוש חוזר ב-OrderDetail וקרטיס לקוח |
| `DocumentPreviewDialog` | `documents/_components/DocumentPreviewDialog.tsx` | Dialog שמציג preview מהיר של מסמך לפני אישור |
| `DraftInvoicesList` | `documents/drafts/_components/DraftInvoicesList.tsx` | רשימת drafts ממתינים — לכל אחד כפתורי אשר/ערוך/מחק |
| `DocumentChainTimeline` | `documents/_components/DocumentChainTimeline.tsx` | timeline ויזואלי — תעודת משלוח → חשבונית → קבלה (חצים בין כרטיסים) |
| `InvoiceCorrectionWizard` | `documents/_components/InvoiceCorrectionWizard.tsx` | Stepper 4-שלבים לתיקון חשבונית |
| `CustomerDocumentsTab` | `customers/[id]/_components/CustomerDocumentsTab.tsx` | טאב חדש בכרטיס לקוח — Timeline של כל המסמכים |
| `OrderDocumentsBlock` | `orders/[id]/_components/OrderDocumentsBlock.tsx` | בלוק בכרטיס הזמנה — מציג מסמכים קיימים + כפתורי הפקה חדשים |
| `IssueDocumentDialog` | `orders/[id]/_components/IssueDocumentDialog.tsx` | Dialog להפקה ידנית — בחירת סוג, פריטים, הערה, תמונה (אם delivery_note) |
| `NotificationBell` | `_shared/components/NotificationBell.tsx` | פעמון ב-TopBar עם counter אדום. Dropdown מציג עד 10 התראות אחרונות + "סמן הכל כנקרא" + לינק "ראה הכל" |
| `NotificationDropdown` | `_shared/components/NotificationDropdown.tsx` | Dropdown של ההתראות עם clickable items שמובילים למסך הרלוונטי |
| `ProofImageUploader` | `documents/_components/ProofImageUploader.tsx` | Component להעלאת תמונה (drag/drop + camera על mobile) |
| `PaymentProviderSettingsForm` | `settings/integrations/_components/PaymentProviderSettingsForm.tsx` | טופס הגדרות ספק סליקה (dropdown + credentials + "בדוק חיבור") |
| `InvoiceProviderSettingsForm` | `settings/integrations/_components/InvoiceProviderSettingsForm.tsx` | טופס הגדרות ספק חשבוניות (dropdown + credentials + "בדוק חיבור"). שני הטפסים בלתי תלויים באותו עמוד |
| `DraftsBanner` | `_shared/components/DraftsBanner.tsx` | באנר עליון ב-shell (רק ל-owner) — "יש לך X חשבוניות-טיוטה ממתינות" |

### שני Adapter Interfaces — PaymentProvider + InvoiceProvider

ה-MVP מספק שני interfaces נפרדים. PayPlus מממש את שניהם בקבצים נפרדים. ב-Phase 2, כל ספק חדש (Tranzila לסליקה, Morning לחשבוניות) מוסיף קובץ אחד שמממש את ה-interface הרלוונטי — בלי שינוי בשאר המערכת.

```typescript
// =========================================
// PaymentProvider — סליקה
// =========================================
// lib/payments/providers/payplus.ts
export interface PaymentProvider {
  createPaymentLink(input: PaymentLinkInput): Promise<PaymentLinkResult>
  verifyWebhookSignature(payload: unknown, signature: string): boolean
  parseWebhookEvent(payload: unknown): WebhookEvent  // 'paid' | 'failed' | 'refunded'
  refund(externalRef: string, amount: number): Promise<RefundResult>
  testConnection(): Promise<{ success: boolean; error?: string }>
}

export interface PaymentLinkInput {
  orderId: string
  amount: number
  currency: 'ILS'
  customerName: string
  customerEmail?: string
  customerPhone: string
  description: string
}

export interface PaymentLinkResult {
  payment_url: string
  payment_external_ref: string  // ID העסקה אצל הספק
}

// =========================================
// InvoiceProvider — חשבוניות
// =========================================
// lib/invoicing/providers/payplus-invoices.ts
export interface InvoiceProvider {
  issueDeliveryNote(input: IssueInput): Promise<ExternalDocResult>
  issueTaxInvoice(input: IssueInput & { linkedDeliveryNotes?: string[] }): Promise<ExternalDocResult>
  issueReceipt(input: IssueInput & { paymentMethod: string }): Promise<ExternalDocResult>
  issueTaxInvoiceReceipt(input: IssueInput & { paymentMethod: string }): Promise<ExternalDocResult>
  issueCreditNote(input: IssueInput & { cancelsDocId: string }): Promise<ExternalDocResult>
  testConnection(): Promise<{ success: boolean; error?: string }>
}

export interface ExternalDocResult {
  external_doc_id: string
  external_doc_number: string
  pdf_url: string
}

// =========================================
// Factory Pattern — טעינת adapter דינמית פר tenant
// =========================================
// lib/payments/registry.ts
export function getPaymentProvider(tenantId: string): PaymentProvider {
  const settings = loadPaymentSettings(tenantId)
  switch (settings.provider) {
    case 'payplus': return new PayPlusPaymentProvider(settings)
    // P2: case 'tranzila': return new TranzilaProvider(settings)
    // P2: case 'cardcom': return new CardcomProvider(settings)
  }
}

// lib/invoicing/registry.ts
export function getInvoiceProvider(tenantId: string): InvoiceProvider {
  const settings = loadInvoiceSettings(tenantId)
  switch (settings.provider) {
    case 'payplus': return new PayPlusInvoiceProvider(settings)
    // P2: case 'morning': return new MorningProvider(settings)
    // P2: case 'icount': return new ICountProvider(settings)
  }
}
```

### מבנה קבצים

```
lib/
├── payments/
│   ├── registry.ts                      ← factory לפי tenant
│   ├── types.ts                         ← PaymentProvider interface
│   └── providers/
│       └── payplus.ts                   ← MVP
│       └── tranzila.ts                  ← P2 (placeholder, ריק עכשיו)
└── invoicing/
    ├── registry.ts                      ← factory לפי tenant
    ├── types.ts                         ← InvoiceProvider interface
    └── providers/
        └── payplus-invoices.ts          ← MVP
        └── morning.ts                   ← P2 (placeholder)
        └── icount.ts                    ← P2 (placeholder)
```

**הבחירות בלתי תלויות:** `payment_provider_settings.provider` ו-`invoice_provider_settings.provider` מוגדרים בנפרד פר tenant. tenant יכול לבחור בעתיד `PayPlus` לסליקה + `Morning` לחשבוניות (או כל קומבינציה אחרת).

---

## 7. Acceptance Criteria

- [ ] 5 סוגי המסמכים מונפקים בהצלחה ב-PayPlus sandbox דרך InvoiceProvider adapter (delivery_note, tax_invoice, receipt, tax_invoice_receipt, credit_note)
- [ ] `external_doc_number` נשמר נכון לכל מסמך — מספור רץ מהספק
- [ ] **רפקטור PRD #6 הושלם** — `fn-payplus-create-link` החליף שם ל-`fn-create-payment-link`, `orders.payplus_ref` ל-`orders.payment_external_ref`, נוצרה `orders.payment_provider`, כל הקריאות עוברות דרך PaymentProvider interface, הזמנות קיימות ממשיכות לעבוד
- [ ] **שני Adapters בלתי תלויים** — שינוי `payment_provider_settings.provider` לא משפיע על חשבוניות, ולהפך. שני test connection נפרדים
- [ ] **Flow תשלום מיידי B2C** — PayPlus webhook → tax_invoice_receipt אוטומטית → מקושר לתעודת משלוח (אם הייתה) → ה-`pdf_url` נשמר
- [ ] **Flow שוטף 30** — cron יוצר drafts מאוגדות פר לקוח, owner רואה רשימה ב-`/documents/drafts`, אישור → הפקה ב-PayPlus + עדכון `orders.invoice_document_id`
- [ ] **תעודת משלוח עם תמונה** — warehouse מעלה תמונה ב-PWA, `proof_image_url` נשמר
- [ ] **Wizard תיקון חשבונית** — מייצר credit_note + tax_invoice חדשה בעסקה אחת, שלושה מסמכים מקושרים ב-`document_links`
- [ ] **RLS מאומת** — tenant A לא רואה מסמכים של tenant B
- [ ] **Branch isolation** — sales/warehouse רואים רק מסמכים של הסניף שלהם
- [ ] **Drafts isolation** — רק owner רואה חשבוניות-draft (מלבד delivery_note שניתן לראייה לכולם)
- [ ] **State machine נאכף** — אסור לערוך מסמך שעבר ל-`issued`. ביטול = credit_note בלבד (אסור DELETE)
- [ ] **Retry queue** — מסמך ב-`error` ניתן לטריגר retry, `retry_count` עולה
- [ ] **כשל ספק (PayPlus או כל ספק עתידי)** — אם API לא מגיב, המסמך נשאר `draft`/`error`, ה-UI מציג toast ברור, אין כפילות. ה-PaymentProvider/InvoiceProvider interfaces מטפלים בכשלים אחיד
- [ ] **payment_terms ברמת הזמנה** — dropdown ב-OrderSheet, מעבר נכון ל-DB
- [ ] **timeline בכרטיס לקוח** — מציג את כל המסמכים עם חצים בין רציפים
- [ ] **PDF URL פעיל** — לחיצה פותחת PDF מ-Morning בטאב חדש
- [ ] **RTL נכון** — כל המסכים, כולל ה-Wizard, ב-RTL מלא
- [ ] **Mobile responsive** — `min 375px` עובד (חשוב במיוחד ל-warehouse PWA)
- [ ] **Empty / Loading / Error** — מטופלים בכל רשימה
- [ ] **Audit log** — כל יצירה / אישור / ביטול נכתבים ב-`audit_logs` עם actor + timestamp
- [ ] `tsc --noEmit` exit 0, `next build` ✅

---

## 8. פאזה ואומדן

| | |
|---|---|
| **פאזה** | MVP — Sprint 7-8 |
| **DB Migrations + RLS (3 טבלאות provider_settings + accounting + notifications)** | ~2 ימים |
| **Supabase Vault setup + encryption wrapper (FR-2b)** | ~1 יום |
| **רפקטור PRD #6: Dual-write transition (FR-2a) — בטוח ל-rollback** | ~3.5 ימים *(+2 ל-dual-write על RENAME)* |
| **PayPlus Adapters — 3 סוגי מסמכים בלבד (PaymentProvider + InvoiceProvider מצומצם)** | ~2.5 ימים *(-0.5 משינוי scope)* |
| **Edge Functions (issue, payment-webhook הרחבה, cron)** | ~2.5 ימים *(-0.5 משינוי scope)* |
| **Server Actions (17 actions — כולל 3 ל-notifications)** | ~2 ימים |
| **UI — DocumentsTable + Drafts + Customer tab** | ~3 ימים |
| **UI — Invoice Correction Wizard** | ~2 ימים |
| **UI — OrderDocumentsBlock + IssueDocumentDialog (3 סוגים בלבד)** | ~1.5 ימים *(-0.5 משינוי scope)* |
| **UI — מסך הגדרות integrations (2 טפסים נפרדים)** | ~1 יום |
| **UI — NotificationBell + Dropdown ב-TopBar (FR-2c)** | ~0.5 יום |
| **proof-of-delivery upload (hook ל-PWA #9)** | ~1 יום |
| **QA + PayPlus sandbox e2e testing (3 סוגים + הצפנה + dual-write verification)** | ~2 ימים |
| **סה"כ** | **~24.5 ימים (~5 שבועות)** *(שינויים מתקזזים: -2 משינוי scope, +2 ל-dual-write)* |

**הערה:** האומדן נשאר 24.5 ימים — חיסכון מצמצום scope (FR-1: 5→3 סוגים) מתקזז בדיוק עם תוספת בטיחות (FR-2a: dual-write).

---

## 9. תלויות

### דורש (חייב להיות מוכן לפני התחלת המודול)
- **PRD #1** — Auth, RLS helpers (`current_tenant_id`, `current_user_role`, `current_branch_id`), `withAuth`, `writeAudit` ✅ Done
- **PRD #5** — `customers` קיים ✅ Done
- **PRD #6** — `orders` + `order_items` + `payment_status` + `fn-payplus-webhook` קיים ✅ Done. ⚠️ ייעבור רפקטור כחלק מהמודול (ראה FR-2a)
- **PayPlus API credentials** — סליקה **וגם** חשבוניות חייבות להיות מופעלות בחשבון. sandbox לפיתוח, production פר tenant. (ב-MVP — חשבון אחד של ירין לצרכי דמו; בpr-od כל tenant מחבר חשבון משלו)
- ~~**Inbox פנימי לעבודה (notifications minimal)**~~ — ✅ נכלל בסקופ של PRD #19a (FR-2c) — טבלת `internal_notifications` + פעמון ב-TopBar
- ~~**Encryption layer לפני שמירת credentials**~~ — ✅ נכלל בסקופ של PRD #19a (FR-2b) — Supabase Vault wrapper

### חוסם (PRDs שלא יכולים להתחיל לפני שזה מוכן)
- **סעיף 16 (אשראי לקוחות)** — דורש חשבוניות חוב נפרדות מקבלה. בלי PRD #19a, אי-אפשר לבנות דוח חייבים אמיתי.
- **סעיף 19 (הנהלת חשבונות פנימית, P2)** — כל הכרטסת והדוחות מתבססים על מסמכים מ-PRD #19a.

### משלים (יכול לעבוד במקביל / משפיע)
- **PRD #9 (Couriers PWA)** — proof-of-delivery upload משתמש ב-component מ-PRD #19a, אבל ה-component יכול להיבנות גם בלי PWA פעיל (Web upload ראשון).
- **PRD #13 (Notifications + Green API)** — שליחת PDF ל-WhatsApp תופעל רק כש-#13 מחובר; עד אז, כפתור "שלח" מציג "לא זמין".

---

## 10. סיכונים ושאלות פתוחות

| # | שאלה / סיכון | סטטוס |
|---|---|---|
| 1 | **PayPlus rate limits + עלויות (סליקה + חשבוניות)** — כל הפקת מסמך + כל יצירת קישור = API call. בעסק עם 100 הזמנות/יום ייצור 200+ קריאות. לאמת מכסות ועלות פר tenant — ב-PayPlus, חשבוניות לעיתים בתמחור נפרד מסליקה | פתוח — לבדוק לפני חתימה |
| 2 | **חשבונית-טיוטה שלא אושרה חודש שלם** — מה קורה אם owner שכח לאשר חשבונית שוטף 30? צריך התראה אגרסיבית (מייל יומי? SMS?) או escalation אחרי X ימים | פתוח — להגדיר התראה כפולה אחרי 7 ימים |
| 3 | **מספור רץ בכפילות עם הספק** — אם tenant מחבר את אותו חשבון PayPlus גם בכלי אחר במקביל (לדוגמה ייצוא ידני, ממשק PayPlus ישיר), המספור עלול לקפוץ. לא בעיה טכנית שלנו אבל UX חשוב להבהיר | פתוח — להוסיף אזהרה במסך הגדרות |
| 4 | **תיקון חשבונית אחרי שיצא דוח מע"מ דו-חודשי** — חוקית אסור לתקן. צריך לחסום ב-UI על בסיס תאריך דיווח (מה-15 לחודש הבא)? | פתוח — שאלה לרואה חשבון של ירין |
| 5 | **PDF נשמר רק אצל הספק** — אם PayPlus יורד או מוחק, PDF הולך לאיבוד. האם לעשות mirror ל-Supabase Storage לכל מסמך `issued`? עלות אחסון לא גדולה | המלצה: כן, mirror בנפרד אחרי `issued` — קל ובטוח, וגם פותר תרחיש החלפת ספק בעתיד |
| 6 | **חשבונית מאחדת תעודות מסניפים שונים** — אם לקוח קיבל סחורה מסניף תל אביב וגם מירושלים באותו חודש, האם חשבונית אחת או חשבונית פר סניף? חוקית — אחת כי הלקוח אחד. תפעולית — לכל סניף יש P&L משלו | פתוח — להחלטת ירין: per-customer (פשוט) או per-customer+branch (מסובך אבל נכון לדיווח פנימי) |
| 7 | ~~**encryption של API credentials**~~ | ✅ **סגור (2026-05-30)** — נכלל בסקופ ב-FR-2b. Supabase Vault setup + encryption wrapper. נכלל ב-1 יום ייעודי באומדן |
| 8 | **חישוב מע"מ — ספק או אנחנו?** — שתי האפשרויות אפשריות. עדיף שהספק יחשב (מקור-אמת חשבונאי). אנחנו רק שולחים סכומים לפני מע"מ + שיעור | מוחלט: הספק מחשב, אנחנו שולחים subtotal + vat_rate |
| 9 | **HE שמות מוצרים ארוכים** — PayPlus עלול לקצר שמות מוצרים ב-PDF (חוקי-כלום אבל לא יפה). לבדוק max length פר ספק | פתוח — בדיקה ב-sandbox |
| 10 | **integration ב-PRD #6 cron (subscription_cron)** — האם הזמנות מנוי שוטף 30 גם נכנסות לחשבונית מאחדת? כן, הן בדיוק כמו כל הזמנה אחרת. | מוחלט |
| 11 | **חוב טכני אחרי הרפקטור (FR-2a)** — הזמנות קיימות עם `payplus_ref` ימופו ל-`payment_external_ref` במגרציה. צריך לוודא שכל הקוד הקיים (Server Actions, UI, queries) עודכן. סיכון לרגרסיה אם משהו מתפספס | פתוח — code-reviewer חובה לוודא 100% כיסוי לרפקטור |
| 12 | ~~**PayPlus חשבוניות — האם API שלהן באמת תומך ב-5 סוגי המסמכים שלנו?**~~ | ✅ **סגור (2026-05-30)** — אומת מול docs.payplus.co.il. כל 5 הסוגים נתמכים + מנגנון רציפות M:N (`close_doc`, `cancel_doc`) + בונוסים נוספים. ראה סעיף 12 למיפוי המלא |

---

## 11. תוספות נדרשות לתיעוד אחר

לאחר אישור ה-PRD ויישומו, יש לעדכן:

- **`prd/_shared/data-model.md`** — להוסיף את 5 הטבלאות החדשות (`payment_provider_settings`, `invoice_provider_settings`, `accounting_documents`, `accounting_document_lines`, `document_links`) + תיעוד שדות חדשים/ששינו שם ב-`orders` (`payment_external_ref` במקום `payplus_ref`, `payment_provider`, `payment_terms`, `invoice_document_id`). חשוב: להוסיף לתיעוד `accounting_documents` את העמודות `external_doc_series` (prefix אלפביתי של PayPlus) ו-`external_unique_identifier` (idempotency key)
- **`prd/_shared/glossary.md`** — להוסיף הגדרות: "תעודת משלוח", "חשבונית מס", "קבלה", "חשבונית מס-קבלה", "חשבונית זיכוי", "שוטף 30/60", "PaymentProvider", "InvoiceProvider", "Provider Adapter Pattern"
- **`prd/_shared/work-queue.md`** — להוסיף PRD #19a לרשימת MVP בין #16 (אשראי) ל-#17 (רווחיות). עדכון: סעיף 16 חסום עד 19a. עדכון טבלת ארכיטקטורת תשלומים: שורת "חשבוניות" עוברת מ-"Morning ראשון" ל-"PayPlus ב-MVP, Morning/iCount ב-P2"
- **`prd/feature-tree.md`** — סעיף 14 (Billing): "חיובים + קישור תשלום (PayPlus)" → להוסיף הערה על InvoiceProvider/PaymentProvider adapters. סעיף 15 (אינטגרציות): שורת "Morning (Greeninvoice)" → להעביר מ-[MVP] ל-[P2]; להוסיף "PayPlus Invoices ב-MVP". סעיף 19 (הנהלת חשבונות פנימית) — להפריד את התת-סעיף של מסמכים חשבונאיים ל-MVP (היום הוא כולו P2)
- **`prd/06-orders.md`** — לעדכן בהתאם לרפקטור FR-2a: שמות Edge Functions החדשים, שם עמודה חדש, הערה שה-PRD עבר רפקטור ע"י #19a
- **`pet_platform_tree.excalidraw`** — לסנכרן בהתאם (punch-list ב-`prd/_shared/excalidraw-sync.md`)

---

## 12. PayPlus API — אימות וחיווי ל-Adapter (2026-05-30)

אימות מקיף מול `docs.payplus.co.il/reference/*` סגר את סיכון #12. PayPlus תומך בכל 5 סוגי המסמכים שלנו + עוד 6 בונוסים, ויש מנגנון רציפות (M:N) מובנה.

### מיפוי 1:1 בין סוגי המסמכים שלנו ל-PayPlus doctype

| `accounting_documents.doc_type` (אצלנו) | `{doctype}` ב-PayPlus | endpoint |
|---|---|---|
| `delivery_note` | `crt_delivery` | `POST /books/docs/new/crt_delivery` |
| `tax_invoice` | `inv_tax` | `POST /books/docs/new/inv_tax` |
| `receipt` | `inv_receipt` | `POST /books/docs/new/inv_receipt` |
| `tax_invoice_receipt` | `inv_tax_receipt` | `POST /books/docs/new/inv_tax_receipt` |
| `credit_note` | `inv_refund` | `POST /books/docs/new/inv_refund` |

### רציפות M:N — מובנית ב-API

ה-PayPlus API מקבל שני פרמטרים שמממשים בדיוק את ה-`document_links` שלנו:

| `document_links.link_type` (אצלנו) | פרמטר ב-PayPlus | סמנטיקה |
|---|---|---|
| `invoice_aggregates_delivery_note` | `close_doc: <delivery_note_uuid>` | חשבונית "סוגרת" תעודת משלוח |
| `receipt_pays_invoice` | `close_doc: <invoice_uuid>` | קבלה "סוגרת" חשבונית |
| `tax_invoice_receipt_for_delivery` | `close_doc: <delivery_note_uuid>` + `transaction_uuid` | חשבונית מס-קבלה מיידית לתעודת משלוח |
| `credit_note_cancels_invoice` | `cancel_doc: <invoice_uuid>` | זיכוי מבטל חשבונית |
| `invoice_replaces_cancelled` | אין קישור ישיר ב-PayPlus | מקושר רק אצלנו ב-DB (לתצוגה ב-UI) |

### פרמטרים קריטיים ש-PayPlus מציעה (משדרגים את הארכיטקטורה)

| פרמטר | למה זה מעולה לנו |
|---|---|
| `draft: true` | מתאים בדיוק ל-state `draft` שלנו (חשבונית-טיוטה לאישור owner). PayPlus לא מנפיק מספר רץ עד שיוצא מ-draft |
| `preview: true` | תצוגה מקדימה לפני הוצאה (PDF preview ב-`DocumentPreviewDialog`) |
| `transaction_uuid` | קישור ישיר בין עסקת PayPlus (סליקה) לחשבונית — הזרימה "PayPlus paid → tax_invoice_receipt" הופכת לקריאה אחת |
| `unique_identifier` | **idempotency key** — אם webhook ירוץ פעמיים, PayPlus לא ייצור מסמך כפול. שמירה ב-`accounting_documents.external_unique_identifier` |
| `callback_url` | webhook אחרי הצלחה — אופציה לעדכון async במקום polling |
| `send_document_email`, `send_document_sms` | PayPlus יכולה לשלוח ללקוח ישירות. אופציונלי — נחליט אם להפעיל או לעשות זה דרך Green API ב-PRD #13 |
| `language: 'he' | 'en'` | תמיכה דו-לשונית מובנית |
| `vatType: vat-type-included/not-included/exempt` | תמיכה במע"מ ישראלי (כולל פטור — חשוב לאילת, סחר זר) |
| `tags: []` | תיוג חופשי — לסיווג עתידי בדוחות |

### מספור רץ — Series + Number

PayPlus מנהלת מספור רץ דרך שילוב של **series** (prefix אלפביתי, לדוגמה "A", "TAX", "CR") + **number** (חלק מספרי). זה אומר:
- ניתן להגדיר series נפרד לכל סוג מסמך → עומד בחוק ניהול ספרים (מספור רץ נפרד לכל סוג)
- צריך להוסיף עמודה `external_doc_series` ב-`accounting_documents` (TEXT, nullable)
- אחזור מסמך לפי number+series: `GET /books/docs/getby-number/{number}/{series}`

### בונוסים שנפתחים ב-Phase 2 (PayPlus תומך, אנחנו לא חייבים ב-MVP)

| `doctype` | עברית | שימוש פוטנציאלי ב-MasterPet |
|---|---|---|
| `inv_proforma` | חשבונית עסקה / פרופורמה | הצעת מחיר לעסקאות B2B גדולות, לפני הזמנה ממש |
| `crt_return` | תעודת החזרה | במקרה החזרת סחורה (פתיחת קופון לקוח) |
| `purchasedc_quote` | הצעת מחיר | quote לעסקאות גדולות, לפני אישור הזמנה |
| `order_purchase` | הזמנת רכש | רלוונטי ל-PRD #26 (קטלוג ספקים + חשבוניות ספקים) |
| `inv_pay_request` | דרישת תשלום | לשוטף 30/60 — אופציונלי לשליחה ללקוח לפני שהחשבונית נופקת רשמית |
| `inv_don_receipt` | קבלת תרומה | לא רלוונטי לנו |

### עדכוני schema נדרשים (קלים)

```sql
-- accounting_documents — הוספת שני שדות
ALTER TABLE accounting_documents
  ADD COLUMN external_doc_series TEXT,                  -- prefix מ-PayPlus
  ADD COLUMN external_unique_identifier TEXT;           -- idempotency key

-- index לאחזור מהיר לפי series+number
CREATE INDEX docs_external_series_number
  ON accounting_documents (tenant_id, external_provider, external_doc_series, external_doc_number);

-- index ל-idempotency lookups
CREATE UNIQUE INDEX docs_external_unique_id
  ON accounting_documents (tenant_id, external_provider, external_unique_identifier)
  WHERE external_unique_identifier IS NOT NULL;
```

### מסקנה ארכיטקטונית

ה-PayPlus API מתממש 1:1 עם ה-Adapter שתכננו, **ויותר מזה — חוסך לנו עבודה**:
- `document_links` לא צריך לוגיקה מורכבת בצד שלנו לסנכרון רציפות; ה-API מקבל UUIDs ומבצע את הקישור בעצמו
- `draft → issued` state transition פותר ע"י flag `draft: true/false` במקום state machine מסובך אצלנו
- idempotency חינם דרך `unique_identifier`
- `transaction_uuid` הופך את הזרימה "סליקה → חשבונית מס-קבלה" לקריאה אחת בלי תזמורת

**אומדן הפיתוח לא משתנה (~23 ימים)** — היה כבר תפוס לאדפטר מורכב. הדפוקומנטציה רק מאשרת שהוא לא יסתבך.
