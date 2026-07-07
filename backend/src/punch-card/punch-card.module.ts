import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { PunchCardController } from './punch-card.controller';
import { PunchCardService } from './punch-card.service';

@Module({
  imports: [PrismaModule],
  controllers: [PunchCardController],
  providers: [PunchCardService],
  exports: [PunchCardService],
})
export class PunchCardModule {}
