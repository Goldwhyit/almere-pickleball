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
exports.MembershipsService = void 0;
const common_1 = require("@nestjs/common");
const bcrypt = require("bcrypt");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const MEMBERSHIP_PLAN_ALIASES = {
    per_session: client_1.MembershipPlan.PER_SESSION,
    punch_card: client_1.MembershipPlan.PUNCH_CARD,
    monthly: client_1.MembershipPlan.MONTHLY,
    yearly: client_1.MembershipPlan.YEARLY,
    yearly_upfront: client_1.MembershipPlan.YEARLY_UPFRONT,
};
const MONTHLY_PRICE = 15.75;
function addMonths(date, months) {
    const result = new Date(date.getTime());
    result.setMonth(result.getMonth() + months);
    return result;
}
function resolveMembershipPlan(membershipType) {
    if (!membershipType)
        return client_1.MembershipPlan.PER_SESSION;
    if (Object.values(client_1.MembershipPlan).includes(membershipType)) {
        return membershipType;
    }
    return MEMBERSHIP_PLAN_ALIASES[membershipType.toLowerCase()] || client_1.MembershipPlan.PER_SESSION;
}
let MembershipsService = class MembershipsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async apply(dto) {
        if (!dto.agreedToTerms || !dto.agreedToPrivacy) {
            throw new common_1.BadRequestException('You must accept the terms and privacy policy');
        }
        const existingUser = await this.prisma.user.findUnique({ where: { email: dto.email } });
        if (existingUser) {
            throw new common_1.ConflictException('An account with this email already exists');
        }
        const hashedPassword = await bcrypt.hash(dto.password, 10);
        const membershipPlan = resolveMembershipPlan(dto.membershipType);
        const isPunchCard = membershipPlan === client_1.MembershipPlan.PUNCH_CARD;
        const isMonthly = membershipPlan === client_1.MembershipPlan.MONTHLY;
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
            data: Object.assign({ userId: user.id, firstName: dto.firstName, lastName: dto.lastName, phone: dto.phone, dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : null, accountType: 'MEMBER', membershipStatus: 'PENDING', membershipPlan, trialStatus: 'PENDING' }, (isPunchCard && {
                punchCardRemaining: 10,
                punchCardExpiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
            })),
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
    async getApplications(userId) {
        return { success: true, applications: [] };
    }
    async getMyMembership(userId) {
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
        const isPaymentOutstanding = Boolean((membership === null || membership === void 0 ? void 0 : membership.currentPeriodEnd) && membership.currentPeriodEnd.getTime() <= Date.now());
        return {
            success: true,
            member,
            membership,
            isPaymentOutstanding,
            monthlyPrice: MONTHLY_PRICE,
        };
    }
    async markPaymentReceived(membershipId) {
        const membership = await this.prisma.membership.findUnique({ where: { id: membershipId } });
        if (!membership) {
            throw new common_1.NotFoundException('Membership niet gevonden');
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
};
exports.MembershipsService = MembershipsService;
exports.MembershipsService = MembershipsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MembershipsService);
//# sourceMappingURL=memberships.service.js.map