import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

/**
 * GET /api/notifications/unread-count
 * Returns { count: number } of unread notifications for the authenticated user.
 */
export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ count: 0 });

    const count = await prisma.notification.count({
      where: { recipientUserId: session.userId, isRead: false },
    });

    return NextResponse.json({ count });
  } catch (error) {
    return NextResponse.json({ count: 0 });
  }
}
