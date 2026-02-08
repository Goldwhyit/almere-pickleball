FROM node:20-alpine

WORKDIR /app/backend

# Copy backend files
COPY backend/package*.json ./
COPY backend/tsconfig*.json ./
COPY backend/nest-cli.json ./
COPY backend/src ./src
COPY backend/prisma ./prisma

# Install dependencies
RUN npm ci --only=production

# Build
RUN npm run build

# Expose port
EXPOSE 3000

# Start production server
CMD ["npm", "run", "start:prod"]
