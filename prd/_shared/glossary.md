# Glossary — MasterPet

> מילון מונחים. כל מונח שמופיע ב-PRD צריך להיות כאן. אם מונח חסר — הוסף אותו.

**עדכון אחרון:** 2026-05-19

---

## ישויות (Entities)

| מונח | באנגלית | הגדרה |
|---|---|---|
| **Tenant** | tenant | עסק שמשתמש ב-MasterPet (חנות מזון לחיות, וטרינר, מותג). יחידת הבידוד של multi-tenancy. |
| **Tenant Status** | tenant_status | מצב ה-tenant: `pending_approval` / `active` / `suspended` / `cancelled`. |
| **User** | user | משתמש פנימי של ה-tenant (עובד/מנהל). שונה מ-**Customer**. |
| **Customer** | customer | לקוח קצה של ה-tenant (B2C). זה שקונה את האוכל. |
| **Pet** | pet | חיית מחמד של Customer. עם גזע/משקל/גיל/אלרגיות. |
| **Order** | order | הזמנה של Customer. יכולה להיות חד-פעמית או חלק מ-Subscription. |
| **Subscription** | subscription | מנוי של Customer לחידוש אוטומטי. |
| **Product** | product | פריט מלאי. עם קטגוריות (חיה/גיל/דיאטה/אריזה). |
| **Branch** | branch | סניף פיזי של ה-tenant (Phase 1.5/2). MVP: tenant אחד = סניף אחד לוגית. |
| **Invitation** | invitation | הזמנה ממתינה למשתמש חדש להצטרף ל-tenant. |
| **Audit Log Entry** | audit_log | רישום פעולה רגישה במערכת. |

---

## רולים (Roles)

| מונח עברי | קוד | הרשאות |
|---|---|---|
| בעל עסק / מנהל ראשי | `owner` | הכל: billing, settings, כל הדאטה, ניהול משתמשים |
| מנהל סניף | `branch_manager` | הזמנות, מלאי, CRM, ניהול עובדים — **ללא billing** |
| עובד מכירות (היברידי) | `sales` | הזמנות + CRM — **בלי admin settings** |
| מנהל מחסן / לוגיסטיקן | `warehouse` | PWA משלוחים, אישור קבלה, מלאי |
| Super Admin (פנימי) | `super_admin` | צוות MasterPet — cross-tenant, אישור tenants חדשים |

---

## מושגי תהליך (Process Terms)

| מונח | הגדרה |
|---|---|
| **Onboarding** | תהליך ההרשמה והכניסה הראשונה של tenant חדש. כולל יצירת חשבון, אישור MasterPet, Magic Link, יצירת users ראשונים. |
| **Magic Link** | קישור חד-פעמי שנשלח למייל/WhatsApp לאימות זהות בלי סיסמה. |
| **Trial** | תקופת ניסיון של 14 ימים מרגע אישור ה-tenant. |
| **Self-Signup** | הרשמה עצמית של tenant חדש דרך טופס פתוח. |
| **Manual Approval** | שלב שבו MasterPet super_admin מאשר ידנית כל tenant חדש לפני הפעלה. |
| **Self-Service Invitation** | בעל העסק מזמין עובד דרך הממשק (לא דרך MasterPet). |
| **Tenant Isolation** | בידוד דאטה — tenant A לא יכול לראות/לערוך דאטה של tenant B. נאכף ע"י RLS. |
| **Stock-out** | מצב שבו מוצר אזל ממלאי (תתועד החל מ-MVP, חיזוי החל מ-Phase 2). |
| **Order Inbox** | תיבת הקליטה הריכוזית להזמנות מכל הערוצים (WhatsApp/טלפון/אתר/מרקטפליסים). |
| **Loyalty** | תוכנית נאמנות — נקודות, הנחת מנוי, Tiers (P2). |
| **Audit Log** | תיעוד פעולות רגישות בלבד ב-MVP. לא תיעוד מלא של כל שינוי. |

---

## מושגים טכניים (Technical Terms)

| מונח | הגדרה |
|---|---|
| **RLS** | Row Level Security — מנגנון של Postgres/Supabase לבידוד שורות לפי policy. הבסיס של multi-tenancy ב-MasterPet. |
| **JWT Claim** | ערך שמוטמע בטוקן Supabase Auth. אנחנו מטמיעים `tenant_id` ו-`role` כ-custom claims. |
| **Edge Function** | פונקציה serverless של Supabase (Deno). מתאימה ל-webhook, פעולות אטומיות, אינטגרציות. |
| **shadcn/ui** | ספריית קומפוננטות שאנחנו משתמשים בה (לא npm package — קוד שמועתק). |
| **App Router** | מערכת ה-routing של Next.js 14 (`app/` directory, לא `pages/`). |
| **RTL** | Right-To-Left — כיוון כתיבה עברי. כל הממשק חייב להיות RTL נכון. |
| **E.164** | פורמט בינלאומי לטלפון: `+972501234567` (בלי רווחים/מקפים). |

---

## ערכים קבועים (Constants)

| מונח | ערך |
|---|---|
| Trial Length | 14 ימים |
| Invitation Expiry | 7 ימים מהשליחה |
| Magic Link Expiry | 1 שעה (ברירת מחדל של Supabase) |
| Currency Default | ILS (₪) |
| Timezone Default | Asia/Jerusalem |
| Locale Default | he-IL |
