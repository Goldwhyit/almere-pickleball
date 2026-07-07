import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public, CurrentUser, Roles } from '../common/decorators/auth.decorators';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { ApplyMembershipDto } from './dto/apply-membership.dto';
import { MembershipsService } from './memberships.service';

@ApiTags('Memberships')
@Controller('memberships')
export class MembershipsController {
  constructor(private readonly membershipsService: MembershipsService) {}

  @Public()
  @Post('apply')
  @ApiOperation({ summary: 'Apply for a membership' })
  @ApiResponse({ status: 201, description: 'Membership application submitted' })
  async apply(@Body() applyMembershipDto: ApplyMembershipDto) {
    return this.membershipsService.apply(applyMembershipDto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('plans')
  async getPlans() {
    return this.membershipsService.getPlans();
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('applications')
  async getApplications(@CurrentUser() user: any) {
    return this.membershipsService.getApplications(user.userId || user.id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('my-membership')
  async getMyMembership(@CurrentUser() user: any) {
    return this.membershipsService.getMyMembership(user.userId || user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @Patch(':membershipId/mark-paid')
  async markPaid(@Param('membershipId') membershipId: string) {
    return this.membershipsService.markPaymentReceived(membershipId);
  }
}
