/** CostMeter — daily and monthly API spend vs budget limits. Self-updating. */

import { useState, useEffect } from 'react';

interface CostData {
  daily: number;
  monthly: number;
  dailyLimit: number;
  monthlyLimit: number;
  updatedAt: string | null;
}

function barColor(pct: number): string {
  if (pct > 85) return 'var(--apex-magenta)';
  if (pct > 60) return 'var(--apex-amber)';
  return 'var(--apex-green)';
}

function fmtUSD(n: number): string {
  return `$${n.toFixed(2)}`;
}

function relativeTime(iso: string | null): string {
  if (!iso) return 'never updated';
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60_000) return 'just now';
  if (diff < 3_600_000) return `${Math.round(diff / 60_000)}m ago`;
  return `${Math.round(diff / 3_600_000)}h ago`;
}

export function CostMeter(): React.JSX.Element {
  const [data, setData] = useState<CostData | null>(null);

  useEffect(() => {
    const poll = async (): Promise<void> => {
      try {
        const res = await fetch('/api/leo/cost');
        if (res.ok) setData(await res.json() as CostData);
      } catch { /* silent */ }
    };
    void poll();
    const id = setInterval(() => void poll(), 60_000);
    return () => clearInterval(id);
  }, []);

  if (!data) {
    return (
      <div className="canvas-cost">
        <div className="canvas-section-label">API Budget</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-tertiary)' }}>Loading…</div>
      </div>
    );
  }

  const dailyPct = Math.min(100, (data.daily / data.dailyLimit) * 100);
  const monthlyPct = Math.min(100, (data.monthly / data.monthlyLimit) * 100);

  return (
    <div className="canvas-cost">
      <div className="canvas-section-label">API Budget</div>

      <div className="canvas-cost-row">
        <div className="canvas-cost-header">
          <span className="canvas-cost-label">Today</span>
          <span className="canvas-cost-value" style={{ color: barColor(dailyPct) }}>
            {fmtUSD(data.daily)}
            <span className="canvas-cost-limit"> / {fmtUSD(data.dailyLimit)}</span>
          </span>
        </div>
        <div className="canvas-cost-bar">
          <div
            className="canvas-cost-bar-fill"
            style={{ width: `${dailyPct}%`, background: barColor(dailyPct) }}
          />
        </div>
      </div>

      <div className="canvas-cost-row">
        <div className="canvas-cost-header">
          <span className="canvas-cost-label">This month</span>
          <span className="canvas-cost-value" style={{ color: barColor(monthlyPct) }}>
            {fmtUSD(data.monthly)}
            <span className="canvas-cost-limit"> / {fmtUSD(data.monthlyLimit)}</span>
          </span>
        </div>
        <div className="canvas-cost-bar">
          <div
            className="canvas-cost-bar-fill"
            style={{ width: `${monthlyPct}%`, background: barColor(monthlyPct) }}
          />
        </div>
      </div>

      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-tertiary)' }}>
        Updated {relativeTime(data.updatedAt)} · Leo updates this during heartbeat
      </div>
    </div>
  );
}
