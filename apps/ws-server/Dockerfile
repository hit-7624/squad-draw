FROM node:20-alpine AS builder
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages ./packages
COPY apps/ws-server/package.json ./apps/ws-server/package.json
RUN pnpm install --no-frozen-lockfile
COPY . .
RUN pnpm --filter @repo/db db:generate
RUN pnpm --filter ws-server build

FROM node:20-alpine AS runner
ENV NODE_ENV=production
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/db ./packages/db
COPY --from=builder /app/apps/ws-server/dist ./apps/ws-server/dist
COPY --from=builder /app/apps/ws-server/node_modules ./apps/ws-server/node_modules
COPY --from=builder /app/apps/ws-server/package.json ./apps/ws-server/package.json
EXPOSE 8080
WORKDIR /app/apps/ws-server
CMD ["node", "dist/index.js"]