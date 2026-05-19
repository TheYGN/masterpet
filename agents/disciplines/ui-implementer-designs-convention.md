# מוסכמת תיקיית designs/ — MasterPet

## קבצי-על — חובה לקרוא לפני כל משימת עיצוב

1. **[`../../designs/DESIGN-SYSTEM.md`](../../designs/DESIGN-SYSTEM.md)** — Source of Truth עיצובי. tokens, רכיבים, RTL, iconography.
2. **[`../../designs/PROMPT-TEMPLATE.md`](../../designs/PROMPT-TEMPLATE.md)** — תבנית פרומפט לייצור מסך חדש (חלק A סטטי + חלק B משתנה).
3. **[`../workflows/design-screen.md`](../workflows/design-screen.md)** — הזרימה (חדש/עדכון + git protocol).

---

## מבנה התיקייה

כל עיצוב שמייצאים מ-Claude Design (או מכל כלי אחר) נשמר כאן:

```
C:\Users\Yarin Golan\Desktop\masterpet\
  designs\
    DESIGN-SYSTEM.md        ← מקור-אמת עיצובי (לקרוא קודם!)
    PROMPT-TEMPLATE.md      ← תבנית פרומפט למסך חדש
    dashboard-branch\       ← דשבורד בעל עסק (קיים, רפרנס לכל מסך)
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

## מבנה תיקיית העיצובים

Claude Design מייצא ZIP שמוחלץ ל-`designs/MasterPet/` — **זהו מקור-האמת העיצובי**:

```
designs/MasterPet/
├── MasterPet Dashboard.html   ← דשבורד
├── parts.jsx / main.jsx / data.jsx / chart.jsx
└── designs/
    ├── order-inbox/
    │   ├── MasterPet Order Inbox.html
    │   ├── parts.jsx / main.jsx / data.jsx
    └── <slug>/
        └── ...
```

**כתובות:**
- דשבורד: `designs/MasterPet/MasterPet Dashboard.html`
- מסך אחר: `designs/MasterPet/designs/<slug>/MasterPet <Name>.html`

**עדכון:** המשתמש מחלץ ZIP → `designs/MasterPet/` מוחלפת בשלמות. אין צורך לסדר ידנית.

## ניהול גרסאות — אופציה C (מחיקה + git)

עדכון מסך = מחיקת התיקייה הקיימת + יצירה מחדש. ההיסטוריה נשמרת ב-git:
- לפני מחיקה: snapshot commit של הגרסה הישנה
- אחרי יצירה: commit חדש עם תיאור השינוי
- אסור ליצור `dashboard-v2/` או `dashboard-new/` במקביל

ראה פירוט מלא ב-[`workflows/design-screen.md`](../workflows/design-screen.md).

## כיצד להשתמש

1. ה-agent כותב `PROMPT.md` (Part A + Part B) ושומר ב-`designs/<slug>/`
2. שולחים את הפרומפט ל-Claude Design
3. Claude Design מייצר את המסך בפנים ומוסיף אותו ל-ZIP
4. המשתמש מוריד ZIP, מחלץ → `designs/MasterPet/` מוחלפת בשלמות
5. אומרים ל-Orchestrator: "תממש את מסך <slug>" — הוא יפעיל את `ui-implementer`

## סדר עדיפות שהסוכן קורא

```
HTML + JSX  →  PNG/JPG  →  SVG  →  JSON
(הכי מלא)                         (הכי כללי)
```

אם יש גם HTML וגם PNG — קרא את ה-HTML + JSX, השתמש ב-PNG כ-reference ויזואלי בלבד.
