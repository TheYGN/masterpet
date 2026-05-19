# עץ האפיון — MasterPet v7
> עודכן: 2026-05-19 — הוספת דרישות לקוח חיצוני (ירין אתר בוס)

## מבנה הפאזות

### MVP (חודשים 1-4)
Sprint 1-2: Supabase setup, Auth, 4 רולות, קליטת עסק, Branches
Sprint 3-4: Order Inbox, Orders Management, Inventory, WooCommerce Sync A, Couriers PWA A
Sprint 5-6: CRM, Pet Profiles, Rule Engine, Loyalty, Notifications, WooCommerce Plugin B, Couriers GPS B
Sprint 7-8: Dashboards + גרפים, Internal Billing, מנוע אזילה ידני + כרטסת מאחרים, אשראי לקוחות, רווחיות ומכירות, שעון נוכחות, העברת סחורה בין סניפים, Beta Launch

### Phase 2 (חודשים 5-8)
Sprint 9-10: React Native Courier App, Role Builder, Customizable Widgets, Analytics מסך BI
Sprint 11-12: Stock-out Prediction ML, FEDIAF, ML Models, Churn Detection, קטלוג ספקים + קליטת חשבוניות
Sprint 13-14: Cross-sell, Win-back, Loyalty Tiers, Referral, הנה"ח פנימי (הכנסות+הוצאות+כרטסת)
Sprint 15-16: Marketplaces (Wolt/Bring), WhatsApp Cloud API, P&L + ייצוא לרו"ח, Remote Support, Public Launch

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

### 6. מנוע אזילה + AI Prediction
- [MVP] ★ מנוע אזילה ידני — הגדרת ימי צריכה לכל לקוח × מוצר
- [MVP] ספירה לאחור מיום ההזמנה → כשמגיע ל-0 שולח הודעה ווצאפ
- [MVP] מינוס ימים — לקוח לא ענה להודעה, הספירה ממשיכה לכיוון שלילי
- [MVP] איפוס אוטומטי — הזמנה חדשה מאפסת את הספירה
- [MVP] כרטסת מאחרים — תצוגת כל הלקוחות עם מינוס ימים, לחיצה → דוח מלא + הורדה, לחיצה על לקוח → כרטיס לקוח
- [P2] טבלת תזונה FEDIAF
- [P2] ★ חיזוי אזילת מזון (ML) — AI מחשב קצב צריכה אוטומטית לפי היסטוריה
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
- [MVP] הרשאת רווחיות — ניתן לשלוט לפי תפקיד מי רואה אחוז רווח פר מכירה
- [MVP] Super Admin — השתלטות מרחוק על כל tenant (לתמיכה)
- [P2] Role Builder — בעל עסק מתאים הרשאות לכל תפקיד
- [P2] מנהל — השתלטות מרחוק על עובד בתוך ה-tenant שלו

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
- [MVP] גרפים בדשבורד בעל עסק: לקוחות חדשים לאורך זמן, קניות פיזיות בחנות, אחוז רווח לפי טווחי זמן
- [P2] Customizable Widgets + Role Builder (A+B יחד)
- [P2] מסך Analytics/BI נפרד — אותם גרפים + סינון מתקדם לפי סניף/עובד/תאריכים
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
- [MVP] PayPlus אשראי שמור — שמירת כרטיס לחיוב אוטומטי חוזר (בהסכמת לקוח)
- [MVP] Morning (Greeninvoice) — חשבוניות (ארכיטקטורה פתוחה לספקים נוספים בעתיד)
- [P2] iCount + ספקי חשבוניות נוספים
- [P2] WhatsApp Cloud API (רשמי Meta)
- [P2] Grow (Marketplace) — לאמת יכולות sub-merchant
- [P2] Wolt / Bring API
- [P2] Google Maps Distance (Couriers routing)
- [P2] קטלוג ספקים — API אוטומטי + העלאה ידנית (Excel/PDF) עם תמונות מוצר
- [P2] קליטת חשבוניות ספקים — עדכון מחיר + מלאי אוטומטי בעת קליטה

### 16. אשראי לקוחות
- [MVP] יתרת חוב/זכות לכל לקוח (B2C + B2B)
- [MVP] שוטף 30 / שוטף 60 לעסקים — אשראי מסחרי
- [MVP] דוח חייבים — כל הלקוחות עם חוב פתוח
- [MVP] דוח זכות — לקוחות עם יתרה לטובתם

### 17. רווחיות ומכירות
- [MVP] אחוז רווח פר מכירה — מוצג בזמן מכירה (לפי הרשאה)
- [MVP] מחשבון רווח — עלות קנייה vs. מחיר מכירה, מעדכן אחוז רווח אוטומטית
- [MVP] דוח מכירות לכל עובד בנפרד
- [MVP] העברת סחורה בין סניפים

### 18. ניהול עובדים
- [MVP] שעון נוכחות — כניסה/יציאה (תיעוד בלבד, ללא חישוב שכר)

### 19. הנהלת חשבונות פנימית
- [P2] מעקב הכנסות — כל תשלום מלקוח (הזמנות + קישורי תשלום)
- [P2] מעקב הוצאות — חשבוניות ספקים + הוצאות ידניות
- [P2] כרטסת לקוח — היסטוריה פיננסית מלאה: חיובים, זיכויים, יתרה
- [P2] ספר חשבונות — כל הפעולות הפיננסיות של העסק
- [P2] P&L פשוט — רווח/הפסד לפי תקופה
- [P2] ייצוא מסמכים לרואה חשבון
- [P2] התראות חגים — הגדרת ימי חופש/עבודה מקוצרת
- [P2] זמני מחלוקה לפי אזור — שינוי חד-פעמי או קבוע

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
