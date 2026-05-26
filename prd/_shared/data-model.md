# Data Model — MasterPet

> **קובץ חי.** כל PRD מעדכן את הקובץ הזה. כל טבלה חדשה, כל שדה חדש — מתועד פה.
> **חוק זהב:** כל טבלה (חוץ מ-`tenants`) חייבת `tenant_id UUID NOT NULL` + RLS policy.

**עדכון אחרון:** 2026-05-25 (נוסף מודול Import — טבלת `import_mapping_templates` מ-PRD #4)
**מקור הגדרה אחרון:** PRD: CSV/Excel Import Engine (`prd/04-csv-import.md`) — סטטוס: Implemented

---

## תרשים יחסים — קצר

```
tenants (1) ─┬─< (N) users
             ├─< (N) invitations
             ├─< (N) audit_logs
             └─< (N) [כל שאר הטבלאות העסקיות]

auth.users (Supabase) (1) ─── (1) users.auth_user_id
```

---

## טבלאות

### `tenants` — העסקים (root של multi-tenancy)

| עמודה | סוג | תיאור |
|---|---|---|
| `id` | UUID PK | זיהוי tenant |
| `name` | TEXT NOT NULL | שם העסק (לדוגמה "החתול והכלב — פתח תקווה") |
| `slug` | TEXT UNIQUE NOT NULL | slug ל-URL (אופציונלי לעתיד) |
| `business_type` | TEXT | "pet_food_store", "vet_clinic", "online_only" |
| `contact_phone` | TEXT | טלפון ראשי של העסק (E.164) |
| `contact_email` | TEXT | מייל ראשי |
| `status` | TEXT NOT NULL | `pending_approval` / `active` / `suspended` / `cancelled` |
| `plan` | TEXT | `trial` / `basic` / `pro` / `enterprise` |
| `trial_ends_at` | TIMESTAMPTZ | מתי הטרייאל מסתיים |
| `trial_status` | TEXT | `active` / `grace_period` / `read_only` / `expired` — מצב הטרייאל. cron יומי מעדכן (PRD #10) |
| `approved_at` | TIMESTAMPTZ | מתי MasterPet אישר ידנית |
| `approved_by` | UUID | FK לאדמין שאישר (super_admin) |
| `created_at` | TIMESTAMPTZ NOT NULL | |
| `updated_at` | TIMESTAMPTZ NOT NULL | |

**RLS:** Super admins רואים הכל. שאר המשתמשים רואים רק את ה-tenant שלהם (דרך JWT claim `tenant_id`).

---

### `branches` — סניפים של ה-tenant

| עמודה | סוג | תיאור |
|---|---|---|
| `id` | UUID PK | |
| `tenant_id` | UUID NOT NULL | FK ל-`tenants` ON DELETE CASCADE |
| `name` | TEXT NOT NULL | שם הסניף (לדוגמה "סניף ראשי", "סניף תל אביב") |
| `slug` | TEXT NOT NULL | slug לזיהוי. UNIQUE לפי (tenant_id, slug) |
| `address` | TEXT | כתובת פיזית |
| `phone` | TEXT | טלפון הסניף (E.164) |
| `is_active` | BOOLEAN NOT NULL DEFAULT true | סניף פעיל / מושבת |
| `created_at` | TIMESTAMPTZ NOT NULL | |
| `updated_at` | TIMESTAMPTZ NOT NULL | |

**נוצר אוטומטית:**
- בעת אישור טנאנט (`approveTenantAction`) — נוצר branch ראשון בשם הטנאנט עם slug `"main"`.
- **DB-level trigger** `tenant_create_default_branch` (PRD #3): כל `INSERT` של טנאנט עם `status='active'`, או `UPDATE` של `status` ל-`'active'`, יוצר אוטומטית branch בשם `"סניף ראשי"` (slug `"main"`, `is_active=true`) אם אין כבר. SECURITY DEFINER, `search_path = ''`.
- **DB-level trigger** `branches_seed_inventory` (PRD #3): כל `INSERT` של branch פעיל יוצר שורות `product_inventory` ריקות (qty=0, reorder_level=0) לכל ה-variants הקיימים בטנאנט.

**RLS:** `owner` ו-`super_admin` רואים כל הסניפים. `branch_manager`, `sales`, `warehouse` — רק הסניף שלהם לפי `branch_id` ב-JWT.
**מוגדר ב:** PRD #1 ([`prd/01-auth-rbac.md`](../01-auth-rbac.md))

---

### `users` — המשתמשים בתוך ה-tenant

| עמודה | סוג | תיאור |
|---|---|---|
| `id` | UUID PK | |
| `auth_user_id` | UUID UNIQUE NOT NULL | FK ל-`auth.users` (Supabase Auth) |
| `tenant_id` | UUID NOT NULL | FK ל-`tenants` (MVP: משתמש שייך ל-tenant אחד) |
| `email` | TEXT NOT NULL | |
| `phone` | TEXT | בפורמט E.164 |
| `full_name` | TEXT NOT NULL | |
| `role` | TEXT NOT NULL | `owner` / `branch_manager` / `sales` / `warehouse` / `super_admin` |
| `branch_id` | UUID | FK ל-`branches` (MVP). `owner` — NULL מותר (רואה הכל). שאר הרולים (`branch_manager`, `sales`, `warehouse`) — נדרש לצורך RLS isolation. |
| `status` | TEXT NOT NULL | `active` / `inactive` / `pending_invitation` |
| `last_login_at` | TIMESTAMPTZ | |
| `created_at` | TIMESTAMPTZ NOT NULL | |
| `updated_at` | TIMESTAMPTZ NOT NULL | |

**RLS:** משתמש רואה רק users של ה-tenant שלו. `owner` ו-`branch_manager` יכולים לערוך users.

---

### `invitations` — הזמנות ממתינות

| עמודה | סוג | תיאור |
|---|---|---|
| `id` | UUID PK | |
| `tenant_id` | UUID NOT NULL | FK ל-`tenants` |
| `email` | TEXT | NULL אם הוזמן רק ב-WhatsApp |
| `phone` | TEXT | NULL אם הוזמן רק במייל |
| `full_name` | TEXT NOT NULL | |
| `role` | TEXT NOT NULL | הרול שיוקצה לאחר קבלה |
| `channel` | TEXT NOT NULL | `email` / `whatsapp` / `both` |
| `token` | TEXT UNIQUE NOT NULL | טוקן חד-פעמי לקישור |
| `status` | TEXT NOT NULL | `pending` / `accepted` / `expired` / `revoked` |
| `invited_by` | UUID NOT NULL | FK ל-`users` |
| `expires_at` | TIMESTAMPTZ NOT NULL | ברירת מחדל: יצירה + 7 ימים |
| `accepted_at` | TIMESTAMPTZ | |
| `created_at` | TIMESTAMPTZ NOT NULL | |

**RLS:** רק `owner` ו-`branch_manager` של ה-tenant יוצרים/רואים הזמנות.

---

### `audit_logs` — תיעוד פעולות רגישות

| עמודה | סוג | תיאור |
|---|---|---|
| `id` | UUID PK | |
| `tenant_id` | UUID NOT NULL | FK ל-`tenants` (NULL ל-super_admin events) |
| `actor_user_id` | UUID | FK ל-`users` (NULL ל-system events) |
| `actor_email` | TEXT | תמיד נשמר — גם אם המשתמש נמחק |
| `action` | TEXT NOT NULL | קוד פעולה (ראה רשימה למטה) |
| `entity_type` | TEXT | `user` / `order` / `product` / `tenant` / `billing` |
| `entity_id` | UUID | מזהה הישות שעליה בוצעה הפעולה |
| `metadata` | JSONB | פרטים: before/after, IP, סיבה |
| `ip_address` | INET | |
| `user_agent` | TEXT | |
| `created_at` | TIMESTAMPTZ NOT NULL | |

**Audit Actions ל-MVP:**
- `auth.login_success`, `auth.login_failed`, `auth.logout`
- `auth.magic_link_sent`
- `invitation.sent`, `invitation.accepted`, `invitation.revoked`
- `user.role_changed`, `user.deactivated`, `user.reactivated`
- `tenant.settings_changed`, `tenant.plan_changed`
- `order.deleted`, `order.refunded`
- `product.created`, `product.updated`, `product.deleted`, `product.duplicated`
- `product_variant.updated`
- `product_inventory.updated`
- `product.price_changed` (legacy — to be deprecated; replaced by `product_variant.updated` with `fields: ['price']`)
- `data.exported`

**RLS:** `owner` רואה את כל ה-audit של ה-tenant. אחרים — רק פעולות שהם עצמם ביצעו.

---

### `products` — מוצר ראשי בקטלוג

| עמודה | סוג | תיאור |
|---|---|---|
| `id` | UUID PK | |
| `tenant_id` | UUID NOT NULL | FK ל-`tenants` ON DELETE CASCADE |
| `name` | TEXT NOT NULL | שם המוצר (RTL, עברית) |
| `description` | TEXT | תיאור חופשי |
| `image_url` | TEXT | URL לתמונה ראשית (גלריה = P2) |
| `supplier_name` | TEXT | שם ספק כטקסט חופשי (טבלת `suppliers` נפרדת = P2) |
| `animal_type` | TEXT NOT NULL | CHECK: `dog` / `cat` / `rodent` / `bird` / `fish` / `reptile` / `other`. ברירת מחדל `other`. |
| `age_group` | TEXT NOT NULL | CHECK: `puppy` / `adult` / `senior` / `all`. ברירת מחדל `all`. |
| `diet_type` | TEXT NOT NULL | CHECK: `regular` / `grain_free` / `hypoallergenic` / `super_premium` / `therapeutic`. ברירת מחדל `regular`. |
| `allergen_free` | TEXT[] NOT NULL | מערך אלרגנים שהמוצר נקי מהם (`chicken`, `beef`, `grain`, ...). ברירת מחדל `'{}'`. |
| `tags` | TEXT[] NOT NULL | תגיות חופשיות per-tenant ("מבצע", "מומלץ"). אינדקס GIN לחיפוש מהיר. |
| `categories` | TEXT[] NOT NULL | קטגוריות מוצר ("אוכל לכלבים", "גורים"). שדה עצמאי מ-`tags`. ברירת מחדל `'{}'`. |
| `vat_rate` | NUMERIC(5,2) NOT NULL | אחוז מע"מ. ברירת מחדל `18.00`. תומך גם ב-0% למוצרים פטורים. |
| `status` | TEXT NOT NULL | CHECK: `active` / `inactive` / `discontinued`. ברירת מחדל `active`. |
| `deleted_at` | TIMESTAMPTZ | Soft delete — `NULL` = פעיל. RLS מסנן רק `deleted_at IS NULL`. variants ו-inventory נמחקים cascade דרך FK. |
| `created_at` | TIMESTAMPTZ NOT NULL | |
| `updated_at` | TIMESTAMPTZ NOT NULL | מתעדכן אוטומטית ע"י טריגר `products_set_updated_at`. |

**RLS:** `products_tenant_isolation` — `tenant_id = current_tenant_id() AND deleted_at IS NULL`. ENABLE + FORCE RLS. service_role עוקף.
**מוגדר ב:** PRD #3 ([`prd/03-products.md`](../03-products.md))

---

### `product_attributes` — מאפיינים של מוצר ("גודל", "טעם", "גיל")

| עמודה | סוג | תיאור |
|---|---|---|
| `id` | UUID PK | |
| `tenant_id` | UUID NOT NULL | FK ל-`tenants` ON DELETE CASCADE |
| `product_id` | UUID NOT NULL | FK ל-`products` ON DELETE CASCADE |
| `name` | TEXT NOT NULL | שם המאפיין (לדוגמה "גודל אריזה") |
| `position` | INT NOT NULL DEFAULT 0 | מיקום בתצוגה (לסידור attributes לפי סדר) |

**RLS:** `product_attributes_tenant_isolation` — `tenant_id = current_tenant_id()`. ENABLE + FORCE RLS.
**מוגדר ב:** PRD #3

---

### `product_attribute_values` — ערכים של מאפיין ("1kg", "5kg", "עוף")

| עמודה | סוג | תיאור |
|---|---|---|
| `id` | UUID PK | |
| `tenant_id` | UUID NOT NULL | FK ל-`tenants` ON DELETE CASCADE |
| `attribute_id` | UUID NOT NULL | FK ל-`product_attributes` ON DELETE CASCADE |
| `value` | TEXT NOT NULL | הערך עצמו (לדוגמה "5kg", "עוף") |
| `position` | INT NOT NULL DEFAULT 0 | סדר תצוגה |

**RLS:** `product_attribute_values_tenant_isolation` — `tenant_id = current_tenant_id()`. ENABLE + FORCE RLS.
**מוגדר ב:** PRD #3

---

### `product_variants` — Variants (כל הצלבת ערכים = SKU עצמאי)

| עמודה | סוג | תיאור |
|---|---|---|
| `id` | UUID PK | |
| `tenant_id` | UUID NOT NULL | FK ל-`tenants` ON DELETE CASCADE |
| `product_id` | UUID NOT NULL | FK ל-`products` ON DELETE CASCADE |
| `sku` | TEXT NOT NULL | SKU ייחודי לפי `(tenant_id, sku)`. |
| `barcode` | TEXT | ברקוד פיזי (EAN13 / UPC). אופציונלי. |
| `internal_code` | TEXT | מק"ט פנימי של העסק (שונה מ-SKU). אופציונלי. |
| `price` | NUMERIC(10,2) NOT NULL | מחיר **ללא מע"מ**. CHECK `>= 0`. |
| `cost_price` | NUMERIC(10,2) | מחיר עלות. **גלוי רק ל-`owner`** — DAL מסנן לפי רול. CHECK `>= 0`. |
| `unit` | TEXT NOT NULL | CHECK: `unit` / `kg` / `liter` / `pack`. ברירת מחדל `unit`. |
| `weight_kg` | NUMERIC(8,3) | משקל פיזי לצרכי משלוח/אזילה. CHECK `>= 0`. |
| `status` | TEXT NOT NULL | CHECK: `active` / `inactive`. ברירת מחדל `active`. |
| `created_at` | TIMESTAMPTZ NOT NULL | |
| `updated_at` | TIMESTAMPTZ NOT NULL | מתעדכן אוטומטית ע"י טריגר `product_variants_set_updated_at`. |

**אינדקסים:** `(product_id)`, `(tenant_id, sku)` UNIQUE, `(tenant_id, barcode)`.
**טריגר:** `product_variants_seed_inventory` (AFTER INSERT) — יוצר אוטומטית שורות `product_inventory` ריקות לכל branch פעיל בטנאנט.
**RLS:** `product_variants_tenant_isolation` — `tenant_id = current_tenant_id()`. ENABLE + FORCE RLS.
**מוגדר ב:** PRD #3

---

### `variant_attribute_values` — שיוך variant ↔ ערך attribute (many-to-many)

| עמודה | סוג | תיאור |
|---|---|---|
| `variant_id` | UUID NOT NULL | FK ל-`product_variants` ON DELETE CASCADE |
| `attribute_value_id` | UUID NOT NULL | FK ל-`product_attribute_values` ON DELETE CASCADE |

**PRIMARY KEY:** `(variant_id, attribute_value_id)`.
**RLS:** `variant_attribute_values_tenant_isolation` — derivation דרך הקשר ל-`product_variants` (אין `tenant_id` ישיר על הטבלה). ENABLE + FORCE RLS.
**מוגדר ב:** PRD #3

---

### `product_inventory` — מלאי לפי variant × branch

| עמודה | סוג | תיאור |
|---|---|---|
| `id` | UUID PK | |
| `tenant_id` | UUID NOT NULL | FK ל-`tenants` ON DELETE CASCADE |
| `branch_id` | UUID NOT NULL | FK ל-`branches` ON DELETE CASCADE |
| `variant_id` | UUID NOT NULL | FK ל-`product_variants` ON DELETE CASCADE |
| `qty` | NUMERIC(10,3) NOT NULL DEFAULT 0 | כמות נוכחית במלאי. CHECK `>= 0`. |
| `reorder_level` | NUMERIC(10,3) NOT NULL DEFAULT 0 | סף "מלאי נמוך". אם `qty <= reorder_level` → badge אדום ב-UI. CHECK `>= 0`. |
| `updated_at` | TIMESTAMPTZ NOT NULL | מתעדכן אוטומטית ע"י טריגר `product_inventory_set_updated_at`. |

**UNIQUE:** `(branch_id, variant_id)` — שורה אחת לכל הצלבה.
**אינדקסים:** `(branch_id)`, `(variant_id)`, partial `(tenant_id, branch_id) WHERE qty <= reorder_level` (לתצוגת low-stock מהירה).
**RLS:** `inventory_branch_isolation` — `tenant_id = current_tenant_id() AND (current_user_role() = 'owner' OR branch_id = current_branch_id())`. `owner` רואה את כל הסניפים; שאר הרולים — רק הסניף שלהם. ENABLE + FORCE RLS.
**Seeding אוטומטי:** שתי דרכים מובילות ליצירת שורת inventory ריקה — `INSERT` של variant חדש (טריגר על `product_variants`) או `INSERT` של branch חדש (טריגר על `branches`). שני הטריגרים משתמשים ב-`ON CONFLICT (branch_id, variant_id) DO NOTHING` — חזרה על פעולה בטוחה.
**מוגדר ב:** PRD #3

---

### `import_mapping_templates` — תבניות מיפוי עמודות לייבוא (PRD #4)

| עמודה | סוג | תיאור |
|---|---|---|
| `id` | UUID PK | |
| `tenant_id` | UUID NOT NULL | FK ל-`tenants` ON DELETE CASCADE |
| `name` | TEXT NOT NULL | שם התבנית שנתן המשתמש (לדוגמה "WooCommerce Export") |
| `target` | TEXT NOT NULL | CHECK: `products` / `customers` — לאיזה ייבוא התבנית שייכת |
| `mapping` | JSONB NOT NULL | `ColumnMappingRecord` — מיפוי עמודת-מקור → שדה-יעד |
| `created_at` | TIMESTAMPTZ NOT NULL | |
| `updated_at` | TIMESTAMPTZ NOT NULL | |

**UNIQUE:** `(tenant_id, name, target)` — upsert לפי שלישיה זו (אותו שם+target → מחליף).
**RLS:** `owner` בלבד, `tenant_id = current_tenant_id()`. ENABLE + FORCE RLS.
**מוגדר ב:** PRD #4

---

## ENUMs (כ-CHECK constraints או TEXT עם validation ב-app)

### `user_role`
```
owner          — בעל עסק / מנהל ראשי (כל ההרשאות)
branch_manager — מנהל סניף (ללא billing)
sales          — עובד מכירות/היברידי (הזמנות + CRM)
warehouse      — מנהל מחסן / לוגיסטיקן (PWA + מלאי)
super_admin    — צוות MasterPet (cross-tenant)
```

### `tenant_status`
```
pending_approval — נרשם, ממתין לאישור ידני של MasterPet
active           — פעיל
suspended        — מושעה (אי-תשלום וכד')
cancelled        — בוטל
```

### `trial_status`
```
active        — Trial רגיל, גישה מלאה
grace_period  — 3 ימים אחרי trial_ends_at (גישה מלאה + באנר חזק)
read_only     — פעולות חדשות חסומות, צפייה מותרת
expired       — חסום לחלוטין (P2+ — כרגע read_only מספיק)
```

### `invitation_status`
```
pending   — נשלחה, ממתינה לקבלה
accepted  — התקבלה, יצרה user
expired   — פגה תוקף
revoked   — בוטלה ידנית
```

---

## מוסכמות חוצות-טבלה

1. **כל טבלה עסקית:** `id UUID PK DEFAULT gen_random_uuid()`, `tenant_id UUID NOT NULL`, `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`, `updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`.
2. **RLS:** כל טבלה עסקית — `ENABLE ROW LEVEL SECURITY` + policy `tenant_id = (auth.jwt() ->> 'tenant_id')::UUID`.
3. **טלפונים:** תמיד E.164 (לדוגמה: `+972501234567`).
4. **כסף:** `NUMERIC(12,2)` + עמודת `currency TEXT DEFAULT 'ILS'`.
5. **זמן:** `TIMESTAMPTZ` תמיד. הצגה ב-UI לפי `Asia/Jerusalem`.
6. **soft delete:** עמודה `deleted_at TIMESTAMPTZ` (לא DELETE פיזי) — לטבלאות עסקיות. ל-audit/invitations — DELETE רגיל.

---

## טבלאות עתידיות (לתיעוד כשייכתב PRD שלהן)
- `customers` — לקוחות הקצה (B2C של ה-tenant)
- `pets` — חיות של לקוחות
- `orders` — הזמנות
- `order_items` — פריטים בהזמנה
- `subscriptions` — מנויים
- `notifications` — התראות
- `loyalty_points` — נקודות נאמנות
- `suppliers` — ספקים (כרגע `products.supplier_name` הוא טקסט חופשי)
- `price_tiers` — מחיר לפי לקוח / B2B (P2)
