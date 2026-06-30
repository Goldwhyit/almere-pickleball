#!/bin/bash

# ============================================
# Database Seed Script
# ============================================
# This script populates the database with sample data
# Usage: bash scripts/database/03-seed-database.sh

set -e

DB_NAME="almere_pickleball"
DB_USER="pickleballuser"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"

GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🌱 Seeding database with test data...${NC}\n"

PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" << 'SQL'

-- ============================================
-- Test Users
-- ============================================

INSERT INTO users (id, email, password, role, is_active, email_verified, created_at, updated_at) VALUES
('user_admin_001', 'admin@almere-pickleball.nl', '$2b$10$YjAwEjuA3Sxq6X7QzZ5Q.eCw1H8fY0nK2L5M9P0R6S3T4U5V6W', 'ADMIN', true, true, NOW(), NOW()),
('user_organizer_001', 'organizer@almere-pickleball.nl', '$2b$10$YjAwEjuA3Sxq6X7QzZ5Q.eCw1H8fY0nK2L5M9P0R6S3T4U5V6W', 'ORGANIZER', true, true, NOW(), NOW()),
('user_member_001', 'piet@example.nl', '$2b$10$YjAwEjuA3Sxq6X7QzZ5Q.eCw1H8fY0nK2L5M9P0R6S3T4U5V6W', 'MEMBER', true, true, NOW(), NOW()),
('user_member_002', 'maria@example.nl', '$2b$10$YjAwEjuA3Sxq6X7QzZ5Q.eCw1H8fY0nK2L5M9P0R6S3T4U5V6W', 'MEMBER', true, true, NOW(), NOW()),
('user_member_003', 'jan@example.nl', '$2b$10$YjAwEjuA3Sxq6X7QzZ5Q.eCw1H8fY0nK2L5M9P0R6S3T4U5V6W', 'MEMBER', true, true, NOW(), NOW()),
('user_trial_001', 'trial@example.nl', '$2b$10$YjAwEjuA3Sxq6X7QzZ5Q.eCw1H8fY0nK2L5M9P0R6S3T4U5V6W', 'MEMBER', true, true, NOW(), NOW());

-- ============================================
-- Test Members
-- ============================================

INSERT INTO members (id, user_id, first_name, last_name, phone, date_of_birth, account_type, membership_status, membership_plan, created_at, updated_at) VALUES
('mem_admin_001', 'user_admin_001', 'Admin', 'User', '+31612345678', '1990-01-15', 'ADMIN', 'ACTIVE', 'YEARLY', NOW(), NOW()),
('mem_organizer_001', 'user_organizer_001', 'Organizer', 'User', '+31612345679', '1985-06-20', 'MEMBER', 'ACTIVE', 'YEARLY', NOW(), NOW()),
('mem_member_001', 'user_member_001', 'Piet', 'Jansen', '+31612345680', '1992-03-10', 'MEMBER', 'ACTIVE', 'MONTHLY', NOW(), NOW()),
('mem_member_002', 'user_member_002', 'Maria', 'de Vries', '+31612345681', '1995-07-22', 'MEMBER', 'ACTIVE', 'MONTHLY', NOW(), NOW()),
('mem_member_003', 'user_member_003', 'Jan', 'Pieterse', '+31612345682', '1988-11-05', 'MEMBER', 'ACTIVE', 'PER_SESSION', NOW(), NOW()),
('mem_trial_001', 'user_trial_001', 'Trial', 'Member', '+31612345683', '2000-05-15', 'TRIAL', 'ACTIVE', 'PER_SESSION', NOW(), NOW());

-- ============================================
-- Update trial member specific fields
-- ============================================

UPDATE members SET 
  trial_start_date = NOW(),
  trial_end_date = NOW() + INTERVAL '30 days',
  trial_lessons_booked = 0,
  trial_lessons_completed = 0,
  trial_status = 'ACTIVE'
WHERE account_type = 'TRIAL';

-- ============================================
-- Test Courts
-- ============================================

INSERT INTO courts (id, name, location, is_active, created_at, updated_at) VALUES
('court_001', 'Baan 1', 'Sportcomplex Almere', true, NOW(), NOW()),
('court_002', 'Baan 2', 'Sportcomplex Almere', true, NOW(), NOW()),
('court_003', 'Baan 3', 'Sportcomplex Almere', true, NOW(), NOW()),
('court_004', 'Baan 4', 'Sportcomplex Almere', true, NOW(), NOW());

-- ============================================
-- Test Play Days
-- ============================================

INSERT INTO play_days (id, court_id, scheduled_date, start_time, end_time, max_players, player_count, price, status, description, created_at, updated_at) VALUES
('pd_001', 'court_001', NOW() + INTERVAL '1 day', '19:00', '21:00', 4, 0, 10.00, 'SCHEDULED', 'Maandag avond spelen', NOW(), NOW()),
('pd_002', 'court_002', NOW() + INTERVAL '2 days', '19:00', '21:00', 4, 0, 10.00, 'SCHEDULED', 'Dinsdag avond spelen', NOW(), NOW()),
('pd_003', 'court_003', NOW() + INTERVAL '3 days', '20:00', '22:00', 4, 0, 10.00, 'SCHEDULED', 'Woensdag avond spelen', NOW(), NOW()),
('pd_004', 'court_004', NOW() + INTERVAL '4 days', '19:00', '21:00', 4, 0, 10.00, 'SCHEDULED', 'Donderdag avond spelen', NOW(), NOW());

-- ============================================
-- Test Play Day Registrations
-- ============================================

INSERT INTO play_day_registrations (id, play_day_id, member_id, status, created_at, updated_at) VALUES
('reg_001', 'pd_001', 'mem_member_001', 'REGISTERED', NOW(), NOW()),
('reg_002', 'pd_001', 'mem_member_002', 'REGISTERED', NOW(), NOW()),
('reg_003', 'pd_002', 'mem_member_002', 'REGISTERED', NOW(), NOW()),
('reg_004', 'pd_002', 'mem_member_003', 'REGISTERED', NOW(), NOW());

-- ============================================
-- Test Trial Lessons
-- ============================================

INSERT INTO trial_lessons (id, member_id, scheduled_date, completed, created_at, updated_at) VALUES
('tl_001', 'mem_trial_001', NOW() + INTERVAL '1 week', false, NOW(), NOW()),
('tl_002', 'mem_trial_001', NOW() + INTERVAL '2 weeks', false, NOW(), NOW()),
('tl_003', 'mem_trial_001', NOW() + INTERVAL '3 weeks', false, NOW(), NOW());

-- ============================================
-- Test Tournaments
-- ============================================

INSERT INTO tournaments (id, name, description, format, status, start_date, end_date, location, max_participants, entry_fee, created_by, created_at, updated_at) VALUES
('tour_001', 'Almere Spring Tournament 2024', 'Spring pickleball tournament', 'ROUND_ROBIN', 'DRAFT', NOW() + INTERVAL '30 days', NOW() + INTERVAL '31 days', 'Sportcomplex Almere', 16, 25.00, 'user_organizer_001', NOW(), NOW()),
('tour_002', 'Summer League 2024', 'Recreational summer league', 'SINGLE_ELIMINATION', 'PUBLISHED', NOW() + INTERVAL '60 days', NOW() + INTERVAL '90 days', 'Sportcomplex Almere', 32, 35.00, 'user_organizer_001', NOW(), NOW());

-- ============================================
-- Test Club Updates
-- ============================================

INSERT INTO club_updates (id, title, content, category, published, created_at, updated_at) VALUES
('update_001', 'Welkom bij Almere Pickleball!', 'We zijn erg blij je welkom te heten in onze pickleball club.', 'NEWS', true, NOW(), NOW()),
('update_002', 'Nieuwe banen geopend', 'We hebben twee nieuwe pickleball banen geopend!', 'ANNOUNCEMENT', true, NOW(), NOW()),
('update_003', 'Zomervakantie planning', 'Zomervakantie schema aangepast', 'SCHEDULE', true, NOW(), NOW());

SQL

echo -e "${GREEN}✅ Database seeded successfully!${NC}"
echo ""
echo "Test accounts created:"
echo "  Admin:     admin@almere-pickleball.nl / password123"
echo "  Organizer: organizer@almere-pickleball.nl / password123"
echo "  Member:    piet@example.nl / password123"
echo "  Trial:     trial@example.nl / password123"
