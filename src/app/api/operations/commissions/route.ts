import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession, canManageCommissions } from '@/lib/session';

export const dynamic = 'force-dynamic';

// GET /api/operations/commissions — List custom commission requests
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    let whereClause: any = {};
    if (session.role === 'BUYER') {
      whereClause.patronUserId = session.userId;
    } else if (session.role === 'MAKER') {
      const maker = await prisma.makerProfile.findUnique({ where: { userId: session.userId } });
      if (!maker) return NextResponse.json({ success: true, commissions: [] });
      whereClause.assignedMakerProfileId = maker.id;
    } else if (!canManageCommissions(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const commissions = await (prisma as any).customCommission.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ success: true, commissions });
  } catch (error) {
    console.error('Fetch Custom Commissions Error:', error);
    return NextResponse.json({ error: 'Failed to fetch commissions' }, { status: 500 });
  }
}

// POST /api/operations/commissions — Submit bespoke request, quote, route, or accept
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const { action, title, description, budgetGbp, dimensions, materials, deadline, commissionId, assignedMakerProfileId, quoteAmountGbp } = body;

    if (action === 'CREATE') {
      if (!title || !description) {
        return NextResponse.json({ error: 'Title and description are required' }, { status: 400 });
      }

      const created = await (prisma as any).customCommission.create({
        data: {
          patronUserId: session.userId,
          title,
          description,
          budgetGbp: budgetGbp ? parseFloat(budgetGbp) : null,
          dimensions,
          materials,
          deadline: deadline ? new Date(deadline) : null,
          status: 'SUBMITTED',
        }
      });

      // Create Operational Task for Concierge
      await (prisma as any).operationTask.create({
        data: {
          taskType: 'COMMISSION_REQUEST',
          targetRole: 'CONCIERGE',
          referenceId: created.id,
          title: `Bespoke Request: ${title}`,
          description: `Budget: £${budgetGbp || 'N/A'}. Patron: ${session.name}`,
          priority: 'HIGH',
          status: 'OPEN',
        }
      });

      return NextResponse.json({ success: true, commission: created });
    }

    if (action === 'ROUTE_STUDIO') {
      if (!canManageCommissions(session.role)) {
        return NextResponse.json({ error: 'Concierge authorization required' }, { status: 403 });
      }

      await (prisma as any).customCommission.update({
        where: { id: commissionId },
        data: {
          assignedMakerProfileId,
          status: 'STUDIO_ROUTED',
        }
      });

      return NextResponse.json({ success: true, message: 'Commission routed to studio' });
    }

    if (action === 'SUBMIT_QUOTE') {
      if (!['MAKER', 'STUDIO_MANAGER', 'CONCIERGE', 'CEO', 'SUPER_ADMIN'].includes(session.role)) {
        return NextResponse.json({ error: 'Artisan authorization required' }, { status: 403 });
      }

      await (prisma as any).customCommission.update({
        where: { id: commissionId },
        data: {
          quoteAmountGbp: parseFloat(quoteAmountGbp),
          status: 'QUOTED',
        }
      });

      return NextResponse.json({ success: true, message: 'Quote submitted to patron' });
    }

    if (action === 'ACCEPT_QUOTE') {
      await (prisma as any).customCommission.update({
        where: { id: commissionId },
        data: { status: 'ACCEPTED' }
      });

      return NextResponse.json({ success: true, message: 'Quote accepted. Proceeding to order creation.' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Commission POST Error:', error);
    return NextResponse.json({ error: 'Failed to process commission request' }, { status: 500 });
  }
}
