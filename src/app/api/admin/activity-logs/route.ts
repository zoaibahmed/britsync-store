import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/activity-logs
 * Returns list of admin actions logs.
 */
export async function GET() {
  try {
    const session = await getSession();
    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const logs = await prisma.adminAction.findMany({
      include: {
        adminUser: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 200, // Limit to recent 200
    });

    const mapped = logs.map((l) => ({
      id: l.id,
      adminName: l.adminUser?.name || 'Admin',
      adminEmail: l.adminUser?.email,
      action: l.action,
      tableName: l.tableName,
      recordId: l.recordId,
      beforeState: l.beforeState,
      afterState: l.afterState,
      createdAt: l.createdAt,
    }));

    return NextResponse.json(mapped);
  } catch (error) {
    console.error('Failed to get activity logs:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
