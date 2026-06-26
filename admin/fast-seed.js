const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const permissions = [
    { module: 'users', action: 'create' }, { module: 'users', action: 'read' }, { module: 'users', action: 'update' }, { module: 'users', action: 'delete' },
    { module: 'orders', action: 'create' }, { module: 'orders', action: 'read' }, { module: 'orders', action: 'update' }, { module: 'orders', action: 'delete' },
    { module: 'customers', action: 'create' }, { module: 'customers', action: 'read' }, { module: 'customers', action: 'update' }, { module: 'customers', action: 'delete' },
    { module: 'payments', action: 'read' }, { module: 'payments', action: 'refund' },
    { module: 'shipping', action: 'read' }, { module: 'shipping', action: 'update' },
    { module: 'reviews', action: 'read' }, { module: 'reviews', action: 'moderate' },
    { module: 'analytics', action: 'read' },
    { module: 'notifications', action: 'read' },
    { module: 'integrations', action: 'read' }, { module: 'integrations', action: 'manage' },
    { module: 'settings', action: 'read' }, { module: 'settings', action: 'manage' },
  ];
  
  await prisma.permission.createMany({
    data: permissions,
    skipDuplicates: true,
  });
  
  const allPerms = await prisma.permission.findMany();
  
  const role = await prisma.role.upsert({
    where: { slug: 'super-admin' },
    create: { name: 'Super Admin', slug: 'super-admin', description: 'Full access', isSystem: true },
    update: {}
  });

  await prisma.rolePermission.createMany({
    data: allPerms.map(p => ({ roleId: role.id, permissionId: p.id })),
    skipDuplicates: true,
  });

  const user = await prisma.user.findUnique({ where: { email: 'admin@nakshtragold.com' } });
  if (user) {
    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: user.id, roleId: role.id } },
      create: { userId: user.id, roleId: role.id },
      update: {}
    });
  }
  console.log('Role assigned successfully!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
