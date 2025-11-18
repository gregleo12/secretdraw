# Frontend

React + TypeScript frontend application for SecretDraw.

## Setup

Will be initialized with Vite in the next step.

## Structure

```
frontend/
├── public/              # Static assets
├── src/
│   ├── components/      # Reusable UI components
│   │   ├── common/      # Common components (Button, Input, etc.)
│   │   ├── layout/      # Layout components (Header, Footer)
│   │   └── features/    # Feature-specific components
│   ├── pages/           # Page components
│   ├── hooks/           # Custom React hooks
│   ├── services/        # API client services
│   ├── types/           # TypeScript type definitions
│   ├── utils/           # Utility functions
│   ├── App.tsx          # Root component
│   └── main.tsx         # Entry point
├── .env.example         # Environment variables template
└── package.json
```

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```
