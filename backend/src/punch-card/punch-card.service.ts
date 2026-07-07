import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Member, MembershipPlan } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { validateSessionSlot } from '../common/validate-session-date';

const PUNCH_CARD_TOTAL = 10;
const PUNCH_CARD_WEEKDAYS = [2, 4]; // dinsdag, donderdag

@Injectable()
export class PunchCardService {
  constructor(private readonly prisma: PrismaService) {}

  private async findPunchCardMember(userId: string): Promise<Member> {
    const member = await this.prisma.member.findUnique({ where: { userId } });
    if (!member) {
      throw new NotFoundException('Member not found for this user');
    }
    if (member.membershipPlan !== MembershipPlan.PUNCH_CARD) {
      throw new ForbiddenException('Dit account heeft geen strippenkaart');
    }
    return member;
  }

  private validateSlot(member: Member, dateStr: string): Date {
    return validateSessionSlot({
      dateStr,
      allowedWeekdays: PUNCH_CARD_WEEKDAYS,
      windowEnd: member.punchCardExpiryDate,
      windowExpiredMessage: 'Deze datum valt buiten de geldigheid van je strippenkaart',
    });
  }

  private async syncRemaining(memberId: string) {
    const count = await this.prisma.punchCardSession.count({ where: { memberId } });
    const remaining = Math.max(0, PUNCH_CARD_TOTAL - count);
    await this.prisma.member.update({ where: { id: memberId }, data: { punchCardRemaining: remaining } });
    return remaining;
  }

  async getMyStatus(userId: string) {
    const member = await this.findPunchCardMember(userId);
    const sessions = await this.prisma.punchCardSession.findMany({
      where: { memberId: member.id },
      orderBy: { scheduledDate: 'asc' },
    });

    return {
      member,
      total: PUNCH_CARD_TOTAL,
      remaining: Math.max(0, PUNCH_CARD_TOTAL - sessions.length),
      sessions,
      expiryDate: member.punchCardExpiryDate,
    };
  }

  async bookDate(userId: string, dateStr: string) {
    const member = await this.findPunchCardMember(userId);
    const activeCount = await this.prisma.punchCardSession.count({ where: { memberId: member.id } });
    if (activeCount >= PUNCH_CARD_TOTAL) {
      throw new BadRequestException('Je strippenkaart is op');
    }

    const date = this.validateSlot(member, dateStr);

    const existing = await this.prisma.punchCardSession.findFirst({
      where: { memberId: member.id, scheduledDate: date },
    });
    if (existing) {
      throw new ConflictException('Deze datum is al geboekt');
    }

    const session = await this.prisma.punchCardSession.create({
      data: { memberId: member.id, scheduledDate: date },
    });

    const remaining = await this.syncRemaining(member.id);

    return { success: true, message: 'Sessie ingepland', session, remaining };
  }

  async cancelSession(userId: string, sessionId: string) {
    const member = await this.findPunchCardMember(userId);
    const session = await this.prisma.punchCardSession.findFirst({
      where: { id: sessionId, memberId: member.id },
    });

    if (!session) {
      throw new NotFoundException('Sessie niet gevonden');
    }

    if (session.scheduledDate.getTime() <= Date.now()) {
      throw new BadRequestException('Deze sessie is al verstreken');
    }

    await this.prisma.punchCardSession.delete({ where: { id: sessionId } });
    const remaining = await this.syncRemaining(member.id);

    return { success: true, message: 'Sessie geannuleerd', remaining };
  }

  async rescheduleSession(userId: string, sessionId: string, newDateStr: string) {
    const member = await this.findPunchCardMember(userId);
    const session = await this.prisma.punchCardSession.findFirst({
      where: { id: sessionId, memberId: member.id },
    });

    if (!session) {
      throw new NotFoundException('Sessie niet gevonden');
    }

    if (session.scheduledDate.getTime() <= Date.now()) {
      throw new BadRequestException('Deze sessie is al verstreken');
    }

    const date = this.validateSlot(member, newDateStr);

    const existing = await this.prisma.punchCardSession.findFirst({
      where: { memberId: member.id, scheduledDate: date, id: { not: sessionId } },
    });
    if (existing) {
      throw new ConflictException('Deze datum is al geboekt');
    }

    const updated = await this.prisma.punchCardSession.update({
      where: { id: sessionId },
      data: { scheduledDate: date },
    });

    return { success: true, session: updated };
  }
}
