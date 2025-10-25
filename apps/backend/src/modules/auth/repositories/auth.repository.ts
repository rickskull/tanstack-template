import { prisma } from '../../../config/prisma';

export const authRepository = {
  async createUser(data: Prisma.UserCreateInput) {
    return prisma.user.create({ data });
  },

  async findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  },

  async countUsers() {
    return prisma.user.count();
  },

  async upsertRefreshToken(userId: string, token: string, expiresAt: Date) {
    return prisma.refreshToken.upsert({
      where: { userId },
      create: { userId, token, expiresAt },
      update: { token, expiresAt }
    });
  },

  async createAuditLog(data: Prisma.AuditLogCreateInput) {
    return prisma.auditLog.create({ data });
  }
};
