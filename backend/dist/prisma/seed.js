"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = require("bcrypt");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Starting seed...');
    await prisma.$transaction([
        prisma.scoreLog.deleteMany(),
        prisma.set.deleteMany(),
        prisma.match.deleteMany(),
        prisma.courtAvailability.deleteMany(),
        prisma.court.deleteMany(),
        prisma.tournamentRegistration.deleteMany(),
        prisma.payment.deleteMany(),
        prisma.guestPlayer.deleteMany(),
        prisma.playerStatistics.deleteMany(),
        prisma.clubRanking.deleteMany(),
        prisma.tournament.deleteMany(),
        prisma.notification.deleteMany(),
        prisma.newsArticle.deleteMany(),
        prisma.event.deleteMany(),
        prisma.member.deleteMany(),
        prisma.user.deleteMany(),
    ]);
    const hashedPassword = await bcrypt.hash('password123', 10);
    const admin = await prisma.user.create({
        data: {
            email: 'admin@almere-pickleball.nl',
            password: hashedPassword,
            role: 'ADMIN',
            member: {
                create: {
                    firstName: 'Admin',
                    lastName: 'User',
                    phone: '+31612345678',
                    duprRating: 4.5,
                    skillLevel: 'advanced',
                },
            },
        },
    });
    const organizer = await prisma.user.create({
        data: {
            email: 'organizer@almere-pickleball.nl',
            password: hashedPassword,
            role: 'ORGANIZER',
            member: {
                create: {
                    firstName: 'Jan',
                    lastName: 'Organizer',
                    phone: '+31687654321',
                    duprRating: 4.0,
                    skillLevel: 'advanced',
                },
            },
        },
    });
    const members = await Promise.all([
        prisma.user.create({
            data: {
                email: 'piet@example.nl',
                password: hashedPassword,
                role: 'MEMBER',
                member: {
                    create: {
                        firstName: 'Piet',
                        lastName: 'de Vries',
                        phone: '+31623456789',
                        duprRating: 3.8,
                        skillLevel: 'intermediate',
                    },
                },
            },
        }),
        prisma.user.create({
            data: {
                email: 'maria@example.nl',
                password: hashedPassword,
                role: 'MEMBER',
                member: {
                    create: {
                        firstName: 'Maria',
                        lastName: 'Jansen',
                        phone: '+31634567890',
                        duprRating: 3.5,
                        skillLevel: 'intermediate',
                    },
                },
            },
        }),
        prisma.user.create({
            data: {
                email: 'lisa@example.nl',
                password: hashedPassword,
                role: 'MEMBER',
                member: {
                    create: {
                        firstName: 'Lisa',
                        lastName: 'Bakker',
                        phone: '+31645678901',
                        duprRating: 3.6,
                        skillLevel: 'intermediate',
                    },
                },
            },
        }),
    ]);
    console.log('✅ Users and members created');
    const courts = await Promise.all([
        prisma.court.create({ data: { name: 'Baan 1' } }),
        prisma.court.create({ data: { name: 'Baan 2' } }),
        prisma.court.create({ data: { name: 'Baan 3' } }),
        prisma.court.create({ data: { name: 'Baan 4' } }),
    ]);
    console.log('✅ Courts created');
    const tournament = await prisma.tournament.create({
        data: {
            name: 'Clubkampioenschap 2026',
            type: 'DOUBLES',
            format: 'SINGLE_ELIMINATION',
            status: 'OPEN',
            startDate: new Date('2026-02-15'),
            endDate: new Date('2026-02-16'),
            location: 'Sporthal Almere',
            maxParticipants: 16,
            entryFee: 15.00,
            registrationDeadline: new Date('2026-02-10'),
            rules: {
                scoring: 'best_of_3',
                pointsPerSet: 11,
                winBy: 2,
                timePerMatch: 45,
            },
            hasConsolation: true,
            hasBronzeMatch: true,
            description: 'Jaarlijks clubkampioenschap voor alle leden',
            createdById: organizer.id,
        },
    });
    console.log('✅ Tournament created');
    await prisma.newsArticle.create({
        data: {
            title: 'Welkom bij Almere Pickleball!',
            slug: 'welkom-bij-almere-pickleball',
            content: `# Welkom bij Almere Pickleball!

We zijn trots om jullie te verwelkomen bij de snelst groeiende pickleballclub van Nederland!

## Wat is Pickleball?

Pickleball is een combinatie van tennis, badminton en tafeltennis. Het is geschikt voor alle leeftijden en is makkelijk te leren!

## Onze Faciliteiten

- 4 Indoor banen
- Modern clubhuis
- Professionele trainers
- Sociale activiteiten

Kom langs voor een proefles!`,
            excerpt: 'Ontdek de snelst groeiende racquetsport van Nederland!',
            authorId: admin.id,
            isPublished: true,
            publishedAt: new Date(),
        },
    });
    console.log('✅ News article created');
    await prisma.event.create({
        data: {
            title: 'Gratis Proefles',
            description: 'Kom kennismaken met pickleball tijdens onze gratis proefles!',
            eventType: 'TRAINING',
            startDatetime: new Date('2026-02-01T10:00:00'),
            endDatetime: new Date('2026-02-01T12:00:00'),
            location: 'Sporthal Almere',
            isPublic: true,
            maxParticipants: 20,
            registrationRequired: true,
            createdById: organizer.id,
        },
    });
    console.log('✅ Event created');
    console.log('🎉 Seed completed successfully!');
    console.log('\n📧 Test credentials:');
    console.log('Admin: admin@almere-pickleball.nl / password123');
    console.log('Organizer: organizer@almere-pickleball.nl / password123');
    console.log('Member: piet@example.nl / password123');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map