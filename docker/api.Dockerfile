#################################
# 1. builder stage
#################################
FROM node:20-alpine AS builder

# 👉 làm việc ngay trong thư mục con
WORKDIR /app

# ❶ copy manifest + lock của content-api
COPY apps/content-api/package.json apps/content-api/pnpm-lock.yaml ./

# ❷ cài pnpm và dependencies
RUN corepack enable && corepack prepare pnpm@latest --activate
RUN pnpm install --frozen-lockfile --prod=false

# ❸ copy source rồi build
COPY apps/content-api .
RUN pnpm run build        # tạo dist/ ngay trong /app

#################################
# 2. runtime stage
#################################
FROM node:20-alpine
WORKDIR /app

# copy đúng dist và node_modules
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json

ENV NODE_ENV=production PORT=3000
EXPOSE 3000
CMD ["node", "dist/src/main.js"]