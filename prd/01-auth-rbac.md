# PRD: Auth + RBAC + 4 רולות + Onboarding

**פאזה:** MVP (Sprint 1-2)
**תאריך:** 2026-05-19
**סטטוס:** Draft
**תלוי ב:** —
**חוסם:** כל שאר PRDs (זהו הבסיס)

---

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
  approved_at     TIMESTAMPTZ,
  approved_by     UUID,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_tenants_status ON tenants(status);

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
  branch_id       UUID,  -- FK ל-branches יתווסף ב-Phase 1.5
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
```

### RLS Policies

```sql
ALTER TABLE tenants     ENABLE ROW LEVEL SECURITY;
ALTER TABLE users       ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs  ENABLE ROW LEVEL SECURITY;

-- helper: get tenant_id from JWT
CREATE OR REPLACE FUNCTION auth.current_tenant_id() RETURNS UUID AS $$
  SELECT NULLIF(auth.jwt() ->> 'tenant_id', '')::UUID;
$$ LANGUAGE SQL STABLE;

-- helper: get role from JWT
CREATE OR REPLACE FUNCTION auth.current_role() RETURNS TEXT AS $$
  SELECT auth.jwt() ->> 'role';
$$ LANGUAGE SQL STABLE;

-- tenants: super_admin רואה הכל. אחרים — רק את ה-tenant שלהם
CREATE POLICY tenants_select ON tenants FOR SELECT
  USING (auth.current_role() = 'super_admin' OR id = auth.current_tenant_id());
CREATE POLICY tenants_update ON tenants FOR UPDATE
  USING (auth.current_role() = 'super_admin'
         OR (id = auth.current_tenant_id() AND auth.current_role() = 'owner'));

-- users: רואה רק users של ה-tenant שלו
CREATE POLICY users_select ON users FOR SELECT
  USING (tenant_id = auth.current_tenant_id() OR auth.current_role() = 'super_admin');
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
    .select('tenant_id, role')
    .eq('auth_user_id', user_id)
    .single();

  return {
    claims: {
      ...event.claims,
      tenant_id: profile?.tenant_id ?? null,
      role: profile?.role ?? null,
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
| `AuthMiddleware` | `middleware.ts` | בדיקת session + role לכל route |

### Middleware (Next.js)

```typescript
// middleware.ts
// בדיקה: יש session? יש tenant_id? הרול מתאים ל-route?
// route patterns:
//   /super-admin/* → role === 'super_admin'
//   /settings/audit/* → role === 'owner'
//   /settings/users/* → role IN ('owner','branch_manager')
//   /(dashboard)/* → tenant.status === 'active'
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

## 10. סיכונים ושאלות פתוחות

| # | שאלה / סיכון | סטטוס | החלטה |
|---|---|---|---|
| 1 | האם נשתמש ב-Resend או Supabase Email? | פתוח | להחליט לפני sprint 1 |
| 2 | מה הטקסט המאושר של WhatsApp template להזמנה? | פתוח | יוגדר ע"י `hebrew-rtl-expert` + `conversational-designer` |
| 3 | Super admin — כניסה דרך `/admin` נפרד או דרך אותה כניסה? | פתוח | המלצה: subdomain `admin.masterpet.co.il` ב-Phase 2; MVP — route `/super-admin/` באותו דומיין |
| 4 | אם tenant נדחה — האם נשלח מייל הסבר? | פתוח | כן (UX). טקסט יוגדר ע"י `conversational-designer` |
| 5 | מה קורה כשטרייאל מסתיים? נחסום או רק נציג באנר? | פתוח | להחליט ב-PRD של Billing |
| 6 | האם משתמש יכול להיות חבר ביותר מ-tenant אחד? | סגור | **לא ב-MVP.** Phase 2+ — נדרשת טבלת קישור `user_tenants` |
| 7 | האם להוסיף 2FA ל-`super_admin`? | פתוח | מומלץ ע"י `security-engineer` — דחייה לאחרי MVP |
| 8 | מה קורה למשתמש מחובר אם ה-tenant שלו suspended? | סגור | logout מיידי + מסך הסבר "החשבון מושעה — צור קשר עם MasterPet" |

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
