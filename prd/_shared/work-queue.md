# Work Queue — MasterPet PRDs

> **לקריאה ראשונה בכל סשן חדש.** הקובץ הזה מתאר איפה אנחנו, מה נעשה, ומה הצעד הבא.
>
> **עדכון אחרון:** 2026-05-19 — סיור מודולים מלא, כל ההחלטות מעודכנות

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
- [x] עץ אפיון: `prd/feature-tree.md` (v6) + `pet_platform_tree.excalidraw`

### תשתית תיעוד (2026-05-19)
- [x] `prd/_shared/data-model.md` — מילון טבלאות חי
- [x] `prd/_shared/glossary.md` — מילון מונחים
- [x] `prd/_shared/work-queue.md` — הקובץ הזה
- [x] עדכון Orchestrator + backend-engineer + product-manager עם פרוטוקול PRD

### PRDs שנכתבו
- [x] **PRD #1: Auth + RBAC + קליטת עסק** → `prd/01-auth-rbac.md` ✅ **Approved + סכמה מלאה**
  - ✅ branches table + permissions table + RLS + JWT hook — עודכן 2026-05-19

### סיור מודולים (2026-05-19)
- [x] סיור מלא על כל 15 המודולים — כל ההחלטות תועדו ועודכנו ב-feature-tree.md v6

---

---

## 📋 PRDs לכתיבה (Pending) — לפי סדר עדיפות

> הסדר חשוב: כל PRD מסתמך על הקודמים. אל תקפוץ אמצע.

### MVP — Sprint 1-8

| # | PRD | מודול | תלוי ב | Sprint | הערות |
|---|---|---|---|---|---|
| 1* | **Auth + RBAC + קליטת עסק** | ✅ נכתב | — | 1-2 | ⚠️ נדרש עדכון סכמה: branches + permissions |
| 2 | **CRM + Pet Profiles** | לקוחות, חיות, אלרגיות, קצב צריכה | #1 | 5-6 | כולל empty state להיסטוריית הזמנות |
| 3 | **מוצרים + מלאי** | טקסונומיה, אריזות, מלאי רב-סניפי, התראות | #1 | 3-4 | כולל WooCommerce Sync A |
| 4 | **Order Inbox** | Green API, טלפון, WooCommerce, נירמול, Dedup | #1, #2, #3 | 3-4 | Green API (לא WhatsApp Cloud) |
| 5 | **Orders Management + Subscription** | הזמנה חד-פעמית + מנוי, סטטוסים, קישור תשלום PayPlus | #1, #2, #3, #4 | 3-4 | |
| 6 | **Notification + Rule Engine** | Green API/SMS/Email, templates, If/Then | #1, #2, #5 | 5-6 | כולל אוטומציות שיווק (preset + custom) |
| 7 | **Loyalty Engine** | נקודות/קרדיט, הנחת מנוי — הכל configurable | #1, #2, #5 | 5-6 | בעל עסק שולט בכל פיצ'ר בנפרד |
| 8 | **שליחים (Couriers)** | MVP-A: PWA+Waze / MVP-B: מפה+GPS+מסלול | #1, #5 | 3-4 (A), 5-6 (B) | מפוצל לשני שלבים |
| 9 | **Dashboards לפי תפקיד** | 4 תבניות קבועות, KPIs, Action-first | #1, #5 | 7-8 | |
| 10 | **Billing SaaS (פנימי)** | Tiers, Trial, PayPlus, דשבורד super_admin | #1 | 7-8 | מחירים ייקבעו לפני השקה |
| 11 | **הדרכת משתמשים + מרכז עזרה** | Tooltips, Walkthroughs, Knowledge Base, Zoom | #1, #9 | 7-8 | שם קודם: "Onboarding + Help Center" |
| 12 | **אינטגרציות חיצוניות** | Green API, WooCommerce Plugin B, PayPlus, Morning | #1, #3, #4 | 5-6 | ארכיטקטורה פתוחה לספקי חשבוניות נוספים |
| 13 | **Order Routing Engine** | שיבוץ ידני + סינון לפי סניף | #1, #5, #8 | 5-6 | |

### Phase 2 — Sprint 9-16

| # | PRD | מודול |
|---|---|---|
| 14 | React Native Courier App + GPS מלא | |
| 15 | Role Builder + Customizable Dashboards (A+B) | |
| 16 | AI + Prediction Engine (חיזוי אזילה, ML, Churn) | |
| 17 | Cross-sell + Win-back + Loyalty Tiers + Referral | |
| 18 | WhatsApp Cloud API (רשמי Meta) | |
| 19 | Grow Marketplace Integration (לאמת יכולות) | |
| 20 | Marketplaces (Wolt/Bring) | |

### Phase 3 — Sprint 17-24

| # | PRD | מודול |
|---|---|---|
| 21 | AI Routing + Inventory Forecasting + Batch Tracking | |
| 22 | Custom Reports + BI + Data Export API | |
| 23 | Mobile Admins + Voice Ordering + Auto-substitute | |
| 24 | Enterprise + White-label + Scale 100+ tenants | |

---

## ארכיטקטורת תשלומים (החלטה 2026-05-19)

| זרימה | מי | ספק | הערות |
|---|---|---|---|
| MasterPet גובה מעסקים | ירין | PayPlus (חשבון של ירין) | Subscription חודשי |
| עסק גובה מלקוחות — WooCommerce | לקוח | PayPlus Plugin (חשבון העסק) | מגיע ל-MasterPet כ"שולם" |
| עסק גובה מלקוחות — WhatsApp/טלפון | לקוח | PayPlus API (חשבון העסק) | MasterPet שולחת קישור תשלום |
| חשבוניות | — | Morning ראשון, פתוח לנוספים | iCount + אחרים ב-Phase 2 |

---

## 🗺️ סטטוס תשתית טכנית

| רכיב | סטטוס |
|---|---|
| Supabase project | ✅ פעיל (`hrlrxjnyafzcoljguwkl`, eu-central-1) |
| GitHub repo | ✅ `TheYGN/masterpet` (branch: master) |
| Vercel deployment | ✅ פעיל |
| Next.js 16 + shadcn + Tailwind RTL | ✅ committed |
| Supabase migrations | ⏳ מוכן לביצוע — PRD #1 סכמה מלאה, אפשר להריץ |
| Edge Functions | ❌ טרם נכתב |
| Green API (WhatsApp) | ❌ טרם חובר |
| PayPlus | ❌ טרם חובר |
| Morning (Greeninvoice) | ❌ טרם חובר |

---

## 🎬 משפט פתיחה מומלץ לסשן הבא

> "היי, קרא את `prd/_shared/work-queue.md` ובוא נריץ את ה-migrations ב-Supabase."

**הצעד הבא:** migrations ב-Supabase (project `hrlrxjnyafzcoljguwkl`) — PRD #1 סכמה מוכנה.
