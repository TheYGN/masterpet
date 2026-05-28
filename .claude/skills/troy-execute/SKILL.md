---
name: troy-execute
description: Troy's task execution — analyzes any incoming MasterPet request (Phase × Task type × Risk), produces a plan, and either executes immediately (Low-risk) or presents the plan for approval before dispatching agents (Medium/High-risk). Use when the user gives Troy a new task, feature request, bug report, or any multi-step request. Triggers "טרוי", "troy", or any task that requires more than one agent. This skill replaces the older troy-intake + troy-dispatch pair.
---

# Troy Execute — ניתוח וביצוע משימה

## What this skill does

מקבל בקשה נכנסת, מנתח אותה לפי 3 צירים (Phase × Task type × Risk), בונה תוכנית ביצוע, ואז:
- **Low-risk** → מבצע מיידית, בלי המתנה לאישור
- **Medium/High-risk** → מציג תוכנית, ממתין לאישור מירין, ואז מבצע

---

## שלב 1 — קרא קונטקסט בסיסי (במקביל)

קרא את שלושת הקבצים האלה **במקביל** (parallel tool calls):

1. `prd/_shared/data-model.md` — מה קיים ב-DB
2. `prd/_shared/glossary.md` — מילון מונחים
3. `C:\Users\yarin\.claude\projects\C--Users-yarin-Desktop-masterpet-masterpet\memory\open_tasks.md` — מה פתוח

תוספות לפי סוג המשימה:
- נוגעת ב-UI/עיצוב → קרא גם `designs/DESIGN-SYSTEM.md`
- נוגעת במודול ספציפי → חלץ טקסט מ-`pet_platform_tree.excalidraw`:
  ```bash
  node -e "const d=JSON.parse(require('fs').readFileSync('pet_platform_tree.excalidraw','utf8')); d.elements.filter(e=>e.type==='text'&&e.text).forEach(e=>console.log(e.text.trim()))"
  ```

---

## שלב 2 — סווג לפי 3 צירים

**ציר א — Phase:**
- חפש את המודול בעץ האפיון
- `[MVP]` → סוכני MVP בלבד (סוכני Phase 2 בארכיון `agents/_archive/phase-2/` — אל תפעיל ללא אישור מפורש)
- `[P2]` → מותר להחזיר סוכנים מהארכיון (`integrations-engineer`, `mobile-engineer`, `ai-ml-engineer`, `conversational-designer`)
- `[P3]` → כל הצוות
- לא מוגדר → שאל את ירין

**ציר ב — Task type** (לפי הטבלה ב-`agents/00-orchestrator.md` §Decision Tree):

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
| **High** | billing, RLS, GDPR, auth, חיוב לקוח, מחיקת data | qa + security + code-reviewer + legal (אם PII) |
| **Medium** | פיצ'ר UI, business logic, automation, KPI | qa + code-reviewer |
| **Low** | copy, צבע, padding, md | discipline אחד בלבד |

---

## שלב 3 — בנה רשימת סוכנים

לכל סוכן, קבע:
- **שם הסוכן** (מתוך `agents/disciplines/` + `agents/domain-experts/` + `agents/product/` — לא מהארכיון)
- **מה הוא יעשה** (תפקיד ספציפי במשימה זו)
- **מה הפלט שלו** (קובץ? migration? PRD? עיצוב?)
- **תלויות** (מי צריך לסיים לפניו)

### חוקי gating חובה — אסור לדלג

**אם המשימה היא "PRD חדש" / "תכתוב מפרט" / "תאפיין את X" / "spec עבור Y":**

חובה להוסיף לרשימת הסוכנים, **בסדר הזה**, **לפני** `product-manager`:

1. **`roadmap-strategist`** → בודק תלויות + עיתוי. פלט: Roadmap Analysis (אישור עיתוי או דחייה).
2. **`challenger`** → 3 שאלות אתגור. פלט: 3 questions + answers ב-`prd/_shared/decisions-log.md`.
3. **`product-manager`** (דרך `masterpet-prd` skill) — רק אחרי ש-1+2 עברו.

**אם המשימה היא "להזיז priority בין PRDs קיימים" / "מה הבא?" / "סדר עדיפויות":**
- חובה `roadmap-strategist` בלבד. אסור לקבל החלטה ad-hoc.

**אם המשימה היא "החלטת arquitecture High-risk" (schema core / framework shift / hard-coded value בtable מרכזית):**
- חובה `challenger` לפני הdiscipline-relevant.

**הנימוק:** ב-PRDs #3-#6 דילגנו על שניהם וכתבנו PRDs מהבטן. עבד, אבל אין תיעוד של trade-offs, ויש debt עתידי כשנרצה לחזור להחלטות. מהיום והלאה — gating חובה.

---

## שלב 4 — Decision: ביצוע ישיר או הצגת תוכנית?

### ביצוע ישיר (דלג על שלב 5, עבור לשלב 6)

**רק אם כל התנאים מתקיימים:**
- Risk = Low בבירור
- משימה ברורה לחלוטין (שינוי טקסט, תיקון typo, שאלה תיאורטית)
- או — המשתמש אמר מפורשות "תעשה בלי לשאול"

### הצגת תוכנית לאישור (שלב 5)

**Medium/High-risk → תמיד.** הצג את הפורמט הזה:

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

## שלב 5 — אחרי אישור (או ישר אם Low-risk)

### כללי Dispatch — מתי במקביל ומתי סדרתי

```
✅ במקביל (parallel tool calls):
- hebrew-rtl-expert + saas-billing-expert (שניהם מייעצים, לא כותבים קוד)
- frontend-engineer + docs-keeper (כתיבה + תיעוד נפרד)
- qa-engineer + code-reviewer (שניהם קוראים, לא משנים)

❌ סדרתי (חובה):
- backend-engineer → frontend-engineer (frontend תלוי ב-API ש-backend כותב)
- product-manager → ux-designer (UX תלוי ב-PRD)
- ux-designer → frontend-engineer (frontend תלוי בעיצוב)
- כל שינוי schema → qa-engineer (QA תלוי ב-schema סופי)
```

### פרוטוקול הפעלת סוכן — 4 אלמנטים חובה

```
1. קרא את [נתיב מלא לקובץ הסוכן]
2. הקונטקסט: [העתק רלוונטי — data model, PRD excerpt, עיצוב קיים]
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

## שלב 6 — מעקב אחרי handoffs

אחרי שכל סוכן מסיים, וודא:

1. **הפלט קיים** — הקובץ נוצר / ה-migration נכתב / ה-PRD נכתב
2. **ה-handoff התרחש** — הסוכן הבא קיבל את הפלט של הקודם
3. **אין drift** — הסוכן לא יצר ישות חדשה בלי לעדכן `_shared/data-model.md`

אם handoff נכשל (סוכן לא העביר פלט) — הפעל סקיל `troy-handoff` או הפעל מחדש עם הקונטקסט החסר.

---

## Dispatch log — תוך כדי

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

- אל תתחיל ביצוע ב-Medium/High-risk לפני שירין אישר את התוכנית
- אל תמציא Phase אם לא מצאת את המודול בעץ — שאל
- אל תוריד Risk level כי "נראה פשוט" — אם נוגע ב-RLS/auth/billing → תמיד High
- אל תדלג על קריאת `open_tasks.md` — יכול להיות שהמשימה כבר פתוחה
- אל תפעיל סוכן בלי 4 האלמנטים (קובץ + קונטקסט + משימה + פלט)
- אל תפעיל סוכן מהארכיון (`agents/_archive/`) ללא אישור מפורש של ירין
- אל תפעיל סוכן frontend לפני ש-backend סיים וסיפק API contract
- אל תסמן ביצוע כ-"סיים" לפני ש-`troy-handoff` אימת את הפלטים
- High-risk → תמיד `qa-engineer` + `code-reviewer` + `security-engineer` בסוף השרשרת, לא אופציונלי
