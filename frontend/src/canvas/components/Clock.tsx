/** Clock — self-updating clock and date. Props: timezone? */

import { useState, useEffect } from 'react';

interface ClockProps {
  timezone?: string;
}

export function Clock({ timezone }: ClockProps): React.JSX.Element {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1_000);
    return () => clearInterval(id);
  }, []);

  const opts: Intl.DateTimeFormatOptions = { timeZone: timezone };
  const time = now.toLocaleTimeString('en-US', { ...opts, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  const date = now.toLocaleDateString('en-US', { ...opts, weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  const tz = timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone;

  return (
    <div className="canvas-clock">
      <div className="canvas-clock-time">{time}</div>
      <div className="canvas-clock-date">{date}</div>
      <div className="canvas-clock-tz">{tz}</div>
    </div>
  );
}
