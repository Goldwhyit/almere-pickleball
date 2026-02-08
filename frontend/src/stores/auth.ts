import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  member?: {
    id: string;
    firstName: string;
    lastName: string;
    phone?: string | null;
    city?: string | null;
    street?: string | null;
    houseNumber?: string | null;
    postalCode?: string | null;
    emergencyName?: string | null;
    emergencyPhone?: string | null;
    emergencyRelation?: string | null;
    accountType: 'TRIAL' | 'MEMBER' | 'TRIAL_EXPIRED' | 'ADMIN';
    membershipType?: string | null;
    punchCardCount?: number | null;
    credit?: number;
  };
}

interface AuthStore {
  user: User | null;
  accessToken: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
  isTrialUser: () => boolean;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null,
  accessToken: localStorage.getItem('accessToken'),

  setAuth: (user: User, token: string) => {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('accessToken', token);
    set({ user, accessToken: token });
  },

  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    set({ user: null, accessToken: null });
  },

  isAuthenticated: () => !!get().accessToken && !!get().user,

  isTrialUser: () => get().user?.member?.accountType === 'TRIAL',
}));
