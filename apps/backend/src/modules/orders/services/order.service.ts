import createHttpError from 'http-errors';
import { Prisma } from '@prisma/client';

import { prisma } from '../../../config/prisma';
import { walletService } from '../../wallet/services/wallet.service';
import { subscriptionService } from '../../subscriptions/services/subscription.service';
import { auditService } from '../../audit/services/audit.service';

export const orderService = {
  async createOrder(buyerId: string, announcementId: string, idempotencyKey: string) {
    const announcement = await prisma.announcement.findUnique({
      where: { id: announcementId },
      include: { seller: { include: { user: true } } }
    });

    if (!announcement || announcement.status !== 'ACTIVE') {
      throw createHttpError(404, 'Anúncio indisponível');
    }

    if (announcement.seller.userId === buyerId) {
      throw createHttpError(400, 'Não é possível comprar o próprio anúncio');
    }

    const commissionRate = await subscriptionService.getEffectiveCommission(announcement.seller.userId);
    const commission = Number(announcement.price) * commissionRate;

    await walletService.debitForOrder(buyerId, Number(announcement.price), idempotencyKey);

    const order = await prisma.order.create({
      data: {
        buyerId,
        sellerId: announcement.seller.userId,
        announcementId: announcement.id,
        amount: new Prisma.Decimal(announcement.price),
        commission: new Prisma.Decimal(commission),
        status: 'PAID_PENDING_VERIFICATION'
      }
    });

    await auditService.log({
      actorId: buyerId,
      actorRole: undefined,
      action: 'ORDER_CREATED',
      entity: 'Order',
      entityId: order.id,
      metadata: { announcementId }
    });

    return order;
  },

  async completeOrder(orderId: string, actorId: string) {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      throw createHttpError(404, 'Pedido não encontrado');
    }

    if (order.status !== 'PAID_PENDING_VERIFICATION') {
      throw createHttpError(400, 'Pedido não está pronto para completar');
    }

    const sellerWallet = await prisma.userWallet.findUnique({ where: { userId: order.sellerId } });
    if (!sellerWallet) {
      throw createHttpError(404, 'Wallet de vendedor não encontrada');
    }

    const payoutAmount = Number(order.amount) - Number(order.commission);

    await prisma.$transaction(async (tx) => {
      await tx.order.update({ where: { id: order.id }, data: { status: 'COMPLETED' } });

      await tx.userWallet.update({
        where: { id: sellerWallet.id },
        data: { balance: sellerWallet.balance.plus(new Prisma.Decimal(payoutAmount)) }
      });

      await tx.walletTransaction.create({
        data: {
          walletId: sellerWallet.id,
          type: 'CREDIT',
          amount: new Prisma.Decimal(payoutAmount),
          balanceAfter: sellerWallet.balance.plus(new Prisma.Decimal(payoutAmount)),
          reference: `order-${order.id}`,
          metadata: { commission: order.commission }
        }
      });

      await tx.payout.create({
        data: {
          sellerId: order.sellerId,
          amount: new Prisma.Decimal(payoutAmount),
          fee: order.commission,
          status: 'completed',
          processedAt: new Date()
        }
      });
    });

    await auditService.log({
      actorId: actorId,
      action: 'ORDER_COMPLETED',
      entity: 'Order',
      entityId: orderId,
      metadata: { payoutAmount }
    });

    return { payoutAmount };
  }
};
