// ============ Data: product-sheet ============

const navItems = [
  { id: 'dashboard',  label: 'דשבורד',    icon: 'space_dashboard' },
  { id: 'inbox',      label: 'אינבוקס',   icon: 'inbox' },
  { id: 'orders',     label: 'הזמנות',    icon: 'receipt_long' },
  { id: 'inventory',  label: 'מלאי',      icon: 'inventory_2' },
  { id: 'crm',        label: 'לקוחות',    icon: 'group' },
  { id: 'loyalty',    label: 'נאמנות',    icon: 'loyalty' },
  { id: 'automations', label: 'אוטומציות', icon: 'bolt' },
  { id: 'settings',   label: 'הגדרות',    icon: 'settings' },
];

const variants = [
  { id: 1, sizeChip: '1kg', flavorChip: 'עוף',  sku: 'RC-MAXI-1KG-OF', price: '85.00',  priceVat: '100.30', cost: '54.00',  barcode: '729009023523', status: 'active', barcodeError: 'ברקוד כבר קיים במערכת' },
  { id: 2, sizeChip: '1kg', flavorChip: 'ארנב', sku: 'RC-MAXI-1KG-RA', price: '92.00',  priceVat: '108.56', cost: '58.00',  barcode: '729009023530', status: 'active' },
  { id: 3, sizeChip: '2kg', flavorChip: 'עוף',  sku: 'RC-MAXI-2KG-OF', price: '165.00', priceVat: '194.70', cost: '105.00', barcode: '729009023547', status: 'active' },
  { id: 4, sizeChip: '2kg', flavorChip: 'ארנב', sku: 'RC-MAXI-2KG-RA', price: '178.00', priceVat: '210.04', cost: '112.00', barcode: '729009023554', status: 'active' },
  { id: 5, sizeChip: '4kg', flavorChip: 'עוף',  sku: 'RC-MAXI-4KG-OF', price: '280.00', priceVat: '330.40', cost: '178.00', barcode: '729009023561', status: 'active', focused: true },
  { id: 6, sizeChip: '4kg', flavorChip: 'ארנב', sku: 'RC-MAXI-4KG-RA', price: '295.00', priceVat: '348.10', cost: '188.00', barcode: '729009023578', status: 'active' },
];

// Background ghost list for the scrim layer
const bgProducts = [
  { name: 'Royal Canin Maxi Adult',     brand: 'Royal Canin',       animal: 'dog', variants: 3, stock: '23',  price: '₪85 – ₪280',  status: 'active' },
  { name: "Hill\u2019s Science Diet לחתולים", brand: "Hill\u2019s",  animal: 'cat', variants: 2, stock: '8',   price: '₪149 – ₪265', status: 'active' },
  { name: 'Orijen Original',            brand: 'Champion Petfoods', animal: 'dog', variants: 4, stock: '3',   price: '₪139 – ₪890', status: 'active', lowStock: true },
  { name: 'Royal Canin Persian Adult',  brand: 'Royal Canin',       animal: 'cat', variants: 2, stock: '12',  price: '₪195 – ₪340', status: 'active' },
  { name: 'Acana Pacifica',             brand: 'Champion Petfoods', animal: 'dog', variants: 3, stock: '1',   price: '₪119 – ₪560', status: 'active', lowStock: true },
  { name: 'Pro Plan Sensitive',         brand: 'Nestlé Purina',     animal: 'dog', variants: 3, stock: '31',  price: '₪98 – ₪395',  status: 'active' },
  { name: 'Whiskas Sterilised',         brand: 'Mars Petcare',      animal: 'cat', variants: 1, stock: '0',   price: '₪65',         status: 'inactive' },
];

Object.assign(window, { navItems, variants, bgProducts });
