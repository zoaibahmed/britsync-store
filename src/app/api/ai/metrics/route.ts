import { NextResponse } from 'next/server';
import { getSupportMetrics } from '@/services/tickets';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const metrics = await getSupportMetrics();
    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Failed to retrieve metrics:', error);
    return NextResponse.json({ error: 'Failed to fetch metrics' }, { status: 500 });
  }
}
