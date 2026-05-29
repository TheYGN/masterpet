// No 'server-only' — used by both ImportModal (client) and server actions

export type ImportTarget = 'products' | 'customers'

export type ImportFieldType = 'text' | 'number' | 'enum'

export interface ImportFieldDef {
  id: string
  label: string
  required: boolean
  type: ImportFieldType
  allowedValues?: readonly string[]
  defaultValue?: string | number
  section: 'product' | 'variant' | 'inventory' | 'customer' | 'dimension'
}

export const PRODUCT_IMPORT_FIELDS: ImportFieldDef[] = [
  { id: 'product.name',         label: 'שם מוצר',               required: true,  type: 'text',   section: 'product' },
  { id: 'product.description',  label: 'תיאור',                  required: false, type: 'text',   section: 'product' },
  { id: 'product.animal_type',  label: 'סוג חיה',                required: false, type: 'enum',   allowedValues: ['dog','cat','rodent','bird','fish','reptile','other'], defaultValue: 'other',   section: 'product' },
  { id: 'product.age_group',    label: 'קבוצת גיל',              required: false, type: 'enum',   allowedValues: ['puppy','adult','senior','all'],                       defaultValue: 'all',     section: 'product' },
  { id: 'product.diet_type',    label: 'סוג דיאטה',              required: false, type: 'enum',   allowedValues: ['regular','grain_free','hypoallergenic','super_premium','therapeutic'], defaultValue: 'regular', section: 'product' },
  { id: 'product.supplier_name',label: 'שם ספק',                 required: false, type: 'text',   section: 'product' },
  { id: 'product.vat_rate',     label: 'מע"מ%',                  required: false, type: 'number', defaultValue: 18,  section: 'product' },
  { id: 'product.tags',         label: 'תגיות (מופרדות בפסיק)',       required: false, type: 'text',   section: 'product' },
  { id: 'product.categories',   label: 'קטגוריות (מופרדות בפסיק)',    required: false, type: 'text',   section: 'product' },
  { id: 'variant.sku',          label: 'SKU',                    required: true,  type: 'text',   section: 'variant' },
  { id: 'variant.barcode',      label: 'ברקוד',                  required: false, type: 'text',   section: 'variant' },
  { id: 'variant.internal_code',label: 'מק"ט פנימי',             required: false, type: 'text',   section: 'variant' },
  { id: 'variant.price',        label: 'מחיר (ללא מע"מ)',        required: true,  type: 'number', section: 'variant' },
  { id: 'variant.cost_price',   label: 'מחיר עלות',              required: false, type: 'number', section: 'variant' },
  { id: 'variant.unit',         label: 'יחידה',                  required: false, type: 'enum',   allowedValues: ['unit','kg','liter','pack'], defaultValue: 'unit', section: 'variant' },
  { id: 'variant.weight_kg',    label: 'משקל ק"ג',               required: false, type: 'number', section: 'variant' },
  { id: 'variant.status',       label: 'סטטוס',                  required: false, type: 'enum',   allowedValues: ['active','inactive'], defaultValue: 'active', section: 'variant' },
  { id: 'inventory.qty',        label: 'כמות במלאי',             required: false, type: 'number', defaultValue: 0,  section: 'inventory' },
  { id: 'inventory.reorder_level', label: 'סף מלאי נמוך',        required: false, type: 'number', defaultValue: 0,  section: 'inventory' },
  // Generic product dimensions (גודל/משקל/נפח). NOT stock (inventory.qty) and NOT
  // shipping weight (variant.weight_kg) — these feed the variant's EAV attribute
  // values via the normalization hook, and the unit also drives variant grouping.
  { id: 'dimension.quantity',   label: 'כמות מימד (גודל/משקל/נפח)', required: false, type: 'number', section: 'dimension' },
  { id: 'dimension.unit',       label: 'יחידת מימד (גרם/מ"ל/ס"מ/יח׳)', required: false, type: 'text', section: 'dimension' },
]

export const CUSTOMER_IMPORT_FIELDS: ImportFieldDef[] = [
  { id: 'customer.full_name',         label: 'שם מלא',            required: true,  type: 'text', section: 'customer' },
  { id: 'customer.first_name',        label: 'שם פרטי',           required: false, type: 'text', section: 'customer' },
  { id: 'customer.last_name',         label: 'שם משפחה',          required: false, type: 'text', section: 'customer' },
  { id: 'customer.phone',             label: 'טלפון',              required: false, type: 'text', section: 'customer' },
  { id: 'customer.phone2',            label: 'טלפון נייד 2',       required: false, type: 'text', section: 'customer' },
  { id: 'customer.email',             label: 'דוא"ל',              required: false, type: 'text', section: 'customer' },
  { id: 'customer.address',           label: 'כתובת (שדה מלא)',    required: false, type: 'text', section: 'customer' },
  { id: 'customer.street',            label: 'רחוב',               required: false, type: 'text', section: 'customer' },
  { id: 'customer.house_number',      label: 'מספר בית',           required: false, type: 'text', section: 'customer' },
  { id: 'customer.apartment',         label: 'דירה',               required: false, type: 'text', section: 'customer' },
  { id: 'customer.floor',             label: 'קומה',               required: false, type: 'text', section: 'customer' },
  { id: 'customer.entrance',          label: 'כניסה',              required: false, type: 'text', section: 'customer' },
  { id: 'customer.city',              label: 'עיר',                required: false, type: 'text', section: 'customer' },
  { id: 'customer.preferred_channel', label: 'ערוץ תקשורת',        required: false, type: 'enum', allowedValues: ['whatsapp','phone','email'], defaultValue: 'whatsapp', section: 'customer' },
  { id: 'customer.branch_name',       label: 'סניף',               required: false, type: 'text', section: 'customer' },
  { id: 'customer.notes',             label: 'הערות',              required: false, type: 'text', section: 'customer' },
  { id: 'customer.joined_at',         label: 'תאריך הצטרפות',      required: false, type: 'text', section: 'customer' },
]

// Parses dates from common Israeli export formats into ISO "YYYY-MM-DD".
// Returns null for empty, unparseable, or obviously bogus values (e.g. Unix epoch 01/01/1970).
export function parseImportDate(raw: string): string | null {
  const s = raw?.trim()
  if (!s) return null

  let day: string, month: string, year: string

  // "HH:MM:SS DD/MM/YYYY" or "H:MM DD/MM/YYYY" — time-prefixed format from old Israeli systems
  const timeFirst = s.match(/^\d{1,2}:\d{2}(?::\d{2})?\s+(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (timeFirst) {
    ;[, day, month, year] = timeFirst
  } else {
    // "DD/MM/YYYY"
    const dmy = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
    if (dmy) {
      ;[, day, month, year] = dmy
    } else {
      // "DD.MM.YYYY"
      const dotDmy = s.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/)
      if (dotDmy) {
        ;[, day, month, year] = dotDmy
      } else {
        // ISO / native-parseable
        const d = new Date(s)
        if (!isNaN(d.getTime()) && d.getFullYear() > 1970) return d.toISOString().slice(0, 10)
        return null
      }
    }
  }

  if (parseInt(year) <= 1970) return null  // filter Unix epoch defaults
  const d = new Date(`${year}-${month!.padStart(2, '0')}-${day!.padStart(2, '0')}`)
  return isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10)
}

// source column name → field id ('product.name' etc.) or '' (skip)
export type ColumnMappingRecord = Record<string, string>

// --- Duplicate handling ---

// How to resolve rows with the same SKU within the uploaded file.
// 'first' = keep the first occurrence, 'last' = keep the last, 'manual' = user picks per-group.
export type IntraFileStrategy = 'first' | 'last' | 'manual'

// Group of rows in the file that share the same SKU (intra-file duplicates).
export interface IntraFileDuplicateGroup {
  sku: string
  rowIndexes: number[]    // all row indexes (0-based, pre-filter) sharing this SKU
  chosenIndex?: number    // set when user manually selects which row to keep
}

// What to do when the imported SKU already exists in the DB for this tenant.
// 'skip'    = leave the existing record untouched, add to error report.
// 'merge'   = update only the fields supplied in the import row (others stay).
// 'replace' = overwrite the variant+inventory completely with the import row data.
export type ConflictStrategy = 'skip' | 'merge' | 'replace'

export interface ImportMappingTemplate {
  id: string
  tenant_id: string
  name: string
  target: ImportTarget
  mapping: ColumnMappingRecord
  created_at: string
  updated_at: string
}

// Raw row from file (before validation)
export type ParsedRow = Record<string, string>

// Structured data extracted from a valid row
export interface ImportRowData {
  product: {
    name: string
    description?: string
    animal_type?: string
    age_group?: string
    diet_type?: string
    supplier_name?: string
    vat_rate: number
    tags: string[]
    categories: string[]
  }
  variant: {
    sku: string
    barcode?: string
    internal_code?: string
    price: number
    cost_price?: number
    unit: string
    weight_kg?: number
    status: string
  }
  inventory: {
    qty: number
    reorder_level: number
  }
  // Generic descriptive dimensions captured from the file's "Quantity"/"Unit" columns.
  // Mapped to the variant's EAV attribute values by normalizeImportRows; the unit
  // also participates in variant grouping. Optional so existing constructors
  // (and rows imported before this field existed) stay valid.
  dimensions?: {
    quantity: number | null
    unit: string | null
  }
}

// Row after client-side validation
export interface ValidatedImportRow {
  rowIndex: number
  raw: ParsedRow
  errors: string[]
  missingSkuType: boolean  // true when SKU field is empty — auto-gen offered instead of hard error
  missingPhone?: boolean   // true when phone field is empty in customer import — skipped by default; importable with placeholder phone when placeholderPhoneForMissing=true
  missingName?: boolean    // true when name is missing or too short in customer import — soft warning, row still importable
  data?: ImportRowData
}

// Generates a unique SKU per import session + row.
// Pattern: IMP-{base36 timestamp}-{padded row index}
// Unique across imports (timestamp) and within an import (rowIndex).
// Scoped to tenant via DB's UNIQUE(tenant_id, sku) — no cross-tenant collision risk.
export function generateAutoSku(importTimestamp: number, rowIndex: number): string {
  return `IMP-${importTimestamp.toString(36).toUpperCase()}-${String(rowIndex + 1).padStart(4, '0')}`
}

// What importProductsAction returns
export interface ImportResult {
  imported: number
  failed: number
  errors: Array<{ rowIndex: number; sku?: string; reason: string }>
}

export function validateCustomerImportRow(
  raw: ParsedRow,
  mapping: ColumnMappingRecord,
  rowIndex: number
): ValidatedImportRow {
  const get = (fieldId: string): string => {
    const srcCol = Object.keys(mapping).find((col) => mapping[col] === fieldId)
    return srcCol ? (raw[srcCol] ?? '').trim() : ''
  }

  const errors: string[] = []

  const full_name_direct = get('customer.full_name')
  const first_name = get('customer.first_name')
  const last_name = get('customer.last_name')
  const full_name = full_name_direct || [first_name, last_name].filter(Boolean).join(' ')
  const missingName = !full_name || full_name.length < 2

  const phone = get('customer.phone')
  const missingPhone = !phone

  return { rowIndex, raw, errors, missingSkuType: false, missingPhone, missingName }
}

// Validation helpers used by both client and server
export function validateImportRow(
  raw: ParsedRow,
  mapping: ColumnMappingRecord,
  rowIndex: number
): ValidatedImportRow {
  const get = (fieldId: string): string => {
    const srcCol = Object.keys(mapping).find((col) => mapping[col] === fieldId)
    return srcCol ? (raw[srcCol] ?? '').trim() : ''
  }

  const errors: string[] = []
  let missingSkuType = false

  // Required fields
  const name = get('product.name')
  if (!name) errors.push('שם מוצר חסר')

  const sku = get('variant.sku')
  if (!sku) missingSkuType = true  // soft — offered auto-gen, not a hard error

  const priceRaw = get('variant.price')
  const price = priceRaw !== '' ? parseFloat(priceRaw) : NaN
  if (priceRaw === '' || isNaN(price) || price < 0) errors.push('מחיר לא חוקי')

  if (errors.length > 0) return { rowIndex, raw, errors, missingSkuType }

  // Optional numeric fields
  const vatRaw = get('product.vat_rate')
  const vatRate = vatRaw !== '' ? parseFloat(vatRaw) : 18
  if (isNaN(vatRate) || vatRate < 0 || vatRate > 100) errors.push('מע"מ% לא חוקי (0-100)')

  const costRaw = get('variant.cost_price')
  const costPrice = costRaw !== '' ? parseFloat(costRaw) : undefined
  if (costRaw !== '' && (isNaN(costPrice!) || costPrice! < 0)) errors.push('מחיר עלות לא חוקי')

  const wkgRaw = get('variant.weight_kg')
  const weightKg = wkgRaw !== '' ? parseFloat(wkgRaw) : undefined
  if (wkgRaw !== '' && (isNaN(weightKg!) || weightKg! < 0)) errors.push('משקל לא חוקי')

  const qtyRaw = get('inventory.qty')
  const qty = qtyRaw !== '' ? parseFloat(qtyRaw) : 0
  if (isNaN(qty) || qty < 0) errors.push('כמות מלאי לא חוקית')

  const reorderRaw = get('inventory.reorder_level')
  const reorderLevel = reorderRaw !== '' ? parseFloat(reorderRaw) : 0
  if (isNaN(reorderLevel) || reorderLevel < 0) errors.push('סף מלאי לא חוקי')

  // Descriptive dimensions (size/weight/volume) → mapped to EAV attribute values, not stock/weight.
  const dimQtyRaw = get('dimension.quantity')
  const dimQuantity = dimQtyRaw !== '' ? parseFloat(dimQtyRaw) : null
  if (dimQtyRaw !== '' && isNaN(dimQuantity!)) errors.push('כמות מימד לא חוקית')
  const dimUnit = get('dimension.unit') || null

  // Enum coercion (unknown → default)
  const animalRaw = get('product.animal_type').toLowerCase()
  const animal_type = ['dog','cat','rodent','bird','fish','reptile','other'].includes(animalRaw) ? animalRaw : 'other'

  const ageRaw = get('product.age_group').toLowerCase()
  const age_group = ['puppy','adult','senior','all'].includes(ageRaw) ? ageRaw : 'all'

  const dietRaw = get('product.diet_type').toLowerCase()
  const diet_type = ['regular','grain_free','hypoallergenic','super_premium','therapeutic'].includes(dietRaw) ? dietRaw : 'regular'

  const unitRaw = get('variant.unit').toLowerCase()
  const unit = ['unit','kg','liter','pack'].includes(unitRaw) ? unitRaw : 'unit'

  const statusRaw = get('variant.status').toLowerCase()
  const status = ['active','כן','yes','true','1'].includes(statusRaw)
    ? 'active'
    : ['inactive','לא','no','false','0'].includes(statusRaw)
      ? 'inactive'
      : 'active'

  const tagsRaw = get('product.tags')
  const categoriesRaw = get('product.categories')
  const tags = tagsRaw ? tagsRaw.split(',').map((t) => t.trim()).filter(Boolean) : []
  const categories = categoriesRaw ? categoriesRaw.split(',').map((t) => t.trim()).filter(Boolean) : []

  if (errors.length > 0) return { rowIndex, raw, errors, missingSkuType }

  return {
    rowIndex,
    raw,
    errors: [],
    missingSkuType,
    data: {
      product: {
        name,
        description:    get('product.description') || undefined,
        animal_type,
        age_group,
        diet_type,
        supplier_name:  get('product.supplier_name') || undefined,
        vat_rate:       vatRate,
        tags,
        categories,
      },
      variant: {
        sku,
        barcode:        get('variant.barcode') || undefined,
        internal_code:  get('variant.internal_code') || undefined,
        price,
        cost_price:     costPrice,
        unit,
        weight_kg:      weightKg,
        status,
      },
      inventory: { qty, reorder_level: reorderLevel },
      dimensions: { quantity: dimQuantity, unit: dimUnit },
    },
  }
}
