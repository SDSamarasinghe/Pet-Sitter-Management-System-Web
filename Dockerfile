# Multi-stage build for Next.js Web App
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build Next.js application
RUN npm run build

# Production stage
FROM node:22-alpine AS production

WORKDIR /app

# Copy package files first
COPY --from=builder /app/package*.json ./

# Install production dependencies
RUN npm ci --only=production

# Copy built application
COPY --from=builder /app/.next ./.next

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
