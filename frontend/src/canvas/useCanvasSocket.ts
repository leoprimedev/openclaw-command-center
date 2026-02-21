/** Canvas hook — WebSocket real-time with REST polling fallback. */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { CanvasSurface, CanvasMessage } from './types.js';

const WS_PROTO = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
const WS_URL = `${WS_PROTO}//${window.location.host}/ws/canvas`;
const REST_URL = '/api/canvas';
const RECONNECT_MS = 5000;
const POLL_MS = 10000;
const WS_FAIL_THRESHOLD = 3;

export function useCanvasSocket(): {
  surfaces: Map<string, CanvasSurface>;
  connected: boolean;
} {
  const [surfaces, setSurfaces] = useState<Map<string, CanvasSurface>>(() => new Map());
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const pollTimer = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const wsFailCount = useRef(0);
  const usePolling = useRef(false);

  const applySurfaces = useCallback((list: CanvasSurface[]) => {
    setSurfaces(() => {
      const next = new Map<string, CanvasSurface>();
      for (const s of list) next.set(s.id, s);
      return next;
    });
  }, []);

  const fetchSurfaces = useCallback(async () => {
    try {
      const res = await fetch(REST_URL);
      if (res.ok) {
        const list = (await res.json()) as CanvasSurface[];
        applySurfaces(list);
        setConnected(true);
      }
    } catch { /* silent */ }
  }, [applySurfaces]);

  const startPolling = useCallback(() => {
    if (pollTimer.current) return;
    usePolling.current = true;
    void fetchSurfaces();
    pollTimer.current = setInterval(() => void fetchSurfaces(), POLL_MS);
  }, [fetchSurfaces]);

  const stopPolling = useCallback(() => {
    if (pollTimer.current) {
      clearInterval(pollTimer.current);
      pollTimer.current = undefined;
    }
    usePolling.current = false;
  }, []);

  const connect = useCallback(() => {
    if (usePolling.current) return;
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      wsFailCount.current = 0;
    };

    ws.onmessage = (event: MessageEvent) => {
      try {
        const msg = JSON.parse(event.data as string) as CanvasMessage;
        setSurfaces((prev) => {
          const next = new Map(prev);
          if (msg.type === 'init') {
            next.clear();
            for (const s of msg.surfaces) next.set(s.id, s);
          } else if (msg.type === 'render') {
            next.set(msg.surface.id, msg.surface);
          } else if (msg.type === 'delete') {
            next.delete(msg.id);
          }
          return next;
        });
      } catch { /* ignore */ }
    };

    ws.onclose = () => {
      setConnected(false);
      wsRef.current = null;
      wsFailCount.current++;
      if (wsFailCount.current >= WS_FAIL_THRESHOLD) {
        startPolling();
      } else {
        reconnectTimer.current = setTimeout(connect, RECONNECT_MS);
      }
    };

    ws.onerror = () => ws.close();
  }, [startPolling]);

  useEffect(() => {
    void fetchSurfaces();
    connect();
    return () => {
      clearTimeout(reconnectTimer.current);
      stopPolling();
      wsRef.current?.close();
    };
  }, [connect, fetchSurfaces, stopPolling]);

  return { surfaces, connected };
}
