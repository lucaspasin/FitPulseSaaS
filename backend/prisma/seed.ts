import { PrismaClient } from '@prisma/client';
import { BcryptPasswordHasher } from '../src/security/BcryptPasswordHasher.js';
import { seedIfEmpty } from '../src/seed/bootstrap.js';

const prisma = new PrismaClient();

seedIfEmpty(prisma, new BcryptPasswordHasher())
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
