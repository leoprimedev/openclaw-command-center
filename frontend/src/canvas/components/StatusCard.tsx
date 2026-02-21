/** StatusCard — labeled value with icon and color. Agent-pushed. */

interface StatusCardProps {
  title: string;
  value: string;
  icon?: string;
  color?: string;
  subtitle?: string;
}

export function StatusCard({ title, value, icon, color = 'var(--apex-gold)', subtitle }: StatusCardProps): React.JSX.Element {
  return (
    <div className="canvas-status-card">
      <div className="canvas-status-card-header">
        {icon && <span className="canvas-status-card-icon">{icon}</span>}
        <span className="canvas-status-card-title">{title}</span>
      </div>
      <div className="canvas-status-card-value" style={{ color }}>{value}</div>
      {subtitle && <div className="canvas-status-card-subtitle">{subtitle}</div>}
    </div>
  );
}
