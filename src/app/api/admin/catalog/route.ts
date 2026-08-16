import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get('status') || 'ALL';

    const whereClause: any = { deletedAt: null };
    if (statusFilter !== 'ALL') {
      whereClause.status = statusFilter;
    }

    const products = await prisma.product.findMany({
      where: whereClause,
      include: {
        maker: {
          select: {
            id: true,
            businessName: true,
            craftCategory: true,
            verificationStatus: true,
            user: { select: { name: true, email: true } }
          }
        },
        category: {
          include: { translations: { where: { languageCode: 'en' } } }
        },
        translations: { where: { languageCode: 'en' } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const mapped = products.map((p: any) => ({
      id: p.id,
      name: p.translations?.[0]?.name || 'Untitled Piece',
      description: p.translations?.[0]?.description || '',
      story: p.translations?.[0]?.story || '',
      studioName: p.maker?.businessName || 'Unknown Studio',
      makerProfileId: p.maker?.id,
      makerName: p.maker?.user?.name || 'Unknown Artisan',
      craftCategory: p.maker?.craftCategory || p.category?.translations?.[0]?.name || 'Uncategorized',
      desiredPrice: p.desiredPrice,
      inventory: p.inventory,
      status: p.status,
      verificationStatus: p.verificationStatus,
      primaryImageUrl: p.primaryImageUrl,
      materials: p.materials,
      dimensions: p.dimensions,
      weight: p.weight,
      isMadeToOrder: p.isMadeToOrder,
      isOneOfOne: p.isOneOfOne,
      isReadyToShip: p.isReadyToShip,
      studioVerificationStatus: p.maker?.verificationStatus,
      createdAt: p.createdAt,
    }));

    const statusCounts: Record<string, number> = {};
    for (const p of products) {
      statusCounts[p.status] = (statusCounts[p.status] || 0) + 1;
    }

    return NextResponse.json({ success: true, products: mapped, statusCounts });
  } catch (error) {
    console.error('Admin catalog GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch catalog' }, { status: 500 });
  }
}

// POST /api/admin/catalog — Moderate a product
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { productId, action, reason } = body;

    const validActions = ['APPROVE', 'PUBLISH', 'REQUEST_REVISION', 'REJECT', 'SET_CATALOG_REVIEW'];
    if (!productId || !validActions.includes(action)) {
      return NextResponse.json({ error: 'productId and valid action required' }, { status: 400 });
    }

    const product = await (prisma as any).product.findUnique({
      where: { id: productId },
      include: {
        maker: { select: { userId: true } },
        translations: { where: { languageCode: 'en' } }
      }
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const statusMap: Record<string, string> = {
      'SET_CATALOG_REVIEW': 'CATALOG_REVIEW',
      'APPROVE': 'APPROVED',
      'PUBLISH': 'PUBLISHED',
      'REQUEST_REVISION': 'REVISION_REQUIRED',
      'REJECT': 'REJECTED',
    };

    const newStatus = statusMap[action];

    await (prisma as any).product.update({
      where: { id: productId },
      data: { status: newStatus }
    });

    // Log admin action
    await prisma.adminAction.create({
      data: {
        adminUserId: session.userId,
        action: `CATALOG_${action}`,
        tableName: 'Product',
        recordId: productId,
        beforeState: JSON.stringify({ status: product.status }),
        afterState: JSON.stringify({ status: newStatus, reason }),
      }
    });

    // Notify maker
    const productName = product.translations?.[0]?.name || 'Your product';
    const messages: Record<string, { title: string; msg: string }> = {
      'APPROVE': {
        title: '✅ Product Approved',
        msg: `"${productName}" has been approved by the Guild Secretariat and is ready for publishing.`
      },
      'PUBLISH': {
        title: '🌟 Product Published',
        msg: `"${productName}" is now live in the BritSync Atelier Market.`
      },
      'REQUEST_REVISION': {
        title: '📝 Product Revision Required',
        msg: `"${productName}" requires revision: ${reason || 'Please review and resubmit.'}`
      },
      'REJECT': {
        title: '❌ Product Not Approved',
        msg: `"${productName}" was not approved: ${reason || 'Does not meet Guild standards.'}`
      },
    };

    if (messages[action] && product.maker?.userId) {
      await prisma.notification.create({
        data: {
          recipientUserId: product.maker.userId,
          title: messages[action].title,
          message: messages[action].msg,
        }
      });
    }

    return NextResponse.json({ success: true, newStatus });
  } catch (error) {
    console.error('Admin catalog POST error:', error);
    return NextResponse.json({ error: 'Failed to moderate product' }, { status: 500 });
  }
}
