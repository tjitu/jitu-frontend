import type { NextRequest } from 'next/server';
import { verifyFirebaseIdToken, resolveFirebaseUser } from './firebase-server';

export async function getAuthenticatedAppUser(request: NextRequest) {
  const authorization = request.headers.get('authorization');
  if (!authorization) return null;

  const token = authorization.replace(/^Bearer\s+/i, '').trim();
  if (!token) return null;

  try {
    const payload = await verifyFirebaseIdToken(token);
    if (!payload) return null;
    const user = await resolveFirebaseUser(payload);
    return user ? { id: user.id, email: user.email, role: user.role } : null;
  } catch (err) {
    console.error('getAuthenticatedAppUser error:', err);
    return null;
  }
}
