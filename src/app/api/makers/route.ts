import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateSellingPrice } from '@/lib/pricing';

export const dynamic = 'force-dynamic';

function mapMaker(maker: any) {
  const countryName = maker.location?.translations?.find((t: any) => t.languageCode === 'en')?.name || 'Global';
  const coverUrl = maker.coverMedia?.storageKey || null;
  const founderUrl = maker.founderMedia?.storageKey || null;

  return {
    id: maker.id,
    userId: maker.userId,
    businessName: maker.businessName,
    locationId: maker.locationId,
    verificationStatus: maker.verificationStatus,
    yearsInBusiness: maker.yearsInBusiness,
    employeeCount: maker.employeeCount,
    geofence: maker.geofence,
    coverImage: coverUrl,
    founderPhoto: founderUrl,
    createdAt: maker.createdAt,
    updatedAt: maker.updatedAt,
    country: countryName,
    products: maker.products.map((p: any) => {
      const translation = p.translations.find((t: any) => t.languageCode === 'en') || p.translations[0] || {};
      const catName = p.category?.translations?.find((t: any) => t.languageCode === 'en')?.name || 'General';
      const imageUrls = p.mediaMaps.map((m: any) => m.media.storageKey);
      const fallbackList = imageUrls.length > 0 ? imageUrls : [
        "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=800"
      ];

      return {
        id: p.id,
        desiredPrice: p.desiredPrice,
        price: calculateSellingPrice(p.desiredPrice, catName, undefined, p.verificationStatus),
        inventory: p.inventory,
        verificationStatus: p.verificationStatus,
        status: p.status,
        name: translation.name || '',
        description: translation.description || '',
        images: JSON.stringify(fallbackList)
      };
    })
  };
}

export async function GET(request: Request) {
  try {
    const makers = await prisma.makerProfile.findMany({
      include: {
        coverMedia: true,
        founderMedia: true,
        location: {
          include: {
            translations: true
          }
        },
        products: {
          include: {
            category: {
              include: {
                translations: true
              }
            },
            translations: true,
            mediaMaps: {
              include: {
                media: true
              }
            }
          }
        },
      },
    });

    const mappedMakers = makers.map(mapMaker);
    return NextResponse.json(mappedMakers);
  } catch (error) {
    console.error('Failed to fetch makers:', error);
    return NextResponse.json({ error: 'Failed to fetch makers' }, { status: 500 });
  }
}
