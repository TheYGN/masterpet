# Workflow: Feature Development

> תרחיש מוכן לפיתוח פיצ׳ר חדש מקצה לקצה.
> **מי משתמש בזה?** ה-Orchestrator, כשמשתמש מבקש פיצ׳ר חדש מהעץ.

## מתי להפעיל את ה-workflow הזה
- בקשה לפיצ׳ר ש**עדיין לא קיים** בקוד
- הפיצ׳ר מהעץ או חדש לחלוטין
- Scope ברור (לא "תוסיף הרבה דברים")

## מתי **לא** להפעיל
- באג fix → השתמש ב-`bug-fix.md`
- שינוי copy/UI קטן → ux + frontend בלבד
- POC/spike → אד-הוק, לא צריך כל ה-pipeline

---

## Stages — סדר חובה

### Stage 0: Triage (Orchestrator, 5 min)
**מטרה**: לוודא שאנחנו מבינים מה ביקשו

- [ ] זיהוי Phase (MVP/P2/P3) מהעץ
- [ ] Risk level
- [ ] רשימת סוכנים שיופעלו
- [ ] אישור משתמש לתוכנית

**אם הפיצ׳ר ב-Phase מאוחרת יותר** — לעצור ולהציג למשתמש את 3 האפשרויות (דחיה / החלפת Phase / POC).

---

### Stage 1: Product Definition (product-manager, 15-30 min)
**Trigger**: אישור משתמש על תוכנית
**מי**: `product/product-manager.md`
**Output**: PRD ב-`docs/prds/<phase>-<feature-name>.md`

**Checklist**:
- [ ] Problem statement ברור
- [ ] User stories (3-5)
- [ ] Acceptance criteria (Given/When/Then)
- [ ] Out of scope מוגדר
- [ ] Success metrics
- [ ] Dependencies זוהו

**Handoff**: PRD גמור → UX Designer

---

### Stage 2: UX Design (ux-designer, 30-60 min)
**Trigger**: PRD approved
**מי**: `product/ux-designer.md`
**Output**: Wireframes (Excalidraw) + component list

**Checklist**:
- [ ] User flow diagram
- [ ] Wireframes לכל מסך
- [ ] Empty / Loading / Error states לכל מסך
- [ ] Mobile + Desktop (אם שונים)
- [ ] Component list מ-shadcn
- [ ] Design tokens מ-design system בלבד

**אם רלוונטי לעברית** → להתייעץ עם `hebrew-rtl-expert` על copy

**Handoff**: Wireframes → Backend (במקביל) + Frontend

---

### Stage 3: Backend Foundation (backend-engineer, 1-3 hours)
**Trigger**: PRD + wireframes
**מי**: `disciplines/backend-engineer.md`
**Output**: Migration + RLS + Edge Functions + TS types

**Checklist**:
- [ ] Schema design — להתייעץ עם domain experts רלוונטיים
  - אם billing/orders → `saas-billing-expert`
  - אם pets/products → `pet-nutrition-expert`
  - אם shipping → `israeli-logistics-expert`
- [ ] Migration files
- [ ] RLS policies — בדיקה: tenant A ≠ tenant B
- [ ] Edge Functions אם business logic
- [ ] TypeScript types generated
- [ ] Tests for RLS + business logic

**Handoff**: Schema + endpoints → Frontend Engineer + Integrations Engineer (אם רלוונטי)

---

### Stage 4: Integrations (integrations-engineer, אם נדרש)
**Trigger**: יש שירות חיצוני בפיצ׳ר
**מי**: `disciplines/integrations-engineer.md`
**Output**: Webhook handlers + API clients + retry logic

**אם רלוונטי**:
- [ ] WhatsApp → להתייעץ עם `hebrew-rtl-expert` ל-templates
- [ ] Payment → להתייעץ עם `saas-billing-expert`
- [ ] Shipping → להתייעץ עם `israeli-logistics-expert`

**Checklist**:
- [ ] Idempotency keys
- [ ] Retry logic (exponential backoff)
- [ ] Signature verification
- [ ] DLQ table
- [ ] Health check endpoint
- [ ] Runbook לכשלון

**Handoff**: Endpoints + types → Frontend

---

### Stage 5: Frontend Implementation (frontend-engineer, 2-6 hours)
**Trigger**: Backend ready + wireframes
**מי**: `disciplines/frontend-engineer.md`
**Output**: React components + pages + state

**Checklist**:
- [ ] Components לפי wireframes
- [ ] React Query לכל data fetching
- [ ] Loading/Empty/Error states
- [ ] Form validation עם Zod
- [ ] RTL — להתייעץ עם `hebrew-rtl-expert` על copy
- [ ] Mobile responsive
- [ ] Accessibility (focus, labels, contrast)
- [ ] Performance — Lighthouse > 90

**Handoff**: PR ל-QA

---

### Stage 6: AI/ML (אם רלוונטי — Phase 2+)
**Trigger**: הפיצ׳ר כולל prediction / recommendation / NLP
**מי**: `disciplines/ai-ml-engineer.md`
**Output**: Prompts + models + cost estimate

**Checklist**:
- [ ] התחל rule-based, ML רק אם הוכח שלא מספיק
- [ ] Prompt caching מוגדר
- [ ] Cost estimate
- [ ] Eval set (20+ דוגמאות)
- [ ] Fallback אם API down
- [ ] PII redaction לפני שליחה ל-LLM

---

### Stage 7a: QA (qa-engineer, 30-90 min)
**Trigger**: כל הקוד גמור
**מי**: `disciplines/qa-engineer.md`
**Output**: Test report + bug list + ship/no-ship decision

**Checklist בסיסי**:
- [ ] Happy path
- [ ] 3+ sad paths
- [ ] Boundary values
- [ ] RTL / mobile / accessibility
- [ ] Performance

**Handoff**:
- Pass → Stage 7b (Code Review)
- Fail → חזרה ל-discipline שאחראי

### Stage 7b: Code Review (code-reviewer, 20-45 min)
**Trigger**: QA pass
**מי**: `disciplines/code-reviewer.md`
**Output**: Review comments + approved/changes-requested

**Checklist**:
- [ ] Architecture consistency
- [ ] Readability & naming
- [ ] No N+1 / performance smells
- [ ] Error handling complete
- [ ] Tests adequate
- [ ] No dead code / duplication

**Handoff**:
- Approved + Low/Medium-risk → Stage 8 (Deploy)
- Approved + High-risk → Stage 7c (Security)
- Changes requested → חזרה ל-discipline

### Stage 7c: Security Review (security-engineer, 30-60 min) — חובה ל-High-risk
**Trigger**: Code review approved + risk = High
**מי**: `disciplines/security-engineer.md`
**Output**: Security report + ship/no-ship

**Checklist**:
- [ ] Threat model updated
- [ ] RLS deep-dive (multi-tenant isolation 2+ scenarios)
- [ ] Secrets management
- [ ] PII handling (logs, error messages)
- [ ] Webhook signatures verified
- [ ] Manual pen-test בסיסי
- [ ] GDPR compliance (אם רלוונטי)

**Handoff**:
- Pass → Stage 8 (Deploy)
- Fail → חזרה ל-relevant discipline + repeat 7a-7c

---

### Stage 8: Deploy (devops-engineer, 30 min)
**Trigger**: QA pass
**מי**: `disciplines/devops-engineer.md`
**Output**: Production deploy + monitoring

**Checklist**:
- [ ] Staging deploy first
- [ ] Smoke test by non-author
- [ ] Migration plan (אם schema change)
- [ ] Rollback procedure documented
- [ ] Monitoring alerts configured
- [ ] Cost impact estimated
- [ ] Production deploy
- [ ] Post-deploy health check (15 min)

**Handoff** → Stage 8.5 (Docs Keeper)

---

### Stage 8.5: Documentation (docs-keeper, 5-10 min) — **אוטומטי, חובה**
**Trigger**: Deploy הצליח
**מי**: `disciplines/docs-keeper.md`
**Output**: Records ב-Notion (Tasks DB + ADR אם רלוונטי)

**Checklist**:
- [ ] צור Task record ב-Notion עם status=Done, Phase, Discipline, Module, Risk, files touched
- [ ] אם התקבלו החלטות ארכיטקטוניות במהלך → ADR records
- [ ] קישור ל-PR
- [ ] אם דרך הפיצ׳ר התגלה bug — Bug record

**Handoff** → Orchestrator לסיכום

---

### Stage 9: Wrap-up (Orchestrator, 5 min)
**Output**: סיכום ל-user

```markdown
## ✅ פיצ׳ר X הושלם

### מה נוצר
- [קבצים מרכזיים]

### Phase status
- [X / 13 מודולי MVP הושלמו]

### Metrics to watch (week 1)
- ...

### Open follow-ups
- ...
```

---

## תרחישי חריגה

### "המשתמש דחוף, אין זמן ל-PRD"
- ה-Orchestrator שואל: האם low/medium/high risk?
- Low → אפשר לדלג PRD, רק acceptance criteria בצ׳אט
- Medium/High → לא לדלג. גם 15 דקות PRD חוסך 5 שעות פיתוח לא נכון

### "התגלה צורך באמצע — צריך עוד פיצ׳ר"
- לעצור. לא לעשות scope creep.
- ה-PM פותח PRD חדש לזה.
- מסיים את הפיצ׳ר הנוכחי קודם.

### "Backend ו-Frontend נתקעו על איך לתקשר"
- ה-Orchestrator מתערב.
- שניהם מציעים API contract.
- ה-PM/Orchestrator מחליט.
- Backend מיישם.

---

## עקרונות מפתח
1. **אין דילוגים על stages** — גם אם נראה מהיר יותר
2. **Domain experts מוזמנים, לא דורסים** — discipline owns the code
3. **כשמשהו לא ברור — לעצור** — לא לנחש, לחזור ל-PM
4. **כל handoff = artifact** — מסמך/קוד/אבחנה, לא רק "סיימתי"
