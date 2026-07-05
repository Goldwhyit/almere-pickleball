import axios from 'axios';

const api = axios.create({
  baseURL: ((import.meta.env.VITE_API_URL as string | undefined)?.trim() || (typeof window !== 'undefined' ? '/api' : 'http://localhost:3000/api')).replace(/\/$/, ''),
});

export const trialApi = {
  /**
   * Public: Sign up for trial lessons
   */
  signup: async (data: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    password: string;
    agreedToTerms: boolean;
  }) => {
    const response = await api.post('/trial-lessons/signup', data);
    return response.data;
  },

  /**
   * Get my trial lessons
   */
  getMyLessons: async (token: string) => {
    const response = await api.get('/trial-lessons/my-lessons', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  /**
   * Get my trial status
   */
  getMyStatus: async (token: string) => {
    const response = await api.get('/trial-lessons/my-status', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  /**
   * Book 3 trial dates
   */
  bookDates: async (token: string, dates: string[]) => {
    const response = await api.post(
      '/trial-lessons/book-dates',
      { dates },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },

  /**
   * Reschedule a trial lesson
   */
  rescheduleLesson: async (token: string, lessonId: string, newDate: string) => {
    const response = await api.put(
      `/trial-lessons/${lessonId}/reschedule`,
      { newDate },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },

  /**
   * Convert to paid member
   */
  convertToMember: async (token: string, membershipPlan: string) => {
    const response = await api.post(
      '/trial-lessons/convert-to-member',
      { membershipPlan },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },

  /**
   * Decline membership
   */
  declineMembership: async (token: string, reason: string, feedback: string) => {
    const response = await api.post(
      '/trial-lessons/decline-membership',
      { reason, feedback },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },

  // ============================================
  // ADMIN ENDPOINTS
  // ============================================

  /**
   * Admin: Get all trial members
   */
  getAllTrialMembers: async (
    token: string,
    filters?: { status?: string; startDate?: string; endDate?: string }
  ) => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);

    const response = await api.get(`/trial-lessons/admin/all?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  /**
   * Admin: Get trial member details
   */
  getTrialMemberDetails: async (token: string, memberId: string) => {
    const response = await api.get(`/trial-lessons/admin/${memberId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  /**
   * Admin: Mark lesson as completed
   */
  markLessonCompleted: async (token: string, lessonId: string) => {
    const response = await api.put(
      `/trial-lessons/admin/${lessonId}/mark-completed`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },

  /**
   * Admin: Get trial statistics
   */
  getTrialStats: async (token: string) => {
    const response = await api.get('/trial-lessons/admin/stats/overview', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
};
