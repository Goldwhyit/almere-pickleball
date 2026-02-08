FROM node:20-alpine

WORKDIR /app

# Copy root package files
COPY package*.json ./

# Copy backend
COPY backend ./backend

WORKDIR /app/backend

# Install dependencies
RUN npm ci

# Build
RUN npm run build

# Expose port
EXPOSE 3000

# Start production server
CMD ["npm", "run", "start:prod"]
