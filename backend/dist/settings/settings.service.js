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
exports.SettingsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const DEFAULT_SETTINGS = {
    yearly_discount_percentage: '10',
};
let SettingsService = class SettingsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async get(key) {
        var _a, _b;
        const setting = await this.prisma.appSetting.findUnique({ where: { key } });
        return { key, value: (_b = (_a = setting === null || setting === void 0 ? void 0 : setting.value) !== null && _a !== void 0 ? _a : DEFAULT_SETTINGS[key]) !== null && _b !== void 0 ? _b : null };
    }
    async set(key, value) {
        const setting = await this.prisma.appSetting.upsert({
            where: { key },
            update: { value },
            create: { key, value },
        });
        return { key: setting.key, value: setting.value };
    }
};
exports.SettingsService = SettingsService;
exports.SettingsService = SettingsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SettingsService);
//# sourceMappingURL=settings.service.js.map