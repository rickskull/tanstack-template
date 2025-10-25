import argon2 from 'argon2';
import createHttpError from 'http-errors';
import { prisma } from '../../../config/prisma';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../../utils/jwt';
import { authRepository } from '../repositories/auth.repository';
import { generateTotpSecret, verifyTotp } from './totp.service';
import { logger } from '../../../utils/logger';
import { ROLES } from '../../../types/roles';
import { auditService } from '../../audit/services/audit.service';

interface RegisterInput {
  email: string;
  password: string;
  name: string;
}

interface LoginInput {
  email: string;
  password: string;
  totpCode?: string;
}

export const authService = {
  async register(input: RegisterInput) {
    const existing = await authRepository.findByEmail(input.email);
    if (existing) {
      throw createHttpError(409, 'E-mail já cadastrado');
    }

    const passwordHash = await argon2.hash(input.password);

    const result = await prisma.$transaction(async (tx) => {
      const usersCount = await tx.user.count();
      const role = usersCount === 0 ? ROLES.ADMIN_PRINCIPAL : ROLES.BUYER;

      const user = await tx.user.create({
        data: {
          email: input.email,
          passwordHash,
          name: input.name,
          role,
          status: 'active'
        }
      });

      await tx.userWallet.create({ data: { userId: user.id, balance: 0 } });

      const accessToken = signAccessToken({ sub: user.id, role: user.role });
      const refreshToken = signRefreshToken({ sub: user.id, role: user.role });
      const refreshExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      await authRepository.upsertRefreshToken(user.id, refreshToken, refreshExpires);

      return {
        user,
        tokens: {
          accessToken,
          refreshToken
        }
      };
    });

    await auditService.log({
      actorId: result.user.id,
      actorRole: result.user.role as any,
      action: 'USER_REGISTER',
      entity: 'User',
      entityId: result.user.id,
      metadata: { email: result.user.email }
    });

    return result;
  },

  async login({ email, password, totpCode }: LoginInput) {
    const user = await authRepository.findByEmail(email);
    if (!user) {
      throw createHttpError(401, 'Credenciais inválidas');
    }

    const validPassword = await argon2.verify(user.passwordHash, password);
    if (!validPassword) {
      throw createHttpError(401, 'Credenciais inválidas');
    }

    if (user.totpEnabled) {
      if (!totpCode) {
        throw createHttpError(412, 'Código TOTP obrigatório');
      }
      const validTotp = verifyTotp(totpCode, user.totpSecret!);
      if (!validTotp) {
        throw createHttpError(401, 'Código TOTP inválido');
      }
    }

    const accessToken = signAccessToken({ sub: user.id, role: user.role });
    const refreshToken = signRefreshToken({ sub: user.id, role: user.role });
    const refreshExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await authRepository.upsertRefreshToken(user.id, refreshToken, refreshExpires);

    await auditService.log({
      actorId: user.id,
      actorRole: user.role as any,
      action: 'USER_LOGIN',
      entity: 'User',
      entityId: user.id,
      metadata: { email: user.email }
    });

    return {
      user,
      tokens: {
        accessToken,
        refreshToken
      }
    };
  },

  async refresh(token: string) {
    try {
      const payload = verifyRefreshToken(token);
      const user = await prisma.user.findUnique({ where: { id: payload.sub } });
      if (!user) {
        throw createHttpError(401, 'Token inválido');
      }

      const accessToken = signAccessToken({ sub: user.id, role: user.role });
      const refreshToken = signRefreshToken({ sub: user.id, role: user.role });
      const refreshExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      await authRepository.upsertRefreshToken(user.id, refreshToken, refreshExpires);

      return { accessToken, refreshToken };
    } catch (error) {
      logger.error({ error }, 'Falha ao renovar token');
      throw createHttpError(401, 'Token inválido');
    }
  },

  async enableTotp(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw createHttpError(404, 'Usuário não encontrado');
    }

    const { secret, otpauth } = generateTotpSecret(user.email);
    await prisma.user.update({ where: { id: userId }, data: { totpSecret: secret, totpEnabled: true } });

    return { otpauth };
  }
};
