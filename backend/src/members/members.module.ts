import { Module } from '@nestjs/common';
import { MembersController } from './members.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { MailService } from '../common/mail.service';

@Module({
  imports: [PrismaModule],
  controllers: [MembersController],
  providers: [MailService],
})
export class MembersModule {}
