import 'server-only'

// ============================================================================
// Enums (mirror DB CHECK constraints)
// ============================================================================

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'in_transit'
  | 'delivered'
  | 'cancelled'

export type PaymentStatus = 'unpaid' | 'link_sent' | 'paid' | 'refunded'

export type PaymentMethod =
  | 'payplus_link'
  | 'woocommerce'
  | 'cash'
  | 'transfer'
  | 'credit'

export type OrderType = 'one_time' | 'subscription'

export type OrderSource = 'manual' | 'woocommerce' | 'whatsapp' | 'subscription_auto'

export type SubscriptionStatus = 'active' | 'paused' | 'cancelled'

// ============================================================================
// Constants — used in Server Actions for fast input validation
// ============================================================================

export const ORDER_STATUSES: readonly OrderStatus[] = [
  'pending',
  'confirmed',
  'preparing',
  'in_transit',
  'delivered',
  'cancelled',
] as const

export const PAYMENT_STATUSES: readonly PaymentStatus[] = [
  'unpaid',
  'link_sent',
  'paid',
  'refunded',
] as const

export const PAYMENT_METHODS: readonly PaymentMethod[] = [
  'payplus_link',
  'woocommerce',
  'cash',
  'transfer',
  'credit',
] as const

export const ORDER_TYPES: readonly OrderType[] = ['one_time', 'subscription'] as const

export const ORDER_SOURCES: readonly OrderSource[] = [
  'manual',
  'woocommerce',
  'whatsapp',
  'subscription_auto',
] as const

export const SUBSCRIPTION_STATUSES: readonly SubscriptionStatus[] = [
  'active',
  'paused',
  'cancelled',
] as const

// Valid forward-only transitions. Backwards moves are blocked at the action layer.
export const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending:    ['confirmed', 'cancelled'],
  confirmed:  ['preparing', 'cancelled'],
  preparing:  ['in_transit', 'cancelled'],
  in_transit: ['delivered'],
  delivered:  [],
  cancelled:  [],
}

// ============================================================================
// DB row shapes
// ============================================================================

export interface OrderRow {
  id: string
  tenant_id: string
  branch_id: string
  customer_id: string
  created_by: string
  subscription_id: string | null
  order_type: OrderType
  source: OrderSource
  status: OrderStatus
  payment_status: PaymentStatus
  payment_method: PaymentMethod | null
  payment_link: string | null
  payplus_ref: string | null
  subtotal: number
  discount: number
  vat_amount: number
  total: number
  delivery_address: string | null
  delivery_date: string | null
  notes: string | null
  external_id: string | null
  created_at: string
  updated_at: string
}

export interface OrderItemRow {
  id: string
  order_id: string
  tenant_id: string
  variant_id: string | null
  product_name: string
  variant_desc: string | null
  sku: string | null
  quantity: number
  unit_price: number
  /** Owner-only. DAL omits this column from SELECT for other roles. */
  cost_price?: number | null
  vat_rate: number
  total_price: number
  created_at: string
}

export interface SubscriptionRow {
  id: string
  tenant_id: string
  branch_id: string
  customer_id: string
  created_by: string
  frequency_days: number
  next_order_at: string
  status: SubscriptionStatus
  notes: string | null
  created_at: string
  updated_at: string
}

export interface SubscriptionItemRow {
  id: string
  subscription_id: string
  tenant_id: string
  variant_id: string | null
  product_name: string
  variant_desc: string | null
  quantity: number
  created_at: string
}

// ============================================================================
// Input shapes — what Server Actions accept
// ============================================================================

export interface CreateOrderItemInput {
  /** If provided, unit_price / vat_rate / product_name will be fetched from the catalog. */
  variant_id?: string | null
  /** Required if variant_id is null; otherwise used as override. */
  product_name?: string
  variant_desc?: string | null
  sku?: string | null
  quantity: number
  /**
   * Net price per unit (before VAT).
   * If omitted and variant_id is given, fetched from product_variants.price.
   */
  unit_price?: number
  cost_price?: number | null
  /** Defaults to 18 if not provided. */
  vat_rate?: number
}

export interface CreateOrderInput {
  customer_id: string
  branch_id: string
  order_type?: OrderType
  source?: OrderSource
  items: CreateOrderItemInput[]
  delivery_address?: string | null
  delivery_date?: string | null
  notes?: string | null
  /** Flat discount deducted from net subtotal. Defaults to 0. */
  discount?: number
}

export interface ListOrdersFilters {
  status?: OrderStatus
  payment_status?: PaymentStatus
  source?: OrderSource
  customer_id?: string
  branch_id?: string
  date_from?: string
  date_to?: string
  search?: string
  limit?: number
  offset?: number
}

export interface CreateSubscriptionItemInput {
  variant_id?: string | null
  product_name?: string
  variant_desc?: string | null
  quantity: number
}

export interface CreateSubscriptionInput {
  customer_id: string
  branch_id: string
  /** Must be > 0. */
  frequency_days: number
  /**
   * ISO date string for the first order. Defaults to today + frequency_days
   * when omitted.
   */
  next_order_at?: string
  items: CreateSubscriptionItemInput[]
  notes?: string | null
}

export interface ListSubscriptionsFilters {
  status?: SubscriptionStatus
  customer_id?: string
  branch_id?: string
  limit?: number
  offset?: number
}

// ============================================================================
// Output shapes
// ============================================================================

export interface CustomerSnapshot {
  id: string
  full_name: string
  phone: string | null
  address: string | null
}

export interface OrderListItem {
  id: string
  customer_id: string
  customer_name: string
  customer_phone: string | null
  branch_id: string
  order_type: OrderType
  source: OrderSource
  status: OrderStatus
  payment_status: PaymentStatus
  total: number
  items_count: number
  delivery_date: string | null
  created_at: string
  updated_at: string
}

export interface OrderWithItems {
  order: OrderRow
  items: OrderItemRow[]
  customer: CustomerSnapshot
}

export interface SubscriptionListItem {
  id: string
  customer_id: string
  customer_name: string
  customer_phone: string | null
  branch_id: string
  frequency_days: number
  next_order_at: string
  status: SubscriptionStatus
  items_count: number
  created_at: string
  updated_at: string
}

export interface SubscriptionWithItems {
  subscription: SubscriptionRow
  items: SubscriptionItemRow[]
  customer: CustomerSnapshot
}

export interface OrdersKpi {
  today_orders: number
  pending_orders: number
  active_subscriptions: number
  month_total: number
}

// ============================================================================
// Shared result wrapper
// ============================================================================

export type ActionResult<T> = { data: T; error?: never } | { data?: never; error: string }
