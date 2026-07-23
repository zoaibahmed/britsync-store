import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

/**
 * GET /api/support-tickets/[id]
 * Returns a single ticket with replies.
 */
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

    const ticket = await prisma.supportTicket.findUnique({
      where: { id: params.id },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
        replies: {
          orderBy: { createdAt: 'asc' },
          include: { user: { select: { id: true, name: true, role: true } } },
        },
      },
    });

    if (!ticket) return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });

    // RBAC: buyer can only see their own tickets
    if (session.role === 'BUYER' && ticket.userId !== session.userId) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    return NextResponse.json(ticket);
  } catch (error) {
    console.error('Failed to fetch ticket:', error);
    return NextResponse.json({ error: 'Failed to fetch ticket' }, { status: 500 });
  }
}

/**
 * PUT /api/support-tickets/[id]
 * Update ticket status or priority (admin/staff only).
 */
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

    const isStaff = ['ADMIN', 'SUPER_ADMIN'].includes(session.role);
    const { status, priority } = await request.json();

    if (!isStaff) {
      return NextResponse.json({ error: 'Admin authorization required' }, { status: 403 });
    }

    const data: any = {};
    if (status) data.status = status;
    if (priority) data.priority = priority;

    const ticket = await prisma.supportTicket.update({
      where: { id: params.id },
      data,
    });

    return NextResponse.json({ success: true, ticket });
  } catch (error) {
    console.error('Failed to update ticket:', error);
    return NextResponse.json({ error: 'Failed to update ticket' }, { status: 500 });
  }
}
