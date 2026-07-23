import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

function mapStory(story: any) {
  const translation = story.translations.find((t: any) => t.languageCode === 'en') || story.translations[0] || {};
  const villageName = story.village?.translations.find((t: any) => t.languageCode === 'en')?.name || 'Craft Village';
  const countryName = story.village?.parent?.translations.find((t: any) => t.languageCode === 'en')?.name || 'Global';

  return {
    id: story.id,
    makerId: story.makerProfileId,
    title: translation.title || '',
    excerpt: translation.excerpt || '',
    content: translation.content || '',
    craft: translation.craftType || '',
    heroImage: story.heroMedia?.storageKey || 'https://images.unsplash.com/photo-1544256718-3bcf237f3974?auto=format&fit=crop&q=80&w=1200',
    village: villageName,
    country: countryName,
    maker: story.maker
  };
}

export async function GET() {
  try {
    const stories = await prisma.makerStory.findMany({
      include: {
        maker: true,
        translations: true,
        heroMedia: true,
        village: {
          include: {
            translations: true,
            parent: {
              include: {
                translations: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const mappedStories = stories.map(mapStory);
    return NextResponse.json(mappedStories);
  } catch (error) {
    console.error('Failed to fetch stories:', error);
    return NextResponse.json({ error: 'Failed to fetch stories' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || !['ADMIN', 'SUPER_ADMIN', 'MAKER'].includes(session.role)) {
      return NextResponse.json({ error: 'Authorized credentials required' }, { status: 403 });
    }

    const body = await request.json();
    const { title, excerpt, content, country, village, craft, heroImage, makerId } = body;

    if (!title || !excerpt || !content || !country || !village || !craft || !heroImage) {
      return NextResponse.json({ error: 'Missing required story fields' }, { status: 400 });
    }

    let targetMakerId = makerId;

    if (session.role === 'MAKER') {
      const maker = await prisma.makerProfile.findUnique({
        where: { userId: session.userId }
      });
      if (!maker) {
        return NextResponse.json({ error: 'Maker profile not found' }, { status: 404 });
      }
      targetMakerId = maker.id;
    }

    if (!targetMakerId) {
      return NextResponse.json({ error: 'Maker ID is required' }, { status: 400 });
    }

    // Check if MakerStory already exists for this maker (since it is a 1-to-1 relationship)
    const existingStory = await prisma.makerStory.findUnique({
      where: { makerProfileId: targetMakerId }
    });

    if (existingStory) {
      // Return success but update existing translation/media instead of crashing, or reject
      return NextResponse.json({ error: 'A story already exists for this maker profile' }, { status: 400 });
    }

    const story = await prisma.$transaction(async (tx) => {
      // Find the maker to get their location
      const makerProfile = await tx.makerProfile.findUnique({
        where: { id: targetMakerId }
      });
      if (!makerProfile) throw new Error('Maker profile not found');

      // Create Media for hero image
      const media = await tx.media.create({
        data: {
          originalFilename: 'hero_image.jpg',
          mimeType: 'image/jpeg',
          fileSize: 250000,
          storageKey: heroImage
        }
      });

      // Create MakerStory
      const s = await tx.makerStory.create({
        data: {
          makerProfileId: targetMakerId,
          villageId: makerProfile.locationId, // Default to maker's location
          heroMediaId: media.id,
          isPublished: true
        }
      });

      // Create translation record
      await tx.storyTranslation.create({
        data: {
          makerStoryId: s.id,
          languageCode: 'en',
          title,
          excerpt,
          content,
          craftType: craft
        }
      });

      return s;
    });

    // Fetch complete story to return
    const completeStory = await prisma.makerStory.findUnique({
      where: { id: story.id },
      include: {
        maker: true,
        translations: true,
        heroMedia: true,
        village: {
          include: {
            translations: true,
            parent: {
              include: {
                translations: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json({ success: true, story: mapStory(completeStory) });
  } catch (error) {
    console.error('Failed to create story:', error);
    return NextResponse.json({ error: 'Failed to create story' }, { status: 500 });
  }
}
