'use server'

import { revalidatePath } from 'next/cache'
import { withAuth } from '@/app/lib/auth-wrapper'
import { writeAudit } from '@/app/lib/audit'
import { getAuthenticatedClient } from '@/app/lib/dal'
import type { Session } from '@/app/lib/definitions'
import type {
  ActionResult,
  CreateProductInput,
  ListProductsFilters,
  ProductAttributeRow,
  ProductAttributeValueRow,
  ProductInventoryRow,
  ProductListItem,
  ProductRow,
  ProductVariantRow,
  ProductVariantWithAttributes,
  ProductWithVariants,
  UpdateInventoryInput,
  UpdateProductInput,
  UpdateVariantInput,
  VariantUnit,
} from './types'
import {
  AGE_GROUPS,
  ANIMAL_TYPES,
  DIET_TYPES,
  PRODUCT_STATUSES,
  VARIANT_STATUSES,
  VARIANT_UNITS,
} from './types'

const GENERIC_ERROR = 'הפעולה נכשלה, נסה שוב'
const PRODUCTS_PATH = '/products'

// ============================================================================
// Helpers
// ============================================================================

/**
 * Column list used everywhere we read product_variants.
 * For non-owner roles we omit cost_price from the SELECT so it never lands
 * in the network response — this is enforced in the DAL, NOT via RLS.
 */
function variantColumns(role: Session['profile']['role']): string {
  const base =
    'id, tenant_id, product_id, sku, barcode, internal_code, price, unit, weight_kg, status, created_at, updated_at'
  return role === 'owner' ? `${base}, cost_price` : base
}

function isAnimalType(v: unknown): v is (typeof ANIMAL_TYPES)[number] {
  return typeof v === 'string' && (ANIMAL_TYPES as readonly string[]).includes(v)
}
function isAgeGroup(v: unknown): v is (typeof AGE_GROUPS)[number] {
  return typeof v === 'string' && (AGE_GROUPS as readonly string[]).includes(v)
}
function isDietType(v: unknown): v is (typeof DIET_TYPES)[number] {
  return typeof v === 'string' && (DIET_TYPES as readonly string[]).includes(v)
}
function isProductStatus(v: unknown): v is (typeof PRODUCT_STATUSES)[number] {
  return typeof v === 'string' && (PRODUCT_STATUSES as readonly string[]).includes(v)
}
function isVariantStatus(v: unknown): v is (typeof VARIANT_STATUSES)[number] {
  return typeof v === 'string' && (VARIANT_STATUSES as readonly string[]).includes(v)
}
function isVariantUnit(v: unknown): v is VariantUnit {
  return typeof v === 'string' && (VARIANT_UNITS as readonly string[]).includes(v)
}

/** Escape % and _ inside a Supabase `ilike` pattern so they're treated literally. */
function escapeLike(input: string): string {
  return input.replace(/[\\%_]/g, (m) => `\\${m}`)
}

// ============================================================================
// 1. createProductAction — owner only
// ============================================================================

export const createProductAction = withAuth(
  ['owner'],
  async (session, input: CreateProductInput): Promise<ActionResult<{ productId: string }>> => {
    // ---- 1a. Input validation -------------------------------------------------
    if (!input.name?.trim()) return { error: 'שם המוצר הוא שדה חובה' }
    if (!isAnimalType(input.animal_type)) return { error: 'סוג חיה לא חוקי' }
    if (!isAgeGroup(input.age_group)) return { error: 'קבוצת גיל לא חוקית' }
    if (!isDietType(input.diet_type)) return { error: 'סוג דיאטה לא חוקי' }
    if (typeof input.vat_rate !== 'number' || input.vat_rate < 0)
      return { error: 'אחוז מע"מ חייב להיות מספר אי-שלילי' }
    if (!Array.isArray(input.variants) || input.variants.length === 0)
      return { error: 'חייב להגדיר לפחות variant אחד' }

    for (const v of input.variants) {
      if (!v.sku?.trim()) return { error: 'לכל variant חייב SKU' }
      if (typeof v.price !== 'number' || v.price < 0)
        return { error: `מחיר ל-SKU ${v.sku} חייב להיות מספר אי-שלילי` }
      if (v.cost_price != null && (typeof v.cost_price !== 'number' || v.cost_price < 0))
        return { error: `מחיר עלות ל-SKU ${v.sku} חייב להיות מספר אי-שלילי` }
      if (!isVariantUnit(v.unit)) return { error: `יחידת מידה ל-SKU ${v.sku} לא חוקית` }
      if (v.weight_kg != null && (typeof v.weight_kg !== 'number' || v.weight_kg < 0))
        return { error: `משקל ל-SKU ${v.sku} חייב להיות מספר אי-שלילי` }
    }

    const tenantId = session.profile.tenant_id
    const supabase = await getAuthenticatedClient()

    // ---- 1b. INSERT product ---------------------------------------------------
    const { data: product, error: productErr } = await supabase
      .from('products')
      .insert({
        tenant_id: tenantId,
        name: input.name.trim(),
        description: input.description?.trim() || null,
        image_url: input.image_url?.trim() || null,
        supplier_name: input.supplier_name?.trim() || null,
        animal_type: input.animal_type,
        age_group: input.age_group,
        diet_type: input.diet_type,
        allergen_free: input.allergen_free ?? [],
        tags: input.tags ?? [],
        vat_rate: input.vat_rate,
      })
      .select('id')
      .single()

    if (productErr || !product) {
      console.error('[createProduct] insert product failed', productErr)
      return { error: GENERIC_ERROR }
    }

    const productId = product.id as string

    // ---- 1c. INSERT attributes + values (build attr_index -> value_index -> id map)
    // attrValueIdMap[attrIndex][valueIndex] = attribute_value_id
    const attrValueIdMap: string[][] = []

    for (let ai = 0; ai < input.attributes.length; ai++) {
      const attr = input.attributes[ai]
      if (!attr.name?.trim() || !Array.isArray(attr.values) || attr.values.length === 0) {
        await rollbackProduct(productId)
        return { error: `attribute ב-index ${ai} לא חוקי (חסר שם או ערכים)` }
      }

      const { data: attrRow, error: attrErr } = await supabase
        .from('product_attributes')
        .insert({
          tenant_id: tenantId,
          product_id: productId,
          name: attr.name.trim(),
          position: ai,
        })
        .select('id')
        .single()

      if (attrErr || !attrRow) {
        console.error('[createProduct] insert attribute failed', attrErr)
        await rollbackProduct(productId)
        return { error: GENERIC_ERROR }
      }

      const attributeId = attrRow.id as string

      const valuesPayload = attr.values.map((v, vi) => ({
        tenant_id: tenantId,
        attribute_id: attributeId,
        value: v,
        position: vi,
      }))

      const { data: valueRows, error: valuesErr } = await supabase
        .from('product_attribute_values')
        .insert(valuesPayload)
        .select('id, position')

      if (valuesErr || !valueRows) {
        console.error('[createProduct] insert attribute values failed', valuesErr)
        await rollbackProduct(productId)
        return { error: GENERIC_ERROR }
      }

      // Order valueRows by position so vi index lines up
      const ordered = [...valueRows].sort((a, b) => a.position - b.position)
      attrValueIdMap[ai] = ordered.map((r) => r.id as string)
    }

    // ---- 1d. INSERT variants + variant_attribute_values ----------------------
    for (const v of input.variants) {
      const { data: variantRow, error: variantErr } = await supabase
        .from('product_variants')
        .insert({
          tenant_id: tenantId,
          product_id: productId,
          sku: v.sku.trim(),
          barcode: v.barcode?.trim() || null,
          internal_code: v.internal_code?.trim() || null,
          price: v.price,
          cost_price: v.cost_price ?? null,
          unit: v.unit,
          weight_kg: v.weight_kg ?? null,
        })
        .select('id')
        .single()

      if (variantErr || !variantRow) {
        console.error('[createProduct] insert variant failed', { sku: v.sku, err: variantErr })
        await rollbackProduct(productId)
        return {
          error:
            variantErr?.code === '23505'
              ? `SKU ${v.sku} כבר קיים`
              : GENERIC_ERROR,
        }
      }

      const variantId = variantRow.id as string

      if (v.attribute_value_indices.length > 0) {
        const linkPayload: Array<{ variant_id: string; attribute_value_id: string }> = []
        for (const link of v.attribute_value_indices) {
          const id = attrValueIdMap[link.attr_index]?.[link.value_index]
          if (!id) {
            console.error('[createProduct] invalid attribute_value_indices', link)
            await rollbackProduct(productId)
            return { error: 'הצלבת ערכי attribute לא חוקית' }
          }
          linkPayload.push({ variant_id: variantId, attribute_value_id: id })
        }

        const { error: linkErr } = await supabase
          .from('variant_attribute_values')
          .insert(linkPayload)
        if (linkErr) {
          console.error('[createProduct] insert variant_attribute_values failed', linkErr)
          await rollbackProduct(productId)
          return { error: GENERIC_ERROR }
        }
      }
    }

    // ---- 1e. Audit + revalidate ----------------------------------------------
    await writeAudit({
      action: 'product.created',
      session,
      entityType: 'product',
      entityId: productId,
      metadata: {
        name: input.name.trim(),
        variants_count: input.variants.length,
      },
    })

    revalidatePath(PRODUCTS_PATH)
    return { data: { productId } }
  }
)

/**
 * Best-effort rollback: delete the parent product. CASCADE FKs clean up
 * attributes, values, variants, variant_attribute_values, and inventory.
 * We rely on the user's authenticated client — RLS only allows owner-of-tenant
 * to delete their own row, so this can never cross tenants.
 */
async function rollbackProduct(productId: string): Promise<void> {
  try {
    const supabase = await getAuthenticatedClient()
    const { error } = await supabase.from('products').delete().eq('id', productId)
    if (error) {
      console.error('[createProduct] rollback DELETE failed', {
        productId,
        error: error.message,
      })
    }
  } catch (err) {
    console.error('[createProduct] rollback threw', { productId, err })
  }
}

// ============================================================================
// 2. updateProductAction — owner only
// ============================================================================

export const updateProductAction = withAuth(
  ['owner'],
  async (
    session,
    productId: string,
    updates: UpdateProductInput
  ): Promise<ActionResult<{ productId: string }>> => {
    if (!productId) return { error: 'productId חסר' }

    const patch: Record<string, unknown> = {}
    if (updates.name !== undefined) {
      if (!updates.name.trim()) return { error: 'שם המוצר לא יכול להיות ריק' }
      patch.name = updates.name.trim()
    }
    if (updates.description !== undefined) patch.description = updates.description?.trim() || null
    if (updates.image_url !== undefined) patch.image_url = updates.image_url?.trim() || null
    if (updates.supplier_name !== undefined)
      patch.supplier_name = updates.supplier_name?.trim() || null
    if (updates.animal_type !== undefined) {
      if (!isAnimalType(updates.animal_type)) return { error: 'סוג חיה לא חוקי' }
      patch.animal_type = updates.animal_type
    }
    if (updates.age_group !== undefined) {
      if (!isAgeGroup(updates.age_group)) return { error: 'קבוצת גיל לא חוקית' }
      patch.age_group = updates.age_group
    }
    if (updates.diet_type !== undefined) {
      if (!isDietType(updates.diet_type)) return { error: 'סוג דיאטה לא חוקי' }
      patch.diet_type = updates.diet_type
    }
    if (updates.allergen_free !== undefined) patch.allergen_free = updates.allergen_free
    if (updates.tags !== undefined) patch.tags = updates.tags
    if (updates.vat_rate !== undefined) {
      if (typeof updates.vat_rate !== 'number' || updates.vat_rate < 0)
        return { error: 'אחוז מע"מ חייב להיות מספר אי-שלילי' }
      patch.vat_rate = updates.vat_rate
    }
    if (updates.status !== undefined) {
      if (!isProductStatus(updates.status)) return { error: 'סטטוס לא חוקי' }
      patch.status = updates.status
    }

    if (Object.keys(patch).length === 0) return { data: { productId } }

    patch.updated_at = new Date().toISOString()

    const supabase = await getAuthenticatedClient()
    const { error } = await supabase
      .from('products')
      .update(patch)
      .eq('id', productId)
      .is('deleted_at', null)

    if (error) {
      console.error('[updateProduct] update failed', error)
      return { error: GENERIC_ERROR }
    }

    await writeAudit({
      action: 'product.updated',
      session,
      entityType: 'product',
      entityId: productId,
      metadata: { fields: Object.keys(patch).filter((k) => k !== 'updated_at') },
    })

    revalidatePath(PRODUCTS_PATH)
    return { data: { productId } }
  }
)

// ============================================================================
// 3. updateVariantAction — owner only
// ============================================================================

export const updateVariantAction = withAuth(
  ['owner'],
  async (
    session,
    variantId: string,
    updates: UpdateVariantInput
  ): Promise<ActionResult<{ variantId: string }>> => {
    if (!variantId) return { error: 'variantId חסר' }

    const patch: Record<string, unknown> = {}
    if (updates.sku !== undefined) {
      if (!updates.sku.trim()) return { error: 'SKU לא יכול להיות ריק' }
      patch.sku = updates.sku.trim()
    }
    if (updates.barcode !== undefined) patch.barcode = updates.barcode?.trim() || null
    if (updates.internal_code !== undefined)
      patch.internal_code = updates.internal_code?.trim() || null
    if (updates.price !== undefined) {
      if (typeof updates.price !== 'number' || updates.price < 0)
        return { error: 'מחיר חייב להיות מספר אי-שלילי' }
      patch.price = updates.price
    }
    if (updates.cost_price !== undefined) {
      if (
        updates.cost_price !== null &&
        (typeof updates.cost_price !== 'number' || updates.cost_price < 0)
      )
        return { error: 'מחיר עלות חייב להיות מספר אי-שלילי' }
      patch.cost_price = updates.cost_price
    }
    if (updates.unit !== undefined) {
      if (!isVariantUnit(updates.unit)) return { error: 'יחידת מידה לא חוקית' }
      patch.unit = updates.unit
    }
    if (updates.weight_kg !== undefined) {
      if (
        updates.weight_kg !== null &&
        (typeof updates.weight_kg !== 'number' || updates.weight_kg < 0)
      )
        return { error: 'משקל חייב להיות מספר אי-שלילי' }
      patch.weight_kg = updates.weight_kg
    }
    if (updates.status !== undefined) {
      if (!isVariantStatus(updates.status)) return { error: 'סטטוס variant לא חוקי' }
      patch.status = updates.status
    }

    if (Object.keys(patch).length === 0) return { data: { variantId } }

    patch.updated_at = new Date().toISOString()

    const supabase = await getAuthenticatedClient()
    const { error } = await supabase.from('product_variants').update(patch).eq('id', variantId)

    if (error) {
      console.error('[updateVariant] update failed', error)
      return {
        error: error.code === '23505' ? `SKU כפול: ${updates.sku ?? ''}` : GENERIC_ERROR,
      }
    }

    await writeAudit({
      action: 'product_variant.updated',
      session,
      entityType: 'product_variant',
      entityId: variantId,
      metadata: { fields: Object.keys(patch).filter((k) => k !== 'updated_at') },
    })

    revalidatePath(PRODUCTS_PATH)
    return { data: { variantId } }
  }
)

// ============================================================================
// 4. updateInventoryAction — owner / branch_manager / warehouse
// ============================================================================

export const updateInventoryAction = withAuth(
  ['owner', 'branch_manager', 'warehouse'],
  async (
    session,
    inventoryId: string,
    updates: UpdateInventoryInput
  ): Promise<ActionResult<{ inventoryId: string }>> => {
    if (!inventoryId) return { error: 'inventoryId חסר' }

    const patch: Record<string, unknown> = {}
    if (updates.qty !== undefined) {
      if (typeof updates.qty !== 'number' || updates.qty < 0)
        return { error: 'כמות חייבת להיות מספר אי-שלילי' }
      patch.qty = updates.qty
    }
    if (updates.reorder_level !== undefined) {
      if (typeof updates.reorder_level !== 'number' || updates.reorder_level < 0)
        return { error: 'רף הזמנה חוזרת חייב להיות מספר אי-שלילי' }
      patch.reorder_level = updates.reorder_level
    }

    if (Object.keys(patch).length === 0) return { data: { inventoryId } }

    patch.updated_at = new Date().toISOString()

    const supabase = await getAuthenticatedClient()
    // RLS handles branch isolation — sales/warehouse can only see/update their
    // own branch. owner / branch_manager see everything in the tenant.
    const { data: updated, error } = await supabase
      .from('product_inventory')
      .update(patch)
      .eq('id', inventoryId)
      .select('id, branch_id, variant_id')
      .maybeSingle()

    if (error) {
      console.error('[updateInventory] update failed', error)
      return { error: GENERIC_ERROR }
    }
    if (!updated) {
      // RLS hid the row, or the id doesn't exist
      return { error: 'שורת מלאי לא נמצאה' }
    }

    await writeAudit({
      action: 'product_inventory.updated',
      session,
      entityType: 'product_inventory',
      entityId: inventoryId,
      metadata: {
        branch_id: updated.branch_id,
        variant_id: updated.variant_id,
        ...patch,
      },
    })

    revalidatePath(PRODUCTS_PATH)
    return { data: { inventoryId } }
  }
)

// ============================================================================
// 5. listProductsAction — all dashboard roles
// ============================================================================

export const listProductsAction = withAuth(
  ['owner', 'branch_manager', 'sales', 'warehouse'],
  async (
    session,
    filters: ListProductsFilters = {}
  ): Promise<ActionResult<ProductListItem[]>> => {
    const supabase = await getAuthenticatedClient()

    // Build query — RLS hides soft-deleted rows automatically, but we keep the
    // explicit `.is('deleted_at', null)` for clarity in case the policy ever
    // changes.
    let query = supabase
      .from('products')
      .select(
        `id, name, image_url, animal_type, age_group, diet_type, tags, status, vat_rate, created_at, updated_at,
         variants:product_variants(${variantColumns(session.profile.role)},
           inventory:product_inventory(qty, reorder_level)
         )`
      )
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    if (filters.animal_type) {
      if (!isAnimalType(filters.animal_type)) return { error: 'סוג חיה לא חוקי' }
      query = query.eq('animal_type', filters.animal_type)
    }
    if (filters.age_group) {
      if (!isAgeGroup(filters.age_group)) return { error: 'קבוצת גיל לא חוקית' }
      query = query.eq('age_group', filters.age_group)
    }
    if (filters.diet_type) {
      if (!isDietType(filters.diet_type)) return { error: 'סוג דיאטה לא חוקי' }
      query = query.eq('diet_type', filters.diet_type)
    }
    if (filters.status) {
      if (!isProductStatus(filters.status)) return { error: 'סטטוס לא חוקי' }
      query = query.eq('status', filters.status)
    }
    if (filters.search?.trim()) {
      const term = escapeLike(filters.search.trim())
      // Top-level fields: name, tags (array contains)
      // SKU / barcode / internal_code live on variants — Postgres can't `or`
      // across joined tables in one shot, so we OR on product.name + tags here
      // and rely on a second filter step below for SKU-style matches.
      query = query.or(`name.ilike.%${term}%,tags.cs.{${term}}`)
    }
    if (typeof filters.limit === 'number' && filters.limit > 0) {
      const offset = typeof filters.offset === 'number' && filters.offset > 0 ? filters.offset : 0
      query = query.range(offset, offset + filters.limit - 1)
    }

    const { data, error } = await query

    if (error) {
      console.error('[listProducts] select failed', error)
      return { error: GENERIC_ERROR }
    }

    // If search included a SKU-style term, we additionally filter rows that
    // matched on variant fields. Done client-side because of the cross-table
    // OR limitation.
    type RawRow = ProductRow & {
      variants: Array<
        ProductVariantRow & { inventory: Array<{ qty: number; reorder_level: number }> }
      >
    }
    let rows = (data ?? []) as unknown as RawRow[]

    if (filters.search?.trim()) {
      const term = filters.search.trim().toLowerCase()
      rows = rows.filter((r) => {
        const matchTop =
          r.name?.toLowerCase().includes(term) || r.tags?.some((t) => t.toLowerCase() === term)
        const matchVariant = r.variants?.some(
          (v) =>
            v.sku?.toLowerCase().includes(term) ||
            v.barcode?.toLowerCase().includes(term) ||
            v.internal_code?.toLowerCase().includes(term)
        )
        return matchTop || matchVariant
      })
    }

    const items: ProductListItem[] = rows.map((r) => {
      const variants = r.variants ?? []
      let totalQty = 0
      let lowStock = false
      for (const v of variants) {
        for (const inv of v.inventory ?? []) {
          totalQty += inv.qty ?? 0
          if ((inv.qty ?? 0) <= (inv.reorder_level ?? 0)) lowStock = true
        }
      }
      return {
        id: r.id,
        name: r.name,
        image_url: r.image_url,
        animal_type: r.animal_type,
        age_group: r.age_group,
        diet_type: r.diet_type,
        tags: r.tags ?? [],
        status: r.status,
        vat_rate: r.vat_rate,
        variants_count: variants.length,
        total_qty: totalQty,
        low_stock: lowStock,
        created_at: r.created_at,
        updated_at: r.updated_at,
      }
    })

    return { data: items }
  }
)

// ============================================================================
// 6. getProductAction — all dashboard roles
// ============================================================================

export const getProductAction = withAuth(
  ['owner', 'branch_manager', 'sales', 'warehouse'],
  async (session, productId: string): Promise<ActionResult<ProductWithVariants>> => {
    if (!productId) return { error: 'productId חסר' }

    const supabase = await getAuthenticatedClient()

    const { data: product, error: productErr } = await supabase
      .from('products')
      .select(
        'id, tenant_id, name, description, image_url, supplier_name, animal_type, age_group, diet_type, allergen_free, tags, vat_rate, status, deleted_at, created_at, updated_at'
      )
      .eq('id', productId)
      .is('deleted_at', null)
      .maybeSingle()

    if (productErr) {
      console.error('[getProduct] product fetch failed', productErr)
      return { error: GENERIC_ERROR }
    }
    if (!product) return { error: 'המוצר לא נמצא' }

    // Attributes + values
    const { data: attributes, error: attrErr } = await supabase
      .from('product_attributes')
      .select('id, tenant_id, product_id, name, position')
      .eq('product_id', productId)
      .order('position', { ascending: true })

    if (attrErr) {
      console.error('[getProduct] attributes fetch failed', attrErr)
      return { error: GENERIC_ERROR }
    }

    const attrIds = (attributes ?? []).map((a) => a.id as string)
    let values: ProductAttributeValueRow[] = []
    if (attrIds.length > 0) {
      const { data: valueRows, error: valErr } = await supabase
        .from('product_attribute_values')
        .select('id, tenant_id, attribute_id, value, position')
        .in('attribute_id', attrIds)
        .order('position', { ascending: true })
      if (valErr) {
        console.error('[getProduct] attribute values fetch failed', valErr)
        return { error: GENERIC_ERROR }
      }
      values = (valueRows ?? []) as ProductAttributeValueRow[]
    }

    // Variants (with cost_price omitted for non-owner)
    const { data: variants, error: variantErr } = await supabase
      .from('product_variants')
      .select(variantColumns(session.profile.role))
      .eq('product_id', productId)
      .order('created_at', { ascending: true })

    if (variantErr) {
      console.error('[getProduct] variants fetch failed', variantErr)
      return { error: GENERIC_ERROR }
    }

    const variantRows = (variants ?? []) as unknown as ProductVariantRow[]
    const variantIds = variantRows.map((v) => v.id)

    // variant -> [attribute_value_id]
    let vavMap: Record<string, string[]> = {}
    if (variantIds.length > 0) {
      const { data: vavRows, error: vavErr } = await supabase
        .from('variant_attribute_values')
        .select('variant_id, attribute_value_id')
        .in('variant_id', variantIds)
      if (vavErr) {
        console.error('[getProduct] variant_attribute_values fetch failed', vavErr)
        return { error: GENERIC_ERROR }
      }
      vavMap = (vavRows ?? []).reduce<Record<string, string[]>>((acc, row) => {
        const vid = row.variant_id as string
        const avid = row.attribute_value_id as string
        if (!acc[vid]) acc[vid] = []
        acc[vid].push(avid)
        return acc
      }, {})
    }

    // Inventory — RLS restricts non-owner to their branch automatically.
    let inventory: ProductInventoryRow[] = []
    if (variantIds.length > 0) {
      const { data: invRows, error: invErr } = await supabase
        .from('product_inventory')
        .select('id, tenant_id, branch_id, variant_id, qty, reorder_level, updated_at')
        .in('variant_id', variantIds)
      if (invErr) {
        console.error('[getProduct] inventory fetch failed', invErr)
        return { error: GENERIC_ERROR }
      }
      inventory = (invRows ?? []) as ProductInventoryRow[]
    }

    const variantsWithAttrs: ProductVariantWithAttributes[] = variantRows.map((v) => ({
      ...v,
      attribute_value_ids: vavMap[v.id] ?? [],
    }))

    const attributesWithValues = (attributes ?? []).map((a) => ({
      ...(a as ProductAttributeRow),
      values: values.filter((v) => v.attribute_id === a.id),
    }))

    return {
      data: {
        product: product as ProductRow,
        attributes: attributesWithValues,
        variants: variantsWithAttrs,
        inventory,
      },
    }
  }
)

// ============================================================================
// 7. deleteProductAction — owner only (soft delete)
// ============================================================================

export const deleteProductAction = withAuth(
  ['owner'],
  async (session, productId: string): Promise<ActionResult<{ productId: string }>> => {
    if (!productId) return { error: 'productId חסר' }

    const supabase = await getAuthenticatedClient()

    // Fetch name first — once deleted_at is set, RLS hides the row.
    const { data: existing } = await supabase
      .from('products')
      .select('id, name')
      .eq('id', productId)
      .is('deleted_at', null)
      .maybeSingle()

    if (!existing) return { error: 'המוצר לא נמצא' }

    const { error } = await supabase
      .from('products')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', productId)
      .is('deleted_at', null)

    if (error) {
      console.error('[deleteProduct] soft delete failed', error)
      return { error: GENERIC_ERROR }
    }

    await writeAudit({
      action: 'product.deleted',
      session,
      entityType: 'product',
      entityId: productId,
      metadata: { name: existing.name },
    })

    revalidatePath(PRODUCTS_PATH)
    return { data: { productId } }
  }
)

// ============================================================================
// 8. duplicateProductAction — owner only
// ============================================================================

export const duplicateProductAction = withAuth(
  ['owner'],
  async (session, productId: string): Promise<ActionResult<{ productId: string }>> => {
    if (!productId) return { error: 'productId חסר' }

    const tenantId = session.profile.tenant_id
    const supabase = await getAuthenticatedClient()

    // ---- 8a. Source product
    const { data: source, error: srcErr } = await supabase
      .from('products')
      .select(
        'id, name, description, image_url, supplier_name, animal_type, age_group, diet_type, allergen_free, tags, vat_rate, status'
      )
      .eq('id', productId)
      .is('deleted_at', null)
      .maybeSingle()

    if (srcErr) {
      console.error('[duplicateProduct] source fetch failed', srcErr)
      return { error: GENERIC_ERROR }
    }
    if (!source) return { error: 'המוצר לשכפול לא נמצא' }

    // ---- 8b. Source attributes + values + variants + links
    const { data: srcAttrs, error: aErr } = await supabase
      .from('product_attributes')
      .select('id, name, position')
      .eq('product_id', productId)
      .order('position', { ascending: true })
    if (aErr) {
      console.error('[duplicateProduct] attributes fetch failed', aErr)
      return { error: GENERIC_ERROR }
    }

    const srcAttrIds = (srcAttrs ?? []).map((a) => a.id as string)
    let srcValues: Array<{ id: string; attribute_id: string; value: string; position: number }> = []
    if (srcAttrIds.length > 0) {
      const { data: vRows, error: vErr } = await supabase
        .from('product_attribute_values')
        .select('id, attribute_id, value, position')
        .in('attribute_id', srcAttrIds)
      if (vErr) {
        console.error('[duplicateProduct] values fetch failed', vErr)
        return { error: GENERIC_ERROR }
      }
      srcValues = (vRows ?? []) as typeof srcValues
    }

    // owner role here, so cost_price is always selectable
    const { data: srcVariants, error: varErr } = await supabase
      .from('product_variants')
      .select(
        'id, sku, barcode, internal_code, price, cost_price, unit, weight_kg, status'
      )
      .eq('product_id', productId)
    if (varErr) {
      console.error('[duplicateProduct] variants fetch failed', varErr)
      return { error: GENERIC_ERROR }
    }

    const srcVariantIds = (srcVariants ?? []).map((v) => v.id as string)
    let srcLinks: Array<{ variant_id: string; attribute_value_id: string }> = []
    if (srcVariantIds.length > 0) {
      const { data: linkRows, error: linkErr } = await supabase
        .from('variant_attribute_values')
        .select('variant_id, attribute_value_id')
        .in('variant_id', srcVariantIds)
      if (linkErr) {
        console.error('[duplicateProduct] links fetch failed', linkErr)
        return { error: GENERIC_ERROR }
      }
      srcLinks = (linkRows ?? []) as typeof srcLinks
    }

    // ---- 8c. INSERT new product
    const { data: newProduct, error: newProdErr } = await supabase
      .from('products')
      .insert({
        tenant_id: tenantId,
        name: `${source.name} - עותק`,
        description: source.description,
        image_url: source.image_url,
        supplier_name: source.supplier_name,
        animal_type: source.animal_type,
        age_group: source.age_group,
        diet_type: source.diet_type,
        allergen_free: source.allergen_free ?? [],
        tags: source.tags ?? [],
        vat_rate: source.vat_rate,
        // status defaults to 'active' even if source was 'inactive' / 'discontinued' —
        // duplicating a discontinued product into "active" feels intentional.
      })
      .select('id')
      .single()
    if (newProdErr || !newProduct) {
      console.error('[duplicateProduct] new product insert failed', newProdErr)
      return { error: GENERIC_ERROR }
    }
    const newProductId = newProduct.id as string

    // ---- 8d. Clone attributes + values, build old_value_id -> new_value_id map
    const valueIdMap = new Map<string, string>()
    for (const a of srcAttrs ?? []) {
      const { data: newAttr, error: aInsErr } = await supabase
        .from('product_attributes')
        .insert({
          tenant_id: tenantId,
          product_id: newProductId,
          name: a.name as string,
          position: a.position as number,
        })
        .select('id')
        .single()
      if (aInsErr || !newAttr) {
        console.error('[duplicateProduct] attribute insert failed', aInsErr)
        await rollbackProduct(newProductId)
        return { error: GENERIC_ERROR }
      }
      const newAttrId = newAttr.id as string

      const matchingValues = srcValues.filter((v) => v.attribute_id === a.id)
      if (matchingValues.length === 0) continue
      const payload = matchingValues.map((v) => ({
        tenant_id: tenantId,
        attribute_id: newAttrId,
        value: v.value,
        position: v.position,
      }))
      const { data: newValues, error: vInsErr } = await supabase
        .from('product_attribute_values')
        .insert(payload)
        .select('id, value, position')
      if (vInsErr || !newValues) {
        console.error('[duplicateProduct] values insert failed', vInsErr)
        await rollbackProduct(newProductId)
        return { error: GENERIC_ERROR }
      }
      // Map old -> new by (value, position) — both unique within an attribute.
      for (const oldVal of matchingValues) {
        const match = newValues.find(
          (nv) => nv.value === oldVal.value && nv.position === oldVal.position
        )
        if (match) valueIdMap.set(oldVal.id, match.id as string)
      }
    }

    // ---- 8e. Clone variants with new SKU suffix, then variant_attribute_values
    const skuSuffix = Date.now().toString(36)
    for (const v of srcVariants ?? []) {
      const { data: newVar, error: vInsErr } = await supabase
        .from('product_variants')
        .insert({
          tenant_id: tenantId,
          product_id: newProductId,
          sku: `${v.sku}-copy-${skuSuffix}`,
          barcode: null, // barcode is physical → not duplicated to avoid scan collision
          internal_code: v.internal_code,
          price: v.price,
          cost_price: v.cost_price,
          unit: v.unit,
          weight_kg: v.weight_kg,
          status: v.status,
        })
        .select('id')
        .single()
      if (vInsErr || !newVar) {
        console.error('[duplicateProduct] variant insert failed', vInsErr)
        await rollbackProduct(newProductId)
        return { error: GENERIC_ERROR }
      }
      const newVariantId = newVar.id as string

      const linksForThis = srcLinks.filter((l) => l.variant_id === v.id)
      if (linksForThis.length === 0) continue
      const linkPayload: Array<{ variant_id: string; attribute_value_id: string }> = []
      for (const l of linksForThis) {
        const newValueId = valueIdMap.get(l.attribute_value_id)
        if (!newValueId) {
          console.error('[duplicateProduct] missing value id in map', l)
          await rollbackProduct(newProductId)
          return { error: GENERIC_ERROR }
        }
        linkPayload.push({ variant_id: newVariantId, attribute_value_id: newValueId })
      }
      const { error: linkInsErr } = await supabase
        .from('variant_attribute_values')
        .insert(linkPayload)
      if (linkInsErr) {
        console.error('[duplicateProduct] variant_attribute_values insert failed', linkInsErr)
        await rollbackProduct(newProductId)
        return { error: GENERIC_ERROR }
      }
    }
    // Note: inventory (qty / reorder_level) is intentionally NOT copied.
    // The DB trigger `product_variants_seed_inventory` seeded fresh qty=0 rows
    // per branch on every new variant insert above.

    // ---- 8f. Audit + revalidate
    await writeAudit({
      action: 'product.duplicated',
      session,
      entityType: 'product',
      entityId: newProductId,
      metadata: {
        source_product_id: productId,
        new_name: `${source.name} - עותק`,
        variants_count: (srcVariants ?? []).length,
      },
    })

    revalidatePath(PRODUCTS_PATH)
    return { data: { productId: newProductId } }
  }
)
