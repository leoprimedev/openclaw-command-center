/** SystemHealth — live CPU, RAM, and disk usage bars. Self-updating. */

import { useState, useEffect } from 'react';

interface HealthData {
  cpu: number;
  ram: { used: number; total: number; pct: number };
  disk: { used: number; total: number; pct: number };
}

function barColor(pct: number): string {
  if (pct > 85) return 'var(--apex-magenta)';
  if (pct > 60) return 'var(--apex-amber)';
  return 'var(--apex-green)';
}

function fmtGB(gb: number): string {
  return `${gb.toFixed(1)} GB`;
}

export function SystemHealth(): React.JSX.Element {
  const [data, setData] = useState<HealthData | null>(null);

  useEffect(() => {
    const poll = async (): Promise<void> => {
      try {
        const res = await fetch('/api/stats');
        if (res.ok) setData(await res.json() as HealthData);
      } catch { /* silent */ }
    };
    void poll();
    const id = setInterval(() => void poll(), 10_000);
    return () => clearInterval(id);
  }, []);

  if (!data) {
    return (
      <div className="canvas-health">
        <div className="canvas-section-label">System Health</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-tertiary)' }}>Loading…</div>
      </div>
    );
  }

  const rows: { label: string; pct: number; detail: string }[] = [
    { label: 'CPU', pct: data.cpu, detail: `${data.cpu.toFixed(1)}%` },
    { label: 'RAM', pct: data.ram.pct, detail: `${fmtGB(data.ram.used)} / ${fmtGB(data.ram.total)}` },
    { label: 'Disk', pct: data.disk.pct, detail: `${fmtGB(data.disk.used)} / ${fmtGB(data.disk.total)}` },
  ];

  return (
    <div className="canvas-health">
      <div className="canvas-section-label">System Health</div>
      {rows.map((row) => (
        <div key={row.label} className="canvas-health-row">
          <div className="canvas-health-header">
            <span className="canvas-health-label">{row.label}</span>
            <span className="canvas-health-value" style={{ color: barColor(row.pct) }}>{row.detail}</span>
          </div>
          <div className="canvas-cost-bar">
            <div
              className="canvas-cost-bar-fill"
              style={{ width: `${Math.min(100, row.pct)}%`, background: barColor(row.pct) }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
