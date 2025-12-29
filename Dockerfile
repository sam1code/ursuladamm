# 1. Dependencies stage
FROM node:22.17.0-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./ 

# Fix: Force npm to install the correct native binaries for Alpine/musl
RUN npm install --include=optional --os=linux --libc=musl --cpu=x64
RUN \
  if [ -f package-lock.json ]; then npm ci; \
  else npm install; \
  fi

# 3. Builder stage
FROM base AS builder
# Copy node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# Ensure public exists so runner doesn't crash
RUN mkdir -p public
RUN npm run build

# 4. Runner stage
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Set up persistence for SQLite
RUN mkdir -p database public/media && chown -R nextjs:nodejs database public/media

# Copy the standalone output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs
EXPOSE 3000
ENV PORT 3000
# Ensure path is correct for SQLite
ENV DATABASE_URI="file:/app/database/payload.db"

CMD HOSTNAME="0.0.0.0" node server.js
