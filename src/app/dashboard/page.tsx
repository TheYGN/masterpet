import { redirect } from "next/navigation"
import { requireActiveTenant } from "@/app/lib/dal"

export default async function DashboardPage() {
  const session = await requireActiveTenant()

  if (session.profile.role === "super_admin") {
    redirect("/super-admin/tenants")
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--md-surface)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 16,
      padding: 32,
      fontFamily: "var(--font-sans), Heebo, sans-serif",
      direction: "rtl",
    }}>
      <div style={{
        width: 56, height: 56, borderRadius: 16,
        background: "var(--md-primary)",
        color: "var(--md-on-primary)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <span className="material-symbols-outlined" style={{ fontSize: 28, fontVariationSettings: "'FILL' 1" }}>pets</span>
      </div>

      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: "var(--md-on-surface)" }}>
          ברוך הבא, {session.profile.full_name}
        </div>
        <div style={{ fontSize: 14, color: "var(--md-on-surface-variant)", marginTop: 4 }}>
          {session.tenant?.name}
        </div>
      </div>

      <div style={{
        marginTop: 8,
        padding: "16px 24px",
        borderRadius: 12,
        background: "var(--md-surface-container)",
        border: "1px solid var(--md-outline-variant)",
        textAlign: "center",
        maxWidth: 360,
      }}>
        <div style={{ fontSize: 13, color: "var(--md-on-surface-variant)" }}>
          הדשבורד בפיתוח — Sprint 3-4
        </div>
        <div style={{ fontSize: 12, color: "var(--md-outline)", marginTop: 4 }}>
          ההתחברות הצליחה בהצלחה
        </div>
      </div>
    </div>
  )
}
