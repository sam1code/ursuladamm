# 1. Base stage
FROM node:22.17.0-slim AS base
RUN apt-get update && apt-get install -y openssl libssl-dev && rm -rf /var/lib/apt/lists/*
WORKDIR /app

# 2. Dependencies stage - ADDED --legacy-peer-deps
FROM base AS deps
COPY package.json package-lock.json* ./ 
RUN \
  if [ -f package-lock.json ]; then npm ci --legacy-peer-deps; \
  else npm install --legacy-peer-deps; \
  fi

# 3. Builder stage
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# Ensure the build process knows we are in production
ENV NODE_ENV=production 
RUN mkdir -p public
RUN npm run build

# 4. Runner stage
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN groupadd --gid 1001 nodejs
RUN useradd --uid 1001 --gid nodejs --shell /bin/bash --create-home nextjs

# Setup folders for Persistence
# IMPORTANT: Match these to your docker-compose volumes
RUN mkdir -p database media && chown -R nextjs:nodejs database media

# Copy standalone build
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs
EXPOSE 3000
ENV PORT 3000

# This matches the volume we will set in docker-compose
ENV DATABASE_URI="file:/app/database/payload.db"

CMD ["node", "server.js"]