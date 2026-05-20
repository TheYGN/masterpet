---
name: troy-status
description: Troy's project status snapshot — reads open_tasks.md and the feature tree and produces a clear status report in under 10 seconds. Use when the user asks "מה הסטטוס?", "איפה אנחנו?", "מה פתוח?", "troy status", "תסכם לי את המצב", "מה הצעד הבא?", "מה נשאר?". Also useful before starting a new sprint or returning after a break.
---

# Troy Status — תמונת מצב של הפרויקט

## What this skill does

מייצר תמונת מצב מלאה ומדויקת של MasterPet בתוך שניות — מה הושלם, מה פתוח, מה חסום, ומה הצעד הבא המומלץ.

---

## Steps

### שלב 1 — אסוף נתונים (במקביל)

קרא **במקביל**:

1. `C:\Users\Yarin Golan\.claude\projects\C--Users-Yarin-Golan-Desktop-masterpet\memory\open_tasks.md`
2. חלץ עץ אפיון:
```bash
node -e "const d=JSON.parse(require('fs').readFileSync('pet_platform_tree.excalidraw','utf8')); d.elements.filter(e=>e.type==='text'&&e.text).forEach(e=>console.log(e.text.trim()))"
```
3. `prd/feature-tree.md` (אם קיים ומעודכן)

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

- אל תמציא סטטוסים — רק ממה שכתוב ב-`open_tasks.md` ובעץ
- אל תניח שה-`prd/feature-tree.md` מעודכן — תמיד תאמת מול ה-Excalidraw
- אם יש סתירה בין `open_tasks.md` לעץ — ציין אותה במפורש
- אל תוסיף "אני חושב שכדאי לעשות X" בלי לבסס על הנתונים שקראת
