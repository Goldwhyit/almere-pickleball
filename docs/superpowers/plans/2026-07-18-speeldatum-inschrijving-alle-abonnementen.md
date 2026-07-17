# Speeldatum-inschrijving voor alle abonnementsvormen — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Elke abonnementsvorm (Proefles, Strippenkaart, Maandabonnement, Jaarabonnement, Per-sessie) kan zich inschrijven op een speeldatum (dinsdag/donderdag), elk met de eigen abonnementsbeperking. Proefles en Strippenkaart werken al; deze plan bouwt het ontbrekende stuk voor Maandabonnement, Jaarabonnement en Per-sessie.

**Architecture:** Het ongebruikte `PlayDayRegistration`-Prisma-model wordt versimpeld tot een directe datum-tabel (zoals `PunchCardSession`/`TrialLesson`), met een nieuwe backend-service die per plan de juiste regel afdwingt (max 1x per kalenderweek voor Maand/Jaar, onbeperkt + directe betaalbevestiging voor Per-sessie). Eén gedeelde React-component (`PlayDayCalendar`) toont de komende 12 weken en wordt in drie dashboards hergebruikt (twee bestaande, één nieuwe). Het bestaande admin-paneel wordt voor het eerst echt van data voorzien.

**Tech Stack:** NestJS + Prisma + PostgreSQL (backend), React + react-router-dom + Tailwind (frontend), Jest (nieuw voor backend-unittests).

**Zie ook:** `docs/superpowers/specs/2026-07-18-speeldatum-inschrijving-alle-abonnementen-design.md`

## Global Constraints

- Speeldagen zijn altijd **dinsdag (weekday 2) en donderdag (weekday 4)** — geen andere dagen.
- Kalenderweek = **maandag t/m zondag**.
- **Geen capaciteitslimiet** per speeldatum.
- Maandabonnement/Jaarabonnement (MONTHLY/YEARLY/YEARLY_UPFRONT): **max 1 inschrijving per kalenderweek**.
- Per-sessie (PER_SESSION): **onbeperkt**, elke inschrijving kost **€8,50** en vereist een directe betaalbevestiging in de UI vóór de inschrijving wordt aangemaakt.
- Inschrijven vereist altijd `membershipStatus === 'ACTIVE'` en een datum in de toekomst.
- Dit project heeft **geen Prisma-migratiegeschiedenis** (`backend/prisma/migrations` bestaat niet) — gebruik `npx prisma db push`, niet `migrate dev`.
- Dit project heeft **geen frontend-testinfrastructuur** — frontend-taken worden handmatig geverifieerd via de dev-server in de browser, niet met geautomatiseerde tests.
- Alle gebruikersgerichte teksten zijn in het Nederlands, consistent met de rest van de applicatie.
- Proefles (`TrialDashboard.tsx`/`trial-lessons`-module) en Strippenkaart (`PunchCardDashboard.tsx`/`punch-card`-module) blijven **volledig ongewijzigd**.

---

## Task 1: Prisma-schema — versimpel `PlayDayRegistration`

**Files:**
- Modify: `backend/prisma/schema.prisma:245-296`

**Interfaces:**
- Produces: `PlayDayRegistration` model met velden `id, memberId, scheduledDate, membershipPlan, paymentStatus, createdAt, updatedAt`, uniek per `[memberId, scheduledDate]`, mapped op tabel `play_day_registrations`. Alle volgende taken bouwen hierop.

- [ ] **Step 1: Pas het schema aan**

Open `backend/prisma/schema.prisma`. Vervang het blok van `model PlayDay {` tot en met `enum RegStatus { ... }` (regels 245-296) door:

```prisma
model PlayDay {
  id              String          @id @default(cuid())
  courtId         String
  scheduledDate   DateTime
  startTime       String          @default("19:00")
  endTime         String          @default("21:00")
  maxPlayers      Int             @default(4)
  playerCount     Int             @default(0)
  price           Float           @default(0)
  status          PlayDayStatus   @default(SCHEDULED)
  description     String?
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt

  // Relations
  court           Court           @relation(fields: [courtId], references: [id], onDelete: Restrict)
  matches         Match[]

  @@map("play_days")
  @@index([courtId, scheduledDate])
}

enum PlayDayStatus {
  SCHEDULED
  IN_PROGRESS
  COMPLETED
  CANCELLED
}

model PlayDayRegistration {
  id             String         @id @default(cuid())
  memberId       String
  scheduledDate  DateTime
  membershipPlan MembershipPlan
  paymentStatus  PaymentStatus  @default(PENDING)
  createdAt      DateTime       @default(now())
  updatedAt      DateTime       @updatedAt

  member         Member         @relation(fields: [memberId], references: [id], onDelete: Cascade)

  @@unique([memberId, scheduledDate])
  @@map("play_day_registrations")
}
```

Dit verwijdert de `registrations PlayDayRegistration[]`-terugverwijzing uit `PlayDay` en het hele `RegStatus`-enum (nergens anders gebruikt — geverifieerd met `grep -rn "RegStatus" backend/src backend/prisma`). `Member.playDayRegistrations PlayDayRegistration[]` (elders in het schema) blijft ongewijzigd staan; die relatie verwijst automatisch naar de nieuwe vorm.

- [ ] **Step 2: Valideer het schema**

Run: `cd backend && npx prisma validate`
Expected: `The schema at prisma/schema.prisma is valid 🚀`

- [ ] **Step 3: Synchroniseer de database en genereer de client**

Run: `cd backend && npx prisma db push --accept-data-loss`
Expected: bevestiging dat de database is gesynchroniseerd (de `--accept-data-loss`-vlag is nodig omdat de vorm van `play_day_registrations` drastisch wijzigt; de tabel is leeg/ongebruikt, dus dit is veilig).

Run: `cd backend && npx prisma generate`
Expected: `✔ Generated Prisma Client`

- [ ] **Step 4: Commit**

```bash
git add backend/prisma/schema.prisma
git commit -m "refactor: versimpel PlayDayRegistration tot directe datum-tabel"
```

---

## Task 2: Kalenderweek-helper (TDD) + Jest-configuratie

**Files:**
- Create: `backend/src/common/calendar-week.ts`
- Test: `backend/src/common/calendar-week.spec.ts`
- Modify: `backend/package.json` (jest-configuratie toevoegen)

**Interfaces:**
- Produces: `getCalendarWeekRange(date: Date): { start: Date; end: Date }` — start = maandag 00:00:00.000 van de week van `date`, end = zondag 23:59:59.999 van diezelfde week. Wordt gebruikt door Task 3 (`PlayDayRegistrationsService`).

- [ ] **Step 1: Voeg Jest-configuratie toe**

Dit project heeft `jest`/`ts-jest`/`@nestjs/testing` als devDependency maar nog geen werkende Jest-config (geen `"jest"`-blok in `package.json`, geen `.spec.ts`-bestanden). Open `backend/package.json` en voeg, ná de `"devDependencies"`-key (als nieuwe top-level key, vóór de laatste sluit-`}` van het bestand), toe:

```json
  ,
  "jest": {
    "moduleFileExtensions": ["js", "json", "ts"],
    "rootDir": "src",
    "testRegex": ".*\\.spec\\.ts$",
    "transform": {
      "^.+\\.(t|j)s$": "ts-jest"
    },
    "collectCoverageFrom": ["**/*.(t|j)s"],
    "coverageDirectory": "../coverage",
    "testEnvironment": "node"
  }
```

(Let op: dit is het standaard NestJS-CLI-gegenereerde jest-blok — voeg de komma en sleutel toe zodat het resulterende JSON-bestand geldig blijft.)

- [ ] **Step 2: Schrijf de falende test**

Create `backend/src/common/calendar-week.spec.ts`:

```ts
import { getCalendarWeekRange } from './calendar-week';

describe('getCalendarWeekRange', () => {
  it('returns Monday 00:00 to Sunday 23:59:59.999 for a Tuesday', () => {
    const tuesday = new Date('2026-07-21T10:00:00'); // dinsdag 21 juli 2026
    const { start, end } = getCalendarWeekRange(tuesday);

    expect(start.getFullYear()).toBe(2026);
    expect(start.getMonth()).toBe(6); // juli = index 6
    expect(start.getDate()).toBe(20); // maandag 20 juli 2026
    expect(start.getHours()).toBe(0);
    expect(start.getMinutes()).toBe(0);
    expect(start.getSeconds()).toBe(0);

    expect(end.getDate()).toBe(26); // zondag 26 juli 2026
    expect(end.getHours()).toBe(23);
    expect(end.getMinutes()).toBe(59);
    expect(end.getSeconds()).toBe(59);
  });

  it('returns the same week range for both dinsdag and donderdag', () => {
    const tuesday = new Date('2026-07-21T10:00:00');
    const thursday = new Date('2026-07-23T10:00:00');

    const rangeA = getCalendarWeekRange(tuesday);
    const rangeB = getCalendarWeekRange(thursday);

    expect(rangeA.start.getTime()).toBe(rangeB.start.getTime());
    expect(rangeA.end.getTime()).toBe(rangeB.end.getTime());
  });

  it('handles a Sunday by rolling back to the Monday before it', () => {
    const sunday = new Date('2026-07-26T10:00:00');
    const { start, end } = getCalendarWeekRange(sunday);

    expect(start.getDate()).toBe(20);
    expect(start.getMonth()).toBe(6);
    expect(end.getDate()).toBe(26);
    expect(end.getMonth()).toBe(6);
  });
});
```

- [ ] **Step 3: Run de test om te bevestigen dat die faalt**

Run: `cd backend && npx jest calendar-week -v`
Expected: FAIL — `Cannot find module './calendar-week'` (dit bevestigt ook meteen dat de Jest-config uit Step 1 werkt: de fout moet een module-resolutiefout zijn, geen TypeScript-parsefout).

- [ ] **Step 4: Implementeer**

Create `backend/src/common/calendar-week.ts`:

```ts
export function getCalendarWeekRange(date: Date): { start: Date; end: Date } {
  const day = date.getDay(); // 0 = zondag ... 6 = zaterdag
  const diffToMonday = day === 0 ? -6 : 1 - day;

  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() + diffToMonday);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}
```

- [ ] **Step 5: Run de test om te bevestigen dat die slaagt**

Run: `cd backend && npx jest calendar-week -v`
Expected: PASS — 3 tests groen.

- [ ] **Step 6: Commit**

```bash
git add backend/package.json backend/src/common/calendar-week.ts backend/src/common/calendar-week.spec.ts
git commit -m "feat: voeg kalenderweek-helper toe (met Jest-config)"
```

---

## Task 3: `PlayDayRegistrationsService` — registreren, annuleren, opvragen

**Files:**
- Modify: `backend/src/play-days/play-day-registrations.service.ts` (volledige herschrijving van de stub)
- Test: `backend/src/play-days/play-day-registrations.service.spec.ts`

**Interfaces:**
- Consumes: `getCalendarWeekRange(date: Date)` uit Task 2; `validateSessionSlot(params)` uit `backend/src/common/validate-session-date.ts` (bestaand, ongewijzigd); `PrismaService` uit `backend/src/prisma/prisma.service.ts` (bestaand).
- Produces: `PlayDayRegistrationsService` met methods:
  - `getMyRegistrations(userId: string): Promise<PlayDayRegistration[]>`
  - `register(userId: string, dateStr: string): Promise<{ success: true; message: string; registration: PlayDayRegistration }>`
  - `cancel(userId: string, registrationId: string): Promise<{ success: true; message: string }>`

  Gebruikt door Task 4 (`PlayDayRegistrationsController`).

- [ ] **Step 1: Schrijf de falende tests**

Create `backend/src/play-days/play-day-registrations.service.spec.ts`:

```ts
import { Test } from '@nestjs/testing';
import { BadRequestException, ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { MembershipPlan, MembershipStatus, PaymentStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PlayDayRegistrationsService } from './play-day-registrations.service';

describe('PlayDayRegistrationsService', () => {
  let service: PlayDayRegistrationsService;
  let prisma: {
    member: { findUnique: jest.Mock };
    playDayRegistration: {
      findMany: jest.Mock;
      findFirst: jest.Mock;
      create: jest.Mock;
      delete: jest.Mock;
    };
  };

  const monthlyMember = {
    id: 'member-1',
    membershipPlan: MembershipPlan.MONTHLY,
    membershipStatus: MembershipStatus.ACTIVE,
  };

  beforeEach(async () => {
    prisma = {
      member: { findUnique: jest.fn() },
      playDayRegistration: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
      },
    };

    const moduleRef = await Test.createTestingModule({
      providers: [PlayDayRegistrationsService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = moduleRef.get(PlayDayRegistrationsService);
  });

  function nextWeekday(weekday: number): Date {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + 1);
    while (date.getDay() !== weekday) {
      date.setDate(date.getDate() + 1);
    }
    return date;
  }

  const toDateStr = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  describe('register', () => {
    it('registreert een MONTHLY-lid voor een aankomende dinsdag', async () => {
      prisma.member.findUnique.mockResolvedValue(monthlyMember);
      prisma.playDayRegistration.findFirst.mockResolvedValue(null);
      prisma.playDayRegistration.create.mockResolvedValue({ id: 'reg-1' });

      const tuesday = nextWeekday(2);
      const result = await service.register('user-1', toDateStr(tuesday));

      expect(result.success).toBe(true);
      expect(prisma.playDayRegistration.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          memberId: 'member-1',
          membershipPlan: MembershipPlan.MONTHLY,
          paymentStatus: PaymentStatus.PENDING,
        }),
      });
    });

    it('weigert een tweede inschrijving in dezelfde kalenderweek voor MONTHLY', async () => {
      prisma.member.findUnique.mockResolvedValue(monthlyMember);
      prisma.playDayRegistration.findFirst
        .mockResolvedValueOnce(null) // geen dubbele registratie op exacte datum
        .mockResolvedValueOnce({ id: 'existing-reg' }); // al geboekt deze week

      const thursday = nextWeekday(4);
      await expect(service.register('user-1', toDateStr(thursday))).rejects.toThrow(ConflictException);
    });

    it('staat PER_SESSION toe om dinsdag én donderdag dezelfde week te boeken, en zet betaling meteen op voltooid', async () => {
      const perSessionMember = { ...monthlyMember, membershipPlan: MembershipPlan.PER_SESSION };
      prisma.member.findUnique.mockResolvedValue(perSessionMember);
      prisma.playDayRegistration.findFirst.mockResolvedValue(null);
      prisma.playDayRegistration.create.mockResolvedValue({ id: 'reg-2' });

      const thursday = nextWeekday(4);
      await service.register('user-1', toDateStr(thursday));

      expect(prisma.playDayRegistration.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ paymentStatus: PaymentStatus.COMPLETED }),
      });
    });

    it('weigert een lid met een niet-toegestaan abonnement', async () => {
      prisma.member.findUnique.mockResolvedValue({ ...monthlyMember, membershipPlan: MembershipPlan.PUNCH_CARD });

      const tuesday = nextWeekday(2);
      await expect(service.register('user-1', toDateStr(tuesday))).rejects.toThrow(ForbiddenException);
    });

    it('weigert een lid zonder actief lidmaatschap', async () => {
      prisma.member.findUnique.mockResolvedValue({ ...monthlyMember, membershipStatus: MembershipStatus.SUSPENDED });

      const tuesday = nextWeekday(2);
      await expect(service.register('user-1', toDateStr(tuesday))).rejects.toThrow(ForbiddenException);
    });

    it('weigert een datum die geen dinsdag of donderdag is', async () => {
      prisma.member.findUnique.mockResolvedValue(monthlyMember);

      const monday = nextWeekday(1);
      await expect(service.register('user-1', toDateStr(monday))).rejects.toThrow(BadRequestException);
    });
  });

  describe('cancel', () => {
    it('gooit NotFoundException als de inschrijving niet van dit lid is', async () => {
      prisma.member.findUnique.mockResolvedValue(monthlyMember);
      prisma.playDayRegistration.findFirst.mockResolvedValue(null);

      await expect(service.cancel('user-1', 'reg-x')).rejects.toThrow(NotFoundException);
    });

    it('verwijdert een toekomstige inschrijving', async () => {
      prisma.member.findUnique.mockResolvedValue(monthlyMember);
      const future = nextWeekday(2);
      prisma.playDayRegistration.findFirst.mockResolvedValue({ id: 'reg-1', scheduledDate: future });
      prisma.playDayRegistration.delete.mockResolvedValue({ id: 'reg-1' });

      const result = await service.cancel('user-1', 'reg-1');
      expect(result.success).toBe(true);
      expect(prisma.playDayRegistration.delete).toHaveBeenCalledWith({ where: { id: 'reg-1' } });
    });

    it('weigert het annuleren van een verstreken inschrijving', async () => {
      prisma.member.findUnique.mockResolvedValue(monthlyMember);
      const past = new Date(Date.now() - 24 * 60 * 60 * 1000);
      prisma.playDayRegistration.findFirst.mockResolvedValue({ id: 'reg-1', scheduledDate: past });

      await expect(service.cancel('user-1', 'reg-1')).rejects.toThrow(BadRequestException);
    });
  });
});
```

- [ ] **Step 2: Run de tests om te bevestigen dat ze falen**

Run: `cd backend && npx jest play-day-registrations.service -v`
Expected: FAIL — huidige stub-service heeft geen `register`/`cancel`/`getMyRegistrations` methods met deze signatuur (compile-/runtime-fouten).

- [ ] **Step 3: Implementeer**

Replace the entire content of `backend/src/play-days/play-day-registrations.service.ts`:

```ts
import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Member, MembershipPlan, MembershipStatus, PaymentStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { validateSessionSlot } from '../common/validate-session-date';
import { getCalendarWeekRange } from '../common/calendar-week';

const PLAY_DAY_WEEKDAYS = [2, 4]; // dinsdag, donderdag
const WEEKLY_LIMIT_PLANS: MembershipPlan[] = [
  MembershipPlan.MONTHLY,
  MembershipPlan.YEARLY,
  MembershipPlan.YEARLY_UPFRONT,
];
const ELIGIBLE_PLANS: MembershipPlan[] = [...WEEKLY_LIMIT_PLANS, MembershipPlan.PER_SESSION];

@Injectable()
export class PlayDayRegistrationsService {
  constructor(private readonly prisma: PrismaService) {}

  private async findEligibleMember(userId: string): Promise<Member> {
    const member = await this.prisma.member.findUnique({ where: { userId } });
    if (!member) {
      throw new NotFoundException('Member not found for this user');
    }
    if (!ELIGIBLE_PLANS.includes(member.membershipPlan)) {
      throw new ForbiddenException('Dit abonnement kan hier niet inschrijven op een speeldatum');
    }
    if (member.membershipStatus !== MembershipStatus.ACTIVE) {
      throw new ForbiddenException('Je lidmaatschap is niet actief');
    }
    return member;
  }

  async getMyRegistrations(userId: string) {
    const member = await this.findEligibleMember(userId);
    return this.prisma.playDayRegistration.findMany({
      where: { memberId: member.id },
      orderBy: { scheduledDate: 'asc' },
    });
  }

  async register(userId: string, dateStr: string) {
    const member = await this.findEligibleMember(userId);
    const date = validateSessionSlot({
      dateStr,
      allowedWeekdays: PLAY_DAY_WEEKDAYS,
    });

    const existing = await this.prisma.playDayRegistration.findFirst({
      where: { memberId: member.id, scheduledDate: date },
    });
    if (existing) {
      throw new ConflictException('Deze datum is al geboekt');
    }

    if (WEEKLY_LIMIT_PLANS.includes(member.membershipPlan)) {
      const { start, end } = getCalendarWeekRange(date);
      const existingThisWeek = await this.prisma.playDayRegistration.findFirst({
        where: { memberId: member.id, scheduledDate: { gte: start, lte: end } },
      });
      if (existingThisWeek) {
        throw new ConflictException('Je hebt al een speeldatum gekozen deze week');
      }
    }

    const paymentStatus =
      member.membershipPlan === MembershipPlan.PER_SESSION ? PaymentStatus.COMPLETED : PaymentStatus.PENDING;

    const registration = await this.prisma.playDayRegistration.create({
      data: {
        memberId: member.id,
        scheduledDate: date,
        membershipPlan: member.membershipPlan,
        paymentStatus,
      },
    });

    return { success: true, message: 'Ingeschreven voor speeldatum', registration };
  }

  async cancel(userId: string, registrationId: string) {
    const member = await this.findEligibleMember(userId);
    const registration = await this.prisma.playDayRegistration.findFirst({
      where: { id: registrationId, memberId: member.id },
    });

    if (!registration) {
      throw new NotFoundException('Inschrijving niet gevonden');
    }

    if (registration.scheduledDate.getTime() <= Date.now()) {
      throw new BadRequestException('Deze speeldatum is al verstreken');
    }

    await this.prisma.playDayRegistration.delete({ where: { id: registrationId } });
    return { success: true, message: 'Inschrijving geannuleerd' };
  }
}
```

- [ ] **Step 4: Run de tests om te bevestigen dat ze slagen**

Run: `cd backend && npx jest play-day-registrations.service -v`
Expected: PASS — alle 9 tests groen.

- [ ] **Step 5: Commit**

```bash
git add backend/src/play-days/play-day-registrations.service.ts backend/src/play-days/play-day-registrations.service.spec.ts
git commit -m "feat: implementeer PlayDayRegistrationsService met week- en planregels"
```

---

## Task 4: `PlayDayRegistrationsController` — echte routes

**Files:**
- Create: `backend/src/play-days/dto/register-play-day.dto.ts`
- Modify: `backend/src/play-days/play-day-registrations.controller.ts`

**Interfaces:**
- Consumes: `PlayDayRegistrationsService.getMyRegistrations/register/cancel` uit Task 3; `CurrentUser` decorator uit `backend/src/common/decorators/auth.decorators.ts` (bestaand); `JwtAuthGuard` uit `backend/src/common/guards/jwt-auth.guard.ts` (bestaand).
- Produces: routes `GET /play-days/my-registrations`, `POST /play-days/register` (body `{ scheduledDate: string }`), `DELETE /play-days/registrations/:id`. Gebruikt door Task 8 (`playDaysApi.ts`).

- [ ] **Step 1: Maak de DTO**

Create `backend/src/play-days/dto/register-play-day.dto.ts`:

```ts
import { IsDateString } from 'class-validator';

export class RegisterPlayDayDto {
  @IsDateString()
  scheduledDate!: string;
}
```

- [ ] **Step 2: Herschrijf de controller**

Replace the entire content of `backend/src/play-days/play-day-registrations.controller.ts`:

```ts
import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/auth.decorators';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RegisterPlayDayDto } from './dto/register-play-day.dto';
import { PlayDayRegistrationsService } from './play-day-registrations.service';

@ApiTags('Play Days')
@Controller('play-days')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PlayDayRegistrationsController {
  constructor(private readonly playDayRegistrationsService: PlayDayRegistrationsService) {}

  @Get('my-registrations')
  @ApiOperation({ summary: 'Get the authenticated member play day registrations' })
  findAll(@CurrentUser() user: any) {
    return this.playDayRegistrationsService.getMyRegistrations(user.userId || user.id);
  }

  @Post('register')
  @ApiOperation({ summary: 'Register for a play day (dinsdag/donderdag)' })
  create(@CurrentUser() user: any, @Body() dto: RegisterPlayDayDto) {
    return this.playDayRegistrationsService.register(user.userId || user.id, dto.scheduledDate);
  }

  @Delete('registrations/:id')
  @ApiOperation({ summary: 'Cancel an upcoming play day registration' })
  remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.playDayRegistrationsService.cancel(user.userId || user.id, id);
  }
}
```

(De oude `GET :id`-route verdwijnt — die werd nergens aangeroepen en zat niet in de dode frontend-scaffold.)

- [ ] **Step 3: Build om compilatiefouten te vangen**

Run: `cd backend && npx tsc --noEmit -p tsconfig.build.json`
Expected: geen output / exit code 0.

- [ ] **Step 4: Handmatige rooktest**

Run: `cd backend && npm run start:dev` (in een aparte terminal, laat draaien), en in een tweede terminal:

```bash
curl -s -X POST http://localhost:3000/auth/login -H "Content-Type: application/json" \
  -d '{"email":"maandabonnement@almerepickleball.nl","password":"Test1234!"}'
```

Expected: JSON met een `accessToken`. Kopieer die, en test met een aankomende dinsdag-datum (`YYYY-MM-DD`):

```bash
curl -s -X POST http://localhost:3000/play-days/register \
  -H "Authorization: Bearer <accessToken>" -H "Content-Type: application/json" \
  -d '{"scheduledDate":"<eerstvolgende-dinsdag>"}'
```

Expected: `{"success":true,"message":"Ingeschreven voor speeldatum","registration":{...}}`. Stop de dev-server na deze check (Ctrl+C).

- [ ] **Step 5: Commit**

```bash
git add backend/src/play-days/dto/register-play-day.dto.ts backend/src/play-days/play-day-registrations.controller.ts
git commit -m "feat: implementeer echte play-days-routes (register/cancel/my-registrations)"
```

---

## Task 5: Admin-aggregatie-endpoint op `MembersController`

**Files:**
- Modify: `backend/src/members/members.controller.ts`

**Interfaces:**
- Consumes: `PrismaService` (bestaand, al geïnjecteerd in deze controller); modellen `TrialLesson`, `PunchCardSession`, `PlayDayRegistration` (uit Task 1).
- Produces: `GET /members/play-days/registrations?date=YYYY-MM-DD` → `{ registrations: Array<{ id, registeredAt, paymentCompleted, member: { firstName, lastName, duprRating, dateOfBirth, membershipPlan, punchCardRemaining } }>, summary: { byDupr, byAge } }`. Dit is de vorm die `frontend/src/components/PlayDaysAdminPanel.tsx` al verwacht (ongewijzigd in dit task, zie Task 11 voor de label-fix).

- [ ] **Step 1: Voeg `Query` toe aan de imports**

In `backend/src/members/members.controller.ts`, regel 1, wijzig:

```ts
import { BadRequestException, Controller, Get, Put, Body, UseGuards, Request, Patch, Param, Delete } from '@nestjs/common';
```

naar:

```ts
import { BadRequestException, Controller, Get, Put, Body, UseGuards, Request, Patch, Param, Delete, Query } from '@nestjs/common';
```

- [ ] **Step 2: Voeg de nieuwe route toe**

Voeg, direct ná de bestaande `getDashboard`-method (na de sluitende `}` van `@Get('dashboard') async getDashboard(...) { ... }`), toe:

```ts

  @Get('play-days/registrations')
  @ApiBearerAuth()
  async getPlayDayRegistrationsForDate(@Query('date') date?: string) {
    if (!date) {
      return { registrations: [], summary: null };
    }

    const dayStart = new Date(`${date}T00:00:00`);
    const dayEnd = new Date(`${date}T23:59:59.999`);

    const [trialLessons, punchCardSessions, playDayRegistrations] = await Promise.all([
      this.prisma.trialLesson.findMany({
        where: { scheduledDate: { gte: dayStart, lte: dayEnd } },
        include: { member: true },
      }),
      this.prisma.punchCardSession.findMany({
        where: { scheduledDate: { gte: dayStart, lte: dayEnd } },
        include: { member: true },
      }),
      this.prisma.playDayRegistration.findMany({
        where: { scheduledDate: { gte: dayStart, lte: dayEnd } },
        include: { member: true },
      }),
    ]);

    const registrations = [
      ...trialLessons.map((lesson) => ({
        id: lesson.id,
        registeredAt: lesson.createdAt,
        paymentCompleted: false,
        member: { ...lesson.member, membershipPlan: 'TRIAL' },
      })),
      ...punchCardSessions.map((session) => ({
        id: session.id,
        registeredAt: session.createdAt,
        paymentCompleted: true,
        member: session.member,
      })),
      ...playDayRegistrations.map((registration) => ({
        id: registration.id,
        registeredAt: registration.createdAt,
        paymentCompleted: registration.paymentStatus === 'COMPLETED',
        member: { ...registration.member, membershipPlan: registration.membershipPlan },
      })),
    ];

    const byDupr = { '<=3.0': 0, '3.5-4.0': 0, '>4.0': 0 };
    const byAge = { '<18': 0, '18-35': 0, '36-50': 0, '51+': 0 };
    const now = Date.now();

    for (const reg of registrations) {
      const rating = reg.member.duprRating ?? 0;
      if (rating <= 3.0) byDupr['<=3.0'] += 1;
      else if (rating <= 4.0) byDupr['3.5-4.0'] += 1;
      else byDupr['>4.0'] += 1;

      const dob = reg.member.dateOfBirth ? new Date(reg.member.dateOfBirth) : null;
      if (!dob) continue;
      const age = Math.floor((now - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
      if (age < 18) byAge['<18'] += 1;
      else if (age <= 35) byAge['18-35'] += 1;
      else if (age <= 50) byAge['36-50'] += 1;
      else byAge['51+'] += 1;
    }

    return { registrations, summary: { byDupr, byAge } };
  }
```

- [ ] **Step 3: Build om compilatiefouten te vangen**

Run: `cd backend && npx tsc --noEmit -p tsconfig.build.json`
Expected: geen output / exit code 0.

- [ ] **Step 4: Handmatige rooktest**

Met de dev-server draaiend (`npm run start:dev`) en een geldig admin-token (login met `admin@almerepickleball.nl` / `Admin1234!`):

```bash
curl -s "http://localhost:3000/members/play-days/registrations?date=<datum-met-de-registratie-uit-Task-4>" \
  -H "Authorization: Bearer <adminAccessToken>"
```

Expected: JSON met `registrations` array die de zojuist aangemaakte Maandabonnement-inschrijving bevat, plus een `summary`-object.

- [ ] **Step 5: Commit**

```bash
git add backend/src/members/members.controller.ts
git commit -m "feat: implementeer admin-overzicht speeldatum-registraties (alle abonnementen)"
```

---

## Task 6: Testaccount voor Per-sessie in het seed-script

**Files:**
- Modify: `backend/prisma/seed-accounts.ts`

**Interfaces:**
- Produces: testaccount `per-sessie@almerepickleball.nl` / `Test1234!`, plan `PER_SESSION`, status `ACTIVE`. Gebruikt bij de handmatige verificatie in Task 10.

- [ ] **Step 1: Voeg het account toe**

In `backend/prisma/seed-accounts.ts`, voeg vóór het `admin@almerepickleball.nl`-object in de `ACCOUNTS`-array toe:

```ts
  {
    email: 'per-sessie@almerepickleball.nl',
    password: 'Test1234!',
    firstName: 'Per-sessie',
    lastName: 'Testaccount',
    role: 'MEMBER',
    accountType: 'MEMBER',
    membershipPlan: 'PER_SESSION',
    membershipStatus: 'ACTIVE',
  },
```

- [ ] **Step 2: Run het seed-script**

Run: `cd backend && npm run seed:accounts`
Expected: output bevat `✅ per-sessie@almerepickleball.nl (MEMBER / PER_SESSION)`.

- [ ] **Step 3: Commit**

```bash
git add backend/prisma/seed-accounts.ts
git commit -m "test: voeg Per-sessie testaccount toe aan seed-accounts"
```

---

## Task 7: `playDaysApi.ts` — hernoem naar `scheduledDate`

**Files:**
- Modify: `frontend/src/lib/playDaysApi.ts`

**Interfaces:**
- Consumes: routes uit Task 4.
- Produces: `playDaysAPI.getMyRegistrations(): Promise<Array<{ id: string; scheduledDate: string; paymentStatus: string }>>`, `playDaysAPI.register(scheduledDate: string): Promise<any>`, `playDaysAPI.cancelRegistration(registrationId: string): Promise<any>`. Gebruikt door Task 8 en Task 9.

- [ ] **Step 1: Herschrijf het bestand**

Replace the entire content of `frontend/src/lib/playDaysApi.ts`:

```ts
import api from './api';

export const playDaysAPI = {
  getMyRegistrations: async () => {
    const res = await api.get('/play-days/my-registrations');
    return res.data;
  },
  register: async (scheduledDate: string) => {
    const res = await api.post('/play-days/register', { scheduledDate });
    return res.data;
  },
  cancelRegistration: async (registrationId: string) => {
    const res = await api.delete(`/play-days/registrations/${registrationId}`);
    return res.data;
  },
};
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/lib/playDaysApi.ts
git commit -m "refactor: hernoem playDate naar scheduledDate in playDaysApi"
```

---

## Task 8: `PlayDayPaymentModal.tsx` — herwerk voor nieuwe inschrijvingen

**Files:**
- Modify: `frontend/src/components/PlayDayPaymentModal.tsx`

**Interfaces:**
- Consumes: niets rechtstreeks (roept de meegegeven `onConfirm`-callback aan; geen directe API-call meer).
- Produces: `<PlayDayPaymentModal isOpen: boolean, scheduledDate: string | null, onClose: () => void, onConfirm: () => Promise<void>>`. Gebruikt door Task 9 (`PlayDayCalendar`).

- [ ] **Step 1: Herschrijf het bestand**

Replace the entire content of `frontend/src/components/PlayDayPaymentModal.tsx`:

```tsx
import { useState } from 'react';
import Modal from './Modal';

interface PlayDayPaymentModalProps {
  isOpen: boolean;
  scheduledDate: string | null;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export default function PlayDayPaymentModal({
  isOpen,
  scheduledDate,
  onClose,
  onConfirm,
}: PlayDayPaymentModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePayment = async () => {
    setLoading(true);
    setError('');
    try {
      await onConfirm();
    } catch (err: any) {
      const message = err.response?.data?.message || 'Betaling mislukt. Probeer het opnieuw.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (!scheduledDate) return null;

  const formattedDate = new Date(`${scheduledDate}T00:00:00`).toLocaleDateString('nl-NL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <Modal open={isOpen} title="💳 Betaling speeldag" onClose={onClose} size="sm">
      <div className="flex flex-col gap-4">
        <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg p-4 border-2 border-primary-200">
          <p className="text-sm text-gray-600 mb-1">Speeldag:</p>
          <p className="text-lg font-bold text-primary-900 capitalize">{formattedDate}</p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-2">Bedrag:</p>
          <p className="text-3xl font-bold text-gray-900">€8,50</p>
          <p className="text-xs text-gray-500 mt-1">Eenmalige betaling voor deze speeldag</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
            <p className="font-semibold text-sm">{error}</p>
          </div>
        )}

        <div className="flex gap-3 pt-4 border-t">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold transition-colors"
            disabled={loading}
          >
            Annuleren
          </button>
          <button
            type="button"
            onClick={handlePayment}
            className="flex-1 px-4 py-3 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-semibold transition-colors disabled:opacity-50"
            disabled={loading}
          >
            {loading ? '⏳ Verwerking...' : '✓ Betalen'}
          </button>
        </div>

        <p className="text-xs text-gray-500 text-center">
          💡 Bij succesvolle betaling ben je ingeschreven voor deze speeldag
        </p>
      </div>
    </Modal>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/components/PlayDayPaymentModal.tsx
git commit -m "refactor: PlayDayPaymentModal neemt nu een datum + confirm-callback i.p.v. een bestaande registratie"
```

---

## Task 9: `PlayDayCalendar` — gedeelde kalendercomponent

**Files:**
- Create: `frontend/src/components/PlayDayCalendar.tsx`

**Interfaces:**
- Consumes: `playDaysAPI` uit Task 7; `PlayDayPaymentModal` uit Task 8.
- Produces: `<PlayDayCalendar mode: 'single-per-week' | 'unlimited'>`. Gebruikt door Task 10 (Monthly/Yearly) en Task 11 (nieuwe PerSessionDashboard).

- [ ] **Step 1: Maak het bestand**

Create `frontend/src/components/PlayDayCalendar.tsx`:

```tsx
import { useEffect, useState } from 'react';
import { playDaysAPI } from '../lib/playDaysApi';
import PlayDayPaymentModal from './PlayDayPaymentModal';

type PlayDayCalendarMode = 'single-per-week' | 'unlimited';

type Registration = {
  id: string;
  scheduledDate: string;
};

type Props = {
  mode: PlayDayCalendarMode;
};

const WEEKS_AHEAD = 12;

function toLocalDateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function formatDayLabel(dateStr: string) {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString('nl-NL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

function getMondayOfCurrentWeek(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const day = today.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  today.setDate(today.getDate() + diffToMonday);
  return today;
}

function buildWeeks(): { tuesday: string; thursday: string }[] {
  const monday = getMondayOfCurrentWeek();
  const weeks: { tuesday: string; thursday: string }[] = [];

  for (let i = 0; i < WEEKS_AHEAD; i++) {
    const weekMonday = new Date(monday);
    weekMonday.setDate(monday.getDate() + i * 7);

    const tuesday = new Date(weekMonday);
    tuesday.setDate(weekMonday.getDate() + 1);

    const thursday = new Date(weekMonday);
    thursday.setDate(weekMonday.getDate() + 3);

    weeks.push({ tuesday: toLocalDateStr(tuesday), thursday: toLocalDateStr(thursday) });
  }

  return weeks;
}

export default function PlayDayCalendar({ mode }: Props) {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pendingDate, setPendingDate] = useState<string | null>(null);

  const weeks = buildWeeks();

  const fetchRegistrations = async () => {
    try {
      const data = await playDaysAPI.getMyRegistrations();
      setRegistrations(data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Kon inschrijvingen niet ophalen');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const findRegistration = (dateStr: string) =>
    registrations.find((r) => toLocalDateStr(new Date(r.scheduledDate)) === dateStr);

  const isPast = (dateStr: string) => new Date(`${dateStr}T00:00:00`).getTime() <= Date.now();

  const register = async (dateStr: string) => {
    try {
      await playDaysAPI.register(dateStr);
      await fetchRegistrations();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Er is een fout opgetreden bij het inschrijven');
    }
  };

  const cancelAndMaybeRegister = async (existingId: string, newDateStr?: string) => {
    try {
      await playDaysAPI.cancelRegistration(existingId);
      if (newDateStr) {
        await playDaysAPI.register(newDateStr);
      }
      await fetchRegistrations();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Er is een fout opgetreden');
    }
  };

  const handleDayClick = (dateStr: string, weekRegistration: Registration | undefined) => {
    if (isPast(dateStr)) return;
    const ownRegistration = findRegistration(dateStr);

    if (ownRegistration) {
      if (confirm('Weet je zeker dat je deze speeldatum wilt annuleren?')) {
        cancelAndMaybeRegister(ownRegistration.id);
      }
      return;
    }

    if (mode === 'single-per-week' && weekRegistration) {
      const confirmed = confirm(
        `Je bent al ingeschreven voor ${formatDayLabel(weekRegistration.scheduledDate)} deze week. Wil je wisselen naar ${formatDayLabel(dateStr)}?`
      );
      if (confirmed) {
        cancelAndMaybeRegister(weekRegistration.id, dateStr);
      }
      return;
    }

    if (mode === 'unlimited') {
      setPendingDate(dateStr);
      return;
    }

    register(dateStr);
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Speeldatums laden...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow p-8">
      <h2 className="text-xl font-bold text-gray-900 mb-2">Speeldatums</h2>
      <p className="text-sm text-gray-600 mb-6">
        {mode === 'single-per-week'
          ? 'Kies elke week één speeldatum: dinsdag of donderdag.'
          : 'Schrijf je in voor zoveel speeldatums als je wilt, per keer €8,50.'}
      </p>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      <div className="space-y-3">
        {weeks.map((week, i) => {
          const tuesdayReg = findRegistration(week.tuesday);
          const thursdayReg = findRegistration(week.thursday);
          const weekRegistration = tuesdayReg || thursdayReg;

          return (
            <div key={i} className="grid grid-cols-2 gap-3">
              {[
                { dateStr: week.tuesday, registration: tuesdayReg },
                { dateStr: week.thursday, registration: thursdayReg },
              ].map(({ dateStr, registration }) => {
                const past = isPast(dateStr);
                const isRegistered = Boolean(registration);

                return (
                  <button
                    key={dateStr}
                    type="button"
                    disabled={past}
                    onClick={() => handleDayClick(dateStr, weekRegistration)}
                    className={`rounded-lg p-3 text-left border-2 transition-colors ${
                      past
                        ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                        : isRegistered
                        ? 'bg-green-50 border-green-500 text-green-900'
                        : 'bg-white border-gray-200 hover:border-primary-400 text-gray-700'
                    }`}
                  >
                    <div className="text-sm font-semibold capitalize">{formatDayLabel(dateStr)}</div>
                    <div className="text-xs mt-1">
                      {past ? 'Verstreken' : isRegistered ? '✓ Ingepland — annuleren' : 'Inschrijven'}
                    </div>
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>

      {mode === 'unlimited' && (
        <PlayDayPaymentModal
          isOpen={pendingDate !== null}
          scheduledDate={pendingDate}
          onClose={() => setPendingDate(null)}
          onConfirm={async () => {
            if (!pendingDate) return;
            await register(pendingDate);
            setPendingDate(null);
          }}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/components/PlayDayCalendar.tsx
git commit -m "feat: voeg gedeelde PlayDayCalendar-component toe"
```

---

## Task 10: Integreer `PlayDayCalendar` in Maand- en Jaarabonnement-dashboards

**Files:**
- Modify: `frontend/src/pages/MonthlyDashboard.tsx`
- Modify: `frontend/src/pages/YearlyDashboard.tsx`

**Interfaces:**
- Consumes: `PlayDayCalendar` uit Task 9.

- [ ] **Step 1: MonthlyDashboard — voeg de import toe**

In `frontend/src/pages/MonthlyDashboard.tsx`, regel 6, wijzig:

```tsx
import Modal from '../components/Modal';
```

naar:

```tsx
import Modal from '../components/Modal';
import PlayDayCalendar from '../components/PlayDayCalendar';
```

- [ ] **Step 2: MonthlyDashboard — voeg de component toe**

In hetzelfde bestand, zoek:

```tsx
          <div className="mt-6 bg-primary-50 border border-primary-200 rounded-lg p-4">
            <p className="text-sm text-primary-900">
              💡 Bij een jaarabonnement profiteer je van <strong>{discountPercentage}% korting</strong> ten
              opzichte van maandelijks betalen.{' '}
              <button onClick={() => navigate('/word-lid')} className="underline font-semibold">
                Bekijk jaarabonnement
              </button>
            </p>
          </div>
        </div>
      </div>

      {isPaymentOutstanding && (
```

Vervang door:

```tsx
          <div className="mt-6 bg-primary-50 border border-primary-200 rounded-lg p-4">
            <p className="text-sm text-primary-900">
              💡 Bij een jaarabonnement profiteer je van <strong>{discountPercentage}% korting</strong> ten
              opzichte van maandelijks betalen.{' '}
              <button onClick={() => navigate('/word-lid')} className="underline font-semibold">
                Bekijk jaarabonnement
              </button>
            </p>
          </div>
        </div>

        <PlayDayCalendar mode="single-per-week" />
      </div>

      {isPaymentOutstanding && (
```

- [ ] **Step 3: YearlyDashboard — voeg de import toe**

In `frontend/src/pages/YearlyDashboard.tsx`, regel 6, wijzig:

```tsx
import Modal from '../components/Modal';
```

naar:

```tsx
import Modal from '../components/Modal';
import PlayDayCalendar from '../components/PlayDayCalendar';
```

- [ ] **Step 4: YearlyDashboard — voeg de component toe**

In hetzelfde bestand, zoek:

```tsx
          <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
            <p className="text-sm text-primary-900">
              ✨ Je jaarabonnement geeft je <strong>{discountPercentage}% korting</strong> ten opzichte van
              maandelijks betalen (€{yearlyMonthlyInstallmentPrice.toFixed(2).replace('.', ',')}/maand i.p.v.
              €15,75/maand).
            </p>
          </div>
        </div>
      </div>

      {showPaymentReminder && (
```

Vervang door:

```tsx
          <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
            <p className="text-sm text-primary-900">
              ✨ Je jaarabonnement geeft je <strong>{discountPercentage}% korting</strong> ten opzichte van
              maandelijks betalen (€{yearlyMonthlyInstallmentPrice.toFixed(2).replace('.', ',')}/maand i.p.v.
              €15,75/maand).
            </p>
          </div>
        </div>

        <PlayDayCalendar mode="single-per-week" />
      </div>

      {showPaymentReminder && (
```

- [ ] **Step 5: Handmatige verificatie in de browser**

Run: `cd backend && npm run start:dev` (aparte terminal) en `cd frontend && npm run dev` (aparte terminal).

Log in als `maandabonnement@almerepickleball.nl` / `Test1234!` op `http://localhost:5173/login`. Navigeer naar het dashboard (moet automatisch naar `/monthly-dashboard`).

Verwacht: onder de abonnementsgegevens verschijnt een "Speeldatums"-kaart met 12 weken, elk met een dinsdag- en donderdagknop. Klik op een aankomende dinsdag → knop wordt groen ("✓ Ingepland — annuleren"). Klik op de donderdag van diezelfde week → bevestigingsdialoog over wisselen; bevestig → dinsdag wordt weer leeg, donderdag wordt groen. Klik nogmaals op de groene donderdag → bevestig annuleren → wordt weer leeg.

Herhaal kort met `jaarabonnement@almerepickleball.nl` / `Test1234!` op `/yearly-dashboard` — zelfde gedrag.

Stop beide dev-servers na de check.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/pages/MonthlyDashboard.tsx frontend/src/pages/YearlyDashboard.tsx
git commit -m "feat: toon speeldatum-kalender op Maand- en Jaarabonnement-dashboards"
```

---

## Task 11: Nieuw `PerSessionDashboard` + routing

**Files:**
- Create: `frontend/src/pages/PerSessionDashboard.tsx`
- Modify: `frontend/src/pages/Dashboard.tsx`
- Modify: `frontend/src/App.tsx`

**Interfaces:**
- Consumes: `PlayDayCalendar` uit Task 9; `useAuthStore` (bestaand, `frontend/src/stores/authStore.ts`).
- Produces: route `/per-session-dashboard`, bereikbaar via `Dashboard.tsx`'s redirect voor `membershipPlan === 'PER_SESSION'`.

- [ ] **Step 1: Maak de nieuwe pagina**

Create `frontend/src/pages/PerSessionDashboard.tsx`:

```tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import PlayDayCalendar from '../components/PlayDayCalendar';

export default function PerSessionDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (user.member?.membershipPlan !== 'PER_SESSION') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  if (!user || user.member?.membershipPlan !== 'PER_SESSION') {
    return null;
  }

  const firstName = user?.member?.firstName || 'lid';
  const handleBackToHome = () => navigate('/');

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-r from-primary-700 to-primary-500 text-white rounded-lg shadow-lg p-8 mb-8">
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={handleBackToHome}
              className="text-primary-100 hover:text-white text-sm font-semibold underline"
            >
              ← Terug naar home
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => navigate('/account')}
                className="inline-flex items-center rounded-full border border-white/30 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
              >
                👤 Mijn account
              </button>
              <button
                type="button"
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="inline-flex items-center rounded-full border border-white/30 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
              >
                Uitloggen
              </button>
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-2">💳 Mijn Per-sessie</h1>
          <p className="text-primary-100">Welkom, {firstName}!</p>
        </div>

        <PlayDayCalendar mode="unlimited" />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Dashboard.tsx — voeg de redirect toe**

In `frontend/src/pages/Dashboard.tsx`, zoek:

```tsx
  if (membershipPlan === 'YEARLY' || membershipPlan === 'YEARLY_UPFRONT') {
    return <Navigate to="/yearly-dashboard" replace />;
  }
```

Vervang door:

```tsx
  if (membershipPlan === 'YEARLY' || membershipPlan === 'YEARLY_UPFRONT') {
    return <Navigate to="/yearly-dashboard" replace />;
  }

  if (membershipPlan === 'PER_SESSION') {
    return <Navigate to="/per-session-dashboard" replace />;
  }
```

(De `accountType === 'TRIAL'`-check staat al hoger in dit bestand en wordt eerder geraakt, dus Proefles-accounts — die ook `membershipPlan: 'PER_SESSION'` als default hebben — komen nooit bij deze nieuwe branch.)

- [ ] **Step 3: App.tsx — voeg import en route toe**

In `frontend/src/App.tsx`, regel 14, wijzig:

```tsx
import YearlyDashboard from './pages/YearlyDashboard';
```

naar:

```tsx
import YearlyDashboard from './pages/YearlyDashboard';
import PerSessionDashboard from './pages/PerSessionDashboard';
```

Zoek vervolgens:

```tsx
            <Route
              path="/yearly-dashboard"
              element={
                <ProtectedRoute>
                  <YearlyDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/account"
```

Vervang door:

```tsx
            <Route
              path="/yearly-dashboard"
              element={
                <ProtectedRoute>
                  <YearlyDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/per-session-dashboard"
              element={
                <ProtectedRoute>
                  <PerSessionDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/account"
```

- [ ] **Step 4: Build om compilatiefouten te vangen**

Run: `cd frontend && npx tsc --noEmit`
Expected: geen output / exit code 0.

- [ ] **Step 5: Handmatige verificatie in de browser**

Met backend en frontend dev-servers draaiend, log in als `per-sessie@almerepickleball.nl` / `Test1234!` (het testaccount uit Task 6).

Verwacht: automatische redirect naar `/per-session-dashboard`, met header "💳 Mijn Per-sessie" en de "Speeldatums"-kaart (onbeperkte modus). Klik op een aankomende dinsdag → betaalmodal "💳 Betaling speeldag" met €8,50 verschijnt. Klik "✓ Betalen" → modal sluit, dinsdag wordt groen. Klik ook op de donderdag van diezelfde week → moet gewoon lukken (geen weeklimiet-fout), toont eveneens de betaalmodal.

Stop beide dev-servers na de check.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/pages/PerSessionDashboard.tsx frontend/src/pages/Dashboard.tsx frontend/src/App.tsx
git commit -m "feat: nieuw Per-sessie-dashboard met speeldatum-inschrijving"
```

---

## Task 12: Admin-paneel — label/kleur voor Proefles-registraties

**Files:**
- Modify: `frontend/src/components/PlayDaysAdminPanel.tsx`

**Interfaces:**
- Consumes: response-vorm uit Task 5 (`member.membershipPlan` kan nu ook de synthetische waarde `'TRIAL'` bevatten).

- [ ] **Step 1: Voeg het `TRIAL`-label toe**

In `frontend/src/components/PlayDaysAdminPanel.tsx`, zoek:

```tsx
  const getAboLabel = (plan: string) => {
    const labels: any = {
      YEARLY: '📅 Jaar',
      YEARLY_UPFRONT: '📅 Jaar (vooruit)',
      MONTHLY: '📅 Maand',
      PUNCH_CARD: '🎫 Strips',
      PER_SESSION: '💳 Per keer'
    };
    return labels[plan] || plan;
  };

  const getAboColor = (plan: string) => {
    const colors: any = {
      YEARLY: 'bg-blue-50 border-blue-200 text-blue-900',
      YEARLY_UPFRONT: 'bg-blue-100 border-blue-300 text-blue-900',
      MONTHLY: 'bg-indigo-50 border-indigo-200 text-indigo-900',
      PUNCH_CARD: 'bg-amber-50 border-amber-200 text-amber-900',
      PER_SESSION: 'bg-rose-50 border-rose-200 text-rose-900'
    };
    return colors[plan] || 'bg-gray-50 border-gray-200 text-gray-900';
  };
```

Vervang door:

```tsx
  const getAboLabel = (plan: string) => {
    const labels: any = {
      YEARLY: '📅 Jaar',
      YEARLY_UPFRONT: '📅 Jaar (vooruit)',
      MONTHLY: '📅 Maand',
      PUNCH_CARD: '🎫 Strips',
      PER_SESSION: '💳 Per keer',
      TRIAL: '🎓 Proefles'
    };
    return labels[plan] || plan;
  };

  const getAboColor = (plan: string) => {
    const colors: any = {
      YEARLY: 'bg-blue-50 border-blue-200 text-blue-900',
      YEARLY_UPFRONT: 'bg-blue-100 border-blue-300 text-blue-900',
      MONTHLY: 'bg-indigo-50 border-indigo-200 text-indigo-900',
      PUNCH_CARD: 'bg-amber-50 border-amber-200 text-amber-900',
      PER_SESSION: 'bg-rose-50 border-rose-200 text-rose-900',
      TRIAL: 'bg-emerald-50 border-emerald-200 text-emerald-900'
    };
    return colors[plan] || 'bg-gray-50 border-gray-200 text-gray-900';
  };
```

- [ ] **Step 2: Handmatige verificatie in de browser**

Met beide dev-servers draaiend: zorg dat er op één datum minstens een Proefles-inschrijving (via `/trial-dashboard`, testaccount `proefles@almerepickleball.nl`) én een Maandabonnement-inschrijving (uit Task 10) bestaan. Log in als `admin@almerepickleball.nl` / `Admin1234!`, ga naar `/members`, en bekijk het paneel "📋 Inschrijvingen Speeldagen" voor die datum.

Verwacht: de Proefles-rij toont "🎓 Proefles" (groen kaartje), niet "💳 Per keer"; de Maandabonnement-rij toont "📅 Maand".

Stop beide dev-servers na de check.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/PlayDaysAdminPanel.tsx
git commit -m "fix: toon Proefles-inschrijvingen met eigen label i.p.v. Per-sessie-label"
```

---

## Self-Review

**Spec coverage:**
- Datamodel (versimpelde `PlayDayRegistration`) → Task 1. ✅
- Backend-regels per abonnementsvorm (weeklimiet Maand/Jaar, onbeperkt+betaling Per-sessie, plan-/statusguard, di/do-validatie) → Task 3. ✅
- Backend-routes (`register`/`cancel`/`my-registrations`) → Task 4. ✅
- Admin-aggregatie-endpoint met correcte labeling → Task 5 + Task 12. ✅
- Zesde testaccount (Per-sessie) → Task 6. ✅
- Frontend `scheduledDate`-hernoeming → Task 7. ✅
- Directe betaalstap Per-sessie → Task 8 + Task 9 (`mode="unlimited"`). ✅
- Gedeelde kalendercomponent, 12 weken vooruit → Task 9. ✅
- Integratie Maand/Jaar-dashboards → Task 10. ✅
- Nieuw Per-sessie-dashboard + routing → Task 11. ✅
- Proefles/Strippenkaart ongewijzigd → geen enkele taak raakt `TrialDashboard.tsx`, `PunchCardDashboard.tsx`, `trial-lessons/`, `punch-card/`. ✅

**Placeholder scan:** geen "TBD"/"later toevoegen"-verwijzingen; elke stap bevat volledige, plakbare code of exacte commando's met verwacht resultaat.

**Type-/naamconsistentie:** `scheduledDate` wordt overal hetzelfde genoemd (Prisma-model, DTO, service, controller, `playDaysApi.ts`, `PlayDayCalendar`, `PlayDayPaymentModal`); `PlayDayRegistrationsService`-methodnamen (`getMyRegistrations`/`register`/`cancel`) komen exact overeen tussen Task 3 (implementatie + tests) en Task 4 (controller-aanroepen); `mode`-waarden (`'single-per-week'` / `'unlimited'`) zijn identiek in Task 9 (component) en Tasks 10–11 (gebruik).
