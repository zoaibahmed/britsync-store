import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { logAdminAction } from '@/lib/services/admin.service';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/tickets
 * Returns all support tickets.
 */
export async function GET() {
  try {
    const session = await getSession();
    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const tickets = await prisma.supportTicket.findMany({
      include: {
        user: { select: { name: true, email: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const mapped = tickets.map((t) => ({
      id: t.id,
      subject: t.subject,
      description: t.description,
      status: t.status,
      priority: t.priority,
      createdAt: t.createdAt,
      user: {
        name: t.user?.name || 'User',
        email: t.user?.email,
        role: t.user?.role,
      },
    }));

    return NextResponse.json(mapped);
  } catch (error) {
    console.error('Failed to get tickets:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
