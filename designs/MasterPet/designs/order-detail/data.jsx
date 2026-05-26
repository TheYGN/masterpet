// ============ Order Detail #1041 — Hebrew sample data ============

const navItems = [
  { id: 'dashboard',   label: 'דשבורד',     icon: 'space_dashboard' },
  { id: 'inbox',       label: 'אינבוקס',    icon: 'inbox', badge: 5 },
  { id: 'orders',      label: 'הזמנות',     icon: 'receipt_long' },
  { id: 'inventory',   label: 'מלאי',       icon: 'inventory_2' },
  { id: 'crm',         label: 'לקוחות',     icon: 'group' },
  { id: 'loyalty',     label: 'נאמנות',     icon: 'loyalty' },
  { id: 'automations', label: 'אוטומציות',  icon: 'bolt' },
  { id: 'settings',    label: 'הגדרות',     icon: 'settings' },
];

const channelMap = {
  whatsapp: { label: 'WhatsApp',    icon: 'chat',          color: '#25D366' },
  phone:    { label: 'טלפון',       icon: 'call',          color: '#52634F' },
  woo:      { label: 'WooCommerce', icon: 'shopping_cart', color: '#7F54B3' },
};

// ---- Order #1041 ----
const order = {
  id: '#1041',
  status: 'preparing',
  statusLabel: 'בהכנה',
  payment: 'link_sent',
  channel: 'whatsapp',
  channelLabel: 'WhatsApp ידני',
  createdAt: '18/05/2026, 09:14',
  createdBy: 'שרה לוי (מכירות)',
  orderType: 'חד פעמית',
  deliveryDate: '19/05/2026',
  notes: 'להכניס לשקית ירוקה, המשלוח בין 14:00-16:00',
};

const customer = {
  name: 'רחל כהן',
  initials: 'ר.כ',
  tag: 'לקוחה קבועה',
  phone: '052-111-2233',
  city: 'תל אביב',
  preferredChannel: 'whatsapp',
  preferredChannelLabel: 'WhatsApp',
  branch: 'סניף ראשי',
};

const items = [
  {
    name: 'Royal Canin Adult 4kg',
    sku: 'RC-ADULT-4KG',
    meta: '4 ק״ג · עוף ואורז',
    qty: 2,
    unitPrice: 149.00,
    lineTotal: 298.00,
    unitCost: 95.00,
  },
  {
    name: "Hill's Science Diet Adult",
    sku: 'HS-ADULT-1KG',
    meta: '1 ק״ג · כבש',
    qty: 1,
    unitPrice: 195.00,
    lineTotal: 195.00,
    unitCost: 140.00,
  },
];

const totals = {
  subtotal: 410.09,
  vat:      73.82,
  total:    483.91,
  cost:     280.00,
  profit:   203.91,
  margin:   42.2,
};

const payment = {
  status: 'link_sent',
  statusLabel: 'קישור נשלח',
  method: 'PayPlus Link',
  linkSentAt: '18/05, 09:30',
  ref: '—',
};

// 6-step funnel — index 2 = current (preparing). 5 = cancelled (ghost terminal).
const timeline = [
  { key: 'pending',    label: 'ממתין',  icon: 'check',         time: '18/05, 09:14', state: 'done' },
  { key: 'confirmed',  label: 'אושר',   icon: 'check',         time: '18/05, 09:22', state: 'done' },
  { key: 'preparing',  label: 'בהכנה',  icon: 'inventory_2',   time: 'עדכון אחרון לפני 12 דק׳', state: 'current' },
  { key: 'in_transit', label: 'בדרך',   icon: 'local_shipping',time: null, state: 'upcoming' },
  { key: 'delivered',  label: 'נמסר',   icon: 'check_circle',  time: null, state: 'upcoming' },
  { key: 'cancelled',  label: 'בוטל',   icon: 'cancel',        time: null, state: 'ghost' },
];

Object.assign(window, {
  navItems, channelMap,
  order, customer, items, totals, payment, timeline,
});
