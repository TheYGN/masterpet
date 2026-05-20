---
name: troy-handoff
description: Troy's handoff verifier — checks that an agent completed its work correctly and that the output is ready to pass to the next agent. Use after any agent finishes a task, especially in High or Medium risk workflows. Triggers: "תאמת שסיים", "תבדוק את הפלט", "troy handoff", "האם [agent] סיים?", or automatically after any dispatch step before the next agent begins.
---

# Troy Handoff — אימות מעבר בין סוכנים

## What this skill does

בודק שסוכן שסיים את עבודתו אכן סיפק את הפלט הנדרש — לפני שהסוכן הבא מתחיל לעבוד על בסיסו. מונע מצב שבו frontend מתחיל על API שלא קיים, או QA בודק schema שלא נכתב.

---

## Input שנדרש

- שם הסוכן שסיים: `[agent-name]`
- מה הוא היה אמור לספק (מה-dispatch plan)
- מי הסוכן הבא שמחכה לפלט

---

## Steps

### שלב 1 — בדוק קיום הפלט

לפי סוג הפלט הצפוי:

**אם הפלט הוא קובץ:**
```
Glob/Read — בדוק שהקובץ קיים ואינו ריק
```

**אם הפלט הוא migration:**
```
Glob("supabase/migrations/*.sql") — בדוק שנוסף migration חדש
Read — וודא שיש CREATE TABLE / ALTER TABLE / CREATE POLICY
```

**אם הפלט הוא PRD:**
```
Read prd/[XX-name].md — בדוק שיש sections: Overview, FR, Data Model, Open Questions
```

**אם הפלט הוא עיצוב:**
```
Glob("designs/[screen-name]*.md") — בדוק שקיים
Read — וודא שיש: Component breakdown, Figma/prompt, RTL notes
```

**אם הפלט הוא Server Action / API:**
```
Grep בקובץ הרלוונטי — בדוק שהפונקציה קיימת ולא stub
```

---

### שלב 2 — בדוק עקביות עם `_shared/`

אם הסוכן יצר **ישות חדשה** (טבלה / interface / מונח):

1. קרא `prd/_shared/data-model.md`
2. בדוק שהישות תועדה
3. קרא `prd/_shared/glossary.md`
4. בדוק שהמונח תועד

אם לא → **עצור ועדכן לפני שממשיכים לסוכן הבא.**

---

### שלב 3 — בדוק שאין דריפט מה-PRD

אם יש PRD למשימה הזו:
- קרא את ה-FR הרלוונטיים
- בדוק שהפלט מכסה את כולם (לפחות את ה-MVP scope)
- אם פיצ'ר חסר → ציין אותו כ-"pending for next iteration", לא כ-fail

---

### שלב 4 — פלט אימות

```markdown
## Handoff Verification — [agent-name] → [next-agent-name]

**סוכן שסיים:** [agent-name]
**פלט צפוי:** [מה היה אמור לספק]

### תוצאה

| בדיקה | סטטוס | פרטים |
|-------|--------|--------|
| קובץ/artifact קיים | ✅/❌ | [path או "לא נמצא"] |
| תועד ב-_shared/ | ✅/❌/N/A | [מה חסר אם ❌] |
| מכסה FR מה-PRD | ✅/⚠️/N/A | [מה פתוח] |
| אין stub/TODO קריטי | ✅/⚠️ | [אם יש TODO חסום] |

### החלטה

✅ **מאושר להמשך** — [next-agent-name] יכול להתחיל.
```

או:

```markdown
### החלטה

❌ **Handoff נכשל** — לפני שממשיכים:
- [ ] [מה צריך לתקן/להשלים]
- [ ] [עוד משהו]

@[agent-name] — חזור ותשלים את הנ"ל.
```

---

### שלב 5 — העבר לסוכן הבא

אם הכל תקין:
```
[next-agent-name], קיבלת:
- [תיאור הפלט שהועבר]
- [נתיב לקובץ]
- [הקשר נוסף שצריך]

המשך לפי המשימה שלך: [תיאור המשימה הבאה]
```

---

## Red rules

- אל תאשר handoff אם הקובץ לא קיים בפועל — stub אינו פלט
- אל תדלג על בדיקת `_shared/` כשיש ישות חדשה — drift של data model מצטבר לחובות
- אל תפעיל `frontend-engineer` לפני שיש API contract מ-backend
- אל תפעיל `qa-engineer` לפני שיש קוד שאפשר לבדוק
- High-risk: לא מספיק שהקובץ קיים — חובה שיש גם `code-reviewer` sign-off
