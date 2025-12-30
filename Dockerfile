# 1. Base stage - Using Debian Slim for better binary compatibility
FROM node:22.17.0-slim AS base
# Debian requires openssl for many DB drivers
RUN apt-get update && apt-get install -y openssl libssl-dev && rm -rf /var/lib/apt/lists/*
WORKDIR /app

# 2. Dependencies stage
FROM base AS deps
COPY package.json package-lock.json* ./ 
RUN \
  if [ -f package-lock.json ]; then npm ci; \
  else npm install; \
  fi

# 3. Builder stage
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN mkdir -p public
RUN npm run build

# 4. Runner stage
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create a non-root user (Debian style)
RUN groupadd --gid 1001 nodejs
RUN useradd --uid 1001 --gid nodejs --shell /bin/bash --create-home nextjs

# Set up persistence
RUN mkdir -p database public/media && chown -R nextjs:nodejs database public/media

# Copy standalone build
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs
EXPOSE 3000
ENV PORT 3000
ENV DATABASE_URI="file:/app/database/payload.db"

CMD ["node", "server.js"]
