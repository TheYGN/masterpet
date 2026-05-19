export const metadata = {
  title: "הבקשה התקבלה — MasterPet",
};

export default function SignupSuccessPage() {
  return (
    <div
      style={{
        width: "100%",
        maxWidth: 480,
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
      {/* Icon */}
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 20,
          background: "var(--md-primary-container)",
          color: "var(--md-on-primary-container)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 24,
        }}
      >
        <span
          className="material-symbols-outlined"
          style={{ fontSize: 32, fontVariationSettings: "'FILL' 1, 'wght' 600" }}
        >
          mark_email_read
        </span>
      </div>

      <h1
        style={{
          margin: "0 0 10px",
          fontSize: 22,
          fontWeight: 700,
          color: "var(--md-on-surface)",
          lineHeight: 1.3,
        }}
      >
        הבקשה התקבלה!
      </h1>
      <p
        style={{
          margin: "0 0 32px",
          fontSize: 15,
          color: "var(--md-on-surface-variant)",
          lineHeight: 1.7,
          maxWidth: 360,
        }}
      >
        תודה שנרשמתם. הצוות שלנו יבדוק את הבקשה ויחזור אליכם תוך{" "}
        <strong style={{ color: "var(--md-on-surface)", fontWeight: 600 }}>24 שעות</strong>.
      </p>

      {/* Divider */}
      <div
        style={{
          width: "100%",
          height: 1,
          background: "var(--md-outline-variant)",
          marginBottom: 24,
        }}
      />

      <p style={{ margin: 0, fontSize: 13, color: "var(--md-on-surface-variant)" }}>
        שאלות? כתבו לנו:{" "}
        <a
          href="mailto:hello@masterpet.co.il"
          style={{ color: "var(--md-primary)", fontWeight: 600, textDecoration: "none" }}
        >
          hello@masterpet.co.il
        </a>
      </p>
    </div>
  );
}
