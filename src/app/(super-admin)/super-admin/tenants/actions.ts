"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { withAuth } from "@/app/lib/auth-wrapper";

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

export const approveTenantAction = withAuth(
  ["super_admin"],
  async (_session, tenantId: string): Promise<{ error?: string }> => {
  const admin = adminClient();

  const { data: tenant, error: fetchErr } = await admin
    .from("tenants")
    .select("id, name, owner_name, contact_email, status")
    .eq("id", tenantId)
    .single();

  if (fetchErr || !tenant) return { error: "Tenant not found" };
  if (tenant.status !== "pending_approval") return { error: "Already processed" };

  const trialEndsAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();

  // 1. Activate tenant
  const { error: updateErr } = await admin
    .from("tenants")
    .update({ status: "active", trial_ends_at: trialEndsAt, approved_at: new Date().toISOString() })
    .eq("id", tenantId);
  if (updateErr) return { error: updateErr.message };

  // 2. Create auth user (confirmed so they can log in immediately with Magic Link)
  const { data: authData, error: authErr } = await admin.auth.admin.createUser({
    email: tenant.contact_email,
    email_confirm: true,
    user_metadata: { full_name: tenant.owner_name ?? tenant.name },
  });
  if (authErr && authErr.message !== "A user with this email address has already been registered") {
    return { error: authErr.message };
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
  }

  // 4. Send Magic Link to owner
  await admin.auth.admin.generateLink({
    type: "magiclink",
    email: tenant.contact_email,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  });

  revalidatePath("/super-admin/tenants");
  return {};
  }
);

export const rejectTenantAction = withAuth(
  ["super_admin"],
  async (_session, tenantId: string): Promise<{ error?: string }> => {
    const admin = adminClient();

    const { error } = await admin
      .from("tenants")
      .update({ status: "cancelled" })
      .eq("id", tenantId)
      .eq("status", "pending_approval");

    if (error) return { error: error.message };

    revalidatePath("/super-admin/tenants");
    return {};
  }
);
