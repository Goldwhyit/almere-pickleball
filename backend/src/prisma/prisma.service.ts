import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async cleanDatabase() {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Cannot clean database in production');
    }
    
    // Order matters due to foreign key constraints
    const models = [
      'scoreLog',
      'set',
      'match',
      'courtAvailability',
      'court',
      'tournamentRegistration',
      'payment',
      'guestPlayer',
      'playerStatistics',
      'clubRanking',
      'tournament',
      'notification',
      'newsArticle',
      'event',
      'member',
      'user',
    ];

    for (const model of models) {
      await this[model].deleteMany();
    }
  }
}
