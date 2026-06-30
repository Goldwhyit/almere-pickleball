# 🗄️ Prisma Configuration

This directory contains the Prisma ORM configuration for Almere Pickleball.

## 📁 Files

- `schema.prisma` - Complete database schema definition
- `seed.ts` - TypeScript seed script for test data

## 🚀 Quick Commands

```bash
# Install dependencies
npm install @prisma/client
npm install -D prisma

# Generate Prisma client
npx prisma generate

# View schema in visual editor
npx prisma studio

# Create a new migration
npx prisma migrate dev --name <name>

# Run existing migrations
npx prisma migrate deploy

# Reset database (dev only!)
npx prisma migrate reset

# Seed database
npm run seed

# Validate schema
npx prisma validate
```

## 📋 Schema Overview

### Authentication Models
- `User` - User account with role and credentials
- `PasswordResetToken` - Password reset tokens
- `RefreshToken` - JWT refresh tokens

### Member Models
- `Member` - Member profile with trial and membership info
- `Membership` - Membership records
- `Payment` - Payment transactions

### Facility Models
- `Court` - Pickleball courts

### Play Management Models
- `PlayDay` - Scheduled play sessions
- `PlayDayRegistration` - Member registrations
- `Match` - Individual matches
- `MatchParticipation` - Player participation

### Trial Models
- `TrialLesson` - Trial lesson schedules

### Tournament Models
- `Tournament` - Tournament events
- `TournamentParticipation` - Player entries
- `TournamentMatch` - Tournament matches

### Content Models
- `ClubUpdate` - News and announcements

## 🔗 Key Relationships

```
User (1) ──── (1) Member
       ├─── (n) PasswordResetToken
       ├─── (n) RefreshToken
       └─── (n) Tournament (created_by)

Member (1) ──── (n) Membership
       ├─── (n) PlayDayRegistration
       ├─── (n) TrialLesson
       ├─── (n) MatchParticipation
       └─── (n) TournamentParticipation

PlayDay (1) ──── (n) PlayDayRegistration
        ├─── (n) Match
        └─── (1) Court

Match (1) ──── (n) MatchParticipation
      └─── (1) PlayDay
```

## 📊 Enums

### User Roles
- `ADMIN` - Full system access
- `ORGANIZER` - Tournament and event management
- `MEMBER` - Regular member

### Account Types
- `MEMBER` - Regular member
- `TRIAL` - Trial member (limited time)
- `TRIAL_EXPIRED` - Expired trial
- `ADMIN` - Admin account

### Membership Status
- `PENDING` - Awaiting approval
- `ACTIVE` - Active membership
- `INACTIVE` - Inactive
- `SUSPENDED` - Temporarily suspended
- `EXPIRED` - Expired membership

### Membership Plans
- `PER_SESSION` - Pay per session
- `PUNCH_CARD` - Punch card (10 plays)
- `MONTHLY` - Monthly subscription
- `YEARLY` - Annual subscription
- `YEARLY_UPFRONT` - Annual prepaid

### Trial Status
- `PENDING` - Pending start
- `ACTIVE` - Active trial
- `COMPLETED` - Trial completed, member conversion
- `DECLINED` - Trial declined
- `EXPIRED` - Trial period expired

### Registration Status
- `REGISTERED` - Registered for play day
- `ATTENDED` - Attended
- `CANCELLED` - Cancelled registration
- `NO_SHOW` - Registered but didn't show

### Match Status
- `SCHEDULED` - Not yet started
- `IN_PROGRESS` - Currently playing
- `COMPLETED` - Match finished
- `CANCELLED` - Match cancelled

### Payment Methods
- `TRANSFER` - Bank transfer
- `CARD` - Credit/debit card
- `CASH` - Cash payment

### Payment Status
- `PENDING` - Payment pending
- `COMPLETED` - Payment completed
- `FAILED` - Payment failed
- `CANCELLED` - Cancelled
- `REFUNDED` - Refunded

### Tournament Format
- `ROUND_ROBIN` - Round robin
- `SINGLE_ELIMINATION` - Single elimination
- `DOUBLE_ELIMINATION` - Double elimination
- `GROUP_STAGE` - Group stage

### Tournament Status
- `DRAFT` - Draft state
- `PUBLISHED` - Published
- `IN_PROGRESS` - Currently running
- `COMPLETED` - Finished
- `CANCELLED` - Cancelled

## 🔑 Indexes

Important indexes for performance:
- `users.email` - Unique constraint
- `members.user_id` - Foreign key index
- `play_days(court_id, scheduled_date)` - Query optimization
- `trial_lessons(member_id, scheduled_date)` - Trial lesson lookups
- `play_day_registrations(play_day_id, member_id)` - Unique constraint

## 📝 Notes

- All IDs use CUID (collision-resistant IDs)
- Timestamps use `DateTime` with UTC
- Soft deletes not implemented (use status fields instead)
- Cascade delete for most relationships
- Unique constraints on critical fields

## 🔒 Security Considerations

- Passwords are hashed with bcrypt before storage
- JWT tokens stored only on client side
- Sensitive fields excluded from public responses
- Role-based access control (RBAC) enforced at API level
- Email verification for account security

---

For setup and usage instructions, see [database/README.md](../database/README.md).
