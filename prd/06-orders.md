# PRD #6: Orders Management + Subscription

**פאזה:** MVP  
**תאריך:** 2026-05-26  
**סטטוס:** Done — DB + Actions + UI + Edge Functions + QA Automation (2026-05-26)  
**⚠️ רפקטור מתוכנן (Sprint 7-8):** PRD #19a FR-2a יבצע dual-write transition — `payplus_ref` → `payment_external_ref`, `fn-payplus-create-link` → `fn-create-payment-link`, `fn-payplus-webhook` → `fn-payment-webhook`. ראה `prd/19a-invoicing-documents.md` + `prd/_shared/decisions-log.md` (PRD #19a, החלטה 2). ייתוסף `payment_method='payment_link'` כניטרלי (`'payplus_link'` נשאר ל-backwards compat).  
**תלוי ב:** PRD #1 (Auth), PRD #3 (Products), PRD #5 (Customers)  
**חוסם:** PRD #2 (Inbox), PRD #7 (Notifications), PRD #8 (Loyalty)

---

## 1. סקירה כללית

מודול ההזמנות הוא הליבה הלוגיסטית של MasterPet. עובד יוצר הזמנה ידנית (לקוח + מוצרים + כמות), מנהל את מעבר הסטטוסים (ממתין → נמסר), שולח ללקוח קישור תשלום PayPlus, ומגדיר מנויים חוזרים שהמערכת מייצרת אוטומטית. ה-schema מוכן לקבל הזמנות גם מ-WooCommerce וגם מ-WhatsApp Green API, ברגע שאותם ערוצים יחוברו.

---

## 2. הבעיה שנפתרת

| | |
|---|---|
| **כאב** | בעל עסק עוקב אחרי הזמנות ב-WhatsApp, Excel, דף נייר — אין מסכנות, אין היסטוריה, אין שליטה |
| **מצב קיים** | כל לקוח מזמין ידנית, עובד מעדכן בצ'אט, תשלום עוקב ידנית. מנויים שבועיים — תזכורת בלוח |
| **מה יקרה אם לא נבנה** | Inbox (PRD #2) אין לאן להמיר הודעות; Loyalty, Notifications, ו-Analytics אין מה לחשב |

---

## 3. User Stories

### בעל עסק (owner)
- כ-**בעל עסק**, אני רוצה לראות את כל ההזמנות של כל הסניפים, כולל עלות ורווח, כדי שאוכל לנתח ביצועים.
- כ-**בעל עסק**, אני רוצה להגדיר מנוי ללקוח (X ק"ג כל Y ימים), כדי שהמערכת תייצר הזמנות אוטומטית בלי לזכור ידנית.

### עובד מכירות (sales)
- כ-**עובד מכירות**, אני רוצה לפתוח הזמנה חדשה, לבחור לקוח + מוצרים, ולשלוח ללקוח קישור PayPlus בלחיצה אחת.
- כ-**עובד מכירות**, אני רוצה לעדכן סטטוס הזמנה (אישור → בהכנה → בדרך → נמסר) כדי שהמנהל יראה בזמן אמת.

### מנהל מחסן (warehouse)
- כ-**מנהל מחסן**, אני רוצה לראות את ההזמנות שבשלב "בהכנה" בסניף שלי, לסמן "יצא לדרך", ולעדכן מלאי בהתאם.

### מנהל סניף (branch_manager)
- כ-**מנהל סניף**, אני רוצה לראות רק הזמנות הסניף שלי, לא של סניפים אחרים.

---

## 4. Functional Requirements

| # | דרישה | עדיפות |
|---|---|---|
| FR-1 | יצירת הזמנה ידנית: בחירת לקוח → הוספת פריטים (variant + כמות) → מחיר אוטומטי מהקטלוג | Must Have |
| FR-2 | 6 סטטוסים: `pending → confirmed → preparing → in_transit → delivered → cancelled`. כל מעבר נרשם ב-audit_log עם timestamp + actor | Must Have |
| FR-3 | שני סטטוסי תשלום: `payment_status` נפרד (`unpaid / link_sent / paid / refunded`) | Must Have |
| FR-4 | שליחת קישור PayPlus — כפתור ב-UI קורא Edge Function שמייצרת URL + מסמנת `link_sent` | Must Have |
| FR-5 | Webhook מ-PayPlus: הזמנה מסומנת `paid` אוטומטית + `confirmed` אם עדיין `pending` | Must Have |
| FR-6 | Snapshot שם מוצר + מחיר בזמן ההזמנה (לא JOIN חי לקטלוג) | Must Have |
| FR-7 | KPI Strip: הזמנות היום / ממתינות / מנויים פעילים / סה"כ חודשי | Must Have |
| FR-8 | סינון: סטטוס / תאריך / לקוח / ערוץ מקור (manual / woocommerce / whatsapp / subscription_auto) | Must Have |
| FR-9 | RLS לפי branch_id — sales ו-warehouse רואים רק הזמנות הסניף שלהם | Must Have |
| FR-10 | היסטוריית הזמנות בכרטיס לקוח (JOIN על orders, empty state נדרש) | Must Have |
| FR-11 | יצירת מנוי: לקוח + פריטים קבועים + תדירות (ימים) + תאריך הזמנה הבאה | Must Have |
| FR-12 | Edge Function + cron יומי: מייצר הזמנות ממנויים פעילים שהגיע זמנם (`next_order_at <= NOW()`) | Must Have |
| FR-13 | השהיית מנוי / ביטול מנוי — מסך subscriptions | Must Have |
| FR-14 | עמודת `cost_price` + `profit_pct` גלויה ל-owner בלבד (נאכף ב-SELECT, לא post-filter) | Should Have |
| FR-15 | `source` field מוכן לקבל `woocommerce` / `whatsapp` — הזמנות חיצוניות יגיעו דרך PRD #2 | Should Have |
| FR-16 | ייצוא הזמנות ל-CSV | Nice to Have |

---

## 5. UI/UX

- **כיוון:** RTL, עברית
- **Routes (Next.js App Router):**
  - `app/(dashboard)/orders/page.tsx` — רשימת כל ההזמנות + KPI Strip
  - `app/(dashboard)/orders/[id]/page.tsx` — פרטי הזמנה (timeline + פריטים + תשלום)
  - `app/(dashboard)/subscriptions/page.tsx` — רשימת מנויים פעילים + יצירה חדשה

- **shadcn/ui Components:** `DataTable`, `Sheet` (יצירת הזמנה/מנוי), `Badge` (סטטוס), `Card`, `Separator`, `Tabs` (הזמנות / מנויים), `Dialog` (אישור ביטול)

- **Flow — יצירת הזמנה:**
  1. לחיצה על "הזמנה חדשה" → Sheet נפתח מימין
  2. בחירת לקוח (Combobox — search by name/phone)
  3. הוספת פריטים: בחירת מוצר → variant → כמות → מחיר אוטומטי
  4. שורת סיכום: סה"כ לפני מע"מ, מע"מ, סה"כ לתשלום
  5. שמירה → הזמנה נוצרת בסטטוס `pending`
  6. כפתור "שלח קישור תשלום" → PayPlus URL נוצר + נשלח ל-WhatsApp הלקוח

- **Flow — עדכון סטטוס:**
  - בדף פרטי הזמנה: `StatusStepper` ויזואלי (6 עגולות) + כפתור "קדם סטטוס"
  - כל מעבר שמורשה לפי רול (sales לא יכול לעקוף בהכנה)

- **Flow — מנוי:**
  1. לחיצה על "מנוי חדש" → Sheet עם בחירת לקוח + פריטים + תדירות (dropdown: כל 7/14/21/30 ימים או ידני)
  2. תאריך הזמנה הבאה — ברירת מחדל: עכשיו + תדירות
  3. שמירה → מנוי פעיל. הזמנה ראשונה נוצרת מיד.

- **Empty State:** "עדיין אין הזמנות — לחץ 'הזמנה חדשה' כדי להתחיל"

---

## 6. Technical Spec

### DB Schema (Supabase)

```sql
-- הזמנות
CREATE TABLE orders (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID        NOT NULL REFERENCES tenants(id),
  branch_id       UUID        NOT NULL REFERENCES branches(id),
  customer_id     UUID        NOT NULL REFERENCES customers(id),
  created_by      UUID        NOT NULL REFERENCES users(id),
  subscription_id UUID        REFERENCES subscriptions(id),

  order_type      TEXT        NOT NULL DEFAULT 'one_time'
                              CHECK (order_type IN ('one_time', 'subscription')),
  source          TEXT        NOT NULL DEFAULT 'manual'
                              CHECK (source IN ('manual', 'woocommerce', 'whatsapp', 'subscription_auto')),

  status          TEXT        NOT NULL DEFAULT 'pending'
                              CHECK (status IN ('pending','confirmed','preparing','in_transit','delivered','cancelled')),

  payment_status  TEXT        NOT NULL DEFAULT 'unpaid'
                              CHECK (payment_status IN ('unpaid','link_sent','paid','refunded')),
  payment_method  TEXT        CHECK (payment_method IN ('payplus_link','woocommerce','cash','transfer','credit')),
  payment_link    TEXT,
  payplus_ref     TEXT,       -- מזהה עסקה מ-PayPlus

  subtotal        NUMERIC(10,2) NOT NULL DEFAULT 0,
  discount        NUMERIC(10,2) NOT NULL DEFAULT 0,
  vat_amount      NUMERIC(10,2) NOT NULL DEFAULT 0,
  total           NUMERIC(10,2) NOT NULL DEFAULT 0,

  delivery_address TEXT,
  delivery_date   DATE,
  notes           TEXT,
  external_id     TEXT,       -- WooCommerce order ID / WhatsApp message ID

  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
FORCE ROW LEVEL SECURITY ON orders;

CREATE POLICY "orders_tenant_isolation" ON orders
  FOR ALL USING (tenant_id = current_tenant_id());

-- sales ו-warehouse רואים רק הסניף שלהם
CREATE POLICY "orders_branch_isolation" ON orders
  FOR SELECT USING (
    current_user_role() IN ('owner', 'super_admin')
    OR branch_id = current_branch_id()
  );

-- פריטי הזמנה (snapshot בזמן ההזמנה)
CREATE TABLE order_items (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id      UUID        NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  tenant_id     UUID        NOT NULL REFERENCES tenants(id),
  variant_id    UUID        REFERENCES product_variants(id),  -- nullable אם מוצר נמחק

  product_name  TEXT        NOT NULL,   -- snapshot
  variant_desc  TEXT,                   -- snapshot (e.g. "1 ק"ג, עוף")
  sku           TEXT,                   -- snapshot
  quantity      NUMERIC(10,3) NOT NULL,
  unit_price    NUMERIC(10,2) NOT NULL, -- מחיר בזמן ההזמנה
  cost_price    NUMERIC(10,2),          -- עלות — owner בלבד
  vat_rate      NUMERIC(5,2) NOT NULL DEFAULT 18,
  total_price   NUMERIC(10,2) NOT NULL,

  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
FORCE ROW LEVEL SECURITY ON order_items;

CREATE POLICY "order_items_tenant_isolation" ON order_items
  FOR ALL USING (tenant_id = current_tenant_id());

-- מנויים
CREATE TABLE subscriptions (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID        NOT NULL REFERENCES tenants(id),
  branch_id       UUID        NOT NULL REFERENCES branches(id),
  customer_id     UUID        NOT NULL REFERENCES customers(id),
  created_by      UUID        NOT NULL REFERENCES users(id),

  frequency_days  INT         NOT NULL CHECK (frequency_days > 0),
  next_order_at   DATE        NOT NULL,

  status          TEXT        NOT NULL DEFAULT 'active'
                              CHECK (status IN ('active','paused','cancelled')),
  notes           TEXT,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
FORCE ROW LEVEL SECURITY ON subscriptions;

CREATE POLICY "subscriptions_tenant_isolation" ON subscriptions
  FOR ALL USING (tenant_id = current_tenant_id());

-- פריטי מנוי (template להזמנה)
CREATE TABLE subscription_items (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID        NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  tenant_id       UUID        NOT NULL REFERENCES tenants(id),
  variant_id      UUID        REFERENCES product_variants(id),

  product_name    TEXT        NOT NULL,   -- snapshot
  variant_desc    TEXT,
  quantity        NUMERIC(10,3) NOT NULL,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE subscription_items ENABLE ROW LEVEL SECURITY;
FORCE ROW LEVEL SECURITY ON subscription_items;

CREATE POLICY "subscription_items_tenant_isolation" ON subscription_items
  FOR ALL USING (tenant_id = current_tenant_id());

-- Indexes
CREATE INDEX orders_tenant_status ON orders (tenant_id, status);
CREATE INDEX orders_tenant_customer ON orders (tenant_id, customer_id);
CREATE INDEX orders_tenant_branch ON orders (tenant_id, branch_id);
CREATE INDEX orders_next_sub ON subscriptions (tenant_id, next_order_at) WHERE status = 'active';
```

---

### Edge Functions

| Function | Trigger | מטרה |
|---|---|---|
| `fn-payplus-create-link` | HTTP POST (Server Action) | קוראת ל-PayPlus API, מחזירה payment URL, מעדכנת `payment_link + payment_status='link_sent'` |
| `fn-payplus-webhook` | HTTP POST (PayPlus webhook) | מאמתת חתימת webhook, מעדכנת `payment_status='paid'`, מעדכנת `status='confirmed'` אם עדיין pending |
| `fn-subscription-cron` | Cron — כל יום 06:00 (pg_cron) | SELECT subscriptions WHERE next_order_at <= NOW() AND status='active' → INSERT order + order_items (מחיר נשלף מהקטלוג בזמן ריצה) → UPDATE next_order_at += frequency_days |

---

### Server Actions

| Action | Role | מה עושה |
|---|---|---|
| `createOrderAction` | sales, branch_manager, owner | יוצר order + order_items + totals. snapshot מחירים מ-product_variants |
| `updateOrderStatusAction` | לפי רול | מתקדם סטטוס בלבד (לא לאחור). מעגן audit_log |
| `cancelOrderAction` | branch_manager, owner | סטטוס = cancelled. אם paid → payment_status = refunded (ידני) |
| `sendPaymentLinkAction` | sales, branch_manager, owner | קורא ל-fn-payplus-create-link, מחזיר URL |
| `listOrdersAction` | כל roles | RLS + filters (status, date_from, date_to, customer_id, source) |
| `getOrderAction` | כל roles | order + items + customer snapshot |
| `createSubscriptionAction` | branch_manager, owner | יוצר subscription + subscription_items + הזמנה ראשונה |
| `updateSubscriptionStatusAction` | branch_manager, owner | active / paused / cancelled |
| `listSubscriptionsAction` | כל roles | RLS + filter by status |

---

### Frontend Components

| Component | Path | מטרה |
|---|---|---|
| `OrdersKpiStrip` | `orders/_components/OrdersKpiStrip.tsx` | 4 KPI tiles |
| `OrdersTable` | `orders/_components/OrdersTable.tsx` | DataTable + filters |
| `OrderSheet` | `orders/_components/OrderSheet.tsx` | יצירת הזמנה ידנית |
| `OrderDetail` | `orders/[id]/page.tsx` | פרטי הזמנה + StatusStepper + תשלום |
| `StatusStepper` | `orders/_components/StatusStepper.tsx` | ציר זמן ויזואלי — 6 שלבים |
| `OrderItemsEditor` | `orders/_components/OrderItemsEditor.tsx` | הוספת מוצרים + חישוב |
| `SubscriptionsTable` | `subscriptions/_components/SubscriptionsTable.tsx` | DataTable מנויים |
| `SubscriptionSheet` | `subscriptions/_components/SubscriptionSheet.tsx` | יצירת/עריכת מנוי |

---

## 7. Acceptance Criteria

- [ ] הזמנה ידנית — לקוח + מוצר + variant + כמות → נשמרת עם snapshot מחיר נכון
- [ ] 6 סטטוסים — מעבר חד-כיווני בלבד (לא ניתן לחזור ל-pending לאחר confirmed)
- [ ] RLS מאומת — tenant A לא רואה הזמנות tenant B
- [ ] Branch isolation — sales ו-warehouse רואים רק הסניף שלהם
- [ ] `cost_price` לא נשלח ב-network לרולים שאינם owner
- [ ] PayPlus link — כפתור מייצר URL תקין (sandbox mode בתחילה)
- [ ] PayPlus webhook — `payment_status='paid'` מתעדכן אוטומטית
- [ ] מנוי — Edge Function יוצרת הזמנה ביום הנכון, `next_order_at` מתעדכן
- [ ] היסטוריית הזמנות בכרטיס לקוח מציגה empty state נכון
- [ ] RTL נכון בכל ה-breakpoints
- [ ] Mobile responsive (min 375px)
- [ ] Loading / Empty / Error state בכל רשימה
- [ ] `tsc --noEmit` exit 0, `next build` ✅

---

## 8. פאזה ואומדן

| | |
|---|---|
| **פאזה** | MVP — Sprint 5-6 |
| **DB Migrations + RLS** | ~1 יום |
| **Server Actions + DAL** | ~2 ימים |
| **Orders UI (רשימה + Sheet + Detail)** | ~3 ימים |
| **Subscriptions UI** | ~2 ימים |
| **PayPlus Integration (Edge Functions)** | ~2 ימים |
| **Subscription Cron (Edge Function)** | ~1 יום |
| **סה"כ** | ~11 ימים |

---

## 9. תלויות

- **דורש:**
  - PRD #1 — Auth, RLS helpers (`current_tenant_id`, `current_user_role`, `current_branch_id`), `withAuth`, `writeAudit`
  - PRD #3 — `product_variants` + מחירים קיימים בקטלוג
  - PRD #5 — `customers` קיים (JOIN לשם, טלפון, כתובת)
  - PayPlus — API key + sandbox credentials

- **חוסם:**
  - PRD #2 (Inbox) — ממיר הודעות WhatsApp/WooCommerce ל-`orders` (source='whatsapp'/'woocommerce')
  - PRD #7 (Notifications) — שולח התראות על סטטוסים
  - PRD #8 (Loyalty) — צובר נקודות בעת `status='delivered'`
  - PRD #9 (Couriers) — PWA שמקבל הזמנות ב-`in_transit`

---

## 10. סיכונים ושאלות פתוחות

| # | שאלה / סיכון | סטטוס |
|---|---|---|
| 1 | PayPlus sandbox — צריך credentials לפיתוח. ב-production כל tenant מחבר חשבון PayPlus משלו | פתוח — לקבל credentials |
| 2 | pg_cron vs external cron — Supabase תומך ב-pg_cron. לוודא שה-plan הנוכחי כולל אותו | לאמת |
| 3 | snapshot מחיר — אם variant נמחק (soft delete), `variant_id` יהיה NULL אבל ה-snapshot שמור. מספיק ל-MVP | מוחלט |
| 4 | WooCommerce orders — כשיחובר (PRD #13), יגיעו כ-`source='woocommerce'`, `payment_status='paid'`, `status='confirmed'`. ה-schema מוכן | לא דורש שינוי |
| 5 | WhatsApp cart — ב-PRD #2 עובד בונה עגלה בתוך שיחת WhatsApp ושולח קישור PayPlus. ה-schema מוכן (`source='whatsapp'`) | לא דורש שינוי |
| 6 | מנוי + שינוי מחיר — אם מחיר variant עולה, הזמנה אוטומטית תשלוף מחיר חדש. לשקול האם לנעול מחיר על subscription_items | פתוח |
