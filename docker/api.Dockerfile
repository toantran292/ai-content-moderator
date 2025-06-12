# docker/api.Dockerfile
FROM node:20-alpine AS builder

# 1. create app dir & copy deps
WORKDIR /app
COPY apps/content-api/package.json apps/content-api/pnpm-lock.yaml ./
RUN corepack enable && corepack prepare pnpm@latest --activate
RUN pnpm install --frozen-lockfile --prod=false

# 2. copy source & build
COPY apps/content-api .
RUN pnpm run build          # Nest -> dist/

# -------- runtime layer --------
FROM node:20-alpine
WORKDIR /app

# only prod deps
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY apps/content-api/package.json ./

ENV NODE_ENV=production \
    PORT=3000

EXPOSE 3000
CMD ["node", "dist/main.js"]