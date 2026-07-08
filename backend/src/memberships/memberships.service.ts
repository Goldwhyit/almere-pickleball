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
const YEARLY_MONTHLY_INSTALLMENT_PRICE = 15.58;
const YEARLY_PRICE = 187;
const YEARLY_UPFRONT_PRICE = 168;
const DUE_SOON_DAYS = 5;
const RENEWAL_DUE_DAYS = 30;

function addMonths(date: Date, months: number): Date {
  const result = new Date(date.getTime());
  result.setMonth(result.getMonth() + months);
  return result;
}

function monthsBetween(from: Date, to: Date): number {
  let months = (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth());
  if (to.getDate() < from.getDate()) {
    months -= 1;
  }
  return Math.max(0, months);
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
    const isYearly = membershipPlan === MembershipPlan.YEARLY;
    const isYearlyUpfront = membershipPlan === MembershipPlan.YEARLY_UPFRONT;
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

    if (isYearly || isYearlyUpfront) {
      await this.prisma.membership.create({
        data: {
          memberId: member.id,
          plan: membershipPlan,
          startDate: now,
          endDate: addMonths(now, 12),
          currentPeriodEnd: isYearly ? addMonths(now, 1) : null,
          status: 'ACTIVE',
          autoRenew: isYearly,
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

    const daysUntil = (date: Date) => Math.ceil((date.getTime() - Date.now()) / (24 * 60 * 60 * 1000));

    const isPaymentDueSoon = Boolean(
      membership?.plan === MembershipPlan.YEARLY &&
        membership.currentPeriodEnd &&
        daysUntil(membership.currentPeriodEnd) <= DUE_SOON_DAYS
    );

    const isRenewalDue = Boolean(
      membership?.plan === MembershipPlan.YEARLY_UPFRONT &&
        ((membership.endDate && daysUntil(membership.endDate) <= RENEWAL_DUE_DAYS) ||
          membership.pendingRenewalChoice)
    );

    const remainingMonths = membership?.endDate ? monthsBetween(new Date(), membership.endDate) : null;

    return {
      success: true,
      member,
      membership,
      isPaymentOutstanding,
      isPaymentDueSoon,
      isRenewalDue,
      remainingMonths,
      monthlyPrice: MONTHLY_PRICE,
      yearlyMonthlyInstallmentPrice: YEARLY_MONTHLY_INSTALLMENT_PRICE,
      yearlyPrice: YEARLY_PRICE,
      yearlyUpfrontPrice: YEARLY_UPFRONT_PRICE,
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

    const isYearlyInstallment = membership.plan === MembershipPlan.YEARLY;
    const amount = isYearlyInstallment ? YEARLY_MONTHLY_INSTALLMENT_PRICE : MONTHLY_PRICE;
    const description = isYearlyInstallment
      ? 'Maandelijkse termijn jaarabonnement'
      : 'Maandelijkse contributie';

    const [updatedMembership] = await this.prisma.$transaction([
      this.prisma.membership.update({
        where: { id: membershipId },
        data: { currentPeriodEnd: addMonths(baseDate, 1) },
      }),
      this.prisma.payment.create({
        data: {
          memberId: membership.memberId,
          membershipId: membership.id,
          amount,
          paymentMethod: 'TRANSFER',
          status: 'COMPLETED',
          description,
        },
      }),
    ]);

    return { success: true, membership: updatedMembership };
  }

  async setRenewalChoice(userId: string, membershipId: string, choice: MembershipPlan) {
    if (choice !== MembershipPlan.YEARLY && choice !== MembershipPlan.YEARLY_UPFRONT) {
      throw new BadRequestException('Ongeldige keuze');
    }

    const member = await this.prisma.member.findUnique({ where: { userId } });
    const membership = await this.prisma.membership.findUnique({ where: { id: membershipId } });

    if (!membership || !member || membership.memberId !== member.id) {
      throw new NotFoundException('Membership niet gevonden');
    }

    const updated = await this.prisma.membership.update({
      where: { id: membershipId },
      data: { pendingRenewalChoice: choice },
    });

    return { success: true, membership: updated };
  }

  async processRenewal(membershipId: string) {
    const membership = await this.prisma.membership.findUnique({ where: { id: membershipId } });
    if (!membership) {
      throw new NotFoundException('Membership niet gevonden');
    }

    const newPlan = membership.pendingRenewalChoice || membership.plan;
    const isYearly = newPlan === MembershipPlan.YEARLY;
    const amount = isYearly ? YEARLY_PRICE : YEARLY_UPFRONT_PRICE;
    const baseDate = membership.endDate && membership.endDate.getTime() > Date.now()
      ? membership.endDate
      : new Date();
    const newEndDate = addMonths(baseDate, 12);
    const now = new Date();

    const [updatedMembership] = await this.prisma.$transaction([
      this.prisma.membership.update({
        where: { id: membershipId },
        data: {
          plan: newPlan,
          endDate: newEndDate,
          currentPeriodEnd: isYearly ? addMonths(now, 1) : null,
          pendingRenewalChoice: null,
        },
      }),
      this.prisma.payment.create({
        data: {
          memberId: membership.memberId,
          membershipId: membership.id,
          amount,
          paymentMethod: 'TRANSFER',
          status: 'COMPLETED',
          description: isYearly ? 'Verlenging jaarabonnement (maandelijks)' : 'Verlenging jaarabonnement (ineens)',
        },
      }),
      this.prisma.member.update({
        where: { id: membership.memberId },
        data: { membershipPlan: newPlan },
      }),
    ]);

    return { success: true, membership: updatedMembership };
  }
}
