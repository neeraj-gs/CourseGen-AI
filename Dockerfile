# Multi-stage build producing a minimal Next.js standalone server image.
# Build with:  docker build -t coursegen-ai .
FROM node:20-alpine AS base

# ---------------------------------------------------------------------------
# Dependencies
# ---------------------------------------------------------------------------
FROM base AS deps
# See https://github.com/nodejs/docker-node#nodealpine for why libc6-compat is needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
# --ignore-scripts skips the `postinstall` prisma generate, which would fail here
# because the schema has not been copied yet. The builder stage runs it instead.
RUN npm ci --ignore-scripts

# ---------------------------------------------------------------------------
# Build
# ---------------------------------------------------------------------------
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Emits .next/standalone, which the runner stage below copies out.
ENV DOCKER_BUILD=1
ENV NEXT_TELEMETRY_DISABLED=1

# Prisma needs a syntactically valid URL to generate the client. It is never
# connected to at build time; the real value is injected at run time.
ENV DATABASE_URL="postgresql://user:password@localhost:5432/placeholder"

RUN npx prisma generate
RUN npm run build

# ---------------------------------------------------------------------------
# Runtime
# ---------------------------------------------------------------------------
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

RUN mkdir .next && chown nextjs:nodejs .next

# Output file tracing keeps the image small by copying only what is reachable.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# server.js is emitted by `next build` with output: 'standalone'.
CMD ["node", "server.js"]
