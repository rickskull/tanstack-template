import createHttpError from 'http-errors';
import { Prisma } from '@prisma/client';

import { prisma } from '../../../config/prisma';
import { auditService } from '../../audit/services/audit.service';

export const announcementService = {
  async list(filters?: { platform?: string; tags?: string[] }) {
    return prisma.announcement.findMany({
      where: {
        status: 'ACTIVE',
        platform: filters?.platform,
        tags: filters?.tags ? { hasSome: filters.tags } : undefined
      },
      include: { images: true, seller: { include: { user: true } } },
      orderBy: { createdAt: 'desc' }
    });
  },

  async create(userId: string, input: { title: string; description: string; price: number; platform: string; tags: string[]; condition: string; images: string[]; badges: string[] }) {
    if (input.images.length > 5) {
      throw createHttpError(400, 'Máximo de 5 imagens');
    }

    const seller = await prisma.seller.findUnique({ where: { userId } });
    if (!seller) {
      throw createHttpError(403, 'Somente vendedores podem criar anúncios');
    }

    const announcement = await prisma.announcement.create({
      data: {
        sellerId: seller.id,
        title: input.title,
        description: input.description,
        price: new Prisma.Decimal(input.price),
        platform: input.platform,
        tags: input.tags,
        condition: input.condition,
        badges: input.badges,
        status: 'ACTIVE',
        images: {
          create: input.images.map((url, index) => ({ url, position: index }))
        }
      },
      include: { images: true }
    });

    await auditService.log({
      actorId: userId,
      action: 'ANNOUNCEMENT_CREATED',
      entity: 'Announcement',
      entityId: announcement.id
    });

    return announcement;
  },

  async update(userId: string, announcementId: string, data: Partial<{ title: string; description: string; price: number; platform: string; tags: string[]; condition: string; status: string; badges: string[]; images: string[] }>) {
    const announcement = await prisma.announcement.findUnique({ where: { id: announcementId }, include: { seller: true, images: true } });
    if (!announcement) {
      throw createHttpError(404, 'Anúncio não encontrado');
    }

    const seller = await prisma.seller.findUnique({ where: { userId } });
    if (!seller || announcement.sellerId !== seller.id) {
      throw createHttpError(403, 'Sem permissão');
    }

    if (data.images && data.images.length > 5) {
      throw createHttpError(400, 'Máximo de 5 imagens');
    }

    const updated = await prisma.announcement.update({
      where: { id: announcementId },
      data: {
        title: data.title,
        description: data.description,
        price: data.price ? new Prisma.Decimal(data.price) : undefined,
        platform: data.platform,
        tags: data.tags,
        condition: data.condition,
        status: data.status as any,
        badges: data.badges,
        images: data.images
          ? {
              deleteMany: {},
              create: data.images.map((url, index) => ({ url, position: index }))
            }
          : undefined
      },
      include: { images: true }
    });

    await auditService.log({
      actorId: userId,
      action: 'ANNOUNCEMENT_UPDATED',
      entity: 'Announcement',
      entityId: announcementId
    });

    return updated;
  },

  async remove(userId: string, announcementId: string) {
    const announcement = await prisma.announcement.findUnique({ where: { id: announcementId } });
    if (!announcement) {
      throw createHttpError(404, 'Anúncio não encontrado');
    }

    const seller = await prisma.seller.findUnique({ where: { userId } });
    if (!seller || announcement.sellerId !== seller.id) {
      throw createHttpError(403, 'Sem permissão');
    }

    await prisma.announcement.update({ where: { id: announcementId }, data: { status: 'ARCHIVED' } });
    await auditService.log({ actorId: userId, action: 'ANNOUNCEMENT_DELETED', entity: 'Announcement', entityId: announcementId });
  }
};
