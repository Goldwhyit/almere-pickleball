import {
  Controller,
  Post,
  Get,
  UseGuards,
  Body,
  Req,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MembershipsService } from './memberships.service';
import { CreateMembershipApplicationDto, CreatePaymentDto } from './dtos';

@ApiTags('memberships')
@Controller('memberships')
export class MembershipsController {
  constructor(private membershipsService: MembershipsService) {}

  @Post('apply')
  @ApiOperation({ summary: 'Create new membership application' })
  async createMembershipApplication(
    @Body() dto: CreateMembershipApplicationDto,
  ) {
    return this.membershipsService.createMembershipApplication(dto);
  }

  @Get('types')
  @ApiOperation({ summary: 'Get available membership types' })
  async getMembershipTypes(@Req() req: any) {
    return this.membershipsService.getMembershipTypes();
  }

  @Post('create-session-payment')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create payment for per-session booking' })
  async createSessionPayment(@Req() req: any, @Body() dto: CreatePaymentDto) {
    return this.membershipsService.createSessionPayment(req.user.id, dto);
  }

  @Get('payment-status')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get member payment status and expiry info' })
  async getPaymentStatus(@Req() req: any) {
    return this.membershipsService.getPaymentStatus(req.user.id);
  }

  @Get('check-monthly-payment')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Check if MONTHLY member needs to pay this month' })
  async checkMonthlyPaymentRequired(@Req() req: any) {
    return this.membershipsService.checkMonthlyPaymentRequired(req.user.id);
  }

  @Post('confirm-monthly-payment')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Confirm MONTHLY membership payment' })
  async confirmMonthlyPayment(@Req() req: any) {
    return this.membershipsService.confirmMonthlyPayment(req.user.id);
  }
}
