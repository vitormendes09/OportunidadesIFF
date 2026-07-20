'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { api } from '@/lib/api';
import { clearSessionToken, getSessionToken, setSessionToken } from '@/lib/session';
import type { LoginResponseDto, UserResponseDto } from '@/types/api';

interface AuthContextValue {
  user: UserResponseDto | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<UserResponseDto>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserResponseDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function hydrateSession() {
      const token = getSessionToken();
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await api.get<UserResponseDto>('/users/me');
        setUser(response.data);
      } catch {
        clearSessionToken();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    void hydrateSession();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const response = await api.post<LoginResponseDto>('/auth/login', { email, password });
    setSessionToken(response.data.accessToken);
    setUser(response.data.user);
    return response.data.user;
  }, []);

  const logout = useCallback(() => {
    clearSessionToken();
    setUser(null);
    if (typeof window !== 'undefined') {
      window.location.assign('/login');
    }
  }, []);

  // Usado pela tela de perfil (Etapa 06) para refletir name/course/period
  // atualizados no Header e no restante da aplicação após o PATCH /users/me.
  const refreshUser = useCallback(async () => {
    const response = await api.get<UserResponseDto>('/users/me');
    setUser(response.data);
  }, []);

  const value = useMemo(
    () => ({ user, isLoading, login, logout, refreshUser }),
    [user, isLoading, login, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de <AuthProvider>.');
  }
  return context;
}
