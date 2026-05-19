# PRD: CRM — לקוחות + פרופילי חיות

**פאזה:** MVP (Sprint 5-6)
**תאריך:** 2026-05-19
**סטטוס:** Draft

---

## 1. סקירה כללית

מודול ה-CRM מנהל שני ישויות: **לקוח** (שם, טלפון, כתובת, ערוץ מועדף) ו**חיה** (גזע, משקל, גיל, יום הולדת, אלרגיות, מזון מועדף, קצב צריכה). לקוח יכול לשייך מספר חיות לפרופיל שלו. הנתונים מגיעים משני מקורות: ייבוא אוטומטי מ-WooCommerce והזנה ידנית על ידי עובד.

נתוני ה-CRM הם **מקור-האמת** לכל מנועי האוטומציה: חישוב אזילת מזון, שליחת WhatsApp ביום הולדת, המלצות מוצר — כולם תלויים בשדות של מודול זה.

---

## 2. הבעיה שנפתרת

| | |
|---|---|
| **כאב** | עסק לא זוכר מה הכלב של שרה אוכל, אם יש לו אלרגיה לעוף, ומתי נגמר לו האוכל |
| **מצב קיים** | פרטי לקוח מפוזרים בין WhatsApp, WooCommerce, פתקים — ללא מקור אחד |
| **מה יקרה אם לא נבנה** | לא ניתן לבנות אלגוריתם אזילה, Loyalty, ואוטומציות שיווק — כל הפיצ'רים האלו תלויים בנתוני CRM |

---

## 3. User Stories

### עובד מכירות (sales)
- As a **sales**, I want to look up a customer by phone number before taking an order so that I can see their pet's food preferences and allergies.
- As a **sales**, I want to add a new customer with their pet details manually so that the record is in the system immediately.
- As a **sales**, I want to see a customer's order history so that I can suggest a re-order of what they usually buy.

### מנהל סניף (branch_manager)
- As a **branch_manager**, I want to edit customer and pet profiles so that incorrect data can be fixed.
- As a **branch_manager**, I want to see all customers of my branch so that I have full visibility.

### בעל עסק (owner)
- As an **owner**, I want customer data to sync automatically from WooCommerce so that I don't re-enter existing customers.
- As an **owner**, I want to see customers across all branches so that I have a full business picture.

---

## 4. Functional Requirements

| # | דרישה | עדיפות |
|---|---|---|
| FR-1 | פרופיל לקוח: שם מלא, מספר טלפון (UNIQUE לפי tenant), כתובת, ערוץ מועדף (WhatsApp/טלפון/WooCommerce), הערות | Must Have |
| FR-2 | פרופיל חיה: שם, סוג חיה, גזע, משקל (ק"ג), תאריך לידה, אלרגיות (תגים חופשיים), מזון מועדף (מוצרים מהקטלוג) | Must Have |
| FR-3 | קצב צריכה (ק"ג/יום) — שדה ידני שעובד ממלא. **מקור-האמת לאלגוריתם אזילה** | Must Have |
| FR-4 | לקוח יכול לשייך מספר חיות לפרופיל שלו | Must Have |
| FR-5 | יצירת לקוח ידנית על ידי עובד + ייבוא אוטומטי מ-WooCommerce webhook | Must Have |
| FR-6 | Dedup לקוחות לפי מספר טלפון — אם לקוח קיים, WooCommerce מעדכן ולא מכפיל | Must Have |
| FR-7 | היסטוריית הזמנות לקוח — JOIN על טבלת orders, מוצגת בפרופיל (empty state נדרש) | Must Have |
| FR-8 | חיפוש לקוח לפי שם / טלפון / ערוץ | Must Have |
| FR-9 | RLS: sales ו-branch_manager רואים לקוחות הסניף בלבד; owner — הכל | Must Have |
| FR-10 | פילטר לקוחות: לפי ערוץ / חיה / תאריך הזמנה אחרונה | Should Have |
| FR-11 | מיזוג לקוחות כפולים (אותו לקוח עם 2 רשומות) — branch_manager בלבד | Should Have |
| FR-12 | ייצוא CSV של לקוחות לפי פילטר | Nice to Have |

### שדות פרופיל חיה — מלאים

| שדה | סוג | הערה |
|---|---|---|
| `name` | TEXT | שם החיה |
| `animal_type` | ENUM | dog / cat / bird / fish / rodent |
| `breed` | TEXT | גזע (טקסט חופשי) |
| `weight_kg` | NUMERIC | משקל בק"ג |
| `birth_date` | DATE | לחישוב גיל + התראת יום הולדת |
| `allergies` | TEXT[] | מוצרים/מרכיבים שגורמים לאלרגיה |
| `preferred_food_ids` | UUID[] | מוצרים מהקטלוג שהחיה אוהבת |
| `consumption_rate_kg_per_day` | NUMERIC | **קצב צריכה — מקור לאלגוריתם אזילה** |
| `notes` | TEXT | הערות כלליות |

---

## 5. UI/UX

- **כיוון:** RTL, עברית מלאה
- **Routes (Next.js App Router):**
  - `app/(dashboard)/crm/page.tsx` — רשימת לקוחות
  - `app/(dashboard)/crm/[customerId]/page.tsx` — פרופיל לקוח + חיות + היסטוריית הזמנות

- **shadcn/ui Components:**
  - `DataTable` — רשימת לקוחות עם sorting + filtering
  - `Sheet` — הוספת/עריכת לקוח
  - `Tabs` בפרופיל לקוח: "פרטים" | "חיות" | "הזמנות"
  - `Card` — כרטיס חיה עם כל השדות
  - `Badge` — סוג חיה + ערוץ מועדף + אלרגיות
  - `Combobox` — בחירת "מזון מועדף" מקטלוג המוצרים
  - `Timeline` — היסטוריית הזמנות (component משותף עם Orders)

- **Flow עיקרי — חיפוש + הצגה:**
  1. עובד מכיר טלפון → מחפש ב-`/crm` → לוחץ על הלקוח
  2. פרופיל נפתח בטאב "פרטים" — שם, ערוץ, כתובת
  3. טאב "חיות" — רשימת כרטיסי חיות כולל אלרגיות + קצב צריכה
  4. טאב "הזמנות" — רשימת הזמנות עם סטטוסים

- **Flow עיקרי — הוספת לקוח + חיה:**
  1. עובד לוחץ "+ לקוח חדש" → Sheet נפתח
  2. ממלא שם + טלפון + ערוץ → שומר
  3. כפתור "+ הוסף חיה" → Sheet נוסף עם שדות חיה
  4. שומר → כרטיס חיה מופיע בפרופיל

- **Empty State (ללא הזמנות):** "הלקוח עדיין לא ביצע הזמנות — לחץ ליצירת הזמנה ראשונה"
- **Empty State (ללא חיות):** "לא נרשמו חיות לפרופיל זה — לחץ להוספת חיה"

---

## 6. Technical Spec

### DB Schema (Supabase)

```sql
CREATE TABLE customers (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id        UUID        NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  branch_id        UUID        NOT NULL REFERENCES branches(id),
  full_name        TEXT        NOT NULL,
  phone            TEXT        NOT NULL,
  address          TEXT,
  preferred_channel TEXT       NOT NULL DEFAULT 'whatsapp'
                               CHECK (preferred_channel IN ('whatsapp', 'phone', 'woocommerce')),
  notes            TEXT,
  woo_customer_id  BIGINT,                          -- WooCommerce customer ID
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tenant_id, phone)                           -- Dedup לפי טלפון
);

CREATE TABLE pets (
  id                          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id                   UUID        NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  customer_id                 UUID        NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  name                        TEXT        NOT NULL,
  animal_type                 TEXT        NOT NULL CHECK (animal_type IN ('dog','cat','bird','fish','rodent')),
  breed                       TEXT,
  weight_kg                   NUMERIC(5,2),
  birth_date                  DATE,
  allergies                   TEXT[]      NOT NULL DEFAULT '{}',
  preferred_food_ids          UUID[]      NOT NULL DEFAULT '{}',  -- references products.id
  consumption_rate_kg_per_day NUMERIC(5,3),          -- מקור לאלגוריתם אזילה
  notes                       TEXT,
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_customers_tenant_phone  ON customers(tenant_id, phone);
CREATE INDEX idx_customers_tenant_branch ON customers(tenant_id, branch_id);
CREATE INDEX idx_customers_woo_id        ON customers(tenant_id, woo_customer_id);
CREATE INDEX idx_pets_customer           ON pets(customer_id);

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE pets      ENABLE ROW LEVEL SECURITY;

CREATE POLICY "customers_branch_access" ON customers
  FOR ALL USING (
    tenant_id = (auth.jwt() ->> 'tenant_id')::UUID
    AND (
      (auth.jwt() ->> 'role') IN ('owner', 'super_admin')
      OR branch_id = (auth.jwt() ->> 'branch_id')::UUID
    )
  );

CREATE POLICY "pets_access" ON pets
  FOR ALL USING (
    tenant_id = (auth.jwt() ->> 'tenant_id')::UUID
  );
```

### Edge Functions

| Function | Trigger | מטרה |
|---|---|---|
| `fn-woo-customer-sync` | WooCommerce `customer.created` / `customer.updated` webhook | Upsert לקוח לפי phone/woo_customer_id, Dedup אוטומטי |

### Server Actions

| Action | קובץ | מטרה |
|---|---|---|
| `createCustomerAction` | `crm/actions.ts` | יצירת לקוח ידנית |
| `updateCustomerAction` | `crm/actions.ts` | עדכון פרטי לקוח |
| `createPetAction` | `crm/actions.ts` | הוספת חיה ללקוח |
| `updatePetAction` | `crm/actions.ts` | עדכון פרופיל חיה |
| `mergeCustomersAction` | `crm/actions.ts` | מיזוג לקוחות כפולים (branch_manager בלבד) |

### Frontend Components

| Component | Path | מטרה |
|---|---|---|
| `CustomersTable` | `crm/_components/CustomersTable.tsx` | DataTable ראשי |
| `CustomerProfileTabs` | `crm/[id]/_components/CustomerProfileTabs.tsx` | Tabs: פרטים / חיות / הזמנות |
| `PetCard` | `crm/[id]/_components/PetCard.tsx` | כרטיס חיה עם כל השדות |
| `AddCustomerSheet` | `crm/_components/AddCustomerSheet.tsx` | Sheet הוספת לקוח |
| `AddPetSheet` | `crm/[id]/_components/AddPetSheet.tsx` | Sheet הוספת חיה |
| `CustomerOrderHistory` | `crm/[id]/_components/CustomerOrderHistory.tsx` | Timeline הזמנות |

---

## 7. קשר למנוע האוטומציות (PRD עתידי)

`consumption_rate_kg_per_day` + `birth_date` הם **שדות-קלט** בלבד ב-PRD זה. הלוגיקה שמחשבת "מתי האוכל נגמר" ושולחת WhatsApp ללקוח — שייכת ל-**PRD אוטומציות שיווק** (Rule Engine):

```
גודל אריזה שנרכשה ÷ consumption_rate_kg_per_day + תאריך קנייה = תאריך אזילה
```

מנהל יוצר כלל: "X ימים לפני תאריך אזילה → שלח WhatsApp ללקוח עם קישור להזמנה חוזרת".
גמישות נוספת: כלל כללי "לקוח שקנה X ימים ועוד לא הזמין → WhatsApp אוטומטי".

---

## 8. Acceptance Criteria

- [ ] חיפוש לקוח לפי טלפון מחזיר תוצאה תוך 300ms
- [ ] Dedup — לקוח WooCommerce עם אותו טלפון לא נכפל
- [ ] פרופיל חיה עם כל השדות — שמירה ועריכה תקינה
- [ ] `consumption_rate_kg_per_day` נשמר בדיוק של 3 ספרות אחרי הנקודה
- [ ] היסטוריית הזמנות מוצגת ב-JOIN עם orders — empty state כשאין הזמנות
- [ ] RLS — sales בסניף A לא רואה לקוחות סניף B
- [ ] WooCommerce sync — לקוח חדש ב-WooCommerce מופיע ב-CRM תוך 15 שניות
- [ ] מיזוג לקוחות — branch_manager בלבד, מבוצע עם אישור ב-Dialog
- [ ] RTL נכון בעברית + Mobile responsive

---

## 9. פאזה ואומדן

| | |
|---|---|
| **פאזה** | MVP — Sprint 5-6 |
| **DB Schema + RLS** | ~1 יום |
| **fn-woo-customer-sync + Server Actions** | ~2 ימים |
| **Frontend (Table + Profile + Pets)** | ~4 ימים |
| **סה"כ** | ~7 ימים |

---

## 10. תלויות

- **דורש:** PRD #1 (Auth/RBAC) — tenant_id, branch_id, roles
- **דורש:** PRD #4 (Inventory) — `preferred_food_ids` מפנה ל-`products.id`
- **חוסם:** PRD אוטומציות שיווק — `consumption_rate_kg_per_day` ו-`birth_date` חייבים להיות ב-DB לפני שהאוטומציה מחשבת

---

## 11. סיכונים ושאלות פתוחות

| # | שאלה / סיכון | סטטוס |
|---|---|---|
| 1 | לקוח שמזמין מ-WhatsApp וגם מ-WooCommerce — Dedup לפי טלפון, אבל מה אם הטלפון שונה בין שתי הפלטפורמות? | פתוח |
| 2 | `consumption_rate_kg_per_day` — האם מחושב אוטומטית מרכישות (גודל אריזה ÷ ימים) או רק ידני? (הידני עדיף לMVP, אוטומטי בהמשך) | פתוח |
| 3 | גיל חיה — האם מוצג כ"גיל מחושב" (TODAY - birth_date) או שנשמר ישירות? | פתוח |
| 4 | הרשאות מחיקת לקוח — רק owner? אפשרות "מחיקה רכה" (soft delete)? | פתוח |
