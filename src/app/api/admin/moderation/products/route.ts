import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { logAdminAction } from '@/lib/services/admin.service';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/moderation/products
 * Returns pending and recently moderated products for admin curation checks.
 */
export async function GET() {
  try {
    const session = await getSession();
    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const products = await prisma.product.findMany({
      include: {
        translations: true,
        maker: { select: { id: true, businessName: true } },
        category: { include: { translations: true } },
        location: { include: { translations: true } },
        mediaMaps: { include: { media: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const mapped = products.map((p) => {
      const trans = p.translations.find((t) => t.languageCode === 'en') || p.translations[0];
      const cat = p.category.translations.find((t) => t.languageCode === 'en') || p.category.translations[0];
      const loc = p.location.translations.find((t) => t.languageCode === 'en') || p.location.translations[0];

      return {
        id: p.id,
        name: trans?.name || 'Product',
        description: trans?.description || '',
        story: trans?.story || '',
        price: p.desiredPrice,
        inventory: p.inventory,
        verificationStatus: p.verificationStatus,
        status: p.status,
        maker: p.maker?.businessName || 'Artisan',
        category: cat?.name || 'General',
        country: loc?.name || 'Global',
        image: p.mediaMaps[0]?.media?.storageKey || '',
        createdAt: p.createdAt,
      };
    });

    return NextResponse.json(mapped);
  } catch (error) {
    console.error('Failed to get moderated products:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * PUT /api/admin/moderation/products
 * Moderate a product (approve, reject, publish, archive).
 */
export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { productId, status } = await request.json();
    if (!productId || !status) {
      return NextResponse.json({ error: 'productId and status are required' }, { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const beforeState = { status: product.status };

    const updated = await prisma.product.update({
      where: { id: productId },
      data: { status },
    });

    await logAdminAction({
      adminUserId: session.userId,
      action: 'MODERATE_PRODUCT',
      tableName: 'Product',
      recordId: productId,
      beforeState,
      afterState: { status: updated.status },
    });

    // Notify maker of product approval/rejection
    const maker = await prisma.makerProfile.findUnique({
      where: { id: product.makerProfileId },
      include: { user: true },
    });

    if (maker) {
      const title = status === 'PUBLISHED' ? '🎉 Product Approved & Published' : '⚠️ Product Moderation Update';
      const msg = status === 'PUBLISHED'
        ? `Your product listing has been approved and is now live on the marketplace!`
        : `Your product status was updated to ${status}.`;

      await prisma.notification.create({
        data: {
          recipientUserId: maker.userId,
          title,
          message: msg,
        },
      });
    }

    return NextResponse.json({ success: true, product: updated });
  } catch (error) {
    console.error('Failed to moderate product:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
