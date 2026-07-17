# Speeldatum-inschrijving voor alle abonnementsvormen

## Aanleiding

Van de vijf abonnementsvormen (Proefles, Strippenkaart, Maandabonnement, Jaarabonnement — twee betaalvarianten — en Per-sessie) kunnen momenteel alleen Proefles en Strippenkaart zich inschrijven op een speeldatum. Maandabonnement en Jaarabonnement tonen alleen abonnementsstatus; Per-sessie heeft zelfs geen eigen dashboard. Doel: elke abonnementsvorm kan zich inschrijven op elke speeldatum (dinsdag 19:30–21:00, Sporthal Haven / donderdag 18:30–20:00, Noordenplassen Kraaiennest), met de beperking die bij het eigen abonnement hoort.

## Beperkingen per abonnementsvorm

| Abonnement | Speeldagen | Beperking |
|---|---|---|
| Proefles (TRIAL) | dinsdag | binnen 21-dagen proefperiode — **ongewijzigd, bestaand** |
| Strippenkaart (PUNCH_CARD) | di/do | max 10 beurten, 6 maanden geldig — **ongewijzigd, bestaand** |
| Maandabonnement (MONTHLY) | di/do | max 1 speeldatum per kalenderweek (ma–zo) |
| Jaarabonnement (YEARLY / YEARLY_UPFRONT) | di/do | max 1 speeldatum per kalenderweek (ma–zo) |
| Per-sessie (PER_SESSION) | di/do | onbeperkt aantal; elke inschrijving vereist directe betaalbevestiging (€8,50) |

Geen van de abonnementen heeft een capaciteitslimiet per speeldatum (geen baan-/plekbeperking). Inschrijven vereist in alle gevallen `membershipStatus === 'ACTIVE'` en een datum in de toekomst.

## Datamodel

Het huidige `PlayDayRegistration`-model is een ongebruikte stub (gekoppeld aan `PlayDay`/`Court`, die zelf ook nergens in de backend worden gebruikt — het hele Match/Court/Tournament-cluster is dood/stub-code). Dit model wordt versimpeld naar een directe datum-tabel, naar het patroon van `PunchCardSession` en `TrialLesson`:

```prisma
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

- `membershipPlan` is een snapshot van het plan op moment van inschrijving (voor admin-weergave, ongeacht latere planwijzigingen).
- `paymentStatus`: voor MONTHLY/YEARLY/YEARLY_UPFRONT blijft dit ongebruikt/`PENDING` (betaling loopt via het bestaande abonnement, niet per speeldatum). Voor PER_SESSION wordt dit `COMPLETED` gezet zodra de lid de betaalstap bevestigt.
- De relatie naar `PlayDay`/`Court` vervalt. `PlayDay`, `Court`, `Match`, `MatchParticipation`, `Tournament` blijven ongewijzigd in het schema staan (niet in scope van deze feature).
- `Member.playDayRegistrations PlayDayRegistration[]` bestaat al in het schema en blijft ongewijzigd staan; deze verwijst straks naar de versimpelde tabel.

## Backend

Bestaande module `play-days` (`play-day-registrations.controller.ts` / `.service.ts`) wordt echt geïmplementeerd i.p.v. stub:

- `GET /play-days/my-registrations` — eigen registraties van ingelogd lid.
- `POST /play-days/register` — body `{ scheduledDate: string }`.
- `DELETE /play-days/registrations/:id` — annuleren, alleen voor toekomstige datums.

Validatielogica in de service:
1. Lid opzoeken via `userId`; moet `membershipStatus === 'ACTIVE'` zijn en plan ∈ {MONTHLY, YEARLY, YEARLY_UPFRONT, PER_SESSION} (Proefles/Strippenkaart blijven op hun eigen bestaande endpoints).
2. `validateSessionSlot` hergebruiken voor di/do-check en "datum in de toekomst".
3. Voor MONTHLY/YEARLY/YEARLY_UPFRONT: bereken de kalenderweek (ma–zo) van `scheduledDate`; zoek bestaande registratie van dit lid in dezelfde week; zo gevonden → `ConflictException` ("Je hebt al een speeldatum gekozen deze week"). Wisselen van dag binnen dezelfde week kan door eerst de bestaande registratie van die week te annuleren en daarna de nieuwe aan te maken (frontend doet dit als één actie, zie hieronder).
4. Voor PER_SESSION: geen weeklimiet; `paymentStatus` wordt bij aanmaken direct op `COMPLETED` gezet (bevestiging in de betaalmodal geldt als betaling, zoals ook elders in de applicatie betalingen handmatig/zelf-attesterend verlopen — er is geen echte betaal-gateway).
5. Annuleren: alleen toegestaan als `scheduledDate` nog in de toekomst ligt (zelfde regel als bestaande Trial/Strippenkaart-annulering).

## Admin-overzicht

`GET /members/play-days/registrations?date=YYYY-MM-DD` (al aangeroepen door de bestaande `PlayDaysAdminPanel`, nu 404/dood) wordt geïmplementeerd op de `members`-controller. Combineert voor de opgegeven datum:

- `TrialLesson` (label "Proefles")
- `PunchCardSession` (label "Strippenkaart")
- `PlayDayRegistration` (label volgens `membershipPlan`-snapshot: Maand/Jaar/Per-sessie)

tot één lijst met de vorm die `PlayDaysAdminPanel.tsx` al verwacht (`member`, `membershipPlan`, `paymentCompleted`, `registeredAt`). Elke rij wordt getagd op basis van de bron-tabel, niet op basis van het (mogelijk verouderde) `member.membershipPlan`-veld — dat veld staat bij Proefles-leden bijvoorbeeld altijd op `PER_SESSION`, wat een verkeerd label zou geven.

`PATCH /members/play-days/:id/payment-complete` (al aangeroepen door `PlayDayPaymentModal`) wordt geïmplementeerd: zet `paymentStatus` op `COMPLETED` voor de gegeven `PlayDayRegistration`-id.

## Frontend

**Nieuwe gedeelde component `PlayDayCalendar`** (bijv. `frontend/src/components/PlayDayCalendar.tsx`): toont de komende 12 weken, met per week een dinsdag- en donderdagknop. Props bepalen het gedrag:

- `mode="single-per-week"` (Monthly/Yearly): per week is precies 1 dag aan te vinken; de andere dag in dezelfde week is uitgeschakeld zolang er al een keuze is, tenzij je eerst de huidige keuze annuleert (klikken op de nieuwe dag annuleert automatisch de oude en registreert de nieuwe, in één gebruikersactie).
- `mode="unlimited"` (Per-sessie): beide dagen per week zijn onafhankelijk aan te vinken; aanvinken opent eerst `PlayDayPaymentModal` (bestaande component, hergebruikt ongewijzigd) en registreert pas na bevestiging.

Geannuleerde/toekomstige eigen registraties tonen een "Annuleren"-link, net als bij Strippenkaart.

**Integratie:**

- `MonthlyDashboard.tsx` en `YearlyDashboard.tsx`: `PlayDayCalendar` toegevoegd onder de bestaande statuskaart.
- **Nieuwe pagina `PerSessionDashboard.tsx`** (analoog aan de andere vier dashboards qua opbouw: header, terug-naar-home, account/uitloggen-knoppen), met `PlayDayCalendar` in `mode="unlimited"`.
- `Dashboard.tsx`: extra route-tak `membershipPlan === 'PER_SESSION' → navigate('/per-session-dashboard')`.
- Nieuwe route `/per-session-dashboard` toegevoegd aan de router, met dezelfde plan-guard (`membershipPlan !== 'PER_SESSION' → navigate('/dashboard')`) als de andere dashboards.

**Ongewijzigd:** `TrialDashboard.tsx`, `PunchCardDashboard.tsx` en hun backend-modules (`trial-lessons`, `punch-card`) — die voldoen al aan de eis.

## Niet in scope

- Geen wijzigingen aan `PlayDay`, `Court`, `Match`, `MatchParticipation`, `Tournament`-modellen of de bijbehorende (stub) modules — die blijven ongemoeid voor eventuele toekomstige functionaliteit.
- Geen capaciteitslimiet per speeldatum.
- Geen echte betaal-gateway-integratie — de betaalbevestiging bij Per-sessie is zelf-attesterend, consistent met de rest van de applicatie.
- Geen migratie van Proefles/Strippenkaart naar de nieuwe tabel.

## Testplan

- Backend: unit tests voor `PlayDayRegistrationsService` — weeklimiet-logica (grens van kalenderweek, wisselen van dag), plan-guards, datumvalidatie (di/do, toekomst), annuleren van verlopen datum geweigerd.
- Handmatig: elk van de vijf testaccounts (uit het seed-script) doorlopen het eigen dashboard en registreren/annuleren een speeldatum; admin-paneel tonen voor een datum met inschrijvingen uit meerdere abonnementsvormen tegelijk.
