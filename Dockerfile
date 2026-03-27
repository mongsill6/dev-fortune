# Stage 1: Builder
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev)
RUN npm ci

# Copy application code
COPY . .

# Stage 2: Production
FROM node:20-alpine

WORKDIR /app

# Install dumb-init and wget for signal handling and healthcheck
RUN apk add --no-cache dumb-init wget

# Copy package files from builder
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy application code from builder
COPY --from=builder /app/src ./src
COPY --from=builder /app/server ./server
COPY --from=builder /app/data ./data
COPY --from=builder /app/bin ./bin
COPY --from=builder /app/quotes.json ./quotes.json
COPY --from=builder /app/README.md ./README.md

# Create a non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

USER nodejs

# Expose port 3000
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Run the server
CMD ["dumb-init", "node", "server/index.js"]
