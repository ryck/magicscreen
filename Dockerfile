# Multi-stage build for optimal image size

# Stage 1: Build the client
FROM node:22.12.0-alpine AS client-builder

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10.0.0 --activate

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies (skip prepare script)
RUN pnpm install --frozen-lockfile --ignore-scripts

# Copy source code
COPY . .

# Build the client
RUN pnpm build

# Build the server (compile TypeScript to JavaScript)
RUN pnpm exec tsc --project tsconfig.server.json

# Stage 2: Production runtime
FROM node:22.12.0-alpine AS production

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10.0.0 --activate

# Install only production dependencies (skip prepare script)
RUN pnpm install --frozen-lockfile --prod --ignore-scripts

# Copy built server and client
COPY --from=client-builder /app/dist-server ./dist-server
COPY --from=client-builder /app/dist ./dist

# Expose only the server port (serves both API and static files)
EXPOSE 3001

# Health check
HEALTHCHECK --interval=60s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})" || exit 1

# Start the server (serves both API and static files)
CMD ["node", "dist-server/index.js"]
