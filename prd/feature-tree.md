# עץ האפיון — MasterPet v5

## מבנה הפאזות

### MVP (חודשים 1-4)
Sprint 1-2: Supabase setup, Auth, 4 רולות, Onboarding
Sprint 3-4: Order Inbox, Orders Management, Inventory
Sprint 5-6: CRM, Pet Profiles, Rule Engine, Loyalty
Sprint 7-8: Dashboards, Internal Billing, Beta Launch

### Phase 2 (חודשים 5-8)
Sprint 9-10: React Native Courier App, GPS, Routes
Sprint 11-12: Stock-out Prediction, FEDIAF, ML Models, Churn Detection
Sprint 13-14: Cross-sell, Win-back, Loyalty Tiers, Referral
Sprint 15-16: Marketplaces (Wolt/Bring), Public Launch

### Phase 3 (חודשים 9-12)
Sprint 17-18: AI Routing, Inventory Forecasting, Batch Tracking
Sprint 19-20: Custom Reports, BI, Data Export API
Sprint 21-22: Mobile Admins, Voice Ordering, Auto-substitute
Sprint 23-24: Enterprise Features, White-label, Scale 100+ tenants

---

## כל הפיצ'רים לפי מודול

### 1. Order Inbox - Omnichannel
- [MVP] WhatsApp Business API
- [MVP] טלפון / מוקדן ידני
- [MVP] WooCommerce / WordPress
- [MVP] נירמול + Dedup
- [P2] מרקטפליסים (Wolt/Bring)

### 2. ניהול הזמנות + Subscription
- [MVP] הזמנה חד-פעמית
- [MVP] Subscription בסיסי
- [MVP] סטטוסים + ביטולים
- [MVP] חיובים + חשבונית
- [P2] Skip/Pause/Swap מלא
- [P2] Auto-substitute (OOS)

### 3. ניהול מלאי + מוצרים
- [MVP] מלאי רב-מחסני
- [MVP] טקסונומיה: חיה/גיל/דיאטה
- [MVP] סוגי אריזה
- [MVP] התראות מלאי נמוך
- [P2] Batch tracking
- [P2] ספקים ורכש

### 4. CRM - לקוחות + חיות
- [MVP] פרופיל לקוח
- [MVP] פרופיל חיה (גזע/משקל/גיל)
- [MVP] אלרגיות + מזון מועדף
- [MVP] קצב צריכה ק"ג/יום
- [MVP] היסטוריית הזמנות
- [P2] סגמנטציה מתקדמת

### 5. Loyalty Engine
- [MVP] נקודות / קרדיט
- [MVP] הנחת מנוי 5-10%
- [P2] Tiers (סכום מצטבר)
- [P2] Referral Program
- [P2] קופונים + מבצעים

### 6. AI + Prediction Engine (Phase 2+)
- [P2] טבלת תזונה FEDIAF
- [P2] ★ חיזוי אזילת מזון
- [P2] ML אישי לכל חיה
- [P2] Churn detection
- [P2] Cross-sell (pgvector)
- [P3] אופטימיזציית מסלולים

### 7. אוטומציות שיווק
- [MVP] התראת אזילה (rule-based)
- [MVP] יום הולדת לחיה
- [P2] Win-back AI
- [P2] השקת מוצר חדש
- [P2] Cross-sell automation

### 8. Notification Engine
- [MVP] Rule Engine (If/Then)
- [MVP] WhatsApp + SMS + Email
- [MVP] התראות פנים-מערכת
- [MVP] Templates עריכה ויזואלית
- [P2] AI Recommendations Layer

### 9. שליחים (Couriers)
- [MVP] PWA / Webview בסיסי
- [MVP] שיבוץ ידני של מנהל
- [P2] React Native Native App
- [P2] GPS חי + מסלולים
- [P2] דירוג + בונוסים

### 10. RBAC + 4 תפקידים
- [MVP] בעל עסק / מנהל ראשי
- [MVP] מנהל סניף
- [MVP] עובד מכירות (היברידי)
- [MVP] מנהל מחסן / לוגיסטיקן
- [MVP] Audit Log

### 11. Onboarding + Help Center
- [MVP] In-app Tooltips
- [MVP] Walkthroughs לפי תפקיד
- [MVP] Knowledge Base
- [MVP] Zoom Booking
- [P2] Video Tutorials

### 12. Dashboards לפי תפקיד
- [MVP] תבניות מוכנות (לכל role)
- [MVP] Action-first home
- [MVP] KPIs בזמן אמת
- [P2] Customizable Widgets
- [P3] Custom Reports Builder

### 13. Order Routing Engine
- [MVP] ידני - מנהל מקצה
- [P2] Configurable Rules
- [P3] AI Recommendations

### 14. Billing SaaS (פנימי)
- [MVP] Tiers: Basic/Pro/Enterprise
- [MVP] Trial 14 ימים
- [MVP] Stripe + Tranzila
- [P2] Per-Seat + Usage combo
- [P2] Coupon system

### 15. אינטגרציות חיצוניות
- [MVP] WhatsApp Cloud API
- [MVP] WooCommerce Connector
- [MVP] Greeninvoice / Icount
- [P2] Wolt / Bring API
- [P2] Google Maps Distance

---

## Stack טכנולוגי

**Frontend:** Next.js 14 (App Router), shadcn/ui, Tailwind RTL, React Query, Zustand, React Joyride, Expo React Native (P2)
**Backend:** Supabase Postgres + RLS, Supabase Auth + Magic Link, Edge Functions, Supabase Storage, pgvector (P2)
**Integrations:** WhatsApp Cloud API, WooCommerce REST, Stripe + Tranzila, Greeninvoice/Icount, Anthropic Claude API

**DB Core Tables:** tenants · users · products · customers · pets · orders (כולם עם tenant_id + RLS)

---

## 4 הרולים בפירוט

| רול | גישה |
|---|---|
| בעל עסק / מנהל ראשי | הכל — billing, settings, כל הדאטה |
| מנהל סניף | הזמנות, מלאי, CRM, עובדים — ללא billing |
| עובד מכירות (היברידי) | הזמנות + CRM — בלי admin settings |
| מנהל מחסן / לוגיסטיקן | PWA משלוחים, אישור קבלה, מלאי |
