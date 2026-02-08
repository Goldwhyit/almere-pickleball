# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source files
COPY tsconfig*.json ./
COPY vite.config.ts ./
COPY tailwind.config.js ./
COPY postcss.config.js ./
COPY index.html ./
COPY public ./public
COPY src ./src

# Build for production
RUN npm run build

# Production stage - serve with simple HTTP server
FROM node:20-alpine

WORKDIR /app

# Install serve to host static files
RUN npm install -g serve

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# Railway uses PORT environment variable
ENV PORT=8080

EXPOSE 8080

# Serve the built files on specified port
CMD ["sh", "-c", "serve -s dist -p $PORT"]
