import axios from 'axios';

const API_URL = ((import.meta.env.VITE_API_URL as string | undefined)?.trim() || (typeof window !== 'undefined' ? '/api' : 'http://localhost:3000/api')).replace(/\/$/, '');

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface Court {
  id: string;
  name: string;
  isActive: boolean;
  notes?: string;
  availability?: CourtAvailability[];
}

export interface CourtAvailability {
  id: string;
  courtId: string;
  tournamentId: string;
  availableFrom: string;
  availableUntil: string;
  isBlocked: boolean;
  tournament?: any;
}

export interface CourtUsage {
  courts: Court[];
  matches: any[];
}

export const getCourts = () => api.get<Court[]>('/courts');

export const getCourt = (id: string) => api.get<Court>(`/courts/${id}`);

export const createCourt = (data: { name: string; isActive?: boolean; notes?: string }) =>
  api.post<Court>('/courts', data);

export const updateCourt = (id: string, data: { name?: string; isActive?: boolean; notes?: string }) =>
  api.put<Court>(`/courts/${id}`, data);

export const deleteCourt = (id: string) => api.delete(`/courts/${id}`);

export const getCourtUsage = () => api.get<CourtUsage>('/courts/usage');

export const setCourtAvailability = (data: {
  courtId: string;
  tournamentId: string;
  availableFrom: string;
  availableUntil: string;
  isBlocked?: boolean;
}) => api.post<CourtAvailability>('/courts/availability', data);

export const updateCourtAvailability = (
  id: string,
  data: {
    availableFrom?: string;
    availableUntil?: string;
    isBlocked?: boolean;
  }
) => api.put<CourtAvailability>(`/courts/availability/${id}`, data);

export const deleteCourtAvailability = (id: string) =>
  api.delete(`/courts/availability/${id}`);
