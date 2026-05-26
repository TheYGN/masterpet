// ============ Customers screen — sample data ============

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

// 8 customers (one shown in hover state, two new, one inactive)
const customers = [
  {
    id: 1, name: 'רחל כהן', initials: 'ר.כ',
    avatarGradient: 'linear-gradient(135deg, #38656A 0%, #1B5E20 100%)',
    phone: '052-111-2233', city: 'תל אביב',
    channel: 'whatsapp', branch: 'סניף ראשי',
    status: 'active', joined: '01/03/2026', isNew: false,
  },
  {
    id: 2, name: 'אבי לוי', initials: 'א.ל',
    avatarGradient: 'linear-gradient(135deg, #52634F 0%, #38656A 100%)',
    phone: '054-444-5566', city: 'פתח תקווה',
    channel: 'phone', branch: 'סניף ראשי',
    status: 'active', joined: '15/02/2026', isNew: false,
  },
  {
    id: 3, name: 'מיכל שפירא', initials: 'מ.ש',
    avatarGradient: 'linear-gradient(135deg, #38656A 0%, #52634F 100%)',
    phone: '050-777-8899', city: 'רמת גן',
    channel: 'whatsapp', branch: 'סניף ראשי',
    status: 'active', joined: '22/04/2026', isNew: true,
  },
  {
    id: 4, name: 'יוסי אברהם', initials: 'י.א',
    avatarGradient: 'linear-gradient(135deg, #52634F 0%, #1B5E20 100%)',
    phone: '053-222-3344', city: 'גבעתיים',
    channel: 'email', branch: 'סניף דרום',
    status: 'active', joined: '10/01/2026', isNew: false,
  },
  {
    id: 5, name: 'דנה גרין', initials: 'ד.ג',
    avatarGradient: 'linear-gradient(135deg, #38656A 0%, #1B5E20 100%)',
    phone: '058-555-6677', city: 'חולון',
    channel: 'whatsapp', branch: 'סניף ראשי',
    status: 'active', joined: '03/05/2026', isNew: true,
  },
  {
    id: 6, name: 'שלמה בן דוד', initials: 'ש.ב',
    avatarGradient: null, // muted style for inactive
    phone: '052-888-9900', city: 'בת ים',
    channel: 'phone', branch: 'סניף דרום',
    status: 'inactive', joined: '05/12/2025', isNew: false,
  },
  {
    id: 7, name: 'נועה ישראלי', initials: 'נ.י',
    avatarGradient: 'linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)',
    phone: '054-333-4455', city: 'ראשל״צ',
    channel: 'whatsapp', branch: 'סניף ראשי',
    status: 'active', joined: '18/04/2026', isNew: false,
    forceHover: true, // pre-rendered hover state per spec
  },
  {
    id: 8, name: 'אמיר חדד', initials: 'א.ח',
    avatarGradient: 'linear-gradient(135deg, #38656A 0%, #52634F 100%)',
    phone: '050-123-4567', city: 'הרצליה',
    channel: 'whatsapp', branch: 'סניף צפון',
    status: 'active', joined: '28/01/2026', isNew: false,
  },
];

const summary = {
  active: 184,
  total: 189,
  inactive: 5,
  newThisMonth: 12,
  newDelta: 3,
  whatsappPct: 71,
};

Object.assign(window, {
  navItems, channelMap, customers, summary,
});
