FROM node:22-alpine AS deps
WORKDIR /repo
RUN corepack enable
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/frontend/package.json apps/frontend/package.json
COPY apps/backend/package.json apps/backend/package.json
RUN pnpm install --frozen-lockfile

FROM node:22-alpine AS build
WORKDIR /repo
RUN corepack enable
COPY --from=deps /repo/node_modules ./node_modules
COPY --from=deps /repo/apps/frontend/node_modules ./apps/frontend/node_modules
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/frontend apps/frontend
RUN pnpm --filter frontend build

FROM node:22-alpine AS prod-deps
WORKDIR /repo
RUN corepack enable
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/frontend/package.json apps/frontend/package.json
COPY apps/backend/package.json apps/backend/package.json
RUN pnpm install --frozen-lockfile --prod

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=prod-deps /repo/node_modules ./node_modules
COPY --from=prod-deps /repo/apps/frontend/node_modules ./apps/frontend/node_modules
COPY --from=build /repo/apps/frontend/.next ./apps/frontend/.next
COPY --from=build /repo/apps/frontend/public ./apps/frontend/public
COPY apps/frontend/package.json apps/frontend/package.json
COPY apps/frontend/next.config.ts apps/frontend/next.config.ts
WORKDIR /app/apps/frontend
EXPOSE 3000
CMD ["node_modules/.bin/next", "start"]
