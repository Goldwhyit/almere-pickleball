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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MembersController = void 0;
const common_1 = require("@nestjs/common");
const mail_service_1 = require("../common/mail.service");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const validate_iban_1 = require("../common/validate-iban");
const swagger_1 = require("@nestjs/swagger");
const prisma_service_1 = require("../prisma/prisma.service");
const update_profile_dto_1 = require("./dto/update-profile.dto");
let MembersController = class MembersController {
    constructor(prisma, mailService) {
        this.prisma = prisma;
        this.mailService = mailService;
    }
    async getProfile(req) {
        var _a, _b;
        const userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) || ((_b = req.user) === null || _b === void 0 ? void 0 : _b.id);
        if (!userId)
            throw new Error('Geen userId in JWT');
        return this.prisma.member.findUnique({
            where: { userId },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                phone: true,
                dateOfBirth: true,
                street: true,
                houseNumber: true,
                postalCode: true,
                city: true,
                emergencyName: true,
                emergencyPhone: true,
                emergencyRelation: true,
                iban: true,
                ibanAccountHolder: true,
                sepaMandateConsent: true,
                sepaMandateConsentDate: true,
                accountType: true,
                membershipStatus: true,
                membershipPlan: true,
                punchCardRemaining: true,
                punchCardExpiryDate: true,
                user: { select: { id: true, email: true } },
            },
        });
    }
    async updateProfile(req, dto) {
        var _a, _b;
        const userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) || ((_b = req.user) === null || _b === void 0 ? void 0 : _b.id);
        if (!userId)
            throw new Error('Geen userId in JWT');
        if (dto.iban && !(0, validate_iban_1.isValidIban)(dto.iban)) {
            throw new common_1.BadRequestException('Ongeldig IBAN-nummer');
        }
        const { dateOfBirth, sepaMandateConsent } = dto, rest = __rest(dto, ["dateOfBirth", "sepaMandateConsent"]);
        const current = await this.prisma.member.findUnique({ where: { userId } });
        return this.prisma.member.update({
            where: { userId },
            data: Object.assign(Object.assign(Object.assign({}, rest), (dateOfBirth && { dateOfBirth: new Date(dateOfBirth) })), (sepaMandateConsent !== undefined && {
                sepaMandateConsent,
                sepaMandateConsentDate: sepaMandateConsent && !(current === null || current === void 0 ? void 0 : current.sepaMandateConsent) ? new Date() : current === null || current === void 0 ? void 0 : current.sepaMandateConsentDate,
            })),
        });
    }
    async deactivateAccount(req) {
        var _a, _b;
        const userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) || ((_b = req.user) === null || _b === void 0 ? void 0 : _b.id);
        if (!userId)
            throw new Error('Geen userId in JWT');
        await this.prisma.user.update({ where: { id: userId }, data: { isActive: false } });
        return { success: true, message: 'Account gedeactiveerd' };
    }
    async getAllMembers() {
        return this.prisma.member.findMany({
            include: {
                memberships: { orderBy: { createdAt: 'desc' }, take: 1 },
            },
        });
    }
    async getStats(req) {
        var _a, _b;
        const userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) || ((_b = req.user) === null || _b === void 0 ? void 0 : _b.id);
        if (!userId)
            throw new Error('Geen userId in JWT');
        return { matchesPlayed: 0, winPercentage: 0, duprRating: 3.0, clubRanking: 0 };
    }
    async getDashboard(req) {
        var _a, _b;
        const userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) || ((_b = req.user) === null || _b === void 0 ? void 0 : _b.id);
        if (!userId)
            throw new Error('Geen userId in JWT');
        return { matches: [], registeredTournaments: [], clubUpdates: [] };
    }
    async activateMember(memberId) {
        return this.prisma.member.update({
            where: { id: memberId },
            data: { membershipStatus: 'ACTIVE' },
        });
    }
    async approveMembership(id) {
        return { id, approved: true };
    }
    async rejectMembership(id) {
        return { id, rejected: true };
    }
};
exports.MembersController = MembersController;
__decorate([
    (0, common_1.Get)('profile'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MembersController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Put)('profile'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, update_profile_dto_1.UpdateProfileDto]),
    __metadata("design:returntype", Promise)
], MembersController.prototype, "updateProfile", null);
__decorate([
    (0, common_1.Delete)('account'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MembersController.prototype, "deactivateAccount", null);
__decorate([
    (0, common_1.Get)('all'),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MembersController.prototype, "getAllMembers", null);
__decorate([
    (0, common_1.Get)('stats'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MembersController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)('dashboard'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MembersController.prototype, "getDashboard", null);
__decorate([
    (0, common_1.Patch)(':memberId/activate'),
    __param(0, (0, common_1.Param)('memberId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MembersController.prototype, "activateMember", null);
__decorate([
    (0, common_1.Patch)('applications/:id/approve'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MembersController.prototype, "approveMembership", null);
__decorate([
    (0, common_1.Patch)('applications/:id/reject'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MembersController.prototype, "rejectMembership", null);
exports.MembersController = MembersController = __decorate([
    (0, swagger_1.ApiTags)('Members'),
    (0, common_1.Controller)('members'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, mail_service_1.MailService])
], MembersController);
//# sourceMappingURL=members.controller.js.map