/**
 * Hook personalizado para autenticação
 * Gerencia estado global de autenticação usando Context API
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getMe, logout as logoutService, isAuthenticated as checkAuth } from '../services/auth.service';
import type { UserMe } from '../types/api.types';

interface AuthContextType {
  user: UserMe | null;
  loading: boolean;
  isAuthenticated: boolean;
  loadUser: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<UserMe | null>(null);
  const [loading, setLoading] = useState(true);

  // Carrega dados do usuário ao montar
  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    if (checkAuth()) {
      const result = await getMe();
      if (result.success && result.data) {
        console.log('👤 Usuário carregado no useAuth:', result.data);
        console.log('👤 Tipo:', result.data.tipo);
        console.log('👤 Licença:', result.data.licenca);
        setUser(result.data);
      } else {
        // Token inválido ou expirado
        setUser(null);
      }
    }
    setLoading(false);
  };

  const logout = () => {
    logoutService();
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: !!user,
    loadUser,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
};
