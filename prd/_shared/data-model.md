# Data Model — MasterPet

> **קובץ חי.** כל PRD מעדכן את הקובץ הזה. כל טבלה חדשה, כל שדה חדש — מתועד פה.
> **חוק זהב:** כל טבלה (חוץ מ-`tenants`) חייבת `tenant_id UUID NOT NULL` + RLS policy.

**עדכון אחרון:** 2026-05-30 (נוסף מודול Invoicing & Documents — 6 טבלאות חדשות + שינויי orders מ-PRD #19a)
**מקור הגדרה אחרון:** PRD: Invoicing & Documents (`prd/19a-invoicing-documents.md`) — סטטוס: Ready

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
- `product.bulk_deleted` (metadata: `{ count, ids }`), `product.restored` (Undo — metadata: `{ count, ids }`)
- `product_variant.updated`
- `product_inventory.updated`
- `product.price_changed` (legacy — to be deprecated; replaced by `product_variant.updated` with `fields: ['price']`)
- `customer.created`, `customer.updated`, `customer.deleted`
- `customer.bulk_deleted` (metadata: `{ count, ids }`), `customer.restored` (Undo — metadata: `{ count, ids }`)
- `data.imported`, `data.exported`

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
| `deleted_at` | TIMESTAMPTZ | Soft delete — `NULL` = פעיל. הסינון `deleted_at IS NULL` נעשה ב-**קוד האפליקציה** (`.is('deleted_at', null)` בכל query), **לא ב-RLS**. variants ו-inventory נמחקים cascade דרך FK. |
| `created_at` | TIMESTAMPTZ NOT NULL | |
| `updated_at` | TIMESTAMPTZ NOT NULL | מתעדכן אוטומטית ע"י טריגר `products_set_updated_at`. |

**RLS:** `products_tenant_isolation` — `FOR ALL USING (tenant_id = current_tenant_id())` (גם WITH CHECK). ENABLE + FORCE RLS. service_role עוקף.
⚠️ **תיקון drift (2026-05-29):** ה-policy **בפועל** ב-DB **אינו** כולל `AND deleted_at IS NULL` (נבדק מול pg_policy). המשמעות: client מאומת (`getAuthenticatedClient`) **כן** רואה ויכול לעדכן שורות soft-deleted — לכן `restoreProductsAction` (Undo) עובד ללא service_role. הסינון של מחוקים נשען על קוד האפליקציה.
**Realtime:** `products` מצורף ל-publication `supabase_realtime` (migration `202605291200_products_realtime_publication.sql`, `REPLICA IDENTITY FULL`). Realtime מכבד RLS רק על channel מאומת (JWT דרך `realtime.setAuth`). מחיקה = UPDATE עם `deleted_at` → ה-frontend מזהה מחיקה ב-`new.deleted_at != null && old.deleted_at == null`, ושחזור הפוך.
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
- `customers` — לקוחות הקצה (B2C של ה-tenant) — Done (PRD #5)
- `pets` — חיות של לקוחות — Done (PRD #5)
- `orders` — הזמנות — Done (PRD #6)
- `order_items` — פריטים בהזמנה — Done (PRD #6)
- `subscriptions` — מנויים — Done (PRD #6)
- `loyalty_points` — נקודות נאמנות
- `suppliers` — ספקים (כרגע `products.supplier_name` הוא טקסט חופשי)
- `price_tiers` — מחיר לפי לקוח / B2B (P2)

---

## טבלאות מ-PRD #19a (Invoicing & Documents) — Ready, לפיתוח ב-Sprint 7-8

### `payment_provider_settings` — הגדרות ספק סליקה פר tenant

| עמודה | סוג | תיאור |
|---|---|---|
| `tenant_id` | UUID PK | FK ל-`tenants` ON DELETE CASCADE. אחד לכל tenant. |
| `provider` | TEXT NOT NULL | DEFAULT `'payplus'`. CHECK `('payplus')`. P2: `'tranzila'`, `'cardcom'`, `'zcredit'`. |
| `api_key_encrypted` | TEXT | 🔒 מוצפן ע"י Supabase Vault wrapper. |
| `api_secret_encrypted` | TEXT | 🔒 מוצפן. |
| `terminal_id` | TEXT | מסוף סליקה (PayPlus). |
| `webhook_secret` | TEXT | 🔒 מוצפן. לאימות חתימת webhook. |
| `is_sandbox` | BOOLEAN NOT NULL | DEFAULT true. |
| `last_tested_at` | TIMESTAMPTZ | |
| `last_test_status` | TEXT | CHECK `('success','failed')`. |
| `created_at`, `updated_at` | TIMESTAMPTZ NOT NULL | |

**RLS:** `tenant_id = current_tenant_id()` + `owner` בלבד יכול INSERT/UPDATE. ENABLE + FORCE RLS.
**מוגדר ב:** PRD #19a

---

### `invoice_provider_settings` — הגדרות ספק חשבוניות פר tenant (נפרד מסליקה)

| עמודה | סוג | תיאור |
|---|---|---|
| `tenant_id` | UUID PK | FK ל-`tenants` ON DELETE CASCADE. |
| `provider` | TEXT NOT NULL | DEFAULT `'payplus'`. CHECK `('payplus')`. P2: `'morning'`, `'icount'`, `'ezcount'`. |
| `api_key_encrypted` | TEXT | 🔒 מוצפן. יכול להיות זהה ל-payment אם אותו ספק. |
| `api_secret_encrypted` | TEXT | 🔒 מוצפן. |
| `company_id_external` | TEXT | ID העסק אצל ספק החשבוניות. |
| `vat_id` | TEXT | ח.פ./עוסק מורשה. |
| `is_sandbox` | BOOLEAN NOT NULL | DEFAULT true. |
| `last_tested_at`, `last_test_status` | TIMESTAMPTZ, TEXT | כמו לעיל. |
| `created_at`, `updated_at` | TIMESTAMPTZ NOT NULL | |

**RLS:** זהה ל-`payment_provider_settings`.
**מוגדר ב:** PRD #19a
**הערה:** שתי הטבלאות נפרדות בכוונה — שני Adapters עצמאיים. גם אם PayPlus משמש לשניהם ב-MVP, כל אחד מוגדר ב-row משלו.

---

### `accounting_documents` — הטבלה הראשית של מסמכים חשבונאיים

| עמודה | סוג | תיאור |
|---|---|---|
| `id` | UUID PK | |
| `tenant_id` | UUID NOT NULL | FK ל-`tenants` ON DELETE CASCADE. |
| `branch_id` | UUID NOT NULL | FK ל-`branches`. |
| `customer_id` | UUID NOT NULL | FK ל-`customers`. |
| `created_by` | UUID NOT NULL | FK ל-`users`. |
| `doc_type` | TEXT NOT NULL | CHECK: **MVP — 3 ערכים בלבד**: `'tax_invoice_receipt'`, `'delivery_note'`, `'credit_note'`. Phase 2: יתווספו `'tax_invoice'`, `'receipt'`. |
| `status` | TEXT NOT NULL | DEFAULT `'draft'`. CHECK: `'draft'` / `'issued'` / `'cancelled_by_credit_note'` / `'error'`. |
| `external_provider` | TEXT NOT NULL | DEFAULT `'payplus'`. P2: `'morning'`, `'icount'`. |
| `external_doc_id` | TEXT | ID פנימי אצל הספק. |
| `external_doc_number` | TEXT | המספר הרץ החוקי (מנוהל ע"י PayPlus). |
| `external_doc_series` | TEXT | prefix אלפביתי של PayPlus (לעמידה בחוק ניהול ספרים). |
| `external_unique_identifier` | TEXT | idempotency key — מונע כפילויות בwebhook retries. |
| `pdf_url` | TEXT | URL ל-PDF אצל הספק. |
| `subtotal`, `discount` | NUMERIC(12,2) NOT NULL DEFAULT 0 | |
| `vat_rate` | NUMERIC(5,2) NOT NULL | DEFAULT 18. |
| `vat_amount`, `total` | NUMERIC(12,2) NOT NULL DEFAULT 0 | |
| `currency` | TEXT NOT NULL | DEFAULT `'ILS'`. |
| `payment_method` | TEXT | CHECK: `'payplus'`/`'cash'`/`'transfer'`/`'credit_card'`/`'check'`. |
| `proof_image_url` | TEXT | רק `delivery_note` — תמונת המשלוח. |
| `gps_lat`, `gps_lng` | NUMERIC | רק `delivery_note` — אופציונלי. |
| `sent_to_customer_at`, `sent_via` | TIMESTAMPTZ, TEXT | `sent_via` CHECK: `'whatsapp'`/`'email'`/`'sms'`. |
| `issued_at` | TIMESTAMPTZ | מתי הופק (אחרי draft). |
| `error_message`, `retry_count` | TEXT, INT | למצב `'error'`. |
| `notes` | TEXT | |
| `created_at`, `updated_at` | TIMESTAMPTZ NOT NULL | |

**Indexes:** `(tenant_id, customer_id, created_at DESC)`, `(tenant_id, status, doc_type)`, partial `(tenant_id, status) WHERE status='draft'`, `(tenant_id, external_provider, external_doc_series, external_doc_number)`, UNIQUE partial `(tenant_id, external_provider, external_unique_identifier) WHERE external_unique_identifier IS NOT NULL`.
**RLS:** `tenant_id = current_tenant_id()` + branch isolation (sales/warehouse לסניף שלהם) + drafts owner-only (חוץ מ-`delivery_note`). ENABLE + FORCE RLS.
**מוגדר ב:** PRD #19a

---

### `accounting_document_lines` — שורות פירוט (snapshot מ-order_items)

| עמודה | סוג | תיאור |
|---|---|---|
| `id` | UUID PK | |
| `document_id` | UUID NOT NULL | FK ל-`accounting_documents` ON DELETE CASCADE. |
| `tenant_id` | UUID NOT NULL | |
| `order_item_id` | UUID | FK ל-`order_items` (nullable). |
| `line_number` | INT NOT NULL | 1, 2, 3 בתוך המסמך. UNIQUE `(document_id, line_number)`. |
| `product_name`, `variant_desc`, `sku` | TEXT | snapshot. |
| `quantity` | NUMERIC(10,3) NOT NULL | |
| `unit_price`, `total_price` | NUMERIC(12,2) NOT NULL | |
| `vat_rate` | NUMERIC(5,2) NOT NULL | DEFAULT 18. |
| `created_at` | TIMESTAMPTZ NOT NULL | |

**RLS:** `tenant_id = current_tenant_id()`. ENABLE + FORCE RLS.
**מוגדר ב:** PRD #19a

---

### `document_links` — רציפות חשבונאית M:N

| עמודה | סוג | תיאור |
|---|---|---|
| `id` | UUID PK | |
| `tenant_id` | UUID NOT NULL | |
| `parent_document_id` | UUID NOT NULL | FK ל-`accounting_documents` ON DELETE CASCADE. |
| `child_document_id` | UUID NOT NULL | FK ל-`accounting_documents` ON DELETE CASCADE. |
| `link_type` | TEXT NOT NULL | CHECK: `'invoice_aggregates_delivery_note'`, `'receipt_pays_invoice'`, `'credit_note_cancels_invoice'`, `'invoice_replaces_cancelled'`, `'tax_invoice_receipt_for_delivery'`. |
| `amount_allocated` | NUMERIC(12,2) | כמה מהיתרה של ההורה נכנס לילד. |
| `created_at` | TIMESTAMPTZ NOT NULL | |

**Indexes:** `parent_document_id`, `child_document_id`. UNIQUE `(parent_document_id, child_document_id, link_type)`.
**RLS:** `tenant_id = current_tenant_id()`. ENABLE + FORCE RLS.
**מוגדר ב:** PRD #19a
**הערה:** מתממש 1:1 עם פרמטרים של PayPlus API (`close_doc`, `cancel_doc`).

---

### `internal_notifications` — התראות פנים-מערכת (פעמון ב-TopBar)

| עמודה | סוג | תיאור |
|---|---|---|
| `id` | UUID PK | |
| `tenant_id` | UUID NOT NULL | FK ל-`tenants` ON DELETE CASCADE. |
| `user_id` | UUID NOT NULL | FK ל-`users` ON DELETE CASCADE — התראות פר משתמש. |
| `notification_type` | TEXT NOT NULL | CHECK: `'invoice_drafts_pending'`, `'document_error'`, `'provider_connection_failed'`. |
| `payload` | JSONB NOT NULL | DEFAULT `'{}'::jsonb`. דוגמה: `{count: 7, link: "/documents/drafts"}`. |
| `read_at` | TIMESTAMPTZ | NULL = לא נקראה. |
| `created_at` | TIMESTAMPTZ NOT NULL | |

**Indexes:** partial `(tenant_id, user_id) WHERE read_at IS NULL`.
**RLS:** משתמש רואה רק את ההתראות של עצמו: `tenant_id = current_tenant_id() AND user_id = current_user_id()`. ENABLE + FORCE RLS.
**מוגדר ב:** PRD #19a (FR-2c)

---

### שינויים ב-`orders` מ-PRD #19a

עמודות חדשות (Dual-write transition — בטוח ל-rollback):

| עמודה | סוג | תיאור |
|---|---|---|
| `payment_terms` | TEXT NOT NULL | DEFAULT `'immediate'`. CHECK: `'immediate'`/`'net_30'`/`'net_60'`. |
| `invoice_document_id` | UUID | FK ל-`accounting_documents`. החשבונית שאיגדה את ההזמנה. |
| `payment_external_ref` | TEXT | **חדש** — מחליף בהדרגה את `payplus_ref`. שלב 1: dual-write לשניהם. שלב 2: הסרת `payplus_ref` אחרי 2-3 שבועות + verification. |
| `payment_provider` | TEXT | DEFAULT `'payplus'`. CHECK: `'payplus'` (P2: `'tranzila'`/`'cardcom'`/`'zcredit'`). |

עדכון CHECK של `payment_method`:
- היה: `('payplus_link','woocommerce','cash','transfer','credit')`
- חדש: `('payment_link','payplus_link','woocommerce','cash','transfer','credit')` — `payplus_link` נשאר ל-backwards compat, `payment_link` נוסף כניטרלי

**Index חדש:** partial `(tenant_id, payment_terms) WHERE payment_status='unpaid' AND payment_terms IN ('net_30','net_60')` — ל-cron החודשי שמייצר חשבוניות מאוחדות.

---

### Audit Actions חדשים מ-PRD #19a

הוספה ל-Audit Actions ל-MVP:
- `document.issued` (metadata: `{ doc_type, external_doc_number, provider }`)
- `document.cancelled_by_credit_note`
- `document.error` (metadata: `{ error_message, retry_count }`)
- `invoice_draft.approved` (metadata: `{ count, total }`)
- `invoice_correction.completed` (metadata: `{ original_id, credit_note_id, new_invoice_id }`)
- `provider_settings.updated` (metadata: `{ provider_type: 'payment'|'invoice' }`)
- `provider_connection.tested` (metadata: `{ provider, status }`)
