import createHttpError from 'http-errors';
import { nanoid } from 'nanoid';

import { prisma } from '../../../config/prisma';
import { mercadoPagoService } from '../../payments/services/mercadopago.service';
import { walletRepository } from '../repositories/wallet.repository';
import { logger } from '../../../utils/logger';

export const walletService = {
  async createTopup(userId: string, amount: number) {
    if (amount <= 0) {
      throw createHttpError(400, 'Valor inválido');
    }

    const wallet = await walletRepository.getWalletByUserId(userId);
    if (!wallet) {
      throw createHttpError(404, 'Wallet não encontrada');
    }

    const reference = nanoid();
    const preference = await mercadoPagoService.createPreference({
      amount,
      referenceId: reference,
      description: 'SkVoid Wallet Topup'
    });

    await prisma.payment.create({
      data: {
        walletId: wallet.id,
        provider: 'mercado_pago',
        providerId: preference.id,
        status: 'pending',
        amount,
        metadata: preference
      }
    });

    return { preferenceId: preference.id, initPoint: preference.init_point, reference };
  },

  async getBalance(userId: string) {
    const wallet = await walletRepository.getWalletByUserId(userId);
    if (!wallet) {
      throw createHttpError(404, 'Wallet não encontrada');
    }

    const transactions = await prisma.walletTransaction.findMany({
      where: { walletId: wallet.id },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    return {
      balance: wallet.balance,
      transactions
    };
  },

  async creditFromWebhook(paymentData: { external_reference: string; status: string; id: string; transaction_amount: number }) {
    const reference = paymentData.external_reference;
    const payment = await prisma.payment.findFirst({ where: { providerId: paymentData.id } });
    if (!payment) {
      logger.warn({ reference }, 'Pagamento não encontrado para webhook');
      return;
    }

    if (payment.status === 'approved') {
      return;
    }

    if (!payment.walletId) {
      logger.warn({ reference }, 'Pagamento não vinculado a wallet');
      return;
    }

    const userWallet = await prisma.userWallet.findUnique({ where: { id: payment.walletId } });
    if (!userWallet) {
      throw createHttpError(404, 'Wallet não encontrada');
    }

    if (paymentData.status === 'approved') {
      await walletRepository.createTransaction(userWallet.id, {
        amount: Number(payment.amount),
        type: 'CREDIT',
        reference,
        metadata: { providerId: paymentData.id }
      });

      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'approved', metadata: paymentData }
      });
    }
  },

  async debitForOrder(userId: string, amount: number, idempotencyKey: string) {
    if (!idempotencyKey) {
      throw createHttpError(400, 'Idempotency key obrigatório');
    }

    const wallet = await walletRepository.getWalletByUserId(userId);
    if (!wallet) {
      throw createHttpError(404, 'Wallet não encontrada');
    }

    const existingTxn = await prisma.walletTransaction.findFirst({
      where: { idempotencyKey, walletId: wallet.id }
    });
    if (existingTxn) {
      return existingTxn;
    }

    return walletRepository.createTransaction(wallet.id, {
      amount,
      type: 'DEBIT',
      idempotencyKey,
      reference: `order-${idempotencyKey}`
    });
  }
};
