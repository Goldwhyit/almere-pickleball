"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const auth_module_1 = require("./auth/auth.module");
const courts_module_1 = require("./courts/courts.module");
const members_module_1 = require("./members/members.module");
const play_days_module_1 = require("./play-days/play-days.module");
const prisma_module_1 = require("./prisma/prisma.module");
const tournaments_module_1 = require("./tournaments/tournaments.module");
const trial_lessons_module_1 = require("./trial-lessons/trial-lessons.module");
const memberships_module_1 = require("./memberships/memberships.module");
const matches_module_1 = require("./matches/matches.module");
const punch_card_module_1 = require("./punch-card/punch-card.module");
const settings_module_1 = require("./settings/settings.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            members_module_1.MembersModule,
            courts_module_1.CourtsModule,
            play_days_module_1.PlayDaysModule,
            tournaments_module_1.TournamentsModule,
            trial_lessons_module_1.TrialLessonsModule,
            memberships_module_1.MembershipsModule,
            matches_module_1.MatchesModule,
            punch_card_module_1.PunchCardModule,
            settings_module_1.SettingsModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map