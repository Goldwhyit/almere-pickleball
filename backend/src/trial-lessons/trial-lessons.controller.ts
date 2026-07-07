import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser, Public } from '../common/decorators/auth.decorators';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { BookTrialDateDto } from './dto/book-trial-date.dto';
import { CreateTrialSignupDto } from './dto/create-trial-signup.dto';
import { ExpireTrialDto } from './dto/expire-trial.dto';
import { TrialLessonsService } from './trial-lessons.service';

@ApiTags('Trial Lessons')
@Controller('trial-lessons')
export class TrialLessonsController {
  constructor(private readonly trialLessonsService: TrialLessonsService) {}

  @Public()
  @Post('signup')
  @ApiOperation({ summary: 'Sign up a new trial member' })
  @ApiResponse({ status: 201, description: 'Trial signup created successfully' })
  async signup(@Body() createTrialSignupDto: CreateTrialSignupDto) {
    return this.trialLessonsService.signup(createTrialSignupDto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('my-lessons')
  @ApiOperation({ summary: "Get the authenticated member's trial lessons" })
  async getMyLessons(@CurrentUser() user: any) {
    return this.trialLessonsService.getMyLessons(user.userId || user.id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('my-status')
  @ApiOperation({ summary: 'Get the authenticated member trial status' })
  async getMyStatus(@CurrentUser() user: any) {
    return this.trialLessonsService.getMyStatus(user.userId || user.id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('book-date')
  @ApiOperation({ summary: 'Book a single trial lesson date for the authenticated member' })
  async bookDate(@CurrentUser() user: any, @Body() bookTrialDateDto: BookTrialDateDto) {
    return this.trialLessonsService.bookDate(user.userId || user.id, bookTrialDateDto.date);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete('lessons/:lessonId')
  @ApiOperation({ summary: 'Cancel an upcoming trial lesson' })
  async cancelLesson(@CurrentUser() user: any, @Param('lessonId') lessonId: string) {
    return this.trialLessonsService.cancelLesson(user.userId || user.id, lessonId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Put(':lessonId/reschedule')
  @ApiOperation({ summary: 'Reschedule one trial lesson' })
  async rescheduleLesson(@CurrentUser() user: any, @Param('lessonId') lessonId: string, @Body('newDate') newDate: string) {
    return this.trialLessonsService.rescheduleLesson(user.userId || user.id, lessonId, newDate);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('convert-to-member')
  @ApiOperation({ summary: 'Convert a trial member into a paid member' })
  async convertToMember(@CurrentUser() user: any, @Body('membershipPlan') membershipPlan: string) {
    return this.trialLessonsService.convertToMember(user.userId || user.id, membershipPlan);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('decline-membership')
  @ApiOperation({ summary: 'Decline the trial membership offer' })
  async declineMembership(@CurrentUser() user: any, @Body() expireTrialDto: ExpireTrialDto) {
    return this.trialLessonsService.declineMembership(user.userId || user.id, expireTrialDto.reason, expireTrialDto.feedback);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('admin/all')
  @ApiOperation({ summary: 'List all trial members for admin use' })
  async getAllTrialMembers(@Query('status') status?: string, @Query('startDate') startDate?: string, @Query('endDate') endDate?: string) {
    return this.trialLessonsService.getAllTrialMembers({ status, startDate, endDate });
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('admin/:memberId')
  @ApiOperation({ summary: 'Get detailed trial information for one member' })
  async getTrialMemberDetails(@Param('memberId') memberId: string) {
    return this.trialLessonsService.getTrialMemberDetails(memberId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Put('admin/:lessonId/mark-completed')
  @ApiOperation({ summary: 'Mark a trial lesson as completed' })
  async markLessonCompleted(@Param('lessonId') lessonId: string) {
    return this.trialLessonsService.markLessonCompleted(lessonId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('admin/stats/overview')
  @ApiOperation({ summary: 'Get trial lesson overview statistics' })
  async getStatsOverview() {
    return this.trialLessonsService.getStatsOverview();
  }
}
