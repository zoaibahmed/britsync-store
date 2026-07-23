/**
 * wallet.service.ts
 * All wallet operations go through this service.
 * Never directly mutate clearedBalance — always use creditMakerWallet or debitMakerWallet.
 * Every operation creates both a WalletTransaction AND double-entry LedgerEntries.
 */
import { prisma } from '@/lib/prisma';

// Ledger account names (seeded in DB)
const ACCOUNTS = {
  ESCROW_LIABILITY: 'Escrow Liability',
  MAKER_PAYABLE: 'Maker Payable',
  BRITSYNC_REVENUE: 'Britsync Revenue',
  CASH_CLEARING: 'Cash Clearing',
} as const;

async function getOrCreateLedgerAccount(
  tx: any,
  name: string,
  accountType: string,
): Promise<string> {
  const existing = await tx.ledgerAccount.findFirst({ where: { name } });
  if (existing) return existing.id;
  const created = await tx.ledgerAccount.create({
    data: { name, accountType, currency: 'GBP' },
  });
  return created.id;
}

/**
 * Credit a maker's wallet when escrow is released.
 * Creates: WalletTransaction CREDIT + double-entry ledger entries.
 */
export async function creditMakerWallet(
  tx: any,
  makerId: string,
  amount: number,
  description: string,
  orderId: string,
): Promise<void> {
  // Ensure wallet exists
  let wallet = await tx.wallet.findUnique({ where: { makerProfileId: makerId } });
  if (!wallet) {
    wallet = await tx.wallet.create({
      data: { makerProfileId: makerId, clearedBalance: 0, currency: 'GBP' },
    });
  }

  // Credit cleared balance
  await tx.wallet.update({
    where: { id: wallet.id },
    data: { clearedBalance: { increment: amount } },
  });

  // Wallet transaction record
  await tx.walletTransaction.create({
    data: {
      walletId: wallet.id,
      amount,
      type: 'CREDIT',
      description,
      status: 'SUCCESSFUL',
    },
  });

  // Double-entry ledger: DR Escrow Liability / CR Maker Payable
  const escrowAccId = await getOrCreateLedgerAccount(tx, ACCOUNTS.ESCROW_LIABILITY, 'LIABILITY');
  const makerAccId = await getOrCreateLedgerAccount(tx, ACCOUNTS.MAKER_PAYABLE, 'LIABILITY');

  const ledgerTx = await tx.ledgerTransaction.create({
    data: {
      description: `Escrow release for order ${orderId}: ${description}`,
      idempotencyKey: `escrow-release-${orderId}-${makerId}`,
    },
  });

  await tx.ledgerEntry.createMany({
    data: [
      { ledgerTransactionId: ledgerTx.id, ledgerAccountId: escrowAccId, amountDebit: amount, amountCredit: 0 },
      { ledgerTransactionId: ledgerTx.id, ledgerAccountId: makerAccId, amountDebit: 0, amountCredit: amount },
    ],
  });
}

/**
 * Record Britsync revenue share when order is confirmed paid.
 * Creates double-entry: DR Cash Clearing / CR Britsync Revenue
 */
export async function recordBrittsyncRevenue(
  tx: any,
  marginAmount: number,
  orderId: string,
): Promise<void> {
  if (marginAmount <= 0) return;

  const cashAccId = await getOrCreateLedgerAccount(tx, ACCOUNTS.CASH_CLEARING, 'ASSET');
  const revenueAccId = await getOrCreateLedgerAccount(tx, ACCOUNTS.BRITSYNC_REVENUE, 'REVENUE');

  const ledgerTx = await tx.ledgerTransaction.create({
    data: {
      description: `Britsync revenue margin for order ${orderId}`,
      idempotencyKey: `britsync-revenue-${orderId}`,
    },
  });

  await tx.ledgerEntry.createMany({
    data: [
      { ledgerTransactionId: ledgerTx.id, ledgerAccountId: cashAccId, amountDebit: marginAmount, amountCredit: 0 },
      { ledgerTransactionId: ledgerTx.id, ledgerAccountId: revenueAccId, amountDebit: 0, amountCredit: marginAmount },
    ],
  });
}

/**
 * Record escrow hold when order is paid.
 * Creates double-entry: DR Cash Clearing / CR Escrow Liability
 */
export async function recordEscrowHold(
  tx: any,
  totalAmount: number,
  orderId: string,
): Promise<void> {
  const cashAccId = await getOrCreateLedgerAccount(tx, ACCOUNTS.CASH_CLEARING, 'ASSET');
  const escrowAccId = await getOrCreateLedgerAccount(tx, ACCOUNTS.ESCROW_LIABILITY, 'LIABILITY');

  const ledgerTx = await tx.ledgerTransaction.create({
    data: {
      description: `Escrow hold for order ${orderId}`,
      idempotencyKey: `escrow-hold-${orderId}`,
    },
  });

  await tx.ledgerEntry.createMany({
    data: [
      { ledgerTransactionId: ledgerTx.id, ledgerAccountId: cashAccId, amountDebit: totalAmount, amountCredit: 0 },
      { ledgerTransactionId: ledgerTx.id, ledgerAccountId: escrowAccId, amountDebit: 0, amountCredit: totalAmount },
    ],
  });
}
