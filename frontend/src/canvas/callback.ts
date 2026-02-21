/** Send a user interaction callback to the server. */

export async function sendCallback(
  surfaceId: string,
  action: string,
  data: Record<string, unknown> = {},
): Promise<void> {
  try {
    await fetch('/api/canvas/callback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ surfaceId, action, data }),
    });
  } catch {
    /* fire-and-forget */
  }
}
