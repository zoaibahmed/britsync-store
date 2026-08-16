import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== 'MAKER') {
      return NextResponse.json({ error: 'Maker authentication required' }, { status: 401 });
    }

    const maker = await (prisma as any).makerProfile.findUnique({
      where: { userId: session.userId },
      include: {
        products: { where: { deletedAt: null } },
        wallet: true,
        _count: { select: { products: true } }
      }
    });

    if (!maker) {
      return NextResponse.json({ error: 'Maker profile not found' }, { status: 404 });
    }

    // Real order stats
    const products = maker.products || [];
    const productIds = products.map((p: any) => p.id);

    let activeOrderCount = 0;
    let awaitingDispatchCount = 0;
    let escrowHeld = 0;
    let thisMonthRevenue = 0;

    if (productIds.length > 0) {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const orderItems = await prisma.orderItem.findMany({
        where: { productId: { in: productIds } },
        include: {
          order: {
            select: { status: true, createdAt: true }
          }
        }
      });

      activeOrderCount = new Set(
        orderItems
          .filter((oi: any) => !['DELIVERED', 'CANCELLED', 'REFUNDED'].includes(oi.order?.status))
          .map((oi: any) => oi.orderId)
      ).size;

      awaitingDispatchCount = new Set(
        orderItems
          .filter((oi: any) => ['ACCEPTED', 'PREPARING', 'PACKED'].includes(oi.order?.status))
          .map((oi: any) => oi.orderId)
      ).size;

      thisMonthRevenue = orderItems
        .filter((oi: any) => new Date(oi.order?.createdAt) >= startOfMonth)
        .reduce((sum: number, oi: any) => sum + (oi.desiredPrice * oi.quantity), 0);
    }

    // Wallet data
    const clearedBalance = maker.wallet?.clearedBalance || 0;
    const escrowBalance = maker.wallet?.payoutHeldBalance || 0;

    // Provenance passports
    let passportCount = 0;
    if (productIds.length > 0) {
      passportCount = await prisma.productPassport.count({
        where: { productId: { in: productIds } }
      });
    }

    const activeProducts = products.filter((p: any) =>
      ['APPROVED', 'PUBLISHED'].includes(p.status)
    ).length;

    return NextResponse.json({
      success: true,
      stats: {
        productCount: products.length,
        activeProducts,
        maxProducts: 5,
        activeOrderCount,
        awaitingDispatchCount,
        escrowHeld: escrowBalance,
        clearedBalance,
        thisMonthRevenue,
        passportCount,
        verificationStatus: maker.verificationStatus,
        accreditationStep: maker.accreditationStep || 0,
      }
    });
  } catch (error) {
    console.error('Maker dashboard stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard stats' }, { status: 500 });
  }
}
