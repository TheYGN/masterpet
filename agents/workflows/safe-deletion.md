# Workflow: מחיקה בטוחה (Safe Deletion)

**מתי להשתמש:** כל מחיקה של פיצ'ר, מודול, טבלה, קומפוננטה, route, או קובץ שיש לו יותר מ-2 הפניות בקוד.

**מתי לא:** מחיקת קוד מת ברור (משתנה לא בשימוש בתוך פונקציה אחת, קובץ scratch, console.log). שם פשוט מוחקים.

**Risk:** כמעט תמיד **High** — מחיקה לא נכונה שוברת build, יוצרת 404, גורמת ל-RLS לקרוס, או מאבדת דאטה של לקוחות.

---

## עיקרון הזהב

> **לפני שאתה מוחק שורת קוד אחת — תמפה את כל ההפניות. לפני שאתה מאשר — תקבל אישור מפורש מהמשתמש.**

מחיקה היא פעולה הרסנית. גם אם git שומר היסטוריה, השחזור עולה זמן ובלגן. **המטרה: 0 הפניות יתומות אחרי המחיקה.**

---

## 5 שלבים — חובה לכולם

### שלב 1 — MAP (מיפוי מלא של הפניות)

לפני שאתה מוחק *משהו*, חפש את כל ההפניות אליו. השתמש ב-`Grep` עם השאילתות הבאות:

#### מחיקת קומפוננטה / קובץ
```
Grep pattern: <ComponentName>           — JSX/TSX usages
Grep pattern: from ['"].*<file-name>    — imports
Grep pattern: <file-name>               — references in tests, configs, docs
```

#### מחיקת טבלת DB / עמודה
```
Grep pattern: <table_name>              — SQL, migrations, types
Grep pattern: <column_name>             — queries, Edge Functions, types
Grep pattern: <table_name> (ב-prd/)     — PRDs שמסתמכים על הטבלה
```

בדוק גם ב:
- `prd/_shared/data-model.md` — האם הישות מתועדת
- `prd/_shared/glossary.md` — האם המונח מתועד
- כל `prd/NN-*.md` — האם PRD כלשהו מצטט את הישות
- `app/` — routes / pages / API routes
- `components/` — קומפוננטות
- `lib/` / `utils/` — helpers
- `types/` — TypeScript types
- `__tests__/` או `*.test.ts` — tests
- `supabase/migrations/` — migrations קודמים
- `supabase/functions/` — Edge Functions
- `.env*` — env vars
- `next.config.js`, `middleware.ts` — config
- `agents/` — האם סוכן מצטט את הישות

#### מחיקת route
```
Grep pattern: <route-path>              — links, redirects, navigation
Grep pattern: router.push.*<route>      — programmatic navigation
Grep pattern: redirect.*<route>         — middleware redirects
```

#### מחיקת Edge Function
```
Grep pattern: <fn-name>                 — frontend fetches
Grep pattern: supabase.functions.invoke  — לוודא שאף fetch לא יישבר
```

**פלט שלב 1:** רשימה ממוספרת של כל הקבצים וההפניות. אם יש 0 הפניות — אפשר למחוק חופשי. אם יש N>0 — עבור לשלב 2.

---

### שלב 2 — CONFIRM (אישור מפורש מהמשתמש)

**אסור** להתחיל למחוק לפני שהמשתמש ראה את הרשימה ואישר.

הצג למשתמש:

```markdown
## תוכנית מחיקה של <שם הישות>

### מצאתי X הפניות במקומות הבאים:

1. `path/file1.ts:23` — <מה שם>
2. `path/file2.tsx:45` — <מה שם>
3. `prd/02-crm.md` — מצטט ב-FR-3
4. `prd/_shared/data-model.md` — טבלה <name> בסעיף Y
5. ...

### תוכנית טיפול בכל הפניה:

| # | מיקום | פעולה |
|---|---|---|
| 1 | path/file1.ts:23 | להסיר את ה-import + הקריאה |
| 2 | path/file2.tsx:45 | להחליף ב-X |
| 3 | prd/02-crm.md | לעדכן FR-3 → ... |
| 4 | data-model.md | למחוק שורה |

### השפעות צפויות:
- Build: <יישבר / לא יישבר>
- DB: <נדרש migration / לא>
- לקוחות קיימים: <אין / יש — לאיזה data>
- מסכים שיעלמו: <list>

### בלתי-הפיכות:
- [ ] יש דאטה production שתימחק? <כן/לא>
- [ ] יש משתמשים שמשתמשים בפיצ'ר עכשיו? <כן/לא>

**מאשר את התוכנית? (כן / לא / שנה X)**
```

**רק אחרי "כן" מפורש — עבור לשלב 3.**

---

### שלב 3 — CASCADE (סדר המחיקה — חובה)

מחיקה לא רנדומלית. הסדר חשוב כדי שה-build לא יישבר באמצע:

```
1. Tests        — להסיר tests של הישות הנמחקת (אחרת ייכשלו)
2. Imports      — להסיר imports בקבצים אחרים (לפני שמוחקים את הקובץ עצמו)
3. Usages       — להסיר את השימושים בקוד (קריאות פונקציה, JSX, וכו')
4. Component / File — למחוק את הקובץ עצמו
5. Types        — להסיר types/interfaces קשורים
6. Routes       — להסיר מ-navigation, מ-middleware, מ-redirects
7. API / Edge   — למחוק Edge Functions אם רלוונטי
8. DB           — migration למחיקת טבלה/עמודה (תמיד אחרון!)
9. PRD          — לסמן את ה-PRD כ-Deprecated (לא למחוק — לארכיון)
10. _shared/    — עדכון data-model.md + glossary.md
11. סוכנים      — אם סוכן מצטט — לעדכן
```

#### חוקי DB חשובים

- **לעולם לא** `DROP TABLE` בלי לבדוק אם יש דאטה production.
- אם יש דאטה — תחילה `ALTER TABLE <name> RENAME TO <name>_deprecated_YYYYMMDD`, להמתין סבב, אז למחוק.
- **לעולם לא** למחוק עמודה ב-migration שכבר רץ ב-production. תמיד migration חדש.
- אם יש `ON DELETE CASCADE` — הבן בדיוק מה עוד יימחק.

#### חוקי PRD חשובים

- **לא למחוק PRDs**, גם אם הפיצ'ר מבוטל. שנה את ה-status:
  ```
  **סטטוס:** Deprecated (בוטל ב-YYYY-MM-DD, סיבה: X)
  ```
- PRD הוא היסטוריה. למחוק אותו = למחוק למה החלטנו לבטל.

---

### שלב 4 — VERIFY (אימות שאין יתומים)

אחרי המחיקה, **חובה** להריץ:

1. **Build / Typecheck:**
   ```
   npm run build       — חייב לעבור
   npm run typecheck   — חייב לעבור (אם מוגדר)
   ```
2. **Grep חוזר** — חזור על השאילתות משלב 1. **חייב להחזיר 0 תוצאות** (חוץ מקובץ migration של המחיקה עצמה, ומה-PRD שסומן Deprecated).
3. **Test suite:**
   ```
   npm test            — חייב לעבור (tests שמתאימים לישויות שנשארו)
   ```
4. **Manual smoke test:**
   - הרץ את ה-dev server
   - גלוש לפיצ'רים קשורים (לא רק לפיצ'ר שנמחק)
   - בדוק שאין 404, שאין error ב-console
5. **DB:** אם רץ migration — בדוק עם `list_tables` ש-schema מעודכן ושאין FK שבור.

אם משהו מתוך 1-5 נכשל — **חזור לשלב 1**, יש הפניה שפיספסת.

---

### שלב 5 — DOCUMENT (תיעוד המחיקה)

מחיקה היא החלטה. תעד אותה:

1. **Commit message** ברור:
   ```
   Remove Loyalty module — deferred to Phase 2

   - Tables: loyalty_points, loyalty_tiers (renamed to *_deprecated_20260519)
   - Routes: /loyalty/*
   - PRD prd/05-loyalty.md marked Deprecated
   - References cleaned in 7 files
   ```
2. **`docs-keeper`** מתעד את ההחלטה ב-Notion Decisions DB (ADR):
   - מה נמחק
   - למה
   - מי החליט
   - תאריך
   - איך לשחזר (commit hash)
3. **עדכן `prd/_shared/data-model.md`** — סמן את הטבלאות שנמחקו בסעיף נפרד "טבלאות שהוסרו" (לא רק למחוק את השורה — היסטוריה חשובה).
4. **עדכן `prd/_shared/glossary.md`** — אם מונח כבר לא בשימוש, סמן `(deprecated)`.

---

## חוקים אדומים

1. **אסור למחוק בלי לבצע MAP מלא קודם.** לא משנה כמה אתה בטוח שאין הפניות.
2. **אסור למחוק בלי אישור מפורש מהמשתמש** (שלב 2). גם אם הוא ביקש "תמחק את X" — תציג קודם את הרשימה המלאה ותקבל אישור שוב.
3. **אסור DROP TABLE על דאטה production** בלי backup ושלב rename ביניים.
4. **אסור למחוק PRD** — תמיד Deprecated.
5. **אסור לקפוץ שלבים.** גם אם זה "ברור", עברי על כל 5.
6. **אם build נשבר אחרי מחיקה — אסור לעשות `--force` או `--skip-checks`.** תקן את הסיבה.

---

## דוגמאות

### דוגמה 1 — מחיקת קומפוננטה קטנה (Low Risk)
**משימה:** "מחק את `OldDatePicker` — עברנו ל-shadcn DatePicker"

```
שלב 1: Grep "OldDatePicker" → 3 hits: 2 imports + ה-file עצמו
שלב 2: הצגה: "3 הפניות בקבצים X, Y. החלפה ל-shadcn DatePicker. מאשר?"
שלב 3: imports → component file (סדר נכון)
שלב 4: build עבר, typecheck נקי, grep חוזר → 0
שלב 5: commit message, אין שינוי ב-DB / PRD
```

### דוגמה 2 — מחיקת מודול שלם (High Risk)
**משימה:** "מחק את כל Loyalty — דחינו ל-Phase 2"

```
שלב 1: Grep "loyalty" → 47 hits ב-23 קבצים, 3 טבלאות, PRD שלם, glossary
שלב 2: הצגת תוכנית מפורטת + השפעות + אישור מפורש
שלב 3: cascade מלא לפי הסדר — tests → imports → components → routes → tables → PRD → docs
שלב 4: build + smoke test + DB check
שלב 5: ADR ב-Notion, PRD marked Deprecated, data-model עודכן
```

### דוגמה 3 — מצב שדורש עצירה
**משימה:** "מחק את `customers` — לא צריך"

```
שלב 1: Grep "customers" → 280 hits, table עם 50K שורות production
⚠️ עצור. תחזור למשתמש:
"מצאתי 280 הפניות + 50K שורות production. זה הלב של המערכת.
האם בטוח שלא התכוונת ל-X? אם כן — צריך תוכנית data migration נפרדת."
```

---

## סוכנים שמופעלים

| Risk Level | מי מופעל |
|---|---|
| **Low** (קובץ אחד, 0-2 הפניות) | רק הסוכן שביקש המחיקה |
| **Medium** (קומפוננטה עם 3-10 הפניות) | discipline relevant + code-reviewer |
| **High** (מודול שלם, טבלת DB, route ראשי) | backend-engineer + code-reviewer + qa-engineer + docs-keeper |
| **Critical** (טבלה עם דאטה production / פיצ'ר עם משתמשים פעילים) | + security-engineer + legal-compliance-expert (אם PII) |

---

## Handoff

בסוף ה-workflow, סכם:

```markdown
## סיכום מחיקה: <שם>

✅ נמחק:
- <list מלא של קבצים/טבלאות/PRDs>

✅ מעודכן:
- prd/_shared/data-model.md
- prd/_shared/glossary.md
- <PRDs שהושפעו>

✅ אומת:
- build נקי
- typecheck נקי
- grep חוזר → 0 הפניות יתומות
- smoke test עבר

📝 commit: <hash + message>
📝 ADR: <Notion link>

🔄 לשחזור: git revert <hash> + restore migration <name>
```
