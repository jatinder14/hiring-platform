# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files (package-lock.json required for npm ci)
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Prisma generate (dummy URL; MongoDB client does not connect at generate time)
ENV DATABASE_URL="mongodb://localhost:27017/dummy"
RUN npx prisma generate

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
RUN npm run build

# Run stage (standalone output)
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 8080
ENV PORT=8080
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
