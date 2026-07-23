import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { createOrder, updateOrderStatus } from '@/lib/services/order.service';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get('status');

    let where: any = {};

    if (session.role === 'ADMIN' || session.role === 'SUPER_ADMIN') {
      if (statusFilter) where.status = statusFilter;
    } else if (session.role === 'MAKER') {
      const maker = await prisma.makerProfile.findUnique({ where: { userId: session.userId } });
      if (!maker) return NextResponse.json({ error: 'Maker profile not found' }, { status: 404 });
      where = {
        orderItems: { some: { product: { makerProfileId: maker.id } } },
        ...(statusFilter ? { status: statusFilter } : {}),
      };
    } else {
      // BUYER
      where = { buyerId: session.userId, ...(statusFilter ? { status: statusFilter } : {}) };
    }

    const orders = await prisma.order.findMany({
      where,
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
        paymentTransactions: { orderBy: { createdAt: 'desc' }, take: 1 },
        shipments: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
      orderBy: { createdAt: 'desc' },
    });

    const mapped = orders.map((o: any) => ({
      id: o.id,
      status: o.status,
      subtotal: o.subtotal,
      vat: o.vat,
      discount: o.discount,
      shippingCost: o.shippingCost,
      total: o.totalAmount,
      createdAt: o.createdAt,
      buyer: o.buyer,
      paymentStatus: o.paymentTransactions[0]?.status || 'PENDING',
      tracking: o.shipments[0]
        ? { carrier: o.shipments[0].carrierName, status: o.shipments[0].status, estimatedDelivery: o.shipments[0].estimatedDelivery }
        : null,
      items: o.orderItems.map((item: any) => {
        const t = item.product.translations.find((x: any) => x.languageCode === 'en') || item.product.translations[0] || {};
        return {
          id: item.id,
          productId: item.productId,
          name: t.name || 'Product',
          quantity: item.quantity,
          qty: item.quantity,
          price: item.sellingPrice,
          desiredPrice: item.desiredPrice,
          marginEarned: item.marginEarned,
          maker: item.product.maker?.businessName || '',
          image: item.product.mediaMaps[0]?.media?.storageKey || '',
        };
      }),
    }));

    return NextResponse.json(mapped);
  } catch (error) {
    console.error('Failed to fetch orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const { items, subtotal, vat, discount, shippingCost, total, paymentMethod, shippingAddress } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }
    if (!shippingAddress?.fullName || !shippingAddress?.addressLine || !shippingAddress?.city || !shippingAddress?.postcode) {
      return NextResponse.json({ error: 'Complete shipping address is required' }, { status: 400 });
    }

    const order = await createOrder({
      buyerId: session.userId,
      items: items.map((i: any) => ({ productId: i.id || i.productId, quantity: i.qty || i.quantity || 1 })),
      subtotal: parseFloat(subtotal) || 0,
      vat: parseFloat(vat) || 0,
      discount: parseFloat(discount) || 0,
      shippingCost: parseFloat(shippingCost) || 0,
      total: parseFloat(total) || 0,
      paymentMethod: paymentMethod || 'CARD',
      shippingAddress,
    });

    // Clear the DB cart for this user
    await prisma.cartItem.deleteMany({ where: { userId: session.userId } });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      status: 'PAID',
      totalAmount: order.totalAmount,
    });
  } catch (error: any) {
    console.error('Order creation failed:', error);
    return NextResponse.json({ error: error.message || 'Order placement failed' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { orderId, status } = await request.json();
    if (!orderId || !status) {
      return NextResponse.json({ error: 'orderId and status are required' }, { status: 400 });
    }

    const result = await updateOrderStatus(orderId, status, session.userId);
    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    console.error('Order update failed:', error);
    return NextResponse.json({ error: error.message || 'Failed to update order' }, { status: 500 });
  }
}
