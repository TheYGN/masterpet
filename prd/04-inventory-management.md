# PRD: ניהול מלאי + מוצרים

**פאזה:** MVP (Sprint 3-4)
**תאריך:** 2026-05-19
**סטטוס:** Draft

---

## 1. סקירה כללית

מודול המלאי מנהל שני דברים: **מוצרים** (קטלוג עם טקסונומיה לעולם חיות המחמד) ו**כמויות** (מלאי בפועל לפי סניף). כל הזמנה שעוברת לסטטוס "מאושרת" מורידה מהמלאי אוטומטית — ואם המלאי לא מספיק, ההזמנה נחסמת. מנהל מחסן ומנהל סניף מעדכנים קבלת סחורה. בעל העסק מגדיר רף התראה לכל מוצר ומקבל עדכון כשמוצר יורד מתחתיו.

---

## 2. הבעיה שנפתרת

| | |
|---|---|
| **כאב** | עובד מוכר שק 7 ק"ג שנגמר — מגלה את זה רק בשעת האריזה. הזמנה מתעכבת, לקוח מאוכזב |
| **מצב קיים** | ספירות מלאי ידניות באקסל, לא מסונכרנות עם ה-WooCommerce |
| **מה יקרה אם לא נבנה** | לא ניתן לחסום הזמנות ריאליות, ואין נראות לבעל העסק על מצב המחסן |

---

## 3. User Stories

### מנהל מחסן (warehouse)
- As a **warehouse**, I want to log new stock arrivals so that the inventory is always up to date.
- As a **warehouse**, I want to see current stock levels for all products in my branch so that I can prioritize packing.

### מנהל סניף (branch_manager)
- As a **branch_manager**, I want to update stock when a shipment arrives so that sales can take orders immediately.
- As a **branch_manager**, I want to set a low-stock threshold per product so that I'm alerted before running out.

### עובד מכירות (sales)
- As a **sales**, I want to see real-time availability when taking an order so that I don't promise something that's out of stock.

### בעל עסק (owner)
- As an **owner**, I want to manage the product catalog with pet-specific taxonomy so that products are easy to filter.
- As an **owner**, I want to receive a WhatsApp alert when a product drops below its threshold so that I can reorder in time.
- As an **owner**, I want to toggle low-stock alerts on/off per product so that I'm only notified on what matters.

---

## 4. Functional Requirements

| # | דרישה | עדיפות |
|---|---|---|
| FR-1 | קטלוג מוצרים עם שדות: שם, SKU, ברקוד, תיאור, מחיר, תמונה | Must Have |
| FR-2 | טקסונומיה כתגים מרובים: חיה (כלב/חתול/ציפור/דג/מכרסם), גיל (גור/בוגר/זקן), דיאטה (רגיל/ללא דגנים/רפואי/טבעוני), גזע (גדול/בינוני/קטן) | Must Have |
| FR-3 | מלאי לפי סניף — כמות נפרדת לכל (product_id, branch_id) | Must Have |
| FR-4 | קבלת סחורה: warehouse ו-branch_manager מוסיפים כמות + הערה | Must Have |
| FR-5 | כשהזמנה עוברת ל-`approved` — מלאי יורד אוטומטית. אם אין מספיק — מעבר הסטטוס נחסם | Must Have |
| FR-6 | הגדרת רף התראה לכל מוצר (לפי owner/branch_manager) — ברירת מחדל ניתן לשינוי | Must Have |
| FR-7 | התראת מלאי נמוך: in-app notification + WhatsApp (דרך Green API) — ניתן להפעיל/לכבות לכל מוצר | Must Have |
| FR-8 | Badge "מלאי נמוך" על מוצר ברשימה כשיורד מתחת לרף | Must Have |
| FR-9 | RLS: warehouse ו-sales רואים מלאי הסניף שלהם בלבד; branch_manager — סניפו; owner — הכל | Must Have |
| FR-10 | היסטוריית תנועות מלאי: כל שינוי (קבלה / הורדה על הזמנה / תיקון ידני) עם timestamp + user | Must Have |
| FR-11 | פילטר מוצרים לפי טקסונומיה (חיה / גיל / דיאטה / גזע / מלאי נמוך) | Must Have |
| FR-12 | WooCommerce Sync — כשמלאי משתנה ב-MasterPet → דחיפה ל-WooCommerce דרך REST API | Should Have |
| FR-13 | ייבוא מוצרים בכמות מ-CSV (שם, SKU, מחיר, תגים) | Should Have |
| FR-14 | ספירת מלאי: warehouse יכול לבצע "ספירה" — הזנת כמות בפועל והמערכת מחשבת הפרש | Nice to Have |

---

## 5. UI/UX

- **כיוון:** RTL, עברית מלאה
- **Routes (Next.js App Router):**
  - `app/(dashboard)/inventory/page.tsx` — רשימת מוצרים עם כמויות
  - `app/(dashboard)/inventory/[id]/page.tsx` — פרטי מוצר + תנועות + הגדרת התראה
  - `app/(dashboard)/inventory/receive/page.tsx` — טופס קבלת סחורה

- **shadcn/ui Components:**
  - `DataTable` — רשימת מוצרים עם sorting + filtering
  - `Badge` — תגי טקסונומיה + "מלאי נמוך" (אדום)
  - `Sheet` — עריכת מוצר / הוספת מוצר חדש
  - `Form` + `NumberInput` — טופס קבלת סחורה
  - `Switch` — הפעלת/כיבוי התראת מלאי לכל מוצר
  - `Slider` + `NumberInput` — הגדרת רף התראה
  - `Timeline` — היסטוריית תנועות מלאי (component משותף עם Orders)

- **Flow עיקרי — קבלת סחורה:**
  1. warehouse פותח `/inventory/receive`
  2. מחפש מוצר (autocomplete לפי שם/SKU)
  3. מזין כמות שהתקבלה + הערה אופציונלית
  4. שומר → מלאי עולה, תנועה נרשמת

- **Flow עיקרי — הגדרת התראה:**
  1. owner/branch_manager נכנס לדף מוצר
  2. ב-section "התראות" → Switch "הפעל התראת מלאי נמוך"
  3. Slider/Input לרף: "שלח התראה כשנשאר פחות מ-X יחידות"
  4. Toggle "WhatsApp" / "התראה פנימית בלבד"

- **Empty State (ללא מוצרים):** "אין מוצרים בקטלוג — לחץ להוספת מוצר ראשון או ייבוא מ-CSV"
- **מצב מלאי 0:** שורת מוצר מוצגת עם רקע אדום בהיר + badge "אזל מהמלאי"

---

## 6. Technical Spec

### DB Schema (Supabase)

```sql
-- קטלוג מוצרים
CREATE TABLE products (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    UUID        NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name         TEXT        NOT NULL,
  sku          TEXT        NOT NULL,
  barcode      TEXT,
  description  TEXT,
  unit_price   NUMERIC(10,2) NOT NULL DEFAULT 0,
  image_url    TEXT,
  -- טקסונומיה כ-arrays (מוצר יכול להיות במספר קטגוריות)
  animal_types TEXT[]      NOT NULL DEFAULT '{}',  -- dog, cat, bird, fish, rodent
  age_groups   TEXT[]      NOT NULL DEFAULT '{}',  -- puppy, adult, senior
  diet_types   TEXT[]      NOT NULL DEFAULT '{}',  -- regular, grain_free, medical, vegan
  size_groups  TEXT[]      NOT NULL DEFAULT '{}',  -- small, medium, large
  is_active    BOOLEAN     NOT NULL DEFAULT TRUE,
  woo_product_id BIGINT,                           -- WooCommerce product ID לסנכרון
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tenant_id, sku)
);

-- מלאי לפי סניף
CREATE TABLE inventory (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    UUID        NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  product_id   UUID        NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  branch_id    UUID        NOT NULL REFERENCES branches(id),
  quantity     INTEGER     NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  alert_enabled BOOLEAN   NOT NULL DEFAULT TRUE,
  alert_threshold INTEGER  NOT NULL DEFAULT 5,
  alert_whatsapp BOOLEAN  NOT NULL DEFAULT FALSE,
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(product_id, branch_id)
);

-- היסטוריית תנועות מלאי
CREATE TABLE inventory_movements (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    UUID        NOT NULL REFERENCES tenants(id),
  product_id   UUID        NOT NULL REFERENCES products(id),
  branch_id    UUID        NOT NULL REFERENCES branches(id),
  movement_type TEXT       NOT NULL CHECK (movement_type IN ('receive','order_deduct','manual_adjust','count_correction')),
  quantity_delta INTEGER   NOT NULL,               -- חיובי = נכנס, שלילי = יצא
  quantity_after INTEGER   NOT NULL,               -- כמות אחרי התנועה
  reference_id  UUID,                              -- order_id אם movement_type='order_deduct'
  notes         TEXT,
  created_by    UUID        NOT NULL REFERENCES users(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_products_tenant         ON products(tenant_id);
CREATE INDEX idx_products_animal_types   ON products USING GIN(animal_types);
CREATE INDEX idx_products_woo_id         ON products(tenant_id, woo_product_id);
CREATE INDEX idx_inventory_product_branch ON inventory(product_id, branch_id);
CREATE INDEX idx_inventory_low_stock     ON inventory(tenant_id, branch_id) WHERE quantity <= alert_threshold;
CREATE INDEX idx_movements_product       ON inventory_movements(product_id, branch_id, created_at DESC);

ALTER TABLE products            ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory           ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_movements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "products_access" ON products
  FOR ALL USING (tenant_id = (auth.jwt() ->> 'tenant_id')::UUID);

CREATE POLICY "inventory_branch_access" ON inventory
  FOR ALL USING (
    tenant_id = (auth.jwt() ->> 'tenant_id')::UUID
    AND (
      (auth.jwt() ->> 'role') IN ('owner', 'super_admin')
      OR branch_id = (auth.jwt() ->> 'branch_id')::UUID
    )
  );

CREATE POLICY "movements_access" ON inventory_movements
  FOR ALL USING (
    tenant_id = (auth.jwt() ->> 'tenant_id')::UUID
    AND (
      (auth.jwt() ->> 'role') IN ('owner', 'super_admin')
      OR branch_id = (auth.jwt() ->> 'branch_id')::UUID
    )
  );
```

### Edge Functions

| Function | Trigger | מטרה |
|---|---|---|
| `fn-inventory-deduct` | נקרא מ-`updateOrderStatusAction` כשסטטוס → `approved` | מוריד כמות + בודק מלאי מספיק + חוסם אם לא |
| `fn-inventory-alert` | נקרא אחרי כל שינוי מלאי | בודק אם ירד מתחת לרף → שולח in-app + WhatsApp (אם מופעל) |
| `fn-woo-stock-push` | נקרא אחרי כל שינוי מלאי (async) | דוחף כמות מעודכנת ל-WooCommerce REST API |

#### fn-inventory-deduct — לוגיקה קריטית

```typescript
// קבלת order_id + branch_id
// SELECT items מה-order
// לכל item: SELECT quantity FROM inventory WHERE product_id=? AND branch_id=?
// אם quantity < required → throw InsufficientStockError (חוסם את מעבר הסטטוס)
// אחרת: UPDATE inventory SET quantity = quantity - required
// INSERT inventory_movements (movement_type='order_deduct', quantity_delta=-X)
// קריאה ל-fn-inventory-alert
```

### Server Actions

| Action | קובץ | מטרה |
|---|---|---|
| `receiveStockAction` | `inventory/actions.ts` | קבלת סחורה + INSERT movement |
| `updateAlertSettingsAction` | `inventory/actions.ts` | עדכון alert_enabled / alert_threshold / alert_whatsapp |
| `adjustInventoryAction` | `inventory/actions.ts` | תיקון ידני + INSERT movement (branch_manager בלבד) |
| `createProductAction` | `inventory/actions.ts` | הוספת מוצר חדש לקטלוג |
| `importProductsCSVAction` | `inventory/actions.ts` | ייבוא CSV — parse + bulk insert |

### Frontend Components

| Component | Path | מטרה |
|---|---|---|
| `InventoryTable` | `inventory/_components/InventoryTable.tsx` | DataTable עם מוצרים + כמויות + badges |
| `TaxonomyFilter` | `inventory/_components/TaxonomyFilter.tsx` | פילטרי תגים (multi-select) |
| `ReceiveStockForm` | `inventory/receive/_components/ReceiveStockForm.tsx` | טופס קבלת סחורה |
| `AlertSettings` | `inventory/[id]/_components/AlertSettings.tsx` | Switch + Slider לרף התראה |
| `MovementTimeline` | `inventory/[id]/_components/MovementTimeline.tsx` | היסטוריית תנועות מלאי |
| `LowStockBadge` | `inventory/_components/LowStockBadge.tsx` | Badge משותף (אדום / כתום) |

---

## 7. Acceptance Criteria

- [ ] הזמנה עם מלאי מספיק — עוברת לאישור ומלאי יורד אוטומטית
- [ ] הזמנה עם מלאי לא מספיק — נחסמת, הודעת שגיאה ברורה לעובד
- [ ] קבלת סחורה — מלאי עולה, תנועה נרשמת עם user + timestamp
- [ ] התראת מלאי נמוך — in-app notification מופיעה כשמוצר יורד מתחת לרף
- [ ] WhatsApp התראה — נשלחת רק אם `alert_whatsapp=true`
- [ ] Toggle כיבוי/הפעלה התראה עובד per-product
- [ ] RLS — warehouse בסניף A לא רואה מלאי סניף B
- [ ] owner רואה מלאי כל הסניפים בצפייה מאוחדת
- [ ] מוצר עם 0 במלאי מוצג עם badge "אזל מהמלאי"
- [ ] פילטר לפי חיה / גיל / דיאטה עובד עם multi-select
- [ ] RTL נכון בכל ה-breakpoints + Mobile responsive

---

## 8. פאזה ואומדן

| | |
|---|---|
| **פאזה** | MVP — Sprint 3-4 |
| **DB Schema + RLS** | ~1 יום |
| **Edge Functions (deduct + alert)** | ~2 ימים |
| **Frontend (Inventory Table + Receive + Alerts)** | ~4 ימים |
| **WooCommerce Sync (fn-woo-stock-push)** | ~1 יום (אם מסתבך — PRD נפרד) |
| **סה"כ** | ~8 ימים |

---

## 9. תלויות

- **דורש:** PRD #1 (Auth/RBAC) — tenant_id, branch_id, roles, RLS
- **דורש:** PRD #3 (Orders) — `updateOrderStatusAction` קורא ל-`fn-inventory-deduct`
- **תלוי ב-Green API:** לשליחת WhatsApp התראות — ה-Edge Function צריכה חשבון Green API פעיל
- **חוסם:** WooCommerce Sync מלא (דו-כיווני) — תלוי בהגדרת Webhook מ-WooCommerce

---

## 10. סיכונים ושאלות פתוחות

| # | שאלה / סיכון | סטטוס |
|---|---|---|
| 1 | WooCommerce Sync — אם מסתבר שדורש קונפיגורציה מורכבת לכל tenant (API keys, URL), ייצא ל-PRD נפרד | פתוח |
| 2 | Race condition — שתי הזמנות מאושרות בו-זמנית על אותו מוצר. `fn-inventory-deduct` צריך `SELECT FOR UPDATE` | פתוח |
| 3 | מה קורה להזמנה שנחסמה על מלאי — האם מנהל יכול לאשר בכוח? (Override עם הערה) | פתוח |
| 4 | units — כל המוצרים ביחידות (שקים/אריזות) או גם בק"ג? | פתוח |
| 5 | תמונות מוצר — Supabase Storage או URL חיצוני (WooCommerce CDN)? | פתוח |
