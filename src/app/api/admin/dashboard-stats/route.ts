import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Real KPIs from DB
    const [
      totalOrders,
      allOrderItems,
      allMakers,
      allProducts,
      wallets,
      pendingAuditCount,
      underReviewCount,
      openInquiries,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.orderItem.findMany({ select: { sellingPrice: true, quantity: true, marginEarned: true } }),
      (prisma as any).makerProfile.findMany({
        select: { id: true, verificationStatus: true, wallet: { select: { clearedBalance: true, payoutHeldBalance: true } } }
      }),
      (prisma as any).product.findMany({
        where: { deletedAt: null },
        select: { id: true, status: true, desiredPrice: true }
      }),
      prisma.wallet.findMany({ select: { clearedBalance: true, payoutHeldBalance: true } }),
      (prisma as any).makerProfile.count({ where: { verificationStatus: 'PENDING_AUDIT' } }),
      (prisma as any).makerProfile.count({ where: { verificationStatus: 'UNDER_REVIEW' } }),
      prisma.notification.count({ where: { isRead: false } }),
    ]);

    const gmv = allOrderItems.reduce((s: number, oi: any) => s + (oi.sellingPrice * oi.quantity), 0);
    const platformRevenue = allOrderItems.reduce((s: number, oi: any) => s + (oi.marginEarned || 0), 0);
    const escrowHeld = wallets.reduce((s: number, w: any) => s + (w.payoutHeldBalance || 0), 0);
    const clearedBalances = wallets.reduce((s: number, w: any) => s + (w.clearedBalance || 0), 0);
    const netMargin = platformRevenue * 0.85; // After platform costs

    const activeStudios = allMakers.filter((m: any) =>
      ['GUILD_VERIFIED', 'ROYAL_CHARTER'].includes(m.verificationStatus)
    ).length;

    const royalCharterStudios = allMakers.filter((m: any) => m.verificationStatus === 'ROYAL_CHARTER').length;
    const totalStudios = allMakers.length;

    const activeProducts = allProducts.filter((p: any) => ['APPROVED', 'PUBLISHED'].includes(p.status)).length;
    const pendingReview = allProducts.filter((p: any) => ['SUBMITTED_FOR_REVIEW', 'CATALOG_REVIEW'].includes(p.status)).length;

    // Pipeline counts
    const pipelineStatuses = ['GENERAL', 'INCOMPLETE', 'PENDING_AUDIT', 'UNDER_REVIEW', 'REVISION_REQUIRED', 'GUILD_VERIFIED', 'ROYAL_CHARTER', 'REJECTED'];
    const pipeline: Record<string, number> = {};
    for (const status of pipelineStatuses) {
      pipeline[status] = allMakers.filter((m: any) => m.verificationStatus === status).length;
    }

    return NextResponse.json({
      success: true,
      kpis: {
        gmv,
        platformRevenue,
        netMargin,
        escrowHeld,
        clearedBalances,
        activeStudios,
        totalStudios,
        royalCharterStudios,
        pendingAuditCount,
        underReviewCount,
        activeProducts,
        totalProducts: allProducts.length,
        pendingReview,
        totalOrders,
        openInquiries,
      },
      pipeline,
    });
  } catch (error) {
    console.error('CEO dashboard stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch executive stats' }, { status: 500 });
  }
}
