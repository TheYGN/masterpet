# Workflow: Sprint Planning

> תרחיש לתכנון Sprint חדש (שבועיים) — מה נכלל, מי עובד על מה, מתי deploy.
> **מי משתמש בזה?** ה-Orchestrator, כשמתחילים מחזור פיתוח חדש.

## מתי להפעיל
- תחילת sprint חדש (כל שבועיים)
- אחרי שמסיימים פיצ׳ר גדול ויש זמן לתכנון הבא
- תכנון מ-MVP ל-Phase 2 (החלפה גדולה)

---

## Sprint duration
- **2 weeks** standard
- 9 ימי פיתוח (יום 1 = planning, יום 10 = retro)

---

## Stages

### Stage 1: Backlog Review (product-manager, 30 min)

**מטרה**: לסדר את הbacklog לפי עדיפות נכון לעכשיו

**Checklist**:
- [ ] קריאת עץ האפיון — איפה אנחנו ב-Phase
- [ ] רשימת כל המודולים שעדיין לא הושלמו ב-Phase הנוכחית
- [ ] רישום bugs פתוחים (P1+)
- [ ] רישום tech debt קריטי

**RICE scoring** לכל פריט שעולה לדיון:
```
Reach × Impact × Confidence / Effort
```

**Output**: רשימה מסודרת מ-1 ל-N של מועמדים לsprint

---

### Stage 2: Capacity Planning (Orchestrator + PM, 15 min)

**מטרה**: לדעת כמה אנחנו יכולים לעשות באמת

### Velocity reference (לפלטפורמה הזו)
| Item type | Story points (approx) | Time |
|-----------|----------------------|------|
| Simple UI change | 1 | 2-4h |
| New form/screen | 3 | 1-2 days |
| New module (small) | 8 | 3-5 days |
| New module (large) | 13 | 1-2 weeks |
| Integration | 8 | 3-5 days |
| Bug fix (small) | 1 | 1-3h |
| Bug fix (complex) | 5 | 1-2 days |

**Capacity rule**:
- 80% של זמן Sprint לעבודה מתוכננת
- 20% buffer ל-bugs, support, חזרות
- אם יחיד מפתח → max 30 story points / 2 weeks

---

### Stage 3: Sprint Goal (PM, 10 min)

**מטרה**: משפט אחד שמגדיר הצלחת ה-sprint

### דוגמאות טובות
✅ "להשלים את ה-Order Inbox מ-WhatsApp ולקבל הזמנה ראשונה במערכת"

✅ "לסיים את ה-Subscription engine כך שלקוח יכול להירשם, להיחיוב, ולקבל חשבונית"

### דוגמאות רעות
❌ "לעבוד על כמה דברים" — לא ספציפי

❌ "להתקדם ב-MVP" — לא מדיד

---

### Stage 4: Task Breakdown (Orchestrator, 30-60 min)

**לכל פיצ׳ר בsprint:**
- [ ] PRD קיים? אם לא → לבקש מ-PM יום 0
- [ ] Wireframe קיים? אם לא → ux-designer יום 0-1
- [ ] לפרק לtasks (3-8 hours כל אחד)
- [ ] לתייג discipline אחראי
- [ ] לתייג dependencies

### Task template
```markdown
## Task: [שם]
**Discipline**: backend / frontend / integrations / ...
**Domain experts needed**: [רשימה]
**Estimate**: X hours
**Dependencies**: [tasks שצריך להשלים קודם]
**Acceptance**:
- [ ] ...
- [ ] ...
```

---

### Stage 5: Risk Assessment (Orchestrator + QA, 15 min)

**מטרה**: לזהות מראש מה יכול להיתקע

**Checklist** לכל פיצ׳ר:
- [ ] תלות בצד שלישי? (API חיצוני, אישור מסוים)
- [ ] שינוי schema קריטי? (migration שיכול לקחת זמן)
- [ ] Domain knowledge חסר? (צריך לחקור FEDIAF / מס הכנסה)
- [ ] Performance risk? (queries כבדים, payload גדול)
- [ ] Security risk? (PII, billing)

**אם 2+ risks** — להוסיף buffer של 30%

---

### Stage 6: Sprint Commitment (כולם, 10 min)

**Final list** של פיצ׳רים+bugs ל-sprint.

**Sprint Plan output:**
```markdown
# Sprint X — [תאריך התחלה] עד [תאריך סיום]

## Goal
[משפט אחד]

## In scope
1. [Feature A] — [discipline] — X SP
2. [Feature B] — [discipline] — Y SP
3. [Bug #123] — [discipline] — Z SP
...

**Total**: N story points

## Out of scope (for awareness)
- [פיצ׳ר שביקשו אבל לא נכלל]
- [reason]

## Risks
- [risk]: [mitigation]

## Daily standup
[יום + שעה, אם צוות]

## Demo & retro
- Demo: יום 10 בבוקר
- Retro: יום 10 אחה״צ
```

---

## Daily check-in (Orchestrator, 5 min/day)

### שאלות
1. מה הושלם אתמול?
2. מה היעד היום?
3. יש blockers?

### Blockers — איך מטפלים
- Blocker → להעלות ב-channel/אמייל מיד
- אם blocker נמשך > 24h — הסקופ של המשימה צריך לעבור revision
- אם blocker בשרשרת תלויה — להזיז את המשימה לסוף sprint

---

## Demo (סוף sprint, 15-30 min)

**מטרה**: להראות מה נעשה, לא להציג בעיות

**פורמט**:
1. עבור על כל פיצ׳ר ב-list
2. הדגמה חיה (לא slides)
3. תוצאות מ-staging (לא prod)
4. מה לא הספקנו ולמה

---

## Retro (סוף sprint, 30 min)

### 4 שאלות
1. **Went well** — מה היה טוב, נמשיך
2. **Didn't go well** — מה לא עבד
3. **Surprised** — מה הפתיע אותנו
4. **Action items** — 1-3 שינויים ל-sprint הבא

### Actions — חוקים
- ספציפי: "PM יכתוב PRD לפני יום 0 של sprint" — לא "תכנון יותר טוב"
- אחראי ספציפי
- תאריך יעד

### תיעוד אוטומטי — `docs-keeper`
מיד אחרי הretro, ה-Orchestrator מפעיל **docs-keeper** שמתעד ב-Notion:

1. **Sprint Retros DB** — record חדש:
   - Sprint Number, Start/End Date, Sprint Goal
   - Goal Met (Yes Fully / Partially / No)
   - Velocity, Completion Rate
   - Went Well / Didn't Go Well / Surprised Us / Action Items
   - Bugs Introduced / Bugs Fixed
2. **Tasks DB** — עדכון tasks שהושלמו ל-`Done`, יצירת tasks חדשים ל-sprint הבא (`Backlog`/`Planning`)

---

## Sprint metrics (לעקוב)

| Metric | Target |
|--------|--------|
| Completion rate | 80%+ |
| Velocity stability | ±15% from average |
| Bugs introduced / fixed | 1:1 ratio |
| % time in unplanned work | < 25% |
| Cycle time (commit→deploy) | < 3 days for medium task |

אם יותר מ-25% מהזמן unplanned → תכנון לא טוב, צריך retro על זה.

---

## חוקים אדומים

- **לעולם לא** להוסיף פיצ׳ר חדש באמצע sprint (אלא אם P0)
- **לעולם לא** לעבור על capacity ב-100% — תמיד 80% עם buffer
- **לעולם לא** sprint בלי goal ברור
- **לעולם לא** לדלג על retro — שם אנחנו לומדים
- **תמיד** velocity tracking — אחרת לא תדע לתכנן sprint הבא
