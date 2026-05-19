// ============ 30-day Revenue Area Chart (RTL, SVG) ============

const { useState: useStateChart, useMemo } = React;

function RevenueChart({ data }) {
  const [hoverIdx, setHoverIdx] = useStateChart(null);

  const W = 1280, H = 320;
  const M = { top: 24, right: 56, bottom: 36, left: 56 }; // right reserved for y-axis (RTL)
  const innerW = W - M.left - M.right;
  const innerH = H - M.top - M.bottom;

  // In RTL: oldest day on the RIGHT, newest on the LEFT.
  // We map index 0 (oldest) → x = innerW (right edge in chart coords),
  //              index n-1 (newest) → x = 0 (left edge).
  const n = data.length;
  const xOf = (i) => innerW - (i / (n - 1)) * innerW;

  const maxY = Math.ceil(Math.max(...data.map(d => d.total)) / 2000) * 2000;
  const yOf = (v) => innerH - (v / maxY) * innerH;

  // Build paths
  const buildLine = (key) => data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${xOf(i)} ${yOf(d[key])}`).join(' ');
  const buildArea = (key) => `${buildLine(key)} L ${xOf(n - 1)} ${innerH} L ${xOf(0)} ${innerH} Z`;

  const yTicks = 4;
  const yTickVals = Array.from({ length: yTicks + 1 }, (_, i) => (maxY / yTicks) * i);

  // X-axis labels: every ~5th day
  const xLabelIdx = data.map((_, i) => i).filter(i => i % 5 === 0 || i === n - 1);

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block', overflow: 'visible' }}>
        <defs>
          <linearGradient id="areaManual" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--md-primary)" stopOpacity="0.28" />
            <stop offset="100%" stopColor="var(--md-primary)" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="areaDigital" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--md-tertiary)" stopOpacity="0.24" />
            <stop offset="100%" stopColor="var(--md-tertiary)" stopOpacity="0" />
          </linearGradient>
        </defs>

        <g transform={`translate(${M.left}, ${M.top})`}>
          {/* Y gridlines + labels (labels on the RIGHT in RTL) */}
          {yTickVals.map((v, i) => (
            <g key={i}>
              <line x1={0} x2={innerW} y1={yOf(v)} y2={yOf(v)}
                stroke="var(--md-outline-variant)" strokeDasharray={i === 0 ? '0' : '2 4'} />
              <text x={innerW + 10} y={yOf(v) + 4}
                fill="var(--md-on-surface-variant)" fontSize="11"
                style={{ direction: 'ltr', fontFamily: 'inherit', fontVariantNumeric: 'tabular-nums' }}>
                ₪{v.toLocaleString('en-US')}
              </text>
            </g>
          ))}

          {/* Areas */}
          <path d={buildArea('digital')} fill="url(#areaDigital)" />
          <path d={buildArea('manual')} fill="url(#areaManual)" />

          {/* Lines */}
          <path d={buildLine('digital')} fill="none" stroke="var(--md-tertiary)" strokeWidth="2"
            strokeLinejoin="round" strokeLinecap="round" />
          <path d={buildLine('manual')} fill="none" stroke="var(--md-primary)" strokeWidth="2.5"
            strokeLinejoin="round" strokeLinecap="round" />

          {/* Hover crosshair */}
          {hoverIdx != null && (
            <g>
              <line x1={xOf(hoverIdx)} x2={xOf(hoverIdx)} y1={0} y2={innerH}
                stroke="var(--md-on-surface)" strokeOpacity="0.18" strokeDasharray="3 3" />
              <circle cx={xOf(hoverIdx)} cy={yOf(data[hoverIdx].manual)} r="5"
                fill="var(--md-surface-container-lowest)" stroke="var(--md-primary)" strokeWidth="2.5" />
              <circle cx={xOf(hoverIdx)} cy={yOf(data[hoverIdx].digital)} r="5"
                fill="var(--md-surface-container-lowest)" stroke="var(--md-tertiary)" strokeWidth="2" />
            </g>
          )}

          {/* X-axis labels (Hebrew short date) */}
          {xLabelIdx.map(i => (
            <text key={i} x={xOf(i)} y={innerH + 22}
              textAnchor="middle"
              fill="var(--md-on-surface-variant)" fontSize="11"
              style={{ fontFamily: 'inherit' }}>
              {data[i].label}
            </text>
          ))}

          {/* Invisible hover targets */}
          {data.map((d, i) => (
            <rect key={i}
              x={xOf(i) - (innerW / (n - 1)) / 2}
              y={0}
              width={innerW / (n - 1)}
              height={innerH}
              fill="transparent"
              onMouseEnter={() => setHoverIdx(i)}
              onMouseLeave={() => setHoverIdx(null)}
              style={{ cursor: 'crosshair' }}
            />
          ))}
        </g>
      </svg>

      {/* Tooltip */}
      {hoverIdx != null && (() => {
        const d = data[hoverIdx];
        const cx = M.left + xOf(hoverIdx);
        const cy = M.top + yOf(d.manual);
        // Position tooltip — try to place on right of point (which in RTL is "earlier"),
        // but flip if too close to right edge.
        const pctW = (cx / W) * 100;
        const flip = cx < W * 0.18; // very left → put tooltip on right
        return (
          <div style={{
            position: 'absolute',
            left: `calc(${pctW}% + ${flip ? 16 : -176}px)`,
            top: `${(cy / H) * 100}%`,
            transform: 'translateY(-50%)',
            width: 160,
            background: 'var(--md-inverse-surface)',
            color: 'var(--md-inverse-on-surface)',
            borderRadius: 12, padding: '12px 14px',
            boxShadow: 'var(--shadow-3)',
            pointerEvents: 'none',
            fontSize: 12, lineHeight: 1.5,
            direction: 'rtl',
          }}>
            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 6 }}>{d.label}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: 4, background: 'var(--md-primary-container)' }} />
                ידני
              </span>
              <span className="currency" style={{ fontWeight: 600 }}>₪{d.manual.toLocaleString('en-US')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginTop: 4 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: 4, background: 'var(--md-tertiary-container)' }} />
                דיגיטלי
              </span>
              <span className="currency" style={{ fontWeight: 600 }}>₪{d.digital.toLocaleString('en-US')}</span>
            </div>
            <div style={{
              borderTop: '1px solid rgba(255,255,255,0.18)', marginTop: 8, paddingTop: 6,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 600,
            }}>
              <span>סה״כ</span>
              <span className="currency">₪{d.total.toLocaleString('en-US')}</span>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

window.RevenueChart = RevenueChart;
