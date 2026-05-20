// ============ Data: products-list ============

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

// Animal taxonomy used in chips
const animalChip = {
  dog: { label: 'כלב',   icon: 'pets',  kind: 'secondary' },
  cat: { label: 'חתול',  icon: 'pets',  kind: 'tertiary' },
};

// Animal filter chips
const animalFilters = [
  { id: 'all',    label: 'הכל',       icon: null,                       count: 47 },
  { id: 'dog',    label: 'כלב',       icon: 'pets',                     count: 26 },
  { id: 'cat',    label: 'חתול',      icon: 'pets',                     count: 18 },
  { id: 'rodent', label: 'מכרסמים',   icon: 'pest_control_rodent',      count: 2 },
  { id: 'bird',   label: 'ציפורים',   icon: 'yard',                     count: 1 },
  { id: 'fish',   label: 'דגים',      icon: 'water',                    count: 0 },
];

// Products
const products = [
  {
    id: 'rc-maxi', name: "Royal Canin Maxi Adult", brand: 'Royal Canin',
    animal: 'dog', variants: 3, stock: 23,
    priceMin: 85, priceMax: 280, status: 'active',
    imgTint: 'rgba(183,240,187,0.30)',
  },
  {
    id: 'hill-cat', name: "Hill\u2019s Science Diet לחתולים", brand: "Hill\u2019s",
    animal: 'cat', variants: 2, stock: 8,
    priceMin: 149, priceMax: 265, status: 'active',
    imgTint: 'rgba(183,240,187,0.30)',
  },
  {
    id: 'orijen-orig', name: 'Orijen Original', brand: 'Champion Petfoods',
    animal: 'dog', variants: 4, stock: 3, lowStockCount: 2,
    priceMin: 139, priceMax: 890, status: 'active',
    imgTint: 'var(--md-surface-container)',
    lowStock: true,
    lowStockDetail: [
      { variant: 'Orijen Original 11.4kg', left: 2, reorder: 5 },
      { variant: 'Orijen Original 17kg',   left: 1, reorder: 3 },
    ],
  },
  {
    id: 'rc-persian', name: 'Royal Canin Persian Adult', brand: 'Royal Canin',
    animal: 'cat', variants: 2, stock: 12,
    priceMin: 195, priceMax: 340, status: 'active',
    imgTint: 'rgba(183,240,187,0.30)',
  },
  {
    id: 'acana-pacifica', name: 'Acana Pacifica', brand: 'Champion Petfoods',
    animal: 'dog', variants: 3, stock: 1, lowStockCount: 1,
    priceMin: 119, priceMax: 560, status: 'active',
    imgTint: 'var(--md-surface-container)',
    lowStock: true,
    lowStockDetail: [
      { variant: 'Acana Pacifica 11.4kg', left: 1, reorder: 4 },
    ],
  },
  {
    id: 'proplan-sens', name: 'Pro Plan Sensitive', brand: 'Nestlé Purina',
    animal: 'dog', variants: 3, stock: 31,
    priceMin: 98, priceMax: 395, status: 'active',
    imgTint: 'var(--md-surface-container)',
    hovered: true,  // demo: this row shows hover state
  },
  {
    id: 'whiskas-st', name: 'Whiskas Sterilised', brand: 'Mars Petcare',
    animal: 'cat', variants: 1, stock: 0,
    priceMin: 65, priceMax: 65, status: 'inactive',
    imgTint: 'var(--md-surface-container)',
    inactive: true,
  },
];

const kpiSummary = {
  activeProducts: 47,
  lowStock: 6,
  activeVariants: 134,
  discontinued: 3,
  totalCatalog: 47,
};

Object.assign(window, { navItems, animalChip, animalFilters, products, kpiSummary });
