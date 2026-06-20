import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { auth } from '../services/api';
import type { User, LoginPayload } from '../services/api';

interface AuthCtx {
  user: User | null;
  token: string | null;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]     = useState<User | null>(null);
  const [token, setToken]   = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('tp_token');
    const storedUser = localStorage.getItem('tp_user');
    if (stored && storedUser) {
      setToken(stored);
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  async function login(payload: LoginPayload) {
    const res = await auth.login(payload);
    localStorage.setItem('tp_token', res.token);
    localStorage.setItem('tp_user', JSON.stringify(res.user));
    setToken(res.token);
    setUser(res.user);
  }

  function logout() {
    localStorage.removeItem('tp_token');
    localStorage.removeItem('tp_user');
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthCtx {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
