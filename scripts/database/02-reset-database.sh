#!/bin/bash

# ============================================
# Database Reset & Cleanup Script
# ============================================
# WARNING: This script will DELETE all data from the database!
# Usage: bash scripts/database/02-reset-database.sh

set -e

# Configuration
DB_NAME="almere_pickleball"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"

# Colors
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m'

echo -e "${RED}⚠️  WARNING: This script will DELETE ALL database data!${NC}"
echo "Database: $DB_NAME"
echo ""
read -p "Are you sure? Type 'yes' to continue: " -r
echo

if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    echo "❌ Cancelled"
    exit 1
fi

echo -e "${YELLOW}🔄 Resetting database...${NC}"

# Drop and recreate database
psql -h "$DB_HOST" -U postgres << SQL
-- Terminate all connections
SELECT pg_terminate_backend(pg_stat_activity.pid)
FROM pg_stat_activity
WHERE pg_stat_activity.datname = '$DB_NAME'
  AND pid <> pg_backend_pid();

-- Drop database
DROP DATABASE IF EXISTS $DB_NAME;

-- Recreate database
CREATE DATABASE $DB_NAME;

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO pickleballuser;

-- Set default privileges
ALTER DEFAULT PRIVILEGES FOR USER pickleballuser IN SCHEMA public GRANT ALL ON TABLES TO pickleballuser;
ALTER DEFAULT PRIVILEGES FOR USER pickleballuser IN SCHEMA public GRANT ALL ON SEQUENCES TO pickleballuser;
ALTER DEFAULT PRIVILEGES FOR USER pickleballuser IN SCHEMA public GRANT ALL ON FUNCTIONS TO pickleballuser;
SQL

echo -e "${GREEN}✅ Database reset complete${NC}"
echo ""
echo "Next steps:"
echo "1. Run: npx prisma migrate deploy"
echo "2. Run: npm run seed (optional)"
