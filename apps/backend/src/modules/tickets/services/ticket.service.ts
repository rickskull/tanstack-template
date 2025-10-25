import createHttpError from 'http-errors';

import { prisma } from '../../../config/prisma';
import { auditService } from '../../audit/services/audit.service';
import { ROLES } from '../../../types/roles';

export const ticketService = {
  async create(userId: string, data: { subject: string; description: string; orderId?: string }) {
    const ticket = await prisma.ticket.create({
      data: {
        creatorId: userId,
        subject: data.subject,
        description: data.description,
        orderId: data.orderId,
        status: 'OPEN'
      }
    });

    await auditService.log({ actorId: userId, action: 'TICKET_CREATED', entity: 'Ticket', entityId: ticket.id });
    return ticket;
  },

  async list(userId: string, role: string) {
    if (role === ROLES.ADMIN || role === ROLES.ADMIN_PRINCIPAL) {
      return prisma.ticket.findMany({ orderBy: { createdAt: 'desc' } });
    }

    return prisma.ticket.findMany({ where: { creatorId: userId }, orderBy: { createdAt: 'desc' } });
  },

  async respond(ticketId: string, userId: string, message: string) {
    const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
    if (!ticket) {
      throw createHttpError(404, 'Ticket não encontrado');
    }

    await prisma.ticketMessage.create({ data: { ticketId, authorId: userId, body: message } });
    await auditService.log({ actorId: userId, action: 'TICKET_RESPONDED', entity: 'Ticket', entityId: ticketId });
  },

  async assign(ticketId: string, assigneeId: string, actorId: string) {
    await prisma.ticket.update({ where: { id: ticketId }, data: { assigneeId } });
    await auditService.log({ actorId, action: 'TICKET_ASSIGNED', entity: 'Ticket', entityId: ticketId, metadata: { assigneeId } });
  }
};
