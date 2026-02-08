import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from '../auth/auth.service';
import {
  SignupTrialDto,
  BookTrialDatesDto,
  RescheduleLessonDto,
  DeclineTrialDto,
  MarkLessonCompletedDto,
  BookTrainingDto,
} from './dtos';
import { AccountType, LessonStatus } from '@prisma/client';

@Injectable()
export class TrialLessonsService {
  constructor(
    private prisma: PrismaService,
    private authService: AuthService,
  ) {}

  /**
   * Sign up a new trial user
   * Creates User + Member with TRIAL account type, 30-day expiry
   */
  async signupTrialLesson(dto: SignupTrialDto) {
    // Check if email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { member: true },
    });

    if (existingUser) {
      // Check if they have an expired trial from the last year
      if (existingUser.member?.accountType === AccountType.TRIAL_EXPIRED) {
        const daysSinceExpiry = this.getDaysBetween(
          existingUser.member.trialEndDate as Date,
          new Date(),
        );
        if (daysSinceExpiry < 365) {
          throw new ConflictException(
            `Cannot re-signup. Previous trial expired ${daysSinceExpiry} days ago. Must wait ${365 - daysSinceExpiry} more days.`,
          );
        }
      } else {
        throw new ConflictException('Email already registered');
      }
    }

    // Validate password strength
    if (dto.password.length < 8) {
      throw new BadRequestException('Password must be at least 8 characters');
    }

    // Hash password
    const hashedPassword = await this.authService.hashPassword(dto.password);

    // Calculate trial dates
    const trialStartDate = new Date();
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 30);

    // Create user and member
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        member: {
          create: {
            firstName: dto.firstName,
            lastName: dto.lastName,
            phone: dto.phone,
            dateOfBirth: new Date(dto.dateOfBirth),
            accountType: AccountType.TRIAL,
            trialStartDate,
            trialEndDate,
            trialLessonsUsed: 0,
          },
        },
      },
      include: { member: true },
    });

    // Generate JWT token via AuthService
    const accessToken = this.authService.generateAccessToken(
      user.id,
      user.email,
      AccountType.TRIAL,
    );

    // Log email (implement SMTP later)
    console.log(`[EMAIL] Welcome email sent to ${user.email}`);
    console.log(`[EMAIL] Trial expires: ${trialEndDate.toISOString()}`);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        member: user.member,
      },
    };
  }

  /**
   * Get available training dates for booking (2 weeks per location)
   * Excludes already booked dates
   * First 2 weeks: Almere Haven (Tuesdays 19:30-21:30)
   * Next 2 weeks: Noordenplassen (Thursdays 18:30-20:30)
   */
  async getAvailableDates() {
    const almereSchedule = {
      dayOfWeek: 2, // Tuesday
      time: '19:30',
      endTime: '21:30',
      location: 'Almere Haven Sporthal',
      address: 'Parkweg 138, Almere',
      capacity: 38,
    };

    const noordenplassenSchedule = {
      dayOfWeek: 4, // Thursday
      time: '18:30',
      endTime: '20:30',
      location: 'Noordenplassen Gymzaal Kraaiennest',
      address: 'Kraaiennest, Almere',
      capacity: 16,
    };

    // Get all booked lessons (scheduled or completed) for punch card members
    const bookedLessons = await this.prisma.trialLesson.findMany({
      where: {
        status: { in: [LessonStatus.SCHEDULED, LessonStatus.COMPLETED] },
      },
      select: {
        scheduledDate: true,
        location: true,
      },
    });

    // Get all training registrations (for non-punch card members)
    const trainingRegistrations = await this.prisma.trainingRegistration.findMany({
      select: {
        trainingDate: true,
        location: true,
      },
    });

    // Count bookings per date+location combination (both types)
    const bookingCounts = new Map<string, number>();
    
    // Count punch card bookings
    bookedLessons.forEach((lesson) => {
      const d = new Date(lesson.scheduledDate);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      const key = `${dateStr}|${lesson.location}`;
      bookingCounts.set(key, (bookingCounts.get(key) || 0) + 1);
    });

    // Count training registrations
    trainingRegistrations.forEach((reg) => {
      const d = new Date(reg.trainingDate);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      const key = `${dateStr}|${reg.location}`;
      bookingCounts.set(key, (bookingCounts.get(key) || 0) + 1);
    });

    // Create a set of FULL (at capacity) date+location combinations
    const fullDatesSet = new Set<string>();
    bookingCounts.forEach((count, key) => {
      const [dateStr, location] = key.split('|');
      const capacity = location === 'Almere Haven Sporthal' ? 38 : 16;
      if (count >= capacity) {
        fullDatesSet.add(key);
      }
    });

    const availableDates: any[] = [];
    const startDate = new Date();
    // Start from today (current date at midnight)
    startDate.setHours(0, 0, 0, 0);

    // Generate both locations' dates for the next 8 weeks (4 weeks per location cycle)
    // This ensures users see both Almere Tuesdays and Noordenplassen Thursdays within the same 4-week period
    for (let i = 0; i < 56; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);

      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      // Check if this is an Almere Tuesday
      if (date.getDay() === almereSchedule.dayOfWeek) {
        const bookingKey = `${dateStr}|${almereSchedule.location}`;
        
        // Only add if not at capacity
        if (!fullDatesSet.has(bookingKey)) {
          availableDates.push({
            date: dateStr,
            time: almereSchedule.time,
            endTime: almereSchedule.endTime,
            location: almereSchedule.location,
            address: almereSchedule.address,
            dayName: ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag'][date.getDay()],
            booked: bookingCounts.get(bookingKey) || 0,
            capacity: almereSchedule.capacity,
          });
        }
      }

      // Check if this is a Noordenplassen Thursday
      if (date.getDay() === noordenplassenSchedule.dayOfWeek) {
        const bookingKey = `${dateStr}|${noordenplassenSchedule.location}`;
        
        // Only add if not at capacity
        if (!fullDatesSet.has(bookingKey)) {
          availableDates.push({
            date: dateStr,
            time: noordenplassenSchedule.time,
            endTime: noordenplassenSchedule.endTime,
            location: noordenplassenSchedule.location,
            address: noordenplassenSchedule.address,
            dayName: ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag'][date.getDay()],
            booked: bookingCounts.get(bookingKey) || 0,
            capacity: noordenplassenSchedule.capacity,
          });
        }
      }
    }

    // Sort by date and limit to first occurrence of each location (4 dates each within the 8-week window)
    availableDates.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateA.getTime() - dateB.getTime();
    });

    // Keep first 4 Almere dates and first 4 Noordenplassen dates
    const almereCount = new Map<string, number>();
    const noordenCount = new Map<string, number>();
    const filteredDates: any[] = [];

    for (const dateEntry of availableDates) {
      if (dateEntry.location === almereSchedule.location) {
        const count = almereCount.get(dateEntry.location) || 0;
        if (count < 4) {
          filteredDates.push(dateEntry);
          almereCount.set(dateEntry.location, count + 1);
        }
      } else if (dateEntry.location === noordenplassenSchedule.location) {
        const count = noordenCount.get(dateEntry.location) || 0;
        if (count < 4) {
          filteredDates.push(dateEntry);
          noordenCount.set(dateEntry.location, count + 1);
        }
      }
    }

    // Re-sort by date for display
    filteredDates.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateA.getTime() - dateB.getTime();
    });

    return filteredDates;
  }

  /**
   * Get user's trial status
   */
  async getMyStatus(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        member: {
          include: {
            trialLessons: true,
          },
        },
      },
    });

    if (!user?.member) {
      throw new NotFoundException('Member not found');
    }

    const member = user.member;
    const now = new Date();
    const daysRemaining = this.getDaysBetween(now, member.trialEndDate as Date);
    const isExpired = daysRemaining <= 0;

    // Auto-expire if date passed
    if (isExpired && member.accountType === AccountType.TRIAL) {
      await this.prisma.member.update({
        where: { id: member.id },
        data: {
          accountType: AccountType.TRIAL_EXPIRED,
          isTrialExpired: true,
        },
      });
    }

    return {
      id: member.id,
      firstName: member.firstName,
      lastName: member.lastName,
      accountType: isExpired ? AccountType.TRIAL_EXPIRED : member.accountType,
      trialStartDate: member.trialStartDate,
      trialEndDate: member.trialEndDate,
      trialLessonsBooked: member.trialLessonsUsed,
      trialLessonsCompleted: member.trialLessons.filter(
        (l: any) => l.status === LessonStatus.COMPLETED,
      ).length,
      daysRemaining: Math.max(0, daysRemaining),
      isTrialExpired: isExpired,
      completionPercentage: member.trialLessonsUsed
        ? Math.round((member.trialLessonsUsed / 3) * 100)
        : 0,
    };
  }

  /**
   * Get user's trial lessons
   */
  async getMyLessons(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        member: {
          include: {
            trialLessons: {
              orderBy: { scheduledDate: 'asc' },
            },
          },
        },
      },
    });

    if (!user?.member) {
      throw new NotFoundException('Member not found');
    }

    return user.member.trialLessons;
  }

  /**
   * Get member's training bookings
   */
  async getMyBookings(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { member: true },
    });

    if (!user?.member) {
      throw new NotFoundException('Member not found');
    }

    const bookings = await this.prisma.trialLesson.findMany({
      where: {
        memberId: user.member.id,
        status: LessonStatus.SCHEDULED,
      },
      select: {
        id: true,
        scheduledDate: true,
        scheduledTime: true,
        location: true,
      },
      orderBy: {
        scheduledDate: 'asc',
      },
    });

    return bookings.map((b) => ({
      id: b.id,
      date: b.scheduledDate.toISOString().split('T')[0],
      time: b.scheduledTime,
      location: b.location,
    }));
  }

  /**
   * Book a training session (for PUNCH_CARD members)
   * Deducts one punch from punch card
   */
  async bookTraining(userId: string, dto: any) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { member: true },
    });

    if (!user?.member) {
      throw new NotFoundException('Member not found');
    }

    const member = user.member;

    // Check if member is MEMBER type with punch card
    if (member.accountType !== AccountType.MEMBER || member.membershipType !== 'PUNCH_CARD') {
      throw new BadRequestException('This feature is only available for punch card members');
    }

    // Check if punch card has remaining sessions
    if (!member.punchCardCount || member.punchCardCount <= 0) {
      throw new BadRequestException('No remaining sessions on punch card');
    }

    // Create training lesson
    const lesson = await this.prisma.trialLesson.create({
      data: {
        memberId: member.id,
        scheduledDate: new Date(dto.date),
        scheduledTime: dto.time,
        location: dto.location,
        status: LessonStatus.SCHEDULED,
      },
    });

    // Deduct one punch from punch card
    await this.prisma.member.update({
      where: { id: member.id },
      data: {
        punchCardCount: Math.max(0, (member.punchCardCount || 10) - 1),
      },
    });

    // Return updated member with new punch card count
    const updatedMember = await this.prisma.member.findUnique({
      where: { id: member.id },
    });

    return {
      success: true,
      lesson,
      punchCardCount: updatedMember?.punchCardCount || 0,
    };
  }

  /**
   * Cancel a training session
   * Only allows cancellation up to 4 hours before training start time
   * Returns the punch to the punch card
   */
  async cancelTraining(userId: string, lessonId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { member: true },
    });

    if (!user?.member) {
      throw new NotFoundException('Member not found');
    }

    // Find the lesson
    const lesson = await this.prisma.trialLesson.findUnique({
      where: { id: lessonId },
    });

    if (!lesson) {
      throw new NotFoundException('Training not found');
    }

    // Verify lesson belongs to this member
    if (lesson.memberId !== user.member.id) {
      throw new BadRequestException('This training does not belong to you');
    }

    // Check if lesson is scheduled
    if (lesson.status !== LessonStatus.SCHEDULED) {
      throw new BadRequestException('Only scheduled trainings can be cancelled');
    }

    // Calculate time until training start
    const trainingStart = new Date(lesson.scheduledDate);
    const [hours, minutes] = lesson.scheduledTime.split(':').map(Number);
    trainingStart.setHours(hours, minutes, 0, 0);

    const now = new Date();
    const hoursDiff = (trainingStart.getTime() - now.getTime()) / (1000 * 60 * 60);

    // Check 4-hour rule
    if (hoursDiff < 4) {
      throw new BadRequestException('Cancellations are only allowed at least 4 hours before the training');
    }

    // Cancel the lesson
    await this.prisma.trialLesson.update({
      where: { id: lessonId },
      data: { status: LessonStatus.CANCELLED },
    });

    // Return punch to card
    await this.prisma.member.update({
      where: { id: user.member.id },
      data: {
        punchCardCount: Math.min(10, (user.member.punchCardCount || 0) + 1),
      },
    });

    const updatedMember = await this.prisma.member.findUnique({
      where: { id: user.member.id },
    });

    return {
      success: true,
      message: 'Training cancelled successfully. Punch returned to your card.',
      punchCardCount: updatedMember?.punchCardCount || 0,
    };
  }

  /**
   * Book 3 trial lesson dates
   * Validates: 2-week window, no duplicates, exactly 3 dates
   */
  async bookTrialDates(userId: string, dto: BookTrialDatesDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        member: {
          include: {
            trialLessons: true,
          },
        },
      },
    });

    if (!user?.member) {
      throw new NotFoundException('Member not found');
    }

    const member = user.member;

    // Check if trial still active
    if (member.accountType !== AccountType.TRIAL) {
      throw new BadRequestException('Trial account not active');
    }

    // Check existing lessons
    if (member.trialLessons.length > 0) {
      throw new ConflictException('Dates already booked');
    }

    const dates = [
      new Date(dto.date1),
      new Date(dto.date2),
      new Date(dto.date3),
    ];
    const now = new Date();
    const twoWeeksFromNow = new Date();
    twoWeeksFromNow.setDate(twoWeeksFromNow.getDate() + 14);

    // Validate each date
    for (const date of dates) {
      // Must be in future
      if (date < now) {
        throw new BadRequestException(
          `Date ${date.toISOString().split('T')[0]} is in the past`,
        );
      }

      // Must be within 2 weeks
      if (date > twoWeeksFromNow) {
        throw new BadRequestException(
          'Dates must be within 2 weeks from today',
        );
      }

      // Must be unique
      const duplicateCount = dates.filter(
        (d) =>
          d.toISOString().split('T')[0] === date.toISOString().split('T')[0],
      ).length;
      if (duplicateCount > 1) {
        throw new BadRequestException('Duplicate dates not allowed');
      }
    }

    // Create lessons
    const lessons = await Promise.all(
      dates.map((date) =>
        this.prisma.trialLesson.create({
          data: {
            memberId: member.id,
            scheduledDate: date,
            scheduledTime: '18:00',
            location: 'Sporthal Almere, Bataviaplein 60',
            status: LessonStatus.SCHEDULED,
          },
        }),
      ),
    );

    // Update member
    await this.prisma.member.update({
      where: { id: member.id },
      data: { trialLessonsUsed: 3 },
    });

    // Send reminder email
    console.log(`[EMAIL] Lesson booking confirmation sent to ${user.email}`);

    return {
      success: true,
      lessonsBooked: 3,
      lessons,
    };
  }

  /**
   * Reschedule a lesson (24h cutoff)
   */
  async rescheduleLesson(
    userId: string,
    lessonId: string,
    dto: RescheduleLessonDto,
  ) {
    const lesson = await this.prisma.trialLesson.findUnique({
      where: { id: lessonId },
      include: { member: { include: { user: true } } },
    });

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    // Check ownership
    if (lesson.member.userId !== userId) {
      throw new UnauthorizedException('Not your lesson');
    }

    // Check 24h cutoff
    const now = new Date();
    const hoursUntilLesson = (lesson.scheduledDate.getTime() - now.getTime()) / 3600000;
    if (hoursUntilLesson < 24) {
      throw new BadRequestException(
        'Cannot reschedule within 24 hours of lesson',
      );
    }

    // Update
    const updated = await this.prisma.trialLesson.update({
      where: { id: lessonId },
      data: {
        scheduledDate: new Date(dto.newDate),
        scheduledTime: dto.newTime,
      },
    });

    console.log(`[EMAIL] Lesson rescheduling confirmation sent`);
    return updated;
  }

  /**
   * Convert trial to member
   */
  async convertToMember(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { member: true },
    });

    if (!user?.member) {
      throw new NotFoundException('Member not found');
    }

    const updated = await this.prisma.member.update({
      where: { id: user.member.id },
      data: {
        accountType: AccountType.MEMBER,
        conversionDate: new Date(),
      },
    });

    console.log(`[EMAIL] Membership welcome email sent to ${user.email}`);
    return { success: true, accountType: updated.accountType };
  }

  /**
   * Decline trial and capture feedback
   */
  async declineTrialMembership(
    userId: string,
    dto: DeclineTrialDto,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { member: true },
    });

    if (!user?.member) {
      throw new NotFoundException('Member not found');
    }

    const updated = await this.prisma.member.update({
      where: { id: user.member.id },
      data: {
        accountType: AccountType.TRIAL_EXPIRED,
        isTrialExpired: true,
        stopReason: dto.reason,
        stopFeedback: dto.feedback || null,
      },
    });

    console.log(`[EMAIL] Trial feedback recorded: ${dto.reason}`);
    return { success: true, status: AccountType.TRIAL_EXPIRED };
  }

  // ============================================================================
  // ADMIN ENDPOINTS
  // ============================================================================

  /**
   * Get all trial members (admin)
   */
  async getAllTrialMembers(
    limit: number = 25,
    offset: number = 0,
    status?: AccountType,
  ) {
    const where: any = {};
    if (status) {
      where.accountType = status;
    } else {
      where.accountType = { in: [AccountType.TRIAL, AccountType.TRIAL_EXPIRED] };
    }

    // Ensure limit and offset are valid integers
    const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : 25;
    const safeOffset = Number.isFinite(offset) && offset >= 0 ? Math.floor(offset) : 0;

    const [data, total] = await Promise.all([
      this.prisma.member.findMany({
        where,
        include: {
          user: { select: { email: true } },
          trialLessons: true,
        },
        take: safeLimit,
        skip: safeOffset,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.member.count({ where }),
    ]);

    return {
      data,
      total,
      page: Math.floor(safeOffset / safeLimit) + 1,
      totalPages: Math.ceil(total / safeLimit),
    };
  }

  /**
   * Get trial member details (admin)
   */
  async getTrialMemberDetails(memberId: string) {
    const member = await this.prisma.member.findUnique({
      where: { id: memberId },
      include: {
        user: { select: { email: true } },
        trialLessons: { orderBy: { scheduledDate: 'asc' } },
      },
    });

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    return member;
  }

  /**
   * Mark lesson completed (admin)
   */
  async markLessonCompleted(
    lessonId: string,
    dto: MarkLessonCompletedDto,
  ) {
    const lesson = await this.prisma.trialLesson.findUnique({
      where: { id: lessonId },
    });

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    const updated = await this.prisma.trialLesson.update({
      where: { id: lessonId },
      data: {
        status: LessonStatus.COMPLETED,
        completedAt: new Date(),
        checkInTime: new Date(),
        notes: dto.notes || null,
      },
    });

    return { success: true, status: updated.status };
  }

  /**
   * Get trial statistics (admin)
   */
  async getTrialStats(startDate?: string, endDate?: string) {
    const where: any = {
      accountType: { in: [AccountType.TRIAL, AccountType.TRIAL_EXPIRED] },
    };

    if (startDate) {
      where.createdAt = { gte: new Date(startDate) };
    }
    if (endDate) {
      if (!where.createdAt) where.createdAt = {};
      where.createdAt.lte = new Date(endDate);
    }

    const members = await this.prisma.member.findMany({
      where,
      include: { trialLessons: true },
    });

    const totalTrialMembers = members.length;
    const convertedToMember = members.filter(
      (m: any) => m.accountType === AccountType.MEMBER,
    ).length;
    const trialExpired = members.filter(
      (m: any) => m.accountType === AccountType.TRIAL_EXPIRED,
    ).length;
    const conversionRate =
      totalTrialMembers > 0
        ? ((convertedToMember / totalTrialMembers) * 100).toFixed(1)
        : '0.0';

    const completedLessons = members.reduce(
      (acc: number, m: any) =>
        acc +
        m.trialLessons.filter((l: any) => l.status === LessonStatus.COMPLETED)
          .length,
      0,
    );

    const stopReasons = members
      .filter((m: any) => m.stopReason)
      .map((m: any) => m.stopReason);

    return {
      totalTrialMembers,
      convertedToMember,
      trialExpired,
      conversionRate: `${conversionRate}%`,
      totalLessonsCompleted: completedLessons,
      averageLessonsPerMember:
        totalTrialMembers > 0
          ? (completedLessons / totalTrialMembers).toFixed(1)
          : '0.0',
      stopReasons,
    };
  }

  // ============================================================================
  // TRAINING REGISTRATIONS (for non-punch card members)
  // ============================================================================

  /**
   * Register for a training date (for YEARLY, MONTHLY, PER_SESSION members)
   */
  async registerForTraining(userId: string, dto: BookTrainingDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { member: true },
    });

    if (!user?.member) {
      throw new NotFoundException('Member not found');
    }

    const member = user.member;

    // Check if member is not PUNCH_CARD type
    if (member.membershipType === 'PUNCH_CARD') {
      throw new BadRequestException('Punch card members should use the booking system');
    }

    // Check if already registered for this date
    const existingRegistration = await this.prisma.trainingRegistration.findUnique({
      where: {
        memberId_trainingDate_location: {
          memberId: member.id,
          trainingDate: new Date(dto.date),
          location: dto.location,
        },
      },
    });

    if (existingRegistration) {
      throw new ConflictException('Je bent al ingeschreven voor deze training');
    }

    // Check capacity
    const capacity = dto.location === 'Almere Haven Sporthal' ? 38 : 16;
    const currentRegistrations = await this.prisma.trainingRegistration.count({
      where: {
        trainingDate: new Date(dto.date),
        location: dto.location,
      },
    });

    const punchCardBookings = await this.prisma.trialLesson.count({
      where: {
        scheduledDate: new Date(dto.date),
        location: dto.location,
        status: { in: [LessonStatus.SCHEDULED, LessonStatus.COMPLETED] },
      },
    });

    const totalBookings = currentRegistrations + punchCardBookings;

    if (totalBookings >= capacity) {
      throw new BadRequestException('Deze training is vol');
    }

    // For PER_SESSION members, deduct from credit if available
    if (member.membershipType === 'PER_SESSION') {
      const pricePerSession = 8.5;
      if (member.credit >= pricePerSession) {
        await this.prisma.member.update({
          where: { id: member.id },
          data: {
            credit: { decrement: pricePerSession },
          },
        });
      }
      // If no credit, payment should have been handled on frontend
    }

    // Create registration
    const registration = await this.prisma.trainingRegistration.create({
      data: {
        memberId: member.id,
        trainingDate: new Date(dto.date),
        trainingTime: dto.time,
        location: dto.location,
      },
    });

    // Return updated credit for PER_SESSION members
    const updatedMember = member.membershipType === 'PER_SESSION'
      ? await this.prisma.member.findUnique({ where: { id: member.id } })
      : null;

    return {
      success: true,
      registration,
      credit: updatedMember?.credit,
    };
  }

  /**
   * Get member's training registrations
   */
  async getMyRegistrations(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { member: true },
    });

    if (!user?.member) {
      throw new NotFoundException('Member not found');
    }

    const registrations = await this.prisma.trainingRegistration.findMany({
      where: {
        memberId: user.member.id,
        trainingDate: { gte: new Date() },
      },
      orderBy: {
        trainingDate: 'asc',
      },
    });

    return registrations.map((reg) => ({
      id: reg.id,
      date: reg.trainingDate.toISOString().split('T')[0],
      time: reg.trainingTime,
      location: reg.location,
    }));
  }

  /**
   * Cancel a training registration
   */
  async cancelRegistration(userId: string, registrationId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { member: true },
    });

    if (!user?.member) {
      throw new NotFoundException('Member not found');
    }

    // Find the registration
    const registration = await this.prisma.trainingRegistration.findUnique({
      where: { id: registrationId },
    });

    if (!registration) {
      throw new NotFoundException('Registration not found');
    }

    if (registration.memberId !== user.member.id) {
      throw new UnauthorizedException('Not your registration');
    }

    // Check 4-hour rule
    const trainingDateTime = new Date(registration.trainingDate);
    const [hours, minutes] = registration.trainingTime.split(':').map(Number);
    trainingDateTime.setHours(hours, minutes, 0, 0);

    const now = new Date();
    const hoursDiff = (trainingDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursDiff < 4) {
      throw new BadRequestException('Uitschrijven kan alleen tot 4 uur voor aanvang');
    }

    // Delete registration
    await this.prisma.trainingRegistration.delete({
      where: { id: registrationId },
    });

    // Add credit for PER_SESSION members
    if (user.member.membershipType === 'PER_SESSION') {
      const pricePerSession = 8.5;
      await this.prisma.member.update({
        where: { id: user.member.id },
        data: {
          credit: { increment: pricePerSession },
        },
      });
    }

    return {
      success: true,
      message: 'Succesvol uitgeschreven',
      credit: user.member.membershipType === 'PER_SESSION'
        ? user.member.credit + 8.5
        : undefined,
    };
  }

  // ============================================================================
  // HELPERS
  // ============================================================================

  private getDaysBetween(date1: Date, date2: Date): number {
    const diffTime = date2.getTime() - date1.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }
}
