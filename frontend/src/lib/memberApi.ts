import api from './api';

export const memberAPI = {
  getProfile: async () => {
    const res = await api.get('/members/profile');
    return res.data;
  },
  updateProfile: async (data: any) => {
    const res = await api.put('/members/profile', data);
    return res.data;
  },
  getAll: async () => {
    const res = await api.get('/members/all');
    return res.data;
  },
  getStats: async () => {
    const res = await api.get('/members/stats');
    return res.data;
  },
  getDashboard: async () => {
    const res = await api.get('/members/dashboard');
    return res.data;
  },
  updateMember: async (memberId: string, data: any) => {
    const res = await api.patch(`/members/${memberId}/update`, data);
    return res.data;
  },
  deleteMember: async (memberId: string) => {
    const res = await api.delete(`/members/${memberId}`);
    return res.data;
  },
  makeAdmin: async (memberId: string) => {
    const res = await api.patch(`/members/${memberId}/make-admin`);
    return res.data;
  },
  deleteAccount: async () => {
    const res = await api.delete('/members/account');
    return res.data;
  },
  approveMembershipApplication: async (id: string) => {
    const res = await api.patch(`/members/applications/${id}/approve`);
    return res.data;
  },
  rejectMembershipApplication: async (id: string) => {
    const res = await api.patch(`/members/applications/${id}/reject`);
    return res.data;
  },
  activateMember: async (memberId: string) => {
    const res = await api.patch(`/members/${memberId}/activate`);
    return res.data;
  },
  getMembers: async () => {
    const res = await api.get('/members');
    return res.data;
  },
  approveMembership: async (id: string) => {
    const res = await api.patch(`/members/${id}/membership/approve`);
    return res.data;
  },
  rejectMembership: async (id: string) => {
    const res = await api.patch(`/members/${id}/membership/reject`);
    return res.data;
  },
  completePlayDayPayment: async (playDayRegistrationId: string, amount: number) => {
    const res = await api.patch(`/members/play-days/${playDayRegistrationId}/payment-complete`, { amount });
    return res.data;
  },
  getPlayDayRegistrationsForAdmin: async (date?: string) => {
    const res = await api.get('/members/play-days/registrations', { params: { date } });
    return res.data;
  },
};
