/** TaskCard — task with status badge, description, and optional step list. Agent-pushed. */

interface Step {
  text: string;
  done?: boolean;
}

interface TaskCardProps {
  title: string;
  status: 'pending' | 'running' | 'done' | 'blocked' | 'failed';
  description?: string;
  steps?: Step[];
  priority?: 'low' | 'normal' | 'high' | 'critical';
}

const STATUS_COLOR: Record<TaskCardProps['status'], string> = {
  pending:  'var(--text-tertiary)',
  running:  'var(--apex-gold)',
  done:     'var(--apex-green)',
  blocked:  'var(--apex-amber)',
  failed:   'var(--apex-magenta)',
};

const PRIORITY_COLOR: Record<NonNullable<TaskCardProps['priority']>, string> = {
  low:      'var(--text-tertiary)',
  normal:   'var(--text-secondary)',
  high:     'var(--apex-amber)',
  critical: 'var(--apex-magenta)',
};

export function TaskCard({ title, status, description, steps, priority = 'normal' }: TaskCardProps): React.JSX.Element {
  return (
    <div className="canvas-task">
      <div className="canvas-task-header">
        <span className="canvas-task-title">{title}</span>
        <span className="canvas-task-badge" style={{ color: STATUS_COLOR[status], borderColor: STATUS_COLOR[status] }}>
          {status}
        </span>
      </div>

      {priority !== 'normal' && (
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: PRIORITY_COLOR[priority], marginBottom: '6px' }}>
          ↑ {priority.toUpperCase()}
        </div>
      )}

      {description && (
        <div className="canvas-task-desc">{description}</div>
      )}

      {steps && steps.length > 0 && (
        <div className="canvas-task-steps">
          {steps.map((step, i) => (
            <div key={i} className="canvas-task-step" style={{ opacity: step.done ? 0.5 : 1 }}>
              <span style={{ color: step.done ? 'var(--apex-green)' : 'var(--text-tertiary)', marginRight: '6px' }}>
                {step.done ? '✓' : '○'}
              </span>
              <span style={{ textDecoration: step.done ? 'line-through' : 'none' }}>{step.text}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
