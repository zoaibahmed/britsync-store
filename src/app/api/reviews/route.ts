import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const status = searchParams.get('status') || 'APPROVED';

    const session = await getSession();
    
    let whereClause: any = { moderationStatus: status };
    if (productId) {
      whereClause.productId = productId;
    }

    // Admins can see all reviews regardless of moderation status
    if (session && ['ADMIN', 'SUPER_ADMIN'].includes(session.role) && !productId) {
      whereClause = {};
    }

    const reviews = await prisma.review.findMany({
      where: whereClause,
      include: {
        buyer: { select: { id: true, name: true } },
        product: {
          include: {
            translations: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const mapped = reviews.map((r: any) => {
      const trans = r.product.translations.find((t: any) => t.languageCode === 'en') || r.product.translations[0] || {};
      return {
        id: r.id,
        productId: r.productId,
        buyerId: r.buyerUserId,
        buyer: r.buyer,
        rating: r.rating,
        comment: r.comment,
        isVerifiedPurchase: r.isVerifiedPurchase,
        status: r.moderationStatus,
        createdAt: r.createdAt,
        product: {
          id: r.product.id,
          name: trans.name || 'Product'
        }
      };
    });

    return NextResponse.json(mapped);
  } catch (error) {
    console.error('Failed to fetch reviews:', error);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'BUYER') {
      return NextResponse.json({ error: 'Only buyers can review creations' }, { status: 403 });
    }

    const { productId, rating, comment } = await request.json();

    if (!productId || !rating) {
      return NextResponse.json({ error: 'Product ID and rating are required' }, { status: 400 });
    }

    // Verify buyer has purchased this product
    const purchases = await prisma.order.findFirst({
      where: {
        buyerId: session.userId,
        status: 'COMPLETED',
        orderItems: {
          some: { productId }
        }
      }
    });

    if (!purchases) {
      return NextResponse.json({ error: 'Only verified buyers who completed a purchase of this product can submit reviews.' }, { status: 403 });
    }

    const review = await prisma.review.create({
      data: {
        buyerUserId: session.userId,
        productId,
        rating: parseInt(rating),
        comment,
        isVerifiedPurchase: true,
        moderationStatus: 'PENDING_APPROVAL'
      }
    });

    return NextResponse.json({
      success: true,
      review: {
        ...review,
        buyerId: review.buyerUserId,
        status: review.moderationStatus
      }
    });
  } catch (error) {
    console.error('Failed to submit review:', error);
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.role)) {
      return NextResponse.json({ error: 'Admin authorization required' }, { status: 403 });
    }

    const { reviewId, status } = await request.json();

    if (!reviewId || !status) {
      return NextResponse.json({ error: 'Review ID and status are required' }, { status: 400 });
    }

    const review = await prisma.review.update({
      where: { id: reviewId },
      data: { moderationStatus: status }
    });

    return NextResponse.json({
      success: true,
      review: {
        ...review,
        buyerId: review.buyerUserId,
        status: review.moderationStatus
      }
    });
  } catch (error) {
    console.error('Failed to moderate review:', error);
    return NextResponse.json({ error: 'Failed to moderate review' }, { status: 500 });
  }
}
