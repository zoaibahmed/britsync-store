import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

/**
 * GET /api/reviews/summary?productId=...
 * Returns rating breakdown for a product.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get('productId');

  if (!productId) {
    return NextResponse.json({ error: 'productId is required' }, { status: 400 });
  }

  try {
    const reviews = await prisma.review.findMany({
      where: { productId, moderationStatus: 'APPROVED' },
      select: { rating: true },
    });

    const count = reviews.length;
    const average = count > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / count : 0;

    const breakdown: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach((r) => {
      breakdown[r.rating] = (breakdown[r.rating] || 0) + 1;
    });

    return NextResponse.json({
      productId,
      count,
      average: parseFloat(average.toFixed(2)),
      breakdown,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch summary' }, { status: 500 });
  }
}
