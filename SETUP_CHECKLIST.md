# 📋 Database Setup Checklist

Complete this checklist to set up the Almere Pickleball database from scratch.

## ✅ Pre-requisites

- [ ] PostgreSQL 15+ installed (`psql --version`)
- [ ] Node.js 20+ installed (`node --version`)
- [ ] PostgreSQL service running
- [ ] Terminal/Command Prompt open
- [ ] Downloaded/cloned project

---

## 📂 Step 1: Navigate to Backend

```bash
cd backend
```

- [ ] In correct `backend` directory
- [ ] Can see `package.json`, `src/`, `prisma/` folders

---

## 🔑 Step 2: Environment Setup

```bash
# Copy environment file
cp .env.example .env
```

Then edit `.env`:

```bash
# macOS/Linux
nano .env

# Windows PowerShell
notepad .env
```

Update these fields:
- [ ] `DATABASE_URL` - PostgreSQL connection string
- [ ] `JWT_SECRET` - Change to random string
- [ ] `JWT_REFRESH_SECRET` - Change to random string

**Example .env:**
```env
DATABASE_URL="postgresql://pickleballuser:securepassword123@localhost:5432/almere_pickleball?schema=public"
JWT_SECRET="your-super-secret-key-here"
JWT_REFRESH_SECRET="your-super-secret-refresh-key"
```

- [ ] All required fields filled in `.env`
- [ ] File saved

---

## 📦 Step 3: Install Dependencies

```bash
npm install
```

Wait for installation to complete:
- [ ] No errors during installation
- [ ] `node_modules/` folder created
- [ ] `package-lock.json` created

---

## 🗄️ Step 4: Initialize PostgreSQL Database

**Option A: Using Bash Script (macOS/Linux)**

```bash
chmod +x ../scripts/database/*.sh
bash ../scripts/database/01-init-database.sh
```

- [ ] Script runs without errors
- [ ] Database "almere_pickleball" created
- [ ] User "pickleballuser" created

**Option B: Manual SQL**

```bash
psql postgres
```

Then run:
```sql
CREATE DATABASE almere_pickleball;
CREATE USER pickleballuser WITH PASSWORD 'securepassword123';
GRANT ALL PRIVILEGES ON DATABASE almere_pickleball TO pickleballuser;
```

- [ ] Database created
- [ ] User created
- [ ] Permissions granted

---

## 🔧 Step 5: Generate Prisma Client

```bash
npx prisma generate
```

- [ ] No errors from `prisma generate`
- [ ] Prisma client generated successfully
- [ ] `.prisma/client` folder created

---

## 📋 Step 6: Run Database Migrations

```bash
npx prisma migrate dev --name init
```

OR if migrations already exist:

```bash
npx prisma migrate deploy
```

- [ ] All migrations completed successfully
- [ ] No migration errors
- [ ] Database tables created
- [ ] Can see "✅ Migrations applied" message

---

## 🌱 Step 7: Seed Test Data (Optional)

```bash
npm run seed
```

- [ ] Seed script runs successfully
- [ ] Test data inserted
- [ ] No errors during seeding
- [ ] Can see "✅ Database seeding complete!" message

---

## 🧪 Step 8: Verify Setup

### Verify with Prisma Studio

```bash
npx prisma studio
```

- [ ] Prisma Studio opens at http://localhost:5555
- [ ] Can see all database tables
- [ ] Can see seeded test data
- [ ] Close when done (Ctrl+C)

### Verify with psql

```bash
psql -h localhost -U pickleballuser -d almere_pickleball
```

Then:
```sql
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM members;
SELECT COUNT(*) FROM courts;
\q
```

- [ ] All counts show correct numbers
- [ ] No SQL errors
- [ ] Connection successful

---

## 🚀 Step 9: Start Backend

```bash
npm run start:dev
```

- [ ] Backend starts without errors
- [ ] Shows "Server running on http://localhost:3000"
- [ ] Swagger docs available at http://localhost:3000/api/docs
- [ ] No database connection errors

---

## 🖥️ Step 10: (Optional) Start Frontend

In a new terminal:

```bash
cd frontend
npm run dev
```

- [ ] Frontend starts on http://localhost:5173
- [ ] Can access application
- [ ] No API connection errors

---

## 🔐 Step 11: Test Login

### With seeded test data:

1. Open http://localhost:5173
2. Click "Login"
3. Enter credentials:
   ```
   Email:    piet@example.nl
   Password: password123
   ```

- [ ] Login successful
- [ ] Redirected to dashboard
- [ ] Can see member profile
- [ ] No authentication errors

### Other test accounts:

- [ ] Admin: `admin@almere-pickleball.nl` / `password123`
- [ ] Organizer: `organizer@almere-pickleball.nl` / `password123`
- [ ] Trial: `trial@example.nl` / `password123`

---

## 📝 Common Commands

Keep these handy for future use:

```bash
# Backend commands
npm run start:dev          # Start development server
npm run seed              # Add test data
npm run prisma:studio    # Open database GUI
npm run prisma:migrate   # Create new migration
npm run db:reset         # ⚠️ Reset everything

# Database commands
psql -h localhost -U pickleballuser -d almere_pickleball
# Lists tables: \dt
# Describe table: \d table_name
# Exit: \q
```

---

## 🆘 Troubleshooting

### PostgreSQL not running?
```bash
# Start PostgreSQL
brew services start postgresql@15    # macOS
sudo service postgresql start        # Linux
# Windows: Start from Services app
```

### Connection refused?
- [ ] Check DATABASE_URL in .env
- [ ] Verify PostgreSQL is running
- [ ] Check credentials are correct

### Port 3000 already in use?
- Change in .env: `PORT=3001`
- Update frontend: `VITE_API_URL=http://localhost:3001`

### Migration errors?
```bash
npx prisma migrate status
npx prisma migrate resolve --rolled-back <name>
```

### Can't connect to database with psql?
```bash
# Verify password
psql -h localhost -U pickleballuser -W -d almere_pickleball
# Type password when prompted
```

---

## 📚 Documentation Files

After setup, refer to:

| File | Purpose |
|------|---------|
| `DATABASE_SETUP.md` | Complete setup guide |
| `DATABASE_COMMANDS.md` | Command reference |
| `DATABASE_STRUCTURE.md` | Schema diagram & details |
| `DATABASE_INIT_SUMMARY.md` | What was created |
| `backend/prisma/README.md` | Prisma documentation |
| `scripts/database/README.md` | Script documentation |

---

## ✨ Final Checks

Before declaring setup complete:

- [ ] Backend runs: `npm run start:dev`
- [ ] Frontend runs: `cd ../frontend && npm run dev`
- [ ] Can login with test account
- [ ] Prisma Studio works: `npx prisma studio`
- [ ] Database has tables and data
- [ ] No console errors
- [ ] API Swagger docs accessible

---

## 🎉 Success!

You're ready to develop! 

**Next steps:**
1. Keep backend running: `npm run start:dev`
2. Start frontend in another terminal: `npm run dev`
3. Open http://localhost:5173
4. Login with test account
5. Start building features!

---

## 📞 Need Help?

1. Check error messages carefully
2. Review relevant documentation (see above)
3. Check `psql` connection: `psql postgres`
4. Verify `.env` file values
5. Run migrations: `npx prisma migrate deploy`

---

**Total Setup Time: ~10-15 minutes**

Version: 1.0
Last Updated: June 2024
