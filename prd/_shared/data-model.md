# Data Model — MasterPet

> **קובץ חי.** כל PRD מעדכן את הקובץ הזה. כל טבלה חדשה, כל שדה חדש — מתועד פה.
> **חוק זהב:** כל טבלה (חוץ מ-`tenants`) חייבת `tenant_id UUID NOT NULL` + RLS policy.

**עדכון אחרון:** 2026-05-19 (נוסף `trial_status` ב-`tenants`)
**מקור הגדרה אחרון:** PRD: Auth + RBAC (`prd/01-auth-rbac.md`) — סטטוס: Approved

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
| `branch_id` | UUID | FK ל-`branches` (Phase 2 — לסניפים מרובים). MVP: NULL מותר |
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
- `product.price_changed`
- `data.exported`

**RLS:** `owner` רואה את כל ה-audit של ה-tenant. אחרים — רק פעולות שהם עצמם ביצעו.

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

- `branches` — סניפים בתוך tenant (Phase 1.5/2)
- `customers` — לקוחות הקצה (B2C של ה-tenant)
- `pets` — חיות של לקוחות
- `products` — מוצרים
- `inventory` — מלאי לפי מחסן
- `orders` — הזמנות
- `order_items` — פריטים בהזמנה
- `subscriptions` — מנויים
- `notifications` — התראות
- `loyalty_points` — נקודות נאמנות
