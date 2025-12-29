# Requires: output: 'standalone' in next.config.mjs
# Based on official Next.js Docker example

FROM node:22.17.0-alpine AS base

# --------------------
# Dependencies stage
# --------------------
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# --------------------
# Build stage
# --------------------
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Optional: disable telemetry
# ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# --------------------
# Production runner
# --------------------
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Public assets
COPY --from=builder /app/public ./public

# Prepare Next.js cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Copy standalone output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000

# server.js comes from Next.js standalone build
CMD HOSTNAME="0.0.0.0" node server.js
