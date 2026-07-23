import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(50, parseInt(searchParams.get('limit') || '12'));
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const skip = (page - 1) * limit;

  try {
    const [passports, total] = await Promise.all([
      prisma.productPassport.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          product: {
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
                orderBy: { sortOrder: 'asc' },
                take: 1,
                include: { media: true },
              },
            },
          },
        },
      }),
      prisma.productPassport.count(),
    ]);

    const mapped = passports.map((pp) => {
      const p = pp.product;
      const translation =
        p.translations.find((t) => t.languageCode === 'en') || p.translations[0] || ({} as any);
      const catName =
        p.category.translations.find((t) => t.languageCode === 'en')?.name || 'General';
      const locationName =
        p.maker.location.translations.find((t: any) => t.languageCode === 'en')?.name || '';

      const tierLabel =
        p.verificationStatus === 'GI'
          ? 'Protected Appellation'
          : p.verificationStatus === 'ELITE'
          ? 'Elite Verified Studio'
          : 'Verified Maker';

      return {
        id: pp.id,
        passportSerial: pp.passportSerial,
        productId: p.id,
        productName: translation.name || '',
        makerName: p.maker.businessName,
        locationName,
        category: catName,
        verificationStatus: p.verificationStatus,
        tierLabel,
        heroImage: p.mediaMaps[0]?.media.storageKey || null,
        createdAt: pp.createdAt,
      };
    });

    return NextResponse.json({
      passports: mapped,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Failed to fetch passports:', error);
    return NextResponse.json({ error: 'Failed to fetch passports' }, { status: 500 });
  }
}
