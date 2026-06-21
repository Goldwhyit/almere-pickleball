# Almere Pickleball - Frontend

React frontend applicatie voor het Almere Pickleball platform.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env

# Start development server
npm run dev
```

De applicatie draait nu op `http://localhost:5173`

## 📦 Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Routing
- **Zustand** - State management
- **React Query** - Server state
- **Socket.io** - Real-time updates

## 🛠️ Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## 📁 Project Structure

```
frontend/
├── public/              # Static assets
├── src/
│   ├── components/      # React components
│   ├── pages/          # Page components
│   ├── lib/            # Utilities & API client
│   ├── types/          # TypeScript types
│   ├── hooks/          # Custom hooks
│   ├── stores/         # Zustand stores
│   ├── index.css       # Global styles
│   └── main.tsx        # Entry point
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## 🎨 Design System

### Colors

**Primary (Blue)** - Voor hoofdelementen, CTA's
- `bg-primary-500` - #3b82f6
- `text-primary-600`

**Accent (Red)** - Voor highlights, alerts
- `bg-accent-500` - #ef4444
- `text-accent-600`

### Typography

- Font: Roboto Light (300) als basis
- Headings: Roboto Bold (700)

### Responsive Breakpoints

- Mobile: < 640px (sm)
- Tablet: 768px (md)
- Laptop: 1024px (lg)
- Desktop: 1280px (xl)

## 🔌 API Integration

De frontend maakt verbinding met de backend API via:
- REST endpoints: `http://localhost:3000/api`
- WebSocket: `http://localhost:3000`

Vite proxy configuratie zorgt voor ontwikkeling zonder CORS issues.

## 🚢 Deployment

### Build

```bash
npm run build
```

De `dist/` folder is production-ready.

### Deploy naar Vercel

1. Push code naar GitHub
2. Verbind repository in Vercel
3. Configureer environment variables
4. Deploy!

### Environment Variables

```
VITE_API_URL=https://your-backend-api.com/api
VITE_WS_URL=https://your-backend-api.com
```

## 📚 Documentation

Belangrijke pages die gebouwd moeten worden:

### Publiek
- `/` - Home
- `/over` - Over de club
- `/lid-worden` - Membership
- `/nieuws` - News
- `/contact` - Contact

### Auth
- `/login` - Login
- `/register` - Register

### Leden
- `/dashboard` - Member dashboard
- `/profiel` - Profile
- `/toernooien` - Tournaments
- `/wedstrijden` - Matches

### Competitie
- `/toernooien/:id` - Tournament details
- `/toernooien/:id/bracket` - Bracket view
- `/toernooien/:id/standings` - Standings
- `/wedstrijden/:id/score` - Score entry

## 🎯 Next Steps

1. Implement routing (React Router)
2. Create API client with Axios
3. Setup Zustand auth store
4. Build component library
5. Implement tournament pages
6. Add WebSocket for real-time updates
7. Create iPad-optimized score entry
8. Add responsive navigation

## 📄 License

MIT
