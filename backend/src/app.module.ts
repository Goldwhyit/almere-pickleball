import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CourtsModule } from './courts/courts.module';
import { MembersModule } from './members/members.module';
import { PlayDaysModule } from './play-days/play-days.module';
import { PrismaModule } from './prisma/prisma.module';
import { TournamentsModule } from './tournaments/tournaments.module';
import { TrialLessonsModule } from './trial-lessons/trial-lessons.module';
import { MembershipsModule } from './memberships/memberships.module';
import { MatchesModule } from './matches/matches.module';
import { PunchCardModule } from './punch-card/punch-card.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    MembersModule,
    CourtsModule,
    PlayDaysModule,
    TournamentsModule,
    TrialLessonsModule,
    MembershipsModule,
    MatchesModule,
    PunchCardModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
