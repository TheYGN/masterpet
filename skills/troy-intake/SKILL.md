---
name: troy-intake
description: Troy's task intake — analyzes any incoming request for MasterPet and produces a structured execution plan before any agent is activated. Use when the user gives Troy a new task, feature request, bug report, or question that requires more than one agent. Triggers: "טרוי", "troy", any multi-step task after the orchestrator is invoked. This skill must run FIRST — before any agent is dispatched.
---

# Troy Intake — ניתוח משימה נכנסת

## What this skill does

מנתח כל בקשה נכנסת לפי 3 צירים (Phase × Task type × Risk), קורא את קבצי הקונטקסט הנדרשים, ומייצר תוכנית ביצוע מאושרת לפני שנוגעים בקוד.

---

## Steps

### שלב 1 — קרא קונטקסט בסיסי (במקביל)

קרא את שלושת הקבצים הבאים **במקביל** (parallel tool calls):

1. `prd/_shared/data-model.md` — מה קיים בDB
2. `prd/_shared/glossary.md` — מילון מונחים
3. `C:\Users\Yarin Golan\.claude\projects\C--Users-Yarin-Golan-Desktop-masterpet\memory\open_tasks.md` — מה פתוח

אם המשימה נוגעת ב-UI/עיצוב — קרא גם `designs/DESIGN-SYSTEM.md`.

אם המשימה נוגעת במודול ספציפי — חלץ את הטקסט מ-`pet_platform_tree.excalidraw`:
```bash
node -e "const d=JSON.parse(require('fs').readFileSync('pet_platform_tree.excalidraw','utf8')); d.elements.filter(e=>e.type==='text'&&e.text).forEach(e=>console.log(e.text.trim()))"
```

---

### שלב 2 — סווג את המשימה לפי 3 ציר

**ציר א — Phase:**
- חפש את המודול בעץ האפיון
- `[MVP]` → סוכני MVP בלבד, אין ai-ml-engineer
- `[P2]` → מותר integrations מתקדמים + ai-ml
- `[P3]` → כל הצוות
- לא מוגדר → שאל את ירין לפני שממשיכים

**ציר ב — Task type** (מהטבלה ב-`agents/00-orchestrator.md` §Decision Tree):

| Task type | Workflow |
|-----------|---------|
| פיצ'ר חדש | `workflows/feature-development.md` |
| באג | `workflows/bug-fix.md` |
| תכנון Sprint | `workflows/sprint-planning.md` |
| שינוי schema/RLS | תזמור ידני |
| עיצוב מסך | `workflows/design-screen.md` |
| Dashboard/KPI | data-analytics + backend + frontend |
| RBAC/Audit | legal-compliance + backend + security |
| מחיקה/refactor הרסני | `workflows/safe-deletion.md` |

**ציר ג — Risk:**

| Risk | קריטריונים | תוספת חובה |
|------|------------|-----------|
| High | billing, RLS, GDPR, auth, חיוב לקוח, מחיקת data | qa + security + code-reviewer + legal (אם PII) |
| Medium | פיצ'ר UI, business logic, automation, KPI | qa + code-reviewer |
| Low | copy, צבע, padding, md | discipline אחד בלבד |

---

### שלב 3 — בנה רשימת סוכנים

לכל סוכן, קבע:
- **שם הסוכן** (מתוך `agents/disciplines/` + `agents/domain-experts/` + `agents/product/`)
- **מה הוא יעשה** (תפקיד ספציפי במשימה זו)
- **מה הפלט שלו** (קובץ? migration? PRD? עיצוב?)
- **תלויות** (מי צריך לסיים לפניו)

---

### שלב 4 — הצג תוכנית לאישור

הצג למשתמש את הפורמט הבא **לפני כל ביצוע**:

```markdown
## ניתוח המשימה — טרוי

**משימה:** [מה ביקשת בדיוק]
**Phase מזוהה:** [MVP/P2/P3] — [מה בעץ האפיון מצדיק את זה]
**Task type:** [סוג המשימה]
**Risk level:** [High/Medium/Low] — [סיבה קצרה]

## סוכנים שיופעלו

1. **[agent-name]** → [מה יעשה] → פלט: [X]
2. **[agent-name]** → [מה יעשה] → פלט: [Y] *(תלוי בפלט 1)*
3. ...

## נקודות החלטה פתוחות
- [שאלה שדורשת הכרעה ממך — אם יש]

האם להמשיך?
```

**⛔ עצור כאן. אל תפעיל שום סוכן לפני אישור מפורש של ירין.**

---

### שלב 5 — אחרי אישור

העבר לסקיל `troy-dispatch` עם:
- רשימת הסוכנים לפי סדר
- הקונטקסט שנאסף בשלב 1
- ה-Risk level שזוהה

---

## יוצאים מן הכלל (ביצוע ללא אישור)

דלג על תוכנית ועבור ישר לביצוע **רק אם:**
- Risk = Low בבירור
- משימה ברורה לחלוטין (שינוי טקסט, תיקון typo, שאלה תיאורטית)
- המשתמש אמר מפורשות "תעשה בלי לשאול"

---

## Red rules

- אל תתחיל ביצוע לפני שהמשתמש אישר את התוכנית
- אל תמציא Phase אם לא מצאת את המודול בעץ — שאל
- אל תוריד Risk level כי "נראה פשוט" — אם נוגע ב-RLS/auth/billing → תמיד High
- אל תדלג על קריאת `open_tasks.md` — יכול להיות שהמשימה כבר פתוחה
