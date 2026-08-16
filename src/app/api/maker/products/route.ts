import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

const MAX_PRODUCTS = 5;

// GET /api/maker/products — Fetch maker's products with full details
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

    // Only GUILD_VERIFIED or ROYAL_CHARTER can manage products
    if (!['GUILD_VERIFIED', 'ROYAL_CHARTER'].includes(maker.verificationStatus)) {
      return NextResponse.json({
        error: 'Guild verification required to access product catalog',
        verificationStatus: maker.verificationStatus,
      }, { status: 403 });
    }

    const products = await (prisma as any).makerProfile.findUnique({
      where: { id: maker.id },
      select: {
        products: {
          where: { deletedAt: null },
          include: {
            category: { include: { translations: true } },
            translations: { where: { languageCode: 'en' } },
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    const mapped = (products?.products || []).map((p: any) => ({
      id: p.id,
      name: p.translations?.[0]?.name || 'Untitled Piece',
      description: p.translations?.[0]?.description || '',
      story: p.translations?.[0]?.story || '',
      category: p.category?.translations?.find((t: any) => t.languageCode === 'en')?.name || 'Uncategorized',
      desiredPrice: p.desiredPrice,
      inventory: p.inventory,
      status: p.status,
      verificationStatus: p.verificationStatus,
      primaryImageUrl: p.primaryImageUrl,
      materials: p.materials,
      dimensions: p.dimensions,
      weight: p.weight,
      craftingTimeWeeks: p.craftingTimeWeeks,
      isMadeToOrder: p.isMadeToOrder,
      isOneOfOne: p.isOneOfOne,
      isReadyToShip: p.isReadyToShip,
      isEcoFriendly: p.isEcoFriendly,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));

    return NextResponse.json({
      success: true,
      products: mapped,
      count: mapped.length,
      maxProducts: MAX_PRODUCTS,
      canAddMore: mapped.filter((p: any) => !['REJECTED'].includes(p.status)).length < MAX_PRODUCTS,
    });
  } catch (error) {
    console.error('Maker products GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

// POST /api/maker/products — Create new product (enforces 5-product cap)
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'MAKER') {
      return NextResponse.json({ error: 'Maker authentication required' }, { status: 401 });
    }

    const maker = await (prisma as any).makerProfile.findUnique({
      where: { userId: session.userId },
      include: {
        products: {
          where: { deletedAt: null, status: { notIn: ['REJECTED'] } }
        }
      }
    });

    if (!maker) {
      return NextResponse.json({ error: 'Maker profile not found' }, { status: 404 });
    }

    if (!['GUILD_VERIFIED', 'ROYAL_CHARTER'].includes(maker.verificationStatus)) {
      return NextResponse.json({
        error: 'Guild verification required to submit products',
        code: 'NOT_VERIFIED',
      }, { status: 403 });
    }

    // Enforce 5-product cap
    if (maker.products.length >= MAX_PRODUCTS) {
      return NextResponse.json({
        error: 'COLLECTION_CAP_REACHED',
        message: 'Your studio collection is at the maximum of 5 handcrafted pieces. Archive or retire an existing piece to add a new one.',
        code: 'COLLECTION_CAP_REACHED',
        current: maker.products.length,
        max: MAX_PRODUCTS,
      }, { status: 422 });
    }

    const body = await request.json();
    const {
      name,
      description,
      story,
      categoryId,
      desiredPrice,
      inventory,
      primaryImageUrl,
      materials,
      dimensions,
      weight,
      craftingTimeWeeks,
      isMadeToOrder,
      isOneOfOne,
      isReadyToShip,
      isEcoFriendly,
      submitForReview,
    } = body;

    if (!name || !desiredPrice) {
      return NextResponse.json({ error: 'Product name and price are required' }, { status: 400 });
    }

    // Find a valid category
    let resolvedCategoryId = categoryId;
    if (!resolvedCategoryId) {
      const firstCat = await prisma.category.findFirst();
      if (!firstCat) {
        return NextResponse.json({ error: 'No categories configured. Contact admin.' }, { status: 500 });
      }
      resolvedCategoryId = firstCat.id;
    }

    const newStatus = submitForReview ? 'SUBMITTED_FOR_REVIEW' : 'DRAFT';

    const product = await (prisma as any).product.create({
      data: {
        makerProfileId: maker.id,
        categoryId: resolvedCategoryId,
        locationId: maker.locationId,
        desiredPrice: parseFloat(desiredPrice),
        inventory: parseInt(inventory) || 1,
        status: newStatus,
        verificationStatus: 'GENERAL',
        primaryImageUrl: primaryImageUrl || null,
        materials: materials || null,
        dimensions: dimensions || null,
        weight: weight || null,
        craftingTimeWeeks: craftingTimeWeeks ? parseInt(craftingTimeWeeks) : null,
        isMadeToOrder: !!isMadeToOrder,
        isOneOfOne: !!isOneOfOne,
        isReadyToShip: isReadyToShip !== false,
        isEcoFriendly: !!isEcoFriendly,
        isHandmade: true,
        translations: {
          create: {
            languageCode: 'en',
            name: name,
            description: description || '',
            story: story || '',
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      product: { id: product.id, status: product.status },
      message: submitForReview
        ? 'Product submitted for CEO catalog review'
        : 'Product saved as draft',
    }, { status: 201 });
  } catch (error) {
    console.error('Maker products POST error:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}

// PATCH /api/maker/products — Update product status (submit for review, etc.)
export async function PATCH(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'MAKER') {
      return NextResponse.json({ error: 'Maker authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const { productId, action, trackingNumber, carrier } = body;

    if (!productId || !action) {
      return NextResponse.json({ error: 'productId and action are required' }, { status: 400 });
    }

    const maker = await (prisma as any).makerProfile.findUnique({
      where: { userId: session.userId }
    });

    const product = await (prisma as any).product.findFirst({
      where: { id: productId, makerProfileId: maker?.id }
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    if (action === 'submit_for_review' && product.status === 'DRAFT') {
      await (prisma as any).product.update({
        where: { id: productId },
        data: { status: 'SUBMITTED_FOR_REVIEW' }
      });
      return NextResponse.json({ success: true, message: 'Submitted for CEO review' });
    }

    return NextResponse.json({ error: 'Invalid action or status transition' }, { status: 400 });
  } catch (error) {
    console.error('Maker products PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}
