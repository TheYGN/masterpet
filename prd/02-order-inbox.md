# PRD: Order Inbox — Omnichannel

**פאזה:** MVP (Sprint 3-4)
**תאריך:** 2026-05-19
**סטטוס:** Draft

---

## 1. סקירה כללית

Order Inbox הוא מרכז קליטה אחיד לכל ההזמנות הנכנסות ל-MasterPet — WhatsApp (דרך Green API), WooCommerce, וקלט ידני בטלפון. במקום שעובד יקפוץ בין שלושה מקורות, הכל מגיע למסך אחד. עובד מכירות קורא את ההודעה, מחליט אם זו הזמנה אמיתית, ומעביר אותה ל-Order Management בלחיצה אחת.

---

## 2. הבעיה שנפתרת

| | |
|---|---|
| **כאב** | הזמנות מגיעות מ-3 מקורות שונים, עובדים מפספסים הודעות WhatsApp שאין להן ממשק מסודר |
| **מצב קיים** | עסקים מנהלים הכל ידנית — אקסל, פתקים, WhatsApp Web פתוח בדפדפן |
| **מה יקרה אם לא נבנה** | אפס הזמנות שנפלו הוא לא אפשרי בלי inbox מרכזי — עסקים יתקשו לסמוך על המערכת |

---

## 3. User Stories

### עובד מכירות (sales)
- As a **sales**, I want to see all incoming messages from all channels in one screen so that I don't miss any order.
- As a **sales**, I want to click on a WhatsApp message and create an order from it manually so that I can process orders from unstructured text.
- As a **sales**, I want to be warned when a possible duplicate order is detected so that I don't create the same order twice.

### מנהל סניף (branch_manager)
- As a **branch_manager**, I want to see the inbox of my branch only so that I can monitor what's being processed.
- As a **branch_manager**, I want to assign messages to specific sales workers so that work is distributed evenly.

### בעל עסק (owner)
- As an **owner**, I want to see the inbox across all branches so that I have full visibility.

---

## 4. Functional Requirements

| # | דרישה | עדיפות |
|---|---|---|
| FR-1 | קבלת webhook מ-Green API (WhatsApp) — כל הודעה נכנסת ≤ 3 שניות | Must Have |
| FR-2 | קבלת webhook מ-WooCommerce — הזמנה חדשה נכנסת ל-Inbox ≤ 10 שניות | Must Have |
| FR-3 | קלט ידני — עובד פותח "הזמנה ידנית" וממלא שם + טלפון + הערות | Must Have |
| FR-4 | Inbox מציג: ערוץ, שם/טלפון לקוח, תוכן/הערה, זמן קבלה, סטטוס | Must Have |
| FR-5 | סינון לפי: ערוץ / סטטוס / תאריך / מי מטפל | Must Have |
| FR-6 | מעבר ל-"המרה להזמנה" — Sheet עם טופס יצירת Order | Must Have |
| FR-7 | התראת כפולה: אותו מספר טלפון שלח/הזמין בשני ערוצים שונים תוך 60 דקות | Must Have |
| FR-8 | עובד מסמן כפולה → ההודעה עוברת לסטטוס `duplicate` | Must Have |
| FR-9 | RLS: sales + branch_manager רואים רק הסניף שלהם; owner רואה הכל | Must Have |
| FR-10 | שיוך הזמנה ל-agent (assigned_to) — מנהל סניף מקצה | Should Have |
| FR-11 | חיפוש חופשי לפי שם לקוח / טלפון | Should Have |
| FR-12 | Badge counter על ה-nav icon — מספר הודעות `new` | Should Have |
| FR-13 | Real-time updates — הודעה חדשה מופיעה ללא רענון (Supabase Realtime) | Should Have |
| FR-14 | Export CSV של הודעות לפי טווח תאריכים | Nice to Have |

---

## 5. UI/UX

- **כיוון:** RTL, עברית מלאה
- **Routes (Next.js App Router):**
  - `app/(dashboard)/inbox/page.tsx` — רשימת כל ההודעות הנכנסות
  - `app/(dashboard)/inbox/[id]/page.tsx` — פרטי הודעה + כפתור המרה

- **shadcn/ui Components:**
  - `DataTable` — רשימת הודעות עם sorting + filtering
  - `Badge` — ערוץ (WhatsApp / WooCommerce / ידני) + סטטוס
  - `Sheet` — "המרה להזמנה"
  - `Alert` — התראת כפולה (variant: destructive)
  - `Dialog` — אישור סימון כ-duplicate
  - `Tabs` — new / processing / converted / all
  - `Button` — פתיחת הזמנה ידנית חדשה

- **Flow עיקרי:**
  1. עובד פותח `/inbox` — רואה DataTable ממוין לפי זמן קבלה (חדש ביותר למעלה)
  2. לוחץ על שורה → נפתח `/inbox/[id]`
  3. אם יש חשד לכפולה — `Alert` אדום למעלה עם "נמצאה הזמנה דומה מ-XX דקות — רצה לסמן ככפולה?"
  4. עובד לוחץ "המר להזמנה" → נפתח `Sheet` עם טופס Order
  5. לאחר שמירה — הסטטוס עובר ל-`converted`, מספר ה-Order מוצג

- **Empty State:** "אין הזמנות חדשות — לחץ להוספת הזמנה ידנית"
- **Error State:** "לא הצלחנו לטעון את ה-Inbox — [נסה שוב]"

---

## 6. Technical Spec

### DB Schema (Supabase)

```sql
CREATE TABLE inbox_messages (
  id                 UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id          UUID        NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  branch_id          UUID        REFERENCES branches(id),
  channel            TEXT        NOT NULL CHECK (channel IN ('whatsapp', 'woocommerce', 'manual')),
  external_id        TEXT,                          -- Green API message_id / WooCommerce order_id
  status             TEXT        NOT NULL DEFAULT 'new'
                                 CHECK (status IN ('new', 'processing', 'converted', 'duplicate', 'ignored')),
  customer_phone     TEXT,
  customer_name      TEXT,
  raw_content        JSONB       NOT NULL DEFAULT '{}', -- payload מקורי כפי שהגיע
  notes              TEXT,                          -- הערות עובד בקלט ידני
  assigned_to        UUID        REFERENCES users(id),
  converted_order_id UUID,                          -- ימולא אחרי המרה להזמנה
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_inbox_tenant_status   ON inbox_messages(tenant_id, status);
CREATE INDEX idx_inbox_tenant_branch   ON inbox_messages(tenant_id, branch_id);
CREATE INDEX idx_inbox_customer_phone  ON inbox_messages(tenant_id, customer_phone);
CREATE INDEX idx_inbox_created_at      ON inbox_messages(created_at DESC);

ALTER TABLE inbox_messages ENABLE ROW LEVEL SECURITY;

-- עובד מכירות ומנהל סניף רואים רק הסניף שלהם; owner רואה הכל
CREATE POLICY "inbox_tenant_isolation" ON inbox_messages
  FOR ALL USING (
    tenant_id = (auth.jwt() ->> 'tenant_id')::UUID
    AND (
      (auth.jwt() ->> 'role') = 'owner'
      OR branch_id = (auth.jwt() ->> 'branch_id')::UUID
    )
  );
```

### Edge Functions

| Function | Trigger | מטרה |
|---|---|---|
| `fn-whatsapp-webhook` | HTTP POST `/webhooks/whatsapp` | קבלת payload מ-Green API, נירמול, INSERT ל-inbox_messages |
| `fn-woocommerce-webhook` | HTTP POST `/webhooks/woocommerce` | קבלת הזמנה חדשה מ-WooCommerce REST, INSERT ל-inbox_messages |
| `fn-inbox-dedup-check` | נקרא מ-`fn-whatsapp-webhook` + manual form | בודק אם קיימת הודעה מאותו טלפון בשעה האחרונה; מחזיר `{ isDuplicate, relatedId }` |

#### fn-whatsapp-webhook — לוגיקה עיקרית

```typescript
// קבלת signature verification מ-Green API
// חילוץ: senderPhone, messageText, messageId, timestamp
// בדיקת dedup דרך fn-inbox-dedup-check
// INSERT ל-inbox_messages עם channel='whatsapp', raw_content=payload
// אם isDuplicate → status stays 'new' אבל מוסיפים metadata של relatedId
```

### Frontend Components

| Component | Path | מטרה |
|---|---|---|
| `InboxTable` | `app/(dashboard)/inbox/_components/InboxTable.tsx` | DataTable ראשי עם כל ההודעות |
| `InboxFilters` | `app/(dashboard)/inbox/_components/InboxFilters.tsx` | Tabs + selects לסינון |
| `MessageDetailView` | `app/(dashboard)/inbox/[id]/_components/MessageDetailView.tsx` | פרטי הודעה מלאים |
| `DuplicateAlert` | `app/(dashboard)/inbox/[id]/_components/DuplicateAlert.tsx` | Alert אדום עם קישור להודעה הדומה |
| `ConvertToOrderSheet` | `app/(dashboard)/inbox/[id]/_components/ConvertToOrderSheet.tsx` | Sheet עם טופס יצירת Order |
| `ManualInboxButton` | `app/(dashboard)/inbox/_components/ManualInboxButton.tsx` | פתיחת Dialog לקלט הזמנה ידנית |

### Supabase Realtime

```typescript
// ב-InboxTable — subscribe לשינויים ב-inbox_messages
supabase
  .channel('inbox')
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'inbox_messages',
      filter: `tenant_id=eq.${tenantId}` }, (payload) => {
    // הוסף שורה חדשה לראש הטבלה
  })
  .subscribe()
```

---

## 7. Acceptance Criteria

- [ ] WhatsApp webhook מתקבל ומופיע ב-Inbox תוך 5 שניות מרגע שליחה
- [ ] WooCommerce הזמנה חדשה מופיעה ב-Inbox תוך 15 שניות
- [ ] קלט ידני — עובד יכול ליצור הזמנה ידנית מלאה תוך פחות מ-2 דקות
- [ ] התראת כפולה מוצגת כאשר אותו טלפון שולח/מזמין בשני ערוצים שונים תוך 60 דקות
- [ ] עובד יכול להמיר הודעה להזמנה מבלי לעזוב את הדף (Sheet)
- [ ] RLS מאומת — sales ב-סניף A לא רואה הודעות של סניף B
- [ ] owner רואה הודעות מכל הסניפים
- [ ] RTL נכון בעברית בכל ה-breakpoints
- [ ] Real-time — הודעה חדשה מופיעה ללא רענון ידני
- [ ] Empty state, Loading state, Error state — כולם מטופלים
- [ ] Mobile responsive (min 375px) — עובד יכול לטפל בהודעה דרך נייד

---

## 8. פאזה ואומדן

| | |
|---|---|
| **פאזה** | MVP — Sprint 3-4 |
| **Sprint** | Sprint 3, חודש 2 |
| **Backend (Edge Functions + DB)** | ~3 ימים |
| **Frontend (Inbox + Detail + ConvertSheet)** | ~4 ימים |
| **Integration Tests** | ~1 יום |
| **סה"כ** | ~8 ימים |

---

## 9. תלויות

- **דורש:** PRD #1 (Auth/RBAC) — tenant_id, branch_id, RLS, 4 roles חייבים להיות פעילים
- **דורש:** Green API חשבון + Webhook URL מוגדר
- **דורש:** WooCommerce Connector בסיסי (לפחות webhook קליטה — לא חייב sync מלא)
- **חוסם:** Order Management PRD — `converted_order_id` לא ניתן למלא עד שיש טבלת `orders`

---

## 10. סיכונים ושאלות פתוחות

| # | שאלה / סיכון | סטטוס |
|---|---|---|
| 1 | Green API — האם יש rate limit על webhooks? מה קורה אם המערכת למטה בזמן שהודעה נשלחת? | פתוח |
| 2 | WooCommerce webhook auth — כיצד מאמתים שה-webhook הגיע מ-WooCommerce אמיתי ולא ספאם? | פתוח |
| 3 | מה קורה ל-`raw_content` של WhatsApp אם ההודעה היא תמונה/קובץ ולא טקסט? | פתוח |
| 4 | חלון זמן ל-Dedup (60 דקות) — אולי קצר מדי? לקוח שהזמין ב-WhatsApp ורצה לשנות אחרי שעה | פתוח |
| 5 | ב-Sprint 5 — AI parsing (Claude) יוסף כ-upgrade מעל הflow הידני הנוכחי | מתוכנן |
