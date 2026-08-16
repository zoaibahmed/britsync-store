import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession, canProcessPayout } from '@/lib/session';

export const dynamic = 'force-dynamic';

// GET /api/operations/payouts — List payout requests & escrow balances
export async function GET() {
  try {
    const session = await getSession();
    if (!session || !canProcessPayout(session.role)) {
      return NextResponse.json({ error: 'Finance staff authorization required' }, { status: 403 });
    }

    const payoutRequests = await (prisma as any).payoutRequest.findMany({
      orderBy: { requestedAt: 'desc' },
      take: 100,
    });

    const wallets = await prisma.wallet.findMany({
      include: {
        maker: {
          select: {
            id: true,
            businessName: true,
            founderName: true,
            payoutMethod: true,
            user: { select: { email: true } }
          }
        }
      }
    });

    const mappedWallets = wallets.map((w: any) => ({
      makerId: w.makerProfileId,
      studioName: w.maker?.businessName || 'Atelier',
      founderName: w.maker?.founderName || 'Artisan',
      email: w.maker?.user?.email,
      clearedBalance: w.clearedBalance,
      escrowHeldBalance: w.payoutHeldBalance,
      payoutMethod: w.maker?.payoutMethod || 'STRIPE_CONNECT',
    }));

    return NextResponse.json({
      success: true,
      payoutRequests,
      makerWallets: mappedWallets,
    });
  } catch (error) {
    console.error('Fetch Operations Payouts Error:', error);
    return NextResponse.json({ error: 'Failed to fetch payout requests' }, { status: 500 });
  }
}

// POST /api/operations/payouts — Process payout request (APPROVE, REJECT, PAY)
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || !canProcessPayout(session.role)) {
      return NextResponse.json({ error: 'Finance staff authorization required' }, { status: 403 });
    }

    const body = await request.json();
    const { requestId, action, reason } = body;

    if (!requestId || !['APPROVE', 'PAY', 'REJECT'].includes(action)) {
      return NextResponse.json({ error: 'requestId and valid action (APPROVE, PAY, REJECT) required' }, { status: 400 });
    }

    const payoutReq = await (prisma as any).payoutRequest.findUnique({
      where: { id: requestId }
    });

    if (!payoutReq) {
      return NextResponse.json({ error: 'Payout request not found' }, { status: 404 });
    }

    if (action === 'PAY' || action === 'APPROVE') {
      await (prisma as any).$transaction(async (tx: any) => {
        await tx.payoutRequest.update({
          where: { id: requestId },
          data: {
            status: action === 'PAY' ? 'PAID' : 'PROCESSING',
            processedAt: new Date(),
            processedByUserId: session.userId,
          }
        });

        if (action === 'PAY') {
          // Deduct cleared balance from wallet
          await tx.wallet.update({
            where: { makerProfileId: payoutReq.makerProfileId },
            data: {
              clearedBalance: { decrement: payoutReq.amount }
            }
          });
        }
      });
    } else if (action === 'REJECT') {
      await (prisma as any).payoutRequest.update({
        where: { id: requestId },
        data: {
          status: 'REJECTED',
          rejectionReason: reason || 'Information verification failed',
          processedAt: new Date(),
          processedByUserId: session.userId,
        }
      });
    }

    return NextResponse.json({ success: true, message: `Payout request ${action.toLowerCase()}d` });
  } catch (error) {
    console.error('Process Payout Error:', error);
    return NextResponse.json({ error: 'Failed to process payout request' }, { status: 500 });
  }
}
