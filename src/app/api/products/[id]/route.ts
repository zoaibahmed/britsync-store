import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateSellingPrice } from '@/lib/pricing';

export const dynamic = 'force-dynamic';

function mapProduct(product: any) {
  const translation =
    product.translations.find((t: any) => t.languageCode === 'en') ||
    product.translations[0] ||
    {};

  const catName =
    product.category.translations.find((t: any) => t.languageCode === 'en')?.name || 'General';

  const locationName =
    product.location?.translations?.find((t: any) => t.languageCode === 'en')?.name || '';

  const makerLocationName =
    product.maker?.location?.translations?.find((t: any) => t.languageCode === 'en')?.name ||
    product.maker?.location?.locationType ||
    '';

  const imageUrls = product.mediaMaps
    .sort((a: any, b: any) => a.sortOrder - b.sortOrder)
    .map((m: any) => m.media.storageKey);

  const passport = product.passport
    ? {
        id: product.passport.id,
        serial: product.passport.passportSerial,
        events: product.passport.events.map((e: any) => ({
          id: e.id,
          eventType: e.eventType,
          description: e.description,
          eventTimestamp: e.eventTimestamp,
          latitude: e.latitude,
          longitude: e.longitude,
        })),
        signatures: product.passport.signatures.map((s: any) => ({
          role: s.signatureRole,
          signatureHash: s.signatureHash,
          signedAt: s.signedAt,
          signerName: s.signer?.name || 'Unknown',
        })),
      }
    : null;

  const certificate = product.certificates?.[0]
    ? {
        id: product.certificates[0].id,
        certificateNumber: product.certificates[0].certificateNumber,
        certificateType: product.certificates[0].certificateType,
        issueDate: product.certificates[0].issueDate,
        expiryDate: product.certificates[0].expiryDate,
      }
    : null;

  const inspectionReport = product.maker?.inspectionReports?.[0]
    ? {
        qualityScore: product.maker.inspectionReports[0].qualityScore,
        notes: product.maker.inspectionReports[0].notes,
        status: product.maker.inspectionReports[0].status,
        latitude: product.maker.inspectionReports[0].latitude,
        longitude: product.maker.inspectionReports[0].longitude,
        createdAt: product.maker.inspectionReports[0].createdAt,
        digitalSignature: product.maker.inspectionReports[0].digitalSignature,
        inspectorName: product.maker.inspectionReports[0].inspector?.user?.name || 'Britsync Inspector',
        inspectorRegion: product.maker.inspectionReports[0].inspector?.regionScope || '',
      }
    : null;

  const reviews = (product.reviews || [])
    .filter((r: any) => r.moderationStatus === 'APPROVED')
    .map((r: any) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      isVerifiedPurchase: r.isVerifiedPurchase,
      createdAt: r.createdAt,
      buyerName: r.buyer?.name || 'Anonymous',
    }));

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length
      : null;

  return {
    id: product.id,
    makerProfileId: product.makerProfileId,
    categoryId: product.categoryId,
    locationId: product.locationId,
    desiredPrice: product.desiredPrice,
    price: calculateSellingPrice(product.desiredPrice, catName, undefined, product.verificationStatus),
    inventory: product.inventory,
    verificationStatus: product.verificationStatus,
    status: product.status,
    isEcoFriendly: product.isEcoFriendly,
    isWomenLed: product.isWomenLed,
    isHandmade: product.isHandmade,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
    name: translation.name || '',
    description: translation.description || '',
    story: translation.story || '',
    careInstructions: translation.careInstructions || '',
    shippingInfo: translation.shippingInfo || '',
    returnPolicy: translation.returnPolicy || '',
    category: catName,
    images: imageUrls,
    locationName,
    maker: {
      id: product.maker.id,
      businessName: product.maker.businessName,
      yearsInBusiness: product.maker.yearsInBusiness,
      employeeCount: product.maker.employeeCount,
      verificationStatus: product.maker.verificationStatus,
      locationName: makerLocationName,
      coverImage: product.maker.coverMedia?.storageKey || null,
      founderImage: product.maker.founderMedia?.storageKey || null,
    },
    passport,
    certificate,
    inspectionReport,
    reviews,
    averageRating,
    reviewCount: reviews.length,
  };
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  if (!id) {
    return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
  }

  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        maker: {
          include: {
            location: {
              include: { translations: true },
            },
            coverMedia: true,
            founderMedia: true,
            inspectionReports: {
              orderBy: { createdAt: 'desc' },
              take: 1,
              include: {
                inspector: {
                  include: { user: true },
                },
              },
            },
          },
        },
        category: {
          include: { translations: true },
        },
        location: {
          include: { translations: true },
        },
        translations: true,
        mediaMaps: {
          orderBy: { sortOrder: 'asc' },
          include: { media: true },
        },
        passport: {
          include: {
            events: {
              orderBy: { eventTimestamp: 'asc' },
            },
            signatures: {
              include: { signer: true },
            },
          },
        },
        certificates: {
          orderBy: { issueDate: 'desc' },
          take: 1,
        },
        reviews: {
          where: { moderationStatus: 'APPROVED' },
          orderBy: { createdAt: 'desc' },
          take: 20,
          include: { buyer: true },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(mapProduct(product));
  } catch (error) {
    console.error('Failed to fetch product:', error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}
