<!-- Navigation: Use INDEX.md for complete documentation -->
[← Back to Index](INDEX.md) | [Database Setup](DATABASE_SETUP.md) | [Database Commands](DATABASE_COMMANDS.md) | [Setup Checklist](SETUP_CHECKLIST.md)

---

# 🗄️ Database Structure & Architecture

## 📚 Table of Contents
- [Entity Relationship Diagram](#entity-relationship-diagram)
- [Table Details](#table-details)
- [Database Constraints](#database-constraints)
- [Example Queries](#example-queries)
- [Backup & Recovery](#backup--recovery)

---

## 📊 Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     ALMERE PICKLEBALL DATABASE                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────┐
│      AUTHENTICATION      │
├──────────────────────────┤
│ users (9 cols)           │◄──────────┐
│  • id (PK)               │           │
│  • email (UQ)            │           │
│  • password              │           │
│  • role (ADMIN|ORG|MEM)  │           │
│  • isActive              │           │ 1:1
│  • emailVerified         │           │
│  • createdAt, updatedAt  │           │
│  • password_reset_tokens │           │
│  • refresh_tokens        │           │
└──────────────────────────┘           │
         │                             │
         │ 1:1                         │
         └─────────────────────────────┤
                                       │
                        ┌──────────────┴──────────────┐
                        │         MEMBERS             │
                        ├─────────────────────────────┤
                        │ members (20+ cols)          │
                        │  • id (PK)                  │
                        │  • userId (FK, UQ)◄────────┐
                        │  • firstName, lastName      │
                        │  • phone, dateOfBirth       │
                        │  • duprRating, duprId       │
                        │  • accountType              │
                        │    (MEMBER|TRIAL|EXPIRED)   │
                        │  • membershipStatus         │
                        │  • punchCardRemaining       │
                        │  • trialStartDate           │
                        │  • trialEndDate             │
                        │  • trialStatus              │
                        │  • createdAt, updatedAt     │
                        └─────────────┬────────────────┘
                                      │
                ┌─────────────────────┼─────────────────────┐
                │                     │                     │
           1:n  │                 1:n │                 1:n │
                │                     │                     │
    ┌───────────▼──────────┐ ┌────────▼──────────┐ ┌────────▼──────────────┐
    │   MEMBERSHIPS        │ │   PAYMENTS        │ │  PLAY DAY REGS        │
    ├──────────────────────┤ ├───────────────────┤ ├───────────────────────┤
    │ memberships (8 cols) │ │ payments (9 cols) │ │ play_day_registrations│
    │  • id (PK)           │ │  • id (PK)        │ │  • id (PK)            │
    │  • memberId (FK)     │ │  • memberId (FK)  │ │  • playDayId (FK)     │
    │  • plan              │ │  • membershipId   │ │  • memberId (FK)      │
    │    (PER_SESSION|     │ │  • amount         │ │  • status             │
    │     PUNCH_CARD|      │ │  • status         │ │  • createdAt          │
    │     MONTHLY|YEARLY)  │ │  • paymentMethod  │ │  • updatedAt          │
    │  • status            │ │  • transactionId  │ │  • (UQ: playDayId,    │
    │  • autoRenew         │ │  • createdAt      │ │     memberId)          │
    │  • startDate         │ │  • updatedAt      │ │                       │
    │  • endDate           │ │                   │ │                       │
    │  • createdAt         │ │                   │ │                       │
    │  • updatedAt         │ │                   │ │                       │
    └──────────────────────┘ └───────────────────┘ └─────────┬──────────────┘
                                                              │
                                                              │ 1:n
                                                              │
                                    ┌─────────────────────────▼─────────────────┐
                                    │      COURTS & PLAY MANAGEMENT             │
                                    └─────────────────────────────────────────┘
                                                    
    ┌──────────────────────┐         ┌──────────────────┐       ┌──────────────┐
    │    COURTS (5 cols)   │         │   PLAY DAYS      │       │   MATCHES    │
    ├──────────────────────┤ 1:n     │   (9 cols)       │ 1:n   │  (8 cols)    │
    │  • id (PK)           │◄────────│  • id (PK)       │◄──────│  • id (PK)   │
    │  • name (UQ)         │         │  • courtId (FK)  │       │  • playDayId │
    │  • location          │         │  • scheduled     │       │  • courtId   │
    │  • isActive          │         │    Date          │       │  • matchNo   │
    │  • createdAt         │         │  • startTime     │       │  • team1/2   │
    │  • updatedAt         │         │  • endTime       │       │    Score     │
    │                      │         │  • maxPlayers    │       │  • status    │
    └──────────────────────┘         │  • playerCount   │       │  • (UQ:      │
                                    │  • price         │       │    playDay,  │
                                    │  • status        │       │    matchNo)  │
                                    │  • description   │       │  • createdAt │
                                    │  • createdAt     │       │  • updatedAt │
                                    │  • updatedAt     │       └──────┬───────┘
                                    └──────────────────┘              │
                                                                      │ 1:n
                                                                      │
                            ┌─────────────────────────────────────────▼────────┐
                            │  MATCH PARTICIPATIONS (4 cols)                   │
                            ├────────────────────────────────────────────────┤
                            │  • id (PK)                                     │
                            │  • matchId (FK)                                │
                            │  • memberId (FK)                               │
                            │  • team (1 or 2)                               │
                            │  • (UQ: matchId, memberId)                     │
                            └────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                          TRIALS & TOURNAMENTS                               │
└─────────────────────────────────────────────────────────────────────────────┘

    ┌──────────────────────┐       ┌──────────────────────────┐
    │   TRIAL LESSONS      │       │    TOURNAMENTS (11 cols) │
    ├──────────────────────┤ 1:n   ├──────────────────────────┤
    │  • id (PK)           │◄──────│  • id (PK)               │
    │  • memberId (FK)     │       │  • name                  │
    │  • scheduledDate     │       │  • description           │
    │  • completed         │       │  • format (ROUND_ROBIN|  │
    │  • feedback          │       │    SINGLE_ELIM|etc)      │
    │  • createdAt         │       │  • status (DRAFT|        │
    │  • updatedAt         │       │    PUBLISHED|IN_PROGRESS)│
    │  • (idx: memberId,   │       │  • startDate, endDate    │
    │    scheduledDate)    │       │  • location              │
    │                      │       │  • maxParticipants       │
    │                      │       │  • entryFee              │
    │                      │       │  • createdBy (userId)    │
    │                      │       │  • createdAt, updatedAt  │
    └──────────────────────┘       └──────────┬───────────────┘
                                              │
                                          1:n │
                                              │
                        ┌─────────────────────┼─────────────────────┐
                        │                     │                     │
    ┌───────────────────▼──────────┐ ┌────────▼────────────────────┐
    │TOURNAMENT PARTICIPATIONS     │ │ TOURNAMENT MATCHES (8 cols) │
    ├──────────────────────────────┤ ├─────────────────────────────┤
    │  • id (PK)                   │ │  • id (PK)                  │
    │  • tournamentId (FK)         │ │  • tournamentId (FK)        │
    │  • memberId (FK)             │ │  • matchNumber              │
    │  • teamName                  │ │  • team1, team2             │
    │  • createdAt                 │ │  • team1/2 Score            │
    │  • (UQ: tournamentId,        │ │  • status                   │
    │    memberId)                 │ │  • createdAt, updatedAt     │
    │                              │ │  • (UQ: tournamentId,       │
    │                              │ │    matchNumber)             │
    └──────────────────────────────┘ └─────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                            CONTENT & NEWS                                   │
└─────────────────────────────────────────────────────────────────────────────┘

    ┌──────────────────────────────┐
    │   CLUB UPDATES (7 cols)      │
    ├──────────────────────────────┤
    │  • id (PK)                   │
    │  • title                     │
    │  • content                   │
    │  • category                  │
    │  • imageUrl                  │
    │  • published                 │
    │  • createdAt, updatedAt      │
    └──────────────────────────────┘
```

## 📋 Table Statistics

| Table | Columns | Purpose | Notes |
|-------|---------|---------|-------|
| `users` | 9 | Authentication | Email is unique |
| `password_reset_tokens` | 4 | Password recovery | Links to users |
| `refresh_tokens` | 4 | JWT management | Links to users |
| `members` | 20+ | Member profiles | Includes trial support |
| `memberships` | 8 | Membership plans | Supports auto-renewal |
| `payments` | 9 | Payment tracking | Multi-method support |
| `courts` | 5 | Facilities | Pre-seeded with 4 courts |
| `play_days` | 9 | Play scheduling | Linked to courts |
| `play_day_registrations` | 5 | Registrations | Unique per day+member |
| `matches` | 8 | Match tracking | Multiple per play day |
| `match_participations` | 4 | Player tracking | Team assignment |
| `trial_lessons` | 7 | Trial scheduling | Up to 3 per trial |
| `tournaments` | 11 | Tournament mgmt | Multiple formats |
| `tournament_participations` | 4 | Tournament entries | Unique per tournament |
| `tournament_matches` | 8 | Tournament matches | Unique per tournament |
| `club_updates` | 7 | News/announcements | Publishing support |
| **TOTAL** | **~130** | | **16 tables** |

## 🔐 Security & Constraints

### Unique Constraints
- `users.email` - Email must be unique
- `courts.name` - Court names must be unique
- `memberships.id` - Membership IDs unique
- `play_day_registrations` - One registration per day per member
- `match_participations` - One participation per match per member
- `tournament_participations` - One entry per tournament per member
- `matches` - Unique match number per play day
- `tournament_matches` - Unique match number per tournament

### Cascade Deletes
- Delete `User` → Cascade delete all related data
- Delete `Member` → Cascade delete memberships, registrations, etc.
- Delete `PlayDay` → Cascade delete registrations and matches
- Delete `Tournament` → Cascade delete participations and matches

### Foreign Key Constraints
- All FK relations use `onDelete: Cascade` or `onDelete: Restrict`
- Ensures data integrity and automatic cleanup

## 🎯 Query Examples

### Find member's active membership
```sql
SELECT m.*, mem.* 
FROM memberships m
JOIN members mem ON m.member_id = mem.id
WHERE m.member_id = $1 
  AND m.status = 'ACTIVE'
  AND (m.end_date IS NULL OR m.end_date > NOW())
LIMIT 1;
```

### Get upcoming play days with registrations
```sql
SELECT pd.*, c.name, COUNT(pdr.id) as registered
FROM play_days pd
JOIN courts c ON pd.court_id = c.id
LEFT JOIN play_day_registrations pdr ON pd.id = pdr.play_day_id
WHERE pd.scheduled_date >= NOW()
  AND pd.status = 'SCHEDULED'
GROUP BY pd.id, c.id
ORDER BY pd.scheduled_date
LIMIT 10;
```

### Trial member tracking
```sql
SELECT m.*, 
  COUNT(DISTINCT tl.id) as lesson_count,
  MAX(tl.scheduled_date) as next_lesson
FROM members m
LEFT JOIN trial_lessons tl ON m.id = tl.member_id
WHERE m.account_type = 'TRIAL'
  AND m.trial_status = 'ACTIVE'
GROUP BY m.id;
```

## 🔄 Data Flow

```
User Registration
    ↓
Create User (hashed password)
    ↓
Create Member (linked to User)
    ↓
Create Membership (select plan)
    ↓
[Member can now register for play days or tournaments]
    ↓
PlayDay Registration
    ↓
Attend PlayDay
    ↓
Create Match & Participation
    ↓
Record Match Results
    ↓
Update Member Stats

Trial Path:
    ↓
Create Member (accountType: TRIAL)
    ↓
Set trial dates (30 days)
    ↓
Create 3 Trial Lessons
    ↓
Member completes lessons
    ↓
Convert to Member OR Decline
```

## 📊 Indexes

Key indexes for query performance:
- `play_days(court_id, scheduled_date)` - Composite index
- `trial_lessons(member_id, scheduled_date)` - Trial lookup
- `play_day_registrations(play_day_id)` - Registration lookup
- `match_participations(match_id)` - Match player lookup
- `tournament_participations(tournament_id)` - Tournament lookup

---

## 🔗 Related Documentation

**Database:**
- [Complete Documentation Index](INDEX.md)
- [Database Setup](DATABASE_SETUP.md)
- [Database Commands](DATABASE_COMMANDS.md)
- [Database Init Summary](DATABASE_INIT_SUMMARY.md)
- [Prisma Schema](backend/prisma/README.md)

**Setup & Installation:**
- [Setup Checklist](SETUP_CHECKLIST.md)
- [Quick Start](QUICK_START.md)
- [Installation Guide](INSTALLATION.md)

**Maintenance:**
- [Restore Database](RESTORE_DATABASE.md)
- [Database Scripts](scripts/database/README.md)

---

**Last Updated:** 2026-06-24

For detailed setup instructions, see [DATABASE_SETUP.md](DATABASE_SETUP.md)
For command reference, see [DATABASE_COMMANDS.md](DATABASE_COMMANDS.md)
