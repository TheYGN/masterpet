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
- **`agents/disciplines/`** — 14 מומחים טכנולוגיים (Frontend, Backend, Mobile, Data-Analytics, Integrations, AI/ML, DevOps, **QA**, **QA-Automation**, Security, Code-Reviewer, Docs-Keeper, **Roadmap-Strategist**, **Challenger**) — **qa-automation** מבצע בדיקות runtime אוטומטיות (Preview + Supabase logs + Vercel logs) במקום שירין יבדוק ידנית. **roadmap-strategist** מסדר תור PRDs ומזהה תלויות נסתרות לפני שהן חוסמות. **challenger** הוא devil's advocate — שואל 3 שאלות לפני כל החלטה High-risk
- **`agents/domain-experts/`** — 6 מומחי תוכן (Pet-Nutrition, Hebrew-RTL, Israeli-Logistics, SaaS-Billing, Conversational-Designer, Legal-Compliance)
- **`agents/product/`** — Product Manager + UX Designer
- **`agents/workflows/`** — תרחישים מוכנים (feature-development, bug-fix, sprint-planning)

## מקורות נוספים

- **`pet_platform_tree.excalidraw`** — **מקור-האמת של עץ האפיון** (ראה למטה: "עץ האפיון הוויזואלי"). כל סוכן קורא אותו לפני שהוא פועל
- **`prd/feature-tree.md`** — נגזרת טקסטואלית של ה-Excalidraw. מתעדכן ידנית כשהעץ הוויזואלי משתנה
- **`skills/agent-flow-creator/`** — הסקיל שיצר את הצוות (לפרויקטים עתידיים)
- **`designs/`** — מסכים מעוצבים. ייווצר על-פי הצורך לפי המוסכמה ב-`agents/disciplines/ui-implementer-designs-convention.md`

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

- אל תכתוב schema/RLS בלי `backend-engineer` + domain-expert רלוונטי
- אל תכתוב טקסט ללקוח (WhatsApp/SMS/Email) בלי `hebrew-rtl-expert` + `conversational-designer`
- אל תבצע merge ל-main בלי `code-reviewer`
- אל תיגע ב-billing/payments בלי `saas-billing-expert` + `security-engineer` + `legal-compliance-expert`
- אל תעצב מסך / תעדכן עיצוב בלי `agents/workflows/design-screen.md` + `designs/DESIGN-SYSTEM.md`
- אל תאשר PRD חדש בלי `challenger` pass (3 שאלות מתועדות ב-`prd/_shared/decisions-log.md`) + `roadmap-strategist` שבדק תלויות
- אל תשנה priority בין PRDs בלי `roadmap-strategist` שמנמק את ההשפעה
- **אל תבקש מירין לבדוק ידנית** אחרי deploy / שינוי auth / migration / שינוי UI משמעותי. במקום זה — הצע ב-CTA קצר את [`qa-automation`](agents/disciplines/qa-automation.md) (לפי הטריגרים ב-`00-orchestrator.md` §QA Automation). הסוכן עצמו רץ רק באישור מפורש — אתה רק מציע

## Troy Skills — ארגז הכלים של טרוי

לטרוי יש 5 סקילים פעילים בתיקיית `.claude/skills/troy-*/SKILL.md` (זה המיקום שClaude Code סורק אוטומטית). הפעל כל אחד לפי הטריגרים:

| Skill | קובץ | מתי להפעיל |
|-------|------|-----------|
| **troy-intake** | `.claude/skills/troy-intake/SKILL.md` | כל משימה חדשה שדורשת תכנון — לפני כל dispatch |
| **troy-dispatch** | `.claude/skills/troy-dispatch/SKILL.md` | אחרי שירין אישר תוכנית — להפעיל סוכנים |
| **troy-status** | `.claude/skills/troy-status/SKILL.md` | "מה הסטטוס?", "איפה אנחנו?", "מה פתוח?", "מה הצעד הבא?" |
| **troy-handoff** | `.claude/skills/troy-handoff/SKILL.md` | אחרי כל סוכן שסיים — לפני שהסוכן הבא מתחיל |
| **troy-retro** | `.claude/skills/troy-retro/SKILL.md` | "סיימנו", "תסכם", סוף workflow משמעותי |

**סדר עבודה תקין:** `troy-intake` → אישור → `troy-dispatch` → (לכל handoff: `troy-handoff`) → `troy-retro`

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

1. קרא את הקובץ `C:\Users\Yarin Golan\.claude\projects\C--Users-Yarin-Golan-Desktop-masterpet\memory\open_tasks.md`
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
