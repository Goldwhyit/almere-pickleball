<!-- Navigation: Use INDEX.md for complete documentation -->
[← Back to Index](INDEX.md) | [Database Setup](DATABASE_SETUP.md) | [Database Structure](DATABASE_STRUCTURE.md) | [Setup Checklist](SETUP_CHECKLIST.md)

---

# 🗄️ Database Commands Quick Reference

## 📚 Table of Contents
- [Initialization Commands](#initialization-commands)
- [Daily Development](#daily-development)
- [Viewing Data](#viewing-data)
- [Maintenance](#maintenance)
- [Production Checklist](#production-checklist)

---

## 🚀 Initialization Commands

```bash
# Navigate to backend
cd backend

# 1. Copy environment file
cp .env.example .env

# 2. Install dependencies
npm install

# 3. Generate Prisma client
npx prisma generate

# 4. Run migrations
npx prisma migrate dev --name init

# 5. Seed database (optional)
npm run seed
```

## 📊 Viewing Data

```bash
# Open Prisma Studio (visual database editor)
npx prisma studio
# → Opens at http://localhost:5555

# Connect directly with psql
psql -h localhost -U pickleballuser -d almere_pickleball

# View specific table
SELECT * FROM users;
SELECT * FROM members;
SELECT * FROM play_days;
```

## 🔄 Database Maintenance

| Command | Purpose |
|---------|---------|
| `npx prisma generate` | Regenerate Prisma client after schema changes |
| `npx prisma migrate dev --name <name>` | Create new migration after schema changes |
| `npx prisma migrate deploy` | Apply pending migrations (production) |
| `npx prisma migrate status` | Check migration status |
| `npx prisma migrate reset` | ⚠️ Reset database (dev only!) |
| `npx prisma validate` | Validate schema.prisma syntax |
| `npx prisma studio` | Open database GUI |
| `npm run seed` | Insert test data |

## 🆕 Adding Data

### Via Prisma Studio
1. Open `npx prisma studio`
2. Navigate to desired table
3. Click "+ Create" button
4. Fill in fields and save

### Via SQL (psql)
```sql
-- Add user
INSERT INTO users (email, password, role, is_active, email_verified)
VALUES ('newuser@example.com', 'hashed_password_here', 'MEMBER', true, false);

-- Add member
INSERT INTO members (user_id, first_name, last_name, account_type, membership_status)
VALUES ('user_id_here', 'John', 'Doe', 'MEMBER', 'ACTIVE');

-- Add court
INSERT INTO courts (name, location, is_active)
VALUES ('Baan 5', 'Sportcomplex Almere', true);
```

## 🧪 Test Data

Test accounts automatically created when seeding:

```
Admin:      admin@almere-pickleball.nl / password123
Organizer:  organizer@almere-pickleball.nl / password123
Member 1:   piet@example.nl / password123
Member 2:   maria@example.nl / password123
Member 3:   jan@example.nl / password123
Trial:      trial@example.nl / password123
```

## 🔓 PostgreSQL Commands

```bash
# Connect to PostgreSQL
psql postgres

# List all databases
\l

# Connect to specific database
\c almere_pickleball

# List all tables
\dt

# Describe table structure
\d table_name

# View table contents
SELECT * FROM table_name LIMIT 10;

# Count rows
SELECT COUNT(*) FROM table_name;

# Exit psql
\q
```

## 🔄 Common Workflows

### Workflow 1: Schema Change
```bash
# 1. Edit backend/prisma/schema.prisma
nano backend/prisma/schema.prisma

# 2. Generate updated client
npx prisma generate

# 3. Create migration
npx prisma migrate dev --name describe_change

# 4. Verify with Studio
npx prisma studio
```

### Workflow 2: Add Test Data
```bash
# 1. Create test in prisma/seed.ts
# 2. Run seed
npm run seed

# 3. Verify in Studio
npx prisma studio
```

### Workflow 3: Fresh Start
```bash
# 1. Reset database (WARNING: deletes all data!)
npx prisma migrate reset

# 2. This automatically:
#    - Drops and recreates database
#    - Runs all migrations
#    - Seeds database
```

## 📈 Scaling Tips

### Optimize Queries
```typescript
// Bad: N+1 queries
const users = await prisma.user.findMany();
for (const user of users) {
  const member = await prisma.member.findUnique({
    where: { userId: user.id }
  });
}

// Good: Use include/select
const users = await prisma.user.findMany({
  include: { member: true }
});
```

### Add Indexes
```prisma
model PlayDay {
  // ...
  @@index([courtId, scheduledDate])  // Composite index
  @@index([status])                   // Single index
}
```

### Connection Pooling
```env
DATABASE_URL="postgresql://user:pass@host:5432/db?connection_limit=10"
```

## 🐛 Debugging

### Enable Query Logging
```env
# In .env
DATABASE_URL="postgresql://user:pass@host/db?debug=true"
```

### View SQL Queries
```typescript
// In your NestJS service
const result = await prisma.$queryRaw`
  SELECT * FROM users WHERE id = ${userId}
`;
console.log(result);
```

### Check Database Constraints
```sql
-- View all constraints
SELECT * FROM information_schema.table_constraints 
WHERE table_name = 'users';

-- View indexes
SELECT * FROM pg_indexes 
WHERE tablename = 'users';
```

## 🔐 Production Checklist

- [ ] Change all test passwords
- [ ] Update JWT secrets with strong random values
- [ ] Enable SSL for database connections
- [ ] Configure connection pooling
- [ ] Enable query logging/monitoring
- [ ] Regular backups enabled
- [ ] Migrations tested on staging first
- [ ] Database user permissions minimized
- [ ] Firewall rules configured
- [ ] Monitoring/alerting set up

## 📞 Need Help?

**Error:** Connection refused
→ Check if PostgreSQL is running

**Error:** "user does not exist"
→ Verify DATABASE_URL credentials

**Error:** "relation does not exist"
→ Run migrations: `npx prisma migrate deploy`

**Error:** "Column already exists"
→ Migration conflict, use `prisma migrate resolve`

---

## 🔗 Related Documentation

**Database:**
- [Complete Documentation Index](INDEX.md)
- [Database Setup](DATABASE_SETUP.md)
- [Database Structure](DATABASE_STRUCTURE.md)
- [Database Init Summary](DATABASE_INIT_SUMMARY.md)
- [Prisma Documentation](backend/prisma/README.md)

**Setup & Installation:**
- [Setup Checklist](SETUP_CHECKLIST.md)
- [Quick Start](QUICK_START.md)
- [Installation Guide](INSTALLATION.md)

**Maintenance:**
- [Restore Database](RESTORE_DATABASE.md)
- [Database Scripts](scripts/database/README.md)

---

**Last Updated:** 2026-06-24

For full documentation, see:
- [DATABASE_SETUP.md](DATABASE_SETUP.md) - Complete setup guide
- [backend/prisma/README.md](backend/prisma/README.md) - Schema details
- [scripts/database/README.md](scripts/database/README.md) - Script documentation
