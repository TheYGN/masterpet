/**
 * Screen: customer-card
 * Design source: designs/MasterPet/designs/customer-card/
 * Phase: MVP — Sprint 5
 */
import { notFound } from 'next/navigation'
import { requireActiveTenant, getAuthenticatedClient } from '@/app/lib/dal'
import { getCustomerAction } from '../actions'
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
      />
    </div>
  )
}
