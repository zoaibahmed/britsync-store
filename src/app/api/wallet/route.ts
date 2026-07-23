import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== 'MAKER') {
      return NextResponse.json({ error: 'Maker credentials required' }, { status: 403 });
    }

    const maker = await prisma.makerProfile.findUnique({
      where: { userId: session.userId }
    });

    if (!maker) {
      return NextResponse.json({ error: 'Maker profile not found' }, { status: 404 });
    }

    let wallet = await prisma.wallet.findUnique({
      where: { makerProfileId: maker.id },
      include: { walletTransactions: { orderBy: { createdAt: 'desc' } } }
    });

    // Lazy initialize wallet if none exists
    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: {
          makerProfileId: maker.id,
          clearedBalance: 0.0,
          currency: 'GBP'
        },
        include: { walletTransactions: true }
      });
    }

    // Map to legacy fields for frontend compatibility
    const mappedWallet = {
      ...wallet,
      balance: wallet.clearedBalance,
      transactions: wallet.walletTransactions
    };

    return NextResponse.json(mappedWallet);
  } catch (error) {
    console.error('Failed to retrieve wallet info:', error);
    return NextResponse.json({ error: 'Failed to retrieve wallet information' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'MAKER') {
      return NextResponse.json({ error: 'Maker credentials required' }, { status: 403 });
    }

    const maker = await prisma.makerProfile.findUnique({
      where: { userId: session.userId }
    });

    if (!maker) {
      return NextResponse.json({ error: 'Maker profile not found' }, { status: 404 });
    }

    const { amount, method } = await request.json();
    const withdrawAmount = parseFloat(amount);

    if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
      return NextResponse.json({ error: 'Invalid withdrawal amount' }, { status: 400 });
    }

    const wallet = await prisma.wallet.findUnique({
      where: { makerProfileId: maker.id }
    });

    if (!wallet || wallet.clearedBalance < withdrawAmount) {
      return NextResponse.json({ error: 'Insufficient wallet balance' }, { status: 400 });
    }

    // Process deduction and create transaction in transactional block
    const updated = await prisma.$transaction(async (tx) => {
      const updatedWallet = await tx.wallet.update({
        where: { id: wallet.id },
        data: { clearedBalance: wallet.clearedBalance - withdrawAmount }
      });

      const transaction = await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          amount: withdrawAmount,
          type: 'DEBIT',
          description: `Withdrawal request via ${method || 'Stripe Connect'}`,
          status: 'SUCCESSFUL'
        }
      });

      return { wallet: updatedWallet, transaction };
    });

    return NextResponse.json({
      success: true,
      balance: updated.wallet.clearedBalance
    });
  } catch (error) {
    console.error('Withdrawal transaction failed:', error);
    return NextResponse.json({ error: 'Withdrawal transaction failed' }, { status: 500 });
  }
}
