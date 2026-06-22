import api from './api';

export const playDaysAPI = {
  getMyRegistrations: async () => {
    const res = await api.get('/play-days/my-registrations');
    return res.data;
  },
  register: async (playDate: string) => {
    const res = await api.post('/play-days/register', { playDate });
    return res.data;
  },
  cancelRegistration: async (registrationId: string) => {
    const res = await api.delete(`/play-days/registrations/${registrationId}`);
    return res.data;
  },
};
