import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

/**
 * GET /api/analytics/ceo
 * Generates aggregation-driven platform KPIs and graphs for executive reporting.
 * Authenticated admins/super-admins only.
 */
export async function GET() {
  try {
    const session = await getSession();
    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // 1. Financial KPIs via aggregate
    const revenueStats = await prisma.order.aggregate({
      _sum: { totalAmount: true, subtotal: true, vat: true, discount: true, shippingCost: true },
      _count: { id: true },
    });

    const totalRevenue = revenueStats._sum.totalAmount || 0;
    const orderCount = revenueStats._count.id || 0;

    // Escrow balance: Orders that are CONFIRMED or SHIPPED or DELIVERED (but not COMPLETED)
    const escrowOrders = await prisma.order.aggregate({
      where: { status: { in: ['CONFIRMED', 'SHIPPED', 'DELIVERED'] } },
      _sum: { totalAmount: true },
    });
    const escrowBalance = escrowOrders._sum.totalAmount || 0;

    // Total maker payouts from completed orders or clearing balances
    const wallets = await prisma.wallet.aggregate({
      _sum: { clearedBalance: true, payoutHeldBalance: true },
    });
    const makerPayouts = wallets._sum.clearedBalance || 0;

    // Britsync margin earned from OrderItems
    const orderItemsAgg = await prisma.orderItem.aggregate({
      _sum: { marginEarned: true },
    });
    const netMargin = orderItemsAgg._sum.marginEarned || 0;

    // 2. Sales by Country
    const countryBreakdown = await prisma.order.findMany({
      include: {
        orderItems: {
          include: {
            product: {
              include: {
                maker: {
                  include: {
                    location: {
                      include: { translations: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
      take: 100, // Aggregate recent 100 orders
    });

    const countryStats: Record<string, { orders: number; revenue: number }> = {};
    countryBreakdown.forEach((o) => {
      o.orderItems.forEach((item) => {
        const countryName =
          item.product.maker?.location?.translations?.find((t) => t.languageCode === 'en')?.name || 'Global';
        if (!countryStats[countryName]) {
          countryStats[countryName] = { orders: 0, revenue: 0 };
        }
        countryStats[countryName].orders += 1;
        countryStats[countryName].revenue += item.sellingPrice * item.quantity;
      });
    });

    const countryList = Object.entries(countryStats).map(([name, stat]) => ({
      name,
      orders: stat.orders,
      revenue: stat.revenue,
    }));

    // 3. Verification status metrics (count products by tier)
    const verificationCounts = await prisma.product.groupBy({
      by: ['verificationStatus'],
      _count: { id: true },
    });

    // 4. Top products (by views, wishlist, and purchase counts)
    const topProducts = await prisma.product.findMany({
      include: {
        translations: true,
        metrics: true,
        maker: { select: { businessName: true } },
      },
      orderBy: { metrics: { purchasedCount: 'desc' } },
      take: 5,
    });

    const topProductList = topProducts.map((p) => {
      const trans = p.translations.find((t) => t.languageCode === 'en') || p.translations[0];
      return {
        id: p.id,
        name: trans?.name || 'Product',
        makerName: p.maker?.businessName || 'Artisan',
        purchases: p.metrics?.purchasedCount || 0,
        views: p.metrics?.viewsCount || 0,
        price: p.desiredPrice,
      };
    });

    // 5. Daily Sales Trend (for chart)
    const dailySales = await prisma.order.groupBy({
      by: ['createdAt'],
      _sum: { totalAmount: true },
      orderBy: { createdAt: 'asc' },
      take: 30,
    });

    // Formulate a clean trend dataset
    const dailyList = dailySales.map((d) => ({
      date: new Date(d.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
      amount: d._sum.totalAmount || 0,
    }));

    return NextResponse.json({
      kpis: {
        totalRevenue,
        orderCount,
        escrowBalance,
        makerPayouts,
        netMargin,
      },
      countries: countryList,
      verification: verificationCounts.map((v) => ({
        tier: v.verificationStatus,
        count: v._count.id,
      })),
      topProducts: topProductList,
      dailyTrend: dailyList,
    });
  } catch (error) {
    console.error('Failed to generate CEO analytics:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
