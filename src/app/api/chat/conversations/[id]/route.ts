import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET: Get conversation details with messages
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const conversation = await prisma.aiConversation.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: conversation.id,
      sessionId: conversation.sessionId,
      mode: conversation.mode,
      status: conversation.status,
      priority: 'LOW',
      assignedTo: null,
      subject: 'Nova AI Session',
      user: conversation.user,
      messages: conversation.messages.map((m: any) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        createdAt: m.createdAt
      })),
      lastMessageAt: conversation.createdAt,
      createdAt: conversation.createdAt,
      updatedAt: conversation.createdAt
    });
  } catch (error: any) {
    console.error('Conversation detail error:', error.message);
    return NextResponse.json({ error: 'Failed to load conversation' }, { status: 500 });
  }
}

// PUT: Update conversation (status, priority, assignedTo)
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { status } = body;

    const updateData: any = {};
    if (status) updateData.status = status;

    let conversation = null;
    if (Object.keys(updateData).length > 0) {
      conversation = await prisma.aiConversation.update({
        where: { id: params.id },
        data: updateData
      });
    } else {
      conversation = await prisma.aiConversation.findUnique({
        where: { id: params.id }
      });
    }

    return NextResponse.json({ success: true, conversation });
  } catch (error: any) {
    console.error('Conversation update error:', error.message);
    return NextResponse.json({ error: 'Failed to update conversation' }, { status: 500 });
  }
}
