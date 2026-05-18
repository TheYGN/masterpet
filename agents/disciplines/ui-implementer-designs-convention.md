# מוסכמת תיקיית designs/ — MasterPet

כל עיצוב שמייצאים מ-Claude Design (או מכל כלי אחר) נשמר כאן:

```
C:\Users\Yarin Golan\Desktop\masterpet\
  designs\
    dashboard-owner\        ← דשבורד בעל עסק
    dashboard-branch\       ← דשבורד מנהל סניף
    dashboard-warehouse\    ← דשבורד מנהל מחסן
    order-inbox\            ← Order Inbox Omnichannel
    order-detail\           ← עמוד הזמנה בודדת
    crm-customer-list\      ← רשימת לקוחות
    crm-customer-profile\   ← פרופיל לקוח + חיה
    inventory-list\         ← מלאי
    loyalty\                ← Loyalty Engine
    automations\            ← אוטומציות
    notifications\          ← Notification Engine
    onboarding\             ← Onboarding + Walkthroughs
    billing\                ← Billing SaaS (פנימי)
    settings\               ← הגדרות
```

## כיצד להשתמש

1. מייצאים מ-Claude Design (PNG מומלץ, 1440px)
2. שומרים בתיקייה המתאימה בשם ברור: `mockup-v1.png`, `mockup-v2.png`
3. אומרים ל-Orchestrator: "תממש את מסך dashboard-owner"
4. הוא יפעיל את `ui-implementer` שיבדוק את התיקייה אוטומטית

## naming convention לקבצים

- `mockup-v<N>.jsx` / `mockup-v<N>.tsx` — קוד JSX של העיצוב (עדיפות ראשונה)
- `mockup-v<N>.png` — screenshot / export מ-Claude Design
- `mobile-v<N>.png` — גרסה מובייל
- `states-v<N>.png` — states שונים (error, loading, empty)
- `components-v<N>.png` — ספריית components של המסך

## סדר עדיפות שהסוכן קורא

```
JSX/TSX  →  PNG/JPG  →  SVG  →  HTML  →  JSON
(הכי מועיל)                          (הכי כללי)
```

אם יש גם JSX וגם PNG באותה תיקייה — הסוכן ישתמש ב-JSX
ויציג את ה-PNG כ-reference ויזואלי בלבד.
