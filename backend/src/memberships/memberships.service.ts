import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { MembershipPlan } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ApplyMembershipDto } from './dto/apply-membership.dto';

const MEMBERSHIP_PLAN_ALIASES: Record<string, MembershipPlan> = {
  per_session: MembershipPlan.PER_SESSION,
  punch_card: MembershipPlan.PUNCH_CARD,
  monthly: MembershipPlan.MONTHLY,
  yearly: MembershipPlan.YEARLY,
  yearly_upfront: MembershipPlan.YEARLY_UPFRONT,
};

const MONTHLY_PRICE = 15.75;

function addMonths(date: Date, months: number): Date {
  const result = new Date(date.getTime());
  result.setMonth(result.getMonth() + months);
  return result;
}

function resolveMembershipPlan(membershipType?: string): MembershipPlan {
  if (!membershipType) return MembershipPlan.PER_SESSION;
  if ((Object.values(MembershipPlan) as string[]).includes(membershipType)) {
    return membershipType as MembershipPlan;
  }
  return MEMBERSHIP_PLAN_ALIASES[membershipType.toLowerCase()] || MembershipPlan.PER_SESSION;
}

@Injectable()
export class MembershipsService {
  constructor(private readonly prisma: PrismaService) {}

  async apply(dto: ApplyMembershipDto) {
    if (!dto.agreedToTerms || !dto.agreedToPrivacy) {
      throw new BadRequestException('You must accept the terms and privacy policy');
    }

    const existingUser = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existingUser) {
      throw new ConflictException('An account with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const membershipPlan = resolveMembershipPlan(dto.membershipType);
    const isPunchCard = membershipPlan === MembershipPlan.PUNCH_CARD;
    const isMonthly = membershipPlan === MembershipPlan.MONTHLY;
    const now = new Date();

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        role: 'MEMBER',
        isActive: true,
      },
    });

    const member = await this.prisma.member.create({
      data: {
        userId: user.id,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : null,
        street: dto.street,
        houseNumber: dto.houseNumber,
        postalCode: dto.postalCode,
        city: dto.city,
        emergencyName: dto.emergencyName,
        emergencyPhone: dto.emergencyPhone,
        emergencyRelation: dto.emergencyRelation,
        accountType: 'MEMBER',
        membershipStatus: 'PENDING',
        membershipPlan,
        trialStatus: 'PENDING',
        ...(isPunchCard && {
          punchCardRemaining: 10,
          punchCardExpiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
        }),
      },
    });

    if (isMonthly) {
      await this.prisma.membership.create({
        data: {
          memberId: member.id,
          plan: membershipPlan,
          startDate: now,
          currentPeriodEnd: addMonths(now, 1),
          status: 'ACTIVE',
          autoRenew: true,
        },
      });
    }

    return {
      success: true,
      message: 'Membership application submitted successfully',
      user: { id: user.id, email: user.email },
      member,
    };
  }

  async getPlans() {
    return [
      { id: 'PER_SESSION', label: 'Per sessie' },
      { id: 'MONTHLY', label: 'Maandelijks' },
      { id: 'PUNCH_CARD', label: 'Punch card' },
    ];
  }

  async getApplications(userId: string) {
    return { success: true, applications: [] };
  }

  async getMyMembership(userId: string) {
    const member = await this.prisma.member.findUnique({
      where: { userId },
      include: {
        memberships: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });

    if (!member) {
      return { success: true, member: null, membership: null, isPaymentOutstanding: false };
    }

    const membership = member.memberships[0] || null;
    const isPaymentOutstanding = Boolean(
      membership?.currentPeriodEnd && membership.currentPeriodEnd.getTime() <= Date.now()
    );

    return {
      success: true,
      member,
      membership,
      isPaymentOutstanding,
      monthlyPrice: MONTHLY_PRICE,
    };
  }

  async markPaymentReceived(membershipId: string) {
    const membership = await this.prisma.membership.findUnique({ where: { id: membershipId } });
    if (!membership) {
      throw new NotFoundException('Membership niet gevonden');
    }

    const baseDate = membership.currentPeriodEnd && membership.currentPeriodEnd.getTime() > Date.now()
      ? membership.currentPeriodEnd
      : new Date();

    const [updatedMembership] = await this.prisma.$transaction([
      this.prisma.membership.update({
        where: { id: membershipId },
        data: { currentPeriodEnd: addMonths(baseDate, 1) },
      }),
      this.prisma.payment.create({
        data: {
          memberId: membership.memberId,
          membershipId: membership.id,
          amount: MONTHLY_PRICE,
          paymentMethod: 'TRANSFER',
          status: 'COMPLETED',
          description: 'Maandelijkse contributie',
        },
      }),
    ]);

    return { success: true, membership: updatedMembership };
  }
}
