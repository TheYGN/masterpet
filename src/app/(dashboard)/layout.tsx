import { requireActiveTenant } from '@/app/lib/dal';
import { NavRail } from '@/components/dashboard/nav-rail';
import { TopBar } from '@/components/dashboard/top-bar';

function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0] ?? '?';
  return (parts[0][0] ?? '') + (parts[1][0] ?? '');
}

function getPlanLabel(trialStatus: string | null, trialEndsAt: string | null): string {
  if (trialStatus === 'active' && trialEndsAt) return 'TRIAL';
  return 'PRO';
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireActiveTenant();
  const tenant = session.tenant!;

  const userInitials = getInitials(session.profile.full_name);
  const planLabel = getPlanLabel(tenant.trial_status, tenant.trial_ends_at);

  return (
    <div
      dir="rtl"
      style={{
        display: 'flex',
        flexDirection: 'row-reverse',
        minHeight: '100vh',
        background: 'var(--md-surface)',
      }}
    >
      <NavRail userInitials={userInitials} planLabel={planLabel} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <TopBar session={session} />
        <main style={{ flex: 1 }}>
          {children}
        </main>
      </div>
    </div>
  );
}
