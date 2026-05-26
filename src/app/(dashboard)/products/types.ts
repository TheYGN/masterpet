import 'server-only'

// ============================================================================
// Taxonomy enums (mirror DB CHECK constraints — see prd/_shared/data-model.md)
// ============================================================================

export type AnimalType =
  | 'dog'
  | 'cat'
  | 'rodent'
  | 'bird'
  | 'fish'
  | 'reptile'
  | 'other'

export type AgeGroup = 'puppy' | 'adult' | 'senior' | 'all'

export type DietType =
  | 'regular'
  | 'grain_free'
  | 'hypoallergenic'
  | 'super_premium'
  | 'therapeutic'

export type ProductStatus = 'active' | 'inactive' | 'discontinued'
export type VariantStatus = 'active' | 'inactive'
export type VariantUnit = 'unit' | 'kg' | 'liter' | 'pack'

// Set-form versions for fast input validation
export const ANIMAL_TYPES: readonly AnimalType[] = [
  'dog',
  'cat',
  'rodent',
  'bird',
  'fish',
  'reptile',
  'other',
] as const
export const AGE_GROUPS: readonly AgeGroup[] = ['puppy', 'adult', 'senior', 'all'] as const
export const DIET_TYPES: readonly DietType[] = [
  'regular',
  'grain_free',
  'hypoallergenic',
  'super_premium',
  'therapeutic',
] as const
export const PRODUCT_STATUSES: readonly ProductStatus[] = [
  'active',
  'inactive',
  'discontinued',
] as const
export const VARIANT_STATUSES: readonly VariantStatus[] = ['active', 'inactive'] as const
export const VARIANT_UNITS: readonly VariantUnit[] = ['unit', 'kg', 'liter', 'pack'] as const

// ============================================================================
// DB row shapes (subset of columns the actions select / write)
// cost_price is intentionally *optional* on every shape — DAL omits it from the
// SELECT for non-owner roles, so it may be absent at runtime even for owners
// who created a variant without setting it.
// ============================================================================

export interface ProductRow {
  id: string
  tenant_id: string
  name: string
  description: string | null
  image_url: string | null
  supplier_name: string | null
  animal_type: AnimalType
  age_group: AgeGroup
  diet_type: DietType
  allergen_free: string[]
  tags: string[]
  categories: string[]
  vat_rate: number
  status: ProductStatus
  deleted_at: string | null
  created_at: string
  updated_at: string
}

export interface ProductAttributeRow {
  id: string
  tenant_id: string
  product_id: string
  name: string
  position: number
}

export interface ProductAttributeValueRow {
  id: string
  tenant_id: string
  attribute_id: string
  value: string
  position: number
}

export interface ProductVariantRow {
  id: string
  tenant_id: string
  product_id: string
  sku: string
  barcode: string | null
  internal_code: string | null
  price: number
  /** Owner-only. DAL omits it from SELECT for other roles. */
  cost_price?: number | null
  unit: VariantUnit
  weight_kg: number | null
  status: VariantStatus
  deleted_at: string | null
  created_at: string
  updated_at: string
}

export interface ProductInventoryRow {
  id: string
  tenant_id: string
  branch_id: string
  variant_id: string
  qty: number
  reorder_level: number
  updated_at: string
}

// ============================================================================
// Input shapes — what Server Actions accept
// ============================================================================

export interface CreateProductAttributeInput {
  name: string
  values: string[]
}

export interface CreateProductVariantInput {
  sku: string
  barcode?: string | null
  internal_code?: string | null
  price: number
  cost_price?: number | null
  unit: VariantUnit
  weight_kg?: number | null
  /**
   * Which attribute value each variant has. Indices reference the position of
   * the attribute and value inside `attributes[].values[]` on the create input.
   */
  attribute_value_indices: Array<{ attr_index: number; value_index: number }>
  /** Initial stock quantity applied to the main branch after creation */
  initial_qty?: number | null
  /** Reorder threshold applied to the main branch after creation */
  initial_reorder_level?: number | null
}

export interface CreateProductInput {
  name: string
  description?: string | null
  image_url?: string | null
  supplier_name?: string | null
  animal_type: AnimalType
  age_group: AgeGroup
  diet_type: DietType
  allergen_free: string[]
  tags: string[]
  categories: string[]
  vat_rate: number
  attributes: CreateProductAttributeInput[]
  variants: CreateProductVariantInput[]
}

export interface UpdateProductInput {
  name?: string
  description?: string | null
  image_url?: string | null
  supplier_name?: string | null
  animal_type?: AnimalType
  age_group?: AgeGroup
  diet_type?: DietType
  allergen_free?: string[]
  tags?: string[]
  categories?: string[]
  vat_rate?: number
  status?: ProductStatus
}

export interface UpdateVariantInput {
  sku?: string
  barcode?: string | null
  internal_code?: string | null
  price?: number
  cost_price?: number | null
  unit?: VariantUnit
  weight_kg?: number | null
  status?: VariantStatus
}

export interface UpdateInventoryInput {
  qty?: number
  reorder_level?: number
}

export interface AddAttributeValueInput {
  attributeId: string
  newValues: string[]
}

export interface AddNewAttributeInput {
  name: string
  values: string[]
}

export interface AddVariantToProductInput {
  sku: string
  barcode?: string | null
  internal_code?: string | null
  price: number
  cost_price?: number | null
  unit: VariantUnit
  weight_kg?: number | null
  /** attrName → valueText — action resolves to IDs */
  combination: Record<string, string>
}

export interface AddVariantsToProductInput {
  productId: string
  /** new values to add to existing attributes */
  attributeValueAdditions: AddAttributeValueInput[]
  /** brand-new attributes (for simple→variable conversion) */
  newAttributes: AddNewAttributeInput[]
  /** new variants to create */
  newVariants: AddVariantToProductInput[]
}

export interface ListProductsFilters {
  animal_type?: AnimalType
  age_group?: AgeGroup
  diet_type?: DietType
  status?: ProductStatus
  /** Free-text search across name / sku / barcode / internal_code / tags */
  search?: string
  /** Optional pagination */
  limit?: number
  offset?: number
}

// ============================================================================
// Output shapes — what Server Actions return
// ============================================================================

/** Returned by listProductsAction — joined to give the table a useful summary. */
export interface ProductListItem {
  id: string
  name: string
  image_url: string | null
  animal_type: AnimalType
  age_group: AgeGroup
  diet_type: DietType
  tags: string[]
  status: ProductStatus
  vat_rate: number
  variants_count: number
  /** Sum of qty across all variants the caller can see. */
  total_qty: number
  /** True if at least one visible variant has qty <= reorder_level. */
  low_stock: boolean
  /** Lowest price across all active variants. null if no variants. */
  min_price: number | null
  /** Highest price across all active variants. null if no variants or all same price. */
  max_price: number | null
  created_at: string
  updated_at: string
}

/** A variant nested inside a getProductAction response. */
export interface ProductVariantWithAttributes extends ProductVariantRow {
  attribute_value_ids: string[]
}

/** A single inventory row scoped to the caller's branch (or all for owner). */
export interface InventoryWithBranch extends ProductInventoryRow {
  branch_name?: string | null
}

export interface ProductWithVariants {
  product: ProductRow
  attributes: Array<
    ProductAttributeRow & {
      values: ProductAttributeValueRow[]
    }
  >
  variants: ProductVariantWithAttributes[]
  inventory: InventoryWithBranch[]
}

// ============================================================================
// Action result envelope — every action returns this shape
// ============================================================================

export type ActionResult<T> = { data: T; error?: never } | { data?: never; error: string }
