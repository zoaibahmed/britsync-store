import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        buyer: { select: { id: true, name: true, email: true } },
        orderItems: {
          include: {
            product: {
              include: {
                maker: { select: { id: true, businessName: true, userId: true } },
                translations: true,
                mediaMaps: { take: 1, orderBy: { sortOrder: 'asc' }, include: { media: true } },
              },
            },
          },
        },
        paymentTransactions: { orderBy: { createdAt: 'desc' } },
        shipments: { include: { trackings: true, events: true } },
      },
    });

    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    // RBAC: buyer can only see their own orders
    if (session.role === 'BUYER' && order.buyerId !== session.userId) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const mapped = {
      id: order.id,
      status: order.status,
      subtotal: order.subtotal,
      vat: order.vat,
      discount: order.discount,
      shippingCost: order.shippingCost,
      total: order.totalAmount,
      createdAt: order.createdAt,
      buyer: order.buyer,
      paymentStatus: order.paymentTransactions[0]?.status || 'PENDING',
      paymentProvider: order.paymentTransactions[0]?.providerName || '',
      shipments: order.shipments,
      items: order.orderItems.map((item: any) => {
        const t = item.product.translations.find((x: any) => x.languageCode === 'en') || item.product.translations[0] || {};
        return {
          id: item.id,
          productId: item.productId,
          name: t.name || 'Product',
          quantity: item.quantity,
          price: item.sellingPrice,
          desiredPrice: item.desiredPrice,
          marginEarned: item.marginEarned,
          maker: item.product.maker?.businessName || '',
          image: item.product.mediaMaps[0]?.media?.storageKey || '',
        };
      }),
    };

    return NextResponse.json(mapped);
  } catch (error) {
    console.error('Failed to fetch order:', error);
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
}
