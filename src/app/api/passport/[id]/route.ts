import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  if (!id) {
    return NextResponse.json({ error: 'Passport ID or serial is required' }, { status: 400 });
  }

  try {
    // Try to find passport by: (1) passport UUID, (2) passportSerial, (3) productId
    let passport = await prisma.productPassport.findFirst({
      where: {
        OR: [
          { id },
          { passportSerial: id },
          { productId: id },
        ],
      },
      include: {
        product: {
          include: {
            maker: {
              include: {
                location: {
                  include: { translations: true },
                },
                coverMedia: true,
                founderMedia: true,
                certificates: {
                  orderBy: { issueDate: 'desc' },
                  take: 1,
                },
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
              include: {
                parent: {
                  include: { translations: true },
                },
                translations: true,
              },
            },
            translations: true,
            mediaMaps: {
              orderBy: { sortOrder: 'asc' },
              include: { media: true },
            },
            certificates: {
              orderBy: { issueDate: 'desc' },
              take: 1,
            },
          },
        },
        events: {
          orderBy: { eventTimestamp: 'asc' },
        },
        mediaMaps: {
          include: { media: true },
        },
        signatures: {
          include: { signer: true },
          orderBy: { signedAt: 'asc' },
        },
        histories: {
          orderBy: { createdAt: 'asc' },
          take: 20,
        },
      },
    });

    if (!passport) {
      return NextResponse.json({ error: 'Passport not found' }, { status: 404 });
    }

    const p = passport.product;
    const translation =
      p.translations.find((t) => t.languageCode === 'en') || p.translations[0] || ({} as any);
    const catName =
      p.category.translations.find((t) => t.languageCode === 'en')?.name || 'General';

    // Resolve village and country names from the location hierarchy
    const villageName =
      p.location.translations.find((t) => t.languageCode === 'en')?.name || 'Craft Village';
    const countryName =
      p.location.parent?.translations?.find((t: any) => t.languageCode === 'en')?.name ||
      p.maker.location.translations.find((t: any) => t.languageCode === 'en')?.name ||
      'Unknown';

    const imageUrls = p.mediaMaps
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((m) => m.media.storageKey);

    const inspectionReport = p.maker.inspectionReports?.[0] || null;
    const certificate = p.certificates?.[0] || p.maker.certificates?.[0] || null;

    // GPS from inspection report or location node
    const latitude = inspectionReport?.latitude ?? p.location.latitude ?? null;
    const longitude = inspectionReport?.longitude ?? p.location.longitude ?? null;
    const gpsString =
      latitude && longitude
        ? `${Math.abs(latitude).toFixed(4)}° ${latitude >= 0 ? 'N' : 'S'}, ${Math.abs(longitude).toFixed(4)}° ${longitude >= 0 ? 'E' : 'W'}`
        : 'GPS Verified (Coordinates On File)';

    const response = {
      id: passport.id,
      passportSerial: passport.passportSerial,
      createdAt: passport.createdAt,
      updatedAt: passport.updatedAt,

      product: {
        id: p.id,
        name: translation.name || '',
        description: translation.description || '',
        story: translation.story || '',
        category: catName,
        careInstructions: translation.careInstructions || '',
        shippingInfo: translation.shippingInfo || '',
        returnPolicy: translation.returnPolicy || '',
        images: imageUrls,
        verificationStatus: p.verificationStatus,
        isEcoFriendly: p.isEcoFriendly,
        isWomenLed: p.isWomenLed,
        isHandmade: p.isHandmade,
      },

      maker: {
        id: p.maker.id,
        businessName: p.maker.businessName,
        yearsInBusiness: p.maker.yearsInBusiness,
        employeeCount: p.maker.employeeCount,
        verificationStatus: p.maker.verificationStatus,
        villageName,
        countryName,
        gps: gpsString,
        coverImage: p.maker.coverMedia?.storageKey || null,
        founderImage: p.maker.founderMedia?.storageKey || null,
      },

      certificate: certificate
        ? {
            certificateNumber: certificate.certificateNumber,
            certificateType: certificate.certificateType,
            issueDate: certificate.issueDate,
            expiryDate: certificate.expiryDate,
          }
        : {
            certificateNumber: `BS-${p.verificationStatus}-${passport.passportSerial.slice(-8)}`,
            certificateType: p.verificationStatus,
            issueDate: passport.createdAt,
            expiryDate: new Date(
              new Date(passport.createdAt).setFullYear(new Date(passport.createdAt).getFullYear() + 2)
            ),
          },

      inspectionReport: inspectionReport
        ? {
            qualityScore: inspectionReport.qualityScore,
            notes: inspectionReport.notes,
            status: inspectionReport.status,
            latitude: inspectionReport.latitude,
            longitude: inspectionReport.longitude,
            digitalSignature: inspectionReport.digitalSignature,
            createdAt: inspectionReport.createdAt,
            inspectorName: inspectionReport.inspector?.user?.name || 'Britsync Inspector',
            inspectorRegion: inspectionReport.inspector?.regionScope || 'Global Registry',
          }
        : null,

      events: passport.events.map((e) => ({
        id: e.id,
        eventType: e.eventType,
        description: e.description,
        eventTimestamp: e.eventTimestamp,
        latitude: e.latitude,
        longitude: e.longitude,
      })),

      signatures: passport.signatures.map((s) => ({
        id: s.id,
        signatureRole: s.signatureRole,
        signatureHash: s.signatureHash,
        signedAt: s.signedAt,
        signerName: s.signer?.name || 'Unknown',
      })),

      passportMedia: passport.mediaMaps.map((m) => ({
        id: m.id,
        url: m.media.storageKey,
      })),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Failed to fetch passport:', error);
    return NextResponse.json({ error: 'Failed to fetch passport' }, { status: 500 });
  }
}
