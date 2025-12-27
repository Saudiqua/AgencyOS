# AgencyOS Signals

## Overview
AgencyOS Signals is a diagnostic tool for agency founders and leadership teams that surfaces early operational risk at account and agency level. This is a paid diagnostic MVP designed for manual use by operators or consultants.

## Product Philosophy
- **Signals over activity** - Focus on meaningful indicators, not vanity metrics
- **Trends over snapshots** - Look at patterns, not isolated events
- **Teams and accounts before individuals** - No individual tracking or scoring
- **Privacy-safe by default** - No surveillance or behavioral monitoring
- **Interpretability over automation** - Human-readable explanations

## Core Signals
1. **Retainer Reality Index** - Evaluates commercial structure vs delivery reality
2. **Delivery Drift Signal** - Detects movement from planned to reactive delivery
3. **Client Risk Signal** - Identifies early relationship instability

## Project Structure
```
├── client/                 # React frontend
│   └── src/
│       ├── pages/          # Route components
│       │   ├── home.tsx    # Landing page
│       │   ├── analyze.tsx # Multi-step input form
│       │   └── report.tsx  # Report display
│       ├── components/     # Shared UI components
│       └── lib/            # Utilities
├── server/                 # Express backend
│   ├── routes.ts           # API endpoints
│   └── storage.ts          # In-memory storage + signal logic
└── shared/                 # Shared types
    └── schema.ts           # Zod schemas
```

## API Endpoints
- `POST /api/analyze` - Submit account data for analysis
- `GET /api/reports/:id` - Retrieve analysis report
- `GET /api/reports/:id/pdf` - Download report as HTML/PDF
- `GET /api/reports` - List all reports

## Running the Project
The application runs via `npm run dev` which starts both the Express backend and Vite frontend on port 5000.

## Tech Stack
- Frontend: React, Wouter, TanStack Query, Tailwind CSS, shadcn/ui
- Backend: Express, Zod validation
- Storage: In-memory (no database required)
