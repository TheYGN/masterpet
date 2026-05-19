---
name: design-screen
type: workflow
trigger_phrases: ["בוא נעצב", "בוא נתחיל לעצב", "תעצב לי", "מסך חדש", "עדכון עיצוב", "תעדכן את העיצוב"]
agents: [ux-designer, ui-implementer]
risk: Low-Medium
phase: ALL
---

# Workflow: עיצוב מסך חדש או עדכון עיצוב קיים

זרימה אחידה לכל בקשת עיצוב — חדש או עדכון. שומרת על DNA עיצובי עקבי, מונעת שכפול, ומנהלת היסטוריה דרך git.

---

## Trigger

כשהמשתמש כותב **אחד מהביטויים**: "בוא נעצב", "בוא נתחיל לעצב", "תעצב לי", "מסך חדש", "עדכון עיצוב", "תעדכן את העיצוב X" — ה-Orchestrator מפעיל את ה-workflow הזה.

---

## Pre-flight (חובה לפני כל פעולה)

### צעד 1 — קריאת מקור-האמת העיצובי

**חובה לקרוא לפני כל דבר אחר:**

1. **`designs/DESIGN-SYSTEM.md`** — Single Source of Truth. כל ה-tokens (צבעים, typography, spacing, shadows), כל הרכיבים המשותפים, כל דפוסי ה-RTL.
2. **`designs/PROMPT-TEMPLATE.md`** — תבנית הפרומפט שמשמשת לייצור מסכים חדשים.
3. **`designs/dashboard-branch/`** — המסך הראשון שעוצב. רפרנס ויזואלי חי לכל מסך חדש.

⚠️ **כל color/font/spacing שמופיע ב-`agents/product/ux-designer.md` או ב-`agents/disciplines/ui-implementer.md` ושסותר את `designs/DESIGN-SYSTEM.md` — `DESIGN-SYSTEM.md` מנצח.** הוא ה-source of truth. אלו רק תיעוד תהליכי.

### צעד 2 — סריקת `designs/` הקיים

```
ls designs/
```

לכל תיקייה שקיימת — קרא את ה-`README.md` שלה (אם יש) כדי להבין:
- איזה מסך זה?
- גרסה אחרונה?
- מתי עודכן?

### צעד 3 — סיווג הבקשה

ענה על השאלה: **מסך חדש או עדכון לקיים?**

| מצב | סימני זיהוי | זרימה |
|---|---|---|
| **מסך חדש** | המשתמש מזכיר שם מסך שלא קיים ב-`designs/` | קפוץ ל-"זרימה A — מסך חדש" |
| **עדכון לקיים** | המשתמש אומר "תעדכן", "תשנה", "תוסיף ל-X" + שם תיקייה קיימת | קפוץ ל-"זרימה B — עדכון" |
| **דו-משמעי** | לא ברור | **שאל את המשתמש** במפורש לפני שתמשיך |

---

## ⚠️ מה התפקיד שלי (Agent/Orchestrator) בזרימה הזו

**אני לא מייצר קוד HTML/JSX.** תפקידי הוא לכתוב פרומפט מלא ומדויק ל-**Claude Design**, שהוא כלי נפרד שמייצר את הקבצים.

הזרימה הנכונה:
1. אני קורא את כל ההקשר הקיים (PRD, DESIGN-SYSTEM, עיצובים קיימים)
2. אני מרכיב פרומפט עשיר (Part A + Part B) ושומר אותו ב-`designs/<slug>/PROMPT.md`
3. המשתמש שולח את הפרומפט ל-Claude Design עם הסקילים: `Hi-fi design`, `Interactive prototype`, `Design System`
4. Claude Design מייצר את הקבצים בפועל

---

## זרימה A — מסך חדש

### A.1 הגדרת המסך
**הסק מההקשר הקיים** — אל תשאל שאלות מיותרות אם המידע כבר קיים ב-PRD:

- שם המסך (slug באנגלית, e.g. `order-inbox`)
- כותרת עברית
- Active nav item
- Role של המשתמש שמשתמש במסך
- The 3-second test (3 שאלות שהמשתמש צריך לענות עליהן תוך 3 שניות)
- Sections (top to bottom, RTL) — מגובות ב-PRD אם קיים
- Special states / interactions
- Sample data ריאליסטית בעברית

### A.2 הצגת תוכנית
הצג למשתמש סיכום קצר לאישור:

```
מסך חדש: <slug> (<כותרת עברית>)
תיקייה: designs/<slug>/
Active nav: <id>

Sections מתוכננות:
- <section 1>
- <section 2>
- ...

Special states: <רשימה קצרה>
האם להמשיך?
```

### A.3 כתיבת הפרומפט ל-Claude Design
אחרי אישור — צור את התיקייה עם שני קבצים בלבד:

```
designs/<slug>/
├── README.md    ← slug, role, תאריך, שינוי אחרון
└── PROMPT.md    ← הפרומפט המלא ל-Claude Design (Part A + Part B)
```

המשתמש מוריד קובץ HTML אחד self-contained מ-Claude Design ומניח אותו ידנית:
```
designs/<slug>/MasterPet <Name>.html
```

**`PROMPT.md` = Part A (מ-`designs/PROMPT-TEMPLATE.md`, verbatim) + Part B ממולא לגמרי:**

Part B חייב לכלול:
- Screen name, Hebrew title, Active nav item, Role
- 3-second test (3 שאלות)
- **כל section בפירוט מלא**: layout, רכיבים ספציפיים, גדלים, צבעים
- **כל special state**: border colors, background tints, icon names, badge counts
- **Sample data מלאה בעברית**: שמות לקוחות, חיות מחמד, מוצרים, מחירים, timestamps

ככל שה-Part B מפורט יותר — Claude Design מייצר תוצאה מדויקת יותר.

### A.4 git commit
```bash
git add designs/<slug>/
git commit -m "Design: add <slug> prompt — ready for Claude Design"
```

---

## זרימה B — עדכון מסך קיים

### B.1 Snapshot של הקיים (מחיקה בטוחה)

**לפני שמוחקים כלום:**

```bash
git status
```

- אם יש שינויים לא מקומיטים **בתיקיית `designs/<slug>/`** — קומיט אותם קודם (snapshot):
  ```bash
  git add designs/<slug>/
  git commit -m "Snapshot: <slug> design before redesign"
  ```
- אם יש שינויים לא מקומיטים **מחוץ ל-`designs/`** (e.g. `src/app/...`) — **אל תיגע בהם**. הסוכן מקומיט רק את `designs/<slug>/` ספציפית.
- אם המצב נקי לחלוטין ב-`designs/<slug>/` ויש כבר commit אחרון של המסך הזה — אפשר לדלג על snapshot.

### B.2 הצגת ה-diff המתוכנן
הצג למשתמש מה הולך להשתנות:

```
עדכון מסך: <slug>
ה-commit הנוכחי של <slug>: <hash> "<message>"

השינויים המתוכננים:
- <שינוי 1>
- <שינוי 2>
- ...

לאחר העדכון:
- התיקייה designs/<slug>/ תיכתב מחדש (מחיקה + יצירה)
- הגרסה הישנה תהיה זמינה תמיד דרך git checkout <hash>

האם להמשיך?
```

### B.3 מחיקה + יצירה מחדש
אחרי אישור:

```bash
rm -rf designs/<slug>/
```

ואז צור את התיקייה החדשה לפי "זרימה A — A.3".

ב-`README.md` של המסך — עדכן את שורת "גרסה אחרונה" ו"שינוי אחרון" עם תאריך נוכחי + תיאור השינוי.

### B.4 git commit
```bash
git add designs/<slug>/
git commit -m "Design: update <slug> prompt — <תיאור השינוי>"
```

---

## תבנית `README.md` למסך

כל תיקיית מסך חייבת לכלול `README.md` קצר:

```markdown
# <כותרת המסך>

- **Slug:** <slug>
- **Role:** <e.g., Business Owner>
- **Active nav:** <e.g., dashboard>
- **גרסה אחרונה:** <YYYY-MM-DD>
- **שינוי אחרון:** <משפט אחד>

## קבצים
- `PROMPT.md` — הפרומפט ששימש לייצור המסך (Part A + Part B)
- `MasterPet <Name>.html` — קובץ self-contained מ-Claude Design (מוריד המשתמש ידנית)
```

---

## חוקים אדומים

1. **אסור להמציא צבע / font / spacing שלא ב-`designs/DESIGN-SYSTEM.md`.** אם חסר משהו — עצור ושאל את המשתמש אם להוסיף ל-DESIGN-SYSTEM (וזה דורש עדכון של כל המסכים הקיימים).
2. **אסור ליצור גרסה מקבילה (`dashboard-v2/`, `dashboard-new/`).** עדכון = מחיקה + יצירה מחדש. ההיסטוריה ב-git.
3. **אסור לקומיט מחוץ ל-`designs/<slug>/`.** הסוכן הזה לא נוגע ב-`src/`, ב-PRD, או בשום מקום אחר.
4. **אסור לדלג על snapshot ב-עדכון.** גם אם המשתמש דחוף. ה-snapshot זה 5 שניות.
5. **אסור לכתוב קוד HTML/JSX בעצמך.** תפקידך הוא לכתוב פרומפט מדויק ל-Claude Design — לא לבצע את הגנרציה.

---

## Handoff

אחרי שהפרומפט מוכן:

```
✅ פרומפט ל-Claude Design מוכן ב-designs/<slug>/PROMPT.md

תוכן הפרומפט:
- Part A (Static): MD3 tokens, shell, RTL rules, atoms, delivery format
- Part B (Variable): sections מלאות, special states, sample data עברית

git: <commit hash> "<message>"

הצעד הבא:
שלח את designs/<slug>/PROMPT.md ל-Claude Design עם הסקילים:
  Hi-fi design + Interactive prototype + Design System
```
