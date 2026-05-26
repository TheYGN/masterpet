// ============ Customer Sheet — sample data ============

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
  email:    { label: 'אימייל',      icon: 'mail',          color: '#2563EB' },
};

// The customer being edited
const customer = {
  name: 'רחל כהן',
  phone: '052-111-2233',
  phoneError: 'מספר הטלפון כבר רשום ללקוח אחר',
  email: 'rachel.cohen@gmail.com',
  address: 'רחוב הרצל 14, דירה 3',
  city: 'תל אביב',
  channel: 'whatsapp',
  branch: 'סניף ראשי',
  notes: 'לקוחה קבועה. רוכשת בעיקר מזון לחתול. מעדיפה מסירה עצמית.',
  status: 'active',
  customerId: 'C-00184',
  joined: '01/03/2026',
  totalOrders: 23,
  lifetimeValue: '4,820',
};

const branches = ['סניף ראשי', 'סניף דרום', 'סניף צפון'];

// Ghost customers used in the dimmed background (subset of the real list)
const ghostCustomers = [
  { name: 'רחל כהן',       phone: '052-111-2233', city: 'תל אביב',  channel: 'whatsapp', branch: 'סניף ראשי', status: 'active',   selected: true },
  { name: 'אבי לוי',       phone: '054-444-5566', city: 'פתח תקווה', channel: 'phone',    branch: 'סניף ראשי', status: 'active' },
  { name: 'מיכל שפירא',    phone: '050-777-8899', city: 'רמת גן',    channel: 'whatsapp', branch: 'סניף ראשי', status: 'active' },
  { name: 'יוסי אברהם',    phone: '053-222-3344', city: 'גבעתיים',   channel: 'email',    branch: 'סניף דרום', status: 'active' },
  { name: 'דנה גרין',      phone: '058-555-6677', city: 'חולון',     channel: 'whatsapp', branch: 'סניף ראשי', status: 'active' },
  { name: 'שלמה בן דוד',   phone: '052-888-9900', city: 'בת ים',     channel: 'phone',    branch: 'סניף דרום', status: 'inactive' },
];

Object.assign(window, {
  navItems, channelMap, customer, branches, ghostCustomers,
});
