# ==========================================
# Production Dockerfile for K28 - Kolenkachel
# Fullstack Node + React with Dockhand API Proxy
# ==========================================

# Stage 1: Build Frontend and Server
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source files
COPY . .

# Build production assets and bundled server
RUN npm run build

# Stage 2: Production Runtime
FROM node:22-alpine AS runner

WORKDIR /app

LABEL version="2026.11.03.1"
LABEL maintainer="camiel.boekelaar@gmail.com"

ENV NODE_ENV=production
ENV PORT=3001
ENV APP_VERSION=2026.11.03.1

# Install production dependencies only
COPY package*.json ./
RUN npm ci --omit=dev

# Copy built assets and compiled server from builder stage
COPY --from=builder /app/dist ./dist

# Expose K28 port (3001)
EXPOSE 3001

# Health check endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3001/ || exit 1

# Start fullstack server
CMD ["npm", "start"]
