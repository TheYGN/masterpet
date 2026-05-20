import { redirect } from 'next/navigation';
import { requireActiveTenant } from '@/app/lib/dal';

export default async function DashboardPage() {
  const session = await requireActiveTenant();

  if (session.profile.role === 'super_admin') {
    redirect('/super-admin/tenants');
  }

  const firstName = session.profile.full_name.split(' ')[0];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'בוקר טוב' : hour < 17 ? 'צהריים טובים' : 'ערב טוב';

  return (
    <div style={{ padding: '24px 32px 48px', display: 'flex', flexDirection: 'column', gap: 32 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24 }}>
        <div>
          <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--md-on-surface)', lineHeight: 1.3 }}>
            {greeting}, {firstName}
          </div>
          <div style={{ fontSize: 14, color: 'var(--md-on-surface-variant)', marginTop: 4 }}>
            ברוכים הבאים ל-MasterPet. הנתונים יוצגו כאן ברגע שיהיו הזמנות ומוצרים.
          </div>
        </div>

        {/* Period selector */}
        <div style={{
          display: 'inline-flex',
          background: 'var(--md-surface-container)',
          borderRadius: 999, padding: 4,
          border: '1px solid var(--md-outline-variant)',
        }}>
          {['היום', 'השבוע', 'החודש'].map((label, i) => (
            <div
              key={label}
              style={{
                padding: '6px 16px', borderRadius: 999,
                background: i === 0 ? 'var(--md-primary)' : 'transparent',
                color: i === 0 ? 'var(--md-on-primary)' : 'var(--md-on-surface-variant)',
                fontSize: 13, fontWeight: 500, cursor: 'pointer',
              }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* KPI Strip */}
      <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.18fr 1fr', gap: 16 }}>
        <KpiTile icon="payments" label="הכנסות היום" value="—" sub="אין נתונים עדיין" />
        <KpiTile icon="receipt_long" label="הזמנות פתוחות" value="—" sub="אין הזמנות עדיין" />
        <KpiTile
          icon="pet_supplies"
          label="לקוחות עומדים לאזול"
          value="—"
          sub="יתמלא אחרי ייבוא לקוחות"
          hero
        />
        <KpiTile icon="inventory_2" label="מוצרים במלאי" value="—" sub="הוסף מוצרים להתחיל" />
      </section>

      {/* Placeholder cards */}
      <section style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 16 }}>
        <PlaceholderCard title="הזמנות אחרונות" icon="receipt_long" cta="הוסף הזמנה ראשונה" ctaHref="/orders" />
        <PlaceholderCard title="דורש תשומת לב" icon="notifications" cta="הכל תקין כרגע" ctaHref="#" />
      </section>
    </div>
  );
}

function KpiTile({
  icon, label, value, sub, hero,
}: {
  icon: string; label: string; value: string; sub: string; hero?: boolean;
}) {
  const heroStyle = hero ? {
    background: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 55%, #38656A 100%)',
    color: 'var(--md-on-primary)',
    border: 'none',
    boxShadow: '0 1px 3px rgba(27,94,32,0.20), 0 8px 24px -8px rgba(27,94,32,0.35)',
  } : {};

  return (
    <div style={{
      background: 'var(--md-surface-container-low)',
      borderRadius: 16, padding: 20,
      border: '1px solid var(--md-outline-variant)',
      display: 'flex', flexDirection: 'column',
      minHeight: 168, position: 'relative',
      ...heroStyle,
    }}>
      {hero && (
        <div aria-hidden style={{
          position: 'absolute', insetInlineStart: -40, top: -40,
          width: 200, height: 200, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.10), rgba(255,255,255,0) 70%)',
          pointerEvents: 'none', overflow: 'hidden',
        }} />
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <span style={{
          width: 32, height: 32, borderRadius: 10,
          background: hero ? 'rgba(255,255,255,0.18)' : 'var(--md-primary-container)',
          color: hero ? 'var(--md-on-primary)' : 'var(--md-on-primary-container)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span className="ms" style={{ fontSize: 18, fontVariationSettings: "'FILL' 1, 'wght' 500" }}>{icon}</span>
        </span>
        <span style={{
          fontSize: 13, fontWeight: 500,
          color: hero ? 'rgba(255,255,255,0.92)' : 'var(--md-on-surface-variant)',
        }}>{label}</span>
      </div>

      <div style={{
        fontSize: 36, fontWeight: 700, letterSpacing: -0.5, lineHeight: 1.1,
        color: hero ? 'var(--md-on-primary)' : 'var(--md-on-surface)',
        marginBottom: 8,
      }}>
        {value}
      </div>

      <div style={{
        fontSize: 13,
        color: hero ? 'rgba(255,255,255,0.75)' : 'var(--md-on-surface-variant)',
        marginTop: 'auto',
      }}>
        {sub}
      </div>
    </div>
  );
}

function PlaceholderCard({
  title, icon, cta, ctaHref,
}: {
  title: string; icon: string; cta: string; ctaHref: string;
}) {
  return (
    <div style={{
      background: 'var(--md-surface-container-low)',
      borderRadius: 16, padding: '20px 24px',
      border: '1px solid var(--md-outline-variant)',
      minHeight: 300,
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <span className="ms" style={{ fontSize: 22, color: 'var(--md-on-surface-variant)' }}>{icon}</span>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--md-on-surface)' }}>{title}</h2>
      </div>

      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 16,
        border: '1px dashed var(--md-outline-variant)',
        borderRadius: 12, padding: 32,
      }}>
        <span className="ms" style={{ fontSize: 48, color: 'var(--md-outline)', fontVariationSettings: "'FILL' 0, 'wght' 200" }}>{icon}</span>
        <a
          href={ctaHref}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '8px 20px', borderRadius: 999,
            background: 'var(--md-primary)', color: 'var(--md-on-primary)',
            textDecoration: 'none', fontSize: 13, fontWeight: 600,
          }}
        >
          {cta}
        </a>
      </div>
    </div>
  );
}
