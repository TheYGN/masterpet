// ============ Orders List — Hebrew sample data ============

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

// Avatar gradient helper — color hash per name
const avatarGradients = [
  'linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%)',
  'linear-gradient(135deg, #38656A 0%, #1B5E20 100%)',
  'linear-gradient(135deg, #52634F 0%, #38656A 100%)',
  'linear-gradient(135deg, #2E7D32 0%, #52634F 100%)',
  'linear-gradient(135deg, #38656A 0%, #2E7D32 100%)',
];

// Orders rows (8) — see spec
const orders = [
  {
    id: '#1041',
    customer: 'רחל כהן', initials: 'ר.כ', avatar: avatarGradients[0],
    product: 'Royal Canin Adult 4kg × 2',
    total: 298, currency: '₪',
    payment: 'unpaid',
    status: 'pending',
    channel: 'whatsapp',
    date: '18/05, 09:14',
  },
  {
    id: '#1040',
    customer: 'אבי לוי', initials: 'א.ל', avatar: avatarGradients[1],
    product: "Hill's Science Diet × 1 + Acana × 1",
    total: 445,
    payment: 'paid',
    status: 'confirmed',
    channel: 'phone',
    date: '18/05, 08:42',
  },
  {
    id: '#1039',
    customer: 'מיכל שפירא', initials: 'מ.ש', avatar: avatarGradients[2],
    product: 'Orijen Cat Original 1.8kg × 3',
    total: 612,
    payment: 'link_sent',
    status: 'preparing',
    channel: 'whatsapp',
    date: '17/05, 17:28',
  },
  {
    id: '#1038',
    customer: 'יוסי אברהם', initials: 'י.א', avatar: avatarGradients[3],
    product: 'Pro Plan Sensitive × 2',
    total: 334,
    payment: 'paid',
    status: 'in_transit',
    channel: 'woo',
    date: '17/05, 14:05',
  },
  {
    id: '#1037',
    customer: 'דנה גרין', initials: 'ד.ג', avatar: avatarGradients[4],
    product: 'Whiskas Tuna 85g × 12',
    total: 189,
    payment: 'paid',
    status: 'delivered',
    channel: 'whatsapp',
    date: '16/05, 11:51',
  },
  {
    id: '#1036',
    customer: 'שלמה בן דוד', initials: 'ש.ד', avatar: avatarGradients[0],
    product: 'Bonzo Beef Adult 3kg × 1',
    total: 127,
    payment: 'unpaid',
    status: 'cancelled',
    channel: 'phone',
    date: '15/05, 16:33',
    cancelled: true,
  },
  {
    id: '#1035',
    customer: 'נועה ישראלי', initials: 'נ.י', avatar: avatarGradients[1],
    product: "Royal Canin Kitten × 2 + Hill's Adult × 1",
    total: 391,
    payment: 'paid',
    status: 'delivered',
    channel: 'whatsapp',
    date: '15/05, 10:18',
    forceHover: true,
  },
  {
    id: '#1034',
    customer: 'אמיר חדד', initials: 'א.ח', avatar: avatarGradients[2],
    product: 'Acana Pacifica Cat 1.8kg × 2',
    total: 478,
    payment: 'link_sent',
    status: 'preparing',
    channel: 'whatsapp',
    date: '14/05, 13:47',
  },
];

// Status & payment chips — kind + label mapping
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
  navItems, channelMap, orders, statusMap, paymentMap,
});
