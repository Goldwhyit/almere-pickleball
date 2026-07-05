import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('matches')
export class MatchesController {
  @UseGuards(JwtAuthGuard)
  @Get('next')
  getNextMatch() {
    return {
      matchNumber: 0,
      roundName: 'Komende sessie',
      scheduledDatetime: null,
      courtNumber: null,
      status: 'PENDING',
    };
  }
}
