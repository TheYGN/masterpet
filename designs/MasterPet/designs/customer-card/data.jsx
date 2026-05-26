// ============ Customer Card — sample data ============

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

// The customer being viewed
const customer = {
  name: 'רחל כהן',
  initials: 'ר.כ',
  phone: '052-111-2233',
  email: 'rachel.cohen@gmail.com',
  address: 'רחוב הרצל 14, דירה 3, תל אביב',
  city: 'תל אביב',
  channel: 'whatsapp',
  channelLabel: 'WhatsApp',
  branch: 'סניף ראשי',
  notes: 'לקוחה קבועה. רוכשת בעיקר מזון לחתול. מעדיפה מסירה עצמית.',
  status: 'active',
  customerId: 'CUS-0042',
  joined: '01/03/2026',
  lastUpdated: '18/05/2026',
  daysSinceJoined: 78,
};

Object.assign(window, {
  navItems, channelMap, customer,
});
