# PRD: Auth + RBAC + קליטת עסק

**פאזה:** MVP (Sprint 1-2)
**תאריך:** 2026-05-19 (עודכן 2026-05-19)
**סטטוס:** ✅ Approved — סכמה עודכנה 2026-05-19 (branches + permissions)
**תלוי ב:** —
**חוסם:** כל שאר PRDs (זהו הבסיס)


## 1. סקירה כללית

תשתית הזהות וההרשאות של MasterPet. כוללת:
- **Multi-tenancy** — כל עסק הוא tenant נפרד עם בידוד מלא של דאטה (RLS).
- **Onboarding משולב** — הרשמה עצמית של בעל עסק → אישור ידני של צוות MasterPet → Magic Link → Trial 14 יום.
- **4 רולים** + Super Admin פנימי, עם הרשאות מובחנות.
- **הזמנת עובדים** במייל או WhatsApp (לבחירת המזמין).
- **Audit Log** של פעולות רגישות בלבד.

זה ה-PRD הראשון של MasterPet — כל פיצ'ר אחר מסתמך עליו (`tenant_id`, role check, RLS).

---

## 2. הבעיה שנפתרת

| | |
|---|---|
| **כאב** | עסק שמצטרף ל-MasterPet צריך גישה בטוחה ופשוטה. בעל עסק לא רוצה לזכור סיסמאות, צריך להזמין עובדים, וכל עובד צריך לראות רק מה שמותר לו. |
| **מצב קיים** | עסקים מנהלים הזמנות ב-WhatsApp אישי או באקסל — בלי הפרדת תפקידים, בלי audit, בלי הגנה על דאטה של לקוחות. |
| **מה יקרה אם לא נבנה** | אין מערכת. כל פיצ'ר אחר תלוי בזיהוי המשתמש, ה-tenant שלו, והרול שלו. |

---

## 3. User Stories

### בעל עסק (`owner`)
- As an **owner**, I want to register my business via a public form so that I can start a trial without sales calls.
- As an **owner**, I want to log in via Magic Link to my email so that I don't manage passwords.
- As an **owner**, I want to invite my employees (branch manager / sales / warehouse) via email or WhatsApp so that they can join with the right permissions.
- As an **owner**, I want to change an employee's role or deactivate them so that I control access as my team changes.
- As an **owner**, I want to see an audit log of sensitive actions so that I can investigate problems.

### עובד מוזמן (`branch_manager` / `sales` / `warehouse`)
- As an **invited user**, I want to click a link from email or WhatsApp and access the system within 30 seconds so that I'm not blocked from work.

### MasterPet Super Admin (`super_admin`)
- As a **super_admin**, I want to see all new tenant signups and approve them one by one so that I prevent spam and verify legitimate businesses.
- As a **super_admin**, I want to suspend a tenant (e.g., for non-payment) so that they lose access without losing data.

---

## 4. Functional Requirements

| # | דרישה | עדיפות |
|---|---|---|
| FR-1 | טופס Self-Signup פתוח (`/signup`) — שם עסק, סוג עסק, שם בעלים, מייל, טלפון | Must Have |
| FR-2 | יצירת tenant ב-status `pending_approval` + שליחת מייל אישור ל-MasterPet | Must Have |
| FR-3 | ממשק `super_admin` (`/admin/tenants`) לראות, לאשר ולדחות tenants | Must Have |
| FR-4 | אישור tenant → status=`active`, `trial_ends_at` = now()+14d, Magic Link אוטומטי לבעלים | Must Have |
| FR-5 | Magic Link דרך Supabase Auth — הקלקה ⇒ session פעיל | Must Have |
| FR-6 | Custom JWT claims: `tenant_id`, `role` בכל token | Must Have |
| FR-7 | ממשק הזמנת משתמשים (`/settings/users`) — שם, מייל/טלפון, רול, ערוץ (email/whatsapp/both) | Must Have |
| FR-8 | יצירת `invitation` עם token חד-פעמי + expires_at (7d) | Must Have |
| FR-9 | שליחת קישור הזמנה במייל ו/או WhatsApp Cloud API | Must Have |
| FR-10 | דף קבלת הזמנה (`/invite/[token]`) — אימות → יצירת user → הצטרפות ל-tenant | Must Have |
| FR-11 | RLS על כל הטבלאות הקיימות (`tenants`, `users`, `invitations`, `audit_logs`) | Must Have |
| FR-12 | Middleware ב-Next.js שמפנה לא-מחוברים ל-`/login`, ולא-מורשים ל-`/403` | Must Have |
| FR-13 | רישום audit אוטומטי לפעולות הרגישות (ראה data-model.md) | Must Have |
| FR-14 | דף Audit Log (`/settings/audit`) — נראה רק ל-`owner` | Should Have |
| FR-15 | ביטול הזמנה ממתינה (revoke) | Should Have |
| FR-16 | שליחה חוזרת של Magic Link אם המשתמש לא הצליח להתחבר | Should Have |
| FR-17 | "השכחתי את ה-tenant שלי" — חיפוש לפי מייל ושליחה ידנית | Nice to Have |

---

## 5. UI/UX

- **כיוון:** RTL, עברית (he-IL).
- **Locale:** Asia/Jerusalem.

### Routes (Next.js App Router)

| Route | תיאור | גישה |
|---|---|---|
| `app/(public)/signup/page.tsx` | טופס הרשמה עצמית | כולם |
| `app/(public)/login/page.tsx` | בקשת Magic Link | כולם |
| `app/(public)/invite/[token]/page.tsx` | קבלת הזמנה | כולם (token-gated) |
| `app/(public)/403/page.tsx` | אין הרשאה | כולם |
| `app/(dashboard)/settings/users/page.tsx` | רשימת משתמשים + הזמנות | `owner`, `branch_manager` |
| `app/(dashboard)/settings/users/invite/page.tsx` | טופס הזמנה | `owner`, `branch_manager` |
| `app/(dashboard)/settings/audit/page.tsx` | יומן ביקורת | `owner` |
| `app/(super-admin)/tenants/page.tsx` | אישור tenants חדשים | `super_admin` בלבד |

### shadcn/ui Components

- `Form` + `Input` + `Label` (Signup, Login, Invite)
- `Button`, `Card`, `Badge` (סטטוס: pending/active)
- `DataTable` (Users, Audit Log, Pending Tenants)
- `Sheet` (פאנל פרטי משתמש / הזמנה)
- `Dialog` (אישור פעולות: deactivate, revoke)
- `Tabs` (Users / Pending Invitations / Audit)
- `Sonner` (toast — "המייל נשלח", "אין הרשאה")
- `Avatar`, `DropdownMenu` (header — משתמש מחובר)

### Flow עיקרי: Onboarding של tenant חדש

1. בעל עסק נכנס ל-`/signup`, ממלא טופס.
2. Tenant נוצר עם `status='pending_approval'`. בעל העסק רואה דף "ההרשמה התקבלה — נחזור אליך תוך 24 שעות".
3. Super admin של MasterPet רואה התראה במייל + ב-`/admin/tenants`.
4. Super admin מאשר → trigger ב-DB: `tenants.status='active'`, `trial_ends_at=now()+14d`, נשלח Magic Link לבעלים.
5. בעלים מקליק על Magic Link → JWT עם `tenant_id` + `role='owner'` → נכנס ל-`/dashboard`.
6. בעלים נכנס ל-`/settings/users` ומזמין את צוותו.

### Flow: הזמנת עובד

1. `owner` בוחר "הזמן משתמש" → טופס: שם, מייל, טלפון, רול, ערוץ (email / whatsapp / both).
2. Backend יוצר `invitation` עם token, שולח לפי הערוץ:
   - **email:** Edge Function שולחת מייל עם `/invite/[token]` (Resend או Supabase Email).
   - **whatsapp:** Edge Function קוראת ל-WhatsApp Cloud API עם template מאושר.
3. מוזמן מקליק → דף `/invite/[token]` מאמת token: בודק `status='pending'`, `expires_at > now()`.
4. אם תקף — מבקש Magic Link (Supabase Auth) למייל/טלפון שבהזמנה.
5. אחרי אימות — נוצר `user` עם הרול שמההזמנה, `invitation.status='accepted'`.

### Empty States

- `settings/users` כשאין הזמנות: "אין עוד עובדים — הזמן את הראשון" + CTA.
- `settings/audit` כשאין רישומים: "אין פעילות חריגה לתעד" + הסבר מה נרשם.

### Error / Loading States

- Magic Link עם error: "הקישור פג תוקף או שכבר נוצל. בקש קישור חדש."
- Invitation עם error: "ההזמנה פגה. פנה למזמין שיהזמין אותך מחדש."
- אין הרשאה: דף `/403` עם הסבר ידידותי + כפתור "חזור לדשבורד".

---

## 6. Technical Spec

### DB Schema (Supabase)

> הסכמה המלאה מתועדת ב-`prd/_shared/data-model.md`. כאן SQL ה-migrations.

```sql
-- ============== tenants ==============
CREATE TABLE tenants (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT        NOT NULL,
  slug            TEXT        UNIQUE NOT NULL,
  business_type   TEXT,
  contact_phone   TEXT,
  contact_email   TEXT,
  status          TEXT        NOT NULL DEFAULT 'pending_approval'
                  CHECK (status IN ('pending_approval','active','suspended','cancelled')),
  plan            TEXT        DEFAULT 'trial'
                  CHECK (plan IN ('trial','basic','pro','enterprise')),
  trial_ends_at   TIMESTAMPTZ,
  trial_status    TEXT        DEFAULT 'active'
                  CHECK (trial_status IN ('active','grace_period','read_only','expired')),
  -- active: trial רגיל. grace_period: 3 ימים אחרי trial_ends_at. read_only: אחרי grace. expired: חסום לחלוטין (P2+).
  approved_at     TIMESTAMPTZ,
  approved_by     UUID,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_tenants_status ON tenants(status);

-- ============== branches ==============
CREATE TABLE branches (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID        NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name            TEXT        NOT NULL,
  slug            TEXT        NOT NULL,
  address         TEXT,
  phone           TEXT,
  is_active       BOOLEAN     NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tenant_id, slug)
);
CREATE INDEX idx_branches_tenant ON branches(tenant_id);

-- ============== users ==============
CREATE TABLE users (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id    UUID        UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id       UUID        NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  email           TEXT        NOT NULL,
  phone           TEXT,
  full_name       TEXT        NOT NULL,
  role            TEXT        NOT NULL
                  CHECK (role IN ('owner','branch_manager','sales','warehouse','super_admin')),
  branch_id       UUID        REFERENCES branches(id) ON DELETE SET NULL,
  status          TEXT        NOT NULL DEFAULT 'active'
                  CHECK (status IN ('active','inactive','pending_invitation')),
  last_login_at   TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_users_tenant ON users(tenant_id);
CREATE INDEX idx_users_email ON users(email);

-- ============== invitations ==============
CREATE TABLE invitations (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID        NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  email           TEXT,
  phone           TEXT,
  full_name       TEXT        NOT NULL,
  role            TEXT        NOT NULL CHECK (role IN ('owner','branch_manager','sales','warehouse')),
  branch_id       UUID        REFERENCES branches(id) ON DELETE SET NULL,
  channel         TEXT        NOT NULL CHECK (channel IN ('email','whatsapp','both')),
  token           TEXT        UNIQUE NOT NULL,
  status          TEXT        NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending','accepted','expired','revoked')),
  invited_by      UUID        NOT NULL REFERENCES users(id),
  expires_at      TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  accepted_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT email_or_phone CHECK (email IS NOT NULL OR phone IS NOT NULL)
);
CREATE INDEX idx_invitations_token ON invitations(token);
CREATE INDEX idx_invitations_tenant_status ON invitations(tenant_id, status);

-- ============== audit_logs ==============
CREATE TABLE audit_logs (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID        REFERENCES tenants(id) ON DELETE SET NULL,
  actor_user_id   UUID        REFERENCES users(id) ON DELETE SET NULL,
  actor_email     TEXT,
  action          TEXT        NOT NULL,
  entity_type     TEXT,
  entity_id       UUID,
  metadata        JSONB       DEFAULT '{}'::JSONB,
  ip_address      INET,
  user_agent      TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_audit_tenant_created ON audit_logs(tenant_id, created_at DESC);
CREATE INDEX idx_audit_actor ON audit_logs(actor_user_id, created_at DESC);

-- ============== permissions ==============
-- tenant_id = NULL → default system permission (applies to all tenants)
-- tenant_id = X   → per-tenant override (Phase 2: Role Builder)
CREATE TABLE permissions (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID        REFERENCES tenants(id) ON DELETE CASCADE,
  role            TEXT        NOT NULL,
  resource        TEXT        NOT NULL,
  -- resources: orders | inventory | customers | users | audit | billing | settings | couriers
  action          TEXT        NOT NULL,
  -- actions: read | write | delete | invite | manage
  is_allowed      BOOLEAN     NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tenant_id, role, resource, action)
);
CREATE INDEX idx_permissions_tenant_role ON permissions(tenant_id, role);

-- ============== seed: system defaults (MVP — 4 fixed roles) ==============
INSERT INTO permissions (tenant_id, role, resource, action) VALUES
  -- owner: כל גישה לכל דבר
  (NULL, 'owner', '*', '*'),
  -- branch_manager: הזמנות + מלאי + לקוחות + עובדים בסניף שלו
  (NULL, 'branch_manager', 'orders',    'read'),
  (NULL, 'branch_manager', 'orders',    'write'),
  (NULL, 'branch_manager', 'inventory', 'read'),
  (NULL, 'branch_manager', 'inventory', 'write'),
  (NULL, 'branch_manager', 'customers', 'read'),
  (NULL, 'branch_manager', 'customers', 'write'),
  (NULL, 'branch_manager', 'users',     'read'),
  (NULL, 'branch_manager', 'users',     'invite'),
  (NULL, 'branch_manager', 'couriers',  'read'),
  (NULL, 'branch_manager', 'couriers',  'write'),
  -- sales: הזמנות + לקוחות בלבד
  (NULL, 'sales', 'orders',    'read'),
  (NULL, 'sales', 'orders',    'write'),
  (NULL, 'sales', 'customers', 'read'),
  (NULL, 'sales', 'customers', 'write'),
  -- warehouse: הזמנות (קריאה) + מלאי + שליחים
  (NULL, 'warehouse', 'orders',    'read'),
  (NULL, 'warehouse', 'inventory', 'read'),
  (NULL, 'warehouse', 'inventory', 'write'),
  (NULL, 'warehouse', 'couriers',  'read'),
  (NULL, 'warehouse', 'couriers',  'write');
```

### RLS Policies

```sql
ALTER TABLE tenants     ENABLE ROW LEVEL SECURITY;
ALTER TABLE branches    ENABLE ROW LEVEL SECURITY;
ALTER TABLE users       ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs  ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;

-- helper: get tenant_id from JWT
-- NOTE: נוצר ב-public schema (לא auth) — Supabase חוסם כתיבה ל-auth schema
CREATE OR REPLACE FUNCTION public.current_tenant_id() RETURNS UUID AS $$
  SELECT NULLIF(auth.jwt() ->> 'tenant_id', '')::UUID;
$$ LANGUAGE SQL STABLE;

-- helper: get role from JWT
CREATE OR REPLACE FUNCTION public.current_user_role() RETURNS TEXT AS $$
  SELECT auth.jwt() ->> 'role';
$$ LANGUAGE SQL STABLE;

-- helper: get branch_id from JWT
CREATE OR REPLACE FUNCTION public.current_branch_id() RETURNS UUID AS $$
  SELECT NULLIF(auth.jwt() ->> 'branch_id', '')::UUID;
$$ LANGUAGE SQL STABLE;

-- tenants: super_admin רואה הכל. אחרים — רק את ה-tenant שלהם
CREATE POLICY tenants_select ON tenants FOR SELECT
  USING (public.current_user_role() = 'super_admin' OR id = public.current_tenant_id());
CREATE POLICY tenants_update ON tenants FOR UPDATE
  USING (auth.current_role() = 'super_admin'
         OR (id = auth.current_tenant_id() AND auth.current_role() = 'owner'));

-- branches: owner + super_admin רואים כל הסניפים; branch_manager/sales/warehouse — רק הסניף שלהם
CREATE POLICY branches_select ON branches FOR SELECT
  USING (
    auth.current_role() = 'super_admin'
    OR (tenant_id = auth.current_tenant_id()
        AND (auth.current_role() = 'owner' OR id = auth.current_branch_id()))
  );
CREATE POLICY branches_insert ON branches FOR INSERT
  WITH CHECK (tenant_id = auth.current_tenant_id() AND auth.current_role() = 'owner');
CREATE POLICY branches_update ON branches FOR UPDATE
  USING (tenant_id = auth.current_tenant_id() AND auth.current_role() = 'owner');

-- permissions: קריאה לכולם ב-tenant; כתיבה לowner בלבד (Phase 2: Role Builder)
CREATE POLICY permissions_select ON permissions FOR SELECT
  USING (tenant_id IS NULL OR tenant_id = auth.current_tenant_id() OR auth.current_role() = 'super_admin');
CREATE POLICY permissions_insert ON permissions FOR INSERT
  WITH CHECK (tenant_id = auth.current_tenant_id() AND auth.current_role() = 'owner');
CREATE POLICY permissions_update ON permissions FOR UPDATE
  USING (tenant_id = auth.current_tenant_id() AND auth.current_role() = 'owner');

-- users: owner רואה כל הסניפים; branch_manager/sales/warehouse — רק הסניף שלהם
CREATE POLICY users_select ON users FOR SELECT
  USING (
    auth.current_role() = 'super_admin'
    OR (tenant_id = auth.current_tenant_id()
        AND (auth.current_role() = 'owner'
             OR branch_id = auth.current_branch_id()
             OR id = (SELECT id FROM users WHERE auth_user_id = auth.uid())))
  );
CREATE POLICY users_insert ON users FOR INSERT
  WITH CHECK (tenant_id = auth.current_tenant_id()
              AND auth.current_role() IN ('owner','branch_manager'));
CREATE POLICY users_update ON users FOR UPDATE
  USING (tenant_id = auth.current_tenant_id()
         AND auth.current_role() IN ('owner','branch_manager'));

-- invitations: רק owner/branch_manager של ה-tenant
CREATE POLICY invitations_all ON invitations FOR ALL
  USING (tenant_id = auth.current_tenant_id()
         AND auth.current_role() IN ('owner','branch_manager'));

-- audit_logs: owner רואה את כל ה-tenant; אחרים — רק שורות שהם actor
CREATE POLICY audit_select ON audit_logs FOR SELECT
  USING (
    auth.current_role() = 'super_admin'
    OR (tenant_id = auth.current_tenant_id() AND auth.current_role() = 'owner')
    OR actor_user_id = (SELECT id FROM users WHERE auth_user_id = auth.uid())
  );
-- INSERT ל-audit — רק דרך Edge Functions (service role)
```

### Custom JWT Claims (Supabase Auth Hook)

```typescript
// supabase/functions/auth-jwt-hook/index.ts
// מופעל ע"י Supabase לפני יצירת JWT
export default async (event) => {
  const { user_id } = event;
  const { data: profile } = await supabase
    .from('users')
    .select('tenant_id, role, branch_id')
    .eq('auth_user_id', user_id)
    .single();

  return {
    claims: {
      ...event.claims,
      tenant_id: profile?.tenant_id ?? null,
      role:      profile?.role      ?? null,
      branch_id: profile?.branch_id ?? null,
    },
  };
};
```

### Edge Functions

| Function | Trigger | מטרה |
|---|---|---|
| `fn-tenant-signup` | HTTP POST `/api/signup` | יצירת tenant חדש ב-status=pending_approval + מייל ל-MasterPet |
| `fn-tenant-approve` | HTTP POST (super_admin) | אישור tenant: status=active, trial_ends_at, שליחת Magic Link לבעלים |
| `fn-invitation-send` | HTTP POST (owner/branch_manager) | יצירת invitation + שליחה במייל/WhatsApp |
| `fn-invitation-accept` | HTTP POST (token) | אימות token + יצירת user + עדכון invitation.status |
| `fn-jwt-hook` | Supabase Auth Hook | הזרקת tenant_id ו-role ל-JWT |
| `fn-audit-write` | Internal (RPC) | רישום audit_log (קוראים מתוך Edge Functions אחרות) |

### Frontend Components

| Component | Path | מטרה |
|---|---|---|
| `SignupForm` | `app/(public)/signup/components/signup-form.tsx` | טופס Self-Signup |
| `LoginForm` | `app/(public)/login/components/login-form.tsx` | בקשת Magic Link |
| `InviteAcceptForm` | `app/(public)/invite/[token]/components/accept-form.tsx` | אימות הזמנה |
| `UsersTable` | `app/(dashboard)/settings/users/components/users-table.tsx` | רשימת משתמשים |
| `InviteUserSheet` | `app/(dashboard)/settings/users/components/invite-user-sheet.tsx` | פאנל הזמנת משתמש |
| `AuditLogTable` | `app/(dashboard)/settings/audit/components/audit-table.tsx` | יומן ביקורת |
| `PendingTenantsTable` | `app/(super-admin)/tenants/components/pending-table.tsx` | רשימת tenants לאישור |
| `AuthProxy` | `src/proxy.ts` | הפניות UI בלבד (optimistic) — אבטחה אמיתית ב-DAL |
| `verifySession` | `src/app/lib/dal.ts` | DAL — בדיקת session + role בכל Server Action/Component |

### Next.js 16 — שינויים שמשפיעים על Auth (Breaking Changes)

> **⚠️ Next.js 16 שינה את ה-middleware לחלוטין.** כל קוד שנכתב לפי Next.js 14/15 ישבר.

| # | מה השתנה | Next.js 14/15 | Next.js 16 |
|---|---|---|---|
| 1 | שם הקובץ | `middleware.ts` | **`proxy.ts`** |
| 2 | שם הפונקציה | `export function middleware()` | **`export function proxy()`** |
| 3 | `cookies()` | סינכרוני | **חובה `await cookies()`** |
| 4 | הגנת routes | אפשר לסמוך על middleware | Proxy = UI בלבד; **חובה DAL בכל Server Action** |
| 5 | Layout auth | עבד | **Layouts לא מרנדרים מחדש בניווט — auth בתוך leaf components בלבד** |

### Proxy (Next.js 16) — src/proxy.ts

```typescript
// src/proxy.ts — הפניות UI בלבד, לא אמצעי אבטחה עצמאי
// route patterns:
//   /super-admin/* → role === 'super_admin'             (redirect אם לא)
//   /settings/audit/* → role === 'owner'                (redirect אם לא)
//   /settings/users/* → role IN ('owner','branch_manager')
//   /(dashboard)/* → tenant.status === 'active'
// JWT claims נגישים: tenant_id | role | branch_id
// branch isolation: RLS אוכפת אוטומטית לפי branch_id ב-JWT
// / (root) → redirect('/login') לא-מחוברים. דף נחיתה שיווקי = Post-MVP (PRD נפרד).
// אבטחה אמיתית: verifySession() בתוך כל Server Action ו-Server Component
```

### DAL — src/app/lib/dal.ts

```typescript
// src/app/lib/dal.ts
import 'server-only'
import { cache } from 'react'
import { cookies } from 'next/headers'

export const verifySession = cache(async () => {
  const cookieStore = await cookies() // חובה await ב-Next.js 16
  // ... decrypt + validate
})
```

---

## 7. Acceptance Criteria

### פונקציונליות
- [ ] טופס `/signup` יוצר tenant ב-status `pending_approval` + שולח מייל ל-MasterPet
- [ ] super_admin רואה את ה-tenant החדש ב-`/admin/tenants` ויכול לאשר/לדחות
- [ ] אישור → status=active + trial_ends_at + שליחת Magic Link לבעלים
- [ ] Magic Link מאמת ויוצר session עם `tenant_id` ו-`role` ב-JWT
- [ ] owner מזמין משתמש דרך `/settings/users/invite` — נשלחת הזמנה במייל ו/או WhatsApp
- [ ] קליק על `/invite/[token]` מאמת token (תקף, לא נוצל, לא פג) → Magic Link → user נוצר עם הרול הנכון
- [ ] שינוי רול / deactivate / revoke הזמנה — נרשם ל-audit_log
- [ ] דף `/settings/audit` מציג רישומים, רק ל-owner

### אבטחה
- [ ] **RLS מאומת** — tenant A לא יכול לגשת לדאטה של tenant B (בדוק עם 2 tenants ב-DB)
- [ ] `sales` לא יכול להזמין משתמש (403)
- [ ] `branch_manager` לא רואה את עמוד `/settings/audit` (403)
- [ ] `super_admin` לא יכול להגיע ל-`/dashboard` של tenant בלי לבחור אותו במפורש
- [ ] Token של הזמנה — חד-פעמי, expired אחרי שימוש או 7 ימים
- [ ] Magic Link — תוקף שעה, חד-פעמי
- [ ] Audit log — INSERT רק דרך service role (לא ניתן לזיוף)

### UX
- [ ] RTL נכון בעברית בכל ה-routes, ב-breakpoints 375px / 768px / 1280px
- [ ] Empty states, Loading states, Error states — מטופלים בכל מסך
- [ ] טפסים בעברית, validation בעברית, הודעות שגיאה ברורות
- [ ] Magic Link עובד גם ב-Gmail וגם ב-Outlook (לבדוק)
- [ ] WhatsApp template מאושר ע"י Meta לפני go-live

### 4 הרולים — בדיקת תרחישים
- [ ] `owner` יכול: לראות/לערוך כל user, להזמין, לראות audit, לשנות settings, לראות billing
- [ ] `branch_manager` יכול: לראות/לערוך users, להזמין — **אבל** לא לראות billing ולא audit
- [ ] `sales` יכול: לראות את עצמו בלבד ב-users — לא להזמין, לא לערוך
- [ ] `warehouse` יכול: לראות את עצמו בלבד — בעיקר משתמש ב-PWA נפרד
- [ ] `super_admin` יכול: לראות את כל ה-tenants, לאשר/להשעות — **אבל** לא לראות תוכן הזמנות/לקוחות (privacy)

---

## 8. פאזה ואומדן

| | |
|---|---|
| **פאזה** | MVP — Sprint 1-2 (חודש 1) |
| **Frontend** | ~7 ימים (signup, login, invite, users table, audit table, super-admin) |
| **Backend** | ~5 ימים (migrations, RLS, Edge Functions, JWT hook) |
| **Integrations** | ~2 ימים (Resend / Supabase Email, WhatsApp Cloud API template) |
| **QA + Security review** | ~2 ימים |
| **סה"כ** | **~16 ימים** (כ-3 שבועות עם buffer) |

---

## 9. תלויות

### דורש (לפני):
- Supabase project פעיל ✅ (קיים: `hrlrxjnyafzcoljguwkl`)
- אישור Meta על WhatsApp Business Account + template מאושר
- ספק שליחת מיילים מוסדר (Resend / Supabase Email / SendGrid)
- החלטה איך MasterPet מקבל התראה על tenant חדש (Slack / מייל / שניהם)

### חוסם (מה תלוי בזה):
- כל PRD אחר ב-MVP — `tenant_id`, role check, RLS pattern.

---

## 10. החלטות שנסגרו (לשעבר: שאלות פתוחות)

> כל השאלות נסגרו ב-2026-05-19. ה-PRD מוכן לפיתוח.

| # | שאלה / סיכון | סטטוס | החלטה |
|---|---|---|---|
| 1 | Resend או Supabase Email? | ✅ סגור | **Resend.** 3K מיילים/חודש בחינם, deliverability מצוין, RTL טוב. דורש domain verification (`masterpet.co.il`). |
| 2 | טקסט WhatsApp template להזמנה | ✅ סגור | טון יבש מקצועי, גוף "אתה". ראה סעיף 13. Category=UTILITY לאישור Meta. |
| 3 | Super admin — route או subdomain? | ✅ סגור | **MVP: route `/super-admin/`** באותו דומיין. **Phase 2+: subdomain** `admin.masterpet.co.il` — מנותק מהלקוחות, מבודד אבטחתית, יותר מאובטח מבחינת CORS/cookies. |
| 4 | מייל דחייה ל-tenant — לשלוח? איזה טקסט? | ✅ סגור | **כן.** טון חם ואמפתי, ללא הסבר ספציפי לסיבת הדחייה, פתיחות לשיחה. ראה סעיף 13. |
| 5 | מה קורה בסוף Trial? | ✅ סגור | **באנר 7 ימים לפני** סיום + **grace period 3 ימים** אחרי + **read-only** אחרי. דורש שדה `trial_status` ב-schema (ראה סעיף 6). חיוב בפועל מטופל ב-PRD #10 (Billing). |
| 6 | האם משתמש יכול להיות חבר ביותר מ-tenant אחד? | ✅ סגור | **לא ב-MVP.** Phase 2+ — נדרשת טבלת קישור `user_tenants` |
| 7 | 2FA ל-`super_admin`? | ✅ סגור | **דחייה ל-Phase 2.** Magic Link חזק (חד-פעמי, שעה תוקף), מעט super_admins (2-3 פנימיים). אם נגדל — נוסיף TOTP בחינם. |
| 8 | מה קורה אם tenant suspended? | ✅ סגור | logout מיידי + מסך הסבר "החשבון מושעה — צור קשר עם MasterPet" |

---

## 11. נספח: רשימת Audit Actions ל-MVP

```
auth.login_success         — התחברות מוצלחת
auth.login_failed          — ניסיון התחברות כושל
auth.logout                — יציאה
auth.magic_link_sent       — נשלח Magic Link
invitation.sent            — נשלחה הזמנה
invitation.accepted        — התקבלה הזמנה
invitation.revoked         — בוטלה הזמנה
user.role_changed          — שונה רול של משתמש (before/after ב-metadata)
user.deactivated           — משתמש הושבת
user.reactivated           — משתמש הופעל מחדש
tenant.settings_changed    — שינוי הגדרות tenant
tenant.plan_changed        — שינוי plan/billing
tenant.suspended           — tenant הושעה ע"י super_admin
data.exported              — יצוא דאטה (לעתיד)
```

---

## 12. סוכנים אחראיים

- **Lead:** `backend-engineer` + `security-engineer`
- **DB + RLS:** `backend-engineer`
- **UI:** `frontend-engineer` + `ui-implementer` (לפי convention ב-`agents/disciplines/`)
- **WhatsApp + Email templates:** `hebrew-rtl-expert` + `conversational-designer`
- **Code Review:** `code-reviewer` (חובה לפני merge ל-master)
- **QA:** `qa-engineer` — כל 4 הרולים + RLS isolation

---

## 13. תבניות תוכן מאושרות

> נסגר 2026-05-19. כל טקסט שיופיע למשתמש עובר דרך כאן.

### 13.1 מייל דחיית tenant (`fn-tenant-reject`)

- **Provider:** Resend
- **From:** `MasterPet <hello@masterpet.co.il>`
- **Reply-To:** `hello@masterpet.co.il`
- **Subject:** `ביקשת להצטרף ל-MasterPet — בקשה לעדכון`
- **Trigger:** super_admin לוחץ "דחה" ב-`/super-admin/tenants/[id]`

**Body (HTML + plain text):**

```
שלום {{owner_name}},

תודה שפנית אלינו ושיתפת אותנו בעסק שלך, {{business_name}}.
שמחנו לקרוא על מה שאתם עושים.

לאחר בדיקה, לא נוכל לאשר את הצטרפותך ל-MasterPet בשלב הזה.

אנחנו יודעים שזו לא התשובה שקיווית לקבל, ואנחנו מבינים שזה
מאכזב. הדלת לא נסגרה — אם תרצה שנבחן את הבקשה שוב בעוד
כמה חודשים, או אם יש משהו שתרצה לשתף איתנו, אנחנו פה.

מוזמן לכתוב לנו ישירות: hello@masterpet.co.il

מאחלים לך הצלחה,
צוות MasterPet
```

**עקרונות עיצוב:**
- אין הסבר ספציפי לסיבת הדחייה (יוצר ויכוחים מיותרים)
- "הדלת לא נסגרה" — חם, לא סופי
- חתימה "צוות MasterPet" (לא "מערכת", לא שם פרטי של super_admin)

### 13.2 WhatsApp template — הזמנת עובד

- **Template name:** `employee_invitation_v1`
- **Category:** UTILITY (חובה — לא MARKETING, כדי לעבור אישור Meta)
- **Language:** Hebrew (he)
- **Trigger:** owner/branch_manager שולחים הזמנה דרך `/settings/users/invite` עם channel ∈ {whatsapp, both}

**Body:**

```
שלום {{1}},

{{2}} הזמין אותך להצטרף למערכת MasterPet של {{3}}.

לקבלת גישה, לחץ על הקישור:
{{4}}

הקישור בתוקף ל-7 ימים.
```

**משתנים (סדר חובה):**

| # | שם | מקור | דוגמה |
|---|---|---|---|
| `{{1}}` | שם המוזמן | `invitation.full_name` | "דנה כהן" |
| `{{2}}` | שם המזמין | `users.full_name` של `invited_by` | "ירין גולן" |
| `{{3}}` | שם העסק | `tenants.name` | "פטסטור" |
| `{{4}}` | קישור ההזמנה | `https://masterpet.co.il/invite/{{token}}` | URL מלא |

**הערות לאישור Meta:**
- Category=UTILITY (קשור לתפקוד מערכת, לא שיווק) → סיכוי גבוה לאישור
- אין אימוג'י, אין promotion language
- כל המשתנים נחוצים וברורים
- "הקישור בתוקף ל-7 ימים" — שקיפות שעוזרת באישור

### 13.3 הודעת באנר — סוף Trial

- **Trigger:** middleware קורא `tenants.trial_ends_at` ו-`tenants.trial_status`
- **תצוגה:** רכיב `Alert` (shadcn) קבוע בראש כל דף ב-`(dashboard)`

| מצב | כותרת | טקסט | CTA |
|---|---|---|---|
| 7 ימים לפני סיום | "תקופת הניסיון מסתיימת בעוד {{days}} ימים" | "המשך להשתמש ללא הפרעה — שדרג עכשיו לתוכנית בתשלום." | "שדרג עכשיו" → `/settings/billing` |
| 0-3 ימים אחרי (`grace_period`) | "תקופת הניסיון הסתיימה — נשארו {{days}} ימי חסד" | "המערכת עדיין מלאה בפעולה. לאחר {{days}} ימים תעבור למצב צפייה בלבד." | "שדרג עכשיו" → `/settings/billing` |
| לאחר grace (`read_only`) | "המערכת במצב צפייה בלבד" | "פעולות חדשות חסומות. שדרג לתוכנית בתשלום כדי להמשיך לעבוד." | "שדרג עכשיו" → `/settings/billing` |

**הערה:** המעבר בין `active` → `grace_period` → `read_only` יעובד ע"י cron job יומי (Supabase scheduled function), שינוסח ב-PRD #10 (Billing).
