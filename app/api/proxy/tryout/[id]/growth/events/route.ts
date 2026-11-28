import { NextRequest, NextResponse } from 'next/server';
import { growthAccess, growthErrorResponse } from '@/lib/server/growth-access';
import { GrowthError, growthQuery } from '@/lib/server/growth-registration';
export const runtime = 'nodejs';
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { user, pool } = await growthAccess(request, id);
    if (Number(request.headers.get('content-length') ?? 0) > 2048) throw new GrowthError(413, 'GROWTH_REQUIREMENTS', 'Event terlalu besar.');
    const body: unknown = await request.json();
    await growthQuery(pool, 'SELECT growth_client_event($1,$2,$3::jsonb)', [id, user.id, JSON.stringify(body)]);
    return NextResponse.json({ ok: true });
  } catch (error) { return growthErrorResponse(error); }
}
