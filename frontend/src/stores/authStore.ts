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

const normalizeUser = (user: User | null): User | null => {
  if (!user) return null;
  return {
    ...user,
    member: user.member ? { ...user.member } : undefined,
    accountType: user.member?.accountType || 'MEMBER',
  } as User & { accountType?: string };
};

export const useAuthStore = create<AuthState>((set) => {
  // Try to restore user from localStorage
  let storedUser: User | null = null;
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) storedUser = normalizeUser(JSON.parse(userStr));
  } catch {}

  return {
    user: storedUser,
    isAuthenticated: !!localStorage.getItem('accessToken') || !!localStorage.getItem('token'),
    isLoading: false,

    login: (user, tokens) => {
      const normalizedUser = normalizeUser(user);
      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);
      localStorage.setItem('token', tokens.accessToken);
      localStorage.setItem('user', JSON.stringify(normalizedUser));
      set({ user: normalizedUser, isAuthenticated: true });
    },

    logout: () => {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      set({ user: null, isAuthenticated: false });
    },

    setUser: (user) => {
      const normalizedUser = normalizeUser(user);
      localStorage.setItem('user', JSON.stringify(normalizedUser));
      set({ user: normalizedUser, isAuthenticated: true });
    },
  };
});
