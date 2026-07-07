import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Member } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const TRIAL_DURATION_DAYS = 21;
const TRIAL_LESSON_WEEKDAY = 2; // dinsdag

@Injectable()
export class TrialLessonsService {
  constructor(private readonly prisma: PrismaService) {}

  private validateTrialSlot(member: Member, dateStr: string): Date {
    const datePart = dateStr.split('T')[0];
    const date = new Date(`${datePart}T00:00:00`);
    if (Number.isNaN(date.getTime())) {
      throw new BadRequestException('Ongeldige datum');
    }

    if (date.getDay() !== TRIAL_LESSON_WEEKDAY) {
      throw new BadRequestException('Proeflessen kunnen alleen op dinsdag worden ingepland');
    }

    const now = new Date();
    if (date.getTime() <= now.getTime()) {
      throw new BadRequestException('Kies een datum in de toekomst');
    }

    if (member.trialStartDate && date.getTime() < member.trialStartDate.getTime()) {
      throw new BadRequestException('Deze datum ligt voor de start van je proefperiode');
    }

    if (member.trialEndDate && date.getTime() > member.trialEndDate.getTime()) {
      throw new BadRequestException('Deze datum valt buiten je proefperiode van 21 dagen');
    }

    return date;
  }

  async signup(dto: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth?: string;
    password: string;
    agreedToTerms?: boolean;
  }) {
    if (!dto.agreedToTerms) {
      throw new BadRequestException('You must agree to the terms before signing up');
    }

    const existingUser = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existingUser) {
      throw new ConflictException('An account with this email address already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const trialStartDate = new Date();
    const trialEndDate = new Date(trialStartDate.getTime() + TRIAL_DURATION_DAYS * 24 * 60 * 60 * 1000);

    const result = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: dto.email,
          password: hashedPassword,
          role: 'MEMBER',
          isActive: true,
        },
      });

      const member = await tx.member.create({
        data: {
          userId: user.id,
          firstName: dto.firstName,
          lastName: dto.lastName,
          phone: dto.phone,
          dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : null,
          accountType: 'TRIAL',
          membershipStatus: 'PENDING',
          membershipPlan: 'PER_SESSION',
          trialStatus: 'ACTIVE',
          trialStartDate,
          trialEndDate,
          trialLessonsBooked: 0,
          trialLessonsCompleted: 0,
        },
      });

      return { user, member };
    });

    return {
      success: true,
      message: 'Trial signup created successfully',
      user: { id: result.user.id, email: result.user.email },
      member: result.member,
    };
  }

  async getMyLessons(userId: string) {
    const member = await this.findMemberByUserId(userId);
    const lessons = await this.prisma.trialLesson.findMany({
      where: { memberId: member.id },
      orderBy: { scheduledDate: 'asc' },
    });

    return { member, lessons };
  }

  async getMyStatus(userId: string) {
    const member = await this.findMemberByUserId(userId);
    const lessons = await this.prisma.trialLesson.findMany({
      where: { memberId: member.id },
      orderBy: { scheduledDate: 'asc' },
    });

    return {
      member,
      status: member.trialStatus,
      lessonsBooked: lessons.length,
      lessonsCompleted: lessons.filter((lesson) => lesson.completed).length,
      remainingLessons: Math.max(0, lessons.length - lessons.filter((lesson) => lesson.completed).length),
      trialStartDate: member.trialStartDate,
      trialEndDate: member.trialEndDate,
    };
  }

  private async syncLessonsBooked(memberId: string) {
    const count = await this.prisma.trialLesson.count({ where: { memberId } });
    await this.prisma.member.update({
      where: { id: memberId },
      data: { trialLessonsBooked: count },
    });
  }

  async bookDate(userId: string, dateStr: string) {
    const member = await this.findMemberByUserId(userId);
    const date = this.validateTrialSlot(member, dateStr);

    const existing = await this.prisma.trialLesson.findFirst({
      where: { memberId: member.id, scheduledDate: date },
    });
    if (existing) {
      throw new ConflictException('Deze datum is al geboekt');
    }

    const lesson = await this.prisma.trialLesson.create({
      data: { memberId: member.id, scheduledDate: date },
    });

    await this.syncLessonsBooked(member.id);

    return { success: true, message: 'Proefles ingepland', lesson };
  }

  async cancelLesson(userId: string, lessonId: string) {
    const member = await this.findMemberByUserId(userId);
    const lesson = await this.prisma.trialLesson.findFirst({
      where: { id: lessonId, memberId: member.id },
    });

    if (!lesson) {
      throw new NotFoundException('Proefles niet gevonden');
    }

    if (lesson.completed) {
      throw new BadRequestException('Een voltooide les kan niet worden geannuleerd');
    }

    if (lesson.scheduledDate.getTime() <= Date.now()) {
      throw new BadRequestException('Deze les is al verstreken');
    }

    await this.prisma.trialLesson.delete({ where: { id: lessonId } });
    await this.syncLessonsBooked(member.id);

    return { success: true, message: 'Proefles geannuleerd' };
  }

  async rescheduleLesson(userId: string, lessonId: string, newDate: string) {
    const member = await this.findMemberByUserId(userId);
    const lesson = await this.prisma.trialLesson.findFirst({
      where: { id: lessonId, memberId: member.id },
    });

    if (!lesson) {
      throw new NotFoundException('Trial lesson not found');
    }

    const date = this.validateTrialSlot(member, newDate);

    const updatedLesson = await this.prisma.trialLesson.update({
      where: { id: lessonId },
      data: { scheduledDate: date },
    });

    return { success: true, lesson: updatedLesson };
  }

  async convertToMember(userId: string, membershipPlan?: string) {
    const member = await this.findMemberByUserId(userId);
    const plan = (membershipPlan || 'MONTHLY').toUpperCase();

    const updatedMember = await this.prisma.member.update({
      where: { id: member.id },
      data: {
        accountType: 'MEMBER',
        membershipStatus: 'ACTIVE',
        membershipPlan: plan as any,
        trialStatus: 'COMPLETED',
      },
    });

    await this.prisma.membership.create({
      data: {
        memberId: member.id,
        plan: plan as any,
        startDate: new Date(),
        status: 'ACTIVE',
        autoRenew: false,
      },
    });

    return { success: true, member: updatedMember };
  }

  async declineMembership(userId: string, reason?: string, feedback?: string) {
    const member = await this.findMemberByUserId(userId);

    const updatedMember = await this.prisma.member.update({
      where: { id: member.id },
      data: {
        trialStatus: 'DECLINED',
        accountType: 'TRIAL_EXPIRED',
        membershipStatus: 'INACTIVE',
      },
    });

    return {
      success: true,
      message: 'Trial membership declined',
      member: updatedMember,
      reason,
      feedback,
    };
  }

  async getAllTrialMembers(filters: { status?: string; startDate?: string; endDate?: string }) {
    const where: Record<string, unknown> = {
      accountType: 'TRIAL',
    };

    if (filters.status) {
      where.trialStatus = filters.status;
    }

    if (filters.startDate || filters.endDate) {
      where.trialStartDate = {} as Record<string, Date>;
      if (filters.startDate) {
        (where.trialStartDate as Record<string, Date>).gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        (where.trialStartDate as Record<string, Date>).lte = new Date(filters.endDate);
      }
    }

    return this.prisma.member.findMany({
      where,
      include: {
        user: { select: { email: true } },
        trialLessons: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getTrialMemberDetails(memberId: string) {
    const member = await this.prisma.member.findUnique({
      where: { id: memberId },
      include: {
        user: { select: { id: true, email: true } },
        trialLessons: { orderBy: { scheduledDate: 'asc' } },
      },
    });

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    return member;
  }

  async markLessonCompleted(lessonId: string) {
    const lesson = await this.prisma.trialLesson.findUnique({ where: { id: lessonId } });
    if (!lesson) {
      throw new NotFoundException('Trial lesson not found');
    }

    const updatedLesson = await this.prisma.trialLesson.update({
      where: { id: lessonId },
      data: { completed: true },
    });

    await this.prisma.member.updateMany({
      where: { id: lesson.memberId },
      data: {
        trialLessonsCompleted: { increment: 1 },
      },
    });

    return { success: true, lesson: updatedLesson };
  }

  async getStatsOverview() {
    const [activeTrials, completedTrials, expiredTrials, totalLessons] = await Promise.all([
      this.prisma.member.count({ where: { accountType: 'TRIAL', trialStatus: 'ACTIVE' } }),
      this.prisma.member.count({ where: { accountType: 'TRIAL', trialStatus: 'COMPLETED' } }),
      this.prisma.member.count({ where: { accountType: 'TRIAL', trialStatus: 'DECLINED' } }),
      this.prisma.trialLesson.count(),
    ]);

    return {
      activeTrials,
      completedTrials,
      expiredTrials,
      totalLessons,
    };
  }

  private async findMemberByUserId(userId: string) {
    const member = await this.prisma.member.findUnique({ where: { userId } });
    if (!member) {
      throw new NotFoundException('Member not found for this user');
    }
    return member;
  }
}
