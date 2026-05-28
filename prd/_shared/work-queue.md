# Work Queue — MasterPet PRDs

> **לקריאה ראשונה בכל סשן חדש.** הקובץ הזה מתאר איפה אנחנו, מה נעשה, ומה הצעד הבא.
>
> **עדכון אחרון:** 2026-05-26 — PRD #5 (Customers) Done (קוד+DB+עיצובים, ממתין לאימות e2e). PRD #6 (Orders) Done — DB + 11 Server Actions + UI + 3 Edge Functions + QA Automation passed. ניקיון צוות הסוכנים בוצע (5 ארוכבו, troy-intake+dispatch מוזגו ל-troy-execute).

---

## 🎯 איך להתחיל סשן חדש

1. תגיד לקלוד: **"קרא את `prd/_shared/work-queue.md` ובוא נמשיך מהפיצ'ר הבא"**
2. הוא יקרא את הקובץ + `data-model.md` + `glossary.md` ויידע בדיוק איפה אנחנו
3. אם תרצה לעבוד על פיצ'ר ספציפי — תגיד "PRD ל-X" והוא יקפוץ אליו

---

## ✅ מה נעשה (Done)

### תשתית
- [x] Supabase project + Next.js + shadcn/ui + Tailwind RTL + GitHub + Vercel
- [x] צוות סוכנים מובנה תחת `agents/` (12 disciplines + 4 domain-experts + 2 product) — אורכבו 5 סוכני Phase 2 ב-`agents/_archive/` ב-2026-05-26
- [x] עץ אפיון: `prd/feature-tree.md` (v8) + `pet_platform_tree.excalidraw`

### תשתית תיעוד (2026-05-19)
- [x] `prd/_shared/data-model.md` — מילון טבלאות חי
- [x] `prd/_shared/glossary.md` — מילון מונחים
- [x] `prd/_shared/work-queue.md` — הקובץ הזה
- [x] עדכון Orchestrator + backend-engineer + product-manager עם פרוטוקול PRD

### PRDs שנכתבו ויושמו
- [x] **PRD #1: Auth + RBAC + קליטת עסק** → `prd/01-auth-rbac.md` — DB + RLS + UI + Security Hardening, 12/12 qa-automation passed (2026-05-19)
- [x] **PRD #3: Products + מלאי** → `prd/03-products.md` — DB + 8 Server Actions + UI (create + edit), אומת end-to-end (2026-05-25)
- [x] **PRD #4: CSV/Excel Import Engine** → `prd/04-csv-import.md` — flow מלא 5 שלבים, 5 Criticals נסגרו ב-code review (2026-05-25)

### תיעוד וארכיטקטורה (2026-05-19–20)
- [x] סיור מלא על כל 15 המודולים → feature-tree.md v6
- [x] ניתוח דרישות לקוח חיצוני (ירין אתר בוס) — 20 דרישות ממופות → feature-tree.md v7 → v8
- [x] עץ אפיון: `prd/feature-tree.md` (v8) + `pet_platform_tree.excalidraw`

---

---

## 📋 PRDs לכתיבה (Pending) — לפי סדר עדיפות

> הסדר חשוב: כל PRD מסתמך על הקודמים. אל תקפוץ אמצע.
> ⚠️ סדר עדיפויות עודכן ב-2026-05-20: Products→Import→Customers→Orders→Inbox (לא CRM לפני Products)

### MVP — Sprint 1-8

| # | PRD | מודול | תלוי ב | Sprint | סטטוס |
|---|---|---|---|---|---|
| 1 | **Auth + RBAC + קליטת עסק** | — | — | 1-2 | ✅ Done |
| 3 | **Products + מלאי** | טקסונומיה, אריזות, מלאי רב-סניפי | #1 | 3-4 | ✅ Done (2026-05-25) |
| 4 | **CSV/Excel Import Engine** | מנגנון ייבוא גנרי — Products ראשון, Customers שני | #3 | 3-4 | ✅ Done (2026-05-25) |
| 5 | **Customers + Pet Profiles** | לקוחות, חיות, אלרגיות, קצב צריכה | #1, #4 | 5-6 | ✅ Done — DB (3,097 שורות) + קוד + עיצובים. ממתין לאימות e2e |
| 6 | **Orders Management + Subscription** | הזמנה חד-פעמית + מנוי, סטטוסים, קישור תשלום PayPlus | #1, #3, #5 | 5-6 | ✅ Done — DB + 11 Actions + UI + Edge Functions + QA (2026-05-26) |
| 2 | **Order Inbox** | Green API, טלפון, WooCommerce, נירמול, Dedup | #3, #5, #6 | 5-6 | ⏸ דחוי — חסום ב-#5+#6 |
| 7 | **Notification + Rule Engine** | Green API/SMS/Email, templates, If/Then | #1, #5, #6 | 5-6 | ממתין ל-#6 |
| 8 | **Loyalty Engine** | נקודות/קרדיט, הנחת מנוי — הכל configurable | #1, #5, #6 | 5-6 | ממתין ל-#6 |
| 9 | **שליחים (Couriers)** | MVP-A: PWA+Waze / MVP-B: מפה+GPS+מסלול | #1, #6 | 3-4 (A), 5-6 (B) | ממתין ל-#6 |
| 10 | **Dashboards לפי תפקיד** | 4 תבניות קבועות, KPIs, Action-first, גרפים | #1, #6 | 7-8 | |
| 11 | **Billing SaaS (פנימי)** | Tiers, Trial, PayPlus, דשבורד super_admin | #1 | 7-8 | |
| 12 | **הדרכת משתמשים + מרכז עזרה** | Tooltips, Walkthroughs, Knowledge Base, Zoom | #1, #10 | 7-8 | |
| 13 | **אינטגרציות חיצוניות** | Green API, WooCommerce Plugin B, PayPlus + אשראי שמור, Morning | #1, #3, #6 | 5-6 | |
| 14 | **Order Routing Engine** | שיבוץ ידני + סינון לפי סניף | #1, #6, #9 | 5-6 | |
| 15 | **מנוע אזילה ידני** | ספירה לאחור, מינוס ימים, כרטסת מאחרים, איפוס בהזמנה | #1, #5, #7 | 7-8 | |
| 16 | **אשראי לקוחות** | חוב/זכות, שוטף 30/60, דוח חייבים/זכות | #1, #6 | 7-8 | |
| 17 | **רווחיות ומכירות** | אחוז רווח פר מכירה, מחשבון רווח, דוח עובד, העברת סחורה | #1, #3, #11 | 7-8 | |
| 18 | **ניהול עובדים** | שעון נוכחות כניסה/יציאה | #1 | 7-8 | |

### Phase 2 — Sprint 9-16

| # | PRD | מודול |
|---|---|---|
| 18 | React Native Courier App + GPS מלא | |
| 19 | Role Builder + Customizable Dashboards (A+B) | |
| 20 | מסך Analytics/BI — גרפים מתקדמים + סינון | חדש מדרישות לקוח |
| 21 | AI + Prediction Engine (ML אזילה, Churn) | הרחבה של מנוע אזילה ידני מ-MVP |
| 22 | Cross-sell + Win-back + Loyalty Tiers + Referral | |
| 23 | WhatsApp Cloud API (רשמי Meta) | |
| 24 | Grow Marketplace Integration (לאמת יכולות) | |
| 25 | Marketplaces (Wolt/Bring) | |
| 26 | קטלוג ספקים + קליטת חשבוניות ספקים | חדש מדרישות לקוח |
| 27 | הנהלת חשבונות פנימית (הכנסות/הוצאות/כרטסת/P&L) | חדש מדרישות לקוח |
| 28 | Remote Support (Super Admin + מנהל→עובד) | חדש מדרישות לקוח |

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
| Supabase migrations | ✅ PRD #1 + PRD #3 הורצו ואומתו |
| Edge Functions | ❌ טרם נכתב |
| Green API (WhatsApp) | ❌ טרם חובר |
| PayPlus | ❌ טרם חובר |
| Morning (Greeninvoice) | ❌ טרם חובר |

---

## 🎬 משפט פתיחה מומלץ לסשן הבא

> "טרוי, מה השלב הבא?"

**הצעד הבא:** לאמת PRD #5 (Customers) e2e → ואז PRD #2 (Inbox) — Green API + WhatsApp → הזמנה אוטומטית.
