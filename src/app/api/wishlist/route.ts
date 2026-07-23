import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { calculateSellingPrice } from '@/lib/pricing';

function mapWishlistItem(item: any) {
  const p = item.product;
  if (!p) return item;

  const translation = p.translations.find((t: any) => t.languageCode === 'en') || p.translations[0] || {};
  const catName = p.category?.translations?.find((t: any) => t.languageCode === 'en')?.name || 'General';
  const imageUrls = p.mediaMaps.map((m: any) => m.media.storageKey);
  const fallbackList = imageUrls.length > 0 ? imageUrls : [
    "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=800"
  ];

  return {
    id: item.id,
    wishlistId: item.wishlistId,
    productId: item.productId,
    createdAt: item.createdAt,
    product: {
      id: p.id,
      desiredPrice: p.desiredPrice,
      price: calculateSellingPrice(p.desiredPrice, catName, undefined, p.verificationStatus),
      inventory: p.inventory,
      verificationStatus: p.verificationStatus,
      status: p.status,
      name: translation.name || '',
      description: translation.description || '',
      images: JSON.stringify(fallbackList),
      maker: p.maker
    }
  };
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    let wishlist = await prisma.wishlist.findUnique({
      where: { buyerUserId: session.userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                maker: true,
                translations: true,
                category: {
                  include: {
                    translations: true
                  }
                },
                mediaMaps: {
                  include: {
                    media: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!wishlist) {
      wishlist = await prisma.wishlist.create({
        data: { buyerUserId: session.userId },
        include: {
          items: {
            include: {
              product: {
                include: {
                  maker: true,
                  translations: true,
                  category: {
                    include: {
                      translations: true
                    }
                  },
                  mediaMaps: {
                    include: {
                      media: true
                    }
                  }
                }
              }
            }
          }
        }
      });
    }

    const mappedItems = wishlist.items.map(mapWishlistItem);
    return NextResponse.json(mappedItems);
  } catch (error) {
    console.error('Failed to fetch wishlist:', error);
    return NextResponse.json({ error: 'Failed to fetch wishlist' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { productId } = await request.json();
    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    let wishlist = await prisma.wishlist.findUnique({
      where: { buyerUserId: session.userId }
    });

    if (!wishlist) {
      wishlist = await prisma.wishlist.create({
        data: { buyerUserId: session.userId }
      });
    }

    const item = await prisma.wishlistItem.upsert({
      where: {
        wishlistId_productId: {
          wishlistId: wishlist.id,
          productId
        }
      },
      create: {
        wishlistId: wishlist.id,
        productId
      },
      update: {}
    });

    return NextResponse.json({ success: true, item });
  } catch (error) {
    console.error('Failed to add to wishlist:', error);
    return NextResponse.json({ error: 'Failed to add item to wishlist' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const wishlist = await prisma.wishlist.findUnique({
      where: { buyerUserId: session.userId }
    });

    if (!wishlist) {
      return NextResponse.json({ error: 'Wishlist not found' }, { status: 404 });
    }

    await prisma.wishlistItem.delete({
      where: {
        wishlistId_productId: {
          wishlistId: wishlist.id,
          productId
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to remove from wishlist:', error);
    return NextResponse.json({ error: 'Failed to remove item from wishlist' }, { status: 500 });
  }
}
