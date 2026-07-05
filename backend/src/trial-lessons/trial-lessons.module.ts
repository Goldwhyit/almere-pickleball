import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { TrialLessonsController } from './trial-lessons.controller';
import { TrialLessonsService } from './trial-lessons.service';

@Module({
  imports: [PrismaModule],
  controllers: [TrialLessonsController],
  providers: [TrialLessonsService],
  exports: [TrialLessonsService],
})
export class TrialLessonsModule {}
