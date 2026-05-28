---
name: masterpet-prd
description: |
  **ה-skill היחיד לכתיבת PRD בפרויקט MasterPet — מעדיף אותו על פני כל skill PRD גלובלי (prd, prd-generator, anthropic-skills:prd-generator).** צור PRD לפיצ'ר ב-MasterPet על ידי ראיון אינטראקטיבי עם המשתמש. ה-skill קורא את עץ האפיון של הפרויקט, מזהה את הפיצ'ר הרלוונטי, שואל שאלות ממוקדות, וכותב PRD מלא לתוך תיקיית `prd/` של הפרויקט. השתמש בו בכל פעם שמישהו מבקש PRD, מפרט, spec, או אפיון לפיצ'ר ב-MasterPet — גם אם הם לא כותבים את המילה PRD. Trigger: PRD ל, תכתוב מפרט, תאפיין את, spec עבור, תתכנן את מודול, מה צריך ל.
---

# MasterPet PRD — ראיון ויצירה

אתה יוצר PRD לפיצ'ר ב-MasterPet דרך שיחה קצרה עם המשתמש.

## שלב 0: קרא את עץ האפיון

**קרא תחילה:** `prd/feature-tree.md` — שם יש את כל הפיצ'רים, הפאזות, ה-stack, וה-4 רולים.

---

## שלב 1: זהה את הפיצ'ר

אם המשתמש ציין פיצ'ר ספציפי — תאמת שהבנת נכון ועבור לשלב 2.

אם לא ברור, שאל שאלה אחת:
> "איזה מודול/פיצ'ר תרצה לאפיין? (לדוגמה: Order Inbox, CRM, מלאי, Loyalty, שליחים, Notifications...)"

---

## שלב 2: ראיון ממוקד — 3-5 שאלות בלבד

שאל את השאלות הרלוונטיות לפיצ'ר הספציפי. **אל תשאל על מה שכבר מוגדר בעץ האפיון.** שאל רק על מה שחסר:

### שאלות ליבה לכל פיצ'ר:

1. **Scope** — מה *בתוך* האפיון הזה ומה *בחוץ*? (מה אתה רוצה בגרסה הנוכחית)
2. **רול עיקרי** — מי המשתמש הראשי? (בעל עסק / מנהל סניף / עובד מכירות / מנהל מחסן)
3. **Flow עיקרי** — תאר בשניים-שלושה משפטים את הזרימה שאתה מדמיין — מה המשתמש עושה צעד אחר צעד
4. **פרטים טכניים** — יש לך כבר schema, mockups, או דרישות ספציפיות שחייבות להיות בפיצ'ר?
5. **קריטריון הצלחה** — איך תדע שזה עובד טוב? (מה הדבר הכי חשוב שהפיצ'ר חייב לעשות נכון)

**כלל:** שאל רק מה שצריך. אם הפיצ'ר פשוט — 3 שאלות מספיקות. לעולם לא יותר מ-5 שאלות.

---

## שלב 3: כתוב PRD מלא

לאחר קבלת התשובות, כתוב PRD מלא ב-Markdown לפי התבנית הבאה:

```markdown
# PRD: [שם הפיצ'ר]

**פאזה:** [MVP / Phase 2 / Phase 3]
**תאריך:** [היום]
**סטטוס:** Draft

---

## 1. סקירה כללית
[פסקה אחת: מה הפיצ'ר עושה ולמה הוא חשוב ל-MasterPet]

---

## 2. הבעיה שנפתרת

| | |
|---|---|
| **כאב** | [הבעיה הנוכחית] |
| **מצב קיים** | [איך זה מנוהל היום] |
| **מה יקרה אם לא נבנה** | [השפעה] |

---

## 3. User Stories

### [רול ראשי]
- As a **[רול]**, I want to [פעולה] so that [תועלת].

### [רולים נוספים רלוונטיים]
- ...

---

## 4. Functional Requirements

| # | דרישה | עדיפות |
|---|---|---|
| FR-1 | [דרישה] | Must Have |
| FR-2 | [דרישה] | Should Have |
| FR-3 | [דרישה] | Nice to Have |

---

## 5. UI/UX

- **כיוון:** RTL, עברית
- **Routes (Next.js App Router):**
  - `app/(dashboard)/[path]/page.tsx` — [תיאור]
- **shadcn/ui Components:** [DataTable / Sheet / Dialog / Form / Tabs / Card / Badge / ...]
- **Flow עיקרי:**
  1. [צעד 1]
  2. [צעד 2]
  3. [צעד 3]
- **Empty State:** [מה רואים כשאין דאטה]

---

## 6. Technical Spec

### DB Schema (Supabase)

```sql
CREATE TABLE [table_name] (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id  UUID        NOT NULL REFERENCES tenants(id),
  -- עמודות ספציפיות לפיצ'ר
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE [table_name] ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation" ON [table_name]
  FOR ALL USING (tenant_id = (auth.jwt() ->> 'tenant_id')::UUID);
```

### Edge Functions

| Function | Trigger | מטרה |
|---|---|---|
| `fn-[name]` | HTTP POST | [מה היא עושה] |

### Frontend Components

| Component | Path | מטרה |
|---|---|---|
| `[Name]` | `app/[path]/[file].tsx` | [מה הוא עושה] |

---

## 7. Acceptance Criteria

- [ ] [קריטריון ספציפי וניתן לבדיקה]
- [ ] RLS מאומת — tenant A לא יכול לגשת לדאטה של tenant B
- [ ] RTL נכון בעברית בכל ה-breakpoints
- [ ] 4 הרולים נבדקו — הרשאות נכונות לכל רול
- [ ] Mobile responsive (min 375px)
- [ ] Empty state + Loading state + Error state מטופלים

---

## 8. פאזה ואומדן

| | |
|---|---|
| **פאזה** | MVP / Phase 2 / Phase 3 |
| **Sprint** | [ספרינט X, חודש Y] |
| **Frontend** | ~X ימים |
| **Backend** | ~X ימים |
| **סה"כ** | ~X ימים |

---

## 9. תלויות

- **דורש:** [מה חייב להיות קיים לפני]
- **חוסם:** [מה לא יכול להתחיל לפני שזה מוכן]

---

## 10. סיכונים ושאלות פתוחות

| # | שאלה / סיכון | סטטוס |
|---|---|---|
| 1 | [שאלה] | פתוח |
```

---

## שלב 4: שמור את ה-PRD

שמור את הקובץ ל-path **יחסי** ל-cwd של הפרויקט:
```
prd/[NN-feature-name-kebab-case].md
```

כאשר `NN` הוא מספר ה-PRD הבא ברצף (קרא את `prd/_shared/work-queue.md` כדי לדעת את המספר האחרון).

לדוגמה:
- `prd/02-order-inbox.md`
- `prd/07-notifications.md`
- `prd/08-loyalty.md`

אם תיקיית `prd/` לא קיימת — צור אותה. אל תשתמש ב-absolute path עם שם משתמש (זה שובר portability ולעיתים גם שגוי — שם המשתמש בפרויקט הוא `yarin` ולא `Yarin Golan`).

---

## עקרונות כתיבה

**SQL אמיתי:** לא "צור טבלה" — תכתוב את ה-SQL עם שמות עמודות ו-RLS policy.
**Components ספציפיים:** לא "טבלה" — תכתוב `DataTable` עם shadcn/ui.
**RTL בכל מקום:** כל מסך, כל layout — עברית RTL.
**RLS בכל טבלה:** כל טבלה חדשה = tenant_id + RLS policy.
**4 רולים תמיד:** חשוב איך כל רול מקיים אינטראקציה שונה עם הפיצ'ר.
