# syntax=docker/dockerfile:1

# --- Base Stage ---
FROM oven/bun:1-alpine AS base
RUN apk add --no-cache libc6-compat tar
WORKDIR /home/codeflip/web
COPY package.json bun.lock ./

# --- Development Stage ---
FROM base AS development
RUN bun install --frozen-lockfile
COPY . .
EXPOSE 3000
CMD ["bun", "dev"]

# --- Builder Stage (for Production) ---
FROM base AS builder
RUN bun install --frozen-lockfile --no-cache
COPY . .

ARG NEXT_PUBLIC_BASE_URL
ENV NEXT_PUBLIC_BASE_URL=${NEXT_PUBLIC_BASE_URL}
# Optimization for low-resource builds
ENV NODE_OPTIONS="--max-old-space-size=768"
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_BUILD_PARALLELISM=1
ENV NEXT_PRIVATE_LOCAL_SKIP_LINT=1
ENV NEXT_PRIVATE_LOCAL_SKIP_TYPECHECK=1

RUN bun run build

# --- Production Stage ---
# Next.js standalone mode is optimized for Node.js
FROM node:22-alpine AS production
WORKDIR /home/codeflip/web
ENV NODE_ENV=production

# Copy necessary files from builder
COPY --from=builder /home/codeflip/web/public ./public
COPY --from=builder /home/codeflip/web/.next/standalone ./
COPY --from=builder /home/codeflip/web/.next/static ./.next/static

EXPOSE 3000
# server.js is the entry point created by standalone mode
CMD ["node", "server.js"]
