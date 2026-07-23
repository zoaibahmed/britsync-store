import { prisma } from '@/lib/prisma';

interface LogActionParams {
  adminUserId: string;
  action: string;
  tableName?: string;
  recordId?: string;
  beforeState?: any;
  afterState?: any;
}

/**
 * Log an administrative action to the database.
 */
export async function logAdminAction(params: LogActionParams) {
  try {
    const beforeStateStr = params.beforeState ? JSON.stringify(params.beforeState) : null;
    const afterStateStr = params.afterState ? JSON.stringify(params.afterState) : null;

    return await prisma.adminAction.create({
      data: {
        adminUserId: params.adminUserId,
        action: params.action,
        tableName: params.tableName || null,
        recordId: params.recordId || null,
        beforeState: beforeStateStr,
        afterState: afterStateStr,
      },
    });
  } catch (error) {
    console.error('Failed to log admin action:', error);
  }
}
