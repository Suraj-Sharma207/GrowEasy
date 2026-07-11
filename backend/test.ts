import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
prisma.lead.count().then(console.log).catch(console.error).finally(() => prisma.$disconnect());
