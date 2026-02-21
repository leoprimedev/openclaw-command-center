/** ApprovalCard — approval request with Approve/Deny buttons. Agent-pushed. */

import { useState } from 'react';
import { sendCallback } from '../callback.js';

interface ApprovalCardProps {
  surfaceId: string;
  title: string;
  description?: string;
  command?: string;
  risk?: 'low' | 'medium' | 'high';
  onApprove?: string;
  onDeny?: string;
}

const RISK_COLOR: Record<NonNullable<ApprovalCardProps['risk']>, string> = {
  low:    'var(--apex-green)',
  medium: 'var(--apex-amber)',
  high:   'var(--apex-magenta)',
};

export function ApprovalCard({ surfaceId, title, description, command, risk = 'medium', onApprove, onDeny }: ApprovalCardProps): React.JSX.Element {
  const [decided, setDecided] = useState<'approved' | 'denied' | null>(null);

  const handle = (decision: 'approved' | 'denied'): void => {
    setDecided(decision);
    const cb = decision === 'approved' ? onApprove : onDeny;
    if (cb) void sendCallback(surfaceId, cb, { decision });
  };

  return (
    <div className="canvas-approval">
      <div className="canvas-approval-header">
        <span className="canvas-approval-title">{title}</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: RISK_COLOR[risk], textTransform: 'uppercase' }}>
          {risk} risk
        </span>
      </div>

      {description && <div className="canvas-approval-desc">{description}</div>}

      {command && (
        <div className="canvas-approval-cmd">
          <code>{command}</code>
        </div>
      )}

      {decided ? (
        <div style={{
          textAlign: 'center',
          fontFamily: 'var(--font-mono)',
          fontSize: '12px',
          color: decided === 'approved' ? 'var(--apex-green)' : 'var(--apex-magenta)',
          padding: '8px 0',
        }}>
          {decided === 'approved' ? '✓ Approved' : '✗ Denied'}
        </div>
      ) : (
        <div className="canvas-approval-actions">
          <button
            className="canvas-approval-btn canvas-approval-btn--deny"
            onClick={() => handle('denied')}
          >
            Deny
          </button>
          <button
            className="canvas-approval-btn canvas-approval-btn--approve"
            onClick={() => handle('approved')}
          >
            Approve
          </button>
        </div>
      )}
    </div>
  );
}
