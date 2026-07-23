import { prisma } from '@/lib/prisma';
import { calculateSellingPrice } from '@/lib/pricing';

export interface ComparisonResult {
  products: {
    id: string;
    name: string;
    price: number;
    finalPrice: number;
    category: string;
    country: string;
    verificationStatus: string;
    isEcoFriendly: boolean;
    isWomenLed: boolean;
    isHandmade: boolean;
    imageUrl: string;
    maker: string;
    rating: number;
    reviewCount: number;
  }[];
  summary: string;
}

/**
 * Compare two or more products by ID.
 */
export async function compareProducts(productIds: string[]): Promise<ComparisonResult | null> {
  if (productIds.length < 2 || productIds.length > 4) {
    return null;
  }

  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    include: {
      category: {
        include: {
          translations: true
        }
      },
      location: {
        include: {
          translations: true,
          parent: {
            include: {
              translations: true
            }
          }
        }
      },
      translations: true,
      maker: { select: { businessName: true } },
      mediaMaps: {
        include: {
          media: true
        }
      },
      reviews: { select: { rating: true } }
    }
  });

  if (products.length < 2) return null;

  const comparisonProducts = products.map(p => {
    const translation = p.translations.find((t: any) => t.languageCode === 'en') || p.translations[0] || {};
    const catName = p.category?.translations.find((t: any) => t.languageCode === 'en')?.name || 'General';
    
    // Country comes from the village location's parent node (which represents the country)
    const countryName = p.location?.parent?.translations.find((t: any) => t.languageCode === 'en')?.name || 'Global';
    
    const avgRating = p.reviews.length > 0
      ? p.reviews.reduce((sum, r) => sum + r.rating, 0) / p.reviews.length
      : 0;

    const imgUrl = p.mediaMaps[0]?.media?.storageKey || '';

    return {
      id: p.id,
      name: translation.name || 'Product',
      price: p.desiredPrice,
      finalPrice: calculateSellingPrice(p.desiredPrice, catName, countryName, p.verificationStatus),
      category: catName,
      country: countryName,
      verificationStatus: p.verificationStatus,
      isEcoFriendly: p.isEcoFriendly,
      isWomenLed: p.isWomenLed,
      isHandmade: p.isHandmade,
      imageUrl: imgUrl,
      maker: p.maker?.businessName || 'Unknown Maker',
      rating: Math.round(avgRating * 10) / 10,
      reviewCount: p.reviews.length
    };
  });

  // Generate comparison summary
  const cheapest = comparisonProducts.reduce((min, p) => p.finalPrice < min.finalPrice ? p : min);
  const highestRated = comparisonProducts.reduce((max, p) => p.rating > max.rating ? p : max);
  const mostReviewed = comparisonProducts.reduce((max, p) => p.reviewCount > max.reviewCount ? p : max);

  let summary = `### 📊 Product Comparison\n\n`;
  summary += `* **Best Price:** ${cheapest.name} (£${cheapest.finalPrice.toFixed(2)})\n`;
  summary += `* **Highest Rated:** ${highestRated.name} (${highestRated.rating}★)\n`;
  summary += `* **Most Reviewed:** ${mostReviewed.name} (${mostReviewed.reviewCount} reviews)\n\n`;

  // Feature comparison
  const features = ['isEcoFriendly', 'isWomenLed', 'isHandmade'] as const;
  const featureLabels = { isEcoFriendly: 'Eco-Friendly', isWomenLed: 'Women-Led', isHandmade: 'Handmade' };

  summary += `#### Feature Comparison\n`;
  features.forEach(feature => {
    const hasFeature = comparisonProducts.filter(p => p[feature]).map(p => p.name);
    if (hasFeature.length > 0) {
      summary += `* **${featureLabels[feature]}:** ${hasFeature.join(', ')}\n`;
    }
  });

  // Verification tiers
  const tiers = comparisonProducts.map(p => `* ${p.name}: **${p.verificationStatus}**`).join('\n');
  summary += `\n#### Verification Tiers\n${tiers}\n`;

  return { products: comparisonProducts, summary };
}

/**
 * Parse comparison request from chat message.
 */
export function parseComparisonRequest(message: string): string[] | null {
  const lower = message.toLowerCase();

  // Check for comparison keywords
  if (!lower.includes('compare') && !lower.includes('comparison') && !lower.includes('vs') && !lower.includes('versus')) {
    return null;
  }

  // Try to extract product IDs (BS-XXXXXX format or UUID)
  const idMatches = message.match(/BS-[A-F0-9-]{6,}/gi) || message.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi);

  if (idMatches && idMatches.length >= 2) {
    return idMatches.slice(0, 4); // Max 4 products
  }

  return null;
}
