import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET: Export conversations as CSV
export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || '';
    const mode = searchParams.get('mode') || '';

    const where: any = {};
    if (status) where.status = status;
    if (mode) where.mode = mode;

    const conversations = await prisma.aiConversation.findMany({
      where,
      include: {
        user: {
          select: { name: true, email: true }
        },
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Build CSV
    const headers = ['ID', 'Session ID', 'Mode', 'Status', 'Priority', 'User Name', 'User Email', 'Subject', 'Message Count', 'Created At', 'Last Message At'];
    const rows = conversations.map(c => {
      const lastMsgAt = c.messages[c.messages.length - 1]?.createdAt || c.createdAt;
      return [
        c.id,
        c.sessionId,
        c.mode,
        c.status,
        'LOW',
        c.user?.name || 'Guest',
        c.user?.email || '',
        'Nova AI Session',
        c.messages.length.toString(),
        c.createdAt.toISOString(),
        lastMsgAt.toISOString()
      ];
    });

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="chat-conversations-${new Date().toISOString().split('T')[0]}.csv"`
      }
    });
  } catch (error: any) {
    console.error('Export error:', error.message);
    return NextResponse.json({ error: 'Failed to export conversations' }, { status: 500 });
  }
}
