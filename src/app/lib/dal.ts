import 'server-only'

import { cache } from 'react'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import type { Session, UserRole } from './definitions'

const SUPABASE_REF = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '')
  .replace(/^https?:\/\//, '')
  .split('.')[0]
const AUTH_COOKIE_NAME = `sb-${SUPABASE_REF}-auth-token`

async function jwtFromCookies(): Promise<string | null> {
  const store = await cookies()
  const chunks = store
    .getAll()
    .filter((c) => c.name === AUTH_COOKIE_NAME || c.name.startsWith(`${AUTH_COOKIE_NAME}.`))
    .sort((a, b) => a.name.localeCompare(b.name))
  if (chunks.length === 0) return null
  let raw = chunks.map((c) => c.value).join('')
  if (raw.startsWith('base64-')) {
    raw = Buffer.from(raw.slice('base64-'.length), 'base64').toString('utf8')
  }
  try {
    const parsed = JSON.parse(raw) as { access_token?: string }
    return parsed.access_token ?? null
  } catch {
    return null
  }
}

export const verifySession = cache(async (): Promise<Session | null> => {
  const supabase = await createClient()

  // Read JWT directly from the cookie so we don't depend on Supabase's session
  // loader (which can return null on Vercel due to storage edge cases). Then
  // verify locally with getClaims(jwt) — JWKS signature check, no auth API call.
  const jwt = await jwtFromCookies()
  if (!jwt) {
    console.log('[verifySession] no jwt in cookies')
    return null
  }
  const { data, error } = await supabase.auth.getClaims(jwt)
  if (error || !data) {
    console.log('[verifySession] getClaims failed:', error?.message)
    return null
  }
  const claims = data.claims as { sub?: string; email?: string }
  const userId = claims.sub
  if (!userId) {
    console.log('[verifySession] no sub in claims')
    return null
  }

  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('id, auth_user_id, tenant_id, email, full_name, role, branch_id, status')
    .eq('auth_user_id', userId)
    .single()

  if (profileError) {
    console.log('[verifySession] profile query error:', profileError.message, 'code:', profileError.code)
  }

  if (!profile || profile.status !== 'active') {
    console.log('[verifySession] no active profile for', userId)
    return null
  }

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
