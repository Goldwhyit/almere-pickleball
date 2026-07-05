"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrialLessonsService = void 0;
const common_1 = require("@nestjs/common");
const bcrypt = require("bcrypt");
const prisma_service_1 = require("../prisma/prisma.service");
let TrialLessonsService = class TrialLessonsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async signup(dto) {
        if (!dto.agreedToTerms) {
            throw new common_1.BadRequestException('You must agree to the terms before signing up');
        }
        const existingUser = await this.prisma.user.findUnique({ where: { email: dto.email } });
        if (existingUser) {
            throw new common_1.ConflictException('An account with this email address already exists');
        }
        const hashedPassword = await bcrypt.hash(dto.password, 10);
        const trialStartDate = new Date();
        const trialEndDate = new Date(trialStartDate.getTime() + 14 * 24 * 60 * 60 * 1000);
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
    async getMyLessons(userId) {
        const member = await this.findMemberByUserId(userId);
        const lessons = await this.prisma.trialLesson.findMany({
            where: { memberId: member.id },
            orderBy: { scheduledDate: 'asc' },
        });
        return { member, lessons };
    }
    async getMyStatus(userId) {
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
    async bookDates(userId, dates) {
        const member = await this.findMemberByUserId(userId);
        if (!dates || dates.length === 0) {
            throw new common_1.BadRequestException('Please provide at least one date');
        }
        await this.prisma.trialLesson.deleteMany({
            where: { memberId: member.id, completed: false },
        });
        const lessonData = dates.slice(0, 3).map((date) => ({
            memberId: member.id,
            scheduledDate: new Date(date),
        }));
        const createdLessons = await this.prisma.trialLesson.createMany({
            data: lessonData,
        });
        await this.prisma.member.update({
            where: { id: member.id },
            data: {
                trialLessonsBooked: lessonData.length,
                trialLessonsCompleted: 0,
            },
        });
        return {
            success: true,
            message: 'Trial dates booked successfully',
            bookedCount: createdLessons.count,
            lessons: lessonData,
        };
    }
    async rescheduleLesson(userId, lessonId, newDate) {
        const member = await this.findMemberByUserId(userId);
        const lesson = await this.prisma.trialLesson.findFirst({
            where: { id: lessonId, memberId: member.id },
        });
        if (!lesson) {
            throw new common_1.NotFoundException('Trial lesson not found');
        }
        const updatedLesson = await this.prisma.trialLesson.update({
            where: { id: lessonId },
            data: { scheduledDate: new Date(newDate) },
        });
        return { success: true, lesson: updatedLesson };
    }
    async convertToMember(userId, membershipPlan) {
        const member = await this.findMemberByUserId(userId);
        const plan = (membershipPlan || 'MONTHLY').toUpperCase();
        const updatedMember = await this.prisma.member.update({
            where: { id: member.id },
            data: {
                accountType: 'MEMBER',
                membershipStatus: 'ACTIVE',
                membershipPlan: plan,
                trialStatus: 'COMPLETED',
            },
        });
        await this.prisma.membership.create({
            data: {
                memberId: member.id,
                plan: plan,
                startDate: new Date(),
                status: 'ACTIVE',
                autoRenew: false,
            },
        });
        return { success: true, member: updatedMember };
    }
    async declineMembership(userId, reason, feedback) {
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
    async getAllTrialMembers(filters) {
        const where = {
            accountType: 'TRIAL',
        };
        if (filters.status) {
            where.trialStatus = filters.status;
        }
        if (filters.startDate || filters.endDate) {
            where.trialStartDate = {};
            if (filters.startDate) {
                where.trialStartDate.gte = new Date(filters.startDate);
            }
            if (filters.endDate) {
                where.trialStartDate.lte = new Date(filters.endDate);
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
    async getTrialMemberDetails(memberId) {
        const member = await this.prisma.member.findUnique({
            where: { id: memberId },
            include: {
                user: { select: { id: true, email: true } },
                trialLessons: { orderBy: { scheduledDate: 'asc' } },
            },
        });
        if (!member) {
            throw new common_1.NotFoundException('Member not found');
        }
        return member;
    }
    async markLessonCompleted(lessonId) {
        const lesson = await this.prisma.trialLesson.findUnique({ where: { id: lessonId } });
        if (!lesson) {
            throw new common_1.NotFoundException('Trial lesson not found');
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
    async findMemberByUserId(userId) {
        const member = await this.prisma.member.findUnique({ where: { userId } });
        if (!member) {
            throw new common_1.NotFoundException('Member not found for this user');
        }
        return member;
    }
};
exports.TrialLessonsService = TrialLessonsService;
exports.TrialLessonsService = TrialLessonsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TrialLessonsService);
//# sourceMappingURL=trial-lessons.service.js.map