# Glossary — MasterPet

> מילון מונחים. כל מונח שמופיע ב-PRD צריך להיות כאן. אם מונח חסר — הוסף אותו.

**עדכון אחרון:** 2026-05-30 (נוסף סעיף מסמכים חשבונאיים + מונחי Adapter pattern מ-PRD #19a)

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
| VAT Default | 18% |
| Monthly Invoice Cron | 1 לחודש 03:00 (pg_cron) |

---

## מסמכים חשבונאיים (Accounting Documents — PRD #19a)

| מונח עברי | באנגלית | קוד PayPlus | הגדרה |
|---|---|---|---|
| **תעודת משלוח** | Delivery Note | `crt_delivery` | מסמך משפטי שמלווה סחורה היוצאת לפני שמוצאה חשבונית. לא הכנסה — רק העברת בעלות פיזית. חייב מספר רץ ייעודי לפי חוק ניהול ספרים בישראל. |
| **חשבונית מס** | Tax Invoice | `inv_tax` | מסמך דרישת חוב. **ההכרה החשבונאית בהכנסה**. ב-PRD #19a — Phase 2 בלבד (לזרימת שוטף 30/60). מאחדת תעודות משלוח דרך `close_doc`. |
| **קבלה** | Receipt | `inv_receipt` | מסמך תשלום. מאשר שהכסף התקבל — לא הכרה בהכנסה. Phase 2 ב-PRD #19a. |
| **חשבונית מס-קבלה** | Tax Invoice Receipt | `inv_tax_receipt` | משלבת חשבונית+קבלה כשתשלום מתקבל באותו רגע (B2C רגיל). **המסמך העיקרי ב-MVP של PRD #19a**. |
| **חשבונית זיכוי** | Credit Note | `inv_refund` | מבטלת חשבונית קיימת. חובה לפי חוק — אסור למחוק חשבונית שהוצאה. מקושרת למקור דרך `cancel_doc`. ב-MVP של PRD #19a (נדרשת ל-Wizard לתיקון חשבונית). |
| **חשבונית עסקה / פרופורמה** | Pro Forma Invoice | `inv_proforma` | הצעה פיננסית לפני הזמנה (לא חוקית כחשבונית). Phase 2. |
| **תעודת החזרה** | Return Note | `crt_return` | למקרה החזרת סחורה. Phase 2. |
| **דרישת תשלום** | Payment Request | `inv_pay_request` | לשליחה ללקוח לפני שהחשבונית הופקה רשמית. Phase 2. |

---

## תנאי תשלום (Payment Terms — PRD #19a)

| מונח עברי | קוד | הגדרה |
|---|---|---|
| **תשלום מיידי** | `immediate` | לקוח משלם מיד בזמן ההזמנה. דרך PayPlus link או מזומן/העברה. |
| **שוטף 30** | `net_30` | תשלום עד 30 יום מהוצאת החשבונית. B2B מסחרי. דורש PRD #16 (אשראי לקוחות). |
| **שוטף 60** | `net_60` | תשלום עד 60 יום. למוסדות גדולים. |

---

## ספקי שירות חיצוניים (Provider Adapters — PRD #19a)

| מונח | הגדרה |
|---|---|
| **PaymentProvider** | Interface לסליקה: יצירת קישור תשלום, אימות webhook, החזר. ב-MVP — PayPlus. P2: Tranzila, Cardcom, Z-Credit. |
| **InvoiceProvider** | Interface לחשבוניות: הפקת 5 סוגי מסמכים. ב-MVP — PayPlus. P2: Morning, iCount, EZcount. |
| **Adapter Pattern** | תבנית עיצוב — interface אחיד, מימושים מרובים. כל ספק = קובץ אחד שמממש interface. הוספת ספק חדש = ימי עבודה ספורים, ללא שינוי בשאר המערכת. |
| **Provider Registry** | Factory function שטוענת את ה-adapter המתאים לפי `tenant_provider_settings.provider`. |
| **Dual-Write Transition** | טכניקת migration בטוחה — קוד חדש כותב לשתי עמודות (ישנה+חדשה) במקביל, ורק אחרי תקופת ייצוב מסירים את הישנה. בשימוש ל-FR-2a של PRD #19a. |
| **Supabase Vault** | כלי הצפנת secrets מובנה ב-Supabase. שומר API keys כ-bytea מוצפן, מפענח רק לצורך קריאת API ב-Edge Function. |
| **Internal Notification** | התראה פנים-מערכת — לא מייל/SMS אלא פעמון אדום עם counter ב-TopBar של האפליקציה. PRD #19a (FR-2c). |
| **Document Chain (רציפות חשבונאית)** | קישור M:N בין מסמכים — תעודות משלוח → חשבונית → קבלה. מתממש דרך `document_links` + `close_doc`/`cancel_doc` ב-PayPlus API. |
| **Idempotency Key** | מזהה ייחודי לפעולה שמונע כפילויות אם webhook ירוץ פעמיים. נשמר ב-`accounting_documents.external_unique_identifier`. |
