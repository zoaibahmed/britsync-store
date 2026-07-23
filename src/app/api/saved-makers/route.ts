import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const saved = await prisma.savedMaker.findMany({
      where: { userId: session.userId },
      include: {
        maker: true
      }
    });

    return NextResponse.json(saved);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch saved makers' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { makerId } = await request.json();
    if (!makerId) {
      return NextResponse.json({ error: 'Maker ID is required' }, { status: 400 });
    }

    const saved = await prisma.savedMaker.upsert({
      where: {
        userId_makerId: {
          userId: session.userId,
          makerId
        }
      },
      create: {
        userId: session.userId,
        makerId
      },
      update: {}
    });

    return NextResponse.json({ success: true, saved });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save maker' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const makerId = searchParams.get('makerId');

    if (!makerId) {
      return NextResponse.json({ error: 'Maker ID is required' }, { status: 400 });
    }

    await prisma.savedMaker.delete({
      where: {
        userId_makerId: {
          userId: session.userId,
          makerId
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to unsave maker' }, { status: 500 });
  }
}
