# Admin Trial Dashboard - Implementation Blueprint

## 📋 Overview

The Admin Trial Dashboard allows administrators to manage trial memberships, view statistics, and take action on trial lessons. This component is **still to be built** but the backend API is 100% ready.

---

## 🎯 Feature Requirements

### Page Layout
```
Header: "Proefles Management"
  ├─ Statistics Cards (top)
  │  ├─ Total Trial Members (This Month)
  │  ├─ Completed Lessons (This Month)
  │  ├─ Conversion Rate (%)
  │  └─ Scheduled for Next 7 Days
  │
  ├─ Filters & Search (top-right)
  │  ├─ Status Filter (Active, Completed, Expired)
  │  ├─ Date Range Picker
  │  ├─ Search by Name/Email
  │  └─ "Export CSV" button
  │
  └─ Trial Members Table
     ├─ Columns: Naam, Email, Telefoon, Aanvraag Datum, Status, Lessen (0/3), Actions
     ├─ Sortable headers
     ├─ Pagination (25 per page)
     ├─ Expandable rows with details
     └─ Bulk actions (Extend Trial, Send Reminder)
```

---

## 🔧 Backend API (Ready to Use)

All endpoints available in `trialApi.ts`:

### Get All Trial Members
```typescript
const response = await trialApi.getAllTrialMembers({
  status?: 'TRIAL' | 'TRIAL_EXPIRED',
  startDate?: '2025-01-01',
  endDate?: '2025-01-31',
  limit?: 25,
  offset?: 0
});

// Response:
{
  data: [
    {
      id: 'uuid',
      firstName: 'Jan',
      lastName: 'Jansen',
      email: 'jan@example.com',
      phone: '0612345678',
      trialStartDate: '2025-01-15T00:00:00Z',
      trialEndDate: '2025-02-14T00:00:00Z',
      trialLessonsUsed: 2,
      accountType: 'TRIAL',
      isTrialExpired: false,
      lessons: [
        { id: 'uuid', scheduledDate: '2025-01-20', status: 'COMPLETED' },
        { id: 'uuid', scheduledDate: '2025-01-22', status: 'SCHEDULED' },
        { id: 'uuid', scheduledDate: '2025-01-24', status: 'SCHEDULED' }
      ]
    },
    // ... more members
  ],
  total: 42,
  page: 1
}
```

### Get Trial Member Details
```typescript
const response = await trialApi.getTrialMemberDetails(memberId);

// Response:
{
  id: 'uuid',
  firstName: 'Jan',
  lastName: 'Jansen',
  email: 'jan@example.com',
  phone: '0612345678',
  dateOfBirth: '1990-01-15',
  createdAt: '2025-01-15T10:30:00Z',
  trialStartDate: '2025-01-15T00:00:00Z',
  trialEndDate: '2025-02-14T00:00:00Z',
  trialLessonsUsed: 2,
  accountType: 'TRIAL',
  lessons: [
    {
      id: 'uuid',
      scheduledDate: '2025-01-20T18:00:00Z',
      status: 'COMPLETED',
      checkInTime: '2025-01-20T17:55:00Z',
      notes: 'Good form, ready for courts'
    },
    // ... more lessons
  ]
}
```

### Get Statistics
```typescript
const response = await trialApi.getTrialStats({
  startDate?: '2025-01-01',
  endDate?: '2025-01-31'
});

// Response:
{
  totalTrialMembers: 42,
  completedThisMonth: 8,
  conversionRate: 0.24,  // 24%
  scheduledNextWeek: 15,
  averageLessonsPerMember: 2.3,
  topReasons: [
    { reason: 'Too expensive', count: 5 },
    { reason: 'No time', count: 3 },
    // ...
  ]
}
```

### Mark Lesson Completed
```typescript
await trialApi.markLessonCompleted(lessonId, {
  notes: 'Good form, ready for courts'
});

// Response: { success: true, status: 'COMPLETED' }
```

---

## 🎨 Component Structure

### File: `/frontend/src/pages/AdminTrialDashboard.tsx`

```typescript
import React, { useState, useEffect } from 'react';
import { trialApi } from '../lib/trialApi';

interface TrialMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  trialStartDate: string;
  trialEndDate: string;
  trialLessonsUsed: number;
  accountType: 'TRIAL' | 'TRIAL_EXPIRED';
  lessons: Array<{
    id: string;
    scheduledDate: string;
    status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  }>;
}

export default function AdminTrialDashboard() {
  // State
  const [members, setMembers] = useState<TrialMember[]>([]);
  const [stats, setStats] = useState(null);
  const [filters, setFilters] = useState({
    status: 'TRIAL' as 'TRIAL' | 'TRIAL_EXPIRED',
    startDate: '',
    endDate: '',
    searchQuery: '',
  });
  const [loading, setLoading] = useState(false);
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  // Load data
  useEffect(() => {
    fetchData();
  }, [filters, page]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [membersRes, statsRes] = await Promise.all([
        trialApi.getAllTrialMembers({
          status: filters.status,
          startDate: filters.startDate,
          endDate: filters.endDate,
          limit: 25,
          offset: (page - 1) * 25,
        }),
        trialApi.getTrialStats({
          startDate: filters.startDate,
          endDate: filters.endDate,
        }),
      ]);
      
      setMembers(membersRes.data);
      setStats(statsRes);
    } catch (error) {
      console.error('Failed to load trial data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handler: Mark lesson completed
  const handleMarkCompleted = async (lessonId: string) => {
    try {
      await trialApi.markLessonCompleted(lessonId, {
        notes: prompt('Add notes (optional):') || '',
      });
      fetchData(); // Refresh
    } catch (error) {
      console.error('Failed to mark lesson:', error);
    }
  };

  // Handler: Contact member
  const handleContact = (member: TrialMember) => {
    // Open modal with compose email
  };

  // Handler: Export CSV
  const handleExport = () => {
    // Generate CSV from members array
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <h1 className="text-3xl font-bold text-gray-900">Proefles Management</h1>
        <p className="text-gray-600 mt-1">Beheer proefleden, geboekte lessen en conversies</p>
      </div>

      <div className="p-8">
        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-gray-600 text-sm">Trial Members (These Month)</div>
              <div className="text-3xl font-bold text-primary-600">{stats.totalTrialMembers}</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-gray-600 text-sm">Completed Lessons</div>
              <div className="text-3xl font-bold text-green-600">{stats.completedThisMonth}</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-gray-600 text-sm">Conversion Rate</div>
              <div className="text-3xl font-bold text-blue-600">{(stats.conversionRate * 100).toFixed(1)}%</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-gray-600 text-sm">Scheduled Next 7 Days</div>
              <div className="text-3xl font-bold text-purple-600">{stats.scheduledNextWeek}</div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <div className="grid grid-cols-5 gap-4">
            <select
              value={filters.status}
              onChange={(e) => {
                setFilters({ ...filters, status: e.target.value as any });
                setPage(1);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="TRIAL">Active</option>
              <option value="TRIAL_EXPIRED">Completed</option>
            </select>

            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => {
                setFilters({ ...filters, startDate: e.target.value });
                setPage(1);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="Start Date"
            />

            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => {
                setFilters({ ...filters, endDate: e.target.value });
                setPage(1);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="End Date"
            />

            <input
              type="text"
              value={filters.searchQuery}
              onChange={(e) => {
                setFilters({ ...filters, searchQuery: e.target.value });
                setPage(1);
              }}
              placeholder="Search name or email..."
              className="px-3 py-2 border border-gray-300 rounded-lg"
            />

            <button
              onClick={handleExport}
              className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg"
            >
              Export CSV
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Naam</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Telefoon</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Aanvraag Datum</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Lessen</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Acties</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {members.map((member) => (
                <React.Fragment key={member.id}>
                  <tr className="hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedMember(selectedMember === member.id ? null : member.id)}>
                    <td className="px-6 py-4 text-sm">{member.firstName} {member.lastName}</td>
                    <td className="px-6 py-4 text-sm">{member.email}</td>
                    <td className="px-6 py-4 text-sm">{member.phone}</td>
                    <td className="px-6 py-4 text-sm">{new Date(member.trialStartDate).toLocaleDateString('nl-NL')}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${member.accountType === 'TRIAL' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {member.accountType === 'TRIAL' ? '🟢 Actief' : '🔴 Afgelopen'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">{member.trialLessonsUsed}/3</td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleContact(member);
                        }}
                        className="text-primary-600 hover:text-primary-800 mr-4"
                      >
                        Contact
                      </button>
                    </td>
                  </tr>

                  {/* Expandable Details */}
                  {selectedMember === member.id && (
                    <tr className="bg-gray-50">
                      <td colSpan={7} className="px-6 py-4">
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <div className="text-sm text-gray-600">Trial Start</div>
                              <div className="font-semibold">{new Date(member.trialStartDate).toLocaleDateString('nl-NL')}</div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-600">Trial End</div>
                              <div className="font-semibold">{new Date(member.trialEndDate).toLocaleDateString('nl-NL')}</div>
                            </div>
                          </div>

                          {/* Lessons List */}
                          <div>
                            <h4 className="font-semibold text-sm mb-2">Geboekte Lessen</h4>
                            <div className="space-y-2">
                              {member.lessons.map((lesson) => (
                                <div key={lesson.id} className="flex justify-between items-center bg-white p-3 rounded border border-gray-200">
                                  <div>
                                    <div className="text-sm">{new Date(lesson.scheduledDate).toLocaleDateString('nl-NL')}</div>
                                    <div className={`text-xs px-2 py-1 rounded mt-1 ${lesson.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                                      {lesson.status === 'COMPLETED' ? '✅ Voltooid' : '🟢 Gepland'}
                                    </div>
                                  </div>
                                  {lesson.status === 'SCHEDULED' && (
                                    <button
                                      onClick={() => handleMarkCompleted(lesson.id)}
                                      className="bg-primary-500 hover:bg-primary-600 text-white text-xs px-3 py-1 rounded"
                                    >
                                      Mark Complete
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-6 flex justify-center gap-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-4 py-2">Page {page}</span>
          <button
            onClick={() => setPage(page + 1)}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

## 🔌 Integration Steps

1. **Create Component**
   - Save code above to `/frontend/src/pages/AdminTrialDashboard.tsx`

2. **Add Import to App.tsx**
   ```typescript
   import AdminTrialDashboard from './pages/AdminTrialDashboard';
   ```

3. **Add Route to App.tsx**
   ```typescript
   <Route
     path="/admin/trials"
     element={
       <ProtectedRoute>
         <AdminTrialDashboard />
       </ProtectedRoute>
     }
   />
   ```

4. **Add Navigation Link**
   - Add to navigation/sidebar:
   ```typescript
   <Link to="/admin/trials" className="...">Proefles Management</Link>
   ```

5. **Add Admin Guard (Optional)**
   - Add role check to ProtectedRoute for `/admin/*` paths

---

## 📊 Features Breakdown

| Feature | Status | Notes |
|---------|--------|-------|
| Statistics Cards | To Build | totalTrialMembers, completedThisMonth, conversionRate, scheduledNextWeek |
| Filter by Status | To Build | Active (TRIAL) / Completed (TRIAL_EXPIRED) |
| Date Range Filter | To Build | startDate, endDate inputs |
| Search | To Build | Search by name or email (implement client-side) |
| Trial Members Table | To Build | 25 per page with pagination |
| Expandable Row Details | To Build | Show lessons with actions |
| Mark Lesson Completed | To Build | Click button to mark lesson as COMPLETED |
| Contact Member | To Build | Open modal to send email |
| Export CSV | To Build | Download all members as CSV |
| Responsive Design | To Build | Mobile-friendly with Tailwind |
| Error Handling | To Build | Toast notifications for actions |

---

## 🎯 UI/UX Design Notes

- **Color Scheme:** Primary green (Almere Pickleball), status colors (green=active, red=expired)
- **Icons:** 🟢 for active, 🔴 for expired, ✅ for completed, 📧 for contact
- **Spacing:** Consistent 6-8px padding, 24px margins
- **Responsiveness:** Table should scroll horizontally on mobile
- **Accessibility:** Proper labels, ARIA attributes, keyboard navigation

---

## 🔐 Security Notes

- All endpoints require admin authentication (check JWT token)
- Admin can only see trial-related data (no member financial info)
- Contact email should use secure template to prevent info disclosure
- Export CSV should not include sensitive fields (password hash, payment info)

---

## ✅ Testing Checklist

- [ ] Load trial members list with pagination
- [ ] Filter by status (Active/Expired)
- [ ] Filter by date range
- [ ] Search by name
- [ ] Expand row to see lesson details
- [ ] Mark lesson as completed
- [ ] Contact member (open email modal)
- [ ] Export to CSV
- [ ] Statistics cards show correct counts
- [ ] Responsive on mobile/tablet

---

## 📝 Notes

- **Backend:** 100% ready, no changes needed
- **API Client:** 100% ready, no changes needed
- **Frontend:** This component is the only missing piece for admin functionality
- **Estimated Time:** 2-3 hours to build and test

---

**Ready to build!** Use the code above as a starting point and customize styling/layout as needed.
