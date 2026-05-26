# PRD #4 — CSV/Excel Import Engine
## יעד ראשון: Products | יעד שני: Customers (PRD #5)

**פאזה:** MVP (Sprint 3-4)
**תאריך:** 2026-05-25
**סטטוס:** Draft

---

## 1. סקירה כללית

מנגנון ייבוא גנרי שמאפשר לכל בעל עסק להעלות קובץ CSV/Excel ממערכת קיימת (WooCommerce Export, גיליון Excel, מערכת ERP) ולמפות את עמודות הקובץ שלו לשדות MasterPet — בלי להקליד מוצרים ידנית אחד-אחד.

**הוא גנרי:** אותה תשתית משמשת לייבוא Products (עכשיו) ולייבוא Customers (PRD #5). ה"target" הוא פרמטר — המוד הראשון הוא `products`.

---

## 2. הבעיה שנפתרת

| | |
|---|---|
| **כאב** | בעל עסק עם 300 מוצרים ב-Excel לא מוכן להזין אותם ידנית. זה חסם כניסה אמיתי ל-MasterPet |
| **מצב קיים** | כפתור "ייבוא מ-Excel" קיים ב-`ProductsClient.tsx` (שורה 40–44) אבל לא מחובר |
| **מה יקרה אם לא נבנה** | Onboarding של לקוחות עם קטלוג קיים לוקח שעות — ויוותרו לפני שהם מתחילים |

---

## 3. User Stories

### בעל עסק (owner)
- As an **owner**, I want to upload my existing Excel product list so that I don't have to enter every product manually.
- As an **owner**, I want to map my column names to MasterPet fields so that my data lands in the right place.
- As an **owner**, I want to see a preview with errors highlighted before importing so that I don't pollute my catalog with bad data.
- As an **owner**, I want to save my column mapping for next time so that future imports are one-click.

---

## 4. Supported Formats

| פורמט | Library | הערות |
|-------|---------|-------|
| `.csv` | `papaparse` | UTF-8 + BOM. פסיק או נקודה-פסיק (auto-detect) |
| `.xlsx` | `xlsx` (SheetJS) | Excel 2007+ |
| `.xls` | `xlsx` (SheetJS) | Excel 97-2003 + פורמטים ישנים (xlc, xlm) — SheetJS מטפל בכולם |

> **המגבלה למשתמש:** עד 5,000 שורות ב-MVP. מעל זה — הודעת שגיאה + הצעה לפצל.

---

## 5. ה-Flow — 5 שלבים

### שלב 1 — File Upload
- כפתור "ייבוא מ-Excel" בדף Products פותח את ה-Modal
- `<input type="file" accept=".csv,.xls,.xlsx">` — parsing מתבצע **client-side** לפני כל שליחה לשרת
- אחרי בחירת קובץ: parsing אוטומטי עם papaparse/SheetJS

### שלב 2 — Preview Table (הקובץ כמו שהוא)
- מציג את ה-rows הראשונות (עד 10) כטבלה
- שמות עמודות כפי שהם בקובץ הלקוח — אין עיבוד עדיין
- מספר שורות כולל מוצג

### שלב 3 — Field Mapping
- מעל כל עמודה: `<select>` עם רשימת שדות MasterPet (ראה סעיף 6)
- ערך ברירת מחדל: "לא לייבא" (skip)
- **Mapping Templates**: אם יש template שמור לטנאנט — טוענים אוטומטית וממפים מה שאפשר
- כפתור "שמור מיפוי לשימוש חוזר" → שומר את ה-mapping הנוכחי בשם שהמשתמש בוחר

### שלב 4 — Validation (client-side Dry-run)
- לאחר אישור המיפוי: הרצת validation על כל שורות הקובץ
- שורות עם שגיאה מסומנות באדום בטבלת Preview עם tooltip של הסיבה
- שורות תקינות — ירוק
- Summary: "X שורות תקינות, Y עם שגיאות — רק התקינות יובאו"
- **לא חוסם**: המשתמש יכול לייבא את השורות התקינות תוך כדי שהשגיאות מדולגות

### שלב 5 — Import + Confirmation
- כפתור "ייבא X מוצרים"
- Server Action `importProductsAction` מקבל מערך של שורות תקינות
- Insert מקובץ לפי הסכמה הקיימת (product + variant + inventory לסניף הראשי)
- Rollback ידני: אם INSERT של אחת השורות נכשל בשרת → מדלגים + מוסיפים ל-error log
- בסיום: toast "יובאו X מוצרים בהצלחה. Y נכשלו (ראה דוח)"
- דוח שגיאות: טבלה קולפסיבית מתחת ל-toast עם שורות שנכשלו + סיבה

---

## 6. שדות מיפוי — Products (target fields)

### שדות המוצר (Product)

| שם בממשק | target field | type | required | validation |
|-----------|-------------|------|----------|-----------|
| שם מוצר | `product.name` | TEXT | ✅ | אורך ≥ 2 |
| תיאור | `product.description` | TEXT | | |
| סוג חיה | `product.animal_type` | TEXT | | אחד מ: `dog/cat/rodent/bird/fish/reptile/other`. לא מוכר → `other` |
| קבוצת גיל | `product.age_group` | TEXT | | אחד מ: `puppy/adult/senior/all`. לא מוכר → `all` |
| סוג דיאטה | `product.diet_type` | TEXT | | אחד מ: `regular/grain_free/hypoallergenic/super_premium/therapeutic`. לא מוכר → `regular` |
| שם ספק | `product.supplier_name` | TEXT | | |
| מע"מ% | `product.vat_rate` | NUMERIC | | מספר 0-100. ברירת מחדל: 18 |
| תגיות | `product.tags` | TEXT[] | | מופרדות בפסיק: "מבצע, מומלץ" → `["מבצע","מומלץ"]` |

### שדות הVariant (Variant — כל שורה = Variant אחד)

| שם בממשק | target field | type | required | validation |
|-----------|-------------|------|----------|-----------|
| SKU | `variant.sku` | TEXT | ✅ | אורך ≥ 1. UNIQUE check לפני insert (skip duplicate + error) |
| ברקוד | `variant.barcode` | TEXT | | |
| מק"ט פנימי | `variant.internal_code` | TEXT | | |
| מחיר (ללא מע"מ) | `variant.price` | NUMERIC | ✅ | מספר ≥ 0 |
| מחיר עלות | `variant.cost_price` | NUMERIC | | מספר ≥ 0 |
| יחידה | `variant.unit` | TEXT | | אחד מ: `unit/kg/liter/pack`. לא מוכר → `unit` |
| משקל ק"ג | `variant.weight_kg` | NUMERIC | | מספר ≥ 0 |
| סטטוס | `variant.status` | TEXT | | `active/inactive`. לא מוכר → `active` |

### שדות מלאי (Inventory — לסניף הראשי בלבד)

| שם בממשק | target field | type | required | validation |
|-----------|-------------|------|----------|-----------|
| כמות במלאי | `inventory.qty` | NUMERIC | | מספר ≥ 0. ברירת מחדל: 0 |
| סף מלאי נמוך | `inventory.reorder_level` | NUMERIC | | מספר ≥ 0. ברירת מחדל: 0 |

> **הגדרת Row:** כל שורה = מוצר אחד + Variant אחד ("flat import"). אם שתי שורות מגיעות עם אותו שם מוצר — הן ייובאו כ-2 מוצרים נפרדים (MVP). Grouping לVariants מרובים = P2.

---

## 7. Mapping Templates

### DB Schema

```sql
CREATE TABLE import_mapping_templates (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  target      TEXT NOT NULL, -- 'products' | 'customers'
  mapping     JSONB NOT NULL, -- {"source_column_name": "target_field", ...}
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, name, target)
);

ALTER TABLE import_mapping_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE import_mapping_templates FORCE ROW LEVEL SECURITY;

CREATE POLICY import_mapping_templates_tenant_isolation
  ON import_mapping_templates
  FOR ALL
  USING (tenant_id = current_tenant_id())
  WITH CHECK (tenant_id = current_tenant_id());
```

### Server Actions

| Action | הרשאה | מה עושה |
|--------|-------|---------|
| `importProductsAction` | owner | מקבל `ValidatedRow[]`, מכניס לDB, מחזיר `{ imported, failed, errors }` |
| `saveImportMappingAction` | owner | שומר/מעדכן mapping template |
| `getImportMappingsAction` | owner | מחזיר כל templates של `target='products'` לטנאנט |

---

## 8. Functional Requirements

| # | דרישה | עדיפות |
|---|---|---|
| FR-1 | תמיכה ב-CSV, XLS, XLSX — parsing client-side | Must Have |
| FR-2 | Preview: 10 שורות ראשונות + מספר שורות כולל | Must Have |
| FR-3 | Field Mapping Dropdowns — כל עמודה ניתנת למיפוי לשדה MasterPet או "לא לייבא" | Must Have |
| FR-4 | Validation client-side: שדות required + type + enum + duplicate SKU | Must Have |
| FR-5 | שורות שגיאה מסומנות בטבלה + tooltip עם סיבה | Must Have |
| FR-6 | Import רק שורות תקינות — שגיאות מדולגות | Must Have |
| FR-7 | Toast + דוח שגיאות בסיום | Must Have |
| FR-8 | Inventory מיובאת לסניף הראשי (default branch של הטנאנט) | Must Have |
| FR-9 | Mapping Templates — שמירה + טעינה אוטומטית | Must Have |
| FR-10 | מגבלת 5,000 שורות — שגיאה + הנחיה לפצל | Must Have |
| FR-11 | חיבור כפתור "ייבוא מ-Excel" ב-`ProductsClient.tsx` | Must Have |
| FR-12 | writeAudit: `data.imported` אחרי כל import מוצלח | Should Have |
| FR-13 | UI RTL, עברית מלאה | Must Have |

---

## 9. Non-Functional Requirements

- **Parsing:** תמיד client-side. אין upload לשרת לפני אישור המשתמש
- **גודל קובץ:** עד ~10MB client-side (5,000 שורות × ~2KB בממוצע). גדול מזה — שגיאה
- **Performance:** Parsing + validation של 1,000 שורות — פחות מ-500ms
- **Memory:** שימוש ב-streaming אם SheetJS + PapaParse תומכים — לא לטעון את כל הקובץ ל-state אם אפשר להימנע
- **Security:** XSS — sanitize כל value לפני render בטבלה. אין eval של תוכן הקובץ

---

## 10. Out of Scope (MVP)

- Grouping שורות לProduct אחד עם Variants מרובים (P2)
- AI Mapping — הצעות אוטומטיות לפי שם עמודה (P2)
- ייבוא מתוזמן / Google Sheets URL (P2)
- ייבוא תמונות מוצר (P2)
- Inventory לסניפים מרובים בתוך קובץ אחד (P2)
- ~~Update מוצרים קיימים על בסיס SKU (P2)~~ → **הוקדם ל-MVP (2026-05-25)**: מממומש ב-`importProductsAction` עם `conflictStrategy: 'skip' | 'merge' | 'replace'`. ראה `actions.ts` ו-`ImportModal.tsx`.
- כפילויות intra-file (אותו SKU פעמיים בקובץ) — ~~P2~~ → **הוקדם ל-MVP (2026-05-25)**: `DuplicateDialog` מציג את הקבוצות ומאפשר למשתמש לבחור ידנית / ראשון / אחרון.

---

## 11. Audit Actions

| Action | תיאור |
|--------|-------|
| `data.imported` | כמה שורות יובאו, לאיזה entity, כמה נכשלו |

הוסף ל-`data-model.md` תחת `Audit Actions`.

---

## 12. Dependencies

- **PRD #3 (Products):** schema קיים ב-DB — `products`, `product_variants`, `product_inventory`, `branches`
- **npm packages:** `papaparse`, `xlsx`, `@types/papaparse` — יש להתקין לפני שלב הפיתוח

---

## 13. סדר מימוש (לפי agents)

1. **Migration:** `import_mapping_templates` table + RLS + `set_updated_at` trigger
2. **Packages:** `pnpm add papaparse xlsx @types/papaparse`
3. **Types:** `src/app/(dashboard)/products/import-types.ts`
4. **Server Actions:** `importProductsAction`, `saveImportMappingAction`, `getImportMappingsAction`
5. **UI:** `ImportModal.tsx` — 5 שלבים (Stepper)
6. **חיבור:** `ProductsClient.tsx` — כפתור "ייבוא מ-Excel" → `<ImportModal />`
