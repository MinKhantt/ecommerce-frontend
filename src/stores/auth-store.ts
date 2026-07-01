import { create } from 'zustand';
import { isAdminToken } from '../utils/jwt';

interface AuthState {
  userId: string | null;
  token: string | null;
  isAdmin: boolean;
  isAuthenticated: boolean;
  login: (id: string, token: string) => void;
  logout: () => void;
}

const storedToken = localStorage.getItem('token');
const storedUserId = localStorage.getItem('userId');

export const useAuthStore = create<AuthState>((set) => ({
  userId: storedUserId,
  token: storedToken,
  isAdmin: storedToken ? isAdminToken(storedToken) : false,
  isAuthenticated: !!storedToken,

  login: (id, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('userId', id);
    set({ userId: id, token, isAdmin: isAdminToken(token), isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    set({ userId: null, token: null, isAdmin: false, isAuthenticated: false });
  },
}));
