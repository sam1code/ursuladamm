FROM node:22.17.0-alpine AS base

# 1. Dependencies
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json* ./ 
RUN \
  if [ -f package-lock.json ]; then npm ci; \
  else npm install; \
  fi

# 2. Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# 3. Runner
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Create storage for SQLite and Media
RUN mkdir -p database public/media && chown -R nextjs:nodejs database public/media

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Safely copy public folder if it exists
COPY --from=builder /app/public ./public

USER nextjs
EXPOSE 3000
ENV PORT 3000
ENV DATABASE_URI="file:/app/database/payload.db"

CMD HOSTNAME="0.0.0.0" node server.js
