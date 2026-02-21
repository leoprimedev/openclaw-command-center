/** ProgressBar — horizontal progress bar. Agent-pushed. */

interface ProgressBarProps {
  label: string;
  value: number;
  max?: number;
  color?: string;
  showPercent?: boolean;
}

export function ProgressBar({ label, value, max = 100, color = 'var(--apex-gold)', showPercent = true }: ProgressBarProps): React.JSX.Element {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className="canvas-progress">
      <div className="canvas-progress-header">
        <span className="canvas-progress-label">{label}</span>
        {showPercent && (
          <span className="canvas-progress-value" style={{ color }}>{pct.toFixed(0)}%</span>
        )}
      </div>
      <div className="canvas-cost-bar">
        <div className="canvas-cost-bar-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}
