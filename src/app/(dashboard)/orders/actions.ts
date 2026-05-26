'use server'

import { revalidatePath } from 'next/cache'
import { withAuth } from '@/app/lib/auth-wrapper'
import { writeAudit } from '@/app/lib/audit'
import { getAuthenticatedClient } from '@/app/lib/dal'
import type { Session } from '@/app/lib/definitions'
import type {
  ActionResult,
  CreateOrderInput,
  CreateSubscriptionInput,
  CustomerSnapshot,
  ListOrdersFilters,
  ListSubscriptionsFilters,
  OrderItemRow,
  OrderListItem,
  OrderRow,
  OrderSource,
  OrderStatus,
  OrderWithItems,
  OrdersKpi,
  SubscriptionListItem,
  SubscriptionStatus,
  SubscriptionWithItems,
} from './types'
import {
  ORDER_SOURCES,
  ORDER_STATUSES,
  ORDER_STATUS_TRANSITIONS,
  ORDER_TYPES,
  PAYMENT_METHODS,
  SUBSCRIPTION_STATUSES,
} from './types'

const GENERIC_ERROR = 'הפעולה נכשלה, נסה שוב'
const ORDERS_PATH = '/orders'
const SUBSCRIPTIONS_PATH = '/subscriptions'

// ============================================================================
// Helpers
// ============================================================================

/**
 * Columns selected from order_items.
 * cost_price is omitted for non-owner roles so it never lands in the network
 * response — enforced here, NOT via RLS.
 */
function itemColumns(role: Session['profile']['role']): string {
  const base =
    'id, order_id, tenant_id, variant_id, product_name, variant_desc, sku, quantity, unit_price, vat_rate, total_price, created_at'
  return role === 'owner' ? `${base}, cost_price` : base
}

function isOrderStatus(v: unknown): v is OrderStatus {
  return typeof v === 'string' && (ORDER_STATUSES as readonly string[]).includes(v)
}
function isOrderSource(v: unknown): v is OrderSource {
  return typeof v === 'string' && (ORDER_SOURCES as readonly string[]).includes(v)
}
function isSubscriptionStatus(v: unknown): v is SubscriptionStatus {
  return typeof v === 'string' && (SUBSCRIPTION_STATUSES as readonly string[]).includes(v)
}

/**
 * Computes order totals from items.
 *
 * unit_price is treated as the net (pre-VAT) price per unit.
 * total_price per item = round(quantity * unit_price, 2)
 * subtotal = sum of total_prices (net)
 * vat_amount = sum of (total_price * vat_rate / 100) per item, scaled by (subtotal - discount) / subtotal
 * total = subtotal - discount + vat_amount
 */
function computeTotals(
  items: Array<{ quantity: number; unit_price: number; vat_rate: number }>,
  discount: number
): { subtotal: number; vat_amount: number; total: number } {
  const round2 = (n: number) => Math.round(n * 100) / 100

  let subtotal = 0
  let rawVat = 0

  for (const item of items) {
    const lineNet = round2(item.quantity * item.unit_price)
    subtotal += lineNet
    rawVat += round2(lineNet * item.vat_rate / 100)
  }

  subtotal = round2(subtotal)
  const discountClamped = Math.min(discount, subtotal)
  // Apply discount proportionally across VAT
  const scale = subtotal > 0 ? (subtotal - discountClamped) / subtotal : 0
  const vat_amount = round2(rawVat * scale)
  const total = round2(subtotal - discountClamped + vat_amount)

  return { subtotal, vat_amount, total }
}

// ============================================================================
// 1. createOrderAction
// ============================================================================

export const createOrderAction = withAuth(
  ['owner', 'branch_manager', 'sales'],
  async (session, input: CreateOrderInput): Promise<ActionResult<{ orderId: string }>> => {
    if (!input.customer_id) return { error: 'customer_id חסר' }
    if (!input.branch_id) return { error: 'branch_id חסר' }
    if (!Array.isArray(input.items) || input.items.length === 0)
      return { error: 'חייב להוסיף לפחות פריט אחד' }
    if (input.order_type && !ORDER_TYPES.includes(input.order_type))
      return { error: 'order_type לא חוקי' }
    if (input.source && !ORDER_SOURCES.includes(input.source))
      return { error: 'source לא חוקי' }

    const discount = input.discount ?? 0
    if (typeof discount !== 'number' || discount < 0)
      return { error: 'הנחה חייבת להיות מספר אי-שלילי' }

    const supabase = await getAuthenticatedClient()
    const tenantId = session.profile.tenant_id

    // Resolve catalog data for items that have variant_id but are missing unit_price
    const variantIdsToFetch = input.items
      .filter(item => item.variant_id && item.unit_price === undefined)
      .map(item => item.variant_id as string)

    type VariantCatalog = {
      id: string
      sku: string
      price: number
      cost_price: number | null
      products: { name: string; vat_rate: number }
    }

    const variantCatalog = new Map<string, VariantCatalog>()

    if (variantIdsToFetch.length > 0) {
      const { data: variants, error: varErr } = await supabase
        .from('product_variants')
        .select('id, sku, price, cost_price, products!product_id(name, vat_rate)')
        .in('id', variantIdsToFetch)
        .eq('tenant_id', tenantId)
        .is('deleted_at', null)

      if (varErr) {
        console.error('[createOrder] variant fetch failed', varErr)
        return { error: GENERIC_ERROR }
      }

      for (const v of variants ?? []) {
        variantCatalog.set(v.id as string, v as unknown as VariantCatalog)
      }
    }

    // Build resolved items with validated fields
    const resolvedItems: Array<{
      variant_id: string | null
      product_name: string
      variant_desc: string | null
      sku: string | null
      quantity: number
      unit_price: number
      cost_price: number | null
      vat_rate: number
      total_price: number
    }> = []

    for (let i = 0; i < input.items.length; i++) {
      const item = input.items[i]

      if (item.quantity <= 0) return { error: `כמות בפריט ${i + 1} חייבת להיות גדולה מ-0` }

      let unit_price = item.unit_price
      let cost_price = item.cost_price ?? null
      let product_name = item.product_name
      let vat_rate = item.vat_rate ?? 18
      let sku = item.sku ?? null

      if (item.variant_id) {
        const catalog = variantCatalog.get(item.variant_id)
        if (!catalog && unit_price === undefined) {
          return { error: `variant ${item.variant_id} לא נמצא בקטלוג` }
        }
        if (catalog) {
          if (unit_price === undefined) unit_price = catalog.price
          if (!product_name) product_name = catalog.products?.name ?? ''
          if (vat_rate === 18 && catalog.products?.vat_rate !== undefined)
            vat_rate = catalog.products.vat_rate
          if (sku === null) sku = catalog.sku ?? null
          if (cost_price === null && session.profile.role === 'owner')
            cost_price = catalog.cost_price ?? null
        }
      }

      if (unit_price === undefined || unit_price < 0)
        return { error: `מחיר בפריט ${i + 1} חסר או לא תקין` }
      if (!product_name?.trim())
        return { error: `שם מוצר חסר בפריט ${i + 1}` }

      const total_price = Math.round(item.quantity * unit_price * 100) / 100

      resolvedItems.push({
        variant_id: item.variant_id ?? null,
        product_name: product_name.trim(),
        variant_desc: item.variant_desc ?? null,
        sku,
        quantity: item.quantity,
        unit_price,
        cost_price: session.profile.role === 'owner' ? cost_price : null,
        vat_rate,
        total_price,
      })
    }

    const { subtotal, vat_amount, total } = computeTotals(resolvedItems, discount)

    // Insert order
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .insert({
        tenant_id: tenantId,
        branch_id: input.branch_id,
        customer_id: input.customer_id,
        created_by: session.profile.id,
        order_type: input.order_type ?? 'one_time',
        source: input.source ?? 'manual',
        status: 'pending',
        payment_status: 'unpaid',
        subtotal,
        discount,
        vat_amount,
        total,
        delivery_address: input.delivery_address ?? null,
        delivery_date: input.delivery_date ?? null,
        notes: input.notes ?? null,
      })
      .select('id')
      .single()

    if (orderErr || !order) {
      console.error('[createOrder] insert failed', orderErr)
      return { error: GENERIC_ERROR }
    }

    const orderId = order.id as string

    // Insert order_items
    const itemsPayload = resolvedItems.map(item => ({
      order_id: orderId,
      tenant_id: tenantId,
      ...item,
    }))

    const { error: itemsErr } = await supabase.from('order_items').insert(itemsPayload)

    if (itemsErr) {
      console.error('[createOrder] insert items failed', itemsErr)
      // Best-effort rollback
      await supabase.from('orders').delete().eq('id', orderId)
      return { error: GENERIC_ERROR }
    }

    await writeAudit({
      action: 'order.created',
      session,
      entityType: 'order',
      entityId: orderId,
      metadata: {
        customer_id: input.customer_id,
        branch_id: input.branch_id,
        items_count: resolvedItems.length,
        total,
        source: input.source ?? 'manual',
      },
    })

    revalidatePath(ORDERS_PATH)
    return { data: { orderId } }
  }
)

// ============================================================================
// 2. updateOrderStatusAction
// ============================================================================

export const updateOrderStatusAction = withAuth(
  ['owner', 'branch_manager', 'sales', 'warehouse'],
  async (
    session,
    orderId: string,
    newStatus: OrderStatus
  ): Promise<ActionResult<{ orderId: string }>> => {
    if (!orderId) return { error: 'orderId חסר' }
    if (!isOrderStatus(newStatus)) return { error: 'סטטוס לא חוקי' }

    const supabase = await getAuthenticatedClient()

    const { data: existing, error: fetchErr } = await supabase
      .from('orders')
      .select('id, status, payment_status')
      .eq('id', orderId)
      .maybeSingle()

    if (fetchErr) {
      console.error('[updateOrderStatus] fetch failed', fetchErr)
      return { error: GENERIC_ERROR }
    }
    if (!existing) return { error: 'ההזמנה לא נמצאה' }

    const currentStatus = existing.status as OrderStatus
    const allowed = ORDER_STATUS_TRANSITIONS[currentStatus]

    if (!allowed.includes(newStatus)) {
      return {
        error: `לא ניתן לעבור מסטטוס "${currentStatus}" ל-"${newStatus}"`,
      }
    }

    // warehouse may only move to in_transit from preparing
    const role = session.profile.role
    if (role === 'warehouse' && !(currentStatus === 'preparing' && newStatus === 'in_transit')) {
      return { error: 'מחסן מורשה לעדכן סטטוס "בהכנה" ל-"בדרך" בלבד' }
    }

    const { error: updateErr } = await supabase
      .from('orders')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', orderId)

    if (updateErr) {
      console.error('[updateOrderStatus] update failed', updateErr)
      return { error: GENERIC_ERROR }
    }

    await writeAudit({
      action: 'order.status_changed',
      session,
      entityType: 'order',
      entityId: orderId,
      metadata: { from: currentStatus, to: newStatus },
    })

    revalidatePath(ORDERS_PATH)
    revalidatePath(`${ORDERS_PATH}/${orderId}`)
    return { data: { orderId } }
  }
)

// ============================================================================
// 3. cancelOrderAction
// ============================================================================

export const cancelOrderAction = withAuth(
  ['owner', 'branch_manager'],
  async (session, orderId: string): Promise<ActionResult<{ orderId: string }>> => {
    if (!orderId) return { error: 'orderId חסר' }

    const supabase = await getAuthenticatedClient()

    const { data: existing, error: fetchErr } = await supabase
      .from('orders')
      .select('id, status, payment_status')
      .eq('id', orderId)
      .maybeSingle()

    if (fetchErr) {
      console.error('[cancelOrder] fetch failed', fetchErr)
      return { error: GENERIC_ERROR }
    }
    if (!existing) return { error: 'ההזמנה לא נמצאה' }

    const status = existing.status as OrderStatus
    if (status === 'delivered' || status === 'cancelled') {
      return { error: `לא ניתן לבטל הזמנה בסטטוס "${status}"` }
    }

    // If already paid — mark for manual refund
    const newPaymentStatus =
      existing.payment_status === 'paid' ? 'refunded' : existing.payment_status

    const { error: updateErr } = await supabase
      .from('orders')
      .update({
        status: 'cancelled',
        payment_status: newPaymentStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)

    if (updateErr) {
      console.error('[cancelOrder] update failed', updateErr)
      return { error: GENERIC_ERROR }
    }

    await writeAudit({
      action: 'order.cancelled',
      session,
      entityType: 'order',
      entityId: orderId,
      metadata: { previous_status: status, payment_status: newPaymentStatus },
    })

    revalidatePath(ORDERS_PATH)
    revalidatePath(`${ORDERS_PATH}/${orderId}`)
    return { data: { orderId } }
  }
)

// ============================================================================
// 4. sendPaymentLinkAction
// ============================================================================

export const sendPaymentLinkAction = withAuth(
  ['owner', 'branch_manager', 'sales'],
  async (
    session,
    orderId: string,
    paymentMethod: 'payplus_link' | 'cash' | 'transfer' | 'credit' = 'payplus_link'
  ): Promise<ActionResult<{ payment_link: string | null }>> => {
    if (!orderId) return { error: 'orderId חסר' }
    if (!PAYMENT_METHODS.includes(paymentMethod)) return { error: 'אמצעי תשלום לא חוקי' }

    const supabase = await getAuthenticatedClient()

    // For non-PayPlus methods — mark payment method and return
    if (paymentMethod !== 'payplus_link') {
      const { error } = await supabase
        .from('orders')
        .update({
          payment_method: paymentMethod,
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId)

      if (error) {
        console.error('[sendPaymentLink] update non-payplus method failed', error)
        return { error: GENERIC_ERROR }
      }

      revalidatePath(`${ORDERS_PATH}/${orderId}`)
      return { data: { payment_link: null } }
    }

    // PayPlus — invoke Edge Function
    const { data: fnResult, error: fnErr } = await supabase.functions.invoke(
      'fn-payplus-create-link',
      { body: { order_id: orderId } }
    )

    if (fnErr) {
      console.error('[sendPaymentLink] edge function failed', fnErr)
      return { error: 'שגיאה ביצירת קישור PayPlus — ודא שה-Edge Function מוגדרת' }
    }

    const paymentLink = (fnResult as { payment_url?: string })?.payment_url ?? null

    await writeAudit({
      action: 'order.payment_link_sent',
      session,
      entityType: 'order',
      entityId: orderId,
      metadata: { payment_method: paymentMethod, has_link: !!paymentLink },
    })

    revalidatePath(`${ORDERS_PATH}/${orderId}`)
    return { data: { payment_link: paymentLink } }
  }
)

// ============================================================================
// 5. listOrdersAction
// ============================================================================

export const listOrdersAction = withAuth(
  ['owner', 'branch_manager', 'sales', 'warehouse'],
  async (
    session,
    filters: ListOrdersFilters = {}
  ): Promise<ActionResult<{ orders: OrderListItem[]; total: number }>> => {
    const supabase = await getAuthenticatedClient()
    const limit = filters.limit ?? 100
    const offset = filters.offset ?? 0

    // RLS handles branch_isolation automatically — branch/sales/warehouse
    // only see their own branch's orders.
    let query = supabase
      .from('orders')
      .select(
        `id, customer_id, branch_id, order_type, source, status, payment_status, total,
         delivery_date, created_at, updated_at,
         items:order_items(id),
         customers!customer_id(full_name, phone)`,
        { count: 'exact' }
      )
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (filters.status) {
      if (!isOrderStatus(filters.status)) return { error: 'סטטוס לא חוקי' }
      query = query.eq('status', filters.status)
    }
    if (filters.payment_status) {
      query = query.eq('payment_status', filters.payment_status)
    }
    if (filters.source) {
      if (!isOrderSource(filters.source)) return { error: 'source לא חוקי' }
      query = query.eq('source', filters.source)
    }
    if (filters.customer_id) {
      query = query.eq('customer_id', filters.customer_id)
    }
    if (filters.branch_id) {
      query = query.eq('branch_id', filters.branch_id)
    }
    if (filters.date_from) {
      query = query.gte('created_at', filters.date_from)
    }
    if (filters.date_to) {
      query = query.lte('created_at', filters.date_to)
    }

    const { data, error, count } = await query

    if (error) {
      console.error('[listOrders] select failed', error)
      return { error: GENERIC_ERROR }
    }

    type RawOrderRow = OrderRow & {
      items: Array<{ id: string }>
      customers: { full_name: string; phone: string | null } | null
    }

    const orders: OrderListItem[] = ((data ?? []) as unknown as RawOrderRow[]).map(r => ({
      id: r.id,
      customer_id: r.customer_id,
      customer_name: r.customers?.full_name ?? '—',
      customer_phone: r.customers?.phone ?? null,
      branch_id: r.branch_id,
      order_type: r.order_type,
      source: r.source,
      status: r.status,
      payment_status: r.payment_status,
      total: r.total,
      items_count: r.items?.length ?? 0,
      delivery_date: r.delivery_date,
      created_at: r.created_at,
      updated_at: r.updated_at,
    }))

    return { data: { orders, total: count ?? 0 } }
  }
)

// ============================================================================
// 6. getOrderAction
// ============================================================================

export const getOrderAction = withAuth(
  ['owner', 'branch_manager', 'sales', 'warehouse'],
  async (session, orderId: string): Promise<ActionResult<OrderWithItems>> => {
    if (!orderId) return { error: 'orderId חסר' }

    const supabase = await getAuthenticatedClient()

    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .maybeSingle()

    if (orderErr) {
      console.error('[getOrder] order fetch failed', orderErr)
      return { error: GENERIC_ERROR }
    }
    if (!order) return { error: 'ההזמנה לא נמצאה' }

    const { data: items, error: itemsErr } = await supabase
      .from('order_items')
      .select(itemColumns(session.profile.role))
      .eq('order_id', orderId)
      .order('created_at', { ascending: true })

    if (itemsErr) {
      console.error('[getOrder] items fetch failed', itemsErr)
      return { error: GENERIC_ERROR }
    }

    const { data: customer, error: custErr } = await supabase
      .from('customers')
      .select('id, full_name, phone, address')
      .eq('id', (order as OrderRow).customer_id)
      .maybeSingle()

    if (custErr) {
      console.error('[getOrder] customer fetch failed', custErr)
      return { error: GENERIC_ERROR }
    }

    return {
      data: {
        order: order as unknown as OrderRow,
        items: (items ?? []) as unknown as OrderItemRow[],
        customer: (customer ?? {
          id: (order as OrderRow).customer_id,
          full_name: '—',
          phone: null,
          address: null,
        }) as CustomerSnapshot,
      },
    }
  }
)

// ============================================================================
// 7. createSubscriptionAction
// ============================================================================

export const createSubscriptionAction = withAuth(
  ['owner', 'branch_manager'],
  async (
    session,
    input: CreateSubscriptionInput
  ): Promise<ActionResult<{ subscriptionId: string; firstOrderId: string }>> => {
    if (!input.customer_id) return { error: 'customer_id חסר' }
    if (!input.branch_id) return { error: 'branch_id חסר' }
    if (!input.frequency_days || input.frequency_days <= 0)
      return { error: 'תדירות חייבת להיות מספר חיובי' }
    if (!Array.isArray(input.items) || input.items.length === 0)
      return { error: 'חייב להוסיף לפחות פריט אחד' }

    const supabase = await getAuthenticatedClient()
    const tenantId = session.profile.tenant_id

    // Default next_order_at = today + frequency_days
    const nextOrderAt = input.next_order_at ?? (() => {
      const d = new Date()
      d.setDate(d.getDate() + input.frequency_days)
      return d.toISOString().split('T')[0]
    })()

    // Resolve subscription items — fetch variant data for display
    const variantIds = input.items
      .filter(i => i.variant_id)
      .map(i => i.variant_id as string)

    type VariantBasic = { id: string; sku: string; products: { name: string } }
    const variantMap = new Map<string, VariantBasic>()

    if (variantIds.length > 0) {
      const { data: variants } = await supabase
        .from('product_variants')
        .select('id, sku, products!product_id(name)')
        .in('id', variantIds)
        .eq('tenant_id', tenantId)
        .is('deleted_at', null)

      for (const v of variants ?? []) {
        variantMap.set(v.id as string, v as unknown as VariantBasic)
      }
    }

    // Build subscription_items payload
    const subItemsPayload = input.items.map(item => {
      const catalog = item.variant_id ? variantMap.get(item.variant_id) : null
      const productName = item.product_name?.trim() || catalog?.products?.name || ''
      return {
        tenant_id: tenantId,
        variant_id: item.variant_id ?? null,
        product_name: productName,
        variant_desc: item.variant_desc ?? null,
        quantity: item.quantity,
      }
    })

    // Validate all items have product_name
    for (let i = 0; i < subItemsPayload.length; i++) {
      if (!subItemsPayload[i].product_name)
        return { error: `שם מוצר חסר בפריט ${i + 1}` }
      if (subItemsPayload[i].quantity <= 0)
        return { error: `כמות בפריט ${i + 1} חייבת להיות גדולה מ-0` }
    }

    // Insert subscription
    const { data: subscription, error: subErr } = await supabase
      .from('subscriptions')
      .insert({
        tenant_id: tenantId,
        branch_id: input.branch_id,
        customer_id: input.customer_id,
        created_by: session.profile.id,
        frequency_days: input.frequency_days,
        next_order_at: nextOrderAt,
        status: 'active',
        notes: input.notes ?? null,
      })
      .select('id')
      .single()

    if (subErr || !subscription) {
      console.error('[createSubscription] insert failed', subErr)
      return { error: GENERIC_ERROR }
    }

    const subscriptionId = subscription.id as string

    // Insert subscription_items
    const { error: subItemsErr } = await supabase
      .from('subscription_items')
      .insert(subItemsPayload.map(item => ({ ...item, subscription_id: subscriptionId })))

    if (subItemsErr) {
      console.error('[createSubscription] insert items failed', subItemsErr)
      await supabase.from('subscriptions').delete().eq('id', subscriptionId)
      return { error: GENERIC_ERROR }
    }

    // Create first order immediately
    const firstOrderResult = await createOrderAction({
      customer_id: input.customer_id,
      branch_id: input.branch_id,
      order_type: 'subscription',
      source: 'subscription_auto',
      items: input.items.map(item => ({
        variant_id: item.variant_id,
        product_name: item.product_name,
        variant_desc: item.variant_desc,
        quantity: item.quantity,
      })),
      notes: input.notes ?? null,
    })

    if ('error' in firstOrderResult && firstOrderResult.error) {
      // First order creation failed — rollback subscription (non-blocking: log only)
      console.error('[createSubscription] first order creation failed', firstOrderResult.error)
      await supabase.from('subscriptions').delete().eq('id', subscriptionId)
      return { error: `המנוי נוצר אך ההזמנה הראשונה נכשלה: ${firstOrderResult.error}` }
    }

    const firstOrderId = firstOrderResult.data!.orderId

    // Link first order to subscription
    await supabase
      .from('orders')
      .update({ subscription_id: subscriptionId })
      .eq('id', firstOrderId)

    await writeAudit({
      action: 'subscription.created',
      session,
      entityType: 'subscription',
      entityId: subscriptionId,
      metadata: {
        customer_id: input.customer_id,
        frequency_days: input.frequency_days,
        next_order_at: nextOrderAt,
        items_count: input.items.length,
        first_order_id: firstOrderId,
      },
    })

    revalidatePath(SUBSCRIPTIONS_PATH)
    revalidatePath(ORDERS_PATH)
    return { data: { subscriptionId, firstOrderId } }
  }
)

// ============================================================================
// 8. updateSubscriptionStatusAction
// ============================================================================

export const updateSubscriptionStatusAction = withAuth(
  ['owner', 'branch_manager'],
  async (
    session,
    subscriptionId: string,
    newStatus: SubscriptionStatus
  ): Promise<ActionResult<{ subscriptionId: string }>> => {
    if (!subscriptionId) return { error: 'subscriptionId חסר' }
    if (!isSubscriptionStatus(newStatus)) return { error: 'סטטוס לא חוקי' }

    const supabase = await getAuthenticatedClient()

    const { data: existing, error: fetchErr } = await supabase
      .from('subscriptions')
      .select('id, status')
      .eq('id', subscriptionId)
      .maybeSingle()

    if (fetchErr) {
      console.error('[updateSubscriptionStatus] fetch failed', fetchErr)
      return { error: GENERIC_ERROR }
    }
    if (!existing) return { error: 'המנוי לא נמצא' }

    if (existing.status === 'cancelled' && newStatus !== 'cancelled') {
      return { error: 'לא ניתן לשנות מנוי מבוטל' }
    }

    const { error: updateErr } = await supabase
      .from('subscriptions')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', subscriptionId)

    if (updateErr) {
      console.error('[updateSubscriptionStatus] update failed', updateErr)
      return { error: GENERIC_ERROR }
    }

    await writeAudit({
      action: 'subscription.status_changed',
      session,
      entityType: 'subscription',
      entityId: subscriptionId,
      metadata: { from: existing.status, to: newStatus },
    })

    revalidatePath(SUBSCRIPTIONS_PATH)
    return { data: { subscriptionId } }
  }
)

// ============================================================================
// 9. listSubscriptionsAction
// ============================================================================

export const listSubscriptionsAction = withAuth(
  ['owner', 'branch_manager', 'sales', 'warehouse'],
  async (
    session,
    filters: ListSubscriptionsFilters = {}
  ): Promise<ActionResult<{ subscriptions: SubscriptionListItem[]; total: number }>> => {
    const supabase = await getAuthenticatedClient()
    const limit = filters.limit ?? 100
    const offset = filters.offset ?? 0

    let query = supabase
      .from('subscriptions')
      .select(
        `id, customer_id, branch_id, frequency_days, next_order_at, status, created_at, updated_at,
         items:subscription_items(id),
         customers!customer_id(full_name, phone)`,
        { count: 'exact' }
      )
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (filters.status) {
      if (!isSubscriptionStatus(filters.status)) return { error: 'סטטוס לא חוקי' }
      query = query.eq('status', filters.status)
    }
    if (filters.customer_id) {
      query = query.eq('customer_id', filters.customer_id)
    }
    if (filters.branch_id) {
      query = query.eq('branch_id', filters.branch_id)
    }

    const { data, error, count } = await query

    if (error) {
      console.error('[listSubscriptions] select failed', error)
      return { error: GENERIC_ERROR }
    }

    type RawSubRow = SubscriptionWithItems['subscription'] & {
      items: Array<{ id: string }>
      customers: { full_name: string; phone: string | null } | null
    }

    const subscriptions: SubscriptionListItem[] = (
      (data ?? []) as unknown as RawSubRow[]
    ).map(r => ({
      id: r.id,
      customer_id: r.customer_id,
      customer_name: r.customers?.full_name ?? '—',
      customer_phone: r.customers?.phone ?? null,
      branch_id: r.branch_id,
      frequency_days: r.frequency_days,
      next_order_at: r.next_order_at,
      status: r.status,
      items_count: r.items?.length ?? 0,
      created_at: r.created_at,
      updated_at: r.updated_at,
    }))

    return { data: { subscriptions, total: count ?? 0 } }
  }
)

// ============================================================================
// 10. getSubscriptionAction
// ============================================================================

export const getSubscriptionAction = withAuth(
  ['owner', 'branch_manager', 'sales', 'warehouse'],
  async (session, subscriptionId: string): Promise<ActionResult<SubscriptionWithItems>> => {
    if (!subscriptionId) return { error: 'subscriptionId חסר' }

    const supabase = await getAuthenticatedClient()

    const { data: sub, error: subErr } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('id', subscriptionId)
      .maybeSingle()

    if (subErr) {
      console.error('[getSubscription] fetch failed', subErr)
      return { error: GENERIC_ERROR }
    }
    if (!sub) return { error: 'המנוי לא נמצא' }

    const { data: items, error: itemsErr } = await supabase
      .from('subscription_items')
      .select('id, subscription_id, tenant_id, variant_id, product_name, variant_desc, quantity, created_at')
      .eq('subscription_id', subscriptionId)
      .order('created_at', { ascending: true })

    if (itemsErr) {
      console.error('[getSubscription] items fetch failed', itemsErr)
      return { error: GENERIC_ERROR }
    }

    const { data: customer, error: custErr } = await supabase
      .from('customers')
      .select('id, full_name, phone, address')
      .eq('id', (sub as SubscriptionWithItems['subscription']).customer_id)
      .maybeSingle()

    if (custErr) {
      console.error('[getSubscription] customer fetch failed', custErr)
      return { error: GENERIC_ERROR }
    }

    return {
      data: {
        subscription: sub as unknown as SubscriptionWithItems['subscription'],
        items: (items ?? []) as unknown as SubscriptionWithItems['items'],
        customer: (customer ?? {
          id: (sub as SubscriptionWithItems['subscription']).customer_id,
          full_name: '—',
          phone: null,
          address: null,
        }) as CustomerSnapshot,
      },
    }
  }
)

// ============================================================================
// 11. getOrdersKpiAction — KPI Strip data
// ============================================================================

export const getOrdersKpiAction = withAuth(
  ['owner', 'branch_manager', 'sales', 'warehouse'],
  async (session): Promise<ActionResult<OrdersKpi>> => {
    const supabase = await getAuthenticatedClient()
    const today = new Date().toISOString().split('T')[0]
    const monthStart = today.slice(0, 7) + '-01'

    // Run all 4 queries in parallel
    const [todayRes, pendingRes, subsRes, monthRes] = await Promise.all([
      supabase
        .from('orders')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', `${today}T00:00:00.000Z`)
        .lte('created_at', `${today}T23:59:59.999Z`),
      supabase
        .from('orders')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'pending'),
      supabase
        .from('subscriptions')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'active'),
      supabase
        .from('orders')
        .select('total')
        .gte('created_at', `${monthStart}T00:00:00.000Z`)
        .not('status', 'eq', 'cancelled'),
    ])

    const monthTotal = (monthRes.data ?? []).reduce(
      (sum, r) => sum + ((r as { total: number }).total ?? 0),
      0
    )

    return {
      data: {
        today_orders: todayRes.count ?? 0,
        pending_orders: pendingRes.count ?? 0,
        active_subscriptions: subsRes.count ?? 0,
        month_total: Math.round(monthTotal * 100) / 100,
      },
    }
  }
)
