/**
 * Screen: customer-card
 * Design source: designs/MasterPet/designs/customer-card/
 * Phase: MVP — Sprint 5
 */
import { notFound } from 'next/navigation'
import { requireActiveTenant, getAuthenticatedClient } from '@/app/lib/dal'
import { getCustomerAction } from '../actions'
import { listOrdersAction } from '../../orders/actions'
import type { OrderListItem } from '../../orders/types'
import { CustomerDetailClient } from './_components/CustomerDetailClient'

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await requireActiveTenant()
  const { id } = await params

  const result = await getCustomerAction(id)
  if (result.error || !result.data) notFound()

  // Real order history (PRD #6 / Orders is live). RLS + branch isolation handled
  // by listOrdersAction. limit 200 covers virtually all single-customer cases;
  // the accurate total count comes from `ordersTotal` regardless.
  let orders: OrderListItem[] = []
  let ordersTotal = 0
  const ordersRes = await listOrdersAction({ customer_id: id, limit: 200, offset: 0 })
  if (ordersRes.data) {
    orders = ordersRes.data.orders
    ordersTotal = ordersRes.data.total
  }

  let branches: Array<{ id: string; name: string }> = []
  try {
    const supabase = await getAuthenticatedClient()
    const { data } = await supabase
      .from('branches')
      .select('id, name')
      .eq('is_active', true)
      .order('name', { ascending: true })
    branches = (data ?? []) as Array<{ id: string; name: string }>
  } catch {
    // non-fatal
  }

  return (
    <div style={{ padding: '24px 32px 48px' }}>
      <CustomerDetailClient
        customer={result.data}
        branches={branches}
        role={session.profile.role}
        orders={orders}
        ordersTotal={ordersTotal}
      />
    </div>
  )
}
