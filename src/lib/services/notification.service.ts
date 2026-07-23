/**
 * notification.service.ts
 * Internal service for creating in-app notifications.
 * Never called directly from the client — called from server-side services.
 */
import { prisma } from '@/lib/prisma';

export interface CreateNotificationInput {
  recipientUserId: string;
  title: string;
  message: string;
}

export async function createNotification(
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0] | typeof prisma,
  input: CreateNotificationInput,
): Promise<void> {
  await (tx as any).notification.create({
    data: {
      recipientUserId: input.recipientUserId,
      title: input.title,
      message: input.message,
    },
  });
}
