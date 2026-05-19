import { requireSuperAdmin } from "@/app/lib/dal";

export default async function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  await requireSuperAdmin();

  return (
    <div style={{ minHeight: "100vh", background: "var(--md-surface)", display: "flex", flexDirection: "column" }}>
      {/* Top bar */}
      <header style={{
        height: 64,
        padding: "0 32px",
        display: "flex",
        alignItems: "center",
        gap: 14,
        background: "var(--md-surface-container-low)",
        borderBottom: "1px solid var(--md-outline-variant)",
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: "var(--md-primary)",
          color: "var(--md-on-primary)",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: 20, fontVariationSettings: "'FILL' 1, 'wght' 600" }}>pets</span>
        </div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--md-on-surface)", lineHeight: 1.2 }}>MasterPet</div>
          <div style={{ fontSize: 11, color: "var(--md-on-surface-variant)", letterSpacing: 0.4 }}>מרכז ניהול פנימי</div>
        </div>
        <div style={{ marginRight: "auto" }}>
          <span style={{
            padding: "4px 12px", borderRadius: 999,
            background: "var(--md-error-container)", color: "var(--md-on-error-container)",
            fontSize: 11, fontWeight: 700, letterSpacing: 0.4,
          }}>INTERNAL ONLY</span>
        </div>
      </header>

      <main style={{ flex: 1, padding: "32px" }}>
        {children}
      </main>
    </div>
  );
}
