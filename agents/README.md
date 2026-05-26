# Agents Flow — DNA של הפרויקט

> מערכת סוכנים מובנית לפיתוח פלטפורמת ה-SaaS למזון לחיות.
> כל קובץ כאן מגדיר **תפקיד**, **התמחות**, ו**תנאי הפעלה**.
> ה-Orchestrator הוא הסוכן שמתזמן את כולם.

---

## למה זה קיים

פיתוח SaaS רציני דורש אנשים עם התמחויות שונות: מהנדס Frontend לא יבנה schema של Postgres עם RLS נכון, ומהנדס Backend לא יבין את חוקי FEDIAF לתזונת חיות. במקום שתחזור על ההסבר בכל שיחה, ה-DNA הזה **קודד את הצוות** שלך כקבצים. ה-Orchestrator קורא משימה, מבין מה היא דורשת, ומפעיל את הסוכנים הנכונים בסדר הנכון.

---

## ארכיטקטורה — 3 שכבות

```
┌─────────────────────────────────────────────────────────────────┐
│                    00-orchestrator.md                            │
│           (קורא משימה → בוחר Phase × Task × Risk)               │
└──────────────┬──────────────────────────────────────────────────┘
               │
       ┌───────┴────────┬──────────────────┬──────────────────┐
       ▼                ▼                  ▼                  ▼
┌────────────┐  ┌───────────────┐  ┌──────────────┐  ┌────────────┐
│ product/   │  │ disciplines/  │  │ domain-      │  │ workflows/ │
│ (PM, UX)   │  │ (Frontend,    │  │ experts/     │  │ (תרחישים   │
│            │  │  Backend,     │  │ (Pet-Nutri,  │  │  מוכנים)   │
│ "מה?       │  │  Integ, AI,   │  │  Hebrew-RTL, │  │            │
│  ולמי?"   │  │  DevOps, QA)  │  │  Logistics,  │  │            │
│            │  │               │  │  SaaS-Billing│  │            │
│            │  │ "איך לבנות?"  │  │              │  │            │
│            │  │               │  │ "מה הכללים   │  │            │
│            │  │               │  │  בדומיין?"   │  │            │
└────────────┘  └───────────────┘  └──────────────┘  └────────────┘
```

### למה היברידי (Disciplines + Domain Experts)?
- **Disciplines** = מומחים בטכנולוגיה. 14 סוכנים: frontend, backend, **mobile** (P2), integrations, ai-ml (P2+), **data-analytics**, devops, qa, **qa-automation**, **security**, **code-reviewer**, **docs-keeper**, **roadmap-strategist**, **challenger**. עובדים על *כל* מודול.
  דוגמה: backend-engineer בונה schemas, RLS, Edge Functions לכל הפרויקט. security-engineer מבקר את ה-RLS שלו לפני prod. data-analytics-engineer בונה את ה-Materialized Views ל-Dashboards.
- **Domain Experts** = מומחים בעולם התוכן של הפרויקט הזה. מתייעצים איתם. 6 סוכנים: pet-nutrition, hebrew-rtl, israeli-logistics, saas-billing, **conversational-designer**, **legal-compliance**.
  דוגמה: pet-nutrition-expert עונה "מה זה FEDIAF?" כשbackend-engineer בונה את טבלת התזונה. legal-compliance-expert מאשר flow לפני שmarketing אוטומטי יוצא לאוויר.

**שניהם נדרשים לכל פיצ׳ר רציני.** מהנדס בלי מומחה דומיין יבנה schema גנרי; מומחה דומיין בלי מהנדס יכתוב מסמך שאי-אפשר ליישם.

---

## איך ה-Orchestrator מחליט

**Decision-Tree משולש** — בכל משימה הוא שואל 3 שאלות:

### 1. Phase (איפה אנחנו ב-roadmap?)
- **MVP (חודשים 1-4)** → רק disciplines + domain experts בסיסיים. ללא AI/ML.
- **Phase 2 (5-8)** → מתווסף ai-ml-engineer + integrations מתקדמים.
- **Phase 3 (9-12)** → אופטימיזציה, custom reports, ML מתקדם.

### 2. Task (מה סוג העבודה?)
- **פיצ׳ר חדש** → PM → UX → Backend → Frontend → QA (ראה `workflows/feature-development.md`)
- **באג** → QA → Discipline-of-the-bug → QA (ראה `workflows/bug-fix.md`)
- **תכנון Sprint** → PM → Orchestrator → Disciplines (ראה `workflows/sprint-planning.md`)
- **שינוי schema** → backend-engineer + domain-expert רלוונטי (חובה)
- **אינטגרציה חיצונית** → integrations-engineer + domain-expert + devops
- **Dashboard / KPI / Report** → data-analytics-engineer + backend-engineer + (domain-expert לפי המטרה)
- **אפליקציית Mobile (Phase 2)** → mobile-engineer + backend + integrations + israeli-logistics + qa
- **WhatsApp template / marketing flow** → conversational-designer + hebrew-rtl-expert + legal-compliance-expert + integrations
- **data של לקוח / RBAC / Audit / מחיקה / GDPR** → legal-compliance-expert + backend + security

### 3. Risk (מה רגישות המשימה?)
- **High risk** (billing, RLS, payments, GDPR) → תמיד qa-engineer + **security-engineer** + **code-reviewer** חובה
- **Medium risk** (UI חדש, business logic) → discipline + qa + code-reviewer
- **Low risk** (copy change, color tweak) → discipline בלבד

**הכלל המנחה:** מותר להחליף את הסדר אם המשימה ברורה ופשוטה, אבל אסור לדלג על שלב High-risk.

---

## איך משתמשים בזה בפועל

### דרך 1 — דרך Claude Code (מומלץ)
פותחים את הפרויקט ב-Claude Code, ואומרים:
```
"תקרא את /agents/00-orchestrator.md ותפעיל את הצוות לפי המשימה: <התיאור שלך>"
```
ה-Orchestrator יקרא את הקובץ הרלוונטי, יבחר סוכנים, ויפעיל אותם דרך מנגנון ה-`Agent` tool.

### דרך 2 — קריאה ידנית
אם אתה כבר יודע מה אתה צריך, תפנה ישירות:
```
"תקרא את /agents/disciplines/backend-engineer.md ותכתוב לי schema לטבלת orders"
```

### דרך 3 — תרחיש מוכן (workflow)
```
"תפעיל את /agents/workflows/feature-development.md על הפיצ׳ר: ניהול subscription בסיסי"
```
ה-workflow ירוץ צעד-אחרי-צעד עם כל הסוכנים הדרושים.

---

## מבנה כל קובץ סוכן

כל קובץ מתחיל ב-frontmatter סטנדרטי:

```yaml
---
name: <שם-הסוכן>
role: <תפקיד>
specialty: <התמחות עיקרית>
activates_when: <תנאים מתי הסוכן מופעל>
phase: [MVP|P2|P3|ALL]
risk_sensitivity: [Low|Medium|High]
---
```

ואז הגוף כולל:
1. **Mission** — משפט אחד מה הסוכן עושה
2. **Context to read** — אילו קבצים בפרויקט הסוכן חייב לקרוא לפני שמתחיל
3. **Stack & Conventions** — הטכנולוגיות והכללים שמחייבים אותו
4. **Decision rules** — איך הוא מקבל החלטות
5. **Handoff** — למי הוא מעביר את העבודה אחרי שגמר
6. **Output format** — איך נראה הפלט שלו

---

## הקשר לעץ האפיון

ה-flow הזה תוכנן מתוך [pet_platform_tree.excalidraw](../pet_platform_tree.excalidraw):
- **MVP**: 13 מודולים → דורש Frontend, Backend, Integrations, DevOps, QA, Data-Analytics + Pet-Nutrition, Hebrew-RTL, SaaS-Billing, Conversational-Designer, Legal-Compliance
- **Phase 2**: AI Prediction Engine + שליחים → מוסיף AI/ML + Mobile + Israeli-Logistics
- **Phase 3**: אופטימיזציה + Custom Reports → כל הצוות, בעיקר AI/ML + Backend + Data-Analytics

---

## תחזוקה

כשנוסף תחום חדש לפרויקט (לדוגמה, תאימות לאזורים אחרים, או מודול ניתוחים):
1. בדוק אם זה discipline (טכנולוגי) או domain (תוכני)
2. צור קובץ חדש בתיקייה המתאימה לפי המבנה למעלה
3. עדכן את `00-orchestrator.md` ברשימת הסוכנים הזמינים
4. אם זה תרחיש חוזר → הוסף workflow ב-`workflows/`

---

## כללים אדומים

- **לעולם לא** לדלג על qa-engineer **או security-engineer** במשימת High-risk.
- **לעולם לא** לכתוב schema/RLS בלי backend-engineer + domain-expert רלוונטי + security-engineer pass.
- **לעולם לא** לכתוב טקסט מול לקוח (WhatsApp/SMS/Email) בלי hebrew-rtl-expert.
- **לעולם לא** לבנות אינטגרציית תשלום בלי saas-billing-expert + security-engineer.
- **לעולם לא** merge ל-main בלי code-reviewer pass (אלא אם hotfix P0).
- **לעולם לא** לסיים workflow בלי docs-keeper — אם לא תיעדנו, זה לא קרה.

## Notion Workspace

ה-DNA מקושר ל-Notion workspace ייעודי: [Pet Platform — Project Hub](https://www.notion.so/3646f31e8b0f81fda6b8dc9e68d4026e)

4 databases מתעדכנים אוטומטית ע״י [docs-keeper](disciplines/docs-keeper.md):
- 📋 **Tasks** — Sprint board עם Phase/Discipline/Module/Risk
- 🧭 **Decisions (ADR)** — Architecture Decision Records
- 🐛 **Bugs & Incidents** — root cause + prevention לכל באג
- 🔄 **Sprint Retros** — velocity, learnings, action items
