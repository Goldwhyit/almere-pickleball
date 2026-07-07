"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateSessionSlot = validateSessionSlot;
const common_1 = require("@nestjs/common");
const WEEKDAY_LABELS = {
    0: 'zondag',
    1: 'maandag',
    2: 'dinsdag',
    3: 'woensdag',
    4: 'donderdag',
    5: 'vrijdag',
    6: 'zaterdag',
};
function validateSessionSlot(params) {
    const { dateStr, allowedWeekdays, windowStart, windowEnd, weekdayMessage, windowExpiredMessage } = params;
    const datePart = dateStr.split('T')[0];
    const date = new Date(`${datePart}T00:00:00`);
    if (Number.isNaN(date.getTime())) {
        throw new common_1.BadRequestException('Ongeldige datum');
    }
    if (!allowedWeekdays.includes(date.getDay())) {
        const labels = allowedWeekdays.map((day) => WEEKDAY_LABELS[day]).join(' of ');
        throw new common_1.BadRequestException(weekdayMessage || `Sessies kunnen alleen op ${labels} worden ingepland`);
    }
    const now = new Date();
    if (date.getTime() <= now.getTime()) {
        throw new common_1.BadRequestException('Kies een datum in de toekomst');
    }
    if (windowStart && date.getTime() < windowStart.getTime()) {
        throw new common_1.BadRequestException('Deze datum ligt voor de start van je geldigheidsperiode');
    }
    if (windowEnd && date.getTime() > windowEnd.getTime()) {
        throw new common_1.BadRequestException(windowExpiredMessage || 'Deze datum valt buiten je geldigheidsperiode');
    }
    return date;
}
//# sourceMappingURL=validate-session-date.js.map