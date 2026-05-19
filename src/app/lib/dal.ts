import 'server-only'

import { cache } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Session, UserRole } from './definitions'

export const verifySession = cache(async (): Promise<Session | null> => {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from('users')
    .select('id, auth_user_id, tenant_id, email, full_name, role, branch_id, status')
    .eq('auth_user_id', user.id)
    .single()

  if (!profile) return null

  let tenant: Session['tenant'] = null
  if (profile.tenant_id) {
    const { data: tenantRow } = await supabase
      .from('tenants')
      .select('id, name, status, trial_status, trial_ends_at')
      .eq('id', profile.tenant_id)
      .single()
    tenant = tenantRow ?? null
  }

  return {
    authUserId: user.id,
    email: user.email ?? profile.email,
    profile,
    tenant,
  }
})

export const requireSession = cache(async (): Promise<Session> => {
  const session = await verifySession()
  if (!session) redirect('/login')
  return session
})

export const requireRole = cache(
  async (allowed: UserRole[]): Promise<Session> => {
    const session = await requireSession()
    if (!allowed.includes(session.profile.role)) redirect('/403')
    return session
  }
)

export const requireSuperAdmin = cache(async (): Promise<Session> => {
  return requireRole(['super_admin'])
})

export const requireActiveTenant = cache(async (): Promise<Session> => {
  const session = await requireSession()
  if (session.profile.role === 'super_admin') return session
  if (!session.tenant || session.tenant.status !== 'active') redirect('/403')
  return session
})

export const getUser = cache(async () => {
  const session = await verifySession()
  return session?.profile ?? null
})
