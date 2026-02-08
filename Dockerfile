FROM node:20-alpine

WORKDIR /app/backend

# Copy backend files
COPY backend/package*.json ./
COPY backend/tsconfig*.json ./
COPY backend/nest-cli.json ./
COPY backend/src ./src
COPY backend/prisma ./prisma

# Install ALL dependencies (including dev for build)
RUN npm ci

# Build
RUN npm run build

# Remove dev dependencies for production
RUN npm prune --production

# Expose port
EXPOSE 3000

# Start production server
CMD ["npm", "run", "start:prod"]
