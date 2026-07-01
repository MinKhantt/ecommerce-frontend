import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { isAdminToken } from '../utils/jwt';
import type { AuthUser } from '../types';

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (id: string, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const token = localStorage.getItem('token');
    const id = localStorage.getItem('userId');
    if (token && id) {
      return { id, token, isAdmin: isAdminToken(token) };
    }
    return null;
  });

  const login = useCallback((id: string, token: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('userId', id);
    setUser({ id, token, isAdmin: isAdminToken(token) });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    setUser(null);
  }, []);

  // Keep state in sync if another tab changes localStorage
  useEffect(() => {
    const handleStorage = () => {
      const token = localStorage.getItem('token');
      const id = localStorage.getItem('userId');
      if (token && id) {
        setUser({ id, token, isAdmin: isAdminToken(token) });
      } else {
        setUser(null);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: user?.isAdmin ?? false,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
