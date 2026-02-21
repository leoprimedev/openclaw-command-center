/** OllamaMonitor — loaded Ollama model and runtime stats. Self-updating. */

import { useState, useEffect } from 'react';

interface OllamaData {
  loaded: boolean;
  name?: string;
  sizeVram?: number;
  sizeTotal?: number;
  details?: { parameter_size?: string; quantization_level?: string };
  error?: string;
}

function fmtBytes(b: number): string {
  if (b === 0) return 'CPU only';
  const gb = b / (1024 ** 3);
  return gb > 0.1 ? `${gb.toFixed(1)} GB VRAM` : `${Math.round(b / (1024 ** 2))} MB VRAM`;
}

function fmtSize(b: number): string {
  const gb = b / (1024 ** 3);
  return `${gb.toFixed(1)} GB`;
}

export function OllamaMonitor(): React.JSX.Element {
  const [data, setData] = useState<OllamaData | null>(null);

  useEffect(() => {
    const poll = async (): Promise<void> => {
      try {
        const res = await fetch('/api/leo/ollama');
        if (res.ok) setData(await res.json() as OllamaData);
      } catch { /* silent */ }
    };
    void poll();
    const id = setInterval(() => void poll(), 20_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="canvas-ollama">
      <div className="canvas-ollama-header">
        <span className="canvas-ollama-title">Ollama</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-tertiary)' }}>
          {data === null ? 'polling…' : data.loaded ? '● LOADED' : '○ IDLE'}
        </span>
      </div>

      {data === null && (
        <div className="canvas-ollama-idle">Fetching…</div>
      )}

      {data !== null && !data.loaded && (
        <div className="canvas-ollama-idle">No model loaded</div>
      )}

      {data !== null && data.loaded && (
        <>
          <div className="canvas-ollama-model">{data.name}</div>
          <div className="canvas-ollama-meta">
            {data.details?.parameter_size && `${data.details.parameter_size}`}
            {data.details?.quantization_level && ` · ${data.details.quantization_level}`}
            {data.sizeTotal ? ` · ${fmtSize(data.sizeTotal)}` : ''}
            {data.sizeVram !== undefined ? ` · ${fmtBytes(data.sizeVram)}` : ''}
          </div>
        </>
      )}
    </div>
  );
}
