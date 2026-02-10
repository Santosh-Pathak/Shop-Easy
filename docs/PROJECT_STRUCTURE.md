# Project Structure — Verification for Development

Use this to confirm the repo is ready for Day 2 (backend) and Day 3 (frontend) development.

---

## Root level

| Path | What | Why |
|------|------|-----|
| `package.json` | Monorepo root: workspaces, turbo scripts, db:* scripts | Single place to run dev/build/lint and DB commands |
| `pnpm-workspace.yaml` | Lists `apps/*` and `packages/*` | Tells pnpm which folders are workspace packages |
| `turbo.json` | Task pipeline (build, dev, lint, typecheck, test) | Caching and correct order when running from root |
| `.env.example` | Template for API + optional Web/Stripe/OAuth | Safe copy-paste; never commit real `.env` |
| `.gitignore` | node_modules, .env, build outputs, etc. | Keeps secrets and build artifacts out of git |
| `docker-compose.yml` | Postgres 15 + Redis 7 services | Local DB and cache without installing them on the host |
| `docs/DEVELOPMENT_PLAN_3_DAYS.md` | 3-day plan (setup → backend → frontend) | Shared roadmap |
| `docs/SETUP.md` | Step-by-step setup and troubleshooting | Onboarding and runbook |
| `docs/PROJECT_SETUP_WHAT_WHY_HOW.md` | What/Why/How for every setup step | Deep understanding of each step |

---

## Apps

### `apps/api` (Backend — NestJS)

| Path | What | Why |
|------|------|-----|
| `src/main.ts` | Bootstrap: CORS, global prefix `api`, ValidationPipe, Swagger, port 4000 | Single entry; all HTTP and global config in one place |
| `src/app.module.ts` | Root module: Config, Prisma, Health | Composes config, DB, and health for the app |
| `src/config/*` | configuration.ts, validation.ts (Joi), configuration.module.ts | Centralized env and validation at startup |
| `src/prisma/*` | PrismaService (extends PrismaClient), PrismaModule (global) | DB access everywhere without passing client |
| `src/health/*` | GET /api/health (checks DB) | Liveness/readiness for Docker/K8s and ops |
| `package.json` | db:generate/migrate/studio/seed point to `../../packages/database/prisma/schema.prisma` | One schema for all migrations and client generation |
| `nest-cli.json` | Nest CLI config, sourceRoot `src` | Build and watch behavior |
| `tsconfig.json` | Strict TS, paths, outDir dist | Consistent compile and path aliases |

**Dependencies**: `@ecommerce/database`, `@ecommerce/types`, NestJS, Prisma, Joi, Helmet, compression, Swagger.

### `apps/web` (Frontend — Next.js)

| Path | What | Why |
|------|------|-----|
| `src/app/*` | App Router: (auth), (pages), layout, page.tsx | Routes and layouts for storefront and auth |
| `src/components/*` | UI, auth, layout, guards, etc. | Reusable UI and behavior |
| `src/constants/urls.ts` | BASE_URL from NEXT_PUBLIC_API_URL (default localhost:4000/api) | Frontend knows where the API is |
| `src/services/*` | API client, http, auth/theme APIs | All server calls go through here to the backend |
| `src/store/*` | Zustand stores (auth, etc.) | Client state |
| `next.config.ts` | Next config, images, headers | Build and runtime config |
| `package.json` | Next 16, React 19, Tailwind, Radix, Zustand, @ecommerce/types | Same stack as plan; shared types |

---

## Packages

### `packages/database`

| Path | What | Why |
|------|------|-----|
| `prisma/schema.prisma` | Full e-commerce schema: User, Product, Order, Cart, etc. | Single source of truth for DB shape and migrations |
| `prisma/seed.ts` | Seeds categories (and can be extended) | Reproducible dev data |
| `src/index.ts` | Re-exports from `@prisma/client` (optional) | Consumers can import from package if needed |
| `package.json` | Prisma + @prisma/client, scripts for generate/migrate/studio/seed | Run migrations and generate from this package |

**Note**: The API runs `prisma generate --schema=../../packages/database/prisma/schema.prisma` so the **client is generated into `apps/api/node_modules`**. The API code uses `PrismaClient` from `@prisma/client` there.

### `packages/types`

| Path | What | Why |
|------|------|-----|
| `src/index.ts` | Shared enums (Role, OrderStatus, etc.) and API response types | Same types in API and Web; fewer mismatches |
| `package.json` | build = tsc, main/types point to dist | Other packages import built output |
| `tsconfig.json` | Emits to dist with declarations | Produces .js and .d.ts for consumption |

**Note**: Run `pnpm build` from root (or build `packages/types` first) so `api` and `web` get the built types when needed.

---

## Data flow (for development)

1. **Schema**: Edit `packages/database/prisma/schema.prisma`.
2. **Migrations**: From root, `pnpm db:migrate` (runs Prisma migrate using that schema).
3. **Client**: `pnpm db:generate` (runs from api context, writes client into api’s node_modules).
4. **API**: Uses `PrismaService` (from `@prisma/client`) in `apps/api`.
5. **Web**: Calls API via `NEXT_PUBLIC_API_URL`; can import `@ecommerce/types` for request/response shapes.

---

## Quick verification checklist

Before starting Day 2 backend work, confirm:

- [ ] From root: `pnpm install` (or `npm install --legacy-peer-deps`) completes.
- [ ] `.env` exists (copy from `.env.example`), with `DATABASE_URL` set (e.g. Docker Postgres).
- [ ] `docker compose up -d` and Postgres/Redis are healthy.
- [ ] `pnpm db:generate` and `pnpm db:migrate` run without errors.
- [ ] `pnpm db:seed` runs (creates categories).
- [ ] `pnpm dev` starts both api and web; API at http://localhost:4000/api/health returns OK; Swagger at http://localhost:4000/api/docs loads.
- [ ] Web at http://localhost:3000 loads (may show errors for API calls until backend is implemented).

If all are true, the project structure is ready for development.
