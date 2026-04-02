# Stage 1: dependencies + builder
FROM node:20-bullseye AS builder

WORKDIR /workspace
COPY package.json pnpm-lock.yaml turbo.json ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
COPY packages/database/package.json packages/database/
COPY packages/types/package.json packages/types/

RUN npm i -g pnpm@9
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm --filter api run db:generate
RUN pnpm --filter api run db:migrate --skip-generate
RUN pnpm build

# Stage 2: runtime
FROM node:20-bullseye AS runtime
WORKDIR /app

ENV NODE_ENV=production
COPY --from=builder /workspace/node_modules ./node_modules
COPY --from=builder /workspace/apps/api/dist ./apps/api/dist
COPY --from=builder /workspace/apps/web/.next ./apps/web/.next
COPY --from=builder /workspace/apps/web/public ./apps/web/public
COPY --from=builder /workspace/apps/web/package.json ./apps/web/package.json
COPY --from=builder /workspace/apps/api/package.json ./apps/api/package.json

EXPOSE 3000 3001

# Start API and Web can use pm2 or separate service
CMD ["sh", "-c", "cd apps/api && node dist/src/main & cd ../web && next start -p 3000"]