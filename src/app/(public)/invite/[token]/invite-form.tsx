"use client";

import { useActionState } from "react";
import { sendInviteMagicLinkAction, type InviteActionState } from "./actions";

const ROLE_LABELS: Record<string, string> = {
  owner: "בעל עסק",
  branch_manager: "מנהל סניף",
  sales: "נציג מכירות",
  warehouse: "עובד מחסן",
};

export type InviteData = {
  token: string;
  fullName: string;
  email: string | null;
  role: string;
  tenantName: string;
};

const initialState: InviteActionState = {};

export function InviteForm({ invite }: { invite: InviteData }) {
  const [state, formAction, pending] = useActionState(
    sendInviteMagicLinkAction,
    initialState
  );

  if (state.success) {
    return (
      <div
        style={{
          width: "100%",
          maxWidth: 460,
          background: "var(--md-surface-container-low)",
          borderRadius: 20,
          border: "1px solid var(--md-outline-variant)",
          padding: "48px 36px",
          boxShadow: "var(--shadow-2)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 18,
            background: "var(--md-primary-container)",
            color: "var(--md-on-primary-container)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 20,
          }}
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: 28, fontVariationSettings: "'FILL' 1, 'wght' 600" }}
          >
            mark_email_read
          </span>
        </div>
        <h2 style={{ margin: "0 0 10px", fontSize: 20, fontWeight: 700, color: "var(--md-on-surface)" }}>
          בדקו את תיבת המייל
        </h2>
        <p style={{ margin: 0, fontSize: 14, color: "var(--md-on-surface-variant)", lineHeight: 1.7 }}>
          שלחנו קישור כניסה ל־
          <span style={{ color: "var(--md-on-surface)", fontWeight: 600, direction: "ltr", display: "inline-block" }}>
            {invite.email}
          </span>
          <br />
          לחצו עליו תוך שעה אחת כדי להצטרף.
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        width: "100%",
        maxWidth: 460,
        background: "var(--md-surface-container-low)",
        borderRadius: 20,
        border: "1px solid var(--md-outline-variant)",
        padding: "40px 36px",
        boxShadow: "var(--shadow-2)",
      }}
    >
      {/* Logo */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 28 }}>
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 16,
            background: "var(--md-primary)",
            color: "var(--md-on-primary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 16,
            boxShadow: "0 2px 8px rgba(27,94,32,0.28)",
          }}
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: 28, fontVariationSettings: "'FILL' 1, 'wght' 600" }}
          >
            pets
          </span>
        </div>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "var(--md-on-surface)", textAlign: "center" }}>
          הצטרפות לצוות
        </h1>
        <p style={{ margin: "6px 0 0", fontSize: 14, color: "var(--md-on-surface-variant)", textAlign: "center" }}>
          הוזמנת להצטרף ל-MasterPet
        </p>
      </div>

      {/* Invite card */}
      <div
        style={{
          background: "var(--md-surface-container)",
          border: "1px solid var(--md-outline-variant)",
          borderRadius: 14,
          padding: "18px 20px",
          marginBottom: 24,
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {/* Business */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: "var(--md-primary-container)",
              color: "var(--md-on-primary-container)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 20, fontVariationSettings: "'FILL' 1, 'wght' 500" }}
            >
              storefront
            </span>
          </div>
          <div>
            <div style={{ fontSize: 11, color: "var(--md-on-surface-variant)", marginBottom: 2 }}>עסק</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--md-on-surface)" }}>
              {invite.tenantName}
            </div>
          </div>
        </div>

        <div style={{ height: 1, background: "var(--md-outline-variant)" }} />

        {/* Role */}
        <div>
          <div style={{ fontSize: 11, color: "var(--md-on-surface-variant)", marginBottom: 3 }}>תפקיד</div>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              padding: "4px 10px",
              borderRadius: 8,
              background: "var(--md-secondary-container)",
              color: "var(--md-on-secondary-container)",
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 14, fontVariationSettings: "'FILL' 1, 'wght' 500" }}
            >
              badge
            </span>
            {ROLE_LABELS[invite.role] ?? invite.role}
          </span>
        </div>
      </div>

      {/* Greeting */}
      <p style={{ margin: "0 0 20px", fontSize: 14, color: "var(--md-on-surface-variant)", lineHeight: 1.6 }}>
        שלום{" "}
        <span style={{ color: "var(--md-on-surface)", fontWeight: 600 }}>{invite.fullName}</span>,<br />
        נשלח לך קישור כניסה למייל{" "}
        <span style={{ color: "var(--md-on-surface)", fontWeight: 500, direction: "ltr", display: "inline-block" }}>
          {invite.email}
        </span>
        .
      </p>

      {state.error && (
        <div
          style={{
            background: "var(--md-error-container)",
            color: "var(--md-on-error-container)",
            borderRadius: 10,
            padding: "12px 16px",
            fontSize: 13,
            marginBottom: 16,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>error</span>
          {state.error}
        </div>
      )}

      <form action={formAction}>
        <input type="hidden" name="token" value={invite.token} />
        <input type="hidden" name="email" value={invite.email ?? ""} />
        <button
          type="submit"
          disabled={pending || !invite.email}
          style={{
            width: "100%",
            height: 48,
            borderRadius: 999,
            border: "none",
            background: pending || !invite.email ? "var(--md-outline-variant)" : "var(--md-primary)",
            color: pending || !invite.email ? "var(--md-on-surface-variant)" : "var(--md-on-primary)",
            fontSize: 15,
            fontWeight: 600,
            fontFamily: "inherit",
            cursor: pending || !invite.email ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            transition: "background 120ms ease",
          }}
        >
          {pending ? (
            <>
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 18, animation: "spin 1s linear infinite" }}
              >
                progress_activity
              </span>
              שולח...
            </>
          ) : (
            <>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>send</span>
              שלחו לי קישור כניסה
            </>
          )}
        </button>
      </form>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
