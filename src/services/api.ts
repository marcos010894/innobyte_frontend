/**
 * Configuração centralizada do Axios
 * Instância base da API com interceptors para autenticação e tratamento de erros
 */

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

// Configuração da instância base do Axios
const api = axios.create({
 
  //baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/',
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api',
  timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Interceptor de Request
 * Adiciona token de autenticação automaticamente em todas as requisições
 */
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('access_token');
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log apenas em desenvolvimento
    if (import.meta.env.VITE_ENV === 'development') {
      console.log(`🔵 ${config.method?.toUpperCase()} ${config.url}`, config.data);
    }
    
    return config;
  },
  (error: AxiosError) => {
    console.error('❌ Erro na requisição:', error);
    return Promise.reject(error);
  }
);

/**
 * Interceptor de Response
 * Trata erros globalmente e renova token quando necessário
 */
api.interceptors.response.use(
  (response) => {
    // Log apenas em desenvolvimento
    if (import.meta.env.VITE_ENV === 'development') {
      console.log(`🟢 ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
    }
    return response;
  },
  (error: AxiosError) => {
    const status = error.response?.status;
    
    // Token expirado ou inválido
    if (status === 401) {
      console.warn('⚠️ Token expirado ou inválido. Redirecionando para login...');
      localStorage.removeItem('access_token');
      localStorage.removeItem('isAuthenticated');
      
      // Redireciona para login apenas se não estiver já na página de login
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    // Sem permissão
    if (status === 403) {
      console.error('🚫 Você não tem permissão para esta ação.');
    }
    
    // Recurso não encontrado
    if (status === 404) {
      console.error('🔍 Recurso não encontrado.');
    }
    
    // Erro do servidor
    if (status === 500) {
      console.error('💥 Erro interno do servidor.');
    }
    
    // Log do erro completo em desenvolvimento
    if (import.meta.env.VITE_ENV === 'development') {
      console.error('❌ Erro na resposta:', {
        status,
        message: error.message,
        data: error.response?.data,
        url: error.config?.url,
      });
    }
    
    return Promise.reject(error);
  }
);

export default api;
