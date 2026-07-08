import api from './api';

export const membershipsAPI = {
  getPlans: async () => {
    const res = await api.get('/memberships/plans');
    return res.data;
  },
  apply: async (data: any) => {
    const res = await api.post('/memberships/apply', data);
    return res.data;
  },
  getApplications: async () => {
    const res = await api.get('/memberships/applications');
    return res.data;
  },
  getMyMembership: async () => {
    const res = await api.get('/memberships/my-membership');
    return res.data;
  },
  create: async (data: any) => {
    // Backend endpoint expects /memberships/apply
    const res = await api.post('/memberships/apply', data);
    return res.data;
  },
  markPaid: async (membershipId: string) => {
    const res = await api.patch(`/memberships/${membershipId}/mark-paid`);
    return res.data;
  },
  setRenewalChoice: async (membershipId: string, choice: 'YEARLY' | 'YEARLY_UPFRONT') => {
    const res = await api.post(`/memberships/${membershipId}/renewal-choice`, { choice });
    return res.data;
  },
  processRenewal: async (membershipId: string) => {
    const res = await api.patch(`/memberships/${membershipId}/process-renewal`);
    return res.data;
  },
};
