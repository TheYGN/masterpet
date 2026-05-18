# Workflow: Bug Fix

> תרחיש מוכן לתיקון באג — מ-report ועד deploy.
> **מי משתמש בזה?** ה-Orchestrator, כשמשתמש מדווח על באג.

## מתי להפעיל
- משהו "לא עובד" / "שבור" / "נעלם" / "מציג שגיאה"
- behavior שלא תואם spec
- regression — עבד ועכשיו לא

## מתי **לא** להפעיל
- "אני רוצה לשנות איך זה עובד" → זה feature request, לא bug
- "זה איטי" → performance issue, ייתכן workflow אחר
- "אני לא מבין איך זה עובד" → UX issue / training, לא bug

---

## Stages

### Stage 0: Triage (Orchestrator, 2-10 min)

**שאלות חובה למשתמש לפני שמתחילים:**

1. **Reproduce steps** — מה בדיוק עשית?
2. **Expected** — מה ציפית שיקרה?
3. **Actual** — מה קרה בפועל?
4. **Environment** — dev / staging / prod? איזה browser/mobile?
5. **First seen** — מתי התחיל? אחרי deploy מסוים?
6. **Frequency** — תמיד? לפעמים? עכשיו ראשון?
7. **Severity** — האם זה חוסם משתמשים? כמה?

### Severity matrix

| Severity | קריטריון | Response time |
|----------|---------|---------------|
| **P0 - Critical** | Production down, data loss, security breach | מיידי. עוצרים הכל. |
| **P1 - High** | פיצ׳ר ראשי לא עובד, > 50% users impacted | תוך 24h |
| **P2 - Medium** | באג שיש workaround, < 50% users | סוף השבוע |
| **P3 - Low** | cosmetic, edge case, single user | backlog |

---

### Stage 1: Investigation (qa-engineer, 15-60 min)

**מי**: `disciplines/qa-engineer.md`
**מטרה**: לזהות root cause, לא רק symptom

**Checklist**:
- [ ] Reproduced locally
- [ ] בלגים — error logs, network tab, Supabase logs
- [ ] Diff מ-last working version (`git log` אם קיים)
- [ ] בדיקה: האם קיימים באגים דומים אחרים?

**Output**: Investigation report
```markdown
## Bug Investigation

**Bug**: [תיאור]
**Reproduced**: Yes / No
**Root cause area**: Frontend / Backend / Integration / Schema / Other
**Suggested owner**: <discipline>
**Severity confirmed**: P0/P1/P2/P3
**Related bugs**: [אם יש]

### Reproduction
1. ...

### Findings
- ...

### Suggested fix approach
- ...
```

**Handoff**: לפי `Suggested owner`

---

### Stage 2: Fix (discipline relevant, 30 min - several hours)

**מי**: לפי root cause area
- Schema/data → `backend-engineer`
- API/business logic → `backend-engineer`
- UI/state → `frontend-engineer`
- External service → `integrations-engineer`
- Performance/infra → `devops-engineer`

**אם השינוי נוגע ב-domain** — להתייעץ עם domain expert לפני!

**Checklist**:
- [ ] Reproduced the bug (לוודא שאני באמת מתקן את הדבר הנכון)
- [ ] Wrote a failing test תחילה (אם זה bug בקוד עם tests)
- [ ] Fixed the bug
- [ ] Test עובר
- [ ] בדקתי שלא שברתי משהו אחר (related areas)
- [ ] עדכון comment / docs אם הfix לא טריוויאלי

### Anti-patterns
- ❌ **"זה תיקון מהיר"** — אם זה באמת מהיר, הוא חייב להיות הימור-קל-לבדיקה. אם לא, זה לא מהיר.
- ❌ **Hide the symptom** — `try/catch` עם empty handler במקום למצוא את הroot cause
- ❌ **No test** — אם הbug קרה פעם, הוא יקרה שוב. test הוא הגנה.
- ❌ **Touch unrelated code** — בtgu לעשות refactoring באמצע bug fix

---

### Stage 3: Regression Testing (qa-engineer, 15-30 min)

**מי**: `disciplines/qa-engineer.md`

**Checklist**:
- [ ] התיקון עובר את ה-reproduction steps
- [ ] הbug המקורי אינו חוזר
- [ ] Edge cases של אותו פיצ׳ר עדיין עובדים
- [ ] Features קרובים (אותו מודול) עדיין עובדים
- [ ] Performance לא נפגע

**אם P0/P1** — בנוסף:
- [ ] **security-engineer** review מהיר (אם הtikun נוגע ב-auth/RLS/billing/PII)
- [ ] **code-reviewer** pass — לוודא שהfix לא הכניס regressions אחרים
- [ ] Audit log שומר את ה-fix event

---

### Stage 4: Deploy (devops-engineer, 15-30 min)

**מי**: `disciplines/devops-engineer.md`

**P0 — Emergency deploy:**
- Skip staging אם בטוח (rare)
- Direct hotfix branch → prod
- Notify all stakeholders immediately
- Post-mortem חובה אחרי

**P1/P2 — Normal deploy:**
- Staging deploy → smoke test → prod
- בpattern standard

**Output**: Deploy confirmation + monitoring check

---

### Stage 4.5: Documentation (docs-keeper, 5-10 min) — **אוטומטי, חובה**
**Trigger**: Deploy הצליח
**מי**: `disciplines/docs-keeper.md`
**Output**: Bug record ב-Notion

**Checklist**:
- [ ] צור Bug record ב-Notion DB:
  - Title, Severity, Status=Fixed
  - Type (Bug/Incident/Security/Performance/Data Issue)
  - Module
  - Reported Date + Fixed Date
  - Symptom (מה ראה המשתמש)
  - **Root Cause** — חובה, לא רק symptom
  - Fix Summary
  - **Prevention** — מה מונע חזרה
  - Tests Added (paths)
  - Affected Users (number)
  - PR Link
- [ ] אם הfix הוביל ל-ADR → צור Decision record גם

**Handoff** → Orchestrator לסיכום

---

### Stage 5: Wrap-up (Orchestrator, 5 min)

```markdown
## 🐛 Bug Fix — [bug title]

**Severity**: Px
**Fixed in**: [commit/PR]
**Root cause**: [תיאור קצר]
**Prevention**: [מה עשינו כדי שזה לא יקרה שוב — test/check/process]

### Affected
- [users / features / data]

### Test coverage added
- [tests חדשים שנוספו]
```

---

## P0 Incident Protocol (Production Down)

### תוך 5 דקות
1. **Acknowledge** — מי טיפול? תיוג ב-Slack/channel
2. **Communicate** — status page update: "Investigating"
3. **Triage** — האם זה data loss? security? UX?

### תוך 15 דקות
4. **Stop the bleeding** — אם אפשר, mitigate (feature flag off, rollback)
5. **Investigate** — root cause בעבודה

### תוך שעה
6. **Fix or workaround** — או תיקון מלא, או workaround עם eta
7. **Communicate** — status page update עם estimated resolution

### תוך 24 שעות אחרי
8. **Post-mortem**:
   - מה קרה?
   - מה הoot cause?
   - איך זיהינו?
   - איך פתרנו?
   - **What we'll do differently**: actions שיינקטו כדי שזה לא יחזור

---

## חוקים אדומים

- **לעולם לא** "אני אבדוק את זה אחר כך" על P0/P1 — תקן עכשיו
- **לעולם לא** quick fix בלי לבדוק את ה-root cause
- **לעולם לא** commit עם הודעה "fixed bug" בלי לציין איזה ולמה
- **לעולם לא** ban a user ל-mitigate באג שמשפיע עליהם — תקן את הbug
- **תמיד** add a test for the bug — even if simple
