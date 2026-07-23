import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET: List conversations with search and filters
export async function GET(request: Request) {
  try {
    const session = await getSession();
    const { searchParams } = new URL(request.url);

    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const mode = searchParams.get('mode') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { sessionId: { contains: search } },
        { messages: { some: { content: { contains: search } } } }
      ];
    }

    if (status) where.status = status;
    if (mode) where.mode = mode;

    const [conversations, total] = await Promise.all([
      prisma.aiConversation.findMany({
        where,
        include: {
          user: {
            select: { id: true, name: true, email: true }
          },
          messages: {
            take: 1,
            orderBy: { createdAt: 'desc' },
            select: { content: true, role: true, createdAt: true }
          },
          _count: {
            select: { messages: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.aiConversation.count({ where })
    ]);

    return NextResponse.json({
      conversations: conversations.map(c => ({
        id: c.id,
        sessionId: c.sessionId,
        mode: c.mode,
        status: c.status,
        priority: 'LOW',
        assignedTo: null,
        subject: 'Nova AI Session',
        userName: c.user?.name || 'Guest',
        userEmail: c.user?.email || null,
        lastMessage: c.messages[0]?.content || '',
        lastMessageAt: c.createdAt,
        messageCount: c._count.messages,
        createdAt: c.createdAt
      })),
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error: any) {
    console.error('Conversations list error:', error.message);
    return NextResponse.json({ error: 'Failed to load conversations' }, { status: 500 });
  }
}
