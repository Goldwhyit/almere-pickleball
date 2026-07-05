import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...\n');

  // Hash password once
  const hashedPassword = await bcrypt.hash('password123', 10);

  // ============================================
  // Create Users
  // ============================================
  console.log('📝 Creating users...');

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@almere-pickleball.nl' },
    update: {},
    create: {
      email: 'admin@almere-pickleball.nl',
      password: hashedPassword,
      role: 'ADMIN',
      isActive: true,
      emailVerified: true,
    },
  });

  const organizerUser = await prisma.user.upsert({
    where: { email: 'organizer@almere-pickleball.nl' },
    update: {},
    create: {
      email: 'organizer@almere-pickleball.nl',
      password: hashedPassword,
      role: 'ORGANIZER',
      isActive: true,
      emailVerified: true,
    },
  });

  const members = await Promise.all([
    prisma.user.upsert({
      where: { email: 'piet@example.nl' },
      update: {},
      create: {
        email: 'piet@example.nl',
        password: hashedPassword,
        role: 'MEMBER',
        isActive: true,
        emailVerified: true,
      },
    }),
    prisma.user.upsert({
      where: { email: 'maria@example.nl' },
      update: {},
      create: {
        email: 'maria@example.nl',
        password: hashedPassword,
        role: 'MEMBER',
        isActive: true,
        emailVerified: true,
      },
    }),
    prisma.user.upsert({
      where: { email: 'jan@example.nl' },
      update: {},
      create: {
        email: 'jan@example.nl',
        password: hashedPassword,
        role: 'MEMBER',
        isActive: true,
        emailVerified: true,
      },
    }),
    prisma.user.upsert({
      where: { email: 'trial@example.nl' },
      update: {},
      create: {
        email: 'trial@example.nl',
        password: hashedPassword,
        role: 'MEMBER',
        isActive: true,
        emailVerified: true,
      },
    }),
  ]);

  console.log('✅ Users created\n');

  // ============================================
  // Create Members
  // ============================================
  console.log('👥 Creating members...');

  await prisma.member.upsert({
    where: { userId: adminUser.id },
    update: {},
    create: {
      userId: adminUser.id,
      firstName: 'Admin',
      lastName: 'User',
      phone: '+31612345678',
      accountType: 'ADMIN',
      membershipStatus: 'ACTIVE',
      membershipPlan: 'YEARLY',
    },
  });

  await prisma.member.upsert({
    where: { userId: organizerUser.id },
    update: {},
    create: {
      userId: organizerUser.id,
      firstName: 'Organizer',
      lastName: 'User',
      phone: '+31612345679',
      accountType: 'MEMBER',
      membershipStatus: 'ACTIVE',
      membershipPlan: 'YEARLY',
    },
  });

  for (const [index, memberUser] of members.entries()) {
    const memberNames = [
      { first: 'Piet', last: 'Jansen' },
      { first: 'Maria', last: 'de Vries' },
      { first: 'Jan', last: 'Pieterse' },
      { first: 'Trial', last: 'Member' },
    ];
    const { first, last } = memberNames[index];
    const isTrialMember = index === 3;

    await prisma.member.upsert({
      where: { userId: memberUser.id },
      update: {},
      create: {
        userId: memberUser.id,
        firstName: first,
        lastName: last,
        phone: `+316123456${80 + index}`,
        accountType: isTrialMember ? 'TRIAL' : 'MEMBER',
        membershipStatus: isTrialMember ? 'ACTIVE' : 'ACTIVE',
        membershipPlan: 'PER_SESSION',
        ...(isTrialMember && {
          trialStartDate: new Date(),
          trialEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          trialStatus: 'ACTIVE',
        }),
      },
    });
  }

  console.log('✅ Members created\n');

  // ============================================
  // Create Courts
  // ============================================
  console.log('🏢 Creating courts...');

  for (let i = 1; i <= 4; i++) {
    await prisma.court.upsert({
      where: { name: `Baan ${i}` },
      update: {},
      create: {
        name: `Baan ${i}`,
        location: 'Sportcomplex Almere',
        isActive: true,
      },
    });
  }

  console.log('✅ Courts created\n');

  // ============================================
  // Create Play Days
  // ============================================
  console.log('📅 Creating play days...');

  const courts = await prisma.court.findMany();
  const daysOfWeek = ['Maandag', 'Dinsdag', 'Woensdag', 'Donderdag'];

  for (const [index, court] of courts.entries()) {
    const scheduledDate = new Date();
    scheduledDate.setDate(scheduledDate.getDate() + index + 1);

    await prisma.playDay.create({
      data: {
        courtId: court.id,
        scheduledDate,
        startTime: '19:00',
        endTime: '21:00',
        maxPlayers: 4,
        playerCount: 0,
        price: 10.0,
        status: 'SCHEDULED',
        description: `${daysOfWeek[index]} avond spelen`,
      },
    });
  }

  console.log('✅ Play days created\n');

  // ============================================
  // Create Play Day Registrations
  // ============================================
  console.log('📋 Creating play day registrations...');

  const playDays = await prisma.playDay.findMany({ take: 2 });
  const regularMembers = members.slice(0, 3);

  let registrationCount = 0;
  for (const playDay of playDays) {
    for (const [index, memberUser] of regularMembers.entries()) {
      const member = await prisma.member.findUnique({
        where: { userId: memberUser.id },
      });

      if (member) {
        try {
          await prisma.playDayRegistration.create({
            data: {
              playDayId: playDay.id,
              memberId: member.id,
              status: 'REGISTERED',
            },
          });
          registrationCount++;
        } catch (e) {
          // Registration might already exist
        }
      }
    }
  }

  console.log(`✅ Play day registrations created (${registrationCount})\n`);

  // ============================================
  // Create Trial Lessons
  // ============================================
  console.log('🎾 Creating trial lessons...');

  const trialMember = await prisma.member.findFirst({
    where: { accountType: 'TRIAL' },
  });

  if (trialMember) {
    for (let i = 1; i <= 3; i++) {
      const lessonDate = new Date();
      lessonDate.setDate(lessonDate.getDate() + i * 7);

      await prisma.trialLesson.create({
        data: {
          memberId: trialMember.id,
          scheduledDate: lessonDate,
          completed: false,
        },
      });
    }
  }

  console.log('✅ Trial lessons created\n');

  // ============================================
  // Create Tournaments
  // ============================================
  console.log('🏆 Creating tournaments...');

  const startDate = new Date();
  startDate.setDate(startDate.getDate() + 30);
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 1);

  await prisma.tournament.upsert({
    where: { id: 'tour_spring_2024' },
    update: {},
    create: {
      id: 'tour_spring_2024',
      name: 'Almere Spring Tournament 2024',
      description: 'Spring pickleball tournament',
      format: 'ROUND_ROBIN',
      status: 'DRAFT',
      startDate,
      endDate,
      location: 'Sportcomplex Almere',
      maxParticipants: 16,
      entryFee: 25.0,
      createdBy: organizerUser.id,
    },
  });

  console.log('✅ Tournaments created\n');

  // ============================================
  // Create Club Updates
  // ============================================
  console.log('📢 Creating club updates...');

  const updates = [
    {
      title: 'Welkom bij Almere Pickleball!',
      content: 'We zijn erg blij je welkom te heten in onze pickleball club.',
      category: 'NEWS',
    },
    {
      title: 'Nieuwe banen geopend',
      content: 'We hebben twee nieuwe pickleball banen geopend!',
      category: 'ANNOUNCEMENT',
    },
    {
      title: 'Zomervakantie planning',
      content: 'Zomervakantie schema aangepast',
      category: 'SCHEDULE',
    },
  ];

  for (const update of updates) {
    await prisma.clubUpdate.upsert({
      where: { id: `update_${update.title.toLowerCase().replace(/ /g, '_')}` },
      update: {},
      create: {
        title: update.title,
        content: update.content,
        category: update.category,
        published: true,
      },
    });
  }

  console.log('✅ Club updates created\n');

  console.log('✨ Database seeding complete!');
  console.log('\nTest accounts:');
  console.log('  Admin:     admin@almere-pickleball.nl / password123');
  console.log('  Organizer: organizer@almere-pickleball.nl / password123');
  console.log('  Member:    piet@example.nl / password123');
  console.log('  Trial:     trial@example.nl / password123\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
