'use server'

import { revalidatePath } from 'next/cache'
import { withAuth } from '@/app/lib/auth-wrapper'
import { writeAudit } from '@/app/lib/audit'
import { getAuthenticatedClient } from '@/app/lib/dal'
import type {
  ActionResult,
  CreateCustomerInput,
  CustomerImportRow,
  CustomerKpis,
  CustomerListItem,
  ListCustomersFilters,
  PreferredChannel,
  CustomerStatus,
  UpdateCustomerInput,
} from './types'
import { PREFERRED_CHANNELS, CUSTOMER_STATUSES } from './types'

const GENERIC_ERROR = 'הפעולה נכשלה, נסה שוב'
const CUSTOMERS_PATH = '/customers'

function isPreferredChannel(v: unknown): v is PreferredChannel {
  return typeof v === 'string' && (PREFERRED_CHANNELS as readonly string[]).includes(v)
}
function isCustomerStatus(v: unknown): v is CustomerStatus {
  return typeof v === 'string' && (CUSTOMER_STATUSES as readonly string[]).includes(v)
}
function escapeLike(input: string): string {
  return input.replace(/[\\%_]/g, (m) => `\\${m}`)
}

// ============================================================================
// 1. listCustomersAction — all roles (RLS enforces branch scope)
// ============================================================================

export const listCustomersAction = withAuth(
  ['owner', 'branch_manager', 'sales', 'warehouse'],
  async (
    session,
    filters: ListCustomersFilters = {}
  ): Promise<ActionResult<{ customers: CustomerListItem[]; total: number }>> => {
    const supabase = await getAuthenticatedClient()
    const limit = filters.limit ?? 5000
    const offset = filters.offset ?? 0

    let query = supabase
      .from('customers')
      .select('*, branches!branch_id(name)', { count: 'exact' })
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (filters.status) {
      if (!isCustomerStatus(filters.status)) return { error: 'סטטוס לא חוקי' }
      query = query.eq('status', filters.status)
    }
    if (filters.branch_id) {
      query = query.eq('branch_id', filters.branch_id)
    }
    if (filters.search?.trim()) {
      const term = escapeLike(filters.search.trim())
      query = query.or(`full_name.ilike.%${term}%,phone.ilike.%${term}%`)
    }

    const { data, count, error } = await query

    if (error) {
      console.error('[listCustomers] select failed', error)
      return { error: GENERIC_ERROR }
    }

    const customers = (data ?? []).map((row: Record<string, unknown>) => {
      const { branches, ...rest } = row
      return {
        ...rest,
        branch_name: (branches as { name: string } | null)?.name ?? null,
      }
    }) as unknown as CustomerListItem[]

    return { data: { customers, total: count ?? 0 } }
  }
)

// ============================================================================
// 1b. getCustomerKpisAction — aggregate counts (no row fetch)
// ============================================================================

export const getCustomerKpisAction = withAuth(
  ['owner', 'branch_manager', 'sales', 'warehouse'],
  async (session): Promise<ActionResult<CustomerKpis>> => {
    const supabase = await getAuthenticatedClient()

    const monthStart = new Date()
    monthStart.setDate(1)
    monthStart.setHours(0, 0, 0, 0)
    const monthStartStr = monthStart.toISOString()

    const [totalRes, activeRes, newRes, whatsappRes] = await Promise.all([
      supabase
        .from('customers')
        .select('*', { count: 'exact', head: true })
        .is('deleted_at', null),
      supabase
        .from('customers')
        .select('*', { count: 'exact', head: true })
        .is('deleted_at', null)
        .eq('status', 'active'),
      supabase
        .from('customers')
        .select('*', { count: 'exact', head: true })
        .is('deleted_at', null)
        .eq('status', 'active')
        .gte('created_at', monthStartStr),
      supabase
        .from('customers')
        .select('*', { count: 'exact', head: true })
        .is('deleted_at', null)
        .eq('status', 'active')
        .eq('preferred_channel', 'whatsapp'),
    ])

    const total = totalRes.count ?? 0
    const active = activeRes.count ?? 0
    const inactive = total - active
    const newThisMonth = newRes.count ?? 0
    const whatsapp = whatsappRes.count ?? 0
    const whatsappPct = active > 0 ? Math.round((whatsapp / active) * 100) : 0

    return { data: { active, inactive, newThisMonth, whatsappPct } }
  }
)

// ============================================================================
// 2. getCustomerAction — all roles
// ============================================================================

export const getCustomerAction = withAuth(
  ['owner', 'branch_manager', 'sales', 'warehouse'],
  async (session, customerId: string): Promise<ActionResult<CustomerListItem>> => {
    if (!customerId) return { error: 'customerId חסר' }

    const supabase = await getAuthenticatedClient()
    const { data, error } = await supabase
      .from('customers')
      .select('*, branches!branch_id(name)')
      .eq('id', customerId)
      .is('deleted_at', null)
      .maybeSingle()

    if (error) {
      console.error('[getCustomer] select failed', error)
      return { error: GENERIC_ERROR }
    }
    if (!data) return { error: 'הלקוח לא נמצא' }

    const customer: CustomerListItem = {
      ...(data as Record<string, unknown>),
      branch_name: (data as Record<string, unknown> & { branches?: { name: string } }).branches?.name ?? null,
    } as CustomerListItem

    return { data: customer }
  }
)

// ============================================================================
// 3. createCustomerAction — owner, branch_manager
// ============================================================================

export const createCustomerAction = withAuth(
  ['owner', 'branch_manager'],
  async (session, input: CreateCustomerInput): Promise<ActionResult<{ customerId: string }>> => {
    if (!input.full_name?.trim() || input.full_name.trim().length < 2)
      return { error: 'שם חייב להכיל לפחות 2 תווים' }
    if (!input.phone?.trim()) return { error: 'שדה חובה' }
    if (!isPreferredChannel(input.preferred_channel)) return { error: 'ערוץ תקשורת לא חוקי' }
    if (input.status && !isCustomerStatus(input.status)) return { error: 'סטטוס לא חוקי' }

    const supabase = await getAuthenticatedClient()
    const { data, error } = await supabase
      .from('customers')
      .insert({
        tenant_id: session.profile.tenant_id,
        branch_id: input.branch_id ?? null,
        full_name: input.full_name.trim(),
        phone: input.phone.trim(),
        email: input.email?.trim() || null,
        address: input.address?.trim() || null,
        city: input.city?.trim() || null,
        preferred_channel: input.preferred_channel,
        notes: input.notes?.trim() || null,
        status: input.status ?? 'active',
      })
      .select('id')
      .single()

    if (error) {
      console.error('[createCustomer] insert failed', error)
      if (error.code === '23505') return { error: 'מספר הטלפון כבר רשום ללקוח אחר' }
      return { error: GENERIC_ERROR }
    }

    await writeAudit({
      action: 'customer.created',
      session,
      entityType: 'customer',
      entityId: data.id,
      metadata: { full_name: input.full_name.trim(), phone: input.phone.trim() },
    })

    revalidatePath(CUSTOMERS_PATH)
    return { data: { customerId: data.id } }
  }
)

// ============================================================================
// 4. updateCustomerAction — owner, branch_manager
// ============================================================================

export const updateCustomerAction = withAuth(
  ['owner', 'branch_manager'],
  async (
    session,
    customerId: string,
    updates: UpdateCustomerInput
  ): Promise<ActionResult<{ customerId: string }>> => {
    if (!customerId) return { error: 'customerId חסר' }

    const patch: Record<string, unknown> = {}

    if (updates.full_name !== undefined) {
      if (!updates.full_name.trim() || updates.full_name.trim().length < 2)
        return { error: 'שם חייב להכיל לפחות 2 תווים' }
      patch.full_name = updates.full_name.trim()
    }
    if (updates.phone !== undefined) {
      if (!updates.phone.trim()) return { error: 'שדה חובה' }
      patch.phone = updates.phone.trim()
    }
    if (updates.email !== undefined) patch.email = updates.email?.trim() || null
    if (updates.address !== undefined) patch.address = updates.address?.trim() || null
    if (updates.city !== undefined) patch.city = updates.city?.trim() || null
    if (updates.preferred_channel !== undefined) {
      if (!isPreferredChannel(updates.preferred_channel)) return { error: 'ערוץ תקשורת לא חוקי' }
      patch.preferred_channel = updates.preferred_channel
    }
    if (updates.notes !== undefined) patch.notes = updates.notes?.trim() || null
    if (updates.branch_id !== undefined) patch.branch_id = updates.branch_id || null
    if (updates.status !== undefined) {
      if (!isCustomerStatus(updates.status)) return { error: 'סטטוס לא חוקי' }
      patch.status = updates.status
    }

    if (Object.keys(patch).length === 0) return { data: { customerId } }
    patch.updated_at = new Date().toISOString()

    const supabase = await getAuthenticatedClient()
    const { error } = await supabase
      .from('customers')
      .update(patch)
      .eq('id', customerId)
      .is('deleted_at', null)

    if (error) {
      console.error('[updateCustomer] update failed', error)
      if (error.code === '23505') return { error: 'מספר הטלפון כבר רשום ללקוח אחר' }
      return { error: GENERIC_ERROR }
    }

    await writeAudit({
      action: 'customer.updated',
      session,
      entityType: 'customer',
      entityId: customerId,
      metadata: { fields: Object.keys(patch).filter((k) => k !== 'updated_at') },
    })

    revalidatePath(CUSTOMERS_PATH)
    revalidatePath(`${CUSTOMERS_PATH}/${customerId}`)
    return { data: { customerId } }
  }
)

// ============================================================================
// 5. deleteCustomerAction — owner only (soft delete)
// ============================================================================

export const deleteCustomerAction = withAuth(
  ['owner'],
  async (session, customerId: string): Promise<ActionResult<{ customerId: string }>> => {
    if (!customerId) return { error: 'customerId חסר' }

    const supabase = await getAuthenticatedClient()

    const { data: existing } = await supabase
      .from('customers')
      .select('id, full_name')
      .eq('id', customerId)
      .is('deleted_at', null)
      .maybeSingle()

    if (!existing) return { error: 'הלקוח לא נמצא' }

    const { error } = await supabase
      .from('customers')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', customerId)
      .is('deleted_at', null)

    if (error) {
      console.error('[deleteCustomer] soft delete failed', error)
      return { error: `שגיאת מסד נתונים: ${error.message || error.details || GENERIC_ERROR}` }
    }

    await writeAudit({
      action: 'customer.deleted',
      session,
      entityType: 'customer',
      entityId: customerId,
      metadata: { full_name: existing.full_name },
    })

    revalidatePath(CUSTOMERS_PATH)
    return { data: { customerId } }
  }
)

// ============================================================================
// 5b. bulkDeleteCustomersAction — owner only (batch soft delete)
//     Replaces the old frontend loop of N×deleteCustomerAction round-trips.
//     Soft-deletes in chunks of BULK_DELETE_BATCH_SIZE via .in('id', batch).
// ============================================================================

/** Max ids per UPDATE statement — keeps the `id IN (...)` list bounded. */
const BULK_DELETE_BATCH_SIZE = 50

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

export const bulkDeleteCustomersAction = withAuth(
  ['owner'],
  async (
    session,
    customerIds: string[]
  ): Promise<ActionResult<{ deletedIds: string[]; failedIds: string[] }>> => {
    if (!Array.isArray(customerIds) || customerIds.length === 0) {
      return { error: 'לא נבחרו לקוחות למחיקה' }
    }

    const ids = [...new Set(customerIds.filter((id): id is string => Boolean(id)))]
    if (ids.length === 0) return { error: 'לא נבחרו לקוחות למחיקה' }

    const supabase = await getAuthenticatedClient()
    const deletedAt = new Date().toISOString()

    const deletedIds: string[] = []
    const failedIds: string[] = []

    // RLS already fences by tenant_id; we scope by `.is('deleted_at', null)` so
    // already-deleted rows are not re-deleted (and don't inflate the count).
    for (const batch of chunk(ids, BULK_DELETE_BATCH_SIZE)) {
      const { data, error } = await supabase
        .from('customers')
        .update({ deleted_at: deletedAt })
        .in('id', batch)
        .is('deleted_at', null)
        .select('id')

      if (error) {
        console.error('[bulkDeleteCustomers] batch update failed', error)
        failedIds.push(...batch)
        continue
      }

      const okIds = new Set((data ?? []).map((r) => r.id as string))
      for (const id of batch) {
        if (okIds.has(id)) deletedIds.push(id)
        else failedIds.push(id) // not found / wrong tenant / already deleted
      }
    }

    if (deletedIds.length === 0) {
      return { error: failedIds.length > 0 ? 'אף לקוח לא נמחק' : GENERIC_ERROR }
    }

    await writeAudit({
      action: 'customer.bulk_deleted',
      session,
      entityType: 'customer',
      entityId: null,
      metadata: { count: deletedIds.length, ids: deletedIds },
    })

    revalidatePath(CUSTOMERS_PATH)
    return { data: { deletedIds, failedIds } }
  }
)

// ============================================================================
// 5c. restoreCustomersAction — owner only (Undo for bulk/single delete)
//     Sets deleted_at = null in batches. The LIVE customers RLS policy filters
//     deleted_at in app queries (not in the policy), so getAuthenticatedClient
//     can UPDATE soft-deleted rows; we add an explicit tenant fence anyway.
// ============================================================================

export const restoreCustomersAction = withAuth(
  ['owner'],
  async (
    session,
    customerIds: string[]
  ): Promise<ActionResult<{ restoredIds: string[]; failedIds: string[] }>> => {
    if (!Array.isArray(customerIds) || customerIds.length === 0) {
      return { error: 'לא נבחרו לקוחות לשחזור' }
    }

    const ids = [...new Set(customerIds.filter((id): id is string => Boolean(id)))]
    if (ids.length === 0) return { error: 'לא נבחרו לקוחות לשחזור' }

    const tenantId = session.profile.tenant_id
    const supabase = await getAuthenticatedClient()

    const restoredIds: string[] = []
    const failedIds: string[] = []

    for (const batch of chunk(ids, BULK_DELETE_BATCH_SIZE)) {
      const { data, error } = await supabase
        .from('customers')
        .update({ deleted_at: null })
        .in('id', batch)
        .eq('tenant_id', tenantId)
        .not('deleted_at', 'is', null)
        .select('id')

      if (error) {
        console.error('[restoreCustomers] batch update failed', error)
        failedIds.push(...batch)
        continue
      }

      const okIds = new Set((data ?? []).map((r) => r.id as string))
      for (const id of batch) {
        if (okIds.has(id)) restoredIds.push(id)
        else failedIds.push(id) // not found / wrong tenant / not deleted
      }
    }

    if (restoredIds.length === 0) {
      return { error: failedIds.length > 0 ? 'אף לקוח לא שוחזר' : GENERIC_ERROR }
    }

    await writeAudit({
      action: 'customer.restored',
      session,
      entityType: 'customer',
      entityId: null,
      metadata: { count: restoredIds.length, ids: restoredIds },
    })

    revalidatePath(CUSTOMERS_PATH)
    return { data: { restoredIds, failedIds } }
  }
)

// ============================================================================
// 6. importCustomersAction — owner, branch_manager
// ============================================================================

const IMPORT_BATCH_SIZE = 50

function generatePlaceholderPhone(batchId: number, rowIndex: number): string {
  const n = (batchId * 10000 + rowIndex) % 9999999
  return `000-${String(n).padStart(7, '0')}`
}

export const importCustomersAction = withAuth(
  ['owner', 'branch_manager'],
  async (
    session,
    rows: CustomerImportRow[],
    conflictStrategy: 'skip' | 'merge' = 'skip',
    placeholderPhoneForMissing = false
  ): Promise<ActionResult<{ imported: number; failed: number; errors: Array<{ rowIndex: number; phone?: string; reason: string }> }>> => {
    if (!Array.isArray(rows) || rows.length === 0) return { error: 'אין שורות לייבוא' }
    if (rows.length > 5000) return { error: 'מקסימום 5,000 שורות לייבוא אחד' }

    const tenantId = session.profile.tenant_id
    const branchId = session.profile.branch_id ?? null
    const supabase = await getAuthenticatedClient()

    // Pre-fetch branches once for name→id resolution
    const { data: branchesData } = await supabase
      .from('branches')
      .select('id, name')
      .eq('tenant_id', tenantId)
      .eq('is_active', true)

    const branchByName = new Map<string, string>()
    for (const b of branchesData ?? []) {
      branchByName.set(b.name.trim(), b.id)
    }

    type RowOutcome =
      | { ok: true }
      | { ok: false; rowIndex: number; phone?: string; reason: string }

    const batchId = Date.now() % 100000

    async function processRow(row: CustomerImportRow, rowIndex: number): Promise<RowOutcome> {
      let phone = row.phone?.trim() || null
      let phoneIsPlaceholder = false

      if (!phone) {
        if (!placeholderPhoneForMissing) return { ok: false, rowIndex, reason: 'טלפון חסר — שדה חובה' }
        phone = generatePlaceholderPhone(batchId, rowIndex)
        phoneIsPlaceholder = true
      }

      const full_name = row.full_name?.trim() || 'לקוח ללא שם'
      const channel = isPreferredChannel(row.preferred_channel) ? row.preferred_channel : 'whatsapp'

      // Resolve branch: explicit branch_id → name lookup → session branch fallback
      let resolvedBranchId = row.branch_id ?? null
      if (!resolvedBranchId && row.branch_name?.trim()) {
        resolvedBranchId = branchByName.get(row.branch_name.trim()) ?? null
      }
      if (!resolvedBranchId) resolvedBranchId = branchId

      const { error } = await supabase.from('customers').insert({
        tenant_id: tenantId,
        branch_id: resolvedBranchId,
        full_name,
        phone,
        phone_is_placeholder: phoneIsPlaceholder,
        email: row.email?.trim() || null,
        address: row.address?.trim() || null,
        city: row.city?.trim() || null,
        preferred_channel: channel,
        notes: row.notes?.trim() || null,
      })

      if (error) {
        if (error.code === '23505' && conflictStrategy === 'merge' && phone) {
          const { error: updateErr } = await supabase
            .from('customers')
            .update({
              full_name: row.full_name.trim(),
              email: row.email?.trim() || null,
              address: row.address?.trim() || null,
              city: row.city?.trim() || null,
              preferred_channel: channel,
              notes: row.notes?.trim() || null,
              updated_at: new Date().toISOString(),
            })
            .eq('tenant_id', tenantId)
            .eq('phone', phone)
            .is('deleted_at', null)
          if (updateErr)
            return { ok: false, rowIndex, phone: phone ?? undefined, reason: 'שגיאה בעדכון לקוח קיים' }
          return { ok: true }
        }
        if (error.code === '23505')
          return { ok: false, rowIndex, phone: phone ?? undefined, reason: `טלפון קיים, דולג: ${phone}` }
        return { ok: false, rowIndex, phone: phone ?? undefined, reason: error.message }
      }
      return { ok: true }
    }

    const result = {
      imported: 0,
      failed: 0,
      errors: [] as Array<{ rowIndex: number; phone?: string; reason: string }>,
    }

    for (let start = 0; start < rows.length; start += IMPORT_BATCH_SIZE) {
      const batch = rows.slice(start, start + IMPORT_BATCH_SIZE)
      const settled = await Promise.allSettled(
        batch.map((row, localIdx) => processRow(row, start + localIdx))
      )
      for (const s of settled) {
        const outcome =
          s.status === 'fulfilled'
            ? s.value
            : ({ ok: false, rowIndex: -1, reason: 'שגיאה לא צפויה' } as RowOutcome)
        if (outcome.ok) {
          result.imported++
        } else {
          result.failed++
          result.errors.push({
            rowIndex: (outcome as { rowIndex: number }).rowIndex,
            phone: (outcome as { phone?: string }).phone,
            reason: (outcome as { reason: string }).reason,
          })
        }
      }
    }

    await writeAudit({
      action: 'data.imported',
      session,
      entityType: 'customer',
      entityId: tenantId,
      metadata: { target: 'customers', imported: result.imported, failed: result.failed, total: rows.length },
    })

    revalidatePath(CUSTOMERS_PATH)
    return { data: result }
  }
)
