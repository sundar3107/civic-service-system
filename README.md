# Civic Service System

Modular civic issue reporting platform with citizen and authority portals.

## Stack

- `Next.js` for the web portal
- `NestJS` for the backend API
- `PostgreSQL` with `Prisma`
- `Redis` placeholder integration point for sessions/queues
- `Leaflet + OpenStreetMap` for issue location selection
- local uploads in development with an S3-compatible abstraction for production

## Prerequisites

- Node.js 22 LTS
- npm 10+ or pnpm
- PostgreSQL 16+
- Redis 7+
- Git

## Workspace Layout

- `apps/web` citizen and authority frontend
- `apps/api` backend API
- `packages/types` shared domain types
- `packages/ui` shared presentational components
- `packages/config` reserved for future shared configs

## Environment Variables

Create `apps/api/.env`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/civic_service_system?schema=public"
JWT_ACCESS_SECRET="replace-me"
JWT_REFRESH_SECRET="replace-me"
APP_ORIGIN="http://localhost:3000"
UPLOAD_DIR="./uploads"
DUPLICATE_RADIUS_METERS=100
```

Create `apps/web/.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL="http://localhost:4000/api"
```

## Install

```powershell
cmd /c npm install
```

## Optional Local Infrastructure With Docker

```powershell
docker compose up -d
```

## Database Setup

```powershell
cmd /c npm run prisma:generate --workspace @civic/api
cmd /c npm run prisma:migrate --workspace @civic/api
cmd /c npm run seed --workspace @civic/api
```

## Run

Terminal 1:

```powershell
cmd /c npm run dev:api
```

Terminal 2:

```powershell
cmd /c npm run dev:web
```

## Implemented Areas

- verified email-first auth scaffolding
- one-time citizen onboarding profile
- complaint creation with category metadata
- duplicate detection by nearby location and issue type
- citizen complaint cards with upvotes
- authority dashboard and complaint status updates
- completed-complaint review flow
