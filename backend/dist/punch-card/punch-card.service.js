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
exports.PunchCardService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const validate_session_date_1 = require("../common/validate-session-date");
const PUNCH_CARD_TOTAL = 10;
const PUNCH_CARD_WEEKDAYS = [2, 4];
let PunchCardService = class PunchCardService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findPunchCardMember(userId) {
        const member = await this.prisma.member.findUnique({ where: { userId } });
        if (!member) {
            throw new common_1.NotFoundException('Member not found for this user');
        }
        if (member.membershipPlan !== client_1.MembershipPlan.PUNCH_CARD) {
            throw new common_1.ForbiddenException('Dit account heeft geen strippenkaart');
        }
        return member;
    }
    validateSlot(member, dateStr) {
        return (0, validate_session_date_1.validateSessionSlot)({
            dateStr,
            allowedWeekdays: PUNCH_CARD_WEEKDAYS,
            windowEnd: member.punchCardExpiryDate,
            windowExpiredMessage: 'Deze datum valt buiten de geldigheid van je strippenkaart',
        });
    }
    async syncRemaining(memberId) {
        const count = await this.prisma.punchCardSession.count({ where: { memberId } });
        const remaining = Math.max(0, PUNCH_CARD_TOTAL - count);
        await this.prisma.member.update({ where: { id: memberId }, data: { punchCardRemaining: remaining } });
        return remaining;
    }
    async getMyStatus(userId) {
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
    async bookDate(userId, dateStr) {
        const member = await this.findPunchCardMember(userId);
        const activeCount = await this.prisma.punchCardSession.count({ where: { memberId: member.id } });
        if (activeCount >= PUNCH_CARD_TOTAL) {
            throw new common_1.BadRequestException('Je strippenkaart is op');
        }
        const date = this.validateSlot(member, dateStr);
        const existing = await this.prisma.punchCardSession.findFirst({
            where: { memberId: member.id, scheduledDate: date },
        });
        if (existing) {
            throw new common_1.ConflictException('Deze datum is al geboekt');
        }
        const session = await this.prisma.punchCardSession.create({
            data: { memberId: member.id, scheduledDate: date },
        });
        const remaining = await this.syncRemaining(member.id);
        return { success: true, message: 'Sessie ingepland', session, remaining };
    }
    async cancelSession(userId, sessionId) {
        const member = await this.findPunchCardMember(userId);
        const session = await this.prisma.punchCardSession.findFirst({
            where: { id: sessionId, memberId: member.id },
        });
        if (!session) {
            throw new common_1.NotFoundException('Sessie niet gevonden');
        }
        if (session.scheduledDate.getTime() <= Date.now()) {
            throw new common_1.BadRequestException('Deze sessie is al verstreken');
        }
        await this.prisma.punchCardSession.delete({ where: { id: sessionId } });
        const remaining = await this.syncRemaining(member.id);
        return { success: true, message: 'Sessie geannuleerd', remaining };
    }
    async rescheduleSession(userId, sessionId, newDateStr) {
        const member = await this.findPunchCardMember(userId);
        const session = await this.prisma.punchCardSession.findFirst({
            where: { id: sessionId, memberId: member.id },
        });
        if (!session) {
            throw new common_1.NotFoundException('Sessie niet gevonden');
        }
        if (session.scheduledDate.getTime() <= Date.now()) {
            throw new common_1.BadRequestException('Deze sessie is al verstreken');
        }
        const date = this.validateSlot(member, newDateStr);
        const existing = await this.prisma.punchCardSession.findFirst({
            where: { memberId: member.id, scheduledDate: date, id: { not: sessionId } },
        });
        if (existing) {
            throw new common_1.ConflictException('Deze datum is al geboekt');
        }
        const updated = await this.prisma.punchCardSession.update({
            where: { id: sessionId },
            data: { scheduledDate: date },
        });
        return { success: true, session: updated };
    }
};
exports.PunchCardService = PunchCardService;
exports.PunchCardService = PunchCardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PunchCardService);
//# sourceMappingURL=punch-card.service.js.map