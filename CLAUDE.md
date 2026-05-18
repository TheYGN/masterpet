@AGENTS.md

# MasterPet — צוות הסוכנים של הפרויקט

לפרויקט הזה יש **צוות סוכנים מובנה** שמתאים את העבודה ל-DNA של MasterPet (SaaS לוגיסטי לעסקי מזון לחיות, ישראל, RTL).

## איך עובדים עם הצוות

לכל משימה שאינה תיקון של שורה אחת — **קרא קודם את ה-Orchestrator**:

```
agents/00-orchestrator.md
```

ה-Orchestrator יבחר את הסוכנים הנכונים לפי 3 שאלות (Phase × Task type × Risk), ויפעיל אותם בסדר הנכון.

## מבנה הצוות

- **`agents/00-orchestrator.md`** — ראש הצוות, מתזמן את כולם
- **`agents/README.md`** — תיאור מלא של ה-DNA + ארכיטקטורת 3 השכבות
- **`agents/disciplines/`** — 11 מומחים טכנולוגיים (Frontend, Backend, Mobile, Data-Analytics, Integrations, AI/ML, DevOps, QA, Security, Code-Reviewer, Docs-Keeper)
- **`agents/domain-experts/`** — 6 מומחי תוכן (Pet-Nutrition, Hebrew-RTL, Israeli-Logistics, SaaS-Billing, Conversational-Designer, Legal-Compliance)
- **`agents/product/`** — Product Manager + UX Designer
- **`agents/workflows/`** — תרחישים מוכנים (feature-development, bug-fix, sprint-planning)

## מקורות נוספים

- **`pet_platform_tree.excalidraw`** — עץ האפיון. כל סוכן קורא אותו לפני שהוא פועל
- **`skills/agent-flow-creator/`** — הסקיל שיצר את הצוות (לפרויקטים עתידיים)
- **`designs/`** — מסכים מעוצבים. ייווצר על-פי הצורך לפי המוסכמה ב-`agents/disciplines/ui-implementer-designs-convention.md`

## חוקים מהירים

- אל תכתוב schema/RLS בלי `backend-engineer` + domain-expert רלוונטי
- אל תכתוב טקסט ללקוח (WhatsApp/SMS/Email) בלי `hebrew-rtl-expert` + `conversational-designer`
- אל תבצע merge ל-main בלי `code-reviewer`
- אל תיגע ב-billing/payments בלי `saas-billing-expert` + `security-engineer` + `legal-compliance-expert`
