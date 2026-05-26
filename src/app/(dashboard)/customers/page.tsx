/**
 * Screen: customers-list
 * Design source: designs/MasterPet/designs/customers-list/
 * Role: All dashboard roles (sales + warehouse: read-only)
 * Phase: MVP — Sprint 5
 */
import { requireActiveTenant, getAuthenticatedClient } from '@/app/lib/dal'
import { listCustomersAction, getCustomerKpisAction } from './actions'
import { CustomersClient } from './_components/CustomersClient'

const PAGE_SIZE = 15

export default async function CustomersPage() {
  const session = await requireActiveTenant()

  const [kpisResult, customersResult] = await Promise.all([
    getCustomerKpisAction(),
    listCustomersAction({ limit: PAGE_SIZE, offset: 0 }),
  ])

  const kpis = kpisResult.data ?? { active: 0, inactive: 0, newThisMonth: 0, whatsappPct: 0 }
  const initialCustomers = customersResult.data?.customers ?? []
  const initialTotal = customersResult.data?.total ?? 0

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
    // Non-fatal — branch selector will be hidden
  }

  return (
    <div style={{ padding: '24px 32px 48px', display: 'flex', flexDirection: 'column', gap: 32 }}>
      <CustomersClient
        initialCustomers={initialCustomers}
        initialTotal={initialTotal}
        kpis={kpis}
        pageSize={PAGE_SIZE}
        branches={branches}
        role={session.profile.role}
      />
    </div>
  )
}
