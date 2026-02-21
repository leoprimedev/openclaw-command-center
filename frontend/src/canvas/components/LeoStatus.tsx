/** LeoStatus — Leo agent health: model, session, gateway. Self-updating. */

import { useState, useEffect } from 'react';

interface LeoStatusData {
  gatewayRunning: boolean;
  currentModel: string | null;
  activeSession: string | null;
  sessionUpdatedAt: string | null;
  pid: number | null;
}

function shortSession(id: string | null): string {
  if (!id) return '—';
  if (id.startsWith('boot-')) return `boot (${id.slice(5, 21)}…)`;
  return id.slice(0, 8) + '…';
}

function relativeTime(iso: string | null): string {
  if (!iso) return '—';
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60_000) return `${Math.round(diff / 1000)}s ago`;
  if (diff < 3_600_000) return `${Math.round(diff / 60_000)}m ago`;
  return `${Math.round(diff / 3_600_000)}h ago`;
}

export function LeoStatus(): React.JSX.Element {
  const [data, setData] = useState<LeoStatusData | null>(null);

  useEffect(() => {
    const poll = async (): Promise<void> => {
      try {
        const res = await fetch('/api/leo/status');
        if (res.ok) setData(await res.json() as LeoStatusData);
      } catch { /* silent */ }
    };
    void poll();
    const id = setInterval(() => void poll(), 15_000);
    return () => clearInterval(id);
  }, []);

  const status = !data ? 'unknown' : data.gatewayRunning ? 'online' : 'offline';

  return (
    <div className="canvas-leo-status">
      <div className="canvas-leo-header">
        <span className="canvas-leo-name">🦁 LEO PRIME</span>
        <span className={`canvas-leo-badge ${status}`}>
          <span className="canvas-leo-badge-dot" />
          {status.toUpperCase()}
        </span>
      </div>
      <div className="canvas-leo-rows">
        <div className="canvas-leo-row">
          <span className="canvas-leo-row-label">Model</span>
          <span className="canvas-leo-row-value">{data?.currentModel ?? '—'}</span>
        </div>
        <div className="canvas-leo-row">
          <span className="canvas-leo-row-label">Session</span>
          <span className="canvas-leo-row-value">{shortSession(data?.activeSession ?? null)}</span>
        </div>
        <div className="canvas-leo-row">
          <span className="canvas-leo-row-label">Last active</span>
          <span className="canvas-leo-row-value">{relativeTime(data?.sessionUpdatedAt ?? null)}</span>
        </div>
      </div>
    </div>
  );
}
