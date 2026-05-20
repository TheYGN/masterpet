"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { withAuth } from "@/app/lib/auth-wrapper";
import { writeAudit } from "@/app/lib/audit";
import { sendTenantApprovedEmail } from "@/app/lib/email";

const GENERIC_ERROR = "פעולה נכשלה, נסה שוב";

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

export const approveTenantAction = withAuth(
  ["super_admin"],
  async (session, tenantId: string): Promise<{ error?: string }> => {
  const admin = adminClient();

  const { data: tenant, error: fetchErr } = await admin
    .from("tenants")
    .select("id, name, owner_name, contact_email, status")
    .eq("id", tenantId)
    .single();

  if (fetchErr || !tenant) {
    if (fetchErr) console.error("[approveTenant] fetch failed", fetchErr);
    return { error: "העסק לא נמצא" };
  }
  if (tenant.status !== "pending_approval") return { error: "העסק כבר טופל" };

  const trialEndsAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();

  // 1. Activate tenant
  const { error: updateErr } = await admin
    .from("tenants")
    .update({ status: "active", trial_ends_at: trialEndsAt, approved_at: new Date().toISOString() })
    .eq("id", tenantId);
  if (updateErr) {
    console.error("[approveTenant] update failed", updateErr);
    return { error: GENERIC_ERROR };
  }

  // 2. Create auth user (confirmed so they can log in immediately with Magic Link)
  const { data: authData, error: authErr } = await admin.auth.admin.createUser({
    email: tenant.contact_email,
    email_confirm: true,
    user_metadata: { full_name: tenant.owner_name ?? tenant.name },
  });
  if (authErr && authErr.message !== "A user with this email address has already been registered") {
    console.error("[approveTenant] createUser failed", authErr);
    return { error: GENERIC_ERROR };
  }

  const authUserId = authData?.user?.id;

  if (authUserId) {
    // 3. Create owner profile in public.users
    await admin.from("users").upsert({
      auth_user_id: authUserId,
      tenant_id: tenantId,
      email: tenant.contact_email,
      full_name: tenant.owner_name ?? tenant.name,
      role: "owner",
      status: "active",
    }, { onConflict: "auth_user_id" });
    // No signOut needed: user was just created here, no live session to invalidate.
    // For future role-change / tenant-suspend actions, revoke sessions explicitly.
  }

  // 3b. Create default branch — every tenant needs at least one branch for RLS isolation.
  // Uses slug "main" which is the convention (matches QA seed). Idempotent via ON CONFLICT DO NOTHING.
  await admin.from("branches").upsert({
    tenant_id: tenantId,
    name: tenant.name,
    slug: "main",
    is_active: true,
  }, { onConflict: "tenant_id,slug", ignoreDuplicates: true });

  // 4. Generate Magic Link and deliver it ourselves via Resend.
  // We pass `redirect_to` only; Supabase generates a token_hash flow link.
  const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email: tenant.contact_email,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  });

  let emailSent = false;
  let emailError: string | undefined;
  const actionLink = linkData?.properties?.action_link;
  if (linkErr) {
    console.error("[approveTenant] generateLink failed", linkErr);
    emailError = "generate_link_failed";
  } else if (actionLink) {
    const result = await sendTenantApprovedEmail({
      to: tenant.contact_email,
      ownerName: tenant.owner_name ?? tenant.name,
      tenantName: tenant.name,
      magicLink: actionLink,
    });
    emailSent = result.sent;
    emailError = result.error;
  } else {
    emailError = "no_action_link";
  }

  await writeAudit({
    action: "tenant.approved",
    session,
    entityType: "tenant",
    entityId: tenantId,
    metadata: {
      tenant_name: tenant.name,
      contact_email: tenant.contact_email,
      owner_auth_user_id: authUserId ?? null,
      trial_ends_at: trialEndsAt,
      email_sent: emailSent,
      email_error: emailError ?? null,
    },
  });

  revalidatePath("/super-admin/tenants");
  return {};
  }
);

export const rejectTenantAction = withAuth(
  ["super_admin"],
  async (session, tenantId: string): Promise<{ error?: string }> => {
    const admin = adminClient();

    const { data: tenant } = await admin
      .from("tenants")
      .select("id, name, contact_email")
      .eq("id", tenantId)
      .single();

    const { error } = await admin
      .from("tenants")
      .update({ status: "cancelled" })
      .eq("id", tenantId)
      .eq("status", "pending_approval");

    if (error) {
      console.error("[rejectTenant] update failed", error);
      return { error: GENERIC_ERROR };
    }

    await writeAudit({
      action: "tenant.rejected",
      session,
      entityType: "tenant",
      entityId: tenantId,
      metadata: {
        tenant_name: tenant?.name ?? null,
        contact_email: tenant?.contact_email ?? null,
      },
    });

    revalidatePath("/super-admin/tenants");
    return {};
  }
);
