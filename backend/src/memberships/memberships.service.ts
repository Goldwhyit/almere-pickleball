import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from '../auth/auth.service';
import { CreateMembershipApplicationDto, CreatePaymentDto } from './dtos';
import { AccountType } from '@prisma/client';
import { PricingUtils } from '../common/utils/pricing.utils';

@Injectable()
export class MembershipsService {
  constructor(
    private prisma: PrismaService,
    private authService: AuthService,
  ) {}

  /**
   * Create membership application from non-trial user
   */
  async createMembershipApplication(dto: CreateMembershipApplicationDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Hash the provided password
    const hashedPassword = await this.authService.hashPassword(dto.password);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        member: {
          create: {
            firstName: dto.firstName,
            lastName: dto.lastName,
            phone: dto.phone || null,
            street: dto.street || null,
            houseNumber: dto.houseNumber || null,
            postalCode: dto.postalCode || null,
            city: dto.city || null,
            emergencyName: dto.emergencyName || null,
            emergencyPhone: dto.emergencyPhone || null,
            emergencyRelation: dto.emergencyRelation || null,
            hasPlayedBefore: dto.hasPlayedBefore || null,
            experienceLevel: dto.experienceLevel || null,
            otherSports: dto.otherSports || null,
            membershipType: dto.membershipType || null,
            punchCardCount: dto.membershipType === 'PUNCH_CARD' ? 10 : 0,
            accountType: AccountType.MEMBER,
            paymentStatus: 'PENDING',
            membershipStartDate: new Date(),
          },
        },
      },
      include: { member: true },
    });

    // Calculate expiry date and create initial payment
    const membershipPrices = {
      YEARLY_UPFRONT: 168,
      YEARLY: 187,
      MONTHLY: 34.0, // Full month price (2 sessions/week * 2 weeks * €8.50)
      PUNCH_CARD: 67.50,
      PER_SESSION: 0, // Pay per session
    };

    const isMonthlyCopy = dto.membershipType === 'MONTHLY';
    let amount = membershipPrices[dto.membershipType as keyof typeof membershipPrices] || 0;
    let pricingInfo: any = null;
    let expiryDate = null;
    let paymentType = '';
    let description = '';

    // For MONTHLY, calculate pro-rata price
    if (isMonthlyCopy) {
      pricingInfo = PricingUtils.calculateMonthlyProRataPrice(new Date());
      amount = pricingInfo.price;
    }

    switch (dto.membershipType) {
      case 'YEARLY_UPFRONT':
      case 'YEARLY':
        expiryDate = new Date();
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);
        paymentType = 'MEMBERSHIP_YEARLY';
        description = `Jaarlidmaatschap voor ${dto.firstName} ${dto.lastName}`;
        break;
      case 'MONTHLY':
        expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + 1);
        paymentType = 'MEMBERSHIP_MONTHLY';
        description = `Maandlidmaatschap voor ${dto.firstName} ${dto.lastName} - ${pricingInfo?.reason || ''}`;
        break;
      case 'PUNCH_CARD':
        expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + 6);
        paymentType = 'PUNCH_CARD';
        description = `Strippenkaart (10 beurten) voor ${dto.firstName} ${dto.lastName}`;
        break;
      case 'PER_SESSION':
        // No upfront payment, pay per session
        paymentType = 'PER_SESSION';
        description = 'Betaal per sessie';
        break;
    }

    // Create payment record if amount > 0
    let payment = null;
    if (amount > 0) {
      payment = await this.prisma.payment.create({
        data: {
          memberId: user.member!.id,
          amount,
          paymentType,
          description,
          status: 'PENDING',
          // In productie: genereer echte betaallink via Mollie/Stripe
          paymentUrl: `https://example.com/pay/${user.member!.id}`,
          expiresAt: expiryDate,
        },
      });

      // Update member with expiry date
      await this.prisma.member.update({
        where: { id: user.member!.id },
        data: {
          membershipExpiryDate: expiryDate,
          nextPaymentDue: expiryDate,
        },
      });
    } else if (isMonthlyCopy && pricingInfo) {
      // For MONTHLY with no charge this month, set lastPaidMonth so we don't ask again
      const monthKey = PricingUtils.getMonthKey(new Date());
      await this.prisma.member.update({
        where: { id: user.member!.id },
        data: {
          membershipExpiryDate: expiryDate,
          nextPaymentDue: expiryDate,
          lastPaidMonth: monthKey,
          paymentStatus: 'PAID',
        },
      });
    }

    // Generate access token for immediate login
    const accessToken = this.authService.generateAccessToken(
      user.id,
      user.email,
      AccountType.MEMBER,
    );

    console.log(
      `[EMAIL] Membership welcome email sent to ${user.email}`,
    );
    console.log(
      `[EMAIL] Membership type: ${dto.membershipType}`,
    );

    return {
      success: true,
      accessToken,
      payment: payment ? {
        id: payment.id,
        amount: payment.amount,
        paymentUrl: payment.paymentUrl,
        expiresAt: payment.expiresAt,
        status: payment.status,
      } : null,
      pricingInfo: isMonthlyCopy ? pricingInfo : null,
      requiresPayment: amount > 0,
      user: {
        id: user.id,
        email: user.email,
        member: {
          ...user.member,
          membershipExpiryDate: expiryDate,
        },
      },
    };
  }

  /**
   * Create payment for per-session booking
   */
  async createSessionPayment(userId: string, dto: CreatePaymentDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { member: true },
    });

    if (!user?.member) {
      throw new BadRequestException('Member not found');
    }

    if (user.member.membershipType !== 'PER_SESSION') {
      throw new BadRequestException('This feature is only for per-session members');
    }

    const payment = await this.prisma.payment.create({
      data: {
        memberId: user.member.id,
        amount: dto.amount,
        paymentType: 'PER_SESSION',
        description: dto.description,
        status: 'PENDING',
        // In productie: genereer echte betaallink via Mollie/Stripe
        paymentUrl: `https://example.com/pay-session/${user.member.id}/${Date.now()}`,
      },
    });

    return {
      success: true,
      payment: {
        id: payment.id,
        amount: payment.amount,
        paymentUrl: payment.paymentUrl,
        status: payment.status,
      },
    };
  }

  /**
   * Get member's payment status and expiry info
   */
  async getPaymentStatus(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        member: {
          include: {
            payments: {
              orderBy: { createdAt: 'desc' },
              take: 5,
            },
          },
        },
      },
    });

    if (!user?.member) {
      throw new BadRequestException('Member not found');
    }

    const member = user.member;
    const now = new Date();
    const isExpired = member.membershipExpiryDate ? member.membershipExpiryDate < now : false;
    const daysUntilExpiry = member.membershipExpiryDate
      ? Math.ceil((member.membershipExpiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      : null;

    return {
      membershipType: member.membershipType,
      paymentStatus: member.paymentStatus,
      membershipExpiryDate: member.membershipExpiryDate,
      nextPaymentDue: member.nextPaymentDue,
      isExpired,
      daysUntilExpiry,
      recentPayments: member.payments,
    };
  }

  /**
   * Confirm payment and mark month as paid (for MONTHLY members)
   */
  async confirmMonthlyPayment(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { member: true },
    });

    if (!user?.member || user.member.membershipType !== 'MONTHLY') {
      throw new BadRequestException('Monthly member not found');
    }

    const monthKey = PricingUtils.getMonthKey(new Date());

    // Update member to mark this month as paid
    const updated = await this.prisma.member.update({
      where: { id: user.member.id },
      data: {
        lastPaidMonth: monthKey,
        paymentStatus: 'PAID',
        lastPaymentDate: new Date(),
      },
      include: { 
        user: true,
        payments: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    return {
      success: true,
      message: 'Betaling bevestigd',
      member: {
        id: updated.id,
        lastPaidMonth: updated.lastPaidMonth,
        paymentStatus: updated.paymentStatus,
      },
    };
  }

  /**
   * Check if MONTHLY member needs to pay
   */
  async checkMonthlyPaymentRequired(userId: string): Promise<{
    requiresPayment: boolean;
    amount: number;
    reason?: string;
  }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { member: true },
    });

    if (!user?.member || user.member.membershipType !== 'MONTHLY') {
      return { requiresPayment: false, amount: 0 };
    }

    // Check if already paid for this month
    if (PricingUtils.isAlreadyPaidForMonth(user.member.lastPaidMonth)) {
      return { requiresPayment: false, amount: 0 };
    }

    // Calculate if payment needed
    const pricingInfo = PricingUtils.calculateMonthlyProRataPrice(new Date());
    
    return {
      requiresPayment: pricingInfo.shouldCharge,
      amount: pricingInfo.price,
      reason: pricingInfo.reason,
    };
  }

  /**
   * Get membership types available
   */
  async getMembershipTypes() {
    // Mirror published pricing used in the UI
    return [
      {
        id: 'YEARLY_UPFRONT',
        name: 'Jaarlidmaatschap ineens',
        price: '€168 ineens (10% korting)',
        features: ['Betaal per jaar', '10% korting', 'Club events inbegrepen'],
      },
      {
        id: 'YEARLY',
        name: 'Jaarlidmaatschap',
        price: '€187/jaar (≈ €15,58/maand)',
        features: ['Automatische incasso', 'Onbeperkt spelen', 'Community & events'],
      },
      {
        id: 'MONTHLY',
        name: 'Maandlidmaatschap',
        price: '€34,00/maand (prorationed)',
        features: ['Maandelijks opzegbaar', 'Onbeperkt spelen', 'Pro-rata eerste maand'],
      },
      {
        id: 'PER_SESSION',
        name: 'Per keer',
        price: '€8,50 per speeldag',
        features: ['Betaal per speeldag', 'Ideaal voor flexibiliteit'],
      },
      {
        id: 'PUNCH_CARD',
        name: 'Strippenkaart',
        price: '€67,50 voor 10 beurten',
        features: ['6 maanden geldig', '1x per week wijzigbaar'],
      },
    ];
  }
}
