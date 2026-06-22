import { Module } from '@nestjs/common';
import { PlayDayRegistrationsController } from './play-day-registrations.controller';
import { PlayDayRegistrationsService } from './play-day-registrations.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PlayDayRegistrationsController],
  providers: [PlayDayRegistrationsService],
  exports: [PlayDayRegistrationsService],
})
export class PlayDaysModule {}
