# ─── Stage 1: 生产依赖 ────────────────────────────────────────────────────────
FROM node:20-alpine AS prod-deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# ─── Stage 2: 构建 ───────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# 为 Linux 容器平台重新生成 Prisma client
RUN npx prisma generate
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ─── Stage 3: 运行时 ─────────────────────────────────────────────────────────
FROM node:20-alpine AS runner
RUN apk add --no-cache libc6-compat
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# 静态资源与构建产物
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next

# 仅生产依赖的 node_modules（去除 devDependencies）
COPY --from=prod-deps /app/node_modules ./node_modules

# Prisma：Linux 平台生成的客户端 + schema（供首次 db push 使用）
COPY --from=builder /app/lib/generated ./lib/generated
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./
COPY package.json ./

# 持久化目录占位（运行时由 Docker 卷挂载覆盖）
RUN mkdir -p /app/data /app/public/uploads

COPY entrypoint.sh ./
RUN chmod +x ./entrypoint.sh

EXPOSE 3000
ENV PORT=3000

ENTRYPOINT ["./entrypoint.sh"]
