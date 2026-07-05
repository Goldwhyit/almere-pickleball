# 🗄️ Database Setup & Initialization

This directory contains all database initialization and management scripts for the Almere Pickleball project.

## 📋 Contents

- `schema.prisma` - Prisma ORM schema definition
- `01-init-database.sh` - Initial database setup
- `02-reset-database.sh` - Database reset (⚠️ destructive)
- `03-seed-database.sh` - Add test data
- `.env.example` - Environment variables template

## 🚀 Quick Start

### 1. Initial Setup

```bash
# From project root
cd backend

# Copy environment file
cp .env.example .env

# Edit .env with your settings
nano .env

# Run initialization
bash ../scripts/database/01-init-database.sh
```

### 2. Create Database Schema

```bash
# Generate Prisma client
npx prisma generate

# Run migrations (creates tables from schema)
npx prisma migrate dev --name init

# Or if you prefer to use existing migration
npx prisma migrate deploy
```

### 3. Seed Test Data (Optional)

```bash
# TypeScript seed
npm run seed

# Or bash script
bash ../scripts/database/03-seed-database.sh
```

## 📁 Database Structure

### Core Entities

#### Users & Authentication
- `users` - User accounts (email, password, role)
- `password_reset_tokens` - Password reset tokens
- `refresh_tokens` - JWT refresh tokens

#### Members
- `members` - Member profiles linked to users
- `memberships` - Membership records with plans
- `payments` - Payment transactions

#### Facilities
- `courts` - Pickleball courts/facilities

#### Play Management
- `play_days` - Scheduled play sessions
- `play_day_registrations` - Member registrations for play days
- `matches` - Individual matches during play days
- `match_participations` - Player participation in matches

#### Trial Program
- `trial_lessons` - Trial lesson schedules

#### Tournaments
- `tournaments` - Tournament events
- `tournament_participations` - Player entries
- `tournament_matches` - Tournament match results

#### Content
- `club_updates` - News and announcements

## 🔐 User Roles

| Role | Permissions |
|------|-------------|
| **ADMIN** | Full system access, user management, tournament management |
| **ORGANIZER** | Create tournaments, manage play days and members |
| **MEMBER** | Book play days, join tournaments, manage profile |

## 🧪 Test Accounts

After seeding, these accounts are available:

| Email | Password | Role | Type |
|-------|----------|------|------|
| `admin@almere-pickleball.nl` | `password123` | ADMIN | Admin |
| `organizer@almere-pickleball.nl` | `password123` | ORGANIZER | Regular |
| `piet@example.nl` | `password123` | MEMBER | Regular |
| `maria@example.nl` | `password123` | MEMBER | Regular |
| `jan@example.nl` | `password123` | MEMBER | Regular |
| `trial@example.nl` | `password123` | MEMBER | Trial (30 days) |

## 🛠️ Common Tasks

### Reset Everything

```bash
# WARNING: Deletes all data!
bash ../scripts/database/02-reset-database.sh

# Then reinitialize
bash ../scripts/database/01-init-database.sh
npx prisma migrate deploy
npm run seed
```

### Add New Migration

```bash
# Create a migration after schema changes
npx prisma migrate dev --name <migration-name>

# Example:
npx prisma migrate dev --name add_user_phone
```

### View Database

```bash
# Using Prisma Studio
npx prisma studio

# Or connect with psql
psql -h localhost -U pickleballuser -d almere_pickleball
```

### Backup Database

```bash
# Dump database to file
pg_dump -h localhost -U pickleballuser almere_pickleball > backup.sql

# Restore from backup
psql -h localhost -U pickleballuser almere_pickleball < backup.sql
```

## 🐛 Troubleshooting

### Connection Failed

```bash
# Check PostgreSQL is running
psql postgres -c "SELECT 1"

# Verify credentials in .env
# DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
```

### Migration Conflicts

```bash
# Reset migrations (dev only!)
npx prisma migrate reset

# Or resolve manually
npx prisma migrate resolve --rolled-back <migration-name>
```

### Port Already in Use

Edit `backend/.env`:
```env
# PostgreSQL default port is 5432
DATABASE_URL="postgresql://user:pass@localhost:5432/almere_pickleball"
```

## 📚 Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Database Schema Diagram](../docs/database-schema.md)

## ⚠️ Important Notes

- ⚠️ **Never** use test passwords in production
- ⚠️ **Always** backup production data before migrations
- ⚠️ Test all migrations on a development database first
- 🔒 Change all default credentials in production
- 🔒 Use strong passwords and secure secrets

## 📝 Environment Variables

See `.env.example` for all available settings:

```env
DATABASE_URL              # PostgreSQL connection string
JWT_SECRET               # JWT signing key (change in production!)
JWT_REFRESH_SECRET       # Refresh token key
NODE_ENV                 # development | production
PORT                     # API server port
FRONTEND_URL             # Frontend URL for CORS
```

---

For more information, see the main [README.md](../../README.md) and [INSTALLATION.md](../../INSTALLATION.md).
