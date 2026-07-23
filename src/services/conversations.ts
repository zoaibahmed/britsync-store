import { prisma } from '@/lib/prisma';

export interface ConversationMessage {
  role: 'user' | 'assistant' | 'agent' | 'system';
  content: string;
}

/**
 * Get or create a conversation for the current session.
 */
export async function getOrCreateConversation(
  sessionId: string,
  userId: string | null,
  mode: string
) {
  let conversation = await prisma.aiConversation.findUnique({
    where: { sessionId }
  });

  if (!conversation) {
    conversation = await prisma.aiConversation.create({
      data: {
        sessionId,
        userId,
        mode,
        status: 'ACTIVE'
      }
    });
  }

  return conversation;
}

/**
 * Add a message to a conversation.
 */
export async function addConversationMessage(
  conversationId: string,
  role: string,
  content: string
) {
  const message = await prisma.aiMessage.create({
    data: {
      aiConversationId: conversationId,
      role,
      content
    }
  });

  return message;
}

/**
 * Get conversation messages.
 */
export async function getConversationMessages(conversationId: string) {
  return prisma.aiMessage.findMany({
    where: { aiConversationId: conversationId },
    orderBy: { createdAt: 'asc' }
  });
}
