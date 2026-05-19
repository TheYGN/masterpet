import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const invitationToken = searchParams.get("invitation_token");

  if (!code && !token_hash) {
    return NextResponse.redirect(`${origin}/login?error=auth_failed`);
  }

  const supabase = await createClient();

  if (token_hash) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: (type ?? "magiclink") as "magiclink" | "signup" | "recovery" | "invite" | "email_change" | "email",
    });
    if (error) {
      return NextResponse.redirect(`${origin}/login?error=auth_failed`);
    }
  } else if (code) {
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    if (exchangeError) {
      return NextResponse.redirect(`${origin}/login?error=auth_failed`);
    }
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(`${origin}/login?error=auth_failed`);
  }

  // ── Invitation flow ──────────────────────────────────────────────
  if (invitationToken) {
    const admin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    );

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
      return NextResponse.redirect(`${origin}/login?error=invite_invalid`);
    }

    // Verify the invitation email matches the authenticated user's email.
    // Without this, Mallory could log in with their own email + Victim's
    // invitation_token and take over Victim's seat in the tenant.
    if (
      inv.email &&
      inv.email.toLowerCase() !== (user.email ?? "").toLowerCase()
    ) {
      return NextResponse.redirect(`${origin}/login?error=invite_email_mismatch`);
    }

    // Create user profile
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
      // 23505 = unique violation (already exists) — treat as ok
      return NextResponse.redirect(`${origin}/login?error=auth_failed`);
    }

    // Mark invitation accepted
    await admin
      .from("invitations")
      .update({ status: "accepted", accepted_at: new Date().toISOString() })
      .eq("id", inv.id);

    return NextResponse.redirect(`${origin}/dashboard`);
  }

  // ── Normal login flow ────────────────────────────────────────────
  // Use service-role client to bypass RLS; only reads role for redirect.
  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  const { data: profile } = await admin
    .from("users")
    .select("role")
    .eq("auth_user_id", user.id)
    .single();

  if (profile?.role === "super_admin") {
    return NextResponse.redirect(`${origin}/super-admin/tenants`);
  }
  if (profile) {
    return NextResponse.redirect(`${origin}/dashboard`);
  }

  return NextResponse.redirect(`${origin}/login?error=no_profile`);
}
