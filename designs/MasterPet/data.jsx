// ============ Realistic Hebrew sample data ============

const navItems = [
  { id: 'dashboard', label: 'דשבורד', icon: 'space_dashboard' },
  { id: 'inbox', label: 'אינבוקס', icon: 'inbox', badge: 5 },
  { id: 'orders', label: 'הזמנות', icon: 'receipt_long' },
  { id: 'inventory', label: 'מלאי', icon: 'inventory_2' },
  { id: 'crm', label: 'לקוחות', icon: 'group' },
  { id: 'loyalty', label: 'נאמנות', icon: 'loyalty' },
  { id: 'automations', label: 'אוטומציות', icon: 'bolt' },
  { id: 'settings', label: 'הגדרות', icon: 'settings' },
];

// Sparkline points for revenue (last 7 days)
const sparkRevenue = [8200, 9100, 7400, 10550, 11200, 10500, 12450];

// Recent orders
const orders = [
  {
    id: '#10248', customer: 'דני כהן', pet: 'רקס (כלב)',
    product: 'Royal Canin Adult 4kg', qty: 2, price: 298,
    channel: 'whatsapp', status: 'new', time: 'לפני 4 דק׳',
  },
  {
    id: '#10247', customer: 'מיכל לוי', pet: 'לונה (חתול)',
    product: 'Hill\u2019s Science Plan Kitten 2kg', qty: 1, price: 142,
    channel: 'woo', status: 'new', time: 'לפני 12 דק׳',
  },
  {
    id: '#10246', customer: 'יוסי אברהמי', pet: 'בלקי (כלב)',
    product: 'Acana Pacifica 11.4kg', qty: 1, price: 489,
    channel: 'phone', status: 'processing', time: 'לפני 38 דק׳',
  },
  {
    id: '#10245', customer: 'שירה רוזן', pet: 'מילו (חתול)',
    product: 'Pro Plan Sterilised 10kg', qty: 1, price: 319,
    channel: 'whatsapp', status: 'processing', time: 'לפני שעה',
  },
  {
    id: '#10244', customer: 'אבי שטרן', pet: 'צ׳רלי (כלב)',
    product: 'Orijen Six Fish 6kg', qty: 1, price: 412,
    channel: 'woo', status: 'shipped', time: 'לפני שעתיים',
  },
  {
    id: '#10243', customer: 'רותי פרץ', pet: 'שוקו (חתול)',
    product: 'Whiskas 1+ Adult 3.8kg ×4', qty: 4, price: 184,
    channel: 'whatsapp', status: 'shipped', time: 'לפני 3 שע׳',
  },
  {
    id: '#10242', customer: 'נועם ברק', pet: 'לוקי (כלב)',
    product: 'Bonzo Junior 15kg', qty: 1, price: 189,
    channel: 'phone', status: 'done', time: 'לפני 4 שע׳',
  },
  {
    id: '#10241', customer: 'עידן גולן', pet: 'בני (כלב)',
    product: 'Royal Canin Maxi Adult 15kg', qty: 1, price: 469,
    channel: 'woo', status: 'done', time: 'לפני 5 שע׳',
  },
];

const statusMap = {
  new:        { label: 'חדש',    kind: 'filled-primary' },
  processing: { label: 'בטיפול', kind: 'tonal-secondary' },
  shipped:    { label: 'נשלח',   kind: 'tonal-tertiary' },
  done:       { label: 'הושלם',  kind: 'outlined' },
};

const channelMap = {
  whatsapp: { label: 'WhatsApp', icon: 'chat',     color: '#25D366' },
  phone:    { label: 'טלפון',   icon: 'call',     color: '#52634F' },
  woo:      { label: 'WooCommerce', icon: 'shopping_cart', color: '#7F54B3' },
};

// Alerts
const alerts = [
  {
    sev: 'error',
    icon: 'pets',
    title: 'דני כהן — הכלב רקס עומד לאזול בעוד 4 ימים',
    body: 'מנת אחרונה: Royal Canin Adult 4kg · 12 במאי',
    cta: 'שלח WhatsApp', ctaIcon: 'send',
  },
  {
    sev: 'warning',
    icon: 'inventory_2',
    title: 'מלאי: Royal Canin Puppy — נשארו 12 שקיות',
    body: 'מתחת לסף המינימום (20). זמן אספקה משוער: 3 ימי עסקים.',
    cta: 'הזמן ממחסן', ctaIcon: 'local_shipping',
  },
  {
    sev: 'warning',
    icon: 'schedule',
    title: '3 הזמנות ממתינות לאישור מעל שעתיים',
    body: 'הזמנות #10243, #10242, #10240 · ערוץ: WhatsApp',
    cta: 'ראה הזמנות', ctaIcon: 'arrow_back',
  },
  {
    sev: 'error',
    icon: 'sentiment_dissatisfied',
    title: 'תלונה חדשה — מיכל לוי (CSAT 2/5)',
    body: '"החתולה לונה לא אכלה מהשק שהגיע" · הזמנה #10231',
    cta: 'פתח שיחה', ctaIcon: 'forum',
  },
];

// 30-day revenue chart data
// Two series: manual (phone + WhatsApp combined) and digital (WooCommerce)
// Days are 19 בנים׳ → 18 במאי (Hebrew shorthand)
const chartDays = (() => {
  // Build 30 days ending today (18 May 2026 in user spec).
  // Hebrew short date format: ‎"19 אפר׳"‎ etc.
  const hebMonths = ['ינו׳', 'פבר׳', 'מרץ', 'אפר׳', 'מאי', 'יונ׳', 'יול׳', 'אוג׳', 'ספט׳', 'אוק׳', 'נוב׳', 'דצמ׳'];
  const end = new Date(2026, 4, 18); // May 18, 2026
  const days = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(end);
    d.setDate(end.getDate() - i);
    days.push({
      day: d.getDate(),
      month: hebMonths[d.getMonth()],
      label: `${d.getDate()} ${hebMonths[d.getMonth()]}`,
      dayOfWeek: d.getDay(), // 0=sun
    });
  }
  // Realistic revenue: weekends (Fri=5, Sat=6 in JS for Israel; Israel weekend is Fri/Sat)
  // Manual ~ 60% of total, digital ~ 40%, with weekly seasonality + upward trend.
  return days.map((d, i) => {
    const trend = 6000 + i * 90;
    const dow = d.dayOfWeek;
    const seas = dow === 5 ? 0.45 : dow === 6 ? 0.25 : dow === 0 ? 1.15 : 1.0;
    const noise = (Math.sin(i * 1.7) + Math.cos(i * 0.9)) * 800;
    const total = Math.max(2200, trend * seas + noise);
    const manual = Math.round(total * (0.55 + Math.sin(i * 0.4) * 0.08));
    const digital = Math.round(total - manual);
    return { ...d, manual, digital, total: manual + digital };
  });
})();

const lowStockPreview = [
  { name: 'Royal Canin Puppy 4kg', left: 12, min: 20 },
  { name: 'Hill\u2019s i/d Digestive 12kg', left: 3, min: 10 },
  { name: 'Whiskas Tuna 85g (×24)', left: 8, min: 30 },
];

const runOutPreview = [
  { customer: 'דני כהן', pet: 'רקס', days: 4, product: 'Royal Canin Adult' },
  { customer: 'תמר בן-עמי', pet: 'נלה', days: 5, product: 'Acana Pacifica' },
  { customer: 'אורי דהן', pet: 'גוגו', days: 6, product: 'Hill\u2019s Sensitive' },
  { customer: 'נטע אבני', pet: 'פיצי', days: 7, product: 'Pro Plan Adult' },
];

Object.assign(window, {
  navItems, orders, statusMap, channelMap, alerts,
  sparkRevenue, chartDays, lowStockPreview, runOutPreview,
});
