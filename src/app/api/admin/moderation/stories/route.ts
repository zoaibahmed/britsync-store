import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { logAdminAction } from '@/lib/services/admin.service';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/moderation/stories
 * Returns all artisan stories with moderation state.
 */
export async function GET() {
  try {
    const session = await getSession();
    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const stories = await prisma.makerStory.findMany({
      include: {
        translations: true,
        maker: { select: { businessName: true } },
        village: { include: { translations: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const mapped = stories.map((s) => {
      const trans = s.translations.find((t) => t.languageCode === 'en') || s.translations[0];
      const vilName = s.village.translations.find((t) => t.languageCode === 'en')?.name || 'Artisan Village';

      return {
        id: s.id,
        maker: s.maker?.businessName || 'Artisan',
        title: trans?.title || 'Heritage Story',
        excerpt: trans?.excerpt || '',
        isPublished: s.isPublished,
        village: vilName,
        createdAt: s.createdAt,
      };
    });

    return NextResponse.json(mapped);
  } catch (error) {
    console.error('Failed to fetch stories:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * PUT /api/admin/moderation/stories
 * Toggle story publish status.
 */
export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { storyId, isPublished } = await request.json();
    if (!storyId || typeof isPublished !== 'boolean') {
      return NextResponse.json({ error: 'storyId and isPublished boolean are required' }, { status: 400 });
    }

    const story = await prisma.makerStory.findUnique({ where: { id: storyId } });
    if (!story) return NextResponse.json({ error: 'Story not found' }, { status: 404 });

    const beforeState = { isPublished: story.isPublished };

    const updated = await prisma.makerStory.update({
      where: { id: storyId },
      data: { isPublished },
    });

    await logAdminAction({
      adminUserId: session.userId,
      action: 'MODERATE_STORY',
      tableName: 'MakerStory',
      recordId: storyId,
      beforeState,
      afterState: { isPublished: updated.isPublished },
    });

    return NextResponse.json({ success: true, story: updated });
  } catch (error) {
    console.error('Failed to moderate story:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
