import { prisma } from '@/lib/prisma';

export interface TrackingStage {
  title: string;
  time: string;
  status: 'completed' | 'active' | 'pending';
  description: string;
}

export interface OrderTrackingDetails {
  id: string;
  status: string;
  totalAmount: number;
  recipientName: string;
  recipientEmail: string;
  courier: string;
  estimatedDelivery: string;
  timeline: TrackingStage[];
}

export async function trackOrderDetails(orderId: string): Promise<OrderTrackingDetails | null> {
  try {
    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { id: orderId },
          { id: { startsWith: orderId } }
        ]
      },
      include: { buyer: true }
    });

    if (!order) return null;

    const dateStr = new Date(order.createdAt).toLocaleDateString();
    const courier = order.totalAmount > 200 ? 'FedEx Crate Priority' : 'DHL Tracked';
    
    // Build actual timelines based on DB order status
    const timeline: TrackingStage[] = [
      { title: 'Order Placed', time: dateStr, status: 'completed', description: 'Payment verified and held in escrow.' },
      { title: 'Curation Audit', time: dateStr, status: order.status === 'PENDING' ? 'active' : 'completed', description: 'Cryptographic Provenance Passport generated and signed.' },
      { title: 'In Transit', time: 'In progress', status: order.status === 'PENDING' ? 'pending' : order.status === 'SHIPPED' ? 'active' : 'completed', description: `Dispatched via ${courier}.` },
      { title: 'Delivered', time: 'Awaiting arrival', status: order.status === 'DELIVERED' ? 'completed' : 'pending', description: 'Released after 48-hour inspect-and-hold.' }
    ];

    return {
      id: order.id,
      status: order.status,
      totalAmount: order.totalAmount,
      recipientName: order.buyer?.name || 'Patron',
      recipientEmail: order.buyer?.email || '',
      courier,
      estimatedDelivery: new Date(new Date(order.createdAt).getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      timeline
    };
  } catch (e) {
    console.error('Prisma order query failed', e);
    return null;
  }
}
