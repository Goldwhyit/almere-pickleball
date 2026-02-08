# 🏓 Almere Pickleball - Trial System

Volledig werkende webapplicatie (frontend + backend) voor het Almere Pickleball trial lesson systeem.

## 📦 Wat zit erin?

- **Backend**: NestJS API met Prisma ORM, PostgreSQL, JWT authentication
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Database**: PostgreSQL met trial lesson schema
- **Docker**: Volledige containerisatie voor eenvoudige deployment

## 🚀 Quick Start

### Docker (aanbevolen)

```bash
# Start alles met één commando
docker compose up --build

# URLs:
# Frontend: http://localhost:5173
# Backend API: http://localhost:3000
# Swagger docs: http://localhost:3000/api/docs
```

### Handmatig

#### 1. Database
```bash
# Zorg dat PostgreSQL 15+ draait
createdb nieuw_project
```

#### 2. Backend
```bash
cd backend
npm install
npx prisma generate
npx prisma migrate deploy
npm run start:dev
```

#### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```

## 🧪 Testen

### 1. Trial Signup
1. Ga naar `http://localhost:5173`
2. Klik "Proefles aanvragen"
3. Vul formulier in met:
   - Email: `test@example.com`
   - Wachtwoord: `password123`
4. Accepteer voorwaarden
5. Klik "INSCHRIJVEN"
6. Je wordt doorgestuurd naar login

### 2. Login
1. Email: `test@example.com`
2. Wachtwoord: `password123`
3. Klik "Inloggen"
4. Je landt op Trial Dashboard

### 3. Trial Dashboard
1. Je ziet status cards (Geboekte lessen, Voltooid, Status)
2. Ga naar "Datums selecteren"
3. Kies 3 datums binnen 2 weken
4. Klik "Datums opslaan"
5. Ga naar "Mijn lessen" - je ziet je geboekte lessen

## 📊 Admin Access

Het systeem heeft admin endpoints, maar er is geen separate admin UI gebouwd (blueprint aanwezig).

Admin endpoints (vereisen JWT token):
- `GET /api/trial-lessons/admin/all` - Alle trial members
- `GET /api/trial-lessons/admin/:memberId` - Details
- `PUT /api/trial-lessons/admin/:lessonId/mark-completed` - Vink les af
- `GET /api/trial-lessons/admin/stats/overview` - Statistieken

## 🏗️ Architectuur

```
almere-pickleball/
├── backend/
│   ├── src/
│   │   ├── main.ts (entry point)
│   │   ├── app.module.ts (app config)
│   │   ├── auth/ (authentication)
│   │   ├── trial-lessons/ (core module)
│   │   ├── memberships/ (membership module)
│   │   └── prisma/ (database)
│   ├── prisma/
│   │   └── schema.prisma (database schema)
│   ├── Dockerfile
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── main.tsx (entry point)
│   │   ├── App.tsx (routing)
│   │   ├── pages/
│   │   │   ├── Home.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── TrialSignup.tsx
│   │   │   └── TrialDashboard.tsx
│   │   ├── lib/
│   │   │   └── api.ts (API client)
│   │   ├── stores/
│   │   │   └── auth.ts (auth store)
│   │   └── components/
│   │       └── ProtectedRoute.tsx
│   ├── Dockerfile
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── package.json
│
├── docker-compose.yml
└── README.md
```

## 🔑 Database Schema

**User** - Authentication
- id, email, password, createdAt, updatedAt

**Member** - User profile + trial fields
- id, userId, firstName, lastName, phone, dateOfBirth
- accountType (TRIAL | MEMBER | TRIAL_EXPIRED | ADMIN)
- trialStartDate, trialEndDate, trialLessonsUsed
- conversionDate, stopReason, stopFeedback

**TrialLesson** - Scheduled lessons
- id, memberId, scheduledDate, scheduledTime
- status (SCHEDULED | COMPLETED | CANCELLED | NO_SHOW)
- checkInTime, completedAt, notes

## 🔐 Environment Variables

### Backend (.env)
```
DATABASE_URL="postgresql://postgres:postgres@postgres:5432/nieuw_project?schema=public"
JWT_SECRET="your-secret-key-change-in-production"
JWT_EXPIRATION="24h"
NODE_ENV="development"
PORT="3000"
FRONTEND_URL="http://localhost:5173"
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:3000/api
```

## 📝 API Endpoints

### Public
- `POST /api/auth/login` - Login
- `POST /api/trial-lessons/signup` - Trial signup

### Protected (User)
- `GET /api/trial-lessons/my-status` - Trial status
- `GET /api/trial-lessons/my-lessons` - User's lessons
- `POST /api/trial-lessons/book-dates` - Book dates
- `PUT /api/trial-lessons/:lessonId/reschedule` - Reschedule
- `POST /api/trial-lessons/convert-to-member` - Convert to member
- `POST /api/trial-lessons/decline-membership` - Decline + feedback

### Protected (Admin)
- `GET /api/trial-lessons/admin/all` - All members
- `GET /api/trial-lessons/admin/:memberId` - Member details
- `PUT /api/trial-lessons/admin/:lessonId/mark-completed` - Mark completed
- `GET /api/trial-lessons/admin/stats/overview` - Stats

## 🛠️ Development

### Backend entwicklung
```bash
cd backend
npm run start:dev    # Hot reload
npm run lint         # ESLint
npm test            # Jest tests
```

### Frontend development
```bash
cd frontend
npm run dev         # Vite dev server
npm run build       # Production build
npm run lint        # ESLint
```

## 📚 Features Implemented

✅ Trial system (signup, 30-day expiry, auto-expiry)
✅ Date booking (3 lessons, 2-week window, validation)
✅ Lesson management (CRUD)
✅ Completion modal (non-dismissible)
✅ Feedback collection (decline reasons)
✅ Member conversion
✅ Authentication (JWT)
✅ Protected routes
✅ Admin endpoints
✅ Responsive design
✅ Docker setup
✅ Swagger API docs

## 🚧 Future Enhancements

- Admin dashboard UI
- Email notifications (currently console logs)
- Payment integration (Mollie)
- Tournament module
- Match system
- Real-time updates (WebSocket)
- Coaching system
- DUPR integration

## 🧉 Support

Documentatie beschikbaar in:
- Swagger UI: `http://localhost:3000/api/docs`
- Backend README: `backend/README.md` (todo)
- Frontend README: `frontend/README.md` (todo)

## 📄 Licentie

MIT License
