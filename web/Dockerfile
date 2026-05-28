# syntax=docker/dockerfile:1

FROM oven/bun:1-alpine

# Install libc6-compat for compatibility with some native binaries (like Next.js SWC)
RUN apk add --no-cache libc6-compat

WORKDIR /home/coderacer/web

# Copy package files
COPY package.json bun.lock ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy the rest of the application
COPY . .

# Expose the port
EXPOSE 3000

# Start the application in development mode
CMD ["bun", "dev"]
