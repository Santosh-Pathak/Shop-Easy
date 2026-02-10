# Development setup — ready checklist

Use this once to confirm everything is ready for Day 2 (backend) and Day 3 (frontend) development.

---

## 1. One-time setup (if not done yet)

Run from the **repo root** (`E-commerce`):

```bash
# 1. Install dependencies
pnpm install

# 2. Copy env and set DATABASE_URL (default works with Docker)
cp .env.example .env

# 3. Start Postgres + Redis
docker compose up -d

# 4. Generate Prisma client and create/apply migrations
pnpm db:generate
pnpm db:migrate

# 5. Seed (optional)
pnpm db:seed
```

---

## 2. Quick verification

```bash
# Start both API and Web
pnpm dev
```

Then check:

- **API:** http://localhost:4000/api/health → `{"status":"ok",...}`
- **Swagger:** http://localhost:4000/api/docs → loads
- **Web:** http://localhost:3000 → loads

---

## 3. What’s ready for development

| Area | Status |
|------|--------|
| **Monorepo** | Root package.json, turbo, pnpm workspaces |
| **Backend (apps/api)** | NestJS, Prisma, auth (JWT, refresh, OTP), users, common (guards, filters, interceptors), health |
| **Frontend (apps/web)** | Next.js 16, App Router, Tailwind, components, auth pages, API base URL → `localhost:4000/api` |
| **Database** | Schema in packages/database (User, Profile, Token, Otp, Product, Order, Cart, etc.), migrations, seed |
| **Shared types** | packages/types (Role, OrderStatus, ApiResponse, etc.) |
| **Docker** | Postgres 15 + Redis 7 for local dev |
| **Docs** | SETUP.md, PROJECT_SETUP_WHAT_WHY_HOW.md, DEVELOPMENT_PLAN_3_DAYS.md |

---

## 4. Next steps (development)

- **Day 2:** Implement products, cart, orders, payments (Stripe), Redis cache, BullMQ (see DEVELOPMENT_PLAN_3_DAYS.md).
- **Day 3:** Wire frontend to new APIs, product listing, cart, checkout (see DEVELOPMENT_PLAN_3_DAYS.md).

If all steps above succeed, the setup is **complete for development**.
