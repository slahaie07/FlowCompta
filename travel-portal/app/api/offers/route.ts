import { NextResponse } from 'next/server';
import { getOffers } from '@/lib/offers-engine';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const payload = await getOffers();
    return NextResponse.json(payload, {
      headers: {
        'Cache-Control': 'no-store',
        'X-Offers-Source': payload.source,
        'X-Next-Refresh': payload.nextRefreshAt,
      },
    });
  } catch {
    return NextResponse.json({ error: 'Impossible de charger les offres' }, { status: 500 });
  }
}
