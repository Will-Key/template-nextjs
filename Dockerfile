# Dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Enable pnpm
RUN corepack enable pnpm

# Install dependencies based on the preferred package manager
COPY package.json pnpm-lock.yaml* ./
RUN pnpm i --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

# Enable pnpm
RUN corepack enable pnpm

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Create empty directories for Docker COPY compatibility
RUN mkdir -p ./prisma ./node_modules/.pnpm ./node_modules/.bin ./node_modules/tsx ./node_modules/@prisma ./node_modules/prisma

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
ENV NEXT_TELEMETRY_DISABLED 1

# Generate Prisma client before build
RUN if [ -f "./prisma/schema.prisma" ]; then npx prisma generate; fi

# Build with pnpm
RUN pnpm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
# Uncomment the following line in case you want to disable telemetry during runtime.
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
# set hostname to localhost
ENV HOSTNAME "0.0.0.0"

# Copy package.json and prisma directory (now guaranteed to exist)
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

# Enable pnpm in production
RUN corepack enable pnpm

# Copy pnpm and required modules (now guaranteed to exist)
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.pnpm ./node_modules/.pnpm
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.bin ./node_modules/.bin
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/tsx ./node_modules/tsx
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/prisma ./node_modules/prisma

# Create startup script
RUN echo '#!/bin/sh' > /app/start.sh && \
  echo 'echo "Starting application..."' >> /app/start.sh && \
  echo 'if [ -f "./prisma/schema.prisma" ]; then' >> /app/start.sh && \
  echo '  echo "Generating Prisma client..."' >> /app/start.sh && \
  echo '  npx prisma generate' >> /app/start.sh && \
  echo '  echo "Running database migrations..."' >> /app/start.sh && \
  echo '  npx prisma migrate deploy' >> /app/start.sh && \
  echo '  echo "Running database seed..."' >> /app/start.sh && \
  echo '  pnpm run db:seed || echo "No seed script found, skipping..."' >> /app/start.sh && \
  echo 'fi' >> /app/start.sh && \
  echo 'echo "Starting Next.js server..."' >> /app/start.sh && \
  echo 'exec node server.js' >> /app/start.sh && \
  chmod +x /app/start.sh

# server.js is created by next build from the standalone output
# https://nextjs.org/docs/pages/api-reference/next-config-js/output
CMD ["/app/start.sh"]