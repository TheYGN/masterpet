// ============ Data: order-inbox ============

const navItems = [
  { id: 'dashboard',  label: 'דשבורד',    icon: 'space_dashboard' },
  { id: 'inbox',      label: 'אינבוקס',   icon: 'inbox', badge: 12 },
  { id: 'orders',     label: 'הזמנות',    icon: 'receipt_long' },
  { id: 'inventory',  label: 'מלאי',      icon: 'inventory_2' },
  { id: 'crm',        label: 'לקוחות',    icon: 'group' },
  { id: 'loyalty',    label: 'נאמנות',    icon: 'loyalty' },
  { id: 'automations', label: 'אוטומציות', icon: 'bolt' },
  { id: 'settings',   label: 'הגדרות',    icon: 'settings' },
];

const channelMap = {
  whatsapp: { label: 'WhatsApp',    icon: 'chat',          color: '#25D366' },
  phone:    { label: 'טלפון',       icon: 'call',          color: '#52634F' },
  woo:      { label: 'WooCommerce', icon: 'shopping_cart', color: '#7F54B3' },
};

const inboxRows = [
  { id: 1,  channel: 'whatsapp', name: 'דני כהן',     vip: true,  preview: 'תוסיפו גם קופסת Whiskas אם אפשר',           time: 'לפני 4 דק׳',          unread: 2, status: 'new',        selected: true },
  { id: 2,  channel: 'woo',      name: 'מיכל לוי',    vip: false, preview: '#WC-1052 — Hill\u2019s Kitten 2kg ×1',       time: 'לפני 12 דק׳',         unread: 0, status: 'new' },
  { id: 3,  channel: 'phone',    name: 'יוסי אברהמי', vip: false, preview: 'Acana Pacifica 11.4kg — לבדוק מחיר',          time: 'לפני 18 דק׳',         unread: 1, status: 'new' },
  { id: 4,  channel: 'whatsapp', name: 'שירה רוזן',   vip: true,  preview: 'תודה, מתי יישלח?',                            time: 'לפני 35 דק׳',         unread: 0, status: 'processing' },
  { id: 5,  channel: 'whatsapp', name: 'אורי דהן',    vip: false, preview: 'גוגו לא אוכל מהשק הזה, אפשר להחליף?',          time: 'לפני שעתיים ו-12 דק׳', unread: 3, status: 'new', warning: true },
  { id: 6,  channel: 'phone',    name: 'תמר בן-עמי',  vip: false, preview: 'Pro Plan Sensitive Skin 3kg',                  time: 'לפני שעה',            unread: 0, status: 'processing' },
  { id: 7,  channel: 'whatsapp', name: 'אבי שטרן',    vip: false, preview: 'מתי מגיעים שקי ה-Orijen שהזמנתי?',              time: 'לפני שעתיים ו-34 דק׳', unread: 1, status: 'new', warning: true },
  { id: 8,  channel: 'woo',      name: 'נועם ברק',    vip: false, preview: '#WC-1049 — Bonzo Junior 15kg',                 time: 'לפני שעה וחצי',       unread: 0, status: 'new' },
  { id: 9,  channel: 'whatsapp', name: 'רותי פרץ',    vip: false, preview: 'כמה עולה Royal Canin Mini Junior?',            time: 'לפני 3 שע׳',          unread: 0, status: 'new' },
  { id: 10, channel: 'phone',    name: 'עידן גולן',   vip: false, preview: 'מחיר Whiskas Adult 3.8kg לקופסאות',             time: 'לפני 4 שע׳',          unread: 0, status: 'new' },
  { id: 11, channel: 'whatsapp', name: 'נטע אבני',    vip: false, preview: 'שלחתם כבר את ההזמנה שלי?',                     time: 'לפני 4 שע׳',          unread: 0, status: 'processing' },
  { id: 12, channel: 'woo',      name: 'אורית דוד',   vip: false, preview: 'הזמנה #WC-1047 — הומרה ל-#10251',               time: 'לפני 5 שע׳',          unread: 0, status: 'converted' },
];

const selectedConvo = {
  id: 1,
  customer: 'דני כהן',
  phone: '054-9231455',
  pet: 'רקס',
  petKind: 'כלב',
  vip: true,
  channel: 'whatsapp',
  initials: 'דכ',
  dateLabel: 'יום שני, 19 במאי 2026',
  duplicate: {
    title: 'נמצאה הזמנה דומה מ-40 דקות — WooCommerce #WC-1048',
    body: 'אותו מספר טלפון שהגיש הזמנה ב-2 ערוצים שונים. האם לסמן את האחת ככפולה?',
  },
  summary: {
    items: [
      { name: 'Royal Canin Adult 4kg', qty: 2, price: 298 },
      { name: 'Whiskas Adult Tuna 400g', qty: 1, price: 39 },
    ],
    total: 337,
  },
  messages: [
    { from: 'customer', text: 'שלום, יש לכם Royal Canin Adult 4kg?',            time: '09:42' },
    { from: 'store',    text: 'שלום דני! כן, יש לנו במלאי. המחיר ₪149 לשק.',     time: '09:43' },
    { from: 'customer', text: 'תזמינו לי 2 שקים בבקשה',                          time: '09:44' },
    { from: 'customer', text: 'תוסיפו גם קופסת Whiskas אם אפשר',                 time: '09:45' },
  ],
};

Object.assign(window, { navItems, channelMap, inboxRows, selectedConvo });
