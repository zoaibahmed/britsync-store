const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const crypto = require('crypto');

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

async function main() {
  console.log('Seeding default Field Inspectors into database...');

  const inspectors = [
    { email: 'tariq@britsync.com', name: 'Tariq M.', region: 'South Asia (Pakistan, India)' },
    { email: 'elena@britsync.com', name: 'Elena K.', region: 'Mediterranean (Turkey, Morocco)' }
  ];

  for (const ins of inspectors) {
    const existing = await prisma.user.findUnique({
      where: { email: ins.email }
    });

    if (!existing) {
      const user = await prisma.user.create({
        data: {
          email: ins.email,
          passwordHash: hashPassword('password123'),
          name: ins.name,
          role: 'INSPECTOR'
        }
      });

      await prisma.inspectorProfile.create({
        data: {
          userId: user.id,
          regionScope: ins.region
        }
      });
      console.log(`✓ Created Inspector: ${ins.name} (${ins.email})`);
    } else {
      console.log(`Inspector ${ins.name} already exists.`);
    }
  }

  console.log('Seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
