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
exports.MembershipsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const auth_decorators_1 = require("../common/decorators/auth.decorators");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const apply_membership_dto_1 = require("./dto/apply-membership.dto");
const memberships_service_1 = require("./memberships.service");
let MembershipsController = class MembershipsController {
    constructor(membershipsService) {
        this.membershipsService = membershipsService;
    }
    async apply(applyMembershipDto) {
        return this.membershipsService.apply(applyMembershipDto);
    }
    async getPlans() {
        return this.membershipsService.getPlans();
    }
    async getApplications(user) {
        return this.membershipsService.getApplications(user.userId || user.id);
    }
    async getMyMembership(user) {
        return this.membershipsService.getMyMembership(user.userId || user.id);
    }
};
exports.MembershipsController = MembershipsController;
__decorate([
    (0, auth_decorators_1.Public)(),
    (0, common_1.Post)('apply'),
    (0, swagger_1.ApiOperation)({ summary: 'Apply for a membership' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Membership application submitted' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [apply_membership_dto_1.ApplyMembershipDto]),
    __metadata("design:returntype", Promise)
], MembershipsController.prototype, "apply", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Get)('plans'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MembershipsController.prototype, "getPlans", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Get)('applications'),
    __param(0, (0, auth_decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MembershipsController.prototype, "getApplications", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Get)('my-membership'),
    __param(0, (0, auth_decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MembershipsController.prototype, "getMyMembership", null);
exports.MembershipsController = MembershipsController = __decorate([
    (0, swagger_1.ApiTags)('Memberships'),
    (0, common_1.Controller)('memberships'),
    __metadata("design:paramtypes", [memberships_service_1.MembershipsService])
], MembershipsController);
//# sourceMappingURL=memberships.controller.js.map