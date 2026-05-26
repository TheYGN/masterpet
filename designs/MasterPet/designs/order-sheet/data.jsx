// ============ Order Sheet — Hebrew sample data ============

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

// Selected customer for the new order
const customer = {
  name: 'רחל כהן',
  initials: 'ר.כ',
  phone: '052-111-2233',
  city: 'תל אביב',
  channel: 'whatsapp',
  lastOrderTotal: 298,
};

// Items in the cart
const cartItems = [
  {
    id: 'rc-adult-4',
    name: 'Royal Canin Adult 4kg',
    sku: 'RC-ADULT-4KG',
    qty: 2,
    unitPrice: 149,
    total: 298,
    variant: '4 ק״ג · עוף ואורז',
  },
  {
    id: 'hs-adult-1',
    name: "Hill's Science Diet Adult",
    sku: 'HS-ADULT-1KG',
    qty: 1,
    unitPrice: 195,
    total: 195,
    variant: '1 ק״ג · כבש',
  },
];

// Product picker results (annotation: dropdown expanded state)
const productResults = [
  { name: 'Acana Pacifica Cat 1.8kg',   sku: 'AC-CAT-18',  price: 239 },
  { name: 'Orijen Cat Original 1.8kg',  sku: 'OR-CAT-18',  price: 268 },
  { name: 'Pro Plan Sensitive 3kg',     sku: 'PP-SENS-3',  price: 167 },
];

// Totals (₪ before VAT, VAT 18%, total)
const totals = {
  subtotal: 410.09,
  vat: 73.82,
  total: 483.91,
};

// Ghost orders for the dimmed background (orders-list look)
const ghostOrders = [
  { id: '#1041', customer: 'רחל כהן',      product: 'Royal Canin Adult 4kg × 2',          total: 298, status: 'pending',    payment: 'unpaid',    channel: 'whatsapp', date: '18/05, 09:14' },
  { id: '#1040', customer: 'אבי לוי',       product: "Hill's Science Diet × 1 + Acana × 1", total: 445, status: 'confirmed',  payment: 'paid',      channel: 'phone',    date: '18/05, 08:42' },
  { id: '#1039', customer: 'מיכל שפירא',    product: 'Orijen Cat Original 1.8kg × 3',      total: 612, status: 'preparing',  payment: 'link_sent', channel: 'whatsapp', date: '17/05, 17:28' },
  { id: '#1038', customer: 'יוסי אברהם',    product: 'Pro Plan Sensitive × 2',             total: 334, status: 'in_transit', payment: 'paid',      channel: 'woo',      date: '17/05, 14:05' },
  { id: '#1037', customer: 'דנה גרין',      product: 'Whiskas Tuna 85g × 12',              total: 189, status: 'delivered',  payment: 'paid',      channel: 'whatsapp', date: '16/05, 11:51' },
  { id: '#1036', customer: 'שלמה בן דוד',   product: 'Bonzo Beef Adult 3kg × 1',           total: 127, status: 'cancelled',  payment: 'unpaid',    channel: 'phone',    date: '15/05, 16:33' },
];

const statusMap = {
  pending:    { label: 'ממתין',  kind: 'tonal-secondary' },
  confirmed:  { label: 'אושר',   kind: 'tonal-tertiary' },
  preparing:  { label: 'בהכנה',  kind: 'tonal-secondary' },
  in_transit: { label: 'בדרך',   kind: 'tonal-tertiary' },
  delivered:  { label: 'נמסר',   kind: 'filled-primary' },
  cancelled:  { label: 'בוטל',   kind: 'outlined-error' },
};

const paymentMap = {
  paid:      { label: 'שולם',         kind: 'filled-primary' },
  unpaid:    { label: 'לא שולם',      kind: 'outlined-error' },
  link_sent: { label: 'קישור נשלח',   kind: 'tonal-secondary' },
};

Object.assign(window, {
  navItems, channelMap, customer, cartItems, productResults, totals,
  ghostOrders, statusMap, paymentMap,
});
