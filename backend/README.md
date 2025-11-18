# Backend

Node.js + Express + TypeScript API for SecretDraw.

## Setup

Will be initialized with Express and Prisma in the next step.

## Structure

```
backend/
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── migrations/      # Database migrations
├── src/
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Express middleware
│   │   ├── auth.ts      # JWT authentication
│   │   ├── error.ts     # Error handling
│   │   └── validate.ts  # Request validation
│   ├── routes/          # API routes
│   │   ├── auth.routes.ts
│   │   ├── groups.routes.ts
│   │   ├── participants.routes.ts
│   │   └── drawings.routes.ts
│   ├── services/        # Business logic
│   │   ├── authService.ts
│   │   ├── groupService.ts
│   │   ├── matchingService.ts  # Drawing algorithm
│   │   └── emailService.ts
│   ├── utils/           # Utility functions
│   │   ├── jwt.ts
│   │   ├── bcrypt.ts
│   │   └── logger.ts
│   ├── types/           # TypeScript types
│   └── server.ts        # Application entry point
├── .env.example         # Environment variables template
├── tsconfig.json        # TypeScript configuration
└── package.json
```

## Development

```bash
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

## Build

```bash
npm run build
npm start
```

## Database

```bash
# View database
npx prisma studio

# Create migration
npx prisma migrate dev --name description

# Apply migrations
npx prisma migrate deploy
```
