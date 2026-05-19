# עץ האפיון — MasterPet v6
> עודכן: 2026-05-19 — לאחר סיור מודולים מלא

## מבנה הפאזות

### MVP (חודשים 1-4)
Sprint 1-2: Supabase setup, Auth, 4 רולות, קליטת עסק, Branches
Sprint 3-4: Order Inbox, Orders Management, Inventory, WooCommerce Sync A, Couriers PWA A
Sprint 5-6: CRM, Pet Profiles, Rule Engine, Loyalty, Notifications, WooCommerce Plugin B, Couriers GPS B
Sprint 7-8: Dashboards, Internal Billing, Beta Launch

### Phase 2 (חודשים 5-8)
Sprint 9-10: React Native Courier App, Role Builder, Customizable Widgets
Sprint 11-12: Stock-out Prediction, FEDIAF, ML Models, Churn Detection
Sprint 13-14: Cross-sell, Win-back, Loyalty Tiers, Referral
Sprint 15-16: Marketplaces (Wolt/Bring), WhatsApp Cloud API, Public Launch

### Phase 3 (חודשים 9-12)
Sprint 17-18: AI Routing, Inventory Forecasting, Batch Tracking
Sprint 19-20: Custom Reports, BI, Data Export API
Sprint 21-22: Mobile Admins, Voice Ordering, Auto-substitute
Sprint 23-24: Enterprise Features, White-label, Scale 100+ tenants

---

## כל הפיצ'רים לפי מודול

### 1. Order Inbox - Omnichannel
- [MVP] Green API (WhatsApp) — ערוץ ראשי
- [MVP] טלפון / מוקדן ידני
- [MVP] WooCommerce / WordPress
- [MVP] נירמול + Dedup
- [P2] WhatsApp Cloud API (רשמי Meta)
- [P2] מרקטפליסים (Wolt/Bring)

### 2. ניהול הזמנות + Subscription
- [MVP] הזמנה חד-פעמית
- [MVP] Subscription בסיסי
- [MVP] סטטוסים + ביטולים
- [MVP] חיובים + קישור תשלום (PayPlus)
- [P2] Skip/Pause/Swap מלא
- [P2] Auto-substitute (OOS)

### 3. ניהול מלאי + מוצרים
- [MVP] מלאי רב-מחסני (לפי סניף)
- [MVP] טקסונומיה: חיה/גיל/דיאטה
- [MVP] סוגי אריזה (SKU לכל גודל)
- [MVP] התראות מלאי נמוך
- [MVP-A Sprint 3-4] WooCommerce Sync — דחיפת מוצרים+מלאי+מחירים (שדות סטנדרטיים)
- [MVP-B Sprint 5-6] WooCommerce Plugin — שדות pet-specific (חיה/גיל/דיאטה/גזע)
- [P2] Batch tracking
- [P2] ספקים ורכש

### 4. CRM - לקוחות + חיות
- [MVP] פרופיל לקוח (שם, טלפון, כתובת, ערוץ מועדף)
- [MVP] פרופיל חיה (גזע/משקל/גיל) — חלק מגיע מ-WooCommerce, חלק משאלון
- [MVP] אלרגיות + מזון מועדף
- [MVP] קצב צריכה ק"ג/יום (בסיס לאלגוריתם אזילה)
- [MVP] היסטוריית הזמנות (JOIN על טבלת orders — empty state נדרש)
- [P2] סגמנטציה מתקדמת

### 5. Loyalty Engine
- [MVP] נקודות / קרדיט (ניתן להפעלה/כיבוי + כיוונון יחס)
- [MVP] הנחת מנוי 5-10% (ניתן להפעלה/כיבוי + כיוונון אחוז)
- [MVP] Loyalty Settings — בעל עסק שולט בכל פיצ'ר בנפרד
- [P2] Tiers (סכום מצטבר)
- [P2] Referral Program
- [P2] קופונים + מבצעים

### 6. AI + Prediction Engine (Phase 2+)
- [P2] טבלת תזונה FEDIAF
- [P2] ★ חיזוי אזילת מזון (ML)
- [P2] ML אישי לכל חיה
- [P2] Churn detection
- [P2] Cross-sell (pgvector)
- [P3] אופטימיזציית מסלולים

### 7. אוטומציות שיווק
- [MVP] התראת אזילה — אלגוריתם חכם: גודל אריזה ÷ קצב צריכה + תאריך קנייה = תאריך אזילה
- [MVP] יום הולדת לחיה
- [MVP] כללים מוכנים מראש (preset) — הפעל/כבה
- [MVP] Rule Builder — בעל עסק בונה כללים מותאמים (If/Then)
- [P2] Win-back AI
- [P2] השקת מוצר חדש
- [P2] Cross-sell automation

### 8. Notification Engine
- [MVP] Rule Engine (If/Then)
- [MVP] Green API (WhatsApp) + SMS + Email
- [MVP] התראות פנים-מערכת
- [MVP] Templates עריכה ויזואלית (משתני דינמיים: {{pet_name}} וכו')
- [P2] WhatsApp Cloud API
- [P2] AI Recommendations Layer

### 9. שליחים (Couriers)
- [MVP-A Sprint 3-4] PWA — פרטי לקוח+הזמנה, סימון "נמסר", פס התקדמות, כפתור Waze
- [MVP-B Sprint 5-6] מפה ויזואלית + מסלול מחושב לפי קרבה (Google Maps API) + GPS חי
- [MVP] שיבוץ ידני של מנהל
- [P2] React Native Native App
- [P2] דירוג + בונוסים

### 10. RBAC + 4 תפקידים + Branches
- [MVP] בעל עסק / מנהל ראשי (owner)
- [MVP] מנהל סניף (branch_manager) — רואה רק הסניף שלו
- [MVP] עובד מכירות (sales)
- [MVP] מנהל מחסן / לוגיסטיקן (warehouse)
- [MVP] Super Admin (צוות MasterPet פנימי)
- [MVP] Audit Log
- [MVP] Branches — כל עובד משויך לסניף, RLS מסנן לפי branch_id
- [MVP] Permissions Table — גמיש (לא hardcoded), מאפשר Role Builder בעתיד
- [P2] Role Builder — בעל עסק מתאים הרשאות לכל תפקיד

### 11. הדרכת משתמשים + מרכז עזרה
> שם קודם: "Onboarding + Help Center" — שונה למניעת בלבול עם "קליטת עסק" (PRD #1)
- [MVP] In-app Tooltips
- [MVP] Walkthroughs לפי תפקיד
- [MVP] Knowledge Base
- [MVP] Zoom Booking
- [P2] Video Tutorials

### 12. Dashboards לפי תפקיד
- [MVP] תבניות מוכנות (owner / branch_manager / sales / warehouse)
- [MVP] Action-first home
- [MVP] KPIs בזמן אמת
- [P2] Customizable Widgets + Role Builder (A+B יחד)
- [P3] Custom Reports Builder

### 13. Order Routing Engine + Branches
- [MVP] שיבוץ ידני — מנהל בוחר סניף + עובד + שליח לכל הזמנה
- [MVP] סינון הזמנות לפי סניף (RLS)
- [P2] Configurable Rules (אוטומטי לפי אזור/סוג)
- [P3] AI Recommendations

### 14. Billing SaaS (פנימי — MasterPet גובה מעסקים)
- [MVP] Tiers: Basic/Pro/Enterprise (מחירים ייקבעו לפני השקה)
- [MVP] Trial 14 ימים
- [MVP] PayPlus (סליקה של ירין)
- [MVP] דשבורד super_admin: MRR, מנויים פעילים, Trial tracking, תנועה ותעבורה חודשית לכל עסק
- [P2] Per-Seat + Usage combo
- [P2] Coupon system

### 15. אינטגרציות חיצוניות
- [MVP] Green API (WhatsApp) — ערוץ ראשי
- [MVP] WooCommerce Connector — דו-כיווני (sync מוצרים + קבלת הזמנות)
- [MVP] WooCommerce Plugin — שדות pet-specific
- [MVP] PayPlus — סליקה לעסקים (כל עסק מחבר חשבון משלו)
- [MVP] Morning (Greeninvoice) — חשבוניות (ארכיטקטורה פתוחה לספקים נוספים בעתיד)
- [P2] iCount + ספקי חשבוניות נוספים
- [P2] WhatsApp Cloud API (רשמי Meta)
- [P2] Grow (Marketplace) — לאמת יכולות sub-merchant
- [P2] Wolt / Bring API
- [P2] Google Maps Distance (Couriers routing)

---

## ארכיטקטורת תשלומים

### זרימה 1 — MasterPet גובה מעסקים
```
עסק → PayPlus (חשבון ירין) → Subscription חודשי
```

### זרימה 2 — עסק גובה מלקוחות שלו
```
לקוח (WooCommerce)   → PayPlus Plugin → הזמנה מגיעה ל-MasterPet כ"שולמה"
לקוח (WhatsApp/טלפון) → MasterPet שולחת קישור → PayPlus של העסק → חשבונית (Morning)
```

---

## Stack טכנולוגי

**Frontend:** Next.js 16 (App Router), shadcn/ui, Tailwind RTL, React Query, Zustand, React Joyride, Expo React Native (P2)
**Backend:** Supabase Postgres + RLS, Supabase Auth + Magic Link, Edge Functions, Supabase Storage, pgvector (P2)
**Integrations:** Green API (WhatsApp MVP), WhatsApp Cloud API (P2), WooCommerce REST + Plugin, PayPlus, Morning/Greeninvoice, Anthropic Claude API

**DB Core Tables:** tenants · branches · users · permissions · products · customers · pets · orders (כולם עם tenant_id + branch_id + RLS)

---

## 4 הרולים בפירוט

| רול | גישה |
|---|---|
| בעל עסק / מנהל ראשי | הכל — billing, settings, כל הסניפים |
| מנהל סניף | הזמנות, מלאי, CRM, עובדים — הסניף שלו בלבד |
| עובד מכירות | הזמנות + CRM — הסניף שלו |
| מנהל מחסן / לוגיסטיקן | PWA משלוחים, אישור קבלה, מלאי — הסניף שלו |
