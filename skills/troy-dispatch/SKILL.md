---
name: troy-dispatch
description: Troy's agent dispatcher — activates multiple agents in the correct order (sequential or parallel) after troy-intake produced an approved plan. Use after the user approved the execution plan. Triggers: after plan approval, or when Troy needs to send a task to specific agents. Never run before troy-intake completes.
---

# Troy Dispatch — הפעלת סוכנים

## What this skill does

מקבל תוכנית מאושרת מ-`troy-intake` ומפעיל את הסוכנים בצורה הנכונה — סדרתית או במקביל — עם הקונטקסט המדויק לכל אחד.

---

## Input שנדרש לפני הפעלה

מ-`troy-intake`:
- רשימת סוכנים + סדר + תלויות
- Risk level
- קונטקסט שנאסף (data-model, glossary, excalidraw excerpt)
- פלט צפוי מכל סוכן

---

## כללי Dispatch

### מתי להפעיל במקביל (parallel)

הפעל מספר סוכנים **בו-זמנית** כשאין תלות ביניהם:

```
✅ במקביל:
- hebrew-rtl-expert + pet-nutrition-expert (שניהם מייעצים, לא כותבים קוד)
- frontend-engineer + docs-keeper (כתיבה + תיעוד נפרד)
- qa-engineer + code-reviewer (שניהם קוראים, לא משנים)

❌ סדרתי (חובה):
- backend-engineer → frontend-engineer (frontend תלוי בAPI שbackend כותב)
- product-manager → ux-designer (UX תלוי בPRD)
- ux-designer → frontend-engineer (frontend תלוי בעיצוב)
- כל שינוי schema → qa-engineer (QA תלוי בschema סופי)
```

---

## פרוטוקול הפעלת סוכן

לכל סוכן שמפעילים, ה-prompt חייב לכלול את 4 האלמנטים האלה:

```
1. קרא את [נתיב מלא לקובץ הסוכן]
2. הקונטקסט: [עצור לתת את הקונטקסט הרלוונטי — data model, PRD excerpt, עיצוב קיים]
3. המשימה הספציפית שלך: [מה בדיוק הסוכן הזה עושה — לא הפרויקט כולו]
4. הפלט הצפוי: [קובץ? migration? עיצוב? list of decisions?]
```

### תבנית מלאה לקריאת סוכן

```
קרא את agents/disciplines/[agent].md.

קונטקסט:
- data model: [העתק רלוונטי מ-data-model.md]
- PRD: [section רלוונטי]
- Phase: [MVP/P2/P3]
- Risk: [High/Medium/Low]

המשימה שלך: [תיאור מדויק ומצומצם]

פלט נדרש: [מה אתה צריך לקבל ממנו]

כשתסיים — העבר ל-[סוכן הבא] את: [מה להעביר]
```

---

## מעקב אחרי handoffs

אחרי שכל סוכן מסיים, וודא:

1. **הפלט קיים** — הקובץ נוצר / ה-migration נכתב / ה-PRD נכתב
2. **ה-handoff התרחש** — הסוכן הבא קיבל את הפלט של הקודם
3. **אין drift** — הסוכן לא יצר ישות חדשה בלי לעדכן `_shared/data-model.md`

אם handoff נכשל (סוכן לא העביר פלט) — הפעל מחדש עם הקונטקסט החסר.

---

## Dispatch log — מה לתעד תוך כדי

בסוף כל dispatch, סכם:

```markdown
### Dispatch Log

| סוכן | סטטוס | פלט | הועבר ל |
|------|--------|-----|---------|
| backend-engineer | ✅ | migration_001.sql | qa-engineer |
| qa-engineer | ✅ | test results: 3/3 passed | troy-retro |
| frontend-engineer | 🔄 בתהליך | — | — |
```

---

## Red rules

- אל תפעיל סוכן בלי 4 האלמנטים (קובץ + קונטקסט + משימה + פלט)
- אל תפעיל `ai-ml-engineer` על משימת MVP בלי אישור מפורש של ירין
- אל תפעיל סוכן frontend לפני שbackend סיים וסיפק API contract
- אל תסמן dispatch כ-"סיים" לפני ש-`troy-handoff` אימת את הפלטים
- High-risk → תמיד `qa-engineer` + `code-reviewer` + `security-engineer` בסוף השרשרת, לא אופציונלי
