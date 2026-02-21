/** CanvasRenderer — renders all active canvas surfaces with animations. */

import { useState, useEffect, useRef } from 'react';
import { useCanvasSocket } from './useCanvasSocket.js';
import { getComponent } from './registry.js';
import type { CanvasSurface } from './types.js';

const EXIT_DURATION_MS = 350;

interface DisplaySurface extends CanvasSurface {
  exiting?: boolean;
}

export function CanvasRenderer(): React.JSX.Element {
  const { surfaces } = useCanvasSocket();
  const [displayed, setDisplayed] = useState<DisplaySurface[]>([]);
  const prevIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    const currentIds = new Set(surfaces.keys());
    const removedIds = new Set<string>();

    for (const id of prevIds.current) {
      if (!currentIds.has(id)) removedIds.add(id);
    }
    prevIds.current = currentIds;

    if (removedIds.size === 0) {
      setDisplayed(Array.from(surfaces.values()));
      return;
    }

    setDisplayed((prev) => {
      const current = Array.from(surfaces.values()) as DisplaySurface[];
      const exiting = prev
        .filter((s) => removedIds.has(s.id))
        .map((s) => ({ ...s, exiting: true }));
      return [...current, ...exiting];
    });

    const timer = setTimeout(() => {
      setDisplayed(Array.from(surfaces.values()));
    }, EXIT_DURATION_MS);

    return () => clearTimeout(timer);
  }, [surfaces]);

  if (displayed.length === 0) {
    return (
      <div className="canvas-renderer">
        <div className="canvas-empty">
          <div className="canvas-empty-icon">🦁</div>
          <div className="canvas-empty-text">Leo Command Center</div>
          <div className="canvas-empty-hint">Waiting for Leo to push surfaces…</div>
        </div>
      </div>
    );
  }

  return (
    <div className="canvas-renderer">
      <div className="canvas-grid">
        {displayed.map((surface) => {
          const reg = getComponent(surface.component);

          if (!reg) {
            return (
              <div
                key={surface.id}
                className={`canvas-surface${surface.exiting ? ' canvas-surface-exit' : ''}`}
              >
                <div className="canvas-surface-error">
                  Unknown component: <code>{surface.component}</code>
                </div>
              </div>
            );
          }

          const Component = reg.component;
          const props = { ...surface.props, surfaceId: surface.id };

          return (
            <div
              key={surface.id}
              className={`canvas-surface${surface.exiting ? ' canvas-surface-exit' : ''}`}
              data-surface-id={surface.id}
            >
              <Component {...props} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
