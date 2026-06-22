import api from './api';

export const tournamentsAPI = {
  getAll: async () => {
    const res = await api.get('/tournaments');
    return res.data;
  },
  getById: async (id: string) => {
    const res = await api.get(`/tournaments/${id}`);
    return res.data;
  },
  create: async (data: any) => {
    const res = await api.post('/tournaments', data);
    return res.data;
  },
  update: async (id: string, data: any) => {
    const res = await api.patch(`/tournaments/${id}`, data);
    return res.data;
  },
  remove: async (id: string) => {
    const res = await api.delete(`/tournaments/${id}`);
    return res.data;
  },
};
