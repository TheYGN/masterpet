'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { id: 'dashboard', href: '/dashboard', icon: 'space_dashboard', label: 'דשבורד' },
  { id: 'products', href: '/products', icon: 'inventory_2', label: 'מוצרים' },
  { id: 'orders', href: '/orders', icon: 'receipt_long', label: 'הזמנות' },
  { id: 'customers', href: '/customers', icon: 'group', label: 'לקוחות' },
  { id: 'inbox', href: '/inbox', icon: 'inbox', label: 'Inbox' },
];

const bottomItems = [
  { id: 'settings', href: '/settings', icon: 'settings', label: 'הגדרות' },
];

export function NavRail({ userInitials, planLabel }: { userInitials: string; planLabel: string }) {
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <aside
      dir="rtl"
      style={{
        width: 88,
        flexShrink: 0,
        background: 'var(--md-surface-container-low)',
        borderInlineStart: '1px solid var(--md-outline-variant)',
        display: 'flex',
        flexDirection: 'column',
        position: 'sticky',
        top: 0,
        height: '100vh',
      }}
    >
      {/* Logo */}
      <div style={{ padding: '20px 0 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
        <div
          style={{
            width: 44, height: 44, borderRadius: 14,
            background: 'var(--md-primary)',
            color: 'var(--md-on-primary)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 1px 4px rgba(27,94,32,0.25)',
          }}
        >
          <span className="ms" style={{ fontSize: 24, fontVariationSettings: "'FILL' 1, 'wght' 600" }}>pets</span>
        </div>
      </div>

      {/* Main nav */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4, padding: '12px 8px', overflowY: 'auto' }}>
        {navItems.map(item => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.id}
              href={item.href}
              style={{ textDecoration: 'none' }}
              title={item.label}
            >
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                padding: '8px 4px',
                borderRadius: 12,
                background: active ? 'var(--md-secondary-container)' : 'transparent',
                color: active ? 'var(--md-on-secondary-container)' : 'var(--md-on-surface-variant)',
                cursor: 'pointer',
                transition: 'background 120ms ease',
              }}>
                <span
                  className="ms"
                  style={{
                    fontSize: 22,
                    fontVariationSettings: active ? "'FILL' 1, 'wght' 500" : "'FILL' 0, 'wght' 400",
                  }}
                >
                  {item.icon}
                </span>
                <span style={{ fontSize: 10, fontWeight: active ? 600 : 500, letterSpacing: 0.2 }}>
                  {item.label}
                </span>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom nav */}
      <div style={{ padding: '0 8px 4px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {bottomItems.map(item => {
          const active = isActive(item.href);
          return (
            <Link key={item.id} href={item.href} style={{ textDecoration: 'none' }} title={item.label}>
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                padding: '8px 4px', borderRadius: 12,
                background: active ? 'var(--md-secondary-container)' : 'transparent',
                color: active ? 'var(--md-on-secondary-container)' : 'var(--md-on-surface-variant)',
                cursor: 'pointer', transition: 'background 120ms ease',
              }}>
                <span className="ms" style={{ fontSize: 22, fontVariationSettings: active ? "'FILL' 1, 'wght' 500" : "'FILL' 0, 'wght' 400" }}>
                  {item.icon}
                </span>
                <span style={{ fontSize: 10, fontWeight: active ? 600 : 500 }}>{item.label}</span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* User avatar + plan */}
      <div style={{
        padding: '16px 8px 20px',
        borderTop: '1px solid var(--md-outline-variant)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
      }}>
        <div style={{
          width: 44, height: 44, borderRadius: '50%',
          background: 'linear-gradient(135deg, #38656A 0%, #1B5E20 100%)',
          color: '#fff',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 15, fontWeight: 700,
          boxShadow: 'inset 0 0 0 2px var(--md-surface-container-low)',
          position: 'relative',
        }}>
          <span>{userInitials}</span>
          <span style={{
            position: 'absolute', bottom: -2, insetInlineEnd: -2,
            width: 14, height: 14, borderRadius: '50%',
            background: '#22C55E', border: '2px solid var(--md-surface-container-low)',
          }} />
        </div>
        <div style={{
          fontSize: 10, fontWeight: 700, letterSpacing: 0.6,
          color: 'var(--md-on-primary-container)',
          background: 'var(--md-primary-container)',
          padding: '2px 8px', borderRadius: 999,
          textTransform: 'uppercase',
        }}>{planLabel}</div>
      </div>
    </aside>
  );
}
