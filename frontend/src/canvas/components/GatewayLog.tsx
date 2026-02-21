/** GatewayLog — recent gateway errors and warnings. Self-updating. */

import { useState, useEffect } from 'react';

interface LogEntry {
  level: 'ERROR' | 'WARN';
  message: string;
  time: string;
}

interface GatewayLogProps {
  limit?: number;
}

function shortTime(iso: string): string {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  } catch {
    return iso.slice(11, 19);
  }
}

function truncate(msg: string, max = 120): string {
  return msg.length > max ? msg.slice(0, max) + '…' : msg;
}

export function GatewayLog({ limit = 6 }: GatewayLogProps): React.JSX.Element {
  const [entries, setEntries] = useState<LogEntry[]>([]);

  useEffect(() => {
    const poll = async (): Promise<void> => {
      try {
        const res = await fetch(`/api/leo/logs?limit=${limit}`);
        if (res.ok) setEntries(await res.json() as LogEntry[]);
      } catch { /* silent */ }
    };
    void poll();
    const id = setInterval(() => void poll(), 30_000);
    return () => clearInterval(id);
  }, [limit]);

  return (
    <div className="canvas-gwlog">
      <div className="canvas-section-label">Gateway Log</div>
      {entries.length === 0 ? (
        <div className="canvas-gwlog-empty">No errors or warnings today ✓</div>
      ) : (
        entries.map((e, i) => (
          <div key={i} className="canvas-gwlog-entry">
            <span className="canvas-gwlog-time">{shortTime(e.time)}</span>
            <span className={`canvas-gwlog-badge ${e.level}`}>{e.level}</span>
            <span className="canvas-gwlog-msg">{truncate(e.message)}</span>
          </div>
        ))
      )}
    </div>
  );
}
