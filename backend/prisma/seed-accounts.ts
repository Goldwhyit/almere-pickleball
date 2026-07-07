import { PrismaClient, UserRole, AccountType, MembershipPlan, MembershipStatus, TrialStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const DAY_MS = 24 * 60 * 60 * 1000;

interface TestAccount {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  accountType: AccountType;
  membershipPlan: MembershipPlan;
  membershipStatus: MembershipStatus;
  trial?: {
    status: TrialStatus;
    startDate: Date;
    endDate: Date;
  };
  punchCard?: {
    remaining: number;
    expiryDate: Date;
  };
  monthlyMembership?: {
    currentPeriodEnd: Date;
  };
}

const now = new Date();

const ACCOUNTS: TestAccount[] = [
  {
    email: 'proefles@almerepickleball.nl',
    password: 'Test1234!',
    firstName: 'Proefles',
    lastName: 'Testaccount',
    role: 'MEMBER',
    accountType: 'TRIAL',
    membershipPlan: 'PER_SESSION',
    membershipStatus: 'PENDING',
    trial: {
      status: 'ACTIVE',
      startDate: now,
      endDate: new Date(now.getTime() + 21 * DAY_MS),
    },
  },
  {
    email: 'strippenkaart@almerepickleball.nl',
    password: 'Test1234!',
    firstName: 'Strippenkaart',
    lastName: 'Testaccount',
    role: 'MEMBER',
    accountType: 'MEMBER',
    membershipPlan: 'PUNCH_CARD',
    membershipStatus: 'ACTIVE',
    punchCard: {
      remaining: 10,
      expiryDate: new Date(now.getTime() + 180 * DAY_MS),
    },
  },
  {
    email: 'maandabonnement@almerepickleball.nl',
    password: 'Test1234!',
    firstName: 'Maandabonnement',
    lastName: 'Testaccount',
    role: 'MEMBER',
    accountType: 'MEMBER',
    membershipPlan: 'MONTHLY',
    membershipStatus: 'ACTIVE',
    monthlyMembership: {
      currentPeriodEnd: new Date(now.getTime() + 30 * DAY_MS),
    },
  },
  {
    email: 'jaarabonnement@almerepickleball.nl',
    password: 'Test1234!',
    firstName: 'Jaarabonnement',
    lastName: 'Testaccount',
    role: 'MEMBER',
    accountType: 'MEMBER',
    membershipPlan: 'YEARLY',
    membershipStatus: 'ACTIVE',
  },
  {
    email: 'admin@almerepickleball.nl',
    password: 'Admin1234!',
    firstName: 'Hoofd',
    lastName: 'Beheerder',
    role: 'ADMIN',
    accountType: 'ADMIN',
    membershipPlan: 'YEARLY',
    membershipStatus: 'ACTIVE',
  },
];

async function main() {
  console.log('🌱 Seeding test accounts...\n');

  for (const account of ACCOUNTS) {
    const hashedPassword = await bcrypt.hash(account.password, 10);

    const user = await prisma.user.upsert({
      where: { email: account.email },
      update: {
        password: hashedPassword,
        role: account.role,
        isActive: true,
        emailVerified: true,
      },
      create: {
        email: account.email,
        password: hashedPassword,
        role: account.role,
        isActive: true,
        emailVerified: true,
      },
    });

    await prisma.member.upsert({
      where: { userId: user.id },
      update: {
        firstName: account.firstName,
        lastName: account.lastName,
        accountType: account.accountType,
        membershipPlan: account.membershipPlan,
        membershipStatus: account.membershipStatus,
        ...(account.trial && {
          trialStatus: account.trial.status,
          trialStartDate: account.trial.startDate,
          trialEndDate: account.trial.endDate,
        }),
        ...(account.punchCard && {
          punchCardRemaining: account.punchCard.remaining,
          punchCardExpiryDate: account.punchCard.expiryDate,
        }),
      },
      create: {
        userId: user.id,
        firstName: account.firstName,
        lastName: account.lastName,
        phone: '0600000000',
        accountType: account.accountType,
        membershipPlan: account.membershipPlan,
        membershipStatus: account.membershipStatus,
        ...(account.trial && {
          trialStatus: account.trial.status,
          trialStartDate: account.trial.startDate,
          trialEndDate: account.trial.endDate,
        }),
        ...(account.punchCard && {
          punchCardRemaining: account.punchCard.remaining,
          punchCardExpiryDate: account.punchCard.expiryDate,
        }),
      },
    });

    if (account.monthlyMembership) {
      const member = await prisma.member.findUnique({ where: { userId: user.id } });
      const existing = member
        ? await prisma.membership.findFirst({ where: { memberId: member.id, plan: 'MONTHLY' } })
        : null;
      if (member && !existing) {
        await prisma.membership.create({
          data: {
            memberId: member.id,
            plan: 'MONTHLY',
            startDate: now,
            currentPeriodEnd: account.monthlyMembership.currentPeriodEnd,
            status: 'ACTIVE',
            autoRenew: true,
          },
        });
      }
    }

    console.log(`✅ ${account.email} (${account.accountType} / ${account.membershipPlan})`);
  }

  console.log('\n✨ Test accounts ready:');
  for (const account of ACCOUNTS) {
    console.log(`  ${account.accountType.padEnd(6)} ${account.email} / ${account.password}`);
  }
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
