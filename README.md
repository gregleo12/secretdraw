# SecretDraw

A smart name-drawing application for Secret Santa and gift exchanges with intelligent constraint handling.

## Overview

SecretDraw eliminates the hassle of organizing gift exchanges by providing an automated, fair, and constraint-aware random drawing system. Perfect for families, friend groups, and office parties where certain people shouldn't draw each other (like couples or past year pairings).

## Features

- **Smart Matching Algorithm**: Automatically handles exclusions and constraints
- **Couple Detection**: Prevents partners from drawing each other
- **Custom Exclusions**: Set up specific "don't match" rules
- **Email Notifications**: Participants receive their assignments securely
- **Mobile-First Design**: Responsive PWA that works on all devices
- **Group Management**: Create and manage multiple drawing groups
- **History Tracking**: Prevent same pairings year after year

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **TailwindCSS** for styling
- **React Router** for navigation
- **PWA** capabilities for mobile app-like experience

### Backend
- **Node.js** with Express and TypeScript
- **PostgreSQL** database
- **Prisma ORM** for type-safe database access
- **JWT** authentication
- **Nodemailer** for email notifications

### Infrastructure
- **Railway** for hosting (both frontend and backend)
- **GitHub** for version control
- **GitHub Actions** for CI/CD (future)

## Project Structure

```
secret-draw/
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── services/        # API client services
│   │   ├── types/           # TypeScript type definitions
│   │   ├── utils/           # Utility functions
│   │   └── App.tsx          # Root component
│   ├── public/              # Static assets
│   └── package.json
│
├── backend/                  # Express API
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # Express middleware
│   │   ├── models/          # Database models (Prisma)
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── utils/           # Utility functions
│   │   └── server.ts        # Application entry point
│   ├── prisma/              # Database schema and migrations
│   └── package.json
│
├── docs/                     # Additional documentation
├── CLAUDE_CONTEXT.md        # Architecture reference for AI
├── DEPLOYMENT.md            # Deployment instructions
├── MAINTENANCE.md           # Maintenance guide
└── README.md                # This file
```

## Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **PostgreSQL** 14+ (or Railway-hosted database)
- **Git** for version control

### Initial Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd secret-draw
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. **Set up environment variables**

   Create `.env` files in both `backend/` and `frontend/` directories:

   **backend/.env**
   ```env
   # Database
   DATABASE_URL="postgresql://user:password@localhost:5432/secretdraw"

   # Server
   PORT=3001
   NODE_ENV=development

   # JWT
   JWT_SECRET=your-secret-key-change-in-production
   JWT_EXPIRES_IN=7d

   # Email (for notifications)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password

   # Frontend URL (for CORS)
   FRONTEND_URL=http://localhost:5173
   ```

   **frontend/.env**
   ```env
   VITE_API_URL=http://localhost:3001
   ```

4. **Set up the database**
   ```bash
   cd backend
   npx prisma migrate dev
   npx prisma generate
   ```

5. **Start development servers**

   Open two terminal windows:

   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev
   ```

   ```bash
   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001

## Development Workflow

### Running Tests
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### Database Migrations
```bash
cd backend

# Create a new migration
npx prisma migrate dev --name description-of-changes

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# View database in browser
npx prisma studio
```

### Code Formatting
```bash
# Both projects use Prettier and ESLint
npm run lint
npm run format
```

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions to Railway.

Quick deploy:
```bash
# Push to main branch triggers automatic deployment on Railway
git push origin main
```

## Maintenance

See [MAINTENANCE.md](./MAINTENANCE.md) for common tasks and troubleshooting.

## Architecture

See [CLAUDE_CONTEXT.md](./CLAUDE_CONTEXT.md) for detailed architecture documentation and development patterns.

## Contributing

1. Create a feature branch: `git checkout -b feature/your-feature-name`
2. Make your changes and commit: `git commit -m "Add some feature"`
3. Push to the branch: `git push origin feature/your-feature-name`
4. Open a Pull Request

## License

Private project - All rights reserved

## Contact

For questions or issues, please open an issue on GitHub.

## Roadmap

- [ ] Basic user authentication
- [ ] Group creation and management
- [ ] Name drawing algorithm with constraints
- [ ] Email notifications
- [ ] Mobile PWA capabilities
- [ ] iOS app via Capacitor
- [ ] Android app via Capacitor
- [ ] History tracking across years
- [ ] Admin dashboard
- [ ] Multi-language support
