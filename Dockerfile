FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
ENV CI=true
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-time vars (inlined into the JS bundle at build)
ARG NEXT_PUBLIC_BACKEND_API_URL
ENV NEXT_PUBLIC_BACKEND_API_URL=$NEXT_PUBLIC_BACKEND_API_URL

ARG NEXTAUTH_URL
ENV NEXTAUTH_URL=$NEXTAUTH_URL

RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3001
ENV HOSTNAME=0.0.0.0

# Non-root user
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3001

# Runtime-only secrets (NEXTAUTH_SECRET, etc.) come via env at deploy time
CMD ["node", "server.js"]
