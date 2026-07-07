import { BadRequestException } from '@nestjs/common';

const WEEKDAY_LABELS: Record<number, string> = {
  0: 'zondag',
  1: 'maandag',
  2: 'dinsdag',
  3: 'woensdag',
  4: 'donderdag',
  5: 'vrijdag',
  6: 'zaterdag',
};

export function validateSessionSlot(params: {
  dateStr: string;
  allowedWeekdays: number[];
  windowStart?: Date | null;
  windowEnd?: Date | null;
  weekdayMessage?: string;
  windowExpiredMessage?: string;
}): Date {
  const { dateStr, allowedWeekdays, windowStart, windowEnd, weekdayMessage, windowExpiredMessage } = params;

  const datePart = dateStr.split('T')[0];
  const date = new Date(`${datePart}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    throw new BadRequestException('Ongeldige datum');
  }

  if (!allowedWeekdays.includes(date.getDay())) {
    const labels = allowedWeekdays.map((day) => WEEKDAY_LABELS[day]).join(' of ');
    throw new BadRequestException(weekdayMessage || `Sessies kunnen alleen op ${labels} worden ingepland`);
  }

  const now = new Date();
  if (date.getTime() <= now.getTime()) {
    throw new BadRequestException('Kies een datum in de toekomst');
  }

  if (windowStart && date.getTime() < windowStart.getTime()) {
    throw new BadRequestException('Deze datum ligt voor de start van je geldigheidsperiode');
  }

  if (windowEnd && date.getTime() > windowEnd.getTime()) {
    throw new BadRequestException(windowExpiredMessage || 'Deze datum valt buiten je geldigheidsperiode');
  }

  return date;
}
