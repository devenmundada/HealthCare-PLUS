# # Multi-stage build for production
# FROM node:18-alpine AS builder

# WORKDIR /app

# # Copy package files
# COPY package*.json ./
# COPY tsconfig.json ./

# # Install dependencies
# RUN npm ci --only=production && npm cache clean --force

# # Copy source code
# COPY src ./src

# # Build TypeScript
# RUN npm run build

# # Production stage
# FROM node:18-alpine

# WORKDIR /app

# # Install runtime dependencies
# RUN apk add --no-cache tzdata

# # Create non-root user
# RUN addgroup -g 1001 -S nodejs && \
#     adduser -S nodejs -u 1001

# # Copy built application
# COPY --from=builder --chown=nodejs:nodejs /app/package*.json ./
# COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
# COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist

# # Switch to non-root user
# USER nodejs

# # Health check
# HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
#   CMD node -e "require('http').get('http://localhost:3001/health', (r) => {if(r.statusCode!==200)throw new Error(r.statusCode)})"

# # Expose port
# EXPOSE 3001

# # Start application
# CMD ["node", "dist/index.js"]

FROM node:18

WORKDIR /app

# Copy dependency files
COPY package.json package-lock.json* ./

# Install dependencies (safe, non-strict)
RUN npm install

# Copy source code
COPY . .

# Expose backend port
EXPOSE 3001

# Start backend
CMD ["npm", "start"]
