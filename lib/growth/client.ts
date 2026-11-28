import { BACKEND_URL } from '@/lib/api';
import type { GrowthState } from './types';
export const growthPath = (id: string) => `${BACKEND_URL}/tryout/${encodeURIComponent(id)}/growth`;
export async function fetchGrowthState(id: string, signal?: AbortSignal): Promise<GrowthState> {
  const response = await fetch(growthPath(id), { credentials: 'include', cache: 'no-store', signal });
  const payload = await response.json();
  if (!response.ok) throw new Error(typeof payload.message === 'string' ? payload.message : 'Pendaftaran belum dapat dimuat.');
  return payload as GrowthState;
}
export function trackGrowth(id: string, sessionId: string, event: string, link?: string) {
  void fetch(`${growthPath(id)}/events`, { method: 'POST', credentials: 'include', keepalive: true,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ event, sessionId, eventId: crypto.randomUUID(), ...(link ? { link } : {}) }),
  }).catch(() => {});
}
export function notifyGrowthChanged() { window.dispatchEvent(new Event('jitu:registration-changed')); }
