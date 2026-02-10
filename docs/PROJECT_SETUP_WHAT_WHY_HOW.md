# Project Setup — Every Step: What? Why? How?

This document explains **what** each part of the setup is, **why** it exists, and **how** to do it (or how it works). Follow in order when setting up the project for development.

---

## Step 1: Prerequisites (Node, pnpm, Docker)

### What

- **Node.js** 20 or higher  
- **pnpm** 9+ (or npm with `--legacy-peer-deps` for install)  
- **Docker** (optional): to run PostgreSQL and Redis locally

### Why

- **Node 20+**: Required by the root `package.json` `engines`; gives LTS and good TS/ES support.  
- **pnpm**: Handles monorepo workspaces and `workspace:*`-style deps cleanly; faster installs and strict dependency tree.  
- **Docker**: Lets you run Postgres and Redis without installing them on your machine; same setup for everyone.

### How

- Install Node from [nodejs.org](https://nodejs.org) or via nvm: `nvm install 20`.  
- Install pnpm: `npm install -g pnpm`.  
- Install Docker Desktop (or Docker Engine) and ensure `docker` and `docker compose` work in your terminal.

---

## Step 2: Clone / open the repo and go to root

### What

You are in the **repository root**: the folder that contains `package.json`, `turbo.json`, `apps/`, and `packages/`.

### Why

All commands for “the whole project” (install, dev, build, DB) are meant to be run from this root. Running from a subfolder (e.g. `apps/api`) can break workspace resolution and env loading.

### How

```bash
cd path/to/E-commerce
# You should see: package.json, apps/, packages/, turbo.json
```

---

## Step 3: Install dependencies (`pnpm install`)

### What

Installs dependencies for the **root** and for every **workspace** (apps/api, apps/web, packages/database, packages/types). pnpm links internal packages (`@ecommerce/database`, `@ecommerce/types`) so they resolve to your local `packages/*` folders.

### Why

- One command installs everything.  
- Internal packages are linked, so changes in `packages/types` or `packages/database` are used by `api` and `web` without publishing.  
- Lockfile keeps versions consistent across machines.

### How

From root:

```bash
pnpm install
```

If you use **npm** instead:

```bash
npm install --legacy-peer-deps
```

(`--legacy-peer-deps` is needed because of Nest/peer dependency constraints.)

---

## Step 4: Copy `.env.example` to `.env`

### What

Create a file named `.env` in the **root** by copying `.env.example`, then set at least `DATABASE_URL` (and optionally other variables).

### Why

- The API (and Prisma) read `DATABASE_URL` from the environment. Without it, the app cannot connect to the database.  
- `.env` is gitignored so secrets are never committed.  
- `.env.example` documents which variables exist and gives safe defaults (e.g. local Docker Postgres).

### How

From root:

```bash
cp .env.example .env
```

Edit `.env` and set:

- `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ecommerce`  
  (if using Docker Compose as below; otherwise point to your Postgres host/port/user/password/db.)

Leave other values as in the example unless you need different ports, CORS origins, or JWT settings.

---

## Step 5: Start PostgreSQL and Redis (Docker)

### What

Run two containers: **PostgreSQL 15** (database) and **Redis 7** (future cache/sessions). They expose ports 5432 and 6379 and use named volumes so data persists.

### Why

- The API and Prisma need a real Postgres database; the schema and migrations are written for Postgres.  
- Redis is used later for cart, cache, rate limiting; having it from Day 1 keeps the same env for the whole project.  
- Docker gives a consistent local environment for all developers and matches the URLs in `.env.example`.

### How

From root:

```bash
docker compose up -d
```

Check that both are healthy:

```bash
docker compose ps
```

You should see `ecommerce-postgres` and `ecommerce-redis` with state “running” (and “healthy” when healthchecks pass).

---

## Step 6: Generate the Prisma client (`pnpm db:generate`)

### What

Runs **Prisma’s code generator** using the schema in `packages/database/prisma/schema.prisma`. The generated TypeScript client is written into `apps/api/node_modules/@prisma/client` (and related files), so the API can use types and methods like `prisma.user.findMany()`.

### Why

- Prisma does not ship a pre-built client for your schema; it generates one from `schema.prisma`.  
- The schema lives in `packages/database` so there is a single source of truth; the API runs `generate` with `--schema=../../packages/database/prisma/schema.prisma` so the client matches that schema.  
- After changing the schema (new model, field, or enum), you must run `db:generate` again so types and API stay in sync.

### How

From root:

```bash
pnpm db:generate
```

This runs the `api` app’s script: `prisma generate --schema=../../packages/database/prisma/schema.prisma`. You should see “Generated Prisma Client” in the output.

---

## Step 7: Run database migrations (`pnpm db:migrate`)

### What

Applies **migrations** (SQL that creates/alters tables) to the database. Prisma uses the migration history in `packages/database/prisma/migrations` and the current schema to bring the DB in line with the code.

### Why

- The schema in code (e.g. `User`, `Product`, `Order`) must exist as tables in Postgres. Migrations are the versioned way to create/change those tables.  
- Running migrations from root with the shared schema path ensures everyone applies the same migrations to the same schema.  
- `DATABASE_URL` in `.env` is used by Prisma when you run this command (from the api context, which loads root `.env` when run via pnpm from root).

### How

From root (with Postgres running and `DATABASE_URL` set in `.env`):

```bash
pnpm db:migrate
```

If this is the first time, Prisma will create the initial migration and apply it. You may be prompted to name the migration (e.g. `init`).

---

## Step 8: Seed the database (`pnpm db:seed`)

### What

Runs the script `packages/database/prisma/seed.ts`, which uses the Prisma client to insert initial data (e.g. categories). Right now it mainly creates a couple of categories so the app has minimal data to work with.

### Why

- Empty tables make it hard to develop and test (e.g. product listing, filters).  
- A deterministic seed gives every developer the same starting point.  
- You can re-run seed after resetting the DB (or use it in CI/staging).

### How

From root (after migrations have been applied):

```bash
pnpm db:seed
```

The script runs in the context of the api app (so it uses the same Prisma client and `DATABASE_URL`). You should see a log like “Seeded categories: electronics clothing”.

---

## Step 9: Run the whole stack (`pnpm dev`)

### What

Starts **both** the backend and the frontend in development mode:

- **API** (NestJS): usually http://localhost:4000, with global prefix `api` → base URL http://localhost:4000/api  
- **Web** (Next.js): usually http://localhost:3000  

Turbo runs the `dev` script in each workspace that defines it (`api` and `web`); both run in parallel and keep running until you stop them.

### Why

- One command gives you the full app: you can hit the API and the storefront without starting two terminals.  
- Turbo knows the dependency order (e.g. build packages first if needed) and does not cache `dev` (so you always see live changes).  
- This is the standard way to work during Day 2 (backend) and Day 3 (frontend).

### How

From root:

```bash
pnpm dev
```

Then open:

- API health: http://localhost:4000/api/health  
- API Swagger: http://localhost:4000/api/docs  
- Web app: http://localhost:3000  

Stop with `Ctrl+C` in the terminal.

---

## Step 10: (Optional) Frontend API URL — `apps/web/.env.local`

### What

Create a file `apps/web/.env.local` and set `NEXT_PUBLIC_API_URL=http://localhost:4000/api` (or your actual API base URL).

### Why

- Next.js only exposes env vars that start with `NEXT_PUBLIC_` to the browser.  
- The frontend’s `src/constants/urls.ts` (and API client) use this to know where to send requests.  
- If you don’t set it, the code falls back to `http://localhost:4000/api`; `.env.local` is useful when the API runs on another host/port (e.g. different machine or port).

### How

Create the file:

```bash
# From root
echo "NEXT_PUBLIC_API_URL=http://localhost:4000/api" > apps/web/.env.local
```

Or create `apps/web/.env.local` manually with that line. Restart the web app’s dev server if it was already running.

---

## Summary: minimal sequence to start development

| Order | Step | Command / action |
|-------|------|-------------------|
| 1 | Prerequisites | Install Node 20+, pnpm, Docker |
| 2 | Open repo | `cd E-commerce` (root) |
| 3 | Install | `pnpm install` (or `npm install --legacy-peer-deps`) |
| 4 | Env | `cp .env.example .env` and set `DATABASE_URL` |
| 5 | DB services | `docker compose up -d` |
| 6 | Prisma client | `pnpm db:generate` |
| 7 | DB schema | `pnpm db:migrate` |
| 8 | Seed data | `pnpm db:seed` |
| 9 | Run stack | `pnpm dev` |
| 10 | (Optional) Web API URL | Set `NEXT_PUBLIC_API_URL` in `apps/web/.env.local` |

After step 9, the project structure is rechecked and you can start Day 2 (backend) and Day 3 (frontend) development. Use **docs/PROJECT_STRUCTURE.md** for a short verification checklist and **docs/SETUP.md** for troubleshooting and alternative options.
