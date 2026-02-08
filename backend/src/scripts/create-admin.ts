import { PrismaClient, AccountType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@almere-pickleball.nl';
  const password = 'Almere2026!';
  const firstName = 'Admin';
  const lastName = 'User';

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log('Admin user already exists.');
    process.exit(0);
  }

  const hash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      email,
      password: hash,
      member: {
        create: {
          firstName,
          lastName,
          accountType: 'ADMIN',
        },
      },
    },
    include: { member: true },
  });

  console.log('Admin user created:');
  console.log({ email, password });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
