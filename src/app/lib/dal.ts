import 'server-only'

import { cache } from 'react'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
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
  const baseClient = await createClient()

  // Read JWT directly from the cookie. Bypasses Supabase's session loader,
  // which on Vercel can fail to attach the JWT to the client's Authorization
  // header (and then RLS sees an anonymous request).
  const jwt = await jwtFromCookies()
  if (!jwt) return null

  // Verify the JWT locally with getClaims(jwt) — JWKS signature check, no API.
  const { data, error } = await baseClient.auth.getClaims(jwt)
  if (error || !data) return null
  const claims = data.claims as { sub?: string; email?: string }
  const userId = claims.sub
  if (!userId) return null

  // Build a Supabase client with the JWT pinned as Authorization so RLS sees
  // the authenticated user (current_user_role(), auth.uid()) on the queries
  // below. apikey must also be set explicitly — overriding global.headers
  // would otherwise drop the anon-key header Supabase adds by default.
  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: { persistSession: false, autoRefreshToken: false },
      global: {
        headers: {
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          Authorization: `Bearer ${jwt}`,
        },
      },
    }
  )

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
    email: claims.email ?? profile.email,
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
