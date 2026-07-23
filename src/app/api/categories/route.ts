import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        translations: true
      }
    });

    const mapped = categories.map((c) => {
      const trans = c.translations.find((t) => t.languageCode === 'en') || c.translations[0];
      return {
        id: c.id,
        name: trans?.name || '',
        description: trans?.description || '',
        createdAt: c.createdAt
      };
    });

    // Sort alphabetically by English name
    mapped.sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json(mapped);
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.role)) {
      return NextResponse.json({ error: 'Admin credentials required' }, { status: 403 });
    }

    const { name, description } = await request.json();
    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const category = await prisma.$transaction(async (tx) => {
      const c = await tx.category.create({ data: {} });
      await tx.categoryTranslation.create({
        data: {
          categoryId: c.id,
          languageCode: 'en',
          name,
          description: description || null
        }
      });
      return c;
    });

    return NextResponse.json({
      success: true,
      category: {
        id: category.id,
        name,
        description,
        createdAt: category.createdAt
      }
    });
  } catch (error) {
    console.error('Failed to create category:', error);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}
