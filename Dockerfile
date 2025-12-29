FROM node:22.17.0-alpine AS base

# 1. Dependencies
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json* ./ 
RUN npm ci

# 2. Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Payload needs these during build
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# 3. Runner
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Create the storage folders and give permissions
RUN mkdir -p database public/media
RUN chown nextjs:nodejs database public/media

# Copy standalone build
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Check if public folder exists before copying to avoid the crash
COPY --from=builder /app/public ./public

USER nextjs

EXPOSE 3000
ENV PORT 3000
# Ensure database and media are accessible via env
ENV DATABASE_URI="file:/app/database/payload.db"

CMD HOSTNAME="0.0.0.0" node server.js
