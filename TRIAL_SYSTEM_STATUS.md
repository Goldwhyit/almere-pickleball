# Almere Pickleball Trial Lesson System - Implementation Status

## ✅ COMPLETED (Backend)

### 1. Database Schema
- Added trial lesson fields to Member model:
  - `accountType` (TRIAL, MEMBER, TRIAL_EXPIRED, ADMIN)
  - `trialStartDate`, `trialEndDate`
  - `trialLessonsUsed`, `conversionDate`
  - `stopReason`, `stopFeedback`, `isTrialExpired`

- Created TrialLesson model with fields:
  - `memberId`, `scheduledDate`, `scheduledTime`
  - `status` (SCHEDULED, COMPLETED, CANCELLED, NO_SHOW)
  - `checkInTime`, `notes`

- Added enums:
  - `AccountType`: TRIAL, MEMBER, TRIAL_EXPIRED, ADMIN
  - `LessonStatus`: SCHEDULED, COMPLETED, CANCELLED, NO_SHOW

### 2. Backend API Endpoints (Trial Lessons Service)

**Public Endpoints:**
- `POST /trial-lessons/signup` - Register new trial user
  - Validates email uniqueness
  - Checks 1-year trial expiry blocking
  - Creates User + Member + sends welcome email

**Protected User Endpoints:**
- `GET /trial-lessons/my-lessons` - Get user's booked lessons
- `GET /trial-lessons/my-status` - Get trial status and completion info
- `POST /trial-lessons/book-dates` - Book 3 trial dates (validation included)
- `PUT /trial-lessons/:lessonId/reschedule` - Reschedule (24h before only)
- `POST /trial-lessons/convert-to-member` - Convert to paid member
- `POST /trial-lessons/decline-membership` - Decline & expire trial

**Protected Admin Endpoints:**
- `GET /trial-lessons/admin/all` - Get all trial members (with filters)
- `GET /trial-lessons/admin/:memberId` - Get trial member details
- `PUT /trial-lessons/admin/:lessonId/mark-completed` - Mark lesson done
- `GET /trial-lessons/admin/stats/overview` - Trial statistics

### 3. Email Service
Added email templates to MailService:
- `sendTrialWelcomeEmail()` - Welcome with trial info & deadline
- `sendTrialLessonReminder()` - 24h before lesson reminders
- `sendTrialCompletedEmail()` - Post-trial membership prompt

### 4. Business Logic Implemented
- ✓ 2-week trial window validation
- ✓ 1-year re-signup blocking per email
- ✓ 3 lesson maximum enforcement
- ✓ Automatic account type management
- ✓ Conversion & expiry tracking
- ✓ Admin statistics (conversion rate, stop reasons, etc.)

---

## 📋 TODO - Frontend Implementation

### Priority 1: Core User Flow

**1. Trial Signup Page** (`/trial-signup`)
- Form fields: firstName, lastName, email, phone, dateOfBirth, password
- Terms checkbox
- Success modal with login redirect

**2. Trial Dashboard** (`/trial-dashboard` - after login if TRIAL account)
- Welcome screen with:
  - 3-lesson overview
  - 2-week deadline countdown
  - Calendar date picker
- Date selection UI (only within 2 weeks, no conflicts)
- Lesson list with reschedule buttons (24h limit)
- Completion modal trigger (automatic at login when trial ends)

**3. Trial Completion Modal** (Appears when trial_end_date passed)
- Non-dismissible modal asking "Hoe beviel pickleball?"
- Two buttons:
  - "Ik wil lid worden!" → Redirect to `/memberships` page
  - "Ik stop voorlopig" → Show feedback form
- Feedback form captures:
  - Stop reason (dropdown: Te duur, Geen tijd, Sport bevalt niet, Te ver weg, Anders)
  - Optional feedback text
  - Calls `POST /trial-lessons/decline-membership`

### Priority 2: Admin Dashboard

**Admin Trial Management Tab**
- Table of trial members with columns:
  - Naam, Email, Telefoonnummer, Aanvraag datum, Status
  - Geboekte lessen (0/3, 1/3, 2/3, 3/3)
  - Actions buttons
- Filters: Status, Date range, No dates booked, Lessons this week
- Expandable row showing:
  - Timeline (signup → selected dates → completed dates)
  - Check-in status per lesson
  - Conversie decision + feedback
- Admin actions:
  - Edit dates
  - Mark lesson complete
  - Extend trial (1 week)
  - Contact (email template)
  - Delete account
  - Convert to member

**Statistics Dashboard:**
- Cards: Total signups (month/total), Conversion rate, Avg conversion time
- Chart: Signups vs conversions per month
- Top stop reasons (bar chart)

### Priority 3: Integration

**Update Login Flow:**
- After login, check `member.accountType`
- If TRIAL → redirect to `/trial-dashboard`
- If TRIAL && trialEndDate passed → show completion modal
- If MEMBER → redirect to regular `/dashboard`

**Update App Routes:**
- `<Route path="/trial-signup" element={<TrialSignup />} />`
- `<Route path="/trial-dashboard" element={<TrialDashboard />} />`
- `<Route path="/admin/trials" element={<AdminTrialDashboard />} />`

**API Integration in Frontend:**
Create `lib/trialApi.ts` with functions:
```typescript
export const trialApi = {
  signup: (data) => POST /trial-lessons/signup
  getMyLessons: () => GET /trial-lessons/my-lessons
  getStatus: () => GET /trial-lessons/my-status
  bookDates: (dates) => POST /trial-lessons/book-dates
  rescheduleLesson: (lessonId, date) => PUT /trial-lessons/:id/reschedule
  convertToMember: (plan) => POST /trial-lessons/convert-to-member
  declineMembership: (reason, feedback) => POST /trial-lessons/decline-membership
  
  // Admin
  getAllTrialMembers: (filters) => GET /trial-lessons/admin/all
  getTrialMemberDetails: (id) => GET /trial-lessons/admin/:id
  markLessonCompleted: (lessonId) => PUT /trial-lessons/admin/:id/mark-completed
  getTrialStats: () => GET /trial-lessons/admin/stats/overview
}
```

---

## 🔧 Configuration Needed

**Environment Variables** (if using real email):
```
SMTP_HOST=...
SMTP_PORT=...
SMTP_USER=...
SMTP_PASSWORD=...
EMAIL_FROM=info@almere-pickleball.nl
VITE_API_URL=http://localhost:3000/api
```

**Frontend Constants** (create `src/constants/trial.ts`):
```typescript
export const TRIAL_DURATION_DAYS = 14;
export const TRIAL_LESSONS_COUNT = 3;
export const LESSON_DEFAULT_TIME = '18:00';
export const LESSON_RESCHEDULE_HOURS_BEFORE = 24;
export const TRIAL_EXPIRY_BLOCKING_DAYS = 365;
```

---

## 📊 Database Migrations Applied

✅ `20260123002426_add_trial_lessons_system`
- Added AccountType enum
- Added LessonStatus enum  
- Added trial fields to members table
- Created trial_lessons table
- Created indexes for performance

---

## 🧪 Testing Checklist

- [ ] POST /trial-lessons/signup with valid data
- [ ] POST /trial-lessons/signup with duplicate email
- [ ] POST /trial-lessons/signup after expired trial (1 year)
- [ ] Book 3 dates within 2 weeks
- [ ] Attempt to book date outside 2 weeks (should fail)
- [ ] Reschedule lesson (within 24h cutoff)
- [ ] Reschedule within 24h (should fail)
- [ ] Mark lesson as completed (admin)
- [ ] Trial completion modal appears at login
- [ ] Convert to member flow
- [ ] Decline membership + feedback flow
- [ ] Admin statistics calculations
- [ ] Email sending (check console logs)

---

## 🎯 Next Steps

1. Create frontend signup component (`src/components/TrialSignup.tsx`)
2. Create trial dashboard component (`src/pages/TrialDashboard.tsx`)
3. Create admin trial management component
4. Update Login.tsx routing logic
5. Add trial API client (`src/lib/trialApi.ts`)
6. Test complete signup → booking → completion flow
7. Implement real email sending (configure SMTP)
8. Add SMS reminders (optional, Twilio integration)

---

## 💡 Notes

- All endpoints are JWT-protected (except signup)
- Admin endpoints need role verification (add in controller)
- Email sending currently logs to console (ready for SMTP/SendGrid)
- Trial member account transitions:
  - TRIAL → MEMBER (on conversion)
  - TRIAL → TRIAL_EXPIRED (on decline)
  - TRIAL_EXPIRED blocks re-signup for 1 year
