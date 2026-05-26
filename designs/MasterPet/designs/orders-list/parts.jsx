// ============ Reusable MD3 atoms ============

const { useState } = React;

// ---------- Status Chip (MD3) ----------
function StatusChip({ kind, children }) {
  const styles = {
    'filled-primary': {
      background: 'var(--md-primary)',
      color: 'var(--md-on-primary)',
      border: '1px solid var(--md-primary)',
    },
    'tonal-secondary': {
      background: 'var(--md-secondary-container)',
      color: 'var(--md-on-secondary-container)',
      border: '1px solid var(--md-secondary-container)',
    },
    'tonal-tertiary': {
      background: 'var(--md-tertiary-container)',
      color: 'var(--md-on-tertiary-container)',
      border: '1px solid var(--md-tertiary-container)',
    },
    'outlined': {
      background: 'transparent',
      color: 'var(--md-on-surface-variant)',
      border: '1px solid var(--md-outline-variant)',
    },
    'outlined-error': {
      background: 'transparent',
      color: 'var(--md-error)',
      border: '1px solid rgba(179, 38, 30, 0.45)',
    },
  }[kind] || {};
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '4px 12px', borderRadius: 8,
      fontSize: 12, fontWeight: 500, lineHeight: 1.2,
      letterSpacing: 0.1, whiteSpace: 'nowrap',
      ...styles,
    }}>
      {children}
    </span>
  );
}

// ---------- Buttons ----------
function IconButton({ icon, label, onClick, size = 40, badge, filled }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      aria-label={label}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: 'relative',
        width: size, height: size, borderRadius: size / 2,
        border: 'none',
        background: hover ? 'var(--md-surface-container-high)' : (filled ? 'var(--md-surface-container)' : 'transparent'),
        color: 'var(--md-on-surface-variant)',
        cursor: 'pointer',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background 120ms ease',
        flexShrink: 0,
      }}>
      <span className="ms" style={{ fontSize: 22 }}>{icon}</span>
      {badge != null && (
        <span style={{
          position: 'absolute', top: 6, insetInlineEnd: 6,
          minWidth: 16, height: 16, padding: '0 4px',
          borderRadius: 8, background: 'var(--md-error)', color: '#fff',
          fontSize: 10, fontWeight: 700, lineHeight: '16px',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span className="num">{badge}</span>
        </span>
      )}
    </button>
  );
}

function FilledButton({ icon, children, onClick, variant = 'filled', size = 'md' }) {
  const variants = {
    filled: {
      background: 'var(--md-primary)', color: 'var(--md-on-primary)',
      border: '1px solid var(--md-primary)',
    },
    tonal: {
      background: 'var(--md-secondary-container)', color: 'var(--md-on-secondary-container)',
      border: '1px solid var(--md-secondary-container)',
    },
    outlined: {
      background: 'transparent', color: 'var(--md-primary)',
      border: '1px solid var(--md-outline)',
    },
    text: {
      background: 'transparent', color: 'var(--md-primary)',
      border: '1px solid transparent',
    },
    error: {
      background: 'var(--md-error-container)', color: 'var(--md-on-error-container)',
      border: '1px solid var(--md-error-container)',
    },
  };
  const sizes = {
    sm: { padding: '6px 12px', fontSize: 13, height: 32 },
    md: { padding: '10px 20px', fontSize: 14, height: 40 },
  };
  return (
    <button
      onClick={onClick}
      className="state-layer"
      style={{
        ...variants[variant], ...sizes[size],
        borderRadius: 999,
        fontFamily: 'inherit', fontWeight: 500, letterSpacing: 0.1,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        cursor: 'pointer', whiteSpace: 'nowrap',
        transition: 'background 120ms ease',
      }}>
      {icon && <span className="ms" style={{ fontSize: 18 }}>{icon}</span>}
      <span>{children}</span>
    </button>
  );
}

// ---------- Card ----------
function Card({ children, padding = 24, elevation = 1, style }) {
  const bg = elevation === 0 ? 'var(--md-surface-container-lowest)'
           : elevation === 1 ? 'var(--md-surface-container-low)'
           : elevation === 2 ? 'var(--md-surface-container)'
           : 'var(--md-surface-container-high)';
  return (
    <div style={{
      background: bg, borderRadius: 16, padding,
      border: '1px solid var(--md-outline-variant)',
      ...style,
    }}>
      {children}
    </div>
  );
}

// ---------- Sparkline (SVG) ----------
function Sparkline({ data, width = 96, height = 32, color = 'var(--md-primary)' }) {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = Math.max(1, max - min);
  const stepX = width / (data.length - 1);
  const points = data.map((v, i) => {
    const x = i * stepX;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return [x, y];
  });
  const path = points.map((p, i) => (i === 0 ? `M ${p[0]} ${p[1]}` : `L ${p[0]} ${p[1]}`)).join(' ');
  const areaPath = `${path} L ${width} ${height} L 0 ${height} Z`;
  const last = points[points.length - 1];
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: 'block', overflow: 'visible' }}>
      <defs>
        <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#sparkFill)" />
      <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={last[0]} cy={last[1]} r="3" fill={color} />
      <circle cx={last[0]} cy={last[1]} r="6" fill={color} fillOpacity="0.18" />
    </svg>
  );
}

// ---------- Channel pill (small icon-only badge) ----------
function ChannelDot({ channel }) {
  const ch = window.channelMap[channel];
  return (
    <span title={ch.label} style={{
      width: 28, height: 28, borderRadius: 8,
      background: ch.color + '1F',
      color: ch.color,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      <span className="ms" style={{ fontSize: 16, fontVariationSettings: "'FILL' 1, 'wght' 500" }}>{ch.icon}</span>
    </span>
  );
}

// ---------- Nav rail item ----------
function NavItem({ item, active, hover: forceHover, onSelect }) {
  const [hover, setHover] = useState(false);
  const isHover = forceHover || hover;
  const showPill = active;
  return (
    <button
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => onSelect && onSelect(item.id)}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
        padding: '8px 0 6px', width: '100%', border: 'none', background: 'transparent',
        cursor: 'pointer', color: 'var(--md-on-surface-variant)',
        position: 'relative',
        fontFamily: 'inherit',
      }}>
      <div style={{
        width: 56, height: 32, borderRadius: 16,
        background: active ? 'var(--md-secondary-container)'
                  : isHover ? 'var(--md-surface-container-high)'
                  : 'transparent',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background 160ms ease, width 160ms ease',
        position: 'relative',
      }}>
        <span className="ms" style={{
          fontSize: 24,
          color: active ? 'var(--md-on-secondary-container)' : 'var(--md-on-surface-variant)',
          fontVariationSettings: active ? "'FILL' 1, 'wght' 500" : "'FILL' 0, 'wght' 400",
        }}>{item.icon}</span>
        {item.badge != null && (
          <span style={{
            position: 'absolute', top: -2, insetInlineEnd: 8,
            minWidth: 16, height: 16, padding: '0 4px',
            borderRadius: 8, background: 'var(--md-error)', color: '#fff',
            fontSize: 10, fontWeight: 700, lineHeight: '16px',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span className="num">{item.badge}</span>
          </span>
        )}
      </div>
      <span style={{
        fontSize: 12, fontWeight: active ? 600 : 500,
        color: active ? 'var(--md-on-surface)' : 'var(--md-on-surface-variant)',
        letterSpacing: 0.1,
        lineHeight: 1.2,
      }}>{item.label}</span>
    </button>
  );
}

Object.assign(window, {
  StatusChip, IconButton, FilledButton, Card, Sparkline, ChannelDot, NavItem,
});
