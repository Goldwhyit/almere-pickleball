import axios from 'axios';
import { getApiBaseUrl } from './apiBase';

const api = axios.create({
  baseURL: getApiBaseUrl(),
});

export const punchCardApi = {
  /**
   * Get my punch card status and sessions
   */
  getMyStatus: async (token: string) => {
    const response = await api.get('/punch-card/my-status', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  /**
   * Book a single punch card session date
   */
  bookDate: async (token: string, date: string) => {
    const response = await api.post(
      '/punch-card/book-date',
      { date },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },

  /**
   * Reschedule an upcoming punch card session
   */
  rescheduleSession: async (token: string, sessionId: string, newDate: string) => {
    const response = await api.put(
      `/punch-card/sessions/${sessionId}/reschedule`,
      { newDate },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },

  /**
   * Cancel an upcoming punch card session
   */
  cancelSession: async (token: string, sessionId: string) => {
    const response = await api.delete(`/punch-card/sessions/${sessionId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
};
