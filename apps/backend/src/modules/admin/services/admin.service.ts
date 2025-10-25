import createHttpError from 'http-errors';
import { Prisma } from '@prisma/client';

import { prisma } from '../../../config/prisma';
import { auditService } from '../../audit/services/audit.service';

export const adminService = {
  async banUser(userId: string, reason: string, actorId: string) {
    await prisma.user.update({ where: { id: userId }, data: { status: 'banned' } });
    await auditService.log({ actorId, action: 'USER_BANNED', entity: 'User', entityId: userId, metadata: { reason } });
  },

  async banValue(type: 'ip' | 'ua' | 'device', value: string, actorId: string, reason?: string) {
    await prisma.banEntry.create({ data: { type, value, reason, actorId } });
    await auditService.log({ actorId, action: 'BAN_CREATED', entity: 'BanEntry', metadata: { type, value } });
  },

  async createSeller(userId: string, actorId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw createHttpError(404, 'Usuário não encontrado');
    }

    await prisma.$transaction(async (tx) => {
      await tx.user.update({ where: { id: userId }, data: { role: 'Seller' } });
      await tx.seller.upsert({ where: { userId }, create: { userId }, update: {} });
    });

    await auditService.log({ actorId, action: 'SELLER_CREATED', entity: 'User', entityId: userId });
  },

  async batchDeleteAnnouncements(ids: string[], actorId: string) {
    await prisma.announcement.updateMany({ where: { id: { in: ids } }, data: { status: 'ARCHIVED' } });
    await auditService.log({ actorId, action: 'ANNOUNCEMENT_BATCH_DELETE', entity: 'Announcement', metadata: { ids } });
  },

  async rollbackTransaction(transactionId: string, actorId: string) {
    const txn = await prisma.walletTransaction.findUnique({ where: { id: transactionId } });
    if (!txn) {
      throw createHttpError(404, 'Transação não encontrada');
    }

    const inverseType = txn.type === 'DEBIT' ? 'CREDIT' : 'DEBIT';

    await prisma.$transaction(async (tx) => {
      const wallet = await tx.userWallet.findUnique({ where: { id: txn.walletId } });
      if (!wallet) {
        throw createHttpError(404, 'Wallet não encontrada');
      }

      const amount = new Prisma.Decimal(txn.amount);
      const newBalance = inverseType === 'CREDIT' ? wallet.balance.plus(amount) : wallet.balance.minus(amount);
      await tx.userWallet.update({ where: { id: wallet.id }, data: { balance: newBalance } });
      await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: inverseType,
          amount,
          balanceAfter: newBalance,
          reference: `rollback-${txn.id}`,
          metadata: { rollbackFrom: txn.id }
        }
      });
    });

    await auditService.log({ actorId, action: 'TRANSACTION_ROLLBACK', entity: 'WalletTransaction', entityId: transactionId });
  },

  listWithdrawals() {
    return prisma.payout.findMany({ orderBy: { createdAt: 'desc' } });
  },

  async approveWithdrawal(id: string, actorId: string) {
    const payout = await prisma.payout.update({
      where: { id },
      data: { status: 'approved', processedAt: new Date() }
    });

    await auditService.log({ actorId, action: 'WITHDRAWAL_APPROVED', entity: 'Payout', entityId: id });
    return payout;
  }
};
