# PRD: ניהול הזמנות

**פאזה:** MVP (Sprint 3-4)
**תאריך:** 2026-05-19
**סטטוס:** Draft

---

## 1. סקירה כללית

מסך ניהול ההזמנות הוא לב הפלטפורמה התפעולי — כאן כל הזמנה שנקלטה מה-Inbox עוברת מסלול ברור עד מסירה ללקוח. כל מעבר סטטוס מתועד עם timestamp, ומאפשר מדידה תפעולית: זמן מענה, זמן הכנה, זמן שליחה. כל רול רואה את השלבים הרלוונטיים לו בלבד.

---

## 2. הבעיה שנפתרת

| | |
|---|---|
| **כאב** | אחרי שהזמנה נכנסת מ-WhatsApp/WooCommerce, אין מקום מסודר לעקוב אחריה — מי מכין, מה נשלח, מה נמסר |
| **מצב קיים** | רשימות WhatsApp, פתקים, שיחות פנימיות — ללא ת'ודב ללא נראות |
| **מה יקרה אם לא נבנה** | מנהל לא יודע בזמן אמת מה קורה בעסק שלו; הזמנות נופלות בין הכסאות |

---

## 3. User Stories

### עובד מכירות (sales)
- As a **sales**, I want to see my branch's orders filtered by status so that I know what needs my attention right now.
- As a **sales**, I want to approve an incoming order and move it to preparation so that the warehouse knows what to pack.
- As a **sales**, I want to cancel an order with a reason so that the record is clean and the customer can be notified.

### מנהל מחסן / לוגיסטיקן (warehouse)
- As a **warehouse**, I want to see only orders in "בהכנה" status so that I can focus on packing without noise.
- As a **warehouse**, I want to mark an order as "מוכן לשליחה" so that the sales/manager knows it's ready for pickup by a courier.

### מנהל סניף (branch_manager)
- As a **branch_manager**, I want to see all orders in my branch across all statuses so that I can monitor the full pipeline.
- As a **branch_manager**, I want to assign a courier to an order so that delivery is tracked.

### בעל עסק (owner)
- As an **owner**, I want to see orders across all branches so that I have a full operational picture.
- As an **owner**, I want KPI timestamps per order (time to approve, time to pack, time to deliver) so that I can identify bottlenecks.

---

## 4. Functional Requirements

| # | דרישה | עדיפות |
|---|---|---|
| FR-1 | כל הזמנה מוצגת עם: מספר הזמנה, שם לקוח, מוצרים, סטטוס, זמן יצירה, מי מטפל | Must Have |
| FR-2 | מסלול סטטוסים: `new → approved → packing → ready → shipped → delivered` | Must Have |
| FR-3 | כל מעבר סטטוס נשמר עם timestamp + user_id שביצע | Must Have |
| FR-4 | כל רול רואה סטטוסים שונים: sales רואה new/approved/shipped/delivered; warehouse רואה approved/packing/ready; branch_manager ו-owner רואים הכל | Must Have |
| FR-5 | ביטול הזמנה עם שדה סיבה חובה + מי ביטל + מתי | Must Have |
| FR-6 | RLS: sales ו-warehouse רואים רק הסניף שלהם; branch_manager — סניף שלו; owner — הכל | Must Have |
| FR-7 | שדה `is_recurring` — סימון "הזמנה חוזרת" (הלוגיקה האוטומטית תבוא בPRD אוטומציות) | Must Have |
| FR-8 | הזמנה שמגיעה מ-Inbox נוצרת עם `source: 'whatsapp' | 'woocommerce' | 'manual'` | Must Have |
| FR-9 | שיוך שליח להזמנה — branch_manager בוחר מרשימת שליחים של הסניף | Must Have |
| FR-10 | פילטור: לפי סטטוס / תאריך / ערוץ מקור / שליח משויך | Must Have |
| FR-11 | מיון: לפי זמן קבלה (ברירת מחדל: חדש למעלה) | Must Have |
| FR-12 | Real-time: שינוי סטטוס מופיע מיידית ללא רענון | Should Have |
| FR-13 | חיפוש לפי שם לקוח / מספר הזמנה / טלפון | Should Have |
| FR-14 | הדפסת שובר/פתק הזמנה (PDF פשוט: פרטי לקוח + מוצרים + כתובת) | Should Have |
| FR-15 | אומדן KPIs: זמן ממוצע לאישור / הכנה / משלוח — גרף פשוט לowner | Nice to Have |

---

## 5. UI/UX

- **כיוון:** RTL, עברית מלאה
- **Routes (Next.js App Router):**
  - `app/(dashboard)/orders/page.tsx` — DataTable ראשי עם כל ההזמנות
  - `app/(dashboard)/orders/[id]/page.tsx` — פרטי הזמנה + היסטוריית סטטוסים + כפתורי פעולה

- **shadcn/ui Components:**
  - `DataTable` — רשימת הזמנות עם sorting + filtering
  - `Badge` — סטטוס + ערוץ מקור (WhatsApp / WooCommerce / ידני)
  - `Tabs` — new | approved | packing | ready | shipped | delivered | cancelled | all
  - `Sheet` — פרטי הזמנה המלאים + לחצני מעבר סטטוס
  - `Select` — שיוך שליח
  - `Textarea` — סיבת ביטול (Dialog עם אישור)
  - `Timeline` — היסטוריית מעברי סטטוס עם timestamps (custom component)

- **Flow עיקרי — sales:**
  1. נכנס ל-`/orders` → רואה טאב "new" עם הזמנות ממתינות
  2. פותח הזמנה → קורא את הפרטים → לוחץ "אשר הזמנה" → סטטוס עובר ל-`approved`
  3. הזמנה מופיעה אצל מנהל מחסן בטאב "approved"

- **Flow עיקרי — warehouse:**
  1. נכנס ל-`/orders` → רואה טאב "approved" בלבד
  2. מתחיל להכין → לוחץ "התחל הכנה" → סטטוס עובר ל-`packing`
  3. סיים → לוחץ "מוכן לשליחה" → סטטוס עובר ל-`ready`

- **Flow ביטול:**
  1. לוחץ "בטל הזמנה" → Dialog עם textarea "סיבת ביטול"
  2. מאשר → הזמנה עוברת ל-`cancelled` עם timestamp + user + סיבה

- **Empty State (לפי טאב):** "אין הזמנות ב[סטטוס זה] כרגע"

---

## 6. Technical Spec

### DB Schema (Supabase)

```sql
CREATE TABLE orders (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id        UUID        NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  branch_id        UUID        NOT NULL REFERENCES branches(id),
  inbox_message_id UUID        REFERENCES inbox_messages(id),        -- מקור ב-Inbox
  order_number     TEXT        NOT NULL,                              -- #ORD-YYYY-NNNN (generated)
  source           TEXT        NOT NULL CHECK (source IN ('whatsapp', 'woocommerce', 'manual')),
  status           TEXT        NOT NULL DEFAULT 'new'
                               CHECK (status IN ('new','approved','packing','ready','shipped','delivered','cancelled')),
  customer_name    TEXT        NOT NULL,
  customer_phone   TEXT        NOT NULL,
  customer_address TEXT,
  items            JSONB       NOT NULL DEFAULT '[]',                 -- [{product_id, name, qty, unit_price}]
  notes            TEXT,
  is_recurring     BOOLEAN     NOT NULL DEFAULT FALSE,
  courier_id       UUID        REFERENCES users(id),
  cancelled_by     UUID        REFERENCES users(id),
  cancelled_at     TIMESTAMPTZ,
  cancellation_reason TEXT,
  created_by       UUID        NOT NULL REFERENCES users(id),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- טבלת היסטוריית סטטוסים — KPI timestamps
CREATE TABLE order_status_history (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id   UUID        NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  tenant_id  UUID        NOT NULL REFERENCES tenants(id),
  from_status TEXT,
  to_status  TEXT        NOT NULL,
  changed_by UUID        NOT NULL REFERENCES users(id),
  changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_tenant_status   ON orders(tenant_id, status);
CREATE INDEX idx_orders_tenant_branch   ON orders(tenant_id, branch_id);
CREATE INDEX idx_orders_created_at      ON orders(created_at DESC);
CREATE INDEX idx_orders_customer_phone  ON orders(tenant_id, customer_phone);
CREATE INDEX idx_order_history_order    ON order_status_history(order_id);

ALTER TABLE orders               ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;

-- RLS: sales/warehouse רואים רק הסניף שלהם; branch_manager — סניף שלו; owner — הכל
CREATE POLICY "orders_access" ON orders
  FOR ALL USING (
    tenant_id = (auth.jwt() ->> 'tenant_id')::UUID
    AND (
      (auth.jwt() ->> 'role') IN ('owner', 'super_admin')
      OR branch_id = (auth.jwt() ->> 'branch_id')::UUID
    )
  );

CREATE POLICY "order_history_access" ON order_status_history
  FOR ALL USING (
    tenant_id = (auth.jwt() ->> 'tenant_id')::UUID
  );
```

### Server Actions (Next.js)

| Action | קובץ | מטרה |
|---|---|---|
| `updateOrderStatusAction` | `app/(dashboard)/orders/actions.ts` | מעבר סטטוס + INSERT ל-order_status_history |
| `cancelOrderAction` | `app/(dashboard)/orders/actions.ts` | ביטול עם סיבה + validation |
| `assignCourierAction` | `app/(dashboard)/orders/actions.ts` | שיוך שליח להזמנה |
| `createManualOrderAction` | `app/(dashboard)/orders/actions.ts` | יצירת הזמנה ידנית ישירות (לא דרך Inbox) |

### Frontend Components

| Component | Path | מטרה |
|---|---|---|
| `OrdersTable` | `orders/_components/OrdersTable.tsx` | DataTable ראשי עם כל ההזמנות |
| `OrderStatusTabs` | `orders/_components/OrderStatusTabs.tsx` | Tabs עם counter לכל סטטוס |
| `OrderDetailSheet` | `orders/[id]/_components/OrderDetailSheet.tsx` | פרטי הזמנה + כפתורי פעולה לפי רול |
| `StatusTimeline` | `orders/[id]/_components/StatusTimeline.tsx` | היסטוריית מעברי סטטוס עם timestamps |
| `CancelOrderDialog` | `orders/[id]/_components/CancelOrderDialog.tsx` | Dialog ביטול עם textarea סיבה |
| `CourierSelect` | `orders/[id]/_components/CourierSelect.tsx` | Select לשיוך שליח |

### Realtime

```typescript
supabase
  .channel('orders')
  .on('postgres_changes', {
    event: 'UPDATE', schema: 'public', table: 'orders',
    filter: `tenant_id=eq.${tenantId}`
  }, (payload) => {
    // עדכן סטטוס בשורה הרלוונטית ב-DataTable ללא רענון
  })
  .subscribe()
```

---

## 7. Acceptance Criteria

- [ ] הזמנה מ-Inbox עוברת ל-Orders בלחיצה אחת ומופיעה בטאב "new"
- [ ] כל מעבר סטטוס נשמר ב-`order_status_history` עם timestamp + user_id
- [ ] sales — רואה רק הזמנות סניף שלו, ורק סטטוסים: new / approved / shipped / delivered
- [ ] warehouse — רואה רק approved / packing / ready
- [ ] branch_manager — רואה הכל בסניפו
- [ ] owner — רואה הכל בכל הסניפים
- [ ] ביטול ללא סיבה → נחסם (validation)
- [ ] RLS: tenant A לא יכול לגשת להזמנות tenant B
- [ ] Real-time: שינוי סטטוס מוצג מיידית ב-DataTable של שני משתמשים בו-זמנית
- [ ] RTL נכון בעברית בכל ה-breakpoints
- [ ] Mobile responsive (min 375px) — warehouse יכול לעדכן סטטוס מנייד

---

## 8. פאזה ואומדן

| | |
|---|---|
| **פאזה** | MVP — Sprint 3-4 |
| **DB Schema + RLS** | ~1 יום |
| **Server Actions** | ~2 ימים |
| **Frontend (Table + Detail + Timeline)** | ~4 ימים |
| **Realtime + Tests** | ~1 יום |
| **סה"כ** | ~8 ימים |

---

## 9. תלויות

- **דורש:** PRD #1 (Auth/RBAC) — tenant_id, branch_id, roles, RLS
- **דורש:** PRD #2 (Order Inbox) — `inbox_messages.id` מקושר ל-`orders.inbox_message_id`
- **חוסם:** PRD שליחים — `courier_id` קיים בסכמה אבל לא ניתן לשיוך עד שיש טבלת users עם role=warehouse/courier

---

## 10. סיכונים ושאלות פתוחות

| # | שאלה / סיכון | סטטוס |
|---|---|---|
| 1 | `items` כ-JSONB או טבלת `order_items` נפרדת? JSONB פשוט עכשיו אבל מקשה על queries מורכבים בעתיד | פתוח |
| 2 | מספר הזמנה — פורמט? `#ORD-2026-0001` (לפי שנה)? לפי סניף? | פתוח |
| 3 | מה קורה להזמנה כשהמלאי לא מספיק? כרגע אין חסימה אוטומטית — נדרש בהמשך (PRD מלאי) | מתוכנן |
| 4 | Subscription (`is_recurring=true`) — הלוגיקה האוטומטית תבוא ב-PRD אוטומציות שיווק | מתוכנן |
| 5 | הדפסת שובר — PDF מצד שרת (Supabase Edge Function) או מצד client (window.print)? | פתוח |
