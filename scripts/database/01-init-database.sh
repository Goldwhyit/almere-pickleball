#!/bin/bash

# ============================================
# Database Initialization Script
# ============================================
# This script sets up the PostgreSQL database for Almere Pickleball
# Usage: bash scripts/database/01-init-database.sh

set -e

echo "🔧 Almere Pickleball - Database Initialization"
echo "=============================================="

# Configuration
DB_NAME="almere_pickleball"
DB_USER="pickleballuser"
DB_PASSWORD="securepassword123"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}📍 Step 1: Checking PostgreSQL connection...${NC}"

# Check if psql is available
if ! command -v psql &> /dev/null; then
    echo -e "${RED}❌ psql not found. Please install PostgreSQL.${NC}"
    exit 1
fi

# Test connection
if ! psql -h "$DB_HOST" -U postgres -d postgres -c "SELECT 1" > /dev/null 2>&1; then
    echo -e "${RED}❌ Cannot connect to PostgreSQL. Make sure PostgreSQL is running.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ PostgreSQL connection OK${NC}\n"

echo -e "${BLUE}📍 Step 2: Creating database...${NC}"

# Create database if it doesn't exist
PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -U postgres -d postgres << SQL
-- Create database
CREATE DATABASE $DB_NAME;

-- Create user
CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;

-- Set default privileges
ALTER DEFAULT PRIVILEGES FOR USER $DB_USER IN SCHEMA public GRANT ALL ON TABLES TO $DB_USER;
ALTER DEFAULT PRIVILEGES FOR USER $DB_USER IN SCHEMA public GRANT ALL ON SEQUENCES TO $DB_USER;
ALTER DEFAULT PRIVILEGES FOR USER $DB_USER IN SCHEMA public GRANT ALL ON FUNCTIONS TO $DB_USER;
SQL

echo -e "${GREEN}✅ Database created${NC}\n"

echo -e "${BLUE}📍 Step 3: Setting up schema and extensions...${NC}"

# Connect to the new database and set up extensions
PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" << SQL
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pgcrypto for password hashing
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create schema
CREATE SCHEMA IF NOT EXISTS public;

-- Grant schema permissions
GRANT USAGE ON SCHEMA public TO $DB_USER;
GRANT CREATE ON SCHEMA public TO $DB_USER;
SQL

echo -e "${GREEN}✅ Schema setup complete${NC}\n"

echo -e "${BLUE}📍 Step 4: Testing database connection...${NC}"

# Test connection to new database
if PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Database connection verified${NC}\n"
else
    echo -e "${RED}❌ Failed to connect to database${NC}"
    exit 1
fi

echo -e "${GREEN}=============================================="
echo "✅ Database initialization complete!"
echo "=============================================="
echo "Database name: $DB_NAME"
echo "Database user: $DB_USER"
echo "Host: $DB_HOST:$DB_PORT"
echo ""
echo -e "Next step: Run ${BLUE}npx prisma migrate deploy${NC}"
echo "          or ${BLUE}npx prisma migrate dev${NC} (with --name flag)"
