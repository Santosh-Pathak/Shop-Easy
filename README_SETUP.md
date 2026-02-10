# E-Commerce Platform — Monorepo

Production-ready e-commerce (Amazon-style) with **clear separation**: **Backend** (`apps/api`) and **Frontend** (`apps/web`).

## Quick start

1. **Install**: `pnpm install` (or `npm install` if you use npm; prefer pnpm for monorepo).
2. **Env**: `cp .env.example .env` and set `DATABASE_URL` (default: `postgresql://postgres:postgres@localhost:5432/ecommerce`).
3. **DB**: `docker compose up -d` then `pnpm db:generate` and `pnpm db:migrate` and `pnpm db:seed`.
4. **Run**: `pnpm dev` → API: http://localhost:4000/api, Web: http://localhost:3000.

See **[docs/SETUP.md](docs/SETUP.md)** for full steps and troubleshooting.

## 3-day plan

- **Day 1 (today)**: Project setup ✅ — monorepo, API (NestJS + Prisma), Web (Next.js), Docker, env.
- **Day 2**: Backend — auth, products, cart, orders, payments (Stripe), Redis, BullMQ.
- **Day 3**: Frontend — storefront, cart, checkout, product catalog, auth flows.

Full plan: **[docs/DEVELOPMENT_PLAN_3_DAYS.md](docs/DEVELOPMENT_PLAN_3_DAYS.md)**.

## Structure

| Path | Role |
|------|------|
| `apps/api` | **Backend** — NestJS, Prisma, PostgreSQL (port 4000) |
| `apps/web` | **Frontend** — Next.js 16, Tailwind, ShadCN (port 3000) |
| `packages/database` | Prisma schema, migrations, seed |
| `packages/types` | Shared TypeScript types |

Base template: **next-nest-node** (enhanced with Prisma, Turborepo, e-commerce schema).
