import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

/**
 * POST /api/reviews/[id]/reply
 * Allows the maker who owns the product to add a SellerResponse to a review.
 * Only one reply is allowed per review.
 */
export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'MAKER') {
      return NextResponse.json({ error: 'Only makers can reply to reviews' }, { status: 403 });
    }

    const { responseText } = await request.json();
    if (!responseText?.trim()) {
      return NextResponse.json({ error: 'Reply text is required' }, { status: 400 });
    }

    // Verify the review exists and belongs to a product owned by this maker
    const review = await prisma.review.findUnique({
      where: { id: params.id },
      include: { product: true },
    });
    if (!review) return NextResponse.json({ error: 'Review not found' }, { status: 404 });

    const maker = await prisma.makerProfile.findUnique({ where: { userId: session.userId } });
    if (!maker) return NextResponse.json({ error: 'Maker profile not found' }, { status: 404 });

    if (review.product.makerProfileId !== maker.id) {
      return NextResponse.json({ error: 'You can only reply to reviews on your own products' }, { status: 403 });
    }

    // Check if already replied
    const existing = await prisma.sellerResponse.findUnique({ where: { reviewId: params.id } });
    if (existing) {
      // Update existing reply
      const updated = await prisma.sellerResponse.update({
        where: { reviewId: params.id },
        data: { responseText: responseText.trim() },
      });
      return NextResponse.json({ success: true, reply: updated });
    }

    const reply = await prisma.sellerResponse.create({
      data: {
        reviewId: params.id,
        makerProfileId: maker.id,
        responseText: responseText.trim(),
      },
    });

    return NextResponse.json({ success: true, reply });
  } catch (error) {
    console.error('Failed to post seller response:', error);
    return NextResponse.json({ error: 'Failed to post reply' }, { status: 500 });
  }
}

/**
 * GET /api/reviews/[id]/reply
 * Returns the seller response for a review.
 */
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const reply = await prisma.sellerResponse.findUnique({
      where: { reviewId: params.id },
      include: { maker: { select: { businessName: true } } },
    });
    return NextResponse.json(reply || null);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch reply' }, { status: 500 });
  }
}
