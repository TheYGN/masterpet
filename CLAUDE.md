@AGENTS.md

# MasterPet — צוות הסוכנים של הפרויקט

לפרויקט הזה יש **צוות סוכנים מובנה** שמתאים את העבודה ל-DNA של MasterPet (SaaS לוגיסטי לעסקי מזון לחיות, ישראל, RTL).

## שם ה-Orchestrator — טרוי

ה-Orchestrator הראשי של הצוות נקרא **טרוי**.

כשהמשתמש פונה אל **"טרוי"** (בתחילת משפט, באמצעו, או בכל צורה כגון: "טרוי, תתחיל", "תשאל את טרוי", "תפעיל את טרוי") — הפעל מיד את `agents/00-orchestrator.md` ופעל לפי הפרוטוקול שלו.

## איך עובדים עם הצוות

לכל משימה שאינה תיקון של שורה אחת — **קרא קודם את טרוי (ה-Orchestrator)**:

```
agents/00-orchestrator.md
```

טרוי יבחר את הסוכנים הנכונים לפי 3 שאלות (Phase × Task type × Risk), ויפעיל אותם בסדר הנכון.

## מבנה הצוות

- **`agents/00-orchestrator.md`** — ראש הצוות, מתזמן את כולם
- **`agents/README.md`** — תיאור מלא של ה-DNA + ארכיטקטורת 3 השכבות
- **`agents/disciplines/`** — 12 מומחים טכנולוגיים פעילים (Frontend, Backend, UI-Implementer, Data-Analytics, DevOps, **QA**, **QA-Automation**, Security, Code-Reviewer, Docs-Keeper, **Roadmap-Strategist**, **Challenger**). **qa-automation** מבצע בדיקות runtime אוטומטיות. **roadmap-strategist** מסדר תור PRDs. **challenger** הוא devil's advocate ל-High-risk
- **`agents/domain-experts/`** — 4 מומחי תוכן פעילים (Hebrew-RTL, Israeli-Logistics, SaaS-Billing, Legal-Compliance)
- **`agents/_archive/`** — סוכנים שאורכבו ב-2026-05-26 (לא פעילים ב-MVP): `pet-nutrition-expert`, ובתת-תיקייה `phase-2/`: `integrations-engineer`, `mobile-engineer`, `ai-ml-engineer`, `conversational-designer`. ראה `_archive/phase-2/README.md` להחזרה לפעילות
- **`agents/product/`** — Product Manager + UX Designer
- **`agents/workflows/`** — תרחישים מוכנים (feature-development, bug-fix, sprint-planning)

## מקורות נוספים

- **`pet_platform_tree.excalidraw`** — **מקור-האמת של עץ האפיון** (ראה למטה: "עץ האפיון הוויזואלי"). כל סוכן קורא אותו לפני שהוא פועל
- **`prd/feature-tree.md`** — נגזרת טקסטואלית של ה-Excalidraw. מתעדכן ידנית כשהעץ הוויזואלי משתנה
- **`skills/agent-flow-creator/`** — הסקיל שיצר את הצוות (לפרויקטים עתידיים)
- **`designs/`** — מסכים מעוצבים. המוסכמה (מבנה תיקייה + git protocol + סדר עדיפות קריאה) מתועדת ב-`agents/disciplines/ui-implementer.md` §תיקיית designs/

## עץ האפיון הוויזואלי — מקור-אמת לחשיבת מוצר

**הקובץ `pet_platform_tree.excalidraw` הוא ה-master.** הוא JSON רגיל ואפשר לחלץ ממנו את כל הטקסט עם:

```bash
node -e "const d=JSON.parse(require('fs').readFileSync('pet_platform_tree.excalidraw','utf8')); d.elements.filter(e=>e.type==='text'&&e.text).forEach(e=>console.log(e.text.trim()))"
```

**מתי לקרוא את ה-Excalidraw קודם:**
- שיחות מוצר / אסטרטגיה / כיוונים / "תמונה גדולה"
- שאלות עומק על מודול ספציפי
- לפני כתיבת PRD חדש
- כשהמשתמש מבקש להבין יחסים בין פיצ'רים

**מתי טקסט מספיק:** debugging, קוד, סטטוס קצר, שאלות נקודתיות. ראה [[feedback-visual-thinking]].

**סנכרון:** כשהעץ משתנה משמעותית, מסנכרנים ל-`prd/feature-tree.md` ו-`prd/_shared/work-queue.md`. אל תניח שה-md מעודכן — תמיד תאמת מול ה-Excalidraw.

## חוקים מהירים

- **PRD בפרויקט הזה — תמיד דרך `masterpet-prd` skill בלבד.** אסור להפעיל את הסקילים הגלובליים `prd`, `prd-generator`, או `anthropic-skills:prd-generator` בפרויקט MasterPet — הם לא מכירים את עץ האפיון, את ה-PRDs הקיימים, ואת הפורמט שלנו. `masterpet-prd` תמיד מנצח על trigger collision.
- **סנכרון עץ אפיון — חובה דו-כיוונית.** כשמשנים את `prd/feature-tree.md` — חייבים לעדכן גם את `pet_platform_tree.excalidraw` (וההפך). השניים חייבים תמיד לתאר את אותו מצב. אם זוהה drift — להריץ Diff Check ולתקן לפני שממשיכים בעבודה אחרת. נכון ל-2026-05-26 — קיים punch-list ידני ב-`prd/_shared/excalidraw-sync.md` שמחכה לעדכון Excalidraw.
- אל תכתוב schema/RLS בלי `backend-engineer` + domain-expert רלוונטי
- אל תכתוב טקסט ללקוח (WhatsApp/SMS/Email) בלי `hebrew-rtl-expert` (`conversational-designer` בארכיון — להחזיר כשמתחילים זרימות multi-turn)
- אל תבצע merge ל-main בלי `code-reviewer`
- אל תיגע ב-billing/payments בלי `saas-billing-expert` + `security-engineer` + `legal-compliance-expert`
- אל תעצב מסך / תעדכן עיצוב בלי `agents/workflows/design-screen.md` + `designs/DESIGN-SYSTEM.md`
- אל תאשר PRD חדש בלי `challenger` pass (3 שאלות מתועדות ב-`prd/_shared/decisions-log.md`) + `roadmap-strategist` שבדק תלויות
- אל תשנה priority בין PRDs בלי `roadmap-strategist` שמנמק את ההשפעה
- **אל תבקש מירין לבדוק ידנית** אחרי deploy / שינוי auth / migration / שינוי UI משמעותי. במקום זה — הצע ב-CTA קצר את [`qa-automation`](agents/disciplines/qa-automation.md) (לפי הטריגרים ב-`00-orchestrator.md` §QA Automation). הסוכן עצמו רץ רק באישור מפורש — אתה רק מציע

## Troy Skills — ארגז הכלים של טרוי

לטרוי יש 4 סקילים פעילים בתיקיית `.claude/skills/troy-*/SKILL.md` (זה המיקום ש-Claude Code סורק אוטומטית). הפעל כל אחד לפי הטריגרים:

| Skill | קובץ | מתי להפעיל |
|-------|------|-----------|
| **troy-execute** | `.claude/skills/troy-execute/SKILL.md` | כל משימה חדשה — מנתח, מסווג, ומבצע ישר (Low-risk) או מציג תוכנית לאישור ואז מבצע (Medium/High-risk). מחליף את troy-intake + troy-dispatch הישנים |
| **troy-status** | `.claude/skills/troy-status/SKILL.md` | "מה הסטטוס?", "איפה אנחנו?", "מה פתוח?", "מה הצעד הבא?" |
| **troy-handoff** | `.claude/skills/troy-handoff/SKILL.md` | אחרי כל סוכן שסיים — לפני שהסוכן הבא מתחיל |
| **troy-retro** | `.claude/skills/troy-retro/SKILL.md` | "סיימנו", "תסכם", סוף workflow משמעותי |

**סדר עבודה תקין:** `troy-execute` (כולל אישור פנימי אם Medium/High-risk) → (לכל handoff: `troy-handoff`) → `troy-retro`

## Trigger keywords לעיצוב (חובה)

כשהמשתמש כותב אחד מהביטויים הבאים בתחילת שיחה או בתוכה:
**"בוא נעצב"**, **"בוא נתחיל לעצב"**, **"תעצב לי"**, **"מסך חדש"**, **"עדכון עיצוב"**, **"תעדכן את העיצוב"**

→ **הפעל מיד את [`agents/workflows/design-screen.md`](agents/workflows/design-screen.md)**, שעושה את הדברים הבאים בסדר הזה:
1. קורא את `designs/DESIGN-SYSTEM.md` (Source of Truth עיצובי)
2. סורק את `designs/` כדי לדעת מה כבר קיים
3. מסווג: מסך חדש / עדכון לקיים / דו-משמעי
4. אם עדכון — עושה snapshot ב-git לפני מחיקה, ואז יוצר מחדש (אופציה C)
5. משתמש ב-`designs/PROMPT-TEMPLATE.md` כשלד

אל תתחיל לעצב לפני שקראת את ה-workflow.

## פתיחת שיחה — בדיקת משימות פתוחות (חובה)

**בתחילת כל שיחה חדשה, לפני שאתה מגיב להודעה הראשונה של המשתמש:**

1. קרא את הקובץ `C:\Users\yarin\.claude\projects\C--Users-yarin-Desktop-masterpet-masterpet\memory\open_tasks.md`
2. אם יש בו משימות פתוחות (status: open / in-progress) — הצג אותן בקצרה למשתמש לפני שאתה עונה על ההודעה שלו:
   - כותרת המשימה
   - סטטוס + תאריך עדכון אחרון
   - הקשר קצר (משפט אחד)
3. שאל: "האם להמשיך באחת מהמשימות האלו, או לעבור למה שביקשת עכשיו?"
4. אם אין משימות פתוחות — דלג בשקט, אל תזכיר את הבדיקה, פשוט תענה לבקשה.

**תחזוקה שוטפת של `open_tasks.md`:**
- כשמתחילים משימה גדולה — הוסף אותה לקובץ עם status: in-progress
- כשמסיימים — שנה ל-status: done (או מחק אם זה זבל)
- כשהמשתמש דוחה משימה למועד אחר — תעד את זה כ-status: paused עם סיבה
- אל תזרוק לשם כל פיצ'ר קטן — רק עבודה משמעותית שצריכה להימשך בשיחה הבאה
