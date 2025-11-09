/**
 * Service de Autenticação
 * Gerencia login de Master e Cliente, logout e dados do usuário logado
 */

import api from './api';
import { handleApiError } from '../utils/errorHandler';
import type { 
  LoginCredentials, 
  LoginResponse, 
  UserMe, 
  ChangePasswordData,
  ApiResponse 
} from '../types/api.types';

// 🔑 Chaves do localStorage
const TOKEN_KEY = 'access_token';
const USER_TYPE_KEY = 'user_type';
const IS_AUTHENTICATED_KEY = 'isAuthenticated';
const USER_DATA_KEY = 'user_data';

/**
 * 🔐 Faz login de Usuário Master (Admin)
 */
export const loginMaster = async (email: string, password: string): Promise<ApiResponse<LoginResponse>> => {
  try {
    const response = await api.post<LoginResponse>('/auth/login', {
      email,
      password,
    } as LoginCredentials);

    // Salva o token e tipo no localStorage
    localStorage.setItem(TOKEN_KEY, response.data.access_token);
    localStorage.setItem(USER_TYPE_KEY, 'master');
    localStorage.setItem(IS_AUTHENTICATED_KEY, 'true');

    console.log('✅ Login Master realizado com sucesso');

    return {
      success: true,
      data: response.data,
      message: 'Login realizado com sucesso!',
    };
  } catch (error: any) {
    console.error('❌ Erro no login Master:', error.response?.data);
    return {
      success: false,
      message: handleApiError(error),
    };
  }
};

/**
 * 🔐 Faz login de Usuário Cliente
 */
export const loginCliente = async (email: string, password: string): Promise<ApiResponse<LoginResponse>> => {
  try {
    const response = await api.post<LoginResponse>('/auth/login-cliente', {
      email,
      password,
    } as LoginCredentials);

    // Salva o token e tipo no localStorage
    localStorage.setItem(TOKEN_KEY, response.data.access_token);
    localStorage.setItem(USER_TYPE_KEY, 'cliente');
    localStorage.setItem(IS_AUTHENTICATED_KEY, 'true');

    console.log('✅ Login Cliente realizado com sucesso');
    const userData: any = response.data.user;
    if (userData && userData.tipo === 'cliente' && userData.licenca) {
      console.log('📊 Dados da licença:', userData.licenca);
    }

    return {
      success: true,
      data: response.data,
      message: 'Login realizado com sucesso!',
    };
  } catch (error: any) {
    console.error('❌ Erro no login Cliente:', error.response?.data);
    return {
      success: false,
      message: handleApiError(error),
    };
  }
};

/**
 * 🔐 Faz login de Usuário Adicional (Colaborador)
 */
export const loginAdicional = async (email: string, password: string): Promise<ApiResponse<LoginResponse>> => {
  try {
    const response = await api.post<LoginResponse>('/auth/login-adicional', {
      email,
      password,
    } as LoginCredentials);

    // Salva o token e tipo no localStorage
    localStorage.setItem(TOKEN_KEY, response.data.access_token);
    localStorage.setItem(USER_TYPE_KEY, 'adicional');
    localStorage.setItem(IS_AUTHENTICATED_KEY, 'true');
    
    // Salva os dados do usuário que já vêm no login
    if (response.data.user) {
      localStorage.setItem(USER_DATA_KEY, JSON.stringify(response.data.user));
    }

    console.log('✅ Login Adicional realizado com sucesso');
    console.log('👤 Dados do usuário:', response.data.user);

    return {
      success: true,
      data: response.data,
      message: 'Login realizado com sucesso!',
    };
  } catch (error: any) {
    console.error('❌ Erro no login Adicional:', error.response?.data);
    return {
      success: false,
      message: handleApiError(error),
    };
  }
};

/**
 * 🔐 Função de login legada (usa loginMaster por padrão)
 * @deprecated Use loginMaster ou loginCliente
 */
export const login = async (email: string, password: string): Promise<ApiResponse<LoginResponse>> => {
  return loginMaster(email, password);
};

/**
 * Busca dados do usuário autenticado
 */
export const getMe = async (): Promise<ApiResponse<UserMe>> => {
  try {
    // Primeiro tenta pegar do localStorage (para colaboradores)
    const userType = localStorage.getItem(USER_TYPE_KEY);
    if (userType === 'adicional') {
      const userData = localStorage.getItem(USER_DATA_KEY);
      if (userData) {
        console.log('📦 Carregando dados do localStorage para colaborador');
        return {
          success: true,
          data: JSON.parse(userData) as UserMe,
        };
      }
    }

    // Se não encontrou no localStorage, busca da API
    const response = await api.get<UserMe>('/auth/me');

    return {
      success: true,
      data: response.data,
    };
  } catch (error: any) {
    return {
      success: false,
      message: handleApiError(error),
    };
  }
};

/**
 * Altera a senha do usuário logado
 */
export const changePassword = async (
  currentPassword: string,
  newPassword: string
): Promise<ApiResponse> => {
  try {
    const response = await api.put('/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    } as ChangePasswordData);

    return {
      success: true,
      message: response.data.message || 'Senha alterada com sucesso!',
    };
  } catch (error: any) {
    return {
      success: false,
      message: handleApiError(error),
    };
  }
};

/**
 * Remove o token e faz logout
 */
export const logout = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_TYPE_KEY);
  localStorage.removeItem(IS_AUTHENTICATED_KEY);
  localStorage.removeItem(USER_DATA_KEY);
  console.log('👋 Logout realizado');
  window.location.href = '/login';
};

/**
 * Verifica se usuário está autenticado
 */
export const isAuthenticated = (): boolean => {
  return localStorage.getItem(IS_AUTHENTICATED_KEY) === 'true';
};

/**
 * Obtém o token armazenado
 */
export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Obtém o tipo de usuário armazenado
 */
export const getUserType = (): 'master' | 'cliente' | null => {
  return localStorage.getItem(USER_TYPE_KEY) as 'master' | 'cliente' | null;
};
