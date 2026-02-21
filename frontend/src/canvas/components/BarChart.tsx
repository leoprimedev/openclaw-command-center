/** BarChart — SVG bar chart. Agent-pushed. */

interface BarDatum {
  label: string;
  value: number;
  color?: string;
}

interface BarChartProps {
  title?: string;
  data: BarDatum[];
  height?: number;
}

export function BarChart({ title, data, height = 120 }: BarChartProps): React.JSX.Element {
  const max = Math.max(...data.map((d) => d.value), 1);
  const barWidth = 100 / data.length;

  return (
    <div className="canvas-bar-chart">
      {title && <div className="canvas-section-label">{title}</div>}
      <svg
        viewBox={`0 0 100 ${height}`}
        preserveAspectRatio="none"
        style={{ width: '100%', height: `${height}px`, display: 'block' }}
      >
        {data.map((d, i) => {
          const barH = (d.value / max) * (height - 20);
          const x = i * barWidth + barWidth * 0.1;
          const w = barWidth * 0.8;
          const y = height - 16 - barH;
          return (
            <g key={i}>
              <rect
                x={x}
                y={y}
                width={w}
                height={barH}
                fill={d.color ?? 'var(--apex-gold)'}
                rx={1}
                opacity={0.85}
              />
              <text
                x={x + w / 2}
                y={height - 3}
                textAnchor="middle"
                fontSize={5}
                fill="var(--text-tertiary)"
              >
                {d.label.length > 6 ? d.label.slice(0, 5) + '…' : d.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
