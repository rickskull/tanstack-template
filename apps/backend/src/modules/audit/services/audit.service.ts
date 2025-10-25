import { Prisma } from '@prisma/client';

import { prisma } from '../../../config/prisma';

interface AuditLogInput {
  actorId?: string;
  actorRole?: Prisma.UserRole;
  action: string;
  entity: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  ip?: string;
  userAgent?: string;
}

export const auditService = {
  async log(input: AuditLogInput) {
    return prisma.auditLog.create({
      data: {
        actorId: input.actorId,
        actorRole: input.actorRole,
        action: input.action,
        entity: input.entity,
        entityId: input.entityId,
        metadata: input.metadata,
        ip: input.ip,
        userAgent: input.userAgent
      }
    });
  },

  async list(filters?: { actorId?: string; action?: string }) {
    return prisma.auditLog.findMany({
      where: filters,
      orderBy: { createdAt: 'desc' },
      take: 200
    });
  }
};
