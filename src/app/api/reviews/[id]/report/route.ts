import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

/**
 * POST /api/reviews/[id]/report
 * Report a review. One report per user per review.
 */
export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

    const { reason, details } = await request.json();
    if (!reason) return NextResponse.json({ error: 'Reason is required' }, { status: 400 });

    const review = await prisma.review.findUnique({ where: { id: params.id } });
    if (!review) return NextResponse.json({ error: 'Review not found' }, { status: 404 });

    const existing = await prisma.reviewReport.findUnique({
      where: { reviewId_userId: { reviewId: params.id, userId: session.userId } },
    });
    if (existing) return NextResponse.json({ error: 'You have already reported this review' }, { status: 409 });

    await prisma.reviewReport.create({
      data: {
        reviewId: params.id,
        userId: session.userId,
        reason: reason.slice(0, 255),
        details: details || null,
        status: 'PENDING',
      },
    });

    // Flag review for moderation if it has >= 3 reports
    const reportCount = await prisma.reviewReport.count({ where: { reviewId: params.id } });
    if (reportCount >= 3) {
      await prisma.review.update({
        where: { id: params.id },
        data: { moderationStatus: 'PENDING_APPROVAL' },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to report review:', error);
    return NextResponse.json({ error: 'Failed to report review' }, { status: 500 });
  }
}
