import { Prisma } from '@prisma/client';

import { prisma } from '../../../config/prisma';
import { env } from '../../../config/env';

export const subscriptionPlans = [
  {
    name: 'Starter',
    description: 'Plano Starter para novos vendedores',
    price: 15,
    maxListings: 25,
    commission: 0.15,
    withdrawalSpeed: 'normal',
    perks: [
      'Dashboard básico',
      'Estatísticas essenciais',
      'Chat opcional',
      'Upload de até 5 imagens'
    ]
  },
  {
    name: 'Pro',
    description: 'Plano Pro para vendedores ativos',
    price: 30,
    maxListings: 15,
    commission: 0.12,
    withdrawalSpeed: 'normal',
    perks: [
      'Estatísticas avançadas',
      'Destaque nos filtros',
      'Badge Pro Seller',
      'Prioridade em tickets'
    ]
  },
  {
    name: 'Premium',
    description: 'Plano Premium para escala',
    price: 60,
    maxListings: 30,
    commission: 0.1,
    withdrawalSpeed: 'rápido',
    perks: [
      'Destaque na home',
      'Badge Premium',
      'Insights de conversão',
      'Suporte prioritário'
    ]
  },
  {
    name: 'Elite',
    description: 'Plano Elite para top sellers',
    price: 120,
    maxListings: -1,
    commission: 0.07,
    withdrawalSpeed: 'instantâneo',
    perks: [
      'Todos privilégios anteriores',
      'Destaque máximo',
      'Acesso antecipado a features',
      'Suporte VIP'
    ]
  }
] satisfies Array<Omit<Prisma.SubscriptionPlanCreateInput, 'price' | 'commission'>> & {
  price: number;
  commission: number;
};

export const subscriptionService = {
  async ensureSeedPlans() {
    for (const plan of subscriptionPlans) {
      await prisma.subscriptionPlan.upsert({
        where: { name: plan.name },
        create: {
          ...plan,
          price: new Prisma.Decimal(plan.price),
          commission: new Prisma.Decimal(plan.commission)
        },
        update: {
          description: plan.description,
          maxListings: plan.maxListings,
          commission: new Prisma.Decimal(plan.commission),
          price: new Prisma.Decimal(plan.price),
          withdrawalSpeed: plan.withdrawalSpeed,
          perks: plan.perks
        }
      });
    }
  },

  async getPlans() {
    return prisma.subscriptionPlan.findMany({ orderBy: { price: 'asc' } });
  },

  async subscribe(userId: string, planId: string) {
    const plan = await prisma.subscriptionPlan.findUnique({ where: { id: planId } });
    if (!plan) {
      throw new Error('Plano não encontrado');
    }

    return prisma.userSubscription.create({
      data: {
        userId,
        planId,
        status: 'active',
        startsAt: new Date(),
        endsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    });
  },

  async getEffectiveCommission(userId: string) {
    const subscription = await prisma.userSubscription.findFirst({
      where: { userId, status: 'active', endsAt: { gt: new Date() } },
      include: { plan: true }
    });

    if (!subscription?.plan) {
      return env.PLATFORM_COMMISSION_RATE;
    }

    return Number(subscription.plan.commission);
  }
};
