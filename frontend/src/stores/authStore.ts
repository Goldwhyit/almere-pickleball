import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  role: string;
  member?: {
    id: string;
    firstName: string;
    lastName: string;
    duprRating?: number;
    membershipStatus?: string;
    membershipPlan?: string;
    membershipType?: string;
    accountType?: 'TRIAL' | 'MEMBER' | 'TRIAL_EXPIRED' | 'ADMIN';
  };
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User, tokens: { accessToken: string; refreshToken: string }) => void;
  logout: () => void;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set) => {
  // Try to restore user from localStorage
  let storedUser: User | null = null;
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) storedUser = JSON.parse(userStr);
  } catch {}

  return {
    user: storedUser,
    isAuthenticated: !!localStorage.getItem('accessToken'),
    isLoading: false,

    login: (user, tokens) => {
      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
      set({ user, isAuthenticated: true });
    },

    logout: () => {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      set({ user: null, isAuthenticated: false });
    },

    setUser: (user) => {
      localStorage.setItem('user', JSON.stringify(user));
      set({ user, isAuthenticated: true });
    },
  };
});
