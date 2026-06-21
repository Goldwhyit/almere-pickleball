# Almere Pickleball - Club Website & Competition Platform

Een moderne, responsive clubwebsite met geïntegreerde competitie- en toernooimodule voor pickleballclubs.

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

- [API Documentation](./backend/README.md)
- [Frontend Guide](./frontend/README.md)
- [Database Schema](./backend/prisma/schema.prisma)

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
