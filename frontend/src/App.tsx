import { useCanvasSocket } from './canvas/useCanvasSocket.js';
import { CanvasRenderer } from './canvas/CanvasRenderer.js';

export function App(): React.JSX.Element {
  const { connected } = useCanvasSocket();

  return (
    <div className="lcc-root">
      <header className="lcc-header">
        <div className="lcc-header-left">
          <span className="lcc-lion">🦁</span>
          <div className="lcc-title-group">
            <span className="lcc-title">LEO COMMAND CENTER</span>
            <span className="lcc-subtitle">Leo Prime · OpenClaw Runtime</span>
          </div>
        </div>
        <div className="lcc-header-right">
          <span className="lcc-conn-label">{connected ? 'LIVE' : 'OFFLINE'}</span>
          <span className={`lcc-conn-dot ${connected ? 'connected' : 'disconnected'}`} />
        </div>
      </header>
      <main className="lcc-main">
        <CanvasRenderer />
      </main>
    </div>
  );
}
