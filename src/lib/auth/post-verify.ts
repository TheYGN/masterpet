import "server-only";

import { redirect } from "next/navigation";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import type { User } from "@supabase/supabase-js";

export async function postVerifyOrchestration(
  user: User,
  invitationToken: string | null
): Promise<never> {
  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  if (invitationToken) {
    const { data: inv } = await admin
      .from("invitations")
      .select("id, tenant_id, role, branch_id, full_name, email, status, expires_at")
      .eq("token", invitationToken)
      .single();

    if (
      !inv ||
      inv.status !== "pending" ||
      new Date(inv.expires_at) < new Date()
    ) {
      redirect("/login?error=invite_invalid");
    }

    if (
      inv.email &&
      inv.email.toLowerCase() !== (user.email ?? "").toLowerCase()
    ) {
      redirect("/login?error=invite_email_mismatch");
    }

    const { error: userError } = await admin.from("users").insert({
      auth_user_id: user.id,
      tenant_id: inv.tenant_id,
      email: inv.email ?? user.email,
      full_name: inv.full_name,
      role: inv.role,
      branch_id: inv.branch_id ?? null,
      status: "active",
    });

    if (userError && userError.code !== "23505") {
      redirect("/login?error=auth_failed");
    }

    await admin
      .from("invitations")
      .update({ status: "accepted", accepted_at: new Date().toISOString() })
      .eq("id", inv.id);

    redirect("/dashboard");
  }

  const { data: profile } = await admin
    .from("users")
    .select("role")
    .eq("auth_user_id", user.id)
    .single();

  if (profile?.role === "super_admin") redirect("/super-admin/tenants");
  if (profile) redirect("/dashboard");
  redirect("/login?error=no_profile");
}
