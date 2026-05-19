"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Script from "next/script";
import { signupAction, type SignupState } from "./actions";

type TurnstileOptions = {
  sitekey: string;
  callback: (token: string) => void;
  "expired-callback"?: () => void;
  "error-callback"?: () => void;
  "timeout-callback"?: () => void;
  language?: string;
  theme?: "light" | "dark" | "auto";
};

declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement, opts: TurnstileOptions) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

const BUSINESS_TYPES = [
  "חנות מזון לבעלי חיות",
  "מחסן / הפצה",
  "רשת סניפים",
  "ספק / יצרן",
  "אחר",
];

const initialState: SignupState = {};

export function SignupForm() {
  const [state, formAction, pending] = useActionState(signupAction, initialState);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileReady, setTurnstileReady] = useState(false);
  const turnstileContainerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  const renderTurnstile = () => {
    if (!window.turnstile || !turnstileContainerRef.current || widgetIdRef.current) {
      return;
    }
    widgetIdRef.current = window.turnstile.render(turnstileContainerRef.current, {
      sitekey: TURNSTILE_SITE_KEY,
      language: "he",
      callback: (token: string) => setTurnstileToken(token),
      "expired-callback": () => setTurnstileToken(""),
      "error-callback": () => setTurnstileToken(""),
      "timeout-callback": () => setTurnstileToken(""),
    });
  };

  useEffect(() => {
    if (turnstileReady) renderTurnstile();
    return () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turnstileReady]);

  // Reset Turnstile after a failed submission (token is single-use).
  useEffect(() => {
    if (state.message && widgetIdRef.current && window.turnstile) {
      window.turnstile.reset(widgetIdRef.current);
      setTurnstileToken("");
    }
  }, [state.message]);

  return (
    <div
      style={{
        width: "100%",
        maxWidth: 480,
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
          הצטרפות ל-MasterPet
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
          מלאו את הפרטים ונחזור אליכם תוך 24 שעות
        </p>
      </div>

      {state.message && (
        <div
          style={{
            background: "var(--md-error-container)",
            color: "var(--md-on-error-container)",
            borderRadius: 10,
            padding: "12px 16px",
            fontSize: 13,
            marginBottom: 20,
          }}
        >
          {state.message}
        </div>
      )}

      <form action={formAction} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <Field
          id="businessName"
          label="שם העסק"
          name="businessName"
          placeholder="למשל: פטסטור"
          required
          error={state.errors?.businessName}
        />

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label
            htmlFor="businessType"
            style={{ fontSize: 13, fontWeight: 500, color: "var(--md-on-surface-variant)" }}
          >
            סוג העסק
          </label>
          <select
            id="businessType"
            name="businessType"
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
              cursor: "pointer",
              appearance: "none",
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%2343483F' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "left 12px center",
              paddingLeft: 36,
            }}
          >
            <option value="">בחרו סוג עסק</option>
            {BUSINESS_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <Field
          id="ownerName"
          label="שם בעל העסק"
          name="ownerName"
          placeholder="שם מלא"
          required
          error={state.errors?.ownerName}
        />

        <Field
          id="email"
          label="כתובת מייל"
          name="email"
          type="email"
          placeholder="yourname@example.com"
          required
          inputDir="ltr"
          error={state.errors?.email}
        />

        <Field
          id="phone"
          label="מספר טלפון"
          name="phone"
          type="tel"
          placeholder="050-0000000"
          required
          inputDir="ltr"
          error={state.errors?.phone}
        />

        <input type="hidden" name="turnstileToken" value={turnstileToken} />

        <div style={{ display: "flex", justifyContent: "center", marginTop: 4 }}>
          <div ref={turnstileContainerRef} />
        </div>

        <button
          type="submit"
          disabled={pending || !turnstileToken}
          style={{
            marginTop: 8,
            height: 48,
            borderRadius: 999,
            border: "none",
            background: pending || !turnstileToken ? "var(--md-outline-variant)" : "var(--md-primary)",
            color: pending || !turnstileToken ? "var(--md-on-surface-variant)" : "var(--md-on-primary)",
            fontSize: 15,
            fontWeight: 600,
            fontFamily: "inherit",
            cursor: pending || !turnstileToken ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            transition: "background 120ms ease, opacity 120ms ease",
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
              שלחו בקשת הצטרפות
              <span className="material-symbols-outlined" style={{ fontSize: 18, transform: "scaleX(-1)" }}>
                arrow_back
              </span>
            </>
          )}
        </button>
      </form>

      <p
        style={{
          marginTop: 24,
          textAlign: "center",
          fontSize: 13,
          color: "var(--md-on-surface-variant)",
        }}
      >
        כבר יש לכם חשבון?{" "}
        <a
          href="/login"
          style={{
            color: "var(--md-primary)",
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          התחברו
        </a>
      </p>

      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        strategy="afterInteractive"
        onReady={() => setTurnstileReady(true)}
      />

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

function Field({
  id,
  label,
  name,
  type = "text",
  placeholder,
  required,
  error,
  inputDir,
}: {
  id: string;
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  inputDir?: "ltr" | "rtl";
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label
        htmlFor={id}
        style={{ fontSize: 13, fontWeight: 500, color: "var(--md-on-surface-variant)" }}
      >
        {label}
        {required && (
          <span style={{ color: "var(--md-error)", marginRight: 3 }}>*</span>
        )}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        dir={inputDir}
        style={{
          height: 48,
          padding: "0 16px",
          borderRadius: 12,
          border: `1px solid ${error ? "var(--md-error)" : "var(--md-outline-variant)"}`,
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
          e.currentTarget.style.borderColor = error
            ? "var(--md-error)"
            : "var(--md-outline-variant)";
          e.currentTarget.style.boxShadow = "none";
        }}
      />
      {error && (
        <span style={{ fontSize: 12, color: "var(--md-error)", display: "flex", alignItems: "center", gap: 4 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>error</span>
          {error}
        </span>
      )}
    </div>
  );
}
