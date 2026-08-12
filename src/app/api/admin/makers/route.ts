import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const makers = await prisma.makerProfile.findMany({
      include: {
        user: true,
        location: {
          include: {
            translations: true,
          },
        },
        products: {
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const mappedMakers = makers.map((m) => ({
      id: m.id,
      userId: m.userId,
      businessName: m.businessName,
      founderName: m.user?.name || 'Master Artisan',
      email: m.user?.email || 'N/A',
      verificationStatus: m.verificationStatus,
      yearsInBusiness: m.yearsInBusiness,
      employeeCount: m.employeeCount,
      country: m.location?.translations?.find((t) => t.languageCode === 'en')?.name || 'Global',
      businessStory: `Generational master atelier specializing in heritage handcraft. Custodian ${m.user?.name || 'Artisan'}.`,
      founderStory: `Founded by custodian ${m.user?.name || 'Master Artisan'}.`,
      createdAt: m.createdAt.toISOString(),
      productCount: m.products.length,
    }));

    return NextResponse.json({
      success: true,
      makers: mappedMakers,
    });
  } catch (error) {
    console.error('Fetch Admin Makers Error:', error);
    return NextResponse.json({ error: 'Failed to fetch maker registrations' }, { status: 500 });
  }
}
