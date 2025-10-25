import createHttpError from 'http-errors';

import { prisma } from '../../../config/prisma';
import { auditService } from '../../audit/services/audit.service';

export const chatService = {
  async startChat(buyerId: string, sellerId: string) {
    const existing = await prisma.chat.findFirst({ where: { buyerId, sellerId } });
    if (existing) {
      return existing;
    }

    const chat = await prisma.chat.create({ data: { buyerId, sellerId } });
    await auditService.log({ actorId: buyerId, action: 'CHAT_STARTED', entity: 'Chat', entityId: chat.id });
    return chat;
  },

  async listChats(userId: string) {
    return prisma.chat.findMany({
      where: { OR: [{ buyerId: userId }, { sellerId: userId }] },
      include: { messages: { where: { deleted: false }, orderBy: { createdAt: 'asc' } } }
    });
  },

  async sendMessage(chatId: string, authorId: string, body: string) {
    const chat = await prisma.chat.findUnique({ where: { id: chatId } });
    if (!chat) {
      throw createHttpError(404, 'Chat não encontrado');
    }

    if (chat.buyerId !== authorId && chat.sellerId !== authorId) {
      throw createHttpError(403, 'Sem permissão no chat');
    }

    return prisma.message.create({ data: { chatId, authorId, body } });
  },

  async softDeleteMessage(messageId: string, actorId: string) {
    const message = await prisma.message.findUnique({ where: { id: messageId } });
    if (!message) {
      throw createHttpError(404, 'Mensagem não encontrada');
    }

    if (message.authorId !== actorId) {
      throw createHttpError(403, 'Só é possível remover mensagens próprias');
    }

    return prisma.message.update({ where: { id: messageId }, data: { deleted: true } });
  }
};
