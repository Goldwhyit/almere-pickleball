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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
