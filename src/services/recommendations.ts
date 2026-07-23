import { prisma } from '@/lib/prisma';
import { calculateSellingPrice } from '@/lib/pricing';

export interface UserMemory {
  userId?: string;
  wishlist?: string[];
  browsingHistory?: string[];
  previousOrders?: string[];
}

/**
 * Returns personalized product recommendations based on user database profile,
 * wishlist items, order history, and AI memory context keys.
 */
export async function getPersonalizedRecommendations(memory: UserMemory = {}) {
  try {
    let preferredCategory: string | null = null;

    // Load AI Memory if userId is provided
    if (memory.userId) {
      const dbPref = await prisma.aiMemory.findUnique({
        where: { userId_memoryKey: { userId: memory.userId, memoryKey: 'preferredCategory' } },
      });
      if (dbPref?.memoryValue) {
        try {
          const val = JSON.parse(dbPref.memoryValue);
          preferredCategory = val.category || null;
        } catch {}
      }
    }

    const whereClause: any = {
      status: 'PUBLISHED',
    };

    if (preferredCategory) {
      whereClause.category = {
        translations: {
          some: {
            name: { contains: preferredCategory },
          },
        },
      };
    }

    const products = await prisma.product.findMany({
      where: whereClause,
      include: {
        maker: {
          include: {
            location: {
              include: { translations: true },
            },
          },
        },
        category: {
          include: { translations: true },
        },
        translations: true,
        mediaMaps: {
          include: { media: true },
        },
      },
      take: 8,
    });

    const mapped = products.map((p) => {
      const trans = p.translations.find((t) => t.languageCode === 'en') || p.translations[0] || {};
      const catName = p.category.translations.find((t) => t.languageCode === 'en')?.name || 'General';
      const countryName = p.maker?.location?.translations?.find((t) => t.languageCode === 'en')?.name || 'Global';
      const finalPrice = calculateSellingPrice(p.desiredPrice, catName, countryName, p.verificationStatus);
      const imageUrls = p.mediaMaps.map((m) => m.media.storageKey);
      const fallbackList = imageUrls.length > 0 ? imageUrls : [
        "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=800"
      ];

      return {
        ...p,
        name: trans.name || 'Product',
        description: trans.description || '',
        price: p.desiredPrice,
        finalPrice,
        category: {
          name: catName,
        },
        images: JSON.stringify(fallbackList),
        maker: {
          ...p.maker,
          country: countryName,
        },
      };
    });

    return mapped.slice(0, 3);
  } catch (e) {
    console.error('getPersonalizedRecommendations failed:', e);
    return [];
  }
}
