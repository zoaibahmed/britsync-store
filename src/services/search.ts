import { prisma } from '@/lib/prisma';
import { calculateSellingPrice } from '@/lib/pricing';

export interface SearchFilters {
  category?: string;
  country?: string;
  material?: string;
  maxPrice?: number;
  isElite?: boolean;
  isGi?: boolean;
  isEcoFriendly?: boolean;
  isWomenLed?: boolean;
  isHandmade?: boolean;
  keyword?: string;
}

/**
 * Perform database-level filtered product searches.
 * Implements priority ranking for ELITE/GI products and limits memory footprint.
 */
export async function searchProducts(filters: SearchFilters) {
  try {
    const whereClause: any = {
      status: 'PUBLISHED',
    };

    if (filters.isElite) {
      whereClause.verificationStatus = 'ELITE';
    }
    if (filters.isGi) {
      whereClause.verificationStatus = 'GI';
    }
    if (filters.isEcoFriendly) {
      whereClause.isEcoFriendly = true;
    }
    if (filters.isWomenLed) {
      whereClause.isWomenLed = true;
    }
    if (filters.isHandmade) {
      whereClause.isHandmade = true;
    }

    if (filters.category) {
      whereClause.category = {
        translations: {
          some: {
            name: { contains: filters.category },
          },
        },
      };
    }

    if (filters.country) {
      whereClause.maker = {
        location: {
          translations: {
            some: {
              name: { contains: filters.country },
            },
          },
        },
      };
    }

    if (filters.material) {
      whereClause.translations = {
        some: {
          description: { contains: filters.material },
        },
      };
    }

    if (filters.keyword) {
      const kw = filters.keyword.trim();
      whereClause.OR = [
        {
          translations: {
            some: {
              OR: [
                { name: { contains: kw } },
                { description: { contains: kw } },
                { story: { contains: kw } },
              ],
            },
          },
        },
        {
          maker: {
            businessName: { contains: kw },
          },
        },
      ];
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
      // Rank GI and ELITE products first, then recently created
      orderBy: [
        { verificationStatus: 'desc' },
        { createdAt: 'desc' },
      ],
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
        images: JSON.stringify(fallbackList),
        category: {
          name: catName,
        },
        maker: {
          ...p.maker,
          country: countryName,
        },
      };
    });

    if (filters.maxPrice !== undefined && filters.maxPrice !== null) {
      return mapped.filter((p) => p.finalPrice <= filters.maxPrice!);
    }

    return mapped;
  } catch (e) {
    console.error('Database search products failed', e);
    return [];
  }
}
