# Almere Pickleball - Backend API

NestJS backend API voor het Almere Pickleball platform.

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL 15+
- npm of yarn

### Installation

```bash
# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env file with your database credentials

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Seed database with sample data
npm run seed

# Start development server
npm run start:dev
```

De API draait nu op `http://localhost:3000`

API Documentation: `http://localhost:3000/api/docs`

## 📁 Project Structure

```
backend/
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── seed.ts             # Seed data
├── src/
│   ├── auth/               # Authentication module
│   │   ├── dto/           # Data transfer objects
│   │   ├── strategies/    # Passport strategies
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   └── auth.module.ts
│   ├── common/             # Shared resources
│   │   ├── guards/        # Auth guards
│   │   ├── decorators/    # Custom decorators
│   │   ├── interceptors/
│   │   └── filters/
│   ├── prisma/             # Prisma service
│   │   ├── prisma.service.ts
│   │   └── prisma.module.ts
│   ├── app.module.ts       # Root module
│   └── main.ts             # Entry point
├── test/                   # E2E tests
├── .env.example           # Environment variables template
├── nest-cli.json
├── package.json
├── tsconfig.json
└── README.md
```

## 🔐 Authentication

De API gebruikt JWT (JSON Web Tokens) voor authentication.

### Endpoints

**POST /api/auth/register**
```json
{
  "email": "john@example.com",
  "password": "SecurePassword123!",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+31612345678"
}
```

**POST /api/auth/login**
```json
{
  "email": "john@example.com",
  "password": "SecurePassword123!"
}
```

Response:
```json
{
  "user": {
    "id": "uuid",
    "email": "john@example.com",
    "role": "MEMBER",
    "member": { ... }
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Using the token

Include in requests:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

## 🗄️ Database

### Schema Overview

Core entities:
- **User** - Authentication en roles
- **Member** - Lidgegevens en profiel
- **Tournament** - Toernooien
- **Match** - Wedstrijden
- **Set** - Game sets
- **TournamentRegistration** - Inschrijvingen
- **Payment** - Betalingen
- **Court** - Banen
- **Notification** - Meldingen
- **NewsArticle** - Nieuws
- **Event** - Agenda items

### Migrations

```bash
# Create new migration
npx prisma migrate dev --name migration_name

# Reset database
npx prisma migrate reset

# View database
npx prisma studio
```

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 🌐 API Endpoints

### Public Endpoints

- `POST /api/auth/register` - Register nieuwe gebruiker
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/club/info` - Club informatie
- `GET /api/news` - Nieuwsberichten

### Protected Endpoints (requires authentication)

#### Members
- `GET /api/members/profile` - Eigen profiel
- `PUT /api/members/profile` - Update profiel
- `GET /api/members/stats` - Statistieken
- `GET /api/members/dashboard` - Dashboard data

#### Tournaments
- `GET /api/tournaments` - Lijst toernooien
- `GET /api/tournaments/:id` - Toernooi details
- `POST /api/tournaments/:id/register` - Inschrijven
- `GET /api/tournaments/:id/bracket` - Bracket
- `GET /api/tournaments/:id/standings` - Standen

#### Matches
- `GET /api/matches/:id` - Match details
- `PUT /api/matches/:id/score` - Score invoeren
- `POST /api/matches/:id/confirm` - Score bevestigen
- `GET /api/matches/live` - Live matches

### Organizer Endpoints

- `POST /api/tournaments` - Nieuw toernooi
- `PUT /api/tournaments/:id` - Update toernooi
- `POST /api/tournaments/:id/generate-schedule` - Genereer schema
- `PUT /api/matches/:id/validate` - Valideer score
- `POST /api/guest-players` - Voeg gastspeler toe

### Admin Endpoints

- `GET /api/admin/users` - Alle gebruikers
- `PUT /api/admin/users/:id/role` - Wijzig rol
- `GET /api/admin/payments` - Alle betalingen
- `GET /api/admin/stats` - Platform statistieken

## 🔌 WebSockets

De API ondersteunt real-time updates via WebSockets.

### Events

**Client → Server:**
- `match:subscribe` - Subscribe to match updates
- `tournament:subscribe` - Subscribe to tournament updates
- `match:submit-score` - Submit score

**Server → Client:**
- `match:score-changed` - Score updated
- `match:completed` - Match completed
- `bracket:updated` - Bracket changed
- `standings:updated` - Standings changed
- `notification:new` - New notification

## 📦 Dependencies

### Core
- **NestJS** - Backend framework
- **Prisma** - ORM
- **PostgreSQL** - Database
- **JWT** - Authentication
- **bcrypt** - Password hashing

### Additional
- **class-validator** - Validation
- **Socket.io** - Real-time
- **Swagger** - API documentation

## 🚢 Deployment

### Production Build

```bash
npm run build
npm run start:prod
```

### Environment Variables

Required voor production:
- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `FRONTEND_URL`
- `MOLLIE_API_KEY` (voor payments)
- `SENDGRID_API_KEY` (voor emails)

### Docker (optional)

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npx prisma generate
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "start:prod"]
```

## 🐛 Troubleshooting

### Database connection fails
```bash
# Check PostgreSQL is running
sudo service postgresql status

# Test connection
psql -h localhost -U user -d almere_pickleball
```

### Prisma client not generated
```bash
npx prisma generate
```

### Migration failed
```bash
# Reset database and rerun migrations
npx prisma migrate reset
npx prisma migrate dev
```

## 📚 Documentation

- [Prisma Documentation](https://www.prisma.io/docs)
- [NestJS Documentation](https://docs.nestjs.com)
- [API Docs](http://localhost:3000/api/docs) (when running)

## 🔐 Security

- Passwords are hashed with bcrypt (10 rounds)
- JWT tokens expire after 7 days
- CORS enabled for frontend only
- Input validation on all endpoints
- SQL injection protection via Prisma

## 📄 License

MIT

## 👥 Support

Voor vragen: info@almere-pickleball.nl
