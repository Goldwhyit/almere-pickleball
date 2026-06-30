"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayDaysModule = void 0;
const common_1 = require("@nestjs/common");
const play_day_registrations_controller_1 = require("./play-day-registrations.controller");
const play_day_registrations_service_1 = require("./play-day-registrations.service");
const prisma_module_1 = require("../prisma/prisma.module");
let PlayDaysModule = class PlayDaysModule {
};
exports.PlayDaysModule = PlayDaysModule;
exports.PlayDaysModule = PlayDaysModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        controllers: [play_day_registrations_controller_1.PlayDayRegistrationsController],
        providers: [play_day_registrations_service_1.PlayDayRegistrationsService],
        exports: [play_day_registrations_service_1.PlayDayRegistrationsService],
    })
], PlayDaysModule);
//# sourceMappingURL=play-days.module.js.map