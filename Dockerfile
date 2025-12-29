# 1. THE MISSING PIECE: Define "base" at the very top
FROM node:22.17.0-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# 2. Dependencies stage
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json* ./ 

# We combine the flags into the install command to get the musl binaries correctly
RUN \
  if [ -f package-lock.json ]; then \
    npm ci --include=optional --os=linux --libc=musl --cpu=x64; \
  else \
    npm install --include=optional --os=linux --libc=musl --cpu=x64; \
  fi

# 3. Builder stage
FROM base AS builder
WORKDIR /app
# Pull the node_modules we just built
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1

# Ensure public folder exists so the runner doesn't crash
RUN mkdir -p public
RUN npm run build

# 4. Runner stage
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Set up persistence folders for SQLite and Media
RUN mkdir -p database public/media && chown -R nextjs:nodejs database public/media

# Copy the standalone output from Next.js build
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs
EXPOSE 3000
ENV PORT 3000

# This matches the volume/folder we created above
ENV DATABASE_URI="file:/app/database/payload.db"

# server.js is the entry point for Next.js standalone mode
CMD ["node", "server.js"]
