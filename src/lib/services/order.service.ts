/**
 * order.service.ts
 * Complete order lifecycle service.
 * Handles: creation (with escrow + inventory), status transitions, cancellation, and delivery.
 */
import { prisma } from '@/lib/prisma';
import { calculateSellingPrice } from '@/lib/pricing';
import { createNotification } from './notification.service';
import { creditMakerWallet, recordEscrowHold, recordBrittsyncRevenue } from './wallet.service';

export interface CreateOrderInput {
  buyerId: string;
  items: { productId: string; quantity: number }[];
  subtotal: number;
  vat: number;
  discount: number;
  shippingCost: number;
  total: number;
  paymentMethod: string;
  shippingAddress: {
    fullName: string;
    addressLine: string;
    city: string;
    postcode: string;
    country: string;
  };
}

const VALID_TRANSITIONS: Record<string, string[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: ['COMPLETED', 'DISPUTED'],
  COMPLETED: [],
  DISPUTED: ['REFUNDED', 'CONFIRMED'],
  CANCELLED: ['REFUNDED'],
  REFUNDED: [],
};

export async function createOrder(input: CreateOrderInput) {
  return prisma.$transaction(async (tx) => {
    // 1. Validate all products exist and have sufficient stock
    const productIds = input.items.map((i) => i.productId);
    const products = await tx.product.findMany({
      where: { id: { in: productIds } },
      include: { maker: true, translations: true },
    });

    for (const item of input.items) {
      const product = products.find((p) => p.id === item.productId);
      if (!product) throw new Error(`Product not found: ${item.productId}`);
      if (product.inventory < item.quantity) {
        throw new Error(`Insufficient stock for: ${item.productId}`);
      }
    }

    // 2. Create the Order record
    const order = await tx.order.create({
      data: {
        buyerId: input.buyerId,
        status: 'PENDING',
        subtotal: input.subtotal,
        vat: input.vat,
        discount: input.discount,
        shippingCost: input.shippingCost,
        totalAmount: input.total,
        idempotencyKey: `order-${input.buyerId}-${Date.now()}`,
      },
    });

    // 3. Process each order item: deduct inventory + create ledger entry + order item
    let totalMarginEarned = 0;
    for (const item of input.items) {
      const product = products.find((p) => p.id === item.productId)!;
      const translation = product.translations.find((t) => t.languageCode === 'en') || product.translations[0];
      const sellingPrice = calculateSellingPrice(product.desiredPrice, undefined, undefined, product.verificationStatus);
      const lineTotal = sellingPrice * item.quantity;
      const marginEarned = (sellingPrice - product.desiredPrice) * item.quantity;
      totalMarginEarned += marginEarned;

      // Decrement inventory
      await tx.product.update({
        where: { id: item.productId },
        data: { inventory: { decrement: item.quantity } },
      });

      // Inventory ledger
      await tx.inventoryLedger.create({
        data: {
          productId: item.productId,
          quantityDelta: -item.quantity,
          referenceType: 'SALE',
          referenceId: order.id,
        },
      });

      // Order item
      await tx.orderItem.create({
        data: {
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          desiredPrice: product.desiredPrice,
          sellingPrice: lineTotal,
          marginEarned,
        },
      });
    }

    // 4. Create PaymentTransaction (FUNDS_HELD = escrow active)
    await tx.paymentTransaction.create({
      data: {
        orderId: order.id,
        amount: input.total,
        providerName: input.paymentMethod.toUpperCase().slice(0, 50),
        status: 'FUNDS_HELD',
      },
    });

    // 5. Save shipping address
    await tx.shippingAddress.create({
      data: {
        userId: input.buyerId,
        fullName: input.shippingAddress.fullName,
        addressLine1: input.shippingAddress.addressLine,
        city: input.shippingAddress.city,
        postcode: input.shippingAddress.postcode,
        country: input.shippingAddress.country,
        isDefault: false,
      },
    });

    // 6. Record escrow hold in ledger
    await recordEscrowHold(tx, input.total, order.id);

    // 7. Record Britsync revenue margin
    await recordBrittsyncRevenue(tx, totalMarginEarned, order.id);

    // 8. Advance status to CONFIRMED
    await tx.order.update({
      where: { id: order.id },
      data: { status: 'CONFIRMED' },
    });

    await tx.paymentTransaction.updateMany({
      where: { orderId: order.id },
      data: { status: 'COMPLETED' },
    });

    // 9. Notify buyer
    await createNotification(tx, {
      recipientUserId: input.buyerId,
      title: '✅ Order Confirmed & Paid',
      message: `Your order has been placed and payment held in secure escrow. Order ID: ${order.id.slice(0, 8).toUpperCase()}`,
    });

    // 10. Notify each maker
    const makerIds = Array.from(new Set(products.map((p) => p.maker.userId)));
    for (const makerUserId of makerIds) {
      await createNotification(tx, {
        recipientUserId: makerUserId,
        title: '📦 New Order Received',
        message: `A new order has been placed for your products. Please prepare for shipping.`,
      });
    }

    return order;
  }, { timeout: 15000 });
}

export async function updateOrderStatus(orderId: string, newStatus: string, actorUserId: string) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: { include: { product: { include: { maker: true } } } },
        buyer: true,
      },
    });

    if (!order) throw new Error('Order not found');

    const allowed = VALID_TRANSITIONS[order.status] || [];
    if (!allowed.includes(newStatus)) {
      throw new Error(`Cannot transition from ${order.status} to ${newStatus}`);
    }

    await tx.order.update({ where: { id: orderId }, data: { status: newStatus } });

    // On DELIVERED: release escrow — credit each maker's wallet
    if (newStatus === 'DELIVERED') {
      const makerPayouts: Record<string, number> = {};
      for (const item of order.orderItems) {
        const makerId = item.product.makerProfileId;
        const makerAmount = item.desiredPrice * item.quantity; // maker gets their desired price
        makerPayouts[makerId] = (makerPayouts[makerId] || 0) + makerAmount;
      }

      for (const [makerId, amount] of Object.entries(makerPayouts)) {
        await creditMakerWallet(tx, makerId, amount, `Payment for order ${orderId}`, orderId);

        // Notify the maker user
        const makerProfile = order.orderItems.find((i) => i.product.makerProfileId === makerId)?.product.maker;
        if (makerProfile) {
          await createNotification(tx, {
            recipientUserId: makerProfile.userId,
            title: '💰 Payment Released to Your Wallet',
            message: `£${amount.toFixed(2)} has been released from escrow and credited to your wallet for order ${orderId.slice(0, 8).toUpperCase()}.`,
          });
        }
      }

      // Update PaymentTransaction status
      await tx.paymentTransaction.updateMany({
        where: { orderId, status: 'COMPLETED' },
        data: { status: 'COMPLETED' },
      });
    }

    // On CANCELLED: restore inventory
    if (newStatus === 'CANCELLED') {
      for (const item of order.orderItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: { inventory: { increment: item.quantity } },
        });
        await tx.inventoryLedger.create({
          data: {
            productId: item.productId,
            quantityDelta: item.quantity,
            referenceType: 'RETURN',
            referenceId: orderId,
          },
        });
      }
      await tx.paymentTransaction.updateMany({
        where: { orderId },
        data: { status: 'FAILED' },
      });
    }

    // Buyer notification on status change
    const statusMessages: Record<string, string> = {
      CONFIRMED: '✅ Your order is confirmed and payment is securely held in escrow.',
      SHIPPED: '🚚 Your order has shipped! Tracking details will follow.',
      DELIVERED: '📦 Your order has been delivered. Escrow released to maker.',
      COMPLETED: '⭐ Order complete! We hope you love your purchase. Please leave a review.',
      DISPUTED: '⚠️ Your order is under dispute review. Our team will contact you.',
      CANCELLED: '❌ Your order has been cancelled.',
      REFUNDED: '💸 Your refund has been processed.',
    };

    if (statusMessages[newStatus]) {
      await createNotification(tx, {
        recipientUserId: order.buyerId,
        title: `Order Status: ${newStatus}`,
        message: statusMessages[newStatus],
      });
    }

    return { orderId, newStatus };
  }, { timeout: 15000 });
}
