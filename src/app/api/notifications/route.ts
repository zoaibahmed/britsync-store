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

    const notifications = await prisma.notification.findMany({
      where: { recipientUserId: session.userId },
      orderBy: { createdAt: 'desc' }
    });

    // Map to legacy fields if needed (e.g. userId) for frontend backward-compatibility
    const mapped = notifications.map(n => ({
      ...n,
      userId: n.recipientUserId
    }));

    return NextResponse.json(mapped);
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { notificationId } = await request.json();

    if (notificationId) {
      const notif = await prisma.notification.findUnique({
        where: { id: notificationId }
      });
      if (notif && notif.recipientUserId === session.userId) {
        await prisma.notification.update({
          where: { id: notificationId },
          data: { isRead: true }
        });
      }
    } else {
      // Mark all read
      await prisma.notification.updateMany({
        where: { recipientUserId: session.userId, isRead: false },
        data: { isRead: true }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update notifications:', error);
    return NextResponse.json({ error: 'Failed to update notifications' }, { status: 500 });
  }
}
