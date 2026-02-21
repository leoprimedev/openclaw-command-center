/** Leo Command Center — Canvas types */

export interface CanvasSurface {
  id: string;
  component: string;
  props: Record<string, unknown>;
  callbackUrl: string | null;
  updatedAt: string;
}

export type CanvasMessage =
  | { type: 'init'; surfaces: CanvasSurface[] }
  | { type: 'render'; surface: CanvasSurface }
  | { type: 'delete'; id: string };

export interface ComponentRegistration {
  name: string;
  description: string;
  component: React.ComponentType<any>;
}
