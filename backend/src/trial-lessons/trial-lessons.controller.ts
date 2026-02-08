import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TrialLessonsService } from './trial-lessons.service';
import {
  SignupTrialDto,
  BookTrialDatesDto,
  RescheduleLessonDto,
  DeclineTrialDto,
  MarkLessonCompletedDto,
  BookTrainingDto,
} from './dtos';

@ApiTags('trial-lessons')
@Controller('trial-lessons')
export class TrialLessonsController {
  constructor(private trialLessonsService: TrialLessonsService) {}

  // ============================================================================
  // PUBLIC ENDPOINTS
  // ============================================================================

  @Post('signup')
  @ApiOperation({ summary: 'Sign up for trial lessons (public)' })
  async signup(@Body() dto: SignupTrialDto) {
    if (!dto.firstName || !dto.lastName || !dto.email || !dto.phone || !dto.password) {
      throw new BadRequestException('All fields required');
    }
    return this.trialLessonsService.signupTrialLesson(dto);
  }

  @Get('available-dates')
  @ApiOperation({ summary: 'Get available lesson dates (public)' })
  async getAvailableDates() {
    return this.trialLessonsService.getAvailableDates();
  }

  // ============================================================================
  // PROTECTED USER ENDPOINTS
  // ============================================================================

  @Get('my-status')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get trial status for current user' })
  async getMyStatus(@Req() req: any) {
    return this.trialLessonsService.getMyStatus(req.user.id);
  }

  @Get('my-lessons')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get trial lessons for current user' })
  async getMyLessons(@Req() req: any) {
    return this.trialLessonsService.getMyLessons(req.user.id);
  }

  @Get('my-bookings')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get member\'s training bookings' })
  async getMyBookings(@Req() req: any) {
    return this.trialLessonsService.getMyBookings(req.user.id);
  }

  @Post('book-dates')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Book 3 trial lesson dates' })
  async bookTrialDates(@Req() req: any, @Body() dto: BookTrialDatesDto) {
    return this.trialLessonsService.bookTrialDates(req.user.id, dto);
  }

  @Post('book-training')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Book a training session (member with punch card)' })
  async bookTraining(@Req() req: any, @Body() dto: BookTrainingDto) {
    return this.trialLessonsService.bookTraining(req.user.id, dto);
  }

  @Delete(':lessonId/cancel')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel a training session (must be 4+ hours before)' })
  async cancelTraining(@Req() req: any, @Param('lessonId') lessonId: string) {
    return this.trialLessonsService.cancelTraining(req.user.id, lessonId);
  }

  @Post('register')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Register for a training date (non-punch card members)' })
  async registerForTraining(@Req() req: any, @Body() dto: BookTrainingDto) {
    return this.trialLessonsService.registerForTraining(req.user.id, dto);
  }

  @Get('my-registrations')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get member\'s training registrations' })
  async getMyRegistrations(@Req() req: any) {
    return this.trialLessonsService.getMyRegistrations(req.user.id);
  }

  @Delete('registration/:registrationId/cancel')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel a training registration' })
  async cancelRegistration(@Req() req: any, @Param('registrationId') registrationId: string) {
    return this.trialLessonsService.cancelRegistration(req.user.id, registrationId);
  }

  @Put(':lessonId/reschedule')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reschedule a trial lesson' })
  async rescheduleLesson(
    @Req() req: any,
    @Param('lessonId') lessonId: string,
    @Body() dto: RescheduleLessonDto,
  ) {
    return this.trialLessonsService.rescheduleLesson(
      req.user.id,
      lessonId,
      dto,
    );
  }

  @Post('convert-to-member')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Convert trial account to paid member' })
  async convertToMember(@Req() req: any) {
    return this.trialLessonsService.convertToMember(req.user.id);
  }

  @Post('decline-membership')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Decline membership with feedback' })
  async declineTrialMembership(
    @Req() req: any,
    @Body() dto: DeclineTrialDto,
  ) {
    return this.trialLessonsService.declineTrialMembership(req.user.id, dto);
  }

  // ============================================================================
  // ADMIN ENDPOINTS
  // ============================================================================

  @Get('admin/all')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all trial members (admin)' })
  async getAllTrialMembers(
    @Query('limit') limit: number = 25,
    @Query('offset') offset: number = 0,
    @Query('status') status?: string,
  ) {
    return this.trialLessonsService.getAllTrialMembers(
      Number(limit),
      Number(offset),
      status as any,
    );
  }

  @Get('admin/:memberId')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get trial member details (admin)' })
  async getTrialMemberDetails(@Param('memberId') memberId: string) {
    return this.trialLessonsService.getTrialMemberDetails(memberId);
  }

  @Put('admin/:lessonId/mark-completed')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mark lesson as completed (admin)' })
  async markLessonCompleted(
    @Param('lessonId') lessonId: string,
    @Body() dto: MarkLessonCompletedDto,
  ) {
    return this.trialLessonsService.markLessonCompleted(lessonId, dto);
  }

  @Get('admin/stats/overview')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get trial statistics (admin)' })
  async getTrialStats(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.trialLessonsService.getTrialStats(startDate, endDate);
  }
}
