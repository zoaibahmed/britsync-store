import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    let tickets;

    if (['ADMIN', 'SUPER_ADMIN'].includes(session.role)) {
      tickets = await prisma.supportTicket.findMany({
        include: { user: { select: { id: true, name: true, email: true, role: true } } },
        orderBy: { createdAt: 'desc' }
      });
    } else {
      tickets = await prisma.supportTicket.findMany({
        where: { userId: session.userId },
        orderBy: { createdAt: 'desc' }
      });
    }

    return NextResponse.json(tickets);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch tickets' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { subject, description } = await request.json();
    if (!subject || !description) {
      return NextResponse.json({ error: 'Subject and description are required' }, { status: 400 });
    }

    const ticket = await prisma.supportTicket.create({
      data: {
        userId: session.userId,
        subject,
        description,
        status: 'OPEN'
      }
    });

    return NextResponse.json({ success: true, ticket });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to open ticket' }, { status: 500 });
  }
}
