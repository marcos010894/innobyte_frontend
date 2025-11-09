import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { loginMaster, loginCliente, getMe, logout as logoutService } from '@/services/auth.service';
import type { UserMe, LicencaAuth } from '@/types/api.types';

// 🔐 Interface do Contexto
interface AuthContextData {
  user: UserMe | null;
  loading: boolean;
  isAuthenticated: boolean;
  isMaster: boolean;
  isCliente: boolean;
  licenca: LicencaAuth | null;
  
  // Funções de autenticação
  loginMaster: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  loginCliente: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  loadUser: () => Promise<void>;
  
  // Verificações de permissão
  temPermissao: (permissao: keyof LicencaAuth) => boolean;
  licencaValida: () => boolean;
  diasParaVencer: () => number;
}

// 🔐 Criação do Contexto
const AuthContext = createContext<AuthContextData>({} as AuthContextData);

// 🪝 Hook para usar o contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// 🔐 Provider do Contexto
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserMe | null>(null);
  const [loading, setLoading] = useState(true);

  // Carrega usuário autenticado ao montar
  useEffect(() => {
    loadUser();
  }, []);

  // 📥 Carrega dados do usuário autenticado
  const loadUser = async () => {
    try {
      setLoading(true);
      const result = await getMe();
      
      if (result.success && result.data) {
        setUser(result.data);
        console.log('✅ Usuário carregado:', result.data);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar usuário:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // 🔐 Login Master
  const handleLoginMaster = async (email: string, password: string) => {
    try {
      setLoading(true);
      const result = await loginMaster(email, password);
      
      if (result.success && result.data) {
        setUser(result.data.user as UserMe);
        console.log('✅ Login Master bem-sucedido');
        return { success: true };
      }
      
      return { success: false, message: result.message };
    } catch (error: any) {
      console.error('❌ Erro no login Master:', error);
      return { success: false, message: error.message || 'Erro ao fazer login' };
    } finally {
      setLoading(false);
    }
  };

  // 🔐 Login Cliente
  const handleLoginCliente = async (email: string, password: string) => {
    try {
      setLoading(true);
      const result = await loginCliente(email, password);
      
      if (result.success && result.data) {
        setUser(result.data.user as UserMe);
        console.log('✅ Login Cliente bem-sucedido');
        return { success: true };
      }
      
      return { success: false, message: result.message };
    } catch (error: any) {
      console.error('❌ Erro no login Cliente:', error);
      return { success: false, message: error.message || 'Erro ao fazer login' };
    } finally {
      setLoading(false);
    }
  };

  // 🚪 Logout
  const handleLogout = () => {
    logoutService();
    setUser(null);
  };

  // ✅ Verifica se usuário está autenticado
  const isAuthenticated = !!user;

  // 👑 Verifica se é Master
  const isMaster = user?.tipo === 'master';

  // 👤 Verifica se é Cliente
  const isCliente = user?.tipo === 'cliente';

  // 📄 Obtém licença do cliente
  const licenca = user?.licenca || null;

  // 🛡️ Verifica permissão específica
  const temPermissao = (permissao: keyof LicencaAuth): boolean => {
    if (!isCliente || !licenca) return false;
    
    // Verifica se licença está válida
    if (licenca.bloqueada || licenca.vencida) {
      console.warn('⚠️ Licença bloqueada ou vencida');
      return false;
    }
    
    // Verifica permissão específica
    const temPermissaoEspecifica = licenca[permissao] === true;
    
    if (!temPermissaoEspecifica) {
      console.warn(`⚠️ Permissão negada: ${permissao}`);
    }
    
    return temPermissaoEspecifica;
  };

  // ✅ Verifica se licença está válida
  const licencaValida = (): boolean => {
    if (!isCliente || !licenca) return true; // Master sempre válido
    return !licenca.vencida && !licenca.bloqueada;
  };

  // 📅 Retorna dias para vencer
  const diasParaVencer = (): number => {
    if (!isCliente || !licenca) return 0;
    return licenca.dias_para_vencer;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        isMaster,
        isCliente,
        licenca,
        loginMaster: handleLoginMaster,
        loginCliente: handleLoginCliente,
        logout: handleLogout,
        loadUser,
        temPermissao,
        licencaValida,
        diasParaVencer,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
