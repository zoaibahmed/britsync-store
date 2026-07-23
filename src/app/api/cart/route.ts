import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

/**
 * GET /api/cart
 * Returns the authenticated user's persistent cart items with full product details.
 */
export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

    const items = await prisma.cartItem.findMany({
      where: { userId: session.userId },
      include: {
        product: {
          include: {
            translations: true,
            mediaMaps: { take: 1, orderBy: { sortOrder: 'asc' }, include: { media: true } },
            maker: { select: { businessName: true } },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    const mapped = items.map((item) => {
      const t = item.product.translations.find((x) => x.languageCode === 'en') || item.product.translations[0];
      return {
        id: item.id,
        productId: item.productId,
        name: t?.name || 'Product',
        price: item.product.desiredPrice,
        qty: item.quantity,
        quantity: item.quantity,
        maker: item.product.maker?.businessName || '',
        image: item.product.mediaMaps[0]?.media?.storageKey || '',
        inventory: item.product.inventory,
      };
    });

    return NextResponse.json(mapped);
  } catch (error) {
    console.error('Failed to fetch cart:', error);
    return NextResponse.json({ error: 'Failed to fetch cart' }, { status: 500 });
  }
}

/**
 * POST /api/cart
 * Add or update a product in the cart.
 * Body: { productId, quantity }
 */
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

    const { productId, quantity } = await request.json();
    if (!productId || !quantity || quantity < 1) {
      return NextResponse.json({ error: 'productId and quantity (>= 1) are required' }, { status: 400 });
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    if (product.inventory < quantity) {
      return NextResponse.json({ error: 'Insufficient stock' }, { status: 400 });
    }

    const item = await prisma.cartItem.upsert({
      where: { userId_productId: { userId: session.userId, productId } },
      create: { userId: session.userId, productId, quantity },
      update: { quantity },
    });

    return NextResponse.json({ success: true, item });
  } catch (error) {
    console.error('Failed to update cart:', error);
    return NextResponse.json({ error: 'Failed to update cart' }, { status: 500 });
  }
}

/**
 * DELETE /api/cart
 * Remove an item or clear the entire cart.
 * Body: { productId } — omit to clear all.
 */
export async function DELETE(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

    const body = await request.json().catch(() => ({}));
    const { productId } = body;

    if (productId) {
      await prisma.cartItem.deleteMany({
        where: { userId: session.userId, productId },
      });
    } else {
      await prisma.cartItem.deleteMany({ where: { userId: session.userId } });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to clear cart:', error);
    return NextResponse.json({ error: 'Failed to clear cart' }, { status: 500 });
  }
}
