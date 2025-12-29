# ... (Previous stages: base, deps)

# 2. Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1

# --- FIX START ---
# Ensure the public directory exists so the COPY command doesn't crash
RUN mkdir -p public
# --- FIX END ---

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

# Copy standalone build files
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# This will now work because we ensured /app/public exists in the builder stage
COPY --from=builder /app/public ./public

USER nextjs
EXPOSE 3000
ENV PORT 3000
ENV DATABASE_URI="file:/app/database/payload.db"

CMD HOSTNAME="0.0.0.0" node server.js
