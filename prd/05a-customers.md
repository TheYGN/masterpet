# PRD: #5א — לקוחות (Customers)

**פאזה:** MVP — Sprint 5  
**תאריך:** 2026-05-25  
**סטטוס:** Draft

---

## 1. סקירה כללית

מודול ניהול לקוחות הוא מאגר הזהות המרכזי של כל עסק ב-MasterPet. הוא מאחסן את פרטי הקשר, הסניף המשויך, ערוץ התקשורת המועדף, ופועל כנקודת ציר לכל ההזמנות העתידיות. ברגע שיש לקוח — ניתן לפתוח הזמנה (PRD #6), לשלוח הודעה אוטומטית (PRD #8), ולהפעיל מנוע אזילה (PRD #14). בלי Customers — שאר ה-pipeline עצור.

---

## 2. הבעיה שנפתרת

| | |
|---|---|
| **כאב** | בעל עסק מנהל לקוחות ב-Excel / WhatsApp contacts / נייר. אין מקום מרכזי לראות מי הלקוח, מה ההיסטוריה שלו, ואיך ליצור איתו קשר |
| **מצב קיים** | אין טבלת customers ב-DB. Orders (PRD #6) לא יכול להתחיל בלי customer_id |
| **מה יקרה אם לא נבנה** | PRD #6 (Orders) חסום. PRD #8 (Notifications) חסום. PRD #14 (מנוע אזילה) חסום |

---

## 3. User Stories

### בעל עסק (owner)
- As an **owner**, I want to search a customer by name or phone so that I can quickly pull up their profile before taking an order.
- As an **owner**, I want to add a new customer manually so that I can register walk-in or phone customers on the spot.
- As an **owner**, I want to see a customer's full order history so that I can understand their purchasing patterns.
- As an **owner**, I want to import customers from Excel so that I can migrate from my existing system without re-entering data.
- As an **owner**, I want to mark a customer as inactive so that they stop appearing in active lists without losing their history.

### מנהל סניף (branch_manager)
- As a **branch_manager**, I want to add and edit customers in my branch so that my sales team has up-to-date contact info.
- As a **branch_manager**, I want to see only my branch's customers so that I'm not distracted by other branches' data.

### עובד מכירות (sales)
- As a **sales** employee, I want to look up a customer by phone so that I can identify who's calling or messaging.
- As a **sales** employee, I cannot edit customer details so that data integrity is maintained.

### מנהל מחסן (warehouse)
- As a **warehouse** manager, I want to see the customer's delivery address so that I can prepare shipments correctly.

---

## 4. Functional Requirements

| # | דרישה | עדיפות |
|---|---|---|
| FR-1 | רשימת לקוחות עם חיפוש חי לפי שם ו/או טלפון | Must Have |
| FR-2 | הוספת לקוח ידנית (Sheet) — שם, טלפון, אימייל, כתובת, עיר, ערוץ מועדף, הערות, סניף משויך | Must Have |
| FR-3 | עריכת פרטי לקוח קיים | Must Have |
| FR-4 | כרטיס לקוח — דף מלא עם כל הפרטים + היסטוריית הזמנות (empty state עד שPRD #6 קיים) | Must Have |
| FR-5 | soft delete — "הסרת לקוח" מסמנת deleted_at, לא מוחקת | Must Have |
| FR-6 | ייחודיות טלפון per-tenant — לא ניתן לרשום אותו מספר פעמיים באותו עסק | Must Have |
| FR-7 | RLS: owner רואה כל הלקוחות; branch_manager + sales + warehouse — הסניף שלהם בלבד | Must Have |
| FR-8 | sales ו-warehouse: קריאה בלבד — אין כפתורי עריכה/מחיקה בממשק | Must Have |
| FR-9 | ייבוא מ-CSV/Excel — שימוש ב-Import Engine (PRD #4). mapping: full_name, phone, email, address, city, preferred_channel, notes | Should Have |
| FR-10 | סינון רשימה לפי סניף (לבעל עסק) + סינון לפי סטטוס (פעיל / לא פעיל) | Should Have |
| FR-11 | KPI strip בראש הדף: סה"כ לקוחות פעילים, חדשים החודש | Should Have |
| FR-12 | תאריך הצטרפות (created_at) מוצג בכרטיס הלקוח | Nice to Have |

---

## 5. UI/UX

- **כיוון:** RTL, עברית
- **Routes (Next.js App Router):**
  - `app/(dashboard)/customers/page.tsx` — רשימת לקוחות (DataTable + KPI strip + חיפוש + Sheet ליצירה/עריכה)
  - `app/(dashboard)/customers/[id]/page.tsx` — כרטיס לקוח מלא (פרטים + היסטוריית הזמנות)

- **shadcn/ui Components:** DataTable, Sheet, Form, Input, Select, Badge, Button, Card, Separator, Skeleton, Tooltip

- **Flow עיקרי — הוספת לקוח:**
  1. בעל עסק לוחץ "הוסף לקוח" → Sheet נפתח מימין
  2. ממלא: שם מלא (חובה), טלפון (חובה), אימייל, כתובת + עיר, ערוץ מועדף, סניף משויך, הערות
  3. לחיצה על "שמור" → validation → createCustomerAction → Sheet נסגר → router.refresh()
  4. שורה חדשה מופיעה בטבלה

- **Flow עיקרי — חיפוש וצפייה:**
  1. בעל עסק מקליד בשורת חיפוש (שם / טלפון) — תוצאות מסתננות חי (client-side על הנתונים שנטענו)
  2. לחיצה על שורה → ניווט ל-`/customers/[id]`
  3. כרטיס לקוח מציג: כל הפרטים + כרטיסייה "הזמנות" (empty state: "עדיין אין הזמנות ללקוח זה")

- **Empty State (רשימה ריקה):** אייקון אנשים + "עדיין אין לקוחות. הוסף לקוח ידנית או ייבא מ-Excel."

- **Validation errors בעברית:**
  - שם קצר מדי → "שם חייב להכיל לפחות 2 תווים"
  - טלפון כפול → "מספר הטלפון כבר רשום ללקוח אחר"
  - חסר שדה חובה → "שדה חובה"

---

## 6. Technical Spec

### DB Schema (Supabase)

```sql
CREATE TABLE public.customers (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         UUID        NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  branch_id         UUID        REFERENCES public.branches(id) ON DELETE SET NULL,
  full_name         TEXT        NOT NULL CHECK (length(trim(full_name)) >= 2),
  phone             TEXT        NOT NULL,
  email             TEXT,
  address           TEXT,
  city              TEXT,
  preferred_channel TEXT        NOT NULL DEFAULT 'whatsapp'
                                CHECK (preferred_channel IN ('whatsapp', 'phone', 'email')),
  notes             TEXT,
  status            TEXT        NOT NULL DEFAULT 'active'
                                CHECK (status IN ('active', 'inactive')),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at        TIMESTAMPTZ
);

-- ייחודיות טלפון per-tenant (רק לרשומות שלא נמחקו)
CREATE UNIQUE INDEX customers_tenant_phone_unique
  ON public.customers(tenant_id, phone)
  WHERE deleted_at IS NULL;

CREATE INDEX customers_tenant_id_idx  ON public.customers(tenant_id);
CREATE INDEX customers_branch_id_idx  ON public.customers(branch_id);
CREATE INDEX customers_status_idx     ON public.customers(tenant_id, status)
  WHERE deleted_at IS NULL;

-- updated_at trigger
CREATE TRIGGER set_customers_updated_at
  BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers FORCE ROW LEVEL SECURITY;

-- owner: כל לקוחות ה-tenant
CREATE POLICY "customers_owner_all" ON public.customers
  FOR ALL
  USING (
    tenant_id = current_tenant_id()
    AND current_user_role() = 'owner'
    AND deleted_at IS NULL
  )
  WITH CHECK (tenant_id = current_tenant_id());

-- branch_manager: לקוחות הסניף שלו — קריאה + כתיבה
CREATE POLICY "customers_branch_manager" ON public.customers
  FOR ALL
  USING (
    tenant_id = current_tenant_id()
    AND current_user_role() = 'branch_manager'
    AND branch_id = current_branch_id()
    AND deleted_at IS NULL
  )
  WITH CHECK (
    tenant_id = current_tenant_id()
    AND branch_id = current_branch_id()
  );

-- sales + warehouse: קריאה בלבד, הסניף שלהם
CREATE POLICY "customers_read_only" ON public.customers
  FOR SELECT
  USING (
    tenant_id = current_tenant_id()
    AND current_user_role() IN ('sales', 'warehouse')
    AND branch_id = current_branch_id()
    AND deleted_at IS NULL
  );
```

### Server Actions

| Action | הרשאה | מה עושה |
|---|---|---|
| `listCustomersAction` | כל הרולים | מחזיר לקוחות לפי RLS + filters (status, branch_id, search) |
| `getCustomerAction` | כל הרולים | לקוח בודד לפי id |
| `createCustomerAction` | owner, branch_manager | INSERT + audit `customer.created` |
| `updateCustomerAction` | owner, branch_manager | PATCH + audit `customer.updated` |
| `deleteCustomerAction` | owner | soft delete (deleted_at = NOW()) + audit `customer.deleted` |
| `importCustomersAction` | owner, branch_manager | wrapper על Import Engine עם mapping לשדות customers |

### Frontend Components

| Component | Path | מטרה |
|---|---|---|
| `CustomersClient` | `app/(dashboard)/customers/_components/CustomersClient.tsx` | state (search, sheet open, editing) |
| `CustomersTable` | `app/(dashboard)/customers/_components/CustomersTable.tsx` | DataTable + חיפוש client-side |
| `CustomerSheet` | `app/(dashboard)/customers/_components/CustomerSheet.tsx` | Sheet ליצירה + עריכה |
| `CustomerKpiStrip` | `app/(dashboard)/customers/_components/CustomerKpiStrip.tsx` | KPI: פעילים, חדשים החודש |
| `CustomerCard` | `app/(dashboard)/customers/[id]/_components/CustomerCard.tsx` | כרטיס לקוח מלא |
| `OrderHistoryTable` | `app/(dashboard)/customers/[id]/_components/OrderHistoryTable.tsx` | היסטוריית הזמנות (empty state) |

### Types

```typescript
// src/app/(dashboard)/customers/types.ts

export type PreferredChannel = 'whatsapp' | 'phone' | 'email';
export type CustomerStatus   = 'active' | 'inactive';

export interface Customer {
  id:                string;
  tenant_id:         string;
  branch_id:         string | null;
  full_name:         string;
  phone:             string;
  email:             string | null;
  address:           string | null;
  city:              string | null;
  preferred_channel: PreferredChannel;
  notes:             string | null;
  status:            CustomerStatus;
  created_at:        string;
  updated_at:        string;
}

export interface CustomerListItem extends Customer {
  branch_name: string | null; // JOIN על branches
}

export interface CreateCustomerInput {
  full_name:         string;
  phone:             string;
  email?:            string;
  address?:          string;
  city?:             string;
  preferred_channel: PreferredChannel;
  notes?:            string;
  branch_id?:        string;
  status?:           CustomerStatus;
}

export type UpdateCustomerInput = Partial<CreateCustomerInput>;

export interface ListCustomersFilters {
  search?:    string;  // full_name ILIKE | phone ILIKE
  status?:    CustomerStatus;
  branch_id?: string;
}
```

---

## 7. Acceptance Criteria

- [ ] רשימת לקוחות נטענת — DataTable עם שם, טלפון, עיר, סניף, ערוץ מועדף, סטטוס
- [ ] חיפוש לפי שם ולפי טלפון (client-side, מיידי)
- [ ] הוספת לקוח ידנית: Sheet נפתח, ולידציה, שמירה, שורה חדשה מופיעה בלי רענון דף
- [ ] עריכה: לחיצה על שורה → Sheet עם פרטים מולאים → שינוי → שמירה
- [ ] soft delete: "הסר" → לקוח נעלם מהרשימה, נשמר ב-DB עם deleted_at
- [ ] טלפון כפול → שגיאה בעברית "מספר הטלפון כבר רשום"
- [ ] RLS מאומת: tenant A לא רואה לקוחות של tenant B
- [ ] branch_manager רואה רק לקוחות הסניף שלו
- [ ] sales ו-warehouse: אין כפתורי הוספה/עריכה/מחיקה בממשק
- [ ] כרטיס לקוח (`/customers/[id]`): כל הפרטים + כרטיסיית "הזמנות" (empty state תקין)
- [ ] ייבוא CSV: Import Engine עם mapping לשדות customers — preview + validation + import
- [ ] KPI strip: לקוחות פעילים + חדשים החודש
- [ ] `tsc --noEmit` — 0 errors
- [ ] RTL תקין בכל ה-breakpoints (375px, 768px, 1440px)

---

## 8. פאזה ואומדן

| | |
|---|---|
| **פאזה** | MVP |
| **Sprint** | Sprint 5 |
| **DB + RLS** | ~0.5 יום |
| **Server Actions + Types** | ~1 יום |
| **UI — רשימה + Sheet** | ~2 ימים |
| **כרטיס לקוח + היסטוריית הזמנות (empty state)** | ~1 יום |
| **CSV Import integration** | ~0.5 יום |
| **סה"כ** | ~5 ימים |

---

## 9. תלויות

- **דורש:**
  - PRD #1 — Auth/RBAC (tenants, branches, users, RLS functions) ✅ קיים
  - PRD #3 — Products DB (set_updated_at trigger) ✅ קיים
  - PRD #4 — CSV Import Engine ✅ קיים
- **חוסם:**
  - PRD #5ב — Pet Profiles (customer_id FK)
  - PRD #6 — Orders (customer_id FK)
  - PRD #8 — Notifications (preferred_channel)
  - PRD #14 — מנוע אזילה ידני

---

## 10. סיכונים ושאלות פתוחות

| # | שאלה / סיכון | סטטוס |
|---|---|---|
| 1 | האם לקוח יכול להיות משויך ליותר מסניף אחד? (כרגע: branch_id אחד בלבד) | פתוח — MVP: סניף אחד |
| 2 | כשמייבאים לקוחות מ-CSV ויש התנגשות טלפון — skip / merge / replace? (כבר נפתר ב-Import Engine) | סגור — DuplicateDialog קיים |
| 3 | האם sales יכול ליצור לקוח בשעת מכירה? (כרגע: לא — branch_manager מעלה) | פתוח — לשקול ב-Sprint 5 |
| 4 | format טלפון — האם לאחד לפורמט אחיד (972-5X)? | פתוח — MVP: TEXT חופשי + UNIQUE |
| 5 | היסטוריית הזמנות — empty state עד PRD #6. לוודא שה-JOIN לא נשבר כשה-orders table לא קיימת | סגור — SELECT ריק = empty state |
