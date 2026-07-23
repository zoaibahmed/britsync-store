import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

/**
 * POST /api/reviews/[id]/helpful
 * Toggle a helpful vote on a review. Authenticated users only.
 */
export async function POST(_req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

    const review = await prisma.review.findUnique({ where: { id: params.id } });
    if (!review) return NextResponse.json({ error: 'Review not found' }, { status: 404 });

    // Cannot vote on own review
    if (review.buyerUserId === session.userId) {
      return NextResponse.json({ error: 'Cannot vote on your own review' }, { status: 400 });
    }

    const existing = await prisma.reviewHelpfulVote.findUnique({
      where: { reviewId_userId: { reviewId: params.id, userId: session.userId } },
    });

    if (existing) {
      // Toggle: remove existing vote
      await prisma.reviewHelpfulVote.delete({ where: { id: existing.id } });
      return NextResponse.json({ success: true, voted: false });
    } else {
      await prisma.reviewHelpfulVote.create({
        data: { reviewId: params.id, userId: session.userId, isHelpful: true },
      });
      return NextResponse.json({ success: true, voted: true });
    }
  } catch (error) {
    console.error('Failed to toggle helpful vote:', error);
    return NextResponse.json({ error: 'Failed to register vote' }, { status: 500 });
  }
}
