import { Module } from '@nestjs/common';
import { TrialLessonsService } from './trial-lessons.service';
import { TrialLessonsController } from './trial-lessons.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [TrialLessonsService],
  controllers: [TrialLessonsController],
  exports: [TrialLessonsService],
})
export class TrialLessonsModule {}
