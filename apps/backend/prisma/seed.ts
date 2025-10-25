import { faker } from '@faker-js/faker';
import argon2 from 'argon2';
import { PrismaClient } from '@prisma/client';

import { Prisma } from '@prisma/client';

import { subscriptionService } from '../src/modules/subscriptions/services/subscription.service';

const prisma = new PrismaClient();

async function main() {
  await subscriptionService.ensureSeedPlans();

  const passwordHash = await argon2.hash('Password123!');

  const users = [];
  for (let i = 0; i < 20; i++) {
    users.push(
      prisma.user.create({
        data: {
          email: faker.internet.email().toLowerCase(),
          name: faker.person.fullName(),
          passwordHash,
          role: i === 0 ? 'AdminPrincipal' : i < 5 ? 'Seller' : 'Buyer'
        }
      })
    );
  }

  const createdUsers = await Promise.all(users);

  for (const user of createdUsers) {
    await prisma.userWallet.create({ data: { userId: user.id, balance: 1000 } });
    if (user.role === 'Seller') {
      await prisma.seller.create({ data: { userId: user.id, bio: faker.lorem.sentence() } });
    }
  }

  const sellers = await prisma.seller.findMany();
  const announcements = [];
  for (const seller of sellers) {
    for (let i = 0; i < 6; i++) {
      announcements.push(
        prisma.announcement.create({
          data: {
            sellerId: seller.id,
            title: faker.commerce.productName(),
            description: faker.commerce.productDescription(),
            price: new Prisma.Decimal(
              faker.number.float({ min: 10, max: 500, fractionDigits: 2 }).toFixed(2)
            ),
            platform: faker.helpers.arrayElement(['Steam', 'PlayStation', 'Xbox', 'Mobile']),
            tags: faker.helpers.arrayElements(['FPS', 'RPG', 'MMO', 'Indie', 'Retro'], 2),
            condition: faker.helpers.arrayElement(['novo', 'usado']),
            badges: ['verified'],
            status: 'ACTIVE',
            images: {
              create: Array.from({ length: faker.number.int({ min: 1, max: 3 }) }).map((_, index) => ({
                url: faker.image.url(),
                position: index
              }))
            }
          }
        })
      );
    }
  }

  const createdAnnouncements = await Promise.all(announcements);

  const orders = [];
  const buyers = createdUsers.filter((u) => u.role === 'Buyer');
  for (let i = 0; i < 10; i++) {
    const announcement = faker.helpers.arrayElement(createdAnnouncements);
    const buyer = faker.helpers.arrayElement(buyers);
    orders.push(
      prisma.order.create({
        data: {
          buyerId: buyer.id,
          sellerId: announcement.sellerId,
          announcementId: announcement.id,
          amount: announcement.price,
          commission: announcement.price.mul(0.15),
          status: 'COMPLETED'
        }
      })
    );
  }

  await Promise.all(orders);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
