import api from './api';

export const settingsApi = {
  getSetting: async (key: string) => {
    const res = await api.get(`/settings/${key}`);
    return res.data as { key: string; value: string | null };
  },
};
