/** QuickAction — touch button that fires a callback. Agent-pushed. */

import { sendCallback } from '../callback.js';

interface QuickActionProps {
  surfaceId: string;
  label: string;
  icon?: string;
  color?: string;
  action?: string;
}

export function QuickAction({ surfaceId, label, icon, color = 'var(--apex-gold)', action }: QuickActionProps): React.JSX.Element {
  const handleClick = (): void => {
    if (action) void sendCallback(surfaceId, action, { label });
  };

  return (
    <button
      className="canvas-quick-action"
      style={{ borderColor: color, color }}
      onClick={handleClick}
    >
      {icon && <span className="canvas-quick-action-icon">{icon}</span>}
      <span>{label}</span>
    </button>
  );
}
