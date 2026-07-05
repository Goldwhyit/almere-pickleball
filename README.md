<!-- Navigation: Use INDEX.md for complete documentation map -->
[← Back to Documentation Index](INDEX.md) | [Quick Start](QUICK_START.md) | [Setup Checklist](SETUP_CHECKLIST.md)

---

# Almere Pickleball - Club Website & Competition Platform

Een moderne, responsive clubwebsite met geïntegreerde competitie- en toernooimodule voor pickleballclubs.

## 📚 Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Development Setup](#development-setup)
- [Documentation](#documentation)
- [Testing](#testing)
- [Quick Links](#quick-links)

---

## 🏓 Features

- **Clubwebsite**: Publieke site met nieuws, agenda, lid worden
- **Ledenomgeving**: Persoonlijk dashboard, profiel, statistieken  
- **Competitie Module**: Toernooien, live scoring, brackets, rankings
- **Real-time Updates**: WebSocket voor live scores en standings
- **Responsive Design**: Optimaal op mobiel, tablet (iPad) en desktop
- **Betalingen**: Mollie integratie voor inschrijfgeld

## 🚀 Tech Stack

### Frontend
- React 18 + TypeScript
- Vite
- Tailwind CSS
- React Router v6
- Zustand (state management)
- React Query (server state)
- Socket.io-client

### Backend
- NestJS + TypeScript
- Prisma ORM
- PostgreSQL
- Redis (caching)
- Socket.io (real-time)
- JWT authentication

## 📦 Project Structure

```
almere-pickleball/
├── frontend/          # React frontend applicatie
├── backend/           # NestJS backend API
└── README.md
```

## 🛠️ Development Setup

### Prerequisites
- Node.js 20+
- PostgreSQL 15+
- Redis 7+ (optional voor development)

### Installation

1. **Clone repository**
```bash
git clone <repo-url>
cd almere-pickleball
```

2. **Backend setup**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env met database credentials
npx prisma generate
npx prisma migrate dev
npm run seed # Optional: seed data
npm run start:dev
```

3. **Frontend setup**
```bash
cd frontend
npm install
cp .env.example .env
# Edit .env met backend URL
npm run dev
```

4. **Open browser**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- API Docs: http://localhost:3000/api

## 📚 Documentation

- [Complete Documentation Index](INDEX.md) ← **Start here**
- [Quick Start Guide](QUICK_START.md) - Setup in 5 minutes
- [Setup Checklist](SETUP_CHECKLIST.md) - Step-by-step
- [API Documentation](./backend/README.md)
- [Frontend Guide](./frontend/README.md)
- [Database Schema](./backend/prisma/README.md)
- [Database Setup](DATABASE_SETUP.md)
- [Trial System](README_TRIAL_SYSTEM.md)
- [Responsive Design](README_RESPONSIVE.md)

## 🧪 Testing

```bash
# Backend tests
cd backend
npm run test
npm run test:e2e

# Frontend tests
cd frontend
npm run test
```

## 🔗 Quick Links

**Getting Started:**
- 📖 [Full Documentation Index](INDEX.md)
- ⚡ [Quick Start (5 min)](QUICK_START.md)
- ✅ [Setup Checklist](SETUP_CHECKLIST.md)
- 🔧 [Installation Guide](INSTALLATION.md)

**Database & Backend:**
- 🗄️ [Database Setup](DATABASE_SETUP.md)
- 📊 [Database Structure](DATABASE_STRUCTURE.md)
- 🔧 [Database Commands](DATABASE_COMMANDS.md)
- 📚 [Prisma Documentation](backend/prisma/README.md)

**Features:**
- 🎓 [Trial System](README_TRIAL_SYSTEM.md)
- 📱 [Responsive Design](README_RESPONSIVE.md)
- 🏆 [Tournament Formats](TOURNAMENT_FORMATS.md)

**Maintenance:**
- 🐛 [Quick Fixes](QUICK_FIX.md)
- 🔄 [Backup & Restore](RESTORE_DATABASE.md)
- 📝 [Changelog](CHANGELOG.md)

---

**Last Updated:** 2026-06-24  
**Documentation:** [See INDEX.md](INDEX.md) for complete structure

## 🚢 Deployment

### Production Build

```bash
# Backend
cd backend
npm run build
npm run start:prod

# Frontend  
cd frontend
npm run build
# Deploy dist/ folder to Vercel/Netlify
```

### Environment Variables

Zie `.env.example` files voor required environment variables.

## 📄 License

MIT

## 👥 Contact

Almere Pickleball Club
- Website: https://almere-pickleball.nl
- Email: info@almere-pickleball.nl
