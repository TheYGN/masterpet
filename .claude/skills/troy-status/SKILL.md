---
name: troy-status
description: Troy's project status snapshot — reads open_tasks.md and the feature tree and produces a clear status report in under 10 seconds. Use when the user asks "מה הסטטוס?", "איפה אנחנו?", "מה פתוח?", "troy status", "תסכם לי את המצב", "מה הצעד הבא?", "מה נשאר?". Also useful before starting a new sprint or returning after a break.
---

# Troy Status — תמונת מצב של הפרויקט

## What this skill does

מייצר תמונת מצב מלאה ומדויקת של MasterPet בתוך שניות — מה הושלם, מה פתוח, מה חסום, ומה הצעד הבא המומלץ.

---

## Steps

### שלב 1 — אסוף נתונים מ-3 מקורות (במקביל)

קרא את **כל 3 המקורות במקביל** — כל אחד מספר חצי מהסיפור:

1. **`C:\Users\yarin\.claude\projects\C--Users-yarin-Desktop-masterpet-masterpet\memory\open_tasks.md`** — מה פתוח עכשיו (אופרציה יומיומית)
2. **`prd/_shared/work-queue.md`** — סדר PRDs מתוכנן + תלויות מוצהרות
3. **`prd/feature-tree.md`** — חלוקה ל-sprints + Phase tags

אופציונלי (רק אם השאלה אסטרטגית/תמונה גדולה):
4. חילוץ עץ אפיון מ-Excalidraw:
```bash
node -e "const d=JSON.parse(require('fs').readFileSync('pet_platform_tree.excalidraw','utf8')); d.elements.filter(e=>e.type==='text'&&e.text).forEach(e=>console.log(e.text.trim()))"
```

---

### שלב 1.5 — Diff Check (חובה — לפני שלב 2)

לפני שאתה מציג סטטוס, **השווה את 3 המקורות** וזהה drift:

#### בדיקות חובה

| בדיקה | איך מאתרים | פעולה אם drift |
|------|------------|----------------|
| **PRD-ים שהושלמו ב-`open_tasks` אבל לא סומנו `[x]` ב-`work-queue`** | grep ל-"status: done" ב-open_tasks + השוואה ל-`[ ]` ב-work-queue | ⚠️ סמן ב-Diff section |
| **PRD-ים ב-`feature-tree.md` שלא מופיעים ב-`work-queue.md`** | חלץ PRD #NN מ-feature-tree, השווה לטבלה ב-work-queue | ⚠️ סמן ב-Diff section |
| **PRD-ים ב-`work-queue.md` שלא מופיעים ב-`feature-tree.md`** | היפוך הבדיקה הקודמת | ⚠️ סמן |
| **תאריך עדכון אחרון של 3 הקבצים** | קרא את שדה ה-"עודכן" / "updated" | אם > 7 ימים בין הקבצים — ⚠️ |
| **סדר PRDs שונה בין `open_tasks` ל-`work-queue`** | השווה את הסדר המוצהר | ⚠️ + הצע לעדכן את הישן |
| **Phase tag לא תואם בין `feature-tree` ל-`work-queue`** | PRD #X שמוגדר MVP במקום אחד ו-P2 במקום שני | 🔴 קריטי — צריך resolution מיידי |

#### אם זוהה drift — הוסף לפלט סקציה:

```markdown
### ⚠️ Drift זוהה בין מקורות הסטטוס

| נושא | מקור A | מקור B | חמור? | המלצה |
|------|--------|--------|-------|--------|
| PRD #3 status | open_tasks: in-progress (שלב 3ג) | work-queue: לא סומן Done | בינוני | לעדכן work-queue אחרי שלב 3ג |
| PRD #16 רווחיות | feature-tree: MVP | work-queue: לא מופיע | חמור | להוסיף ל-work-queue או לדחות מ-feature-tree |
```

**אם אין drift** — דלג על הסקציה הזו בפלט. אל תכתוב "אין drift" כדי לא להוסיף רעש.

---

### שלב 2 — הצג תמונת מצב

פורמט סטנדרטי לפלט:

```markdown
## תמונת מצב — MasterPet
*עודכן: [תאריך היום]*

---

### ✅ מה הושלם

| מודול | תאריך | הערה |
|-------|--------|------|
| Auth/RBAC | 2026-05-19 | אומת QA, 12/12 passed |
| Security Hardening | 2026-05-20 | חוץ מ-Resend |
| PRD #3 Products | 2026-05-20 | מחכה למימוש |

---

### 🔄 בתהליך / פתוח

| משימה | סטטוס | חסום ע"י | הצעד הבא |
|-------|--------|----------|---------|
| PRD #4 CSV Import | open | PRD #3 schema | לכתוב PRD אחרי Products schema |
| Turnstile dev keys | open | — | להחליף ב-.env.local |

---

### ⏸ מושהה

| משימה | סיבה | מתי לחזור |
|-------|------|----------|
| PRD #2 Inbox | חסום ב-Orders | אחרי PRD #6 |
| Email sender | צריך דומיין | כשרוכשים masterpet.com |

---

### 🗺️ סדר עדיפויות מומלץ לסבב הבא

1. **[משימה]** — [למה קודם]
2. **[משימה]** — [תלות מה שמחכה לה]
3. ...

---

### ⚡ Quick wins (< 2 שעות)

- [משימה קטנה שאפשר לסגור מהר]
- [עוד אחת]

---

### 🚧 חסמים פעילים

- [X] חסום ב-[Y] — [מה צריך לקרות כדי לפתוח]
```

---

### שלב 3 — סיים עם המלצה אחת

בסוף הדוח, כתוב **משפט אחד**:

> "הצעד הבא המומלץ: **[פעולה ספציפית אחת]** — [למה דווקא זה עכשיו]."

---

## אפשרויות פילטור

אם המשתמש ביקש פוקוס ספציפי, התאם:

| בקשה | מה להציג |
|------|----------|
| "מה פתוח בלבד?" | רק סעיף 🔄 |
| "מה הצעד הבא?" | רק ה-recommendation |
| "מה חסום?" | רק סעיף 🚧 |
| "סיכום Sprint" | הכל, עם KPIs אם יש |
| "מה נשאר ל-MVP?" | סנן לפי `[MVP]` בעץ בלבד |

---

## Red rules

- אל תמציא סטטוסים — רק ממה שכתוב ב-3 המקורות
- **אל תדלג על שלב 1.5 (Diff Check)** — drift שמצטבר הופך לבאג של "חשבתי שעשינו את זה"
- אל תניח שאחד מ-3 המקורות מעודכן — תמיד תאמת ביניהם
- אם יש סתירה בין 2 מקורות → סמן ב-⚠️. אם 3-way conflict → 🔴 קריטי
- אל תוסיף "אני חושב שכדאי לעשות X" בלי לבסס על הנתונים שקראת
- אם זיהית drift קריטי → הצע מפורשות להפעיל את ה-agent `roadmap-strategist` (דרך Agent tool, קריאת `agents/disciplines/roadmap-strategist.md`) לסדר את הקבצים. **לא** סקיל — agent.
