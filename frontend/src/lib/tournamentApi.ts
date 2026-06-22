import api from './api';

const API_URL = '/tournaments';

export const tournamentAPI = {
  getAll: async () => {
    const res = await api.get(API_URL);
    return res.data;
  },
  getById: async (id: string) => {
    const res = await api.get(`${API_URL}/${id}`);
    return res.data;
  },
  create: async (data: any) => {
    const res = await api.post(API_URL, data);
    return res.data;
  },
  update: async (id: string, data: any) => {
    const res = await api.put(`${API_URL}/${id}`, data);
    return res.data;
  },
  remove: async (id: string) => {
    const res = await api.delete(`${API_URL}/${id}`);
    return res.data;
  },
  preview: async (id: string, data: any = {}) => {
    const res = await api.post(`${API_URL}/${id}/preview`, data);
    return res.data;
  },
  plan: async (id: string, data: any = {}) => {
    const res = await api.post(`${API_URL}/${id}/plan`, data);
    return res.data;
  },
  nextRound: async (id: string) => {
    const res = await api.post(`${API_URL}/${id}/rounds/next`);
    return res.data;
  },
  standings: async (id: string) => {
    const res = await api.get(`${API_URL}/${id}/standings`);
    return res.data;
  },
  live: async (id: string) => {
    const res = await api.get(`${API_URL}/${id}/live`);
    return res.data;
  },
};
