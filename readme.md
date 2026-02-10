# E-Commerce Platform

A production-ready e-commerce monorepo built with **Next.js**, **NestJS**, **Prisma**, and **PostgreSQL**. Full-featured storefront, REST API, authentication, cart, checkout, payments, and admin capabilities—designed for clarity, type safety, and local or cloud deployment.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Scripts](#scripts)
- [Environment Variables](#environment-variables)
- [Documentation](#documentation)
- [License](#license)

---

## Tech Stack

| Layer        | Technologies |
|-------------|--------------|
| **Frontend** | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, Radix UI, Zustand, Framer Motion |
| **Backend**  | NestJS 10, TypeScript, Prisma ORM, Passport (JWT + Local), class-validator, Swagger |
| **Database** | PostgreSQL 15, Redis 7 (sessions/cache) |
| **Tooling**  | Turborepo, pnpm workspaces, ESLint, Prettier |
| **DevOps**   | Docker Compose (Postgres + Redis) |

---

## Project Structure

```
E-commerce/
├── apps/
│   ├── api/                    # NestJS REST API (port 4000)
│   │   ├── src/
│   │   │   ├── main.ts         # Bootstrap, CORS, Swagger, global prefix /api
│   │   │   ├── config/         # Env config & validation (Joi)
│   │   │   ├── prisma/         # PrismaService, PrismaModule
│   │   │   ├── health/         # GET /api/health (liveness/readiness)
│   │   │   ├── common/         # Guards, decorators, filters, interceptors
│   │   │   └── modules/        # Feature modules
│   │   │       ├── auth/       # Signup, login, refresh, forgot/reset password, profile
│   │   │       ├── users/      # User CRUD, admin (ban, role)
│   │   │       ├── addresses/  # Shipping/billing addresses
│   │   │       ├── products/   # Product CRUD, featured, by slug/id
│   │   │       ├── categories/# Categories list, tree, by slug
│   │   │       ├── reviews/    # Product reviews
│   │   │       ├── cart/       # Cart items (add, update, remove, clear)
│   │   │       ├── wishlist/   # Wishlist add/remove
│   │   │       ├── checkout/   # Validate cart, apply coupon, calculate totals
│   │   │       ├── orders/     # Create order, list, cancel; admin orders
│   │   │       ├── payments/   # Payment intents, webhooks
│   │   │       ├── notifications/
│   │   │       ├── search/     # Search
│   │   │       └── admin/     # Admin analytics, orders
│   │   └── package.json       # db:generate, db:migrate, db:studio, db:seed → packages/database
│   │
│   └── web/                    # Next.js storefront (port 3000)
│       ├── src/
│       │   ├── app/            # App Router: (auth), (pages), layout, page
│       │   ├── components/     # UI, auth, layout, guards, user-management
│       │   ├── services/       # API client, auth, http
│       │   ├── store/          # Zustand (auth, etc.)
│       │   ├── hooks/          # useAuth, useApiErrorHandler, etc.
│       │   └── constants/      # BASE_URL from NEXT_PUBLIC_API_URL
│       └── package.json        # Next 16, React 19, Tailwind, Radix, @ecommerce/types
│
├── packages/
│   ├── database/               # Shared Prisma schema & migrations
│   │   ├── prisma/
│   │   │   ├── schema.prisma   # User, Profile, Address, Category, Product, Cart, Order, Payment, etc.
│   │   │   └── seed.ts         # Seed categories (and more)
│   │   └── src/index.ts        # Re-exports (optional)
│   │
│   └── types/                  # Shared TypeScript types & enums
│       └── src/index.ts        # Role, OrderStatus, API response types, etc.
│
├── docs/                       # Setup, structure, plan, implemented features
├── docker-compose.yml          # Postgres 15 + Redis 7 (local dev)
├── turbo.json                  # Turborepo pipeline (build, dev, lint, typecheck, test)
├── pnpm-workspace.yaml         # Workspaces: apps/*, packages/*
├── package.json                # Root scripts: dev, build, lint, typecheck, test, db:*
└── .env.example                # API + optional Web/Stripe/OAuth template
```

---

## Features

- **Authentication** — Signup, login, JWT + refresh, forgot/reset password, email verification, profile.
- **Users & Admin** — User CRUD, ban, role (Customer / Admin / Super Admin), admin user management.
- **Addresses** — Multiple shipping/billing addresses, set default.
- **Catalog** — Products (CRUD, featured, by slug/id), categories (list, tree, by slug), product images and variants.
- **Reviews** — List by product, create, update, delete.
- **Cart** — Get cart, add/update/remove items, clear (supports guest and authenticated).
- **Wishlist** — Add/remove products.
- **Checkout** — Validate cart, apply coupon, calculate totals.
- **Orders** — Create from cart, list, cancel; admin order management and status.
- **Payments** — Payment intents and webhooks (e.g. Stripe-ready).
- **Notifications** — In-app notifications.
- **Search** — Search API for products/catalog.
- **Health** — `GET /api/health` for Docker/Kubernetes.

API documentation is available at **`/api/docs`** (Swagger) when the API is running.

---

## Prerequisites

- **Node.js** 20+
- **pnpm** 9+ (recommended); or npm with `npm install --legacy-peer-deps` and `npm run` for scripts
- **Docker** (optional, for PostgreSQL and Redis)

---

## Getting Started

### 1. Clone and install

```bash
git clone <repository-url>
cd E-commerce
pnpm install
```

### 2. Environment

```bash
cp .env.example .env
```

Edit `.env` and set at least `DATABASE_URL`. Default for local Docker:

- `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ecommerce`
- `REDIS_URL=redis://localhost:6379`

Optional for the frontend: in `apps/web` create `.env.local` and set:

```bash
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

### 3. Database (PostgreSQL + Redis)

**With Docker (recommended):**

```bash
docker compose up -d
pnpm db:generate
pnpm db:migrate
pnpm db:seed
```

**Without Docker:** Ensure PostgreSQL (and optionally Redis) are running, create database `ecommerce`, set `DATABASE_URL` (and `REDIS_URL` if used) in `.env`, then:

```bash
pnpm db:generate
pnpm db:migrate
pnpm db:seed
```

### 4. Run the apps

```bash
pnpm dev
```

- **API:** [http://localhost:4000](http://localhost:4000) — Health: [http://localhost:4000/api/health](http://localhost:4000/api/health), Swagger: [http://localhost:4000/api/docs](http://localhost:4000/api/docs)
- **Web:** [http://localhost:3000](http://localhost:3000)

---

## Scripts

Run from the **repository root** (pnpm recommended).

| Command | Description |
|--------|-------------|
| `pnpm dev` | Start all apps in development mode (Turbo) |
| `pnpm build` | Build all apps and packages |
| `pnpm lint` | Lint all workspaces |
| `pnpm typecheck` | TypeScript check across workspaces |
| `pnpm test` | Run tests in all workspaces |
| `pnpm clean` | Clean build artifacts and node_modules |
| `pnpm db:generate` | Generate Prisma client (schema in `packages/database`) |
| `pnpm db:migrate` | Run Prisma migrations (dev) |
| `pnpm db:studio` | Open Prisma Studio |
| `pnpm db:seed` | Seed database (e.g. categories) |
| `pnpm db:prepare` | Run `db:generate` then `db:migrate` |

---

## Environment Variables

See **`.env.example`** for the full template. Main variables:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string (required) |
| `REDIS_URL` | Redis URL (optional for basic setup) |
| `JWT_SECRET` / `JWT_REFRESH_SECRET` | JWT signing secrets (change in production) |
| `CORS_ORIGIN` | Allowed origins (e.g. `http://localhost:3000`) |
| `NEXT_PUBLIC_API_URL` | API base URL for the frontend (in `apps/web/.env.local`) |

Stripe, OAuth (Google/GitHub), AWS, and SMTP are optional and documented in `.env.example`.

---

## Documentation

| Document | Description |
|----------|-------------|
| [docs/SETUP.md](docs/SETUP.md) | Step-by-step setup and troubleshooting |
| [docs/PROJECT_STRUCTURE.md](docs/PROJECT_STRUCTURE.md) | Detailed structure and verification checklist |
| [docs/IMPLEMENTED_FEATURES.md](docs/IMPLEMENTED_FEATURES.md) | Implemented API routes and schema summary |
| [docs/PROJECT_SETUP_WHAT_WHY_HOW.md](docs/PROJECT_SETUP_WHAT_WHY_HOW.md) | Rationale behind setup choices |
| [docs/DEVELOPMENT_PLAN_3_DAYS.md](docs/DEVELOPMENT_PLAN_3_DAYS.md) | Development roadmap |

---

## License

Proprietary. All rights reserved.
