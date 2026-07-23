import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * GET /api/search/suggestions?q=...
 * Returns search autocomplete suggestions, popular searches, and matched categories/products.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.trim() || '';

    if (!query) {
      // Return popular search terms
      return NextResponse.json({
        popular: ['Ajrak', 'Kilim', 'Ceramics', 'Morocco Leather', 'Silk Shawls'],
        categories: ['Textiles', 'Ceramics', 'Jewelry', 'Woodwork'],
        suggestions: [],
      });
    }

    const [products, categories] = await Promise.all([
      prisma.product.findMany({
        where: {
          status: 'PUBLISHED',
          translations: {
            some: {
              name: { contains: query },
            },
          },
        },
        include: { translations: true },
        take: 5,
      }),
      prisma.category.findMany({
        where: {
          translations: {
            some: {
              name: { contains: query },
            },
          },
        },
        include: { translations: true },
        take: 3,
      }),
    ]);

    const productSug = products.map((p) => {
      const trans = p.translations.find((t) => t.languageCode === 'en') || p.translations[0];
      return {
        id: p.id,
        name: trans?.name || 'Product',
        type: 'product',
      };
    });

    const categorySug = categories.map((c) => {
      const trans = c.translations.find((t) => t.languageCode === 'en') || c.translations[0];
      return {
        id: c.id,
        name: trans?.name || 'Category',
        type: 'category',
      };
    });

    return NextResponse.json({
      popular: [],
      categories: [],
      suggestions: [...categorySug, ...productSug],
    });
  } catch (error) {
    console.error('Failed to get search suggestions:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
