import { createClient } from "@supabase/supabase-js";
import { TenantsTable } from "./tenants-table";

export const metadata = { title: "ניהול Tenants — MasterPet Admin" };
export const dynamic = "force-dynamic";

export default async function TenantsPage() {
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  const { data: tenants } = await admin
    .from("tenants")
    .select("id, name, owner_name, contact_email, contact_phone, business_type, status, created_at")
    .order("created_at", { ascending: false });

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ margin: "0 0 6px", fontSize: 26, fontWeight: 800, color: "var(--md-on-surface)" }}>
          ניהול Tenants
        </h1>
        <p style={{ margin: 0, fontSize: 14, color: "var(--md-on-surface-variant)" }}>
          אישור ודחייה של עסקים שנרשמו לפלטפורמה
        </p>
      </div>

      <TenantsTable tenants={tenants ?? []} />
    </div>
  );
}
