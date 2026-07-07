import { Controller, Get, Put, Body, UseGuards, Request, Patch, Param, Delete } from '@nestjs/common';
import { MailService } from '../common/mail.service';
import { Public } from '../common/decorators/auth.decorators';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('Members')
@Controller('members')
@UseGuards(JwtAuthGuard)
export class MembersController {
  constructor(private prisma: PrismaService, private mailService: MailService) {}

  @Get('profile')
  async getProfile(@Request() req: any) {
    const userId = req.user?.userId || req.user?.id;
    if (!userId) throw new Error('Geen userId in JWT');
    return this.prisma.member.findUnique({
      where: { userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        membershipStatus: true,
        membershipPlan: true,
        punchCardRemaining: true,
        punchCardExpiryDate: true,
        user: { select: { id: true, email: true } },
      },
    });
  }

  @Put('profile')
  async updateProfile(@Request() req: any, @Body() data: any) {
    const userId = req.user?.userId || req.user?.id;
    if (!userId) throw new Error('Geen userId in JWT');
    return this.prisma.member.update({
      where: { userId },
      data: { ...data },
    });
  }

  @Get('all')
  @ApiBearerAuth()
  async getAllMembers() {
    return this.prisma.member.findMany({
      include: {
        memberships: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });
  }

  @Get('stats')
  async getStats(@Request() req: any) {
    const userId = req.user?.userId || req.user?.id;
    if (!userId) throw new Error('Geen userId in JWT');
    return { matchesPlayed: 0, winPercentage: 0, duprRating: 3.0, clubRanking: 0 };
  }

  @Get('dashboard')
  async getDashboard(@Request() req: any) {
    const userId = req.user?.userId || req.user?.id;
    if (!userId) throw new Error('Geen userId in JWT');
    return { matches: [], registeredTournaments: [], clubUpdates: [] };
  }

  @Patch(':memberId/activate')
  async activateMember(@Param('memberId') memberId: string) {
    return this.prisma.member.update({
      where: { id: memberId },
      data: { membershipStatus: 'ACTIVE' },
    });
  }

  @Patch('applications/:id/approve')
  async approveMembership(@Param('id') id: string) {
    return { id, approved: true };
  }

  @Patch('applications/:id/reject')
  async rejectMembership(@Param('id') id: string) {
    return { id, rejected: true };
  }
}
