<!-- Navigation: Use INDEX.md for complete documentation -->
[← Back to Index](INDEX.md) | [Quick Start](QUICK_START.md) | [Database Setup](DATABASE_SETUP.md) | [Setup Checklist](SETUP_CHECKLIST.md)

---

# Almere Pickleball - Installatie & Setup Guide

Complete handleiding voor het opzetten van de Almere Pickleball platform (Backend + Frontend).

## 📚 Table of Contents
- [Overzicht](#overzicht)
- [Vereisten](#vereisten)
- [Stap-voor-stap Installatie](#stap-voor-stap-installatie)

---

## 📋 Overzicht

Dit project bestaat uit:
- **Backend**: NestJS API met Prisma ORM en PostgreSQL
- **Frontend**: React applicatie met Vite en Tailwind CSS

## 🔧 Vereisten

Installeer eerst de volgende software:

### 1. Node.js (versie 20 of hoger)
**Download:** https://nodejs.org/

Verificatie:
```bash
node --version  # Moet v20.x.x of hoger zijn
npm --version   # Moet 10.x.x of hoger zijn
```

### 2. PostgreSQL (versie 15 of hoger)
**Download:** https://www.postgresql.org/download/

**Windows:** PostgreSQL installer
**macOS:** `brew install postgresql@15`
**Linux:** `sudo apt-get install postgresql-15`

Verificatie:
```bash
psql --version  # Moet 15.x of hoger zijn
```

### 3. Git
**Download:** https://git-scm.com/downloads

Verificatie:
```bash
git --version
```

---

## 🚀 Stap-voor-stap Installatie

### STAP 1: Database Opzetten

**1.1 Start PostgreSQL service**

Windows:
- PostgreSQL service start automatisch
- Of via Services app → PostgreSQL service → Start

macOS:
```bash
brew services start postgresql@15
```

Linux:
```bash
sudo service postgresql start
```

**1.2 Maak database en gebruiker aan**

Open PostgreSQL terminal:
```bash
# macOS/Linux
psql postgres

# Windows
psql -U postgres
```

Voer deze commando's uit:
```sql
-- Maak database aan
CREATE DATABASE almere_pickleball;

-- Maak gebruiker aan (optioneel, voor development)
CREATE USER pickleballuser WITH PASSWORD 'securepassword123';

-- Geef rechten
GRANT ALL PRIVILEGES ON DATABASE almere_pickleball TO pickleballuser;

-- Verlaat psql
\q
```

**1.3 Test verbinding**
```bash
psql -h localhost -U pickleballuser -d almere_pickleball
# Voer password in wanneer gevraagd
```

---

### STAP 2: Project Downloaden

Unzip het geleverde bestand of clone van Git:

```bash
# Via ZIP
unzip almere-pickleball.zip
cd almere-pickleball

# OF via Git (indien repository beschikbaar)
git clone <repository-url>
cd almere-pickleball
```

---

### STAP 3: Backend Setup

**3.1 Navigeer naar backend folder**
```bash
cd backend
```

**3.2 Installeer dependencies**
```bash
npm install
```

Dit duurt 2-5 minuten afhankelijk van je internet verbinding.

**3.3 Configureer environment variabelen**

Kopieer het voorbeeld bestand:
```bash
# Windows PowerShell
copy .env.example .env

# macOS/Linux
cp .env.example .env
```

Open `.env` en pas aan:
```env
# Database - PAS AAN naar jouw instellingen
DATABASE_URL="postgresql://pickleballuser:securepassword123@localhost:5432/almere_pickleball?schema=public"

# JWT Secrets - VERANDER DEZE in production!
JWT_SECRET="jouw-super-geheime-jwt-key-verander-dit"
JWT_REFRESH_SECRET="jouw-super-geheime-refresh-jwt-key"

# Application
PORT=3000
NODE_ENV=development

# Frontend URL (voor CORS)
FRONTEND_URL="http://localhost:5173"
```

**3.4 Genereer Prisma Client**
```bash
npx prisma generate
```

**3.5 Run database migrations**
```bash
npx prisma migrate dev
```

Je zult gevraagd worden om een migration naam. Typ: `init`

**3.6 Seed database met test data** (Optioneel)
```bash
npm run seed
```

Dit maakt test gebruikers aan:
- Admin: `admin@almere-pickleball.nl` / `password123`
- Organisator: `organizer@almere-pickleball.nl` / `password123`
- Lid: `piet@example.nl` / `password123`

**3.7 Start backend server**
```bash
npm run start:dev
```

✅ Backend draait nu op: **http://localhost:3000**
✅ API Docs beschikbaar op: **http://localhost:3000/api/docs**

Laat deze terminal open!

---

### STAP 4: Frontend Setup

Open een **NIEUWE** terminal/command prompt.

**4.1 Navigeer naar frontend folder**
```bash
cd frontend
```

(Als je in backend zat: `cd ../frontend`)

**4.2 Installeer dependencies**
```bash
npm install
```

**4.3 Configureer environment**
```bash
# Windows PowerShell
copy .env.example .env

# macOS/Linux
cp .env.example .env
```

De default waarden zijn meestal goed:
```env
VITE_API_URL=http://localhost:3000/api
VITE_WS_URL=http://localhost:3000
```

**4.4 Start frontend development server**
```bash
npm run dev
```

✅ Frontend draait nu op: **http://localhost:5173**

Open je browser en ga naar: **http://localhost:5173**

---

## ✅ Verificatie

### Test Backend API

Open browser of gebruik curl:

```bash
# Health check
curl http://localhost:3000/api

# Get swagger docs
# Open in browser: http://localhost:3000/api/docs
```

### Test Frontend

1. Open http://localhost:5173
2. Je ziet de Almere Pickleball homepage
3. Klik op "Login"
4. Login met test account: `piet@example.nl` / `password123`

---

## 🔧 Troubleshooting

### Probleem: "Port 3000 is already in use"

**Oplossing 1:** Stop andere applicatie die port 3000 gebruikt

Windows:
```powershell
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F
```

macOS/Linux:
```bash
lsof -ti:3000 | xargs kill -9
```

**Oplossing 2:** Gebruik andere port

In `backend/.env`:
```env
PORT=3001
```

In `frontend/.env`:
```env
VITE_API_URL=http://localhost:3001/api
VITE_WS_URL=http://localhost:3001
```

### Probleem: "Database connection failed"

**Check 1:** Is PostgreSQL running?
```bash
# macOS
brew services list

# Linux
sudo service postgresql status

# Windows
# Check Services app
```

**Check 2:** Zijn credentials correct?

Test handmatig:
```bash
psql -h localhost -U pickleballuser -d almere_pickleball
```

**Check 3:** Database URL correct in `.env`?
```env
DATABASE_URL="postgresql://USERNAME:PASSWORD@localhost:5432/DATABASE_NAME?schema=public"
```

### Probleem: "Prisma Client not generated"

```bash
cd backend
npx prisma generate
```

### Probleem: "Migration failed"

Reset database:
```bash
cd backend
npx prisma migrate reset
# Type 'yes' om te bevestigen
npx prisma migrate dev
```

### Probleem: Frontend toont "Failed to fetch"

**Check 1:** Is backend running? Ga naar http://localhost:3000/api/docs

**Check 2:** CORS issue? Check `backend/.env`:
```env
FRONTEND_URL="http://localhost:5173"
```

**Check 3:** Firewall blocking? Schakel tijdelijk uit voor test.

---

## 🗄️ Database Management

### Prisma Studio (Visual Database Browser)

```bash
cd backend
npx prisma studio
```

Open http://localhost:5555 om database visueel te bekijken.

### Reset Database (Development only!)

```bash
cd backend
npx prisma migrate reset
npm run seed
```

⚠️ **WARNING:** Dit verwijdert ALLE data!

### Backup Database

```bash
pg_dump -U pickleballuser almere_pickleball > backup.sql
```

### Restore Database

```bash
psql -U pickleballuser almere_pickleball < backup.sql
```

---

## 📝 Development Workflow

### Beide servers draaien

Je hebt **2 terminals** open:

**Terminal 1 - Backend:**
```bash
cd backend
npm run start:dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### Code wijzigingen

Beide servers hebben **hot reload**:
- Wijzig backend code → server herstart automatisch
- Wijzig frontend code → browser ververst automatisch

---

## 🏗️ Production Build

### Backend

```bash
cd backend
npm run build
npm run start:prod
```

### Frontend

```bash
cd frontend
npm run build
```

De `dist/` folder bevat production-ready bestanden.

Deploy naar:
- **Backend:** Railway, Render, DigitalOcean, AWS
- **Frontend:** Vercel, Netlify, AWS S3 + CloudFront

---

## 📚 Volgende Stappen

1. ✅ Installatie compleet!
2. 📖 Lees `backend/README.md` voor API documentation
3. 📖 Lees `frontend/README.md` voor frontend guide
4. 🔍 Bekijk API docs op http://localhost:3000/api/docs
5. 🎨 Start met bouwen van je features!

---

## 💡 Tips

### VS Code Extensions (Aanbevolen)

- ESLint
- Prettier
- Prisma
- Tailwind CSS IntelliSense
- GitLens

### Nuttige Commands

```bash
# Backend testing
cd backend
npm run test
npm run test:e2e

# Frontend linting
cd frontend
npm run lint

# Format code
npm run format
```

---

## 🆘 Hulp Nodig?

1. Check de README's in backend/ en frontend/ folders
2. Bekijk de Prisma schema: `backend/prisma/schema.prisma`
3. Test API endpoints via Swagger UI: http://localhost:3000/api/docs
4. Consult [QUICK_FIX.md](QUICK_FIX.md) for common issues

---

## 🔗 Related Documentation

**Setup & Installation:**
- [Complete Documentation Index](INDEX.md)
- [Quick Start (5 min)](QUICK_START.md)
- [Setup Checklist](SETUP_CHECKLIST.md)
- [Database Setup](DATABASE_SETUP.md)

**Database:**
- [Database Structure](DATABASE_STRUCTURE.md)
- [Database Commands](DATABASE_COMMANDS.md)
- [Prisma Documentation](backend/prisma/README.md)

**Features:**
- [Trial System](README_TRIAL_SYSTEM.md)
- [Responsive Design](README_RESPONSIVE.md)

**Troubleshooting:**
- [Quick Fixes](QUICK_FIX.md)
- [Database Restore](RESTORE_DATABASE.md)

---

## 📄 Licentie

MIT License - Vrij te gebruiken voor commerciële en niet-commerciële doeleinden.

---

**Succes met development! 🏓**

*Last Updated: 2026-06-24*
