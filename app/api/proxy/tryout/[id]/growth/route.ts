import { NextRequest, NextResponse } from 'next/server';
import { growthAccess, growthErrorResponse } from '@/lib/server/growth-access';
import { growthQuery } from '@/lib/server/growth-registration';
import type { GrowthState } from '@/lib/growth/types';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { user, pool, preview, solutionPrice } = await growthAccess(request, id);
    const rows = await growthQuery<{ state: GrowthState }>(pool, 'SELECT growth_user_state($1,$2) AS state', [id, user.id]);
    return NextResponse.json({ ...rows[0].state, solutionPrice, exempt: rows[0].state.exempt || preview }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) { return growthErrorResponse(error); }
}
