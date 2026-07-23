import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET: Fetch chat history for authenticated user
export async function GET(request: Request) {
  try {
    const session = await getSession();
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('mode') || 'shopping';

    if (!session) {
      // Return empty history for guests (they use localStorage)
      return NextResponse.json({ history: [] });
    }

    const conversation = await prisma.aiConversation.findFirst({
      where: {
        userId: session.userId,
        mode
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const history = conversation ? conversation.messages.map(m => ({
      id: m.id,
      role: m.role,
      content: m.content,
      timestamp: m.createdAt
    })) : [];

    return NextResponse.json({ history });
  } catch (error: any) {
    console.error('Chat history GET error:', error.message);
    return NextResponse.json({ history: [] });
  }
}

// POST: Save chat history for authenticated user
export async function POST(request: Request) {
  try {
    const session = await getSession();
    const { mode, history } = await request.json();

    if (!session) {
      // Guests use localStorage only
      return NextResponse.json({ success: true });
    }

    // Find or create active conversation
    let conversation = await prisma.aiConversation.findFirst({
      where: {
        userId: session.userId,
        mode
      },
      orderBy: { createdAt: 'desc' }
    });

    if (!conversation) {
      conversation = await prisma.aiConversation.create({
        data: {
          userId: session.userId,
          sessionId: `sess-${session.userId.slice(0, 8)}-${mode}-${Date.now()}`,
          mode,
          status: 'ACTIVE'
        }
      });
    }

    // Delete existing messages in this conversation
    await prisma.aiMessage.deleteMany({
      where: {
        aiConversationId: conversation.id
      }
    });

    // Insert new history (skip welcome messages)
    const messagesToSave = history.filter((h: any) => 
      h.content && h.content.trim() !== '' && !h.id.startsWith('welcome-')
    );

    if (messagesToSave.length > 0) {
      await prisma.aiMessage.createMany({
        data: messagesToSave.map((m: any) => ({
          aiConversationId: conversation.id,
          role: m.role,
          content: m.content
        }))
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Chat history POST error:', error.message);
    return NextResponse.json({ error: 'Failed to save history' }, { status: 500 });
  }
}
