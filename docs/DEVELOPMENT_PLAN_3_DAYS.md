# E-Commerce Platform — 3-Day Development Plan

**Goal**: Production-ready, MAANG-level e-commerce (Amazon-style) with crystal-clear separation of frontend and backend, using the next-nest-node base and enhancing it.

---

## Overview

| Day | Focus | Deliverables |
|-----|--------|--------------|
| **Day 1** | **Project setup** | Monorepo, Turborepo, apps (web + api), packages, Docker, env, tooling |
| **Day 2** | **Backend** | NestJS API: Prisma + PostgreSQL, Redis, BullMQ, auth, products, cart, orders, payments |
| **Day 3** | **Frontend** | Next.js storefront: pages, cart, checkout, auth, product catalog, Stripe UI |

---

## Day 1 — Project Setup (Today)

### 1.1 Monorepo structure (Turborepo)

```
ecommerce-platform/
├── apps/
│   ├── web/                 # Next.js 14+ storefront (customer-facing)
│   └── api/                 # NestJS REST API (replaces Express in readme)
├── packages/
│   ├── database/            # Prisma schema, migrations, client, seeds
│   ├── types/               # Shared TypeScript types & DTOs
│   ├── config-eslint/       # Shared ESLint (optional)
│   └── config-typescript/   # Shared tsconfig (optional)
├── package.json             # Workspaces + Turborepo
├── turbo.json
├── .env.example
├── docker-compose.yml       # Postgres, Redis for local dev
└── docs/
```

- **Clear separation**: `apps/web` = frontend only, `apps/api` = backend only. No API routes in Next.js for business logic; all go to NestJS.
- **Single source of truth**: DB schema and shared types in `packages/database` and `packages/types`.

### 1.2 Root setup

- **package.json**: `workspaces: ["apps/*", "packages/*"]`, Turborepo scripts: `dev`, `build`, `lint`, `typecheck`, `test`.
- **turbo.json**: Pipelines for `build`, `lint`, `typecheck`, `test` with correct `dependsOn` and caching.
- **.env.example**: All variables for API, web, DB, Redis, JWT, Stripe, OAuth, AWS (placeholders only).

### 1.3 Backend app (`apps/api`)

- **Base**: NestJS from next-nest-node (keep Nest for DI, modules, guards, pipes).
- **DB**: Replace Mongoose with **Prisma**; use **PostgreSQL** (readme).
- **Port**: API on **4000** (readme); frontend dev on 3000.
- **Config**: `@nestjs/config` + Joi/validation; env validated at startup.
- **Quality**: ESLint (strict), Prettier, Husky (pre-commit: lint + typecheck), commitlint (conventional commits).
- **Health**: `GET /health` and `GET /api/health` for readiness/liveness.

### 1.4 Frontend app (`apps/web`)

- **Base**: Next.js from next-nest-node (App Router, Tailwind, Radix/ShadCN-style, Zustand).
- **API client**: Single base URL from `NEXT_PUBLIC_API_URL` (e.g. `http://localhost:4000/api`).
- **No business logic in API routes**: Only optional BFF/proxy if needed; primary is direct calls to NestJS.

### 1.5 Shared packages

- **packages/database**: Prisma schema (all e-commerce models), `prisma generate`, migrations, seed script. Consumed by `apps/api` only (or by workers later).
- **packages/types**: Shared TS types (Product, User, Order, Cart, etc.) and enums. Used by both `apps/web` and `apps/api` for contracts.

### 1.6 Docker (Day 1 scope)

- **docker-compose.yml**: Postgres 15, Redis 7, with healthchecks. Used for local dev and integration tests.
- No app images on Day 1 (optional later).

### 1.7 Documentation

- **README.md** (root): How to clone, install, run backend, run frontend, run with Docker, env setup.
- **docs/SETUP.md**: Step-by-step: install Node 20+, pnpm/npm, copy `.env.example` → `.env`, `pnpm install`, `pnpm run db:prepare`, `pnpm dev`.

---

## Day 2 — Backend (Full)

### 2.1 Architecture (MAANG-style)

- **Layered**: Controller → Service → Repository (Prisma). No business logic in controllers.
- **Feature modules**: `auth`, `users`, `products`, `cart`, `orders`, `payments`, `admin`.
- **Repository pattern**: Each aggregate has a `*.repository.ts` that wraps Prisma; services depend on repositories, not Prisma directly.
- **DTOs**: Request/response DTOs with `class-validator` + `class-transformer`; Swagger decorators for all public endpoints.
- **Global**: ValidationPipe (whitelist, forbidNonWhitelisted), global exception filter (consistent error shape), logging interceptor, correlation ID.

### 2.2 Database (Prisma + PostgreSQL)

- **Schema**: User, Profile, Address, Category, Product, ProductVariant, ProductImage, Review, Cart, CartItem, Order, OrderItem, Payment, Shipment (per readme).
- **Indexes**: All FKs, `email`, `slug`, `orderNumber`, `createdAt`, `sku`.
- **Migrations**: One initial migration; seed for categories and a few products.

### 2.3 Redis

- **Sessions**: Optional session store for auth (or JWT-only; session in Redis for refresh tokens).
- **Cache**: Product by id, product list by filter hash (short TTL).
- **Cart**: Guest cart `cart:guest:{sessionId}`, user cart `cart:user:{userId}` (optional: cart in DB and Redis for speed).
- **Rate limiting**: Per IP / per user using Redis.

### 2.4 Auth

- **JWT**: Access (short) + refresh (longer), stored in DB or Redis; refresh rotation.
- **Guards**: `JwtAuthGuard`, `RolesGuard` (Customer, Admin, Super Admin).
- **Endpoints**: register, login, logout, refresh, forgot-password, reset-password, verify-email; OAuth (Google, GitHub) optional Day 2 or stub.

### 2.5 Core domains

- **Products**: CRUD (admin), list with filters/pagination, get by id/slug, search (Prisma full-text or simple `contains`), reviews (list + create).
- **Cart**: Get, add item, update quantity, remove item, clear; merge guest → user on login.
- **Orders**: Create (from cart), list mine, get by id, cancel; admin: list all, update status.
- **Payments**: Create Stripe PaymentIntent, webhook for `payment_intent.succeeded` (confirm order, deduct inventory).

### 2.6 BullMQ (queues)

- **Queues**: `email` (welcome, order confirmation, password reset), `order` (post-payment processing, e.g. invoice).
- **Worker**: Single worker process or same process with limited concurrency; exponential backoff, dead-letter handling.

### 2.7 API best practices

- **REST**: Resourceful URLs, correct HTTP methods and status codes.
- **Pagination**: Cursor-based where appropriate (e.g. product list), else offset with `limit` cap.
- **Security**: Helmet, CORS whitelist, rate limit, request size limit; no secrets in logs.
- **Observability**: Structured logging (JSON in prod), request ID, timing.

### 2.8 Testing (backend)

- **Unit**: Services and repositories (mocked Prisma).
- **Integration**: Supertest against real endpoints with test DB; auth, products, cart, orders at least.
- **e2e**: Optional minimal flow (login → add to cart → create order).

---

## Day 3 — Frontend (Full)

### 3.1 App structure (Next.js App Router)

- **Routes**: `(auth)` login, register, forgot-password, reset-password; `(shop)` home, products, product/[slug], cart, checkout, orders, account (profile, addresses).
- **Layouts**: Auth layout (centered card), Shop layout (header, footer, nav).
- **API**: All data via `NEXT_PUBLIC_API_URL`; no duplicate business logic in Next.js API routes.

### 3.2 State & data fetching

- **Server components**: Use for static or server-fetched product/category data where possible.
- **Client**: Zustand for cart (and optionally auth state); TanStack Query (React Query) for server state (products, orders, user).
- **Optimistic updates**: Cart and possibly order placement.

### 3.3 Key pages

- **Home**: Hero, categories, featured products (from API).
- **Products**: List with filters (category, price, etc.), sort, pagination or infinite scroll.
- **Product detail**: Gallery, variant selector, add to cart, reviews.
- **Cart**: Line items, quantity, remove; link to checkout.
- **Checkout**: Multi-step (address → payment → review); Stripe Elements for card; confirm order.
- **Orders**: List and order detail with status.

### 3.4 Auth & UX

- **NextAuth or custom**: If custom, login/register forms call API; store tokens (httpOnly cookie preferred or secure client storage); auth guard for protected routes.
- **Loading**: Skeletons and Suspense where appropriate.
- **Errors**: Error boundaries, toast for API errors (e.g. react-hot-toast/sonner).

### 3.5 Performance & SEO

- **Images**: Next/Image with proper sizes; placeholder if needed.
- **Metadata**: Dynamic titles/descriptions for product and category.
- **Code splitting**: Route-based by default; lazy load heavy modals or below-fold sections.

### 3.6 Quality

- **TypeScript**: Strict; types from `packages/types` or generated from API.
- **ESLint + Prettier**: Same as backend standards.
- **Accessibility**: Semantic HTML, ARIA where needed, keyboard nav.

---

## MAANG-Level Practices Summary

| Area | Practice |
|------|----------|
| **Backend** | Layered (Controller → Service → Repository), DTOs, global validation & exception filter, correlation ID, structured logging |
| **DB** | Prisma, migrations, indexes, connection pooling (PgBouncer in prod), no N+1 (use `include` wisely) |
| **Caching** | Redis for cart, optional product cache, rate limit; clear TTLs and invalidation strategy |
| **Security** | Helmet, CORS, rate limit, JWT + refresh, RBAC, no secrets in code/env in repo |
| **API** | RESTful, pagination, consistent error format, Swagger, health checks |
| **Frontend** | App Router, server/client split, shared types, error/loading states, a11y |
| **DevEx** | Monorepo, one-command dev, clear env docs, conventional commits, pre-commit checks |
| **Testing** | Unit (services), integration (API), optional E2E; coverage targets |

---

## Success Criteria (End of Day 3)

- [ ] Monorepo runs with `pnpm install` and `pnpm dev` (web on 3000, api on 4000).
- [ ] DB and Redis via Docker; Prisma migrations and seed apply cleanly.
- [ ] Backend: Auth (register/login), products (list/detail), cart (CRUD), orders (create + list), Stripe payment intent + webhook.
- [ ] Frontend: Browse products, add to cart, checkout with Stripe, see order confirmation; auth flows work.
- [ ] README and SETUP.md allow a new developer to run the stack in under 15 minutes.

---

## Commands Reference (After Setup)

```bash
# Root
pnpm install
pnpm dev              # runs api + web in parallel
pnpm build            # build all
pnpm lint
pnpm typecheck
pnpm test

# Database (from root or apps/api)
pnpm run db:generate  # Prisma generate
pnpm run db:migrate   # Migrate dev
pnpm run db:seed      # Seed
pnpm run db:studio    # Prisma Studio

# Docker
docker compose up -d   # Postgres + Redis
docker compose down
```

---

*This plan keeps the same scope as the main readme but compresses it into a 3-day sprint with clear ownership: Day 1 = setup, Day 2 = backend, Day 3 = frontend.*
