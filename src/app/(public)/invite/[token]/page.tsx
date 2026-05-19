import { createClient } from "@supabase/supabase-js";
import { InviteForm } from "./invite-form";

export const metadata = { title: "הצטרפות לצוות — MasterPet" };

function ErrorCard({ title, body }: { title: string; body: string }) {
  return (
    <div
      style={{
        width: "100%",
        maxWidth: 440,
        background: "var(--md-surface-container-low)",
        borderRadius: 20,
        border: "1px solid var(--md-outline-variant)",
        padding: "40px 36px",
        boxShadow: "var(--shadow-2)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        gap: 0,
      }}
    >
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: 16,
          background: "var(--md-error-container)",
          color: "var(--md-error)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 18,
        }}
      >
        <span
          className="material-symbols-outlined"
          style={{ fontSize: 26, fontVariationSettings: "'FILL' 1, 'wght' 500" }}
        >
          link_off
        </span>
      </div>
      <h1 style={{ margin: "0 0 10px", fontSize: 20, fontWeight: 700, color: "var(--md-on-surface)" }}>
        {title}
      </h1>
      <p style={{ margin: "0 0 28px", fontSize: 14, color: "var(--md-on-surface-variant)", lineHeight: 1.7 }}>
        {body}
      </p>
      <a
        href="/login"
        style={{
          padding: "10px 24px",
          borderRadius: 999,
          background: "var(--md-primary)",
          color: "var(--md-on-primary)",
          textDecoration: "none",
          fontSize: 14,
          fontWeight: 600,
        }}
      >
        לדף הכניסה
      </a>
    </div>
  );
}

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  // Note: this page is reachable by anyone who holds the token. Token entropy
  // is enforced at DB level (≥43 chars = ≥256-bit). We deliberately don't return
  // the inviter's name here — it would leak employee identity to a token holder.
  const { data: inv } = await supabase
    .from("invitations")
    .select(`
      token, full_name, email, phone, role, status, expires_at,
      tenants ( name )
    `)
    .eq("token", token)
    .single();

  if (!inv) {
    return (
      <ErrorCard
        title="ההזמנה לא נמצאה"
        body="הקישור אינו תקין. ייתכן שהוזן בצורה שגויה. פנו למי שהזמין אותכם לקבל קישור חדש."
      />
    );
  }

  if (inv.status === "accepted") {
    return (
      <ErrorCard
        title="ההזמנה כבר נוצלה"
        body="קישור זה שימש כבר להצטרפות. אם יש לכם חשבון — היכנסו דרך דף הכניסה."
      />
    );
  }

  if (inv.status === "revoked") {
    return (
      <ErrorCard
        title="ההזמנה בוטלה"
        body="ההזמנה בוטלה על-ידי המזמין. פנו אליהם להזמנה חדשה."
      />
    );
  }

  if (inv.status === "expired" || new Date(inv.expires_at) < new Date()) {
    return (
      <ErrorCard
        title="ההזמנה פגה תוקף"
        body="קישור ההזמנה פג לאחר 7 ימים. פנו למי שהזמין אותכם כדי לקבל הזמנה חדשה."
      />
    );
  }

  const tenantRaw = inv.tenants as unknown as { name: string } | { name: string }[] | null;
  const tenantName = (Array.isArray(tenantRaw) ? tenantRaw[0]?.name : tenantRaw?.name) ?? "העסק";

  return (
    <InviteForm
      invite={{
        token: inv.token,
        fullName: inv.full_name,
        email: inv.email,
        role: inv.role,
        tenantName,
      }}
    />
  );
}
