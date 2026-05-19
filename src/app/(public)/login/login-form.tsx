"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "./actions";

const initialState: LoginState = {};

export function LoginForm({ errorParam }: { errorParam?: string }) {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  if (state.success) {
    return (
      <div
        style={{
          width: "100%",
          maxWidth: 440,
          background: "var(--md-surface-container-low)",
          borderRadius: 20,
          border: "1px solid var(--md-outline-variant)",
          padding: "48px 36px",
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
        <h2
          style={{
            margin: "0 0 10px",
            fontSize: 20,
            fontWeight: 700,
            color: "var(--md-on-surface)",
          }}
        >
          בדקו את תיבת המייל
        </h2>
        <p
          style={{
            margin: "0 0 28px",
            fontSize: 14,
            color: "var(--md-on-surface-variant)",
            lineHeight: 1.7,
          }}
        >
          שלחנו לכם קישור כניסה. לחצו עליו תוך שעה אחת.
        </p>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: "10px 24px",
            borderRadius: 999,
            border: "1px solid var(--md-outline-variant)",
            background: "transparent",
            color: "var(--md-on-surface-variant)",
            fontSize: 13,
            fontWeight: 500,
            fontFamily: "inherit",
            cursor: "pointer",
          }}
        >
          שלחו קישור חדש
        </button>
      </div>
    );
  }

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
      }}
    >
      {/* Logo */}
      <div
        style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 28 }}
      >
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
        <h1
          style={{
            margin: 0,
            fontSize: 22,
            fontWeight: 700,
            color: "var(--md-on-surface)",
            lineHeight: 1.3,
            textAlign: "center",
          }}
        >
          כניסה ל-MasterPet
        </h1>
        <p
          style={{
            margin: "6px 0 0",
            fontSize: 14,
            color: "var(--md-on-surface-variant)",
            textAlign: "center",
            lineHeight: 1.5,
          }}
        >
          נשלח לכם קישור כניסה מאובטח למייל
        </p>
      </div>

      {/* Error from redirect (e.g. auth failed) */}
      {(errorParam || state.error) && (
        <div
          style={{
            background: "var(--md-error-container)",
            color: "var(--md-on-error-container)",
            borderRadius: 10,
            padding: "12px 16px",
            fontSize: 13,
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18, flexShrink: 0 }}>
            error
          </span>
          {state.error ?? (errorParam === "auth_failed" ? "הקישור לא תקין או פג תוקפו. בקשו קישור חדש." : "אירעה שגיאה.")}
        </div>
      )}

      <form action={formAction} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label
            htmlFor="email"
            style={{ fontSize: 13, fontWeight: 500, color: "var(--md-on-surface-variant)" }}
          >
            כתובת מייל
            <span style={{ color: "var(--md-error)", marginRight: 3 }}>*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="yourname@example.com"
            required
            dir="ltr"
            style={{
              height: 48,
              padding: "0 16px",
              borderRadius: 12,
              border: "1px solid var(--md-outline-variant)",
              background: "var(--md-surface-container)",
              color: "var(--md-on-surface)",
              fontSize: 14,
              fontFamily: "inherit",
              outline: "none",
              transition: "border-color 120ms ease",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "var(--md-primary)";
              e.currentTarget.style.boxShadow = "0 0 0 3px rgba(27,94,32,0.12)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "var(--md-outline-variant)";
              e.currentTarget.style.boxShadow = "none";
            }}
          />
        </div>

        <button
          type="submit"
          disabled={pending}
          style={{
            marginTop: 4,
            height: 48,
            borderRadius: 999,
            border: "none",
            background: pending ? "var(--md-outline-variant)" : "var(--md-primary)",
            color: pending ? "var(--md-on-surface-variant)" : "var(--md-on-primary)",
            fontSize: 15,
            fontWeight: 600,
            fontFamily: "inherit",
            cursor: pending ? "not-allowed" : "pointer",
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
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                send
              </span>
              שלחו קישור כניסה
            </>
          )}
        </button>
      </form>

      {/* Magic link explainer */}
      <div
        style={{
          marginTop: 20,
          padding: "12px 14px",
          borderRadius: 10,
          background: "var(--md-surface-container)",
          border: "1px solid var(--md-outline-variant)",
          display: "flex",
          gap: 10,
          alignItems: "flex-start",
        }}
      >
        <span
          className="material-symbols-outlined"
          style={{ fontSize: 18, color: "var(--md-on-surface-variant)", flexShrink: 0, marginTop: 1 }}
        >
          info
        </span>
        <p
          style={{
            margin: 0,
            fontSize: 12,
            color: "var(--md-on-surface-variant)",
            lineHeight: 1.6,
          }}
        >
          Magic Link הוא קישור חד-פעמי מאובטח — לא צריך סיסמה. הקישור בתוקף לשעה אחת.
        </p>
      </div>

      <p
        style={{
          marginTop: 24,
          textAlign: "center",
          fontSize: 13,
          color: "var(--md-on-surface-variant)",
        }}
      >
        עדיין אין לכם חשבון?{" "}
        <a
          href="/signup"
          style={{ color: "var(--md-primary)", fontWeight: 600, textDecoration: "none" }}
        >
          הצטרפו עכשיו
        </a>
      </p>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
