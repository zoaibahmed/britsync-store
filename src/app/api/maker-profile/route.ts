import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== 'MAKER') {
      return NextResponse.json({ error: 'Maker authentication required' }, { status: 401 });
    }

    const maker = await prisma.makerProfile.findUnique({
      where: { userId: session.userId },
      include: {
        user: true,
        coverMedia: true,
        founderMedia: true,
        location: {
          include: {
            translations: true
          }
        },
        products: true,
        stories: true
      }
    });

    if (!maker) {
      return NextResponse.json({ error: 'Maker profile not found' }, { status: 404 });
    }

    const countryName = maker.location?.translations?.find((t: any) => t.languageCode === 'en')?.name || 'Global';

    // Map to legacy fields for frontend compatibility
    const mapped = {
      ...maker,
      country: countryName,
      coverImage: maker.coverMedia?.storageKey || null,
      founderPhoto: maker.founderMedia?.storageKey || null,
      founderName: maker.user?.name || 'Master Artisan',
      founderStory: 'Dedicated to preserving local heritage and craft traditions.',
      businessStory: 'A multi-generational craft workshop.',
      mission: 'To preserve traditional craftsmanship and build a legacy.',
      impactStory: 'Creating sustainable local jobs for rural artisans.',
      workshopGallery: '[]',
      teamPhotos: '[]',
      productionPhotos: '[]',
      lifestylePhotos: '[]'
    };

    return NextResponse.json(mapped);
  } catch (error) {
    console.error('Failed to fetch maker profile:', error);
    return NextResponse.json({ error: 'Failed to fetch maker profile' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'MAKER') {
      return NextResponse.json({ error: 'Maker authentication required' }, { status: 401 });
    }

    const maker = await prisma.makerProfile.findUnique({
      where: { userId: session.userId }
    });

    if (!maker) {
      return NextResponse.json({ error: 'Maker profile not found' }, { status: 404 });
    }

    const body = await request.json();
    const { 
      businessName, 
      employeeCount, 
      yearsInBusiness
    } = body;

    const updatedMaker = await prisma.makerProfile.update({
      where: { id: maker.id },
      data: {
        businessName: businessName || maker.businessName,
        employeeCount: employeeCount ? parseInt(employeeCount) : maker.employeeCount,
        yearsInBusiness: yearsInBusiness ? parseInt(yearsInBusiness) : maker.yearsInBusiness
      }
    });

    // Fetch user and media details to construct response
    const completeMaker = await prisma.makerProfile.findUnique({
      where: { id: updatedMaker.id },
      include: {
        user: true,
        coverMedia: true,
        founderMedia: true,
        location: {
          include: {
            translations: true
          }
        }
      }
    });

    const countryName = completeMaker?.location?.translations?.find((t: any) => t.languageCode === 'en')?.name || 'Global';

    const mapped = {
      ...completeMaker,
      country: countryName,
      coverImage: completeMaker?.coverMedia?.storageKey || null,
      founderPhoto: completeMaker?.founderMedia?.storageKey || null,
      founderName: completeMaker?.user?.name || 'Master Artisan',
      founderStory: 'Dedicated to preserving local heritage and craft traditions.',
      businessStory: 'A multi-generational craft workshop.',
      mission: 'To preserve traditional craftsmanship and build a legacy.',
      impactStory: 'Creating sustainable local jobs for rural artisans.',
      workshopGallery: '[]',
      teamPhotos: '[]',
      productionPhotos: '[]',
      lifestylePhotos: '[]'
    };

    return NextResponse.json({ success: true, maker: mapped });
  } catch (error) {
    console.error('Failed to update maker profile:', error);
    return NextResponse.json({ error: 'Failed to update maker profile' }, { status: 500 });
  }
}
