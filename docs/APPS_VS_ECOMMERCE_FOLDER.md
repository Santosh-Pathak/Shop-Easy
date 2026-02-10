# Frontend: only `apps/web` (no duplicate)

The duplicate **Ecommerce/** folder (original template with its own backend + frontend) has been **removed**. Only the code that is used remains.

---

## What you have now

| Path | Purpose |
|------|--------|
| **apps/api** | Backend — NestJS, Prisma, PostgreSQL (port 4000) |
| **apps/web** | Frontend — Next.js storefront (port 3000). **This is the only frontend.** |
| **packages/database** | Prisma schema, migrations, seed |
| **packages/types** | Shared TypeScript types |

- Run everything from **root**: `pnpm install`, `pnpm dev`, `pnpm db:*`.
- Frontend talks to **apps/api** via `NEXT_PUBLIC_API_URL` (default `http://localhost:4000/api`).

No duplicate or legacy frontend/backend folders remain.
