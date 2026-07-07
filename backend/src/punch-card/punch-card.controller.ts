import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/auth.decorators';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { BookPunchCardDateDto } from './dto/book-punch-card-date.dto';
import { PunchCardService } from './punch-card.service';

@ApiTags('Punch Card')
@Controller('punch-card')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PunchCardController {
  constructor(private readonly punchCardService: PunchCardService) {}

  @Get('my-status')
  @ApiOperation({ summary: 'Get the authenticated member punch card status and sessions' })
  async getMyStatus(@CurrentUser() user: any) {
    return this.punchCardService.getMyStatus(user.userId || user.id);
  }

  @Post('book-date')
  @ApiOperation({ summary: 'Book a single punch card session date' })
  async bookDate(@CurrentUser() user: any, @Body() bookPunchCardDateDto: BookPunchCardDateDto) {
    return this.punchCardService.bookDate(user.userId || user.id, bookPunchCardDateDto.date);
  }

  @Put('sessions/:sessionId/reschedule')
  @ApiOperation({ summary: 'Reschedule an upcoming punch card session' })
  async rescheduleSession(
    @CurrentUser() user: any,
    @Param('sessionId') sessionId: string,
    @Body('newDate') newDate: string,
  ) {
    return this.punchCardService.rescheduleSession(user.userId || user.id, sessionId, newDate);
  }

  @Delete('sessions/:sessionId')
  @ApiOperation({ summary: 'Cancel an upcoming punch card session' })
  async cancelSession(@CurrentUser() user: any, @Param('sessionId') sessionId: string) {
    return this.punchCardService.cancelSession(user.userId || user.id, sessionId);
  }
}
