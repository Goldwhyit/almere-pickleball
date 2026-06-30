<!-- Navigation: Use INDEX.md for complete documentation -->
[← Back to Index](INDEX.md) | [Setup Checklist](SETUP_CHECKLIST.md) | [Quick Start](QUICK_START.md) | [Database Structure](DATABASE_STRUCTURE.md)

---

# 🚀 Complete Database Setup Guide

This guide walks through the complete database initialization process for Almere Pickleball.

## 📚 Table of Contents
- [Prerequisites](#prerequisites)
- [Step-by-Step Setup](#step-by-step-setup)
- [Verification](#verification)
- [Troubleshooting](#troubleshooting)
- [Next Steps](#next-steps)

---

## 📋 Prerequisites

Ensure you have:
- Node.js v20+ (`node --version`)
- PostgreSQL 15+ (`psql --version`)
- Git (optional)

## 🔧 Step-by-Step Setup

### Step 1: Clone/Download Project

```bash
# If using Git
git clone <repository-url>
cd almere-pickleball

# If using ZIP
unzip almere-pickleball.zip
cd almere-pickleball
```

### Step 2: Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit environment file (configure database credentials)
# On macOS/Linux
nano .env

# On Windows PowerShell
notepad .env
```

**Edit `.env` file:**
```env
# IMPORTANT: Change these values for your environment
DATABASE_URL="postgresql://pickleballuser:securepassword123@localhost:5432/almere_pickleball?schema=public"

# Change these JWT secrets (random strings)!
JWT_SECRET="your-super-secret-jwt-key-change-this"
JWT_REFRESH_SECRET="your-super-secret-refresh-jwt-key"

# Keep these as is for development
NODE_ENV="development"
PORT=3000
FRONTEND_URL="http://localhost:5173"
```

### Step 3: Initialize PostgreSQL Database

**Option A: Using Bash Scripts (macOS/Linux)**

```bash
# Make scripts executable
chmod +x ../scripts/database/*.sh

# Run initialization script
bash ../scripts/database/01-init-database.sh
```

**Option B: Manual PostgreSQL Setup**

```bash
# Connect to PostgreSQL
psql postgres

# Then run these SQL commands:
CREATE DATABASE almere_pickleball;
CREATE USER pickleballuser WITH PASSWORD 'securepassword123';
GRANT ALL PRIVILEGES ON DATABASE almere_pickleball TO pickleballuser;
ALTER DEFAULT PRIVILEGES FOR USER pickleballuser IN SCHEMA public GRANT ALL ON TABLES TO pickleballuser;
ALTER DEFAULT PRIVILEGES FOR USER pickleballuser IN SCHEMA public GRANT ALL ON SEQUENCES TO pickleballuser;
ALTER DEFAULT PRIVILEGES FOR USER pickleballuser IN SCHEMA public GRANT ALL ON FUNCTIONS TO pickleballuser;

# Exit psql
\q
```

### Step 4: Generate Prisma Client

```bash
# From backend directory
npx prisma generate
```

### Step 5: Run Migrations

Create and run the initial database schema:

```bash
# Create initial migration
npx prisma migrate dev --name init

# Or use existing migrations
npx prisma migrate deploy
```

### Step 6: Seed Database (Optional)

Add test data to the database:

```bash
# Using npm script
npm run seed

# Or using bash script
bash ../scripts/database/03-seed-database.sh
```

### Step 7: Verify Setup

```bash
# View database in Prisma Studio
npx prisma studio

# Test backend connection (in another terminal)
cd ..
npm run start:dev
```

Then open:
- **Backend API:** http://localhost:3000
- **Swagger Docs:** http://localhost:3000/api/docs
- **Prisma Studio:** http://localhost:5555

## 🎯 Test Login

After seeding, use these credentials:

```
Email:    piet@example.nl
Password: password123
```

## 📊 Database Structure

### Main Tables Created

```
users                          (9 columns)
├─ password_reset_tokens       (linked)
└─ refresh_tokens              (linked)

members                        (20+ columns)
├─ memberships
├─ payments
├─ play_day_registrations
├─ trial_lessons
├─ match_participations
└─ tournament_participations

courts                         (5 columns)
├─ play_days
├─ matches
└─ play_day_registrations

tournaments                    (11 columns)
├─ tournament_participations
└─ tournament_matches

club_updates                   (7 columns)
```

## 🔄 Common Operations

### View Database

```bash
# Prisma Studio (visual editor)
npx prisma studio

# Direct psql access
psql -h localhost -U pickleballuser -d almere_pickleball
```

### Reset Everything

⚠️ **WARNING:** This deletes all data!

```bash
# Option 1: Using bash script
bash ../scripts/database/02-reset-database.sh

# Option 2: Using Prisma
npx prisma migrate reset

# Then reinitialize:
npx prisma migrate dev --name init
npm run seed
```

### Backup Database

```bash
# Export to SQL file
pg_dump -h localhost -U pickleballuser almere_pickleball > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore from backup
psql -h localhost -U pickleballuser almere_pickleball < backup_20240620_143022.sql
```

### Add New Migration

After modifying `schema.prisma`:

```bash
npx prisma migrate dev --name <descriptive-name>

# Example:
npx prisma migrate dev --name add_user_phone_field
```

## ⚠️ Troubleshooting

### PostgreSQL Connection Error

```bash
# Check PostgreSQL service
sudo systemctl status postgresql   # Linux
brew services list | grep postgres # macOS
# Windows: Check Services app

# Test psql connection
psql -h localhost -U postgres

# Verify credentials in .env
echo $DATABASE_URL
```

### Port 5432 Already in Use

```bash
# Find what's using the port
lsof -i :5432

# Use different port in .env
DATABASE_URL="postgresql://user:pass@localhost:5433/almere_pickleball"
```

### Migration Failed

```bash
# Check current migration status
npx prisma migrate status

# Resolve a rolled back migration
npx prisma migrate resolve --rolled-back <migration-name>

# Start fresh (dev only!)
npx prisma migrate reset
```

### Prisma Client Not Found

```bash
# Regenerate Prisma client
npx prisma generate

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## 🔐 Production Deployment

For production, follow these additional steps:

```bash
# 1. Use strong passwords
DATABASE_URL="postgresql://user:STRONG_PASSWORD@prod-host:5432/db"

# 2. Use secrets management
JWT_SECRET="$(openssl rand -hex 32)"
JWT_REFRESH_SECRET="$(openssl rand -hex 32)"

# 3. Enable SSL for database
DATABASE_URL="postgresql://user:pass@prod-host:5432/db?sslmode=require"

# 4. Run migrations
npx prisma migrate deploy

# 5. Do NOT run seed in production
# (only use for initial setup with minimal data)
```

## 📚 Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [NestJS & Prisma Guide](https://docs.nestjs.com/recipes/prisma)
- [Database Schema Details](backend/prisma/README.md)

## 🔗 Related Documentation

**Setup & Installation:**
- [Complete Documentation Index](INDEX.md)
- [Quick Start (5 min)](QUICK_START.md)
- [Setup Checklist](SETUP_CHECKLIST.md)
- [Installation Guide](INSTALLATION.md)

**Database:**
- [Database Structure](DATABASE_STRUCTURE.md)
- [Database Commands](DATABASE_COMMANDS.md)
- [Prisma Documentation](backend/prisma/README.md)
- [Restore Database](RESTORE_DATABASE.md)

**Quick Help:**
- [Quick Fixes](QUICK_FIX.md)
- [Project Summary](PROJECT_SUMMARY.md)

## ✅ Setup Checklist

- [ ] PostgreSQL installed and running
- [ ] Node.js v20+ installed
- [ ] Database created and user permissions set
- [ ] `.env` file configured
- [ ] Prisma client generated (`npx prisma generate`)
- [ ] Migrations run (`npx prisma migrate deploy`)
- [ ] Database seeded (`npm run seed`)
- [ ] Backend starts successfully (`npm run start:dev`)
- [ ] Can login with test account
- [ ] Prisma Studio works (`npx prisma studio`)

---

🎉 **Setup complete!** You're ready to develop.

Next steps:
1. Start backend: `npm run start:dev`
2. Start frontend: `cd ../frontend && npm run dev`
3. Open http://localhost:5173
4. Login with `piet@example.nl` / `password123`
