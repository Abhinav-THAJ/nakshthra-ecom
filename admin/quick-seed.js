const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'admin@nakshtragold.com';
  const adminPassword = 'Admin@123456';
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  const superAdmin = await prisma.user.upsert({
    where: { email: adminEmail },
    create: {
      email: adminEmail,
      passwordHash,
      firstName: 'Super',
      lastName: 'Admin',
      isActive: true,
      emailVerified: new Date(),
    },
    update: {
      passwordHash,
    },
  });
  console.log('User password updated:', superAdmin.email);
}
main().catch(console.error).finally(() => prisma.$disconnect());
