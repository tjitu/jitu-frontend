import type { NextRequest } from 'next/server';

export async function getAuthenticatedAppUser(request: NextRequest) {
  const authorization = request.headers.get('authorization');
  if (!authorization) return null;

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!backendUrl) throw new Error('NEXT_PUBLIC_BACKEND_URL must be configured.');
  const response = await fetch(`${backendUrl.replace(/\/$/, '')}/auth/me`, {
    headers: { Authorization: authorization },
    cache: 'no-store',
  });
  if (!response.ok) return null;
  const payload = await response.json();
  return payload.user as { id: string } | null;
}
