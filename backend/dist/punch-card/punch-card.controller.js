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
exports.PunchCardController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const auth_decorators_1 = require("../common/decorators/auth.decorators");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const book_punch_card_date_dto_1 = require("./dto/book-punch-card-date.dto");
const punch_card_service_1 = require("./punch-card.service");
let PunchCardController = class PunchCardController {
    constructor(punchCardService) {
        this.punchCardService = punchCardService;
    }
    async getMyStatus(user) {
        return this.punchCardService.getMyStatus(user.userId || user.id);
    }
    async bookDate(user, bookPunchCardDateDto) {
        return this.punchCardService.bookDate(user.userId || user.id, bookPunchCardDateDto.date);
    }
    async rescheduleSession(user, sessionId, newDate) {
        return this.punchCardService.rescheduleSession(user.userId || user.id, sessionId, newDate);
    }
    async cancelSession(user, sessionId) {
        return this.punchCardService.cancelSession(user.userId || user.id, sessionId);
    }
};
exports.PunchCardController = PunchCardController;
__decorate([
    (0, common_1.Get)('my-status'),
    (0, swagger_1.ApiOperation)({ summary: 'Get the authenticated member punch card status and sessions' }),
    __param(0, (0, auth_decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PunchCardController.prototype, "getMyStatus", null);
__decorate([
    (0, common_1.Post)('book-date'),
    (0, swagger_1.ApiOperation)({ summary: 'Book a single punch card session date' }),
    __param(0, (0, auth_decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, book_punch_card_date_dto_1.BookPunchCardDateDto]),
    __metadata("design:returntype", Promise)
], PunchCardController.prototype, "bookDate", null);
__decorate([
    (0, common_1.Put)('sessions/:sessionId/reschedule'),
    (0, swagger_1.ApiOperation)({ summary: 'Reschedule an upcoming punch card session' }),
    __param(0, (0, auth_decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('sessionId')),
    __param(2, (0, common_1.Body)('newDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], PunchCardController.prototype, "rescheduleSession", null);
__decorate([
    (0, common_1.Delete)('sessions/:sessionId'),
    (0, swagger_1.ApiOperation)({ summary: 'Cancel an upcoming punch card session' }),
    __param(0, (0, auth_decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PunchCardController.prototype, "cancelSession", null);
exports.PunchCardController = PunchCardController = __decorate([
    (0, swagger_1.ApiTags)('Punch Card'),
    (0, common_1.Controller)('punch-card'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [punch_card_service_1.PunchCardService])
], PunchCardController);
//# sourceMappingURL=punch-card.controller.js.map