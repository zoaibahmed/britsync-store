import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession, STAFF_ROLES } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || !STAFF_ROLES.includes(session.role)) {
      return NextResponse.json({ error: 'Staff authorization required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.trim() || '';

    if (!query || query.length < 2) {
      return NextResponse.json({ success: true, results: { studios: [], products: [], orders: [], customers: [] } });
    }

    // Search Studios
    const studios = await prisma.makerProfile.findMany({
      where: {
        OR: [
          { businessName: { contains: query } },
          { founderName: { contains: query } },
          { craftCategory: { contains: query } }
        ]
      },
      select: {
        id: true,
        businessName: true,
        founderName: true,
        craftCategory: true,
        verificationStatus: true,
      },
      take: 5,
    });

    // Search Products
    const products = await prisma.product.findMany({
      where: {
        deletedAt: null,
        OR: [
          { translations: { some: { name: { contains: query } } } },
          { materials: { contains: query } }
        ]
      },
      select: {
        id: true,
        desiredPrice: true,
        status: true,
        translations: { where: { languageCode: 'en' }, select: { name: true } }
      },
      take: 5,
    });

    // Search Orders
    const orders = await prisma.order.findMany({
      where: {
        id: { contains: query }
      },
      select: {
        id: true,
        totalAmount: true,
        status: true,
        createdAt: true,
      },
      take: 5,
    });

    // Search Customers/Users
    const customers = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: query } },
          { email: { contains: query } }
        ]
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
      take: 5,
    });

    return NextResponse.json({
      success: true,
      results: {
        studios,
        products: products.map((p: any) => ({ id: p.id, name: p.translations?.[0]?.name || 'Untitled', price: p.desiredPrice, status: p.status })),
        orders: orders.map((o: any) => ({ id: o.id, orderNumber: `BS-${o.id.slice(0, 6).toUpperCase()}`, totalAmount: o.totalAmount, orderStatus: o.status, createdAt: o.createdAt })),
        customers,
      }
    });
  } catch (error) {
    console.error('Global Search API error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
