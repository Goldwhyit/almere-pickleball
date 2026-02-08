import { membershipApi } from './api';

// Compatibility wrapper to mirror other project's API naming
export const membershipsAPI = {
  // Map to backend types endpoint
  getPlans: async () => {
    const res = await membershipApi.getTypes();
    return res.data;
  },
  // Create membership application
  apply: async (data: any) => {
    const res = await membershipApi.apply(data);
    return res.data;
  },
  // Confirm monthly payment
  confirmMonthlyPayment: async (token: string) => {
    const res = await membershipApi.confirmMonthlyPayment(token);
    return res.data;
  },
};
