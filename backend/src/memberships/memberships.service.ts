import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { ApplyMembershipDto } from './dto/apply-membership.dto';

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
        accountType: 'MEMBER',
        membershipStatus: 'PENDING',
        membershipPlan: dto.membershipType === 'MONTHLY' ? 'MONTHLY' : 'PER_SESSION',
        trialStatus: 'PENDING',
      },
    });

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
    const member = await this.prisma.member.findUnique({ where: { userId } });
    return { success: true, member };
  }
}
