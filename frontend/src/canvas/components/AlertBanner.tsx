/** AlertBanner — highlighted alert/blocker. Agent-pushed. */

interface AlertBannerProps {
  message: string;
  severity: 'info' | 'warning' | 'error';
  details?: string;
}

const SEVERITY: Record<AlertBannerProps['severity'], { color: string; icon: string }> = {
  info:    { color: 'var(--apex-gold)',    icon: 'ℹ' },
  warning: { color: 'var(--apex-amber)',   icon: '⚠' },
  error:   { color: 'var(--apex-magenta)', icon: '✗' },
};

export function AlertBanner({ message, severity, details }: AlertBannerProps): React.JSX.Element {
  const s = SEVERITY[severity];
  return (
    <div className={`canvas-alert ${severity}`}>
      <div className="canvas-alert-header">
        <span style={{ color: s.color, fontSize: '14px', marginRight: '6px' }}>{s.icon}</span>
        <span className="canvas-alert-message">{message}</span>
      </div>
      {details && <div className="canvas-alert-details">{details}</div>}
    </div>
  );
}
