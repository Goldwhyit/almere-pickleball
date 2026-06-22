# Trial Lesson System - Quick Start & Testing Guide

## 🚀 Quick Start

### Start Backend
```bash
cd backend
npm install
npm run start
```
Backend runs on `http://localhost:3000`

### Start Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on `http://localhost:5174`

---

## 📋 Testing Checklist

### Test 1: Public Trial Signup
- [ ] Navigate to `http://localhost:5174/trial-signup`
- [ ] Fill all 7 fields:
  - First Name: `Jan`
  - Last Name: `Jansen`
  - Email: `jan@example.com`
  - Phone: `0612345678`
  - Date of Birth: `1990-01-15`
  - Password: `password123`
  - Confirm Password: `password123`
- [ ] Check Terms checkbox
- [ ] Check Privacy Policy checkbox
- [ ] Click "Inschrijven"
- [ ] See success modal "Je bent ingeschreven!"
- [ ] Auto-redirected to login after 3 seconds
- [ ] Email field pre-filled: `jan@example.com`

**Expected Result:**
- ✅ User created with `accountType: TRIAL`
- ✅ `trialStartDate` set to today
- ✅ `trialEndDate` set to 30 days from now
- ✅ Welcome email logged to console

---

### Test 2: Login as Trial User
- [ ] On login page, email already filled: `jan@example.com`
- [ ] Enter password: `password123`
- [ ] Click "Inloggen"
- [ ] See "Welkom terug!" toast
- [ ] Auto-redirected to `/trial-dashboard` (not `/dashboard`)

**Expected Result:**
- ✅ Redirected to trial dashboard
- ✅ See header with user name "Jan Jansen"
- ✅ See countdown timer (days remaining)

---

### Test 3: Trial Dashboard - Status Overview
- [ ] On trial dashboard, see 3 status cards:
  1. **Geboekte Lessen:** 0/3 (currently booked)
  2. **Voltooid:** 0/3 (completed)
  3. **Status:** 🟢 Actief (still active)
- [ ] Click "Overzicht" tab
- [ ] See trial information:
  - Start date: Today
  - End date: 30 days from now
  - Location: Sporthal Almere, Bataviaplein 60
- [ ] See "Volgende Stappen" guidance

**Expected Result:**
- ✅ All status cards display correctly
- ✅ Countdown timer shows correct days remaining
- ✅ Overview tab shows trial details

---

### Test 4: Trial Dashboard - Book Dates
- [ ] Click "Datums Selecteren" tab
- [ ] See 3 date input fields
- [ ] Pick date 1: Today (or tomorrow)
- [ ] Pick date 2: Tomorrow (or day after)
- [ ] Pick date 3: Day after tomorrow
- [ ] All dates should be within 2 weeks
- [ ] Click "Datums Opslaan"
- [ ] See confirmation: "Gelukt! 3 lessen geboekt"

**Expected Result:**
- ✅ 3 dates saved in database as TrialLessons
- ✅ "Geboekte Lessen" card now shows "3/3"
- ✅ Lesson dates appear in "Lessen" tab
- ✅ Status badges show "🟢 Gepland"

---

### Test 5: Trial Dashboard - Lessons List
- [ ] Click "Lessen" tab
- [ ] See 3 lessons listed with:
  - Scheduled date
  - Status: "🟢 Gepland" (scheduled)
  - Time: 18:00
- [ ] Each lesson shows in a card format

**Expected Result:**
- ✅ All 3 booked lessons appear
- ✅ Status shows correctly
- ✅ Dates match what was booked

---

### Test 6: Invalid Date Booking (Error Cases)
- [ ] Try to book dates > 2 weeks in future
- [ ] Should see error: "Datums moeten binnen 2 weken liggen"
- [ ] Try to book dates in the past
- [ ] Should see error: "Datum kan niet in het verleden liggen"
- [ ] Try to book fewer than 3 dates
- [ ] Should see error: "Selecteer 3 datums"

**Expected Result:**
- ✅ Form validation prevents invalid dates
- ✅ Error messages appear in real-time
- ✅ Submit button disabled if invalid

---

### Test 7: Trial Completion (After 30 Days)
- [ ] Manually update database to set `trialEndDate` to today or yesterday:
  ```bash
  # In database
  UPDATE "Member" SET "trialEndDate" = NOW() - INTERVAL '1 day' WHERE id = $memberId
  ```
- [ ] Refresh `/trial-dashboard`
- [ ] Non-dismissable modal appears with options:
  - "Wil je een lid worden?" (Convert)
  - "Nee, dank je wel" (Decline)

**Expected Result:**
- ✅ Modal appears and cannot be closed
- ✅ User must choose convert or decline

---

### Test 8: Convert to Member
- [ ] On completion modal, click "Wil je een lid worden?"
- [ ] Redirected to `/word-lid` (membership page)
- [ ] Complete membership purchase flow
- [ ] After payment, user should have `accountType: MEMBER`
- [ ] Next login redirects to `/dashboard` not `/trial-dashboard`

**Expected Result:**
- ✅ User converted to MEMBER account type
- ✅ Next login shows main dashboard
- ✅ Trial fields preserved for reference

---

### Test 9: Decline Membership
- [ ] Manually reset trial again
- [ ] On completion modal, click "Nee, dank je wel"
- [ ] Feedback form appears with:
  - Dropdown: "Waarom wil je niet doorgaan?"
  - Options: Too expensive, No time, Sport not for me, Too far away, Other
  - Text area: Optional feedback
- [ ] Select reason, add feedback, click "Versturen"
- [ ] Logged out and redirected to home

**Expected Result:**
- ✅ `accountType` changed to TRIAL_EXPIRED
- ✅ `stopReason` and `stopFeedback` saved
- ✅ User logged out
- ✅ Redirect to home page

---

### Test 10: Admin Check-In (Backend Only)
- [ ] Use API client to mark lesson as completed:
  ```bash
  curl -X PUT http://localhost:3000/api/trial-lessons/admin/{lessonId}/mark-completed \
    -H "Authorization: Bearer {adminToken}" \
    -H "Content-Type: application/json" \
    -d '{"notes": "Good form, ready for real courts"}'
  ```
- [ ] Check database: `LessonStatus` should be COMPLETED
- [ ] Dashboard "Voltooid" card increments

**Expected Result:**
- ✅ Lesson marked as completed in database
- ✅ Status changes from SCHEDULED to COMPLETED
- ✅ Dashboard updates with completion count

---

## 🔧 Debugging

### Check Backend Logs
```bash
# Terminal 1: Backend running
npm run start
```
Watch for logs:
- `✅ TrialLessonService initialized`
- `📧 Email sent: Welcome to trial`
- `🟢 Trial member created: jan@example.com`

### Check Frontend Logs
```bash
# Browser console (F12)
```
Watch for:
- API request logs (trialApi calls)
- Redirect logs (account type check at login)
- Component mount logs

### Check Database
```bash
cd backend
npx prisma studio
```
Browse tables:
- **User** - Check `email`, `accountType`
- **Member** - Check `trialStartDate`, `trialEndDate`, `trialLessonsUsed`, `accountType`
- **TrialLesson** - Check `memberId`, `scheduledDate`, `status`

---

## 📧 Email Testing

All emails currently log to backend console. Example:
```
📧 WELCOME EMAIL SENT TO jan@example.com:
From: noreply@almere-pickleball.nl
Subject: Welkom bij Almere Pickleball!
Body: [HTML template with trial info]
```

For production, configure SMTP:
```bash
# .env in backend
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@almere-pickleball.nl
```

---

## 🚨 Common Issues

### Issue: "Email already in use"
**Cause:** User signed up before, trial expired < 1 year ago  
**Fix:** Use different email or wait 1 year

### Issue: Trial dashboard doesn't load
**Cause:** User not authenticated  
**Fix:** Login first, check localStorage for token

### Issue: Dates won't save
**Cause:** Dates outside 2-week window  
**Fix:** Pick dates within 14 days from today

### Issue: No success modal after signup
**Cause:** Email validation failed  
**Fix:** Use format: `user@domain.com`

### Issue: Doesn't redirect to trial dashboard
**Cause:** `accountType` not set on user object  
**Fix:** Check database, ensure migration was applied

---

## 📊 Database State After Tests

After completing all tests, database should have:
- ✅ 1 User with email `jan@example.com`
- ✅ 1 Member with `accountType: TRIAL_EXPIRED`, `stopReason: "Too expensive"`, `stopFeedback: "..."`
- ✅ 3 TrialLessons with status: 1 COMPLETED, 2 CANCELLED
- ✅ Email logs in backend console

---

## ✅ Success Criteria

All tests passing means:
- ✅ Users can signup for trials
- ✅ Trial users redirected to correct dashboard
- ✅ Lesson booking with date validation works
- ✅ Completion flow with modal appears
- ✅ Conversion to member or decline flows work
- ✅ Feedback captured when declining
- ✅ Admin can mark lessons completed
- ✅ All 3 email templates ready (console logs)

---

## 📝 Notes

- **Trial Duration:** 30 days from signup
- **Lesson Limit:** Exactly 3 lessons
- **Booking Window:** Must be within 2 weeks
- **Reschedule:** Available until 24h before lesson
- **Auto-Conversion:** Trial user auto-redirected to trial dashboard at login
- **Email:** Currently console logs only (SMTP needed for production)

---

**Ready to Test!** 🎉

Start with Test 1 and work through sequentially. Each test validates a different part of the system.
