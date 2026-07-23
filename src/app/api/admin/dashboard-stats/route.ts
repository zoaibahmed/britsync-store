import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/dashboard-stats
 * Returns overall counts and metrics for the admin landing tab.
 */
export async function GET() {
  try {
    const session = await getSession();
    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const [
      totalUsers,
      totalMakers,
      totalProducts,
      pendingProducts,
      pendingVerifications,
      openTickets,
      totalOrders,
      totalRevenue,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.makerProfile.count(),
      prisma.product.count(),
      prisma.product.count({ where: { status: 'PENDING_REVIEW' } }),
      prisma.verificationRequest.count({ where: { status: 'PENDING' } }),
      prisma.supportTicket.count({ where: { status: 'OPEN' } }),
      prisma.order.count(),
      prisma.order.aggregate({
        _sum: { totalAmount: true },
      }),
    ]);

    // Fetch recent transaction logs
    const transactions = await prisma.paymentTransaction.findMany({
      include: {
        order: { include: { buyer: { select: { name: true } } } },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return NextResponse.json({
      counters: {
        totalUsers,
        totalMakers,
        totalProducts,
        pendingProducts,
        pendingVerifications,
        openTickets,
        totalOrders,
        totalRevenue: totalRevenue._sum.totalAmount || 0,
      },
      transactions: transactions.map((t) => ({
        id: t.id,
        orderId: t.orderId,
        buyer: t.order?.buyer?.name || 'Customer',
        amount: t.amount,
        provider: t.providerName,
        status: t.status,
        createdAt: t.createdAt,
      })),
    });
  } catch (error) {
    console.error('Failed to get dashboard stats:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
