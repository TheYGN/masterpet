import 'server-only'

import { headers } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
import type { Session } from './definitions'

type AuditInput = {
  action: string
  session?: Session | null
  actorUserId?: string | null
  actorEmail?: string | null
  tenantId?: string | null
  entityType?: string | null
  entityId?: string | null
  metadata?: Record<string, unknown>
}

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  )
}

export async function writeAudit(input: AuditInput): Promise<void> {
  const h = await headers()
  const forwarded = h.get('x-forwarded-for')
  const ipAddress = forwarded?.split(',')[0]?.trim() || h.get('x-real-ip') || null
  const userAgent = h.get('user-agent') || null

  const actorUserId =
    input.actorUserId ?? input.session?.profile?.id ?? null
  const actorEmail =
    input.actorEmail ?? input.session?.email ?? input.session?.profile?.email ?? null
  const tenantId =
    input.tenantId ?? input.session?.profile?.tenant_id ?? null

  const { error } = await getAdminClient()
    .from('audit_logs')
    .insert({
      action: input.action,
      actor_user_id: actorUserId,
      actor_email: actorEmail,
      tenant_id: tenantId,
      entity_type: input.entityType ?? null,
      entity_id: input.entityId ?? null,
      metadata: input.metadata ?? null,
      ip_address: ipAddress,
      user_agent: userAgent,
    })

  if (error) {
    // Audit failure must never break the action that triggered it.
    console.error('[audit] write failed', {
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      error: error.message,
    })
  }
}
