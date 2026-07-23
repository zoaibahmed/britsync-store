import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    let requests;

    if (session.role === 'ADMIN') {
      requests = await prisma.verificationRequest.findMany({
        include: { maker: true },
        orderBy: { createdAt: 'desc' }
      });
    } else if (session.role === 'MAKER') {
      const maker = await prisma.makerProfile.findUnique({
        where: { userId: session.userId }
      });
      if (!maker) {
        return NextResponse.json({ error: 'Maker profile not found' }, { status: 404 });
      }

      requests = await prisma.verificationRequest.findMany({
        where: { makerProfileId: maker.id },
        orderBy: { createdAt: 'desc' }
      });
    } else {
      return NextResponse.json({ error: 'Unauthorized access to verification requests' }, { status: 403 });
    }

    return NextResponse.json(requests);
  } catch (error) {
    console.error('Failed to fetch verification requests:', error);
    return NextResponse.json({ error: 'Failed to fetch verification requests' }, { status: 500 });
  }
}

export async function POST() {
  try {
    const session = await getSession();
    if (!session || session.role !== 'MAKER') {
      return NextResponse.json({ error: 'Maker credentials required' }, { status: 403 });
    }

    const maker = await prisma.makerProfile.findUnique({
      where: { userId: session.userId }
    });

    if (!maker) {
      return NextResponse.json({ error: 'Maker profile not found' }, { status: 404 });
    }

    // Check if there is already a pending or inspector_assigned verification request
    const existing = await prisma.verificationRequest.findFirst({
      where: {
        makerProfileId: maker.id,
        status: { in: ['PENDING', 'INSPECTOR_ASSIGNED'] }
      }
    });

    if (existing) {
      return NextResponse.json({ error: 'An active verification request is already in progress' }, { status: 400 });
    }

    const newRequest = await prisma.verificationRequest.create({
      data: {
        makerProfileId: maker.id,
        status: 'PENDING'
      }
    });

    return NextResponse.json({
      success: true,
      request: newRequest
    });
  } catch (error) {
    console.error('Failed to create verification request:', error);
    return NextResponse.json({ error: 'Failed to create verification request' }, { status: 500 });
  }
}
