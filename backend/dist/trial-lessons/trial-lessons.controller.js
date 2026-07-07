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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrialLessonsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const auth_decorators_1 = require("../common/decorators/auth.decorators");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const book_trial_date_dto_1 = require("./dto/book-trial-date.dto");
const create_trial_signup_dto_1 = require("./dto/create-trial-signup.dto");
const expire_trial_dto_1 = require("./dto/expire-trial.dto");
const trial_lessons_service_1 = require("./trial-lessons.service");
let TrialLessonsController = class TrialLessonsController {
    constructor(trialLessonsService) {
        this.trialLessonsService = trialLessonsService;
    }
    async signup(createTrialSignupDto) {
        return this.trialLessonsService.signup(createTrialSignupDto);
    }
    async getMyLessons(user) {
        return this.trialLessonsService.getMyLessons(user.userId || user.id);
    }
    async getMyStatus(user) {
        return this.trialLessonsService.getMyStatus(user.userId || user.id);
    }
    async bookDate(user, bookTrialDateDto) {
        return this.trialLessonsService.bookDate(user.userId || user.id, bookTrialDateDto.date);
    }
    async cancelLesson(user, lessonId) {
        return this.trialLessonsService.cancelLesson(user.userId || user.id, lessonId);
    }
    async rescheduleLesson(user, lessonId, newDate) {
        return this.trialLessonsService.rescheduleLesson(user.userId || user.id, lessonId, newDate);
    }
    async convertToMember(user, membershipPlan) {
        return this.trialLessonsService.convertToMember(user.userId || user.id, membershipPlan);
    }
    async declineMembership(user, expireTrialDto) {
        return this.trialLessonsService.declineMembership(user.userId || user.id, expireTrialDto.reason, expireTrialDto.feedback);
    }
    async getAllTrialMembers(status, startDate, endDate) {
        return this.trialLessonsService.getAllTrialMembers({ status, startDate, endDate });
    }
    async getTrialMemberDetails(memberId) {
        return this.trialLessonsService.getTrialMemberDetails(memberId);
    }
    async markLessonCompleted(lessonId) {
        return this.trialLessonsService.markLessonCompleted(lessonId);
    }
    async getStatsOverview() {
        return this.trialLessonsService.getStatsOverview();
    }
};
exports.TrialLessonsController = TrialLessonsController;
__decorate([
    (0, auth_decorators_1.Public)(),
    (0, common_1.Post)('signup'),
    (0, swagger_1.ApiOperation)({ summary: 'Sign up a new trial member' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Trial signup created successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_trial_signup_dto_1.CreateTrialSignupDto]),
    __metadata("design:returntype", Promise)
], TrialLessonsController.prototype, "signup", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Get)('my-lessons'),
    (0, swagger_1.ApiOperation)({ summary: "Get the authenticated member's trial lessons" }),
    __param(0, (0, auth_decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TrialLessonsController.prototype, "getMyLessons", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Get)('my-status'),
    (0, swagger_1.ApiOperation)({ summary: 'Get the authenticated member trial status' }),
    __param(0, (0, auth_decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TrialLessonsController.prototype, "getMyStatus", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Post)('book-date'),
    (0, swagger_1.ApiOperation)({ summary: 'Book a single trial lesson date for the authenticated member' }),
    __param(0, (0, auth_decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, book_trial_date_dto_1.BookTrialDateDto]),
    __metadata("design:returntype", Promise)
], TrialLessonsController.prototype, "bookDate", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Delete)('lessons/:lessonId'),
    (0, swagger_1.ApiOperation)({ summary: 'Cancel an upcoming trial lesson' }),
    __param(0, (0, auth_decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('lessonId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], TrialLessonsController.prototype, "cancelLesson", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Put)(':lessonId/reschedule'),
    (0, swagger_1.ApiOperation)({ summary: 'Reschedule one trial lesson' }),
    __param(0, (0, auth_decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('lessonId')),
    __param(2, (0, common_1.Body)('newDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], TrialLessonsController.prototype, "rescheduleLesson", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Post)('convert-to-member'),
    (0, swagger_1.ApiOperation)({ summary: 'Convert a trial member into a paid member' }),
    __param(0, (0, auth_decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Body)('membershipPlan')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], TrialLessonsController.prototype, "convertToMember", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Post)('decline-membership'),
    (0, swagger_1.ApiOperation)({ summary: 'Decline the trial membership offer' }),
    __param(0, (0, auth_decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, expire_trial_dto_1.ExpireTrialDto]),
    __metadata("design:returntype", Promise)
], TrialLessonsController.prototype, "declineMembership", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Get)('admin/all'),
    (0, swagger_1.ApiOperation)({ summary: 'List all trial members for admin use' }),
    __param(0, (0, common_1.Query)('status')),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], TrialLessonsController.prototype, "getAllTrialMembers", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Get)('admin/:memberId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get detailed trial information for one member' }),
    __param(0, (0, common_1.Param)('memberId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TrialLessonsController.prototype, "getTrialMemberDetails", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Put)('admin/:lessonId/mark-completed'),
    (0, swagger_1.ApiOperation)({ summary: 'Mark a trial lesson as completed' }),
    __param(0, (0, common_1.Param)('lessonId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TrialLessonsController.prototype, "markLessonCompleted", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Get)('admin/stats/overview'),
    (0, swagger_1.ApiOperation)({ summary: 'Get trial lesson overview statistics' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TrialLessonsController.prototype, "getStatsOverview", null);
exports.TrialLessonsController = TrialLessonsController = __decorate([
    (0, swagger_1.ApiTags)('Trial Lessons'),
    (0, common_1.Controller)('trial-lessons'),
    __metadata("design:paramtypes", [trial_lessons_service_1.TrialLessonsService])
], TrialLessonsController);
//# sourceMappingURL=trial-lessons.controller.js.map