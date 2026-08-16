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
      where: { userId: session.userId }
    });

    if (!maker) {
      return NextResponse.json({ error: 'Maker profile not found' }, { status: 404 });
    }

    // Get all products for this maker
    const products = await (prisma as any).product.findMany({
      where: { makerProfileId: maker.id, deletedAt: null },
      select: { id: true }
    });

    const productIds = products.map((p: any) => p.id);

    if (productIds.length === 0) {
      return NextResponse.json({ success: true, orders: [] });
    }

    // Get all order items for this maker's products
    const orderItems = await prisma.orderItem.findMany({
      where: { productId: { in: productIds } },
      include: {
        product: {
          include: {
            translations: { where: { languageCode: 'en' } }
          }
        },
        order: {
          include: {
            buyer: { select: { name: true, email: true } },
            shipments: {
              include: { trackings: true }
            }
          }
        }
      },
      orderBy: { order: { createdAt: 'desc' } }
    });

    // Group by order
    const orderMap = new Map<string, any>();
    for (const item of orderItems) {
      const orderId = item.orderId;
      if (!orderMap.has(orderId)) {
        const commissionRate = maker.verificationStatus === 'ROYAL_CHARTER' ? 0.125 : 0.15;
        const grossAmount = item.sellingPrice * item.quantity;
        const commissionAmount = grossAmount * commissionRate;
        const makerNet = grossAmount - commissionAmount;

        orderMap.set(orderId, {
          id: orderId,
          orderRef: `BS-${orderId.slice(-6).toUpperCase()}`,
          status: item.order?.status || 'PENDING',
          createdAt: item.order?.createdAt,
          patronName: item.order?.buyer?.name || 'Anonymous Patron',
          patronEmail: item.order?.buyer?.email,
          items: [],
          grossAmount,
          commissionRate: commissionRate * 100,
          commissionAmount,
          makerNet,
          escrowStatus: ['DELIVERED'].includes(item.order?.status) ? 'CLEARED' : 'HELD',
          trackingNumber: item.order?.shipments?.[0]?.trackings?.[0]?.trackingNumber || null,
          carrier: item.order?.shipments?.[0]?.carrierName || null,
        });
      }

      orderMap.get(orderId).items.push({
        productId: item.productId,
        productName: item.product?.translations?.[0]?.name || 'Handcrafted Piece',
        quantity: item.quantity,
        desiredPrice: item.desiredPrice,
        sellingPrice: item.sellingPrice,
      });
    }

    return NextResponse.json({
      success: true,
      orders: Array.from(orderMap.values()),
    });
  } catch (error) {
    console.error('Maker orders GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

// PATCH /api/maker/orders — Update order dispatch status
export async function PATCH(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'MAKER') {
      return NextResponse.json({ error: 'Maker authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const { orderId, newStatus, trackingNumber, carrier } = body;

    if (!orderId || !newStatus) {
      return NextResponse.json({ error: 'orderId and newStatus are required' }, { status: 400 });
    }

    const allowedTransitions: Record<string, string[]> = {
      'PENDING': ['ACCEPTED'],
      'ACCEPTED': ['PREPARING'],
      'PREPARING': ['PACKED'],
      'PACKED': ['SHIPPED'],
      'SHIPPED': ['DELIVERED'],
    };

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { orderItems: { include: { product: true } } }
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Verify this maker owns at least one product in the order
    const maker = await (prisma as any).makerProfile.findUnique({
      where: { userId: session.userId }
    });

    const makerOwnsOrder = order.orderItems.some(
      (oi: any) => oi.product?.makerProfileId === maker?.id
    );

    if (!makerOwnsOrder) {
      return NextResponse.json({ error: 'Unauthorized: not your order' }, { status: 403 });
    }

    const allowed = allowedTransitions[order.status] || [];
    if (!allowed.includes(newStatus)) {
      return NextResponse.json({
        error: `Cannot transition from ${order.status} to ${newStatus}`,
      }, { status: 400 });
    }

    await prisma.order.update({
      where: { id: orderId },
      data: { status: newStatus }
    });

    // If shipping, create shipment tracking record
    if (newStatus === 'SHIPPED' && trackingNumber) {
      const existingShipment = await prisma.shipment.findFirst({
        where: { orderId }
      });

      if (existingShipment) {
        await prisma.shipmentTracking.create({
          data: {
            shipmentId: existingShipment.id,
            trackingNumber,
            trackingUrl: null,
          }
        });
      } else {
        const newShipment = await prisma.shipment.create({
          data: {
            orderId,
            carrierName: carrier || 'COURIER',
            status: 'IN_TRANSIT',
          }
        });
        await prisma.shipmentTracking.create({
          data: {
            shipmentId: newShipment.id,
            trackingNumber,
          }
        });
      }
    }

    // If delivered, move wallet balance from held to cleared
    if (newStatus === 'DELIVERED') {
      const wallet = await prisma.wallet.findUnique({
        where: { makerProfileId: maker?.id }
      });

      if (wallet) {
        const orderTotal = order.orderItems
          .filter((oi: any) => oi.product?.makerProfileId === maker?.id)
          .reduce((sum: number, oi: any) => {
            const commissionRate = maker?.verificationStatus === 'ROYAL_CHARTER' ? 0.125 : 0.15;
            return sum + (oi.sellingPrice * oi.quantity * (1 - commissionRate));
          }, 0);

        await prisma.wallet.update({
          where: { id: wallet.id },
          data: {
            clearedBalance: wallet.clearedBalance + orderTotal,
            payoutHeldBalance: Math.max(0, wallet.payoutHeldBalance - orderTotal),
          }
        });
      }
    }

    return NextResponse.json({ success: true, newStatus });
  } catch (error) {
    console.error('Maker orders PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 });
  }
}
