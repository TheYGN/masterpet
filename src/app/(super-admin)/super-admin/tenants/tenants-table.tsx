"use client";

import { useState, useTransition } from "react";
import { approveTenantAction, rejectTenantAction } from "./actions";

type Tenant = {
  id: string;
  name: string;
  owner_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  business_type: string | null;
  status: string;
  created_at: string;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("he-IL", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; bg: string; color: string }> = {
    pending_approval: { label: "ממתין לאישור", bg: "var(--md-warning-container)", color: "var(--md-on-warning-container)" },
    active:           { label: "פעיל",         bg: "var(--md-primary-container)",  color: "var(--md-on-primary-container)" },
    suspended:        { label: "מושעה",        bg: "var(--md-error-container)",    color: "var(--md-on-error-container)" },
    cancelled:        { label: "נדחה",         bg: "var(--md-surface-container-highest)", color: "var(--md-on-surface-variant)" },
  };
  const s = map[status] ?? map.pending_approval;
  return (
    <span style={{
      padding: "4px 10px", borderRadius: 8,
      background: s.bg, color: s.color,
      fontSize: 12, fontWeight: 600, whiteSpace: "nowrap",
    }}>{s.label}</span>
  );
}

function TenantRow({ tenant, filter }: { tenant: Tenant; filter: string }) {
  const [isPending, startTransition] = useTransition();
  const [done, setDone] = useState<"approved" | "rejected" | null>(null);

  if (filter === "pending" && tenant.status !== "pending_approval") return null;
  if (filter === "active" && tenant.status !== "active") return null;

  const handleApprove = () => {
    startTransition(async () => {
      const res = await approveTenantAction(tenant.id);
      if (!res.error) setDone("approved");
    });
  };

  const handleReject = () => {
    startTransition(async () => {
      const res = await rejectTenantAction(tenant.id);
      if (!res.error) setDone("rejected");
    });
  };

  if (done) {
    return (
      <tr>
        <td colSpan={7} style={{ padding: "16px 20px", textAlign: "center", color: "var(--md-on-surface-variant)", fontSize: 13 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 16, verticalAlign: "middle", marginLeft: 6, color: done === "approved" ? "var(--md-primary)" : "var(--md-error)" }}>
            {done === "approved" ? "check_circle" : "cancel"}
          </span>
          {done === "approved" ? "הטנאנט אושר — נשלח Magic Link לבעלים" : "הטנאנט נדחה"}
        </td>
      </tr>
    );
  }

  return (
    <tr style={{ borderBottom: "1px solid var(--md-outline-variant)", transition: "background 100ms" }}
      onMouseEnter={e => (e.currentTarget.style.background = "var(--md-surface-container)")}
      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
    >
      <td style={{ padding: "14px 20px" }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--md-on-surface)" }}>{tenant.name}</div>
        {tenant.business_type && (
          <div style={{ fontSize: 12, color: "var(--md-on-surface-variant)", marginTop: 2 }}>{tenant.business_type}</div>
        )}
      </td>
      <td style={{ padding: "14px 20px" }}>
        <div style={{ fontSize: 13, color: "var(--md-on-surface)" }}>{tenant.owner_name ?? "—"}</div>
      </td>
      <td style={{ padding: "14px 20px" }}>
        <a href={`mailto:${tenant.contact_email}`} style={{ fontSize: 13, color: "var(--md-primary)", direction: "ltr", display: "block", textDecoration: "none", textAlign: "right" }}>
          {tenant.contact_email ?? "—"}
        </a>
      </td>
      <td style={{ padding: "14px 20px" }}>
        <span style={{ fontSize: 13, color: "var(--md-on-surface)", direction: "ltr", display: "block", textAlign: "right" }}>
          {tenant.contact_phone ?? "—"}
        </span>
      </td>
      <td style={{ padding: "14px 20px" }}>
        <StatusBadge status={tenant.status} />
      </td>
      <td style={{ padding: "14px 20px", color: "var(--md-on-surface-variant)", fontSize: 12 }}>
        {formatDate(tenant.created_at)}
      </td>
      <td style={{ padding: "14px 20px" }}>
        {tenant.status === "pending_approval" ? (
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button
              onClick={handleApprove}
              disabled={isPending}
              style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                padding: "7px 14px", borderRadius: 999, border: "none",
                background: isPending ? "var(--md-outline-variant)" : "var(--md-primary)",
                color: isPending ? "var(--md-on-surface-variant)" : "var(--md-on-primary)",
                fontSize: 12, fontWeight: 600, fontFamily: "inherit", cursor: isPending ? "not-allowed" : "pointer",
                transition: "background 120ms",
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                {isPending ? "progress_activity" : "check"}
              </span>
              אשר
            </button>
            <button
              onClick={handleReject}
              disabled={isPending}
              style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                padding: "7px 14px", borderRadius: 999,
                border: "1px solid var(--md-outline-variant)",
                background: "transparent",
                color: "var(--md-error)",
                fontSize: 12, fontWeight: 600, fontFamily: "inherit", cursor: isPending ? "not-allowed" : "pointer",
                transition: "background 120ms",
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>close</span>
              דחה
            </button>
          </div>
        ) : (
          <span style={{ fontSize: 12, color: "var(--md-on-surface-variant)" }}>—</span>
        )}
      </td>
    </tr>
  );
}

export function TenantsTable({ tenants }: { tenants: Tenant[] }) {
  const [filter, setFilter] = useState<"pending" | "active" | "all">("pending");

  const counts = {
    pending: tenants.filter(t => t.status === "pending_approval").length,
    active:  tenants.filter(t => t.status === "active").length,
    all:     tenants.length,
  };

  const tabs = [
    { id: "pending", label: "ממתינים לאישור", count: counts.pending },
    { id: "active",  label: "פעילים",          count: counts.active },
    { id: "all",     label: "הכל",              count: counts.all },
  ] as const;

  return (
    <div style={{
      background: "var(--md-surface-container-low)",
      borderRadius: 16,
      border: "1px solid var(--md-outline-variant)",
      overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{ padding: "20px 20px 0", display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "var(--md-on-surface)" }}>
              בקשות הצטרפות
            </h2>
            <p style={{ margin: "3px 0 0", fontSize: 13, color: "var(--md-on-surface-variant)" }}>
              ניהול tenants ואישור חשבונות חדשים
            </p>
          </div>
          {counts.pending > 0 && (
            <span style={{
              padding: "6px 14px", borderRadius: 999,
              background: "var(--md-warning-container)", color: "var(--md-on-warning-container)",
              fontSize: 13, fontWeight: 700,
              display: "flex", alignItems: "center", gap: 6,
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>pending_actions</span>
              {counts.pending} ממתינים
            </span>
          )}
        </div>

        {/* Filter tabs */}
        <div style={{ display: "flex", gap: 0, borderBottom: "1px solid var(--md-outline-variant)" }}>
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setFilter(t.id)}
              style={{
                padding: "10px 18px",
                border: "none",
                borderBottom: filter === t.id ? `2px solid var(--md-primary)` : "2px solid transparent",
                background: "transparent",
                color: filter === t.id ? "var(--md-primary)" : "var(--md-on-surface-variant)",
                fontSize: 13, fontWeight: filter === t.id ? 600 : 500,
                fontFamily: "inherit", cursor: "pointer",
                display: "flex", alignItems: "center", gap: 7,
                transition: "color 120ms",
                marginBottom: -1,
              }}
            >
              {t.label}
              <span style={{
                background: filter === t.id ? "var(--md-primary-container)" : "var(--md-surface-container-high)",
                color: filter === t.id ? "var(--md-on-primary-container)" : "var(--md-on-surface-variant)",
                padding: "1px 7px", borderRadius: 999, fontSize: 11, fontWeight: 700,
              }}>{t.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--md-outline-variant)" }}>
              {["שם עסק", "בעלים", "מייל", "טלפון", "סטטוס", "תאריך רישום", "פעולות"].map((h, i) => (
                <th key={i} style={{
                  padding: "10px 20px",
                  textAlign: "right",
                  fontSize: 11, fontWeight: 700, letterSpacing: 0.4,
                  color: "var(--md-on-surface-variant)",
                  textTransform: "uppercase",
                  background: "var(--md-surface-container)",
                  whiteSpace: "nowrap",
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tenants.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: "48px 20px", textAlign: "center", color: "var(--md-on-surface-variant)", fontSize: 14 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 32, display: "block", marginBottom: 8, opacity: 0.4 }}>inbox</span>
                  אין בקשות להצגה
                </td>
              </tr>
            ) : (
              tenants.map(t => <TenantRow key={t.id} tenant={t} filter={filter} />)
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
