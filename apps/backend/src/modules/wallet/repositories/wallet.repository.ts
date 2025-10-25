import { Prisma } from '@prisma/client';

import { prisma } from '../../../config/prisma';

export const walletRepository = {
  getWalletByUserId(userId: string) {
    return prisma.userWallet.findUnique({ where: { userId } });
  },

  createTransaction(walletId: string, data: { amount: number; type: 'CREDIT' | 'DEBIT' | 'HOLD' | 'RELEASE' | 'REFUND'; reference?: string; idempotencyKey?: string; metadata?: Record<string, unknown> }) {
    return prisma.$transaction(async (tx) => {
      const wallet = await tx.userWallet.findUnique({ where: { id: walletId } });
      if (!wallet) {
        throw new Error('Wallet not found');
      }

      const amountDecimal = new Prisma.Decimal(data.amount);
      const newBalance =
        data.type === 'DEBIT' ? wallet.balance.minus(amountDecimal) : wallet.balance.plus(amountDecimal);

      if (newBalance.isNegative()) {
        throw new Error('Saldo insuficiente');
      }

      await tx.userWallet.update({ where: { id: walletId }, data: { balance: newBalance } });

      return tx.walletTransaction.create({
        data: {
          walletId,
          type: data.type,
          amount: amountDecimal,
          balanceAfter: newBalance,
          reference: data.reference,
          idempotencyKey: data.idempotencyKey,
          metadata: data.metadata
        }
      });
    });
  }
};
