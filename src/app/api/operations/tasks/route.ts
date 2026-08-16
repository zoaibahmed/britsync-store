import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession, STAFF_ROLES } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !STAFF_ROLES.includes(session.role)) {
      return NextResponse.json({ error: 'Staff authorization required' }, { status: 403 });
    }

    // Role-scoped tasks
    let whereClause: any = { status: { in: ['OPEN', 'IN_PROGRESS'] } };

    if (!['CEO', 'SUPER_ADMIN', 'ADMIN'].includes(session.role)) {
      whereClause.targetRole = session.role;
    }

    const tasks = await (prisma as any).operationTask.findMany({
      where: whereClause,
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ],
      take: 50,
    });

    const mappedTasks = tasks.map((t: any) => ({
      id: t.id,
      taskType: t.taskType,
      targetRole: t.targetRole,
      referenceId: t.referenceId,
      title: t.title,
      description: t.description,
      priority: t.priority,
      status: t.status,
      dueDate: t.dueDate,
      createdAt: t.createdAt,
    }));

    return NextResponse.json({
      success: true,
      role: session.role,
      tasks: mappedTasks,
      totalCount: mappedTasks.length,
    });
  } catch (error) {
    console.error('Fetch Operations Tasks Error:', error);
    return NextResponse.json({ error: 'Failed to fetch operational tasks' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || !STAFF_ROLES.includes(session.role)) {
      return NextResponse.json({ error: 'Staff authorization required' }, { status: 403 });
    }

    const body = await request.json();
    const { taskId, action } = body;

    if (!taskId || !action) {
      return NextResponse.json({ error: 'taskId and action are required' }, { status: 400 });
    }

    if (action === 'RESOLVE') {
      await (prisma as any).operationTask.update({
        where: { id: taskId },
        data: {
          status: 'RESOLVED',
          assignedUserId: session.userId,
        }
      });
    } else if (action === 'CLAIM') {
      await (prisma as any).operationTask.update({
        where: { id: taskId },
        data: {
          status: 'IN_PROGRESS',
          assignedUserId: session.userId,
        }
      });
    }

    return NextResponse.json({ success: true, message: `Task ${action.toLowerCase()}d` });
  } catch (error) {
    console.error('Update Task Error:', error);
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}
