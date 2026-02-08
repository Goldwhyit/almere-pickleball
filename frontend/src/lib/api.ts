import axios from "axios";

const API_URL =
  (import.meta.env.VITE_API_URL as string) || "http://localhost:3000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests (skip for public/auth endpoints)
api.interceptors.request.use((config) => {
  const url = config.url ?? "";
  const isAuthFree =
    url.includes("/auth/login") ||
    url.includes("/trial-lessons/signup") ||
    url.includes("/memberships/types");

  if (!isAuthFree) {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("✅ Token added to request:", url);
    } else {
      console.warn("⚠️ No token found for request:", url);
    }
  }
  return config;
});

// Add response error interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error("❌ 401 Unauthorized - token invalid or expired");
      console.error("Response:", error.response.data);
    } else if (error.response?.status === 403) {
      console.error("❌ 403 Forbidden - no permission");
    }
    return Promise.reject(error);
  },
);

export const authApi = {
  login: (email: string, password: string) =>
    api.post("/auth/login", { email: email.trim().toLowerCase(), password }),
};

export const trialApi = {
  // Public endpoints
  signup: (data: any) => api.post("/trial-lessons/signup", data),
  authApi: authApi,

  // User endpoints (protected)
  getMyStatus: () => api.get("/trial-lessons/my-status"),
  getMyLessons: () => api.get("/trial-lessons/my-lessons"),
  bookDates: (data: any) => api.post("/trial-lessons/book-dates", data),
  rescheduleLesson: (lessonId: string, data: any) =>
    api.put(`/trial-lessons/${lessonId}/reschedule`, data),
  convertToMember: () => api.post("/trial-lessons/convert-to-member", {}),
  declineTrialMembership: (data: any) =>
    api.post("/trial-lessons/decline-membership", data),

  // Admin endpoints
  getAllTrialMembers: (params?: any) =>
    api.get("/trial-lessons/admin/all", { params }),
  getTrialMemberDetails: (memberId: string) =>
    api.get(`/trial-lessons/admin/${memberId}`),
  markLessonCompleted: (lessonId: string, data: any) =>
    api.put(`/trial-lessons/admin/${lessonId}/mark-completed`, data),
  getTrialStats: (params?: any) =>
    api.get("/trial-lessons/admin/stats/overview", { params }),
};

export const membershipApi = {
  apply: (data: any) => api.post("/memberships/apply", data),
  getTypes: () => api.get("/memberships/types"),
  confirmMonthlyPayment: (token: string) =>
    api.post(
      "/memberships/confirm-monthly-payment",
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    ),
};

export const adminApi = {
  getTrainingRegistrations: () => api.get("/admin/training-registrations"),
  getMembers: () => api.get("/admin/members"),
  getPaymentsOverview: () => api.get("/admin/payments-overview"),
  getDashboardStats: () => api.get("/admin/dashboard-stats"),
  updateMember: (memberId: string, data: any) =>
    api.put(`/admin/members/${memberId}`, data),
  deleteMember: (memberId: string) => api.delete(`/admin/members/${memberId}`),
  getStatus: () => api.get("/admin/status"),
};

export default api;
