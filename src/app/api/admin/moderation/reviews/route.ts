import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { logAdminAction } from '@/lib/services/admin.service';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/moderation/reviews
 * Returns reported reviews and general reviews for moderation.
 */
export async function GET() {
  try {
    const session = await getSession();
    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const reviews = await prisma.review.findMany({
      include: {
        product: { include: { translations: true } },
        buyer: { select: { name: true, email: true } },
        reports: {
          include: { user: { select: { name: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const mapped = reviews.map((r) => {
      const trans = r.product.translations.find((t) => t.languageCode === 'en') || r.product.translations[0];
      return {
        id: r.id,
        productId: r.productId,
        productName: trans?.name || 'Product',
        buyerName: r.buyer?.name || 'Customer',
        rating: r.rating,
        comment: r.comment,
        moderationStatus: r.moderationStatus,
        createdAt: r.createdAt,
        reports: r.reports.map((rep) => ({
          id: rep.id,
          reporterName: rep.user?.name || 'Reporter',
          reason: rep.reason,
          details: rep.details,
          status: rep.status,
          createdAt: rep.createdAt,
        })),
      };
    });

    return NextResponse.json(mapped);
  } catch (error) {
    console.error('Failed to get reviews:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * PUT /api/admin/moderation/reviews
 * Moderate review status (approve, reject, delete).
 */
export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { reviewId, moderationStatus } = await request.json();
    if (!reviewId || !moderationStatus) {
      return NextResponse.json({ error: 'reviewId and moderationStatus are required' }, { status: 400 });
    }

    const review = await prisma.review.findUnique({ where: { id: reviewId } });
    if (!review) return NextResponse.json({ error: 'Review not found' }, { status: 404 });

    const beforeState = { moderationStatus: review.moderationStatus };

    const updated = await prisma.$transaction(async (tx) => {
      const r = await tx.review.update({
        where: { id: reviewId },
        data: { moderationStatus },
      });

      // Update related reports status to REVIEWED or DISMISSED
      await tx.reviewReport.updateMany({
        where: { reviewId },
        data: { status: moderationStatus === 'APPROVED' ? 'DISMISSED' : 'REVIEWED' },
      });

      return r;
    });

    await logAdminAction({
      adminUserId: session.userId,
      action: 'MODERATE_REVIEW',
      tableName: 'Review',
      recordId: reviewId,
      beforeState,
      afterState: { moderationStatus: updated.moderationStatus },
    });

    return NextResponse.json({ success: true, review: updated });
  } catch (error) {
    console.error('Failed to moderate review:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
