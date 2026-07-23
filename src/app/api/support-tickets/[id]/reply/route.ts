import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

/**
 * POST /api/support-tickets/[id]/reply
 * Add a reply to a support ticket.
 * Buyers can reply to their own tickets; admins/staff can reply to any ticket.
 */
export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

    const { message } = await request.json();
    if (!message?.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const ticket = await prisma.supportTicket.findUnique({ where: { id: params.id } });
    if (!ticket) return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });

    const isStaff = ['ADMIN', 'SUPER_ADMIN'].includes(session.role);

    // Buyers can only reply to their own tickets
    if (!isStaff && ticket.userId !== session.userId) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    // Cannot reply to closed tickets
    if (ticket.status === 'CLOSED') {
      return NextResponse.json({ error: 'Cannot reply to a closed ticket' }, { status: 400 });
    }

    const reply = await prisma.$transaction(async (tx) => {
      const newReply = await tx.supportTicketReply.create({
        data: {
          ticketId: params.id,
          userId: session.userId,
          message: message.trim(),
          isStaff,
        },
        include: { user: { select: { id: true, name: true, role: true } } },
      });

      // If staff replied, mark ticket as IN_PROGRESS
      if (isStaff && ticket.status === 'OPEN') {
        await tx.supportTicket.update({
          where: { id: params.id },
          data: { status: 'IN_PROGRESS' },
        });

        // Notify the buyer
        await tx.notification.create({
          data: {
            recipientUserId: ticket.userId,
            title: '📩 Support Team Replied',
            message: `A support agent has replied to your ticket: "${ticket.subject}"`,
          },
        });
      }

      return newReply;
    });

    return NextResponse.json({ success: true, reply });
  } catch (error) {
    console.error('Failed to add reply:', error);
    return NextResponse.json({ error: 'Failed to add reply' }, { status: 500 });
  }
}

/**
 * GET /api/support-tickets/[id]/reply
 * Returns all replies for a ticket.
 */
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

    const replies = await prisma.supportTicketReply.findMany({
      where: { ticketId: params.id },
      orderBy: { createdAt: 'asc' },
      include: { user: { select: { id: true, name: true, role: true } } },
    });

    return NextResponse.json(replies);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch replies' }, { status: 500 });
  }
}
