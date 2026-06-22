# Trial Lesson System - Complete Implementation Guide

## ✅ System Overview

Fully implemented **Trial Lesson (Proeflessen)** system for Almere Pickleball. New players can:
- Sign up for 3 free trial lessons
- Book lesson dates within 2 weeks
- Complete lessons with admin check-in
- Convert to paid membership or decline with feedback

---

## 📋 Architecture

### Database (PostgreSQL + Prisma)

**New Models:**
- `TrialLesson` - Scheduled lessons with status tracking
- `Member` - Extended with trial-related fields

**New Enums:**
- `AccountType`: TRIAL, MEMBER, TRIAL_EXPIRED, ADMIN
- `LessonStatus`: SCHEDULED, COMPLETED, CANCELLED, NO_SHOW

**Trial Fields on Member:**
```typescript
trialStartDate      DateTime?   // When trial started
trialEndDate        DateTime?   // When trial expires (30 days)
trialLessonsUsed    Int         // 0-3 lessons booked
accountType         AccountType // TRIAL | MEMBER | TRIAL_EXPIRED | ADMIN
conversionDate      DateTime?   // When converted to member
stopReason          String?     // Why they declined
stopFeedback        String?     // Feedback text
isTrialExpired      Boolean     // Flag for UI
```

**Migration:** `20260123002426_add_trial_lessons_system`

---

## 🔧 Backend Implementation

### API Endpoints

**Public Endpoints:**
- `POST /trial-lessons/signup` - New user trial signup
  - Takes: firstName, lastName, email, phone, dateOfBirth, password, passwordConfirm
  - Returns: User data with trial start date
  - Validation: Email uniqueness, 8+ char password, blocks 1-year if expired

**Protected User Endpoints:**
- `GET /trial-lessons/my-lessons` - List user's trial lessons
- `GET /trial-lessons/my-status` - Trial status & countdown
- `POST /trial-lessons/book-dates` - Book 3 lesson dates (2-week window)
- `PUT /trial-lessons/:lessonId/reschedule` - Reschedule (24h cutoff)
- `POST /trial-lessons/convert-to-member` - Accept membership
- `POST /trial-lessons/decline-membership` - Decline with reason/feedback

**Protected Admin Endpoints:**
- `GET /trial-lessons/admin/all` - All trial members (with filters)
- `GET /trial-lessons/admin/:memberId` - Trial member details
- `PUT /trial-lessons/admin/:lessonId/mark-completed` - Check-in lesson
- `GET /trial-lessons/admin/stats/overview` - Statistics dashboard

### Service Layer

**File:** `/backend/src/trial-lessons/trial-lessons.service.ts`

Key Methods:
- `signupTrialLesson()` - Create account, set 30-day trial, send welcome email
- `bookTrialDates()` - Validate 3 dates, 2-week window, prevent duplicates
- `getMyStatus()` - Return trial info with countdown & completion flag
- `convertToMember()` - Switch AccountType to MEMBER
- `expireTrial()` - Record decline reason & feedback, set TRIAL_EXPIRED
- Admin methods for managing lessons, statistics, member details

### Email Service

**File:** `/backend/src/common/mail.service.ts`

Three Email Templates:
1. **Welcome Email** - Trial info, deadline, location, what to bring
2. **Lesson Reminder** - 24h before scheduled lesson
3. **Completion Email** - Post-trial membership offer

*Note: Currently logs to console. Configure SMTP provider (SendGrid, AWS SES, etc.) for production.*

### Error Handling
- Duplicate email: `ConflictException`
- Invalid dates: `BadRequestException`
- Unauthorized: `UnauthorizedException`
- Trial expired: Returns flag in status response

---

## 🎨 Frontend Implementation

### Components Created

#### 1. Trial Signup Page
**File:** `/frontend/src/pages/TrialSignup.tsx`

Features:
- 7-field form: firstName, lastName, email, phone, dateOfBirth, password, confirmPassword
- Real-time validation with error messages
- Terms & privacy policy checkboxes
- Success modal with 3-second auto-redirect to login
- Pre-fills email on login page via navigation state

#### 2. Trial Dashboard
**File:** `/frontend/src/pages/TrialDashboard.tsx`

Features:
- **Header:** Member name, countdown timer (days remaining)
- **Status Cards:** Booked lessons, completed count, status (🟢 Active/🔴 Expired)
- **3 Tabs:**
  1. **Overview:** Trial info, next steps, location details (Sporthal Almere, Bataviaplein 60)
  2. **Book Dates:** 3 date inputs with 2-week window validation
  3. **Lessons:** List of booked lessons with status badges (SCHEDULED, COMPLETED)
- **Completion Modal:** Non-dismissable when trial ends
  - Convert → Redirects to membership page
  - Decline → Shows feedback form (reason dropdown + text area) → Logout & redirect home

### API Client
**File:** `/frontend/src/lib/trialApi.ts`

12 Methods:
- Public: `signup(data)`
- User: `getMyLessons()`, `getMyStatus()`, `bookDates(dates)`, `rescheduleLesson(id, date)`, `convertToMember()`, `declineMembership(reason, feedback)`
- Admin: `getAllTrialMembers(filters)`, `getTrialMemberDetails(memberId)`, `markLessonCompleted(lessonId, notes)`, `getTrialStats()`

### Routing
**Updated:** `/frontend/src/App.tsx`

New Routes:
- `GET /trial-signup` - Public signup page
- `GET /trial-dashboard` - Protected trial dashboard

### Login Integration
**Updated:** `/frontend/src/pages/Login.tsx`

Logic:
- After successful login, checks `user.accountType`
- TRIAL → Redirects to `/trial-dashboard`
- MEMBER/ADMIN → Redirects to `/dashboard`

---

## 🚀 Feature Walkthrough

### User Flow: Sign Up → Complete → Convert

1. **Sign Up**
   - Visit `/trial-signup`
   - Fill 7-field form with validation
   - Success modal → Auto-redirect to login
   - Email receives welcome message

2. **Login & Dashboard**
   - Login with trial account
   - Redirected to `/trial-dashboard`
   - Sees "Geboekte lessen: 0/3" and "Status: 🟢 Actief"

3. **Book Dates**
   - Click "Datums Selecteren"
   - Pick 3 dates within 2 weeks
   - Submit → Dates locked in
   - Lesson reminders sent 24h before

4. **Complete Lessons**
   - Admin marks lessons as COMPLETED at check-in
   - Dashboard updates count

5. **Conversion or Decline**
   - When trial ends (30 days), non-dismissable modal appears
   - **Convert:** Button redirects to membership pricing
   - **Decline:** Dropdown reason (Too expensive, No time, Sport not for me, Too far away, Other) + optional feedback
   - Submission sets AccountType to TRIAL_EXPIRED, logs user out, redirects home

### Admin Flow: Manage Trials

*Admin dashboard component still to be built, but endpoints ready:*

- View all trial members with filters
- See lesson details & status
- Mark lessons as completed
- View statistics (signups this month, conversion rate, etc.)

---

## 📝 Database Queries Reference

### Validate email not in use for past year
```sql
SELECT * FROM "Member" 
WHERE email = $1 
AND "trialEndDate" > NOW()
```

### Get trial member details
```sql
SELECT * FROM "Member" WHERE id = $id AND "accountType" = 'TRIAL'
```

### Book 3 lessons
```sql
INSERT INTO "TrialLesson" (memberId, scheduledDate, scheduledTime, status)
VALUES ($memberId, $date1, '18:00', 'SCHEDULED'),
       ($memberId, $date2, '18:00', 'SCHEDULED'),
       ($memberId, $date3, '18:00', 'SCHEDULED')
```

---

## ⚙️ Environment Setup

### Backend
```bash
cd backend
npm install
npm run start  # Runs on http://localhost:3000
```

### Frontend
```bash
cd frontend
npm install
npm run dev    # Runs on http://localhost:5174
```

### Database
```bash
cd backend
npx prisma migrate deploy    # Apply migration
npx prisma db seed           # Optional: seed test data
```

---

## 🔐 Authentication & Authorization

- **Public:** Sign up page accessible without login
- **Protected:** Trial dashboard requires JWT token in Authorization header
- **Admin:** Admin endpoints check for admin role in token

---

## ✨ Key Features Implemented

✅ **1-Year Blocking** - If trial expired, can't sign up again for 1 year  
✅ **2-Week Booking Window** - Lessons must be within 2 weeks of trial start  
✅ **3-Lesson Limit** - Exactly 3 free lessons per trial  
✅ **30-Day Trial Period** - Automatic expiry triggers completion modal  
✅ **Email Service** - Welcome, reminders, completion (console logs ready)  
✅ **Feedback Collection** - Decline reasons & optional feedback captured  
✅ **Admin Check-In** - Mark lessons completed with optional notes  
✅ **Conversion Tracking** - Record date when user upgrades to member  
✅ **Real-Time Countdown** - Shows days remaining on dashboard  
✅ **Status Transitions** - TRIAL → MEMBER (convert) or TRIAL → TRIAL_EXPIRED (decline)  

---

## 📱 UI/UX Highlights

- **Green Almere Pickleball Branding** - Consistent colors across signup & dashboard
- **Real-Time Validation** - Error messages appear as user types
- **Responsive Design** - Mobile-first with Tailwind CSS
- **Modal-Driven Flows** - Success/completion modals for key actions
- **Dutch Language** - All text in Dutch (where applicable)
- **Countdown Timer** - Visual indicator of trial expiry
- **Tab Navigation** - Organized dashboard with Overview/Dates/Lessons tabs

---

## 🐛 Known Issues / Pending

1. **Email Sending** - Currently logs to console. Add SMTP config:
   - Option A: SendGrid API
   - Option B: AWS SES
   - Option C: Local Mailhog (dev)

2. **Admin Dashboard** - Frontend component not yet built
   - Table design with all trial members
   - Filters by status, date range
   - Detail view & action buttons
   - Statistics charts

3. **SMS Reminders** - Optional enhancement (Twilio integration)

4. **End-to-End Testing** - Test full signup → date booking → conversion flow

---

## 🔄 Next Steps

1. **Email Configuration**
   ```bash
   # .env.local in backend
   SMTP_HOST=your-provider.com
   SMTP_PORT=587
   SMTP_USER=your-email@domain.com
   SMTP_PASS=your-password
   ```

2. **Admin Dashboard**
   - Create `/frontend/src/pages/AdminTrialDashboard.tsx`
   - Add admin route `/admin/trials`
   - Display trial members table with filters

3. **Testing**
   - Test signup → validation errors
   - Test booking dates within 2-week window
   - Test completion modal appearance
   - Test convert → membership page
   - Test decline → feedback form → logout

4. **Production Checklist**
   - [ ] SMTP provider configured
   - [ ] Admin dashboard built
   - [ ] Trial system tested end-to-end
   - [ ] Email templates styled & approved
   - [ ] Analytics tracking added (optional)

---

## 📞 Support

For issues or questions:
1. Check backend logs: `npm run start` output
2. Check browser console: F12 Developer Tools
3. Check database: `npx prisma studio`
4. Review API responses in Network tab

---

**Last Updated:** January 23, 2025  
**Status:** 🟢 Ready for Testing
