---
name: troy-retro
description: Troy's end-of-workflow retrospective — closes the loop after any completed workflow by updating open_tasks.md, documenting decisions in Notion, and producing a clean handoff summary. Use at the end of any Medium+ risk workflow, when the user says "סיימנו", "זה סגור", "תסכם", "troy retro", or before ending a session with significant work done.
---

# Troy Retro — סגירת Workflow

## What this skill does

מסכם ומתעד כל workflow שהסתיים — מעדכן `open_tasks.md`, שולח ל-Notion, ומייצר סיכום נקי שאפשר לפתוח בשיחה הבאה ולהמשיך מבלי לאבד קונטקסט.

---

## Trigger conditions

הפעל את הסקיל הזה כש:
- המשתמש אומר "סיימנו", "זה סגור", "תעדכן", "troy retro"
- workflow של Medium/High risk הגיע ל-done state
- לפני סיום session עם עבודה משמעותית
- `troy-execute` סיים להפעיל את כל הסוכנים בתוכנית

---

## Steps

### שלב 1 — אסוף מה נעשה

קרא **במקביל**:
1. `C:\Users\yarin\.claude\projects\C--Users-yarin-Desktop-masterpet-masterpet\memory\open_tasks.md` — לראות מה היה פתוח לפני
2. כל קובץ שנוצר/עודכן ב-workflow הזה (מה-dispatch log)

---

### שלב 2 — עדכן `open_tasks.md`

כתוב לקובץ `C:\Users\yarin\.claude\projects\C--Users-yarin-Desktop-masterpet-masterpet\memory\open_tasks.md`:

**לכל משימה שנסגרה:**
```
- status: done
- updated: [תאריך היום]
- outcome: [משפט אחד — מה בדיוק הושלם]
```

**לכל משימה שהתחילה אבל לא גמרה:**
```
- status: in-progress
- updated: [תאריך היום]
- context: [מה זה ולמה עוצרים]
- next-step: [הצעד הבא הספציפי — קובץ/פונקציה/migration]
```

**לכל משימה שנדחתה:**
```
- status: paused
- updated: [תאריך היום]
- context: [למה נדחה]
- next-step: [מתי ומה מפתח את החסם]
```

**אל תוסיף** פיצ'רים קטנים שניתן לסגור בפחות מ-30 דקות — רק עבודה שצריכה המשכיות.

---

### שלב 3 — תעד ב-Notion

**Notion Hub**: https://www.notion.so/3646f31e8b0f81fda6b8dc9e68d4026e

תעד לפי סוג:

| מה קרה | לאיפה ב-Notion |
|---------|---------------|
| Task הושלמה | Tasks DB → סמן Done |
| החלטה ארכיטקטונית | Decisions DB / ADR |
| באג שתוקן | Bugs DB → סמן Resolved |
| סוף Sprint | Sprint Retros DB |
| PRD חדש שנכתב | PRDs DB → קשר לTask |

**אם אין גישה ל-Notion עכשיו** — כתוב את הסיכום בתוך `open_tasks.md` בסעיף "משימות שהסתיימו (היסטוריה)" ותזכיר לירין לעדכן ידנית.

---

### שלב 4 — הצע QA אוטומטי (אם רלוונטי)

אם ה-workflow כלל:
- שינוי ב-`src/app/auth/**` / RLS / migration / שינוי UI משמעותי

→ הצע:
> "לפני שאני סוגר — להריץ `qa-automation` לוודא שאין רגרסיה? (~30-60 שניות)"

---

### שלב 5 — הפק סיכום סגירה

```markdown
## סיכום Workflow — [שם המשימה]
*תאריך: [היום]*

---

### ✅ מה הושלם

- [פעולה ספציפית 1]
- [פעולה ספציפית 2]
- ...

### 📁 קבצים שנוצרו / עודכנו

| קובץ | שינוי |
|------|-------|
| [path] | [מה השתנה] |

### 🔄 מה נשאר פתוח

- [משימה] — סטטוס: [in-progress/paused] — next-step: [מה]

### 💡 החלטות שהתקבלו

- [החלטה] — סיבה: [למה]

### 🔜 הצעת המשך

[הצעד הבא המומלץ — ספציפי ומנומק]
```

---

## Red rules

- אל תסמן done לפני שבדקת שהפלט אכן קיים (קובץ/migration/PRD)
- אל תדלג על עדכון `open_tasks.md` — "לא תועד = לא קרה"
- אל תכתוב ל-Notion בלי לוודא שיש Notion Hub URL בראש הסקיל
- אל תציע QA אוטומטי על שינוי copy/typo/Low-risk — רק על שינויים משמעותיים
- אם עדכנת `_shared/data-model.md` או `_shared/glossary.md` — ציין את זה מפורשות בסיכום
