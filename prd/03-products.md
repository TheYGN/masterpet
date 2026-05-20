# PRD: Products — קטלוג מוצרים + מלאי

**פאזה:** MVP (Sprint 3-4)
**תאריך:** 2026-05-20
**סטטוס:** Draft

---

## 1. סקירה כללית

מודול המוצרים הוא ה-foundation של כל MasterPet. בלעדיו אי אפשר ליצור הזמנה, לחשב אזילה, לסנכרן WooCommerce, או להפעיל cross-sell. כל מוצר נשמר כ"מוצר אם" עם attributes מרובים (גודל, טעם, גיל) ו-Variants שהם כל הצלבה אפשרית — כל Variant = SKU עצמאי עם מחיר, ברקוד ומלאי לפי סניף. טקסונומיה קבועה (חיה/גיל/דיאטה) + tags חופשיים לפי עסק.

---

## 2. הבעיה שנפתרת

| | |
|---|---|
| **כאב** | עסקים מנהלים קטלוג מוצרים בגיליון Excel — אין ראות מלאי, אין חיפוש, אין טקסונומיה לחיות |
| **מצב קיים** | כל שינוי מחיר / מלאי = עדכון ידני בקובץ. כשמזמינים מ-WhatsApp לא יודעים אם יש מלאי |
| **מה יקרה אם לא נבנה** | אי אפשר ליצור הזמנה במערכת, לחשב אזילה, לסנכרן WooCommerce, או להפעיל AI |

---

## 3. User Stories

### בעל עסק (owner)
- As an **owner**, I want to create products with multiple variants (size, flavor, age) so that my catalog matches my WooCommerce store.
- As an **owner**, I want to see cost price vs. selling price per variant so that I know my margin on every sale.
- As an **owner**, I want to set a reorder level per variant per branch so that I get notified before stock runs out.
- As an **owner**, I want to tag products freely ("מבצע", "ממולץ") so that I can organize the catalog the way I think.

### מנהל סניף (branch_manager)
- As a **branch_manager**, I want to see inventory levels for my branch only so that I know what I can sell today.
- As a **branch_manager**, I want to update stock quantities after a delivery so that the system stays accurate.

### עובד מכירות (sales)
- As a **sales**, I want to search products by animal / diet / name so that I can find the right product for a customer fast.
- As a **sales**, I want to see stock availability per variant before promising a customer delivery.

### מנהל מחסן (warehouse)
- As a **warehouse**, I want to update inventory quantities per variant per branch so that stock is always accurate after receiving goods.
- As a **warehouse**, I want to see which variants are below reorder level so that I know what to order.

---

## 4. Functional Requirements

| # | דרישה | עדיפות |
|---|---|---|
| FR-1 | יצירת מוצר עם שם, תיאור, תמונה (image_url), ספק, VAT rate | Must Have |
| FR-2 | טקסונומיה קבועה: animal_type / age_group / diet_type / allergen_free | Must Have |
| FR-3 | Tags חופשיים per-tenant (text array) | Must Have |
| FR-4 | Attributes מוגדרים לכל מוצר (גודל, טעם...) + ערכים לכל attribute | Must Have |
| FR-5 | Variants — כל הצלבת ערכים = SKU עם מחיר (ללא מע"מ), מחיר עלות, ברקוד, מק"ט פנימי | Must Have |
| FR-6 | חישוב אוטומטי `price_incl_vat = price × (1 + vat_rate / 100)` — מוצג ב-UI | Must Have |
| FR-7 | מלאי לפי variant × branch (qty + reorder_level) | Must Have |
| FR-8 | התראת מלאי נמוך: badge אדום כשקיים variant שה-qty שלו ≤ reorder_level | Must Have |
| FR-9 | RLS: כל tenant רואה רק מוצרים שלו. warehouse + sales רואים מלאי של הסניף שלהם בלבד | Must Have |
| FR-10 | הרשאת רווחיות: `cost_price` ו-% רווח גלויים רק ל-owner (ניתן להרחיב ל-branch_manager ב-Settings) | Must Have |
| FR-11 | חיפוש: שם / SKU / ברקוד / מק"ט / תג / ספק | Must Have |
| FR-12 | סינון לפי: animal_type / age_group / diet_type / status / סניף (מלאי) | Must Have |
| FR-13 | DataTable עם עמודות: תמונה, שם, #variants, מלאי כולל סניף, סטטוס | Must Have |
| FR-14 | Bulk actions: הפעל / כבה / שנה סטטוס לכמה מוצרים | Should Have |
| FR-15 | Export CSV של הקטלוג עם כל הvariants | Should Have |
| FR-16 | Duplicate מוצר (עם כל ה-variants) | Should Have |
| FR-17 | Import מ-CSV/Excel — ימומש דרך PRD #4 (CSV Import Engine). PRD #3 מגדיר את ה-schema בלבד | Dependency |

---

## 5. UI/UX

- **כיוון:** RTL, עברית
- **Routes (Next.js App Router):**
  - `app/(dashboard)/products/page.tsx` — רשימת כל המוצרים
  - `app/(dashboard)/products/new/page.tsx` — יצירת מוצר + variants
  - `app/(dashboard)/products/[id]/page.tsx` — תצוגת מוצר: פרטים + variants + מלאי
  - `app/(dashboard)/products/[id]/edit/page.tsx` — עריכת מוצר
  - `app/(dashboard)/products/[id]/inventory/page.tsx` — ניהול מלאי לפי סניף

- **shadcn/ui Components:**
  - `DataTable` — רשימת מוצרים עם sorting + filtering
  - `Sheet` — טופס יצירה/עריכה (פתוח מהצד — לא דף נפרד ב-mobile)
  - `Tabs` — [פרטים | Variants | מלאי | היסטוריה]
  - `Badge` — סטטוס (פעיל/כבוי/הופסק), התראת מלאי נמוך
  - `Dialog` — אישור מחיקה / Duplicate
  - `Command` — חיפוש מהיר
  - `MultiSelect` — תיוג / סינון טקסונומיה
  - `Input + NumberInput` — מחיר, מלאי, reorder level

- **Flow ראשי — יצירת מוצר:**
  1. owner לוחץ "מוצר חדש" → נפתח Sheet
  2. ממלא: שם, תיאור, תמונה, ספק, animal_type, age_group, diet_type, allergen_free, tags, VAT
  3. מוסיף Attributes: לוחץ "+ הוסף attribute" → שם (גודל) → ערכים (1kg, 5kg, 15kg)
  4. המערכת מייצרת אוטומטית את כל ה-Variants (הצלבות). owner מעדכן מחיר, עלות, ברקוד לכל variant
  5. מגדיר מלאי ו-reorder_level לכל variant × branch
  6. שמירה → מוצר מופיע ב-DataTable

- **Flow ראשי — עדכון מלאי (warehouse):**
  1. warehouse נכנס ל-`/products/[id]/inventory`
  2. רואה טבלה: Variant | מלאי נוכחי | Reorder level | עדכן
  3. מזין כמות חדשה → שמירה

- **Empty State:** "אין מוצרים עדיין — לחץ לייבוא מ-Excel או הוסף ידנית"
- **Low Stock State:** Badge אדום `⚠ מלאי נמוך` על כרטיס המוצר + שורה בצבע בטבלה

---

## 6. Technical Spec

### DB Schema (Supabase)

```sql
-- מוצר ראשי
CREATE TABLE products (
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID          NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name            TEXT          NOT NULL,
  description     TEXT,
  image_url       TEXT,
  supplier_name   TEXT,
  -- טקסונומיה קבועה
  animal_type     TEXT          NOT NULL DEFAULT 'other'
                                CHECK (animal_type IN ('dog','cat','rodent','bird','fish','reptile','other')),
  age_group       TEXT          NOT NULL DEFAULT 'all'
                                CHECK (age_group IN ('puppy','adult','senior','all')),
  diet_type       TEXT          NOT NULL DEFAULT 'regular'
                                CHECK (diet_type IN ('regular','grain_free','hypoallergenic','super_premium','therapeutic')),
  allergen_free   TEXT[]        NOT NULL DEFAULT '{}',  -- ['chicken','beef','grain','soy','dairy']
  -- tags חופשיים per-tenant
  tags            TEXT[]        NOT NULL DEFAULT '{}',
  -- מע"מ
  vat_rate        NUMERIC(5,2)  NOT NULL DEFAULT 18.00,
  status          TEXT          NOT NULL DEFAULT 'active'
                                CHECK (status IN ('active','inactive','discontinued')),
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_products_tenant        ON products(tenant_id);
CREATE INDEX idx_products_animal_type   ON products(tenant_id, animal_type);
CREATE INDEX idx_products_status        ON products(tenant_id, status);
CREATE INDEX idx_products_tags          ON products USING GIN (tags);

-- attributes של מוצר — "גודל", "טעם", "גיל"
CREATE TABLE product_attributes (
  id          UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID  NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  product_id  UUID  NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name        TEXT  NOT NULL,
  position    INT   NOT NULL DEFAULT 0
);

-- ערכים לכל attribute — "1kg", "5kg", "עוף"
CREATE TABLE product_attribute_values (
  id            UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID  NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  attribute_id  UUID  NOT NULL REFERENCES product_attributes(id) ON DELETE CASCADE,
  value         TEXT  NOT NULL,
  position      INT   NOT NULL DEFAULT 0
);

-- וריאנטים — כל הצלבה = SKU עצמאי
CREATE TABLE product_variants (
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID          NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  product_id      UUID          NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  sku             TEXT          NOT NULL,
  barcode         TEXT,
  internal_code   TEXT,                         -- מק"ט פנימי
  price           NUMERIC(10,2) NOT NULL,       -- ללא מע"מ
  cost_price      NUMERIC(10,2),               -- מחיר עלות (owner בלבד)
  unit            TEXT          NOT NULL DEFAULT 'unit'
                                CHECK (unit IN ('unit','kg','liter','pack')),
  weight_kg       NUMERIC(8,3),                -- משקל פיזי (לצרכי משלוח)
  status          TEXT          NOT NULL DEFAULT 'active'
                                CHECK (status IN ('active','inactive')),
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  UNIQUE(tenant_id, sku)
);

CREATE INDEX idx_variants_product   ON product_variants(product_id);
CREATE INDEX idx_variants_barcode   ON product_variants(tenant_id, barcode);
CREATE INDEX idx_variants_sku       ON product_variants(tenant_id, sku);

-- שיוך variant ↔ ערכי attribute
CREATE TABLE variant_attribute_values (
  variant_id          UUID NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
  attribute_value_id  UUID NOT NULL REFERENCES product_attribute_values(id) ON DELETE CASCADE,
  PRIMARY KEY (variant_id, attribute_value_id)
);

-- מלאי: כמה יש מכל variant בכל סניף
CREATE TABLE product_inventory (
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID          NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  branch_id       UUID          NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  variant_id      UUID          NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
  qty             NUMERIC(10,3) NOT NULL DEFAULT 0,
  reorder_level   NUMERIC(10,3) NOT NULL DEFAULT 0,
  updated_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  UNIQUE(branch_id, variant_id)
);

CREATE INDEX idx_inventory_branch      ON product_inventory(branch_id);
CREATE INDEX idx_inventory_low_stock   ON product_inventory(tenant_id, branch_id)
  WHERE qty <= reorder_level;

-- RLS
ALTER TABLE products                ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_attributes      ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_attribute_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants        ENABLE ROW LEVEL SECURITY;
ALTER TABLE variant_attribute_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_inventory       ENABLE ROW LEVEL SECURITY;

-- products: כל tenant רואה רק את שלו
CREATE POLICY "products_tenant_isolation" ON products
  FOR ALL USING (tenant_id = current_tenant_id());

CREATE POLICY "product_attributes_tenant_isolation" ON product_attributes
  FOR ALL USING (tenant_id = current_tenant_id());

CREATE POLICY "product_attribute_values_tenant_isolation" ON product_attribute_values
  FOR ALL USING (tenant_id = current_tenant_id());

CREATE POLICY "product_variants_tenant_isolation" ON product_variants
  FOR ALL USING (tenant_id = current_tenant_id());

-- variant_attribute_values: גישה דרך variants (נשלטת ע"י RLS של product_variants)
CREATE POLICY "variant_attribute_values_tenant_isolation" ON variant_attribute_values
  FOR ALL USING (
    variant_id IN (
      SELECT id FROM product_variants WHERE tenant_id = current_tenant_id()
    )
  );

-- מלאי: sales + warehouse רואים רק הסניף שלהם. owner + branch_manager רואים הכל
CREATE POLICY "inventory_branch_isolation" ON product_inventory
  FOR ALL USING (
    tenant_id = current_tenant_id()
    AND (
      current_user_role() IN ('owner')
      OR branch_id = current_branch_id()
    )
  );

-- FORCE RLS (service_role עם bypass מובנה — לא נחסם)
ALTER TABLE products                FORCE ROW LEVEL SECURITY;
ALTER TABLE product_attributes      FORCE ROW LEVEL SECURITY;
ALTER TABLE product_attribute_values FORCE ROW LEVEL SECURITY;
ALTER TABLE product_variants        FORCE ROW LEVEL SECURITY;
ALTER TABLE product_inventory       FORCE ROW LEVEL SECURITY;
```

### Server Actions + DAL

| Action | רולים מורשים | מה היא עושה |
|---|---|---|
| `createProduct` | owner | יוצר product + attributes + variants + inventory rows ריקים לכל branch |
| `updateProduct` | owner | עדכון פרטי מוצר ראשי |
| `updateVariant` | owner | עדכון מחיר / ברקוד / status של variant |
| `updateInventory` | owner, branch_manager, warehouse | עדכון qty + reorder_level של variant בסניף |
| `listProducts` | כולם | רשימה עם סינון. sales + warehouse = read-only |
| `getProduct` | כולם | פרטי מוצר מלאים + variants + מלאי הסניף |
| `deleteProduct` | owner | soft-delete (status = 'discontinued') |
| `duplicateProduct` | owner | שכפול מוצר עם כל attributes + variants (qty מתאפס) |

**הרשאת רווחיות:** `cost_price` מוחזר מה-DAL רק כש-`current_user_role() = 'owner'`. בכל שאר הרולים — השדה מסונן ב-SELECT.

### Frontend Components

| Component | Path | מטרה |
|---|---|---|
| `ProductsTable` | `app/(dashboard)/products/_components/ProductsTable.tsx` | DataTable ראשי: שם, תמונה, variants, מלאי, סטטוס |
| `ProductFilters` | `app/(dashboard)/products/_components/ProductFilters.tsx` | Selects: animal_type / age_group / diet_type / status |
| `ProductSheet` | `app/(dashboard)/products/_components/ProductSheet.tsx` | Sheet ליצירה/עריכה (מוצר + attributes) |
| `VariantsEditor` | `app/(dashboard)/products/_components/VariantsEditor.tsx` | טבלת variants עם inline editing |
| `AttributeBuilder` | `app/(dashboard)/products/_components/AttributeBuilder.tsx` | ממשק הגדרת attributes + ערכים + הצגת הצלבות |
| `InventoryTable` | `app/(dashboard)/products/[id]/inventory/_components/InventoryTable.tsx` | מלאי לפי variant × branch עם עדכון ידני |
| `LowStockBadge` | `app/(dashboard)/products/_components/LowStockBadge.tsx` | Badge אדום "מלאי נמוך" כשקיים variant מתחת ל-reorder |
| `PriceDisplay` | `app/(dashboard)/products/_components/PriceDisplay.tsx` | מציג `price` + `price_incl_vat` (מחושב client-side) |

---

## 7. Acceptance Criteria

- [ ] owner יוצר מוצר עם 2 attributes (גודל × טעם) — המערכת מייצרת אוטומטית את כל ה-Variants
- [ ] כל variant עם SKU ייחודי לכל tenant — ניסיון לשמור SKU כפול מחזיר שגיאה
- [ ] `price_incl_vat` מחושב נכון: מחיר 100 + VAT 18% = 118.00
- [ ] `cost_price` גלוי רק ל-owner — sales ו-warehouse לא רואים את השדה (גם לא ב-Network)
- [ ] RLS מאומת: tenant A לא רואה מוצרים של tenant B
- [ ] RLS מאומת: sales ב-branch A לא רואה מלאי של branch B
- [ ] warehouse מעדכן qty → badge "מלאי נמוך" מופיע/נעלם בהתאם ל-reorder_level
- [ ] חיפוש לפי SKU מחזיר תוצאה תוך < 200ms (index)
- [ ] סינון לפי animal_type=dog מחזיר רק מוצרים לכלבים
- [ ] Duplicate מוצר — כל ה-attributes + variants מועתקים, qty מתאפס
- [ ] RTL נכון בעברית בכל ה-breakpoints
- [ ] Mobile responsive (min 375px) — מנהל מחסן יכול לעדכן מלאי מנייד
- [ ] Empty state, Loading state, Error state — כולם מטופלים
- [ ] 4 הרולים נבדקו: owner (CRUD+עלות), branch_manager (CRUD-עלות), sales (read), warehouse (read+מלאי)

---

## 8. פאזה ואומדן

| | |
|---|---|
| **פאזה** | MVP — Sprint 3-4 |
| **Sprint** | Sprint 3, חודש 2 |
| **DB Migrations + RLS** | ~1 יום |
| **Server Actions + DAL** | ~2 ימים |
| **Frontend — רשימה + סינון** | ~2 ימים |
| **Frontend — טופס יצירה + AttributeBuilder + VariantsEditor** | ~3 ימים |
| **Frontend — InventoryTable** | ~1 יום |
| **RLS tests + QA** | ~1 יום |
| **סה"כ** | ~10 ימים |

---

## 9. תלויות

- **דורש:** PRD #1 (Auth/RBAC) — tenant_id, branch_id, 4 roles, current_tenant_id(), current_branch_id(), current_user_role() פעילים ✅
- **חוסם:** PRD #2 (Order Inbox) — ConvertToOrderSheet לא עובד בלי variants ומחירים
- **חוסם:** PRD #4 (CSV Import Engine) — ה-schema כאן הוא היעד הראשון לייבוא
- **חוסם:** PRD #6 (Orders) — הזמנה בוחרת variant + מחיר מהקטלוג
- **חוסם:** מנוע אזילה — קצב צריכה מחושב לפי product_variant (weight_kg ÷ קצב יומי)
- **חוסם:** WooCommerce Sync A — סנכרון מוצרים/מלאי לחנות → PRD נפרד (#3.5 או #7)

---

## 10. סיכונים ושאלות פתוחות

| # | שאלה / סיכון | סטטוס |
|---|---|---|
| 1 | **יצירת variants אוטומטית** — מוצר עם 3 attributes × 5 ערכים כל אחד = 125 variants. האם לייצר הכל אוטומטית, או לאפשר למשתמש לבחור אילו הצלבות קיימות? | פתוח |
| 2 | **מחיר לפי לקוח (B2B)** — עסקים שמוכרים לפת-מקצוע / קלינאים בתמחור שונה. P2 — תתווסף טבלת `price_tiers` בעתיד | P2 |
| 3 | **תמונות מרובות** — image_url אחד מספיק ל-MVP. גלריה = P2 (Supabase Storage) | P2 |
| 4 | **supplier כטבלה נפרדת** — כרגע `supplier_name` = טקסט חופשי. טבלת suppliers נפרדת (קשר לחשבוניות ספק) = P2 | P2 |
| 5 | **מע"מ 0% / פטורים** — מוצרים מסוימים עשויים להיות פטורים (ייצוא, אזורי מסחר חופשי). `vat_rate` הוא שדה per-product — מאפשר 0% בעתיד בלי שינוי schema | מטופל בdesign |
| 6 | **WooCommerce Variant mapping** — WC משתמש ב-attribute slugs שונים. ה-Sync צריך mapping בין `product_attribute_values.id` ל-WC term ID | יטופל ב-PRD WooCommerce Sync |
