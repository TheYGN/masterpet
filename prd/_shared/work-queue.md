# Work Queue — MasterPet PRDs

> **לקריאה ראשונה בכל סשן חדש.** הקובץ הזה מתאר איפה אנחנו, מה נעשה, ומה הצעד הבא.
>
> **עדכון אחרון:** 2026-05-19

---

## 🎯 איך להתחיל סשן חדש

1. תגיד לקלוד: **"קרא את `prd/_shared/work-queue.md` ובוא נמשיך מהפיצ'ר הבא"**
2. הוא יקרא את הקובץ + `data-model.md` + `glossary.md` ויידע בדיוק איפה אנחנו
3. אם תרצה לעבוד על פיצ'ר ספציפי — תגיד "PRD ל-X" והוא יקפוץ אליו

---

## ✅ מה נעשה (Done)

### תשתית
- [x] Supabase project + Next.js + shadcn/ui + Tailwind RTL + GitHub + Vercel
- [x] צוות 18 סוכנים מובנה תחת `agents/`
- [x] עץ אפיון: `prd/feature-tree.md` + `pet_platform_tree.excalidraw`

### תשתית תיעוד (2026-05-19)
- [x] `prd/_shared/data-model.md` — מילון טבלאות חי
- [x] `prd/_shared/glossary.md` — מילון מונחים
- [x] `prd/_shared/work-queue.md` — הקובץ הזה
- [x] עדכון Orchestrator + backend-engineer + product-manager עם פרוטוקול PRD
- [x] `agents/workflows/safe-deletion.md` + שילוב ב-Orchestrator + code-reviewer

### PRDs שנכתבו
- [x] **PRD #1: Auth + RBAC + 4 רולות + Onboarding** → `prd/01-auth-rbac.md`

---

## 📋 PRDs לכתיבה (Pending) — לפי סדר עדיפות

> הסדר חשוב: כל PRD מסתמך על הקודמים. אל תקפוץ אמצע.

### MVP — Sprint 1-4 (חובה לפני פיתוח)

| # | PRD | מודול | תלוי ב | Sprint |
|---|---|---|---|---|
| 2 | **CRM + Pet Profiles** | לקוחות, חיות (גזע/משקל/גיל), אלרגיות, קצב צריכה, היסטוריה | #1 | 5-6 |
| 3 | **מוצרים + מלאי** | טקסונומיה (חיה/גיל/דיאטה), אריזות, מלאי רב-מחסני, התראות | #1 | 3-4 |
| 4 | **Order Inbox** | קליטה רב-ערוצית (WhatsApp/טלפון/Woo), נירמול, Dedup | #1, #2, #3 | 3-4 |
| 5 | **Orders Management + Subscription** | הזמנה חד-פעמית + מנוי, סטטוסים, ביטולים, חיובים | #1, #2, #3, #4 | 3-4 |
| 6 | **Notification Engine + Rule Engine** | התראות WhatsApp/SMS/Email, templates, If/Then rules | #1, #2, #5 | 5-6 |
| 7 | **Loyalty Engine** | נקודות/קרדיט, הנחת מנוי, רק MVP | #1, #2, #5 | 5-6 |
| 8 | **שליחים (Couriers) — PWA** | שיבוץ ידני, PWA בסיסי | #1, #5 | 5-6 |
| 9 | **Dashboards לפי רול** | תבניות מוכנות, KPIs, Action-first home | #1, #5 | 7-8 |
| 10 | **Billing SaaS (פנימי)** | Tiers, Trial 14 יום, Stripe+Tranzila | #1 | 7-8 |
| 11 | **Onboarding + Help Center** | Tooltips, Walkthroughs, Knowledge Base, Zoom | #1, #9 | 7-8 |
| 12 | **אינטגרציות חיצוניות — MVP** | WhatsApp Cloud, WooCommerce, Greeninvoice/Icount | #1, #4 | 5-6 |
| 13 | **Order Routing Engine (ידני)** | מנהל מקצה הזמנה לעובד/שליח | #1, #5, #8 | 5-6 |

### Phase 2 — Sprint 9-16 (לאחר MVP)

| # | PRD | מודול |
|---|---|---|
| 14 | React Native Courier App + GPS |
| 15 | AI + Prediction Engine (חיזוי אזילה, ML, Churn) |
| 16 | Cross-sell + Win-back + Loyalty Tiers + Referral |
| 17 | Marketplaces (Wolt/Bring) |

### Phase 3 — Sprint 17-24

| # | PRD | מודול |
|---|---|---|
| 18 | AI Routing + Inventory Forecasting + Batch Tracking |
| 19 | Custom Reports + BI + Data Export API |
| 20 | Mobile Admins + Voice Ordering + Auto-substitute |
| 21 | Enterprise + White-label + Scale 100+ tenants |

---

## ❓ שאלות פתוחות מ-PRD #1 (Auth) — לסגור לפני פיתוח

| # | שאלה | סטטוס |
|---|---|---|
| 1 | Resend vs Supabase Email לשליחת מיילים? | פתוח |
| 2 | טקסט WhatsApp template להזמנה (לאישור Meta) | פתוח — דורש `conversational-designer` + `hebrew-rtl-expert` |
| 3 | Super admin — subdomain נפרד או route באותו דומיין? | פתוח — המלצה: MVP route, P2 subdomain |
| 4 | מייל הסבר לדחיית tenant — האם לשלוח? טקסט? | פתוח |
| 5 | מה קורה כשטרייאל מסתיים — חסימה או באנר? | פתוח — לסגור ב-PRD #10 (Billing) |
| 6 | 2FA ל-super_admin? | פתוח — מומלץ דחייה לאחרי MVP |

> **שאלות 6 ו-8 מ-PRD #1 — סגורות.** ראה `prd/01-auth-rbac.md` סעיף 10.

---

## 🛠️ אחרי שכל ה-PRDs המסומנים MVP יסתיימו

**הצעד הבא:** פיתוח בפועל. הסדר המומלץ:

1. **Migrations של Auth/RBAC** — לפי `prd/01-auth-rbac.md` סעיף 6
2. **JWT hook + middleware** — Custom claims `tenant_id` + `role`
3. **Signup flow + super-admin approval UI**
4. **Invitation flow (Email + WhatsApp)**
5. **לעבור ל-CRM** — migrations של customers + pets, ואז UI
6. וכן הלאה לפי סדר ה-PRDs

**Risk חשוב:** אסור להתחיל פיתוח של פיצ'ר X לפני שה-PRD שלו נסגר. אחרת חוזרים ל-"באסה שכחתי".

---

## 📚 קבצים שכדאי שקלוד יקרא בכל סשן חדש

מצורף לציטוט בתחילת השיחה:

```
תקרא:
1. prd/_shared/work-queue.md (הקובץ הזה)
2. prd/_shared/data-model.md
3. prd/_shared/glossary.md
4. agents/00-orchestrator.md
5. את ה-PRD האחרון שנכתב (כרגע: prd/01-auth-rbac.md)
```

זה ייצור context מלא בלי לבזבז turns.

---

## 🗺️ סטטוס תשתית טכנית

| רכיב | סטטוס |
|---|---|
| Supabase project | ✅ פעיל (`hrlrxjnyafzcoljguwkl`, eu-central-1) |
| GitHub repo | ✅ `TheYGN/masterpet` (branch: master) |
| Vercel deployment | ✅ `https://masterpet-oos88s043-master-crm.vercel.app` |
| Next.js + shadcn + Tailwind RTL | ✅ committed |
| Supabase migrations | ❌ **טרם נכתב** — מחכה לסיום PRD #1 |
| Edge Functions | ❌ טרם נכתב |
| WhatsApp Cloud API | ❌ דורש אישור Meta + template |
| Email provider | ❌ לא נבחר |

---

## 🎬 משפט פתיחה מומלץ לסשן הבא

> "היי, קרא את `prd/_shared/work-queue.md` ובוא נמשיך עם PRD #2 (CRM + Pet Profiles)."

או, אם תעדיף לסגור קודם את השאלות הפתוחות:

> "היי, קרא את `prd/_shared/work-queue.md`. בוא נסגור את 6 השאלות הפתוחות מ-PRD #1 לפני שנמשיך."
