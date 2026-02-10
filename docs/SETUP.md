# E-Commerce Platform — Setup Guide

Crystal-clear setup: **separate frontend (Next.js) and backend (NestJS API)** in a Turborepo monorepo.

## Prerequisites

- **Node.js** 20+
- **pnpm** 9+ (`npm install -g pnpm`) — recommended for monorepo. If using **npm**, run `npm install --legacy-peer-deps` and use `npm run <script>` instead of `pnpm`.
- **Docker** (optional, for Postgres + Redis)

## 1. Clone and install

```bash
cd E-commerce
pnpm install
```

## 2. Environment

Copy the example env and set at least `DATABASE_URL`:

```bash
cp .env.example .env
# Edit .env: set DATABASE_URL if not using default below.
```

Default (local Docker):

- `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ecommerce`
- `REDIS_URL=redis://localhost:6379`

For **frontend** (optional override): in `apps/web` create `.env.local`:

```bash
# apps/web/.env.local
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

## 3. Database (PostgreSQL)

**Option A — Docker (recommended)**

```bash
docker compose up -d
# Wait for Postgres and Redis to be healthy, then:
pnpm db:generate
pnpm db:migrate
pnpm db:seed
```

**Option B — Local Postgres**

Create a database named `ecommerce`, set `DATABASE_URL` in `.env`, then:

```bash
pnpm db:generate
pnpm db:migrate
pnpm db:seed
```

## 4. Run the stack

From **repository root**:

```bash
pnpm dev
```

This starts:

- **API**: http://localhost:4000/api (NestJS)
- **Web**: http://localhost:3000 (Next.js)

Swagger: http://localhost:4000/api/docs  
Health: http://localhost:4000/api/health

## 5. Run apps individually

```bash
# Backend only
pnpm --filter api run dev

# Frontend only (ensure API is running for auth/data)
pnpm --filter web run dev
```

## Structure (crystal clear)

| Path              | Purpose                    |
|-------------------|----------------------------|
| `apps/api`        | **Backend** — NestJS REST API (port 4000) |
| `apps/web`        | **Frontend** — Next.js storefront (port 3000) |
| `packages/database` | Prisma schema, migrations, seed |
| `packages/types`  | Shared TypeScript types    |

All business logic and data access live in **apps/api**. The frontend calls the API via `NEXT_PUBLIC_API_URL`.

## Useful commands

| Command           | Description                    |
|-------------------|--------------------------------|
| `pnpm dev`        | Run API + Web in parallel     |
| `pnpm build`      | Build all apps                |
| `pnpm lint`       | Lint all                      |
| `pnpm typecheck`  | TypeScript check              |
| `pnpm db:generate` | Generate Prisma client (api)  |
| `pnpm db:migrate`  | Run migrations                |
| `pnpm db:studio`   | Open Prisma Studio            |
| `pnpm db:seed`     | Seed database                 |

## Troubleshooting

- **API won’t start**: Ensure Postgres is running and `DATABASE_URL` in `.env` is correct. Run `pnpm db:generate` from root.
- **Web 404 on API**: Set `NEXT_PUBLIC_API_URL=http://localhost:4000/api` in `apps/web/.env.local`.
- **Port in use**: Change `PORT` in `.env` (API) or run Next.js on another port: `pnpm --filter web run dev -- -p 3001`.
