import 'server-only'

import { cache } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Session, UserRole } from './definitions'

export const verifySession = cache(async (): Promise<Session | null> => {
  const supabase = await createClient()

  // getClaims() verifies the JWT signature locally with the JWKS — no auth API
  // call, so it doesn't fail under rate limits or transient network issues the
  // way getUser() does on Vercel.
  const { data } = await supabase.auth.getClaims()
  const claims = data?.claims as { sub?: string; email?: string } | undefined
  const userId = claims?.sub
  if (!userId) return null

  const { data: profile } = await supabase
    .from('users')
    .select('id, auth_user_id, tenant_id, email, full_name, role, branch_id, status')
    .eq('auth_user_id', userId)
    .single()

  if (!profile || profile.status !== 'active') return null

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
    authUserId: userId,
    email: claims?.email ?? profile.email,
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
