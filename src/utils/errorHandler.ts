/**
 * Utilitário para tratamento de erros da API
 * Centraliza a lógica de mensagens de erro
 */

import { AxiosError } from 'axios';

interface ValidationError {
  loc: string[];
  msg: string;
  type: string;
}

interface ApiErrorResponse {
  detail: string | ValidationError[];
}

/**
 * Trata erros da API e retorna mensagem amigável
 */
export const handleApiError = (error: AxiosError<ApiErrorResponse>): string => {
  console.log('🔴 Erro capturado:', error);
  console.log('🔴 Resposta do erro:', error.response);
  console.log('🔴 Dados do erro:', error.response?.data);

  // Erro de rede ou servidor não respondeu
  if (!error.response) {
    console.log('🔴 Erro de rede - sem resposta do servidor');
    const apiUrl = import.meta.env.VITE_API_BASE_URL || 'https://innobyte.fly.dev/api';
    return `Erro de conexão. Verifique se o backend está acessível em ${apiUrl}`;
  }

  const status = error.response.status;
  const detail = error.response.data?.detail;

  console.log('🔴 Status:', status);
  console.log('🔴 Detail:', detail);

  // SEMPRE mostrar a mensagem do backend se existir
  if (typeof detail === 'string' && detail.trim()) {
    console.log('✅ Retornando mensagem do backend:', detail);
    return detail;
  }

  // Se detail é um array de erros de validação
  if (Array.isArray(detail)) {
    const messages = detail.map((err: ValidationError) => {
      const field = err.loc[err.loc.length - 1];
      return `${field}: ${err.msg}`;
    });
    const errorMsg = messages.join(', ');
    console.log('✅ Retornando erros de validação:', errorMsg);
    return errorMsg;
  }

  // Fallback por status code
  switch (status) {
    case 400:
      return 'Dados inválidos. Verifique os campos e tente novamente.';

    case 401:
      return 'E-mail ou senha incorretos.';

    case 403:
      return 'Você não tem permissão para realizar esta ação.';

    case 404:
      return 'Recurso não encontrado.';

    case 409:
      return 'Conflito. Este registro já existe.';

    case 422:
      return 'Dados inválidos. Verifique os campos.';

    case 500:
      return 'Erro interno do servidor. Tente novamente mais tarde.';

    case 503:
      return 'Serviço temporariamente indisponível. Tente novamente em alguns instantes.';

    default:
      return `Erro ${status}. Tente novamente.`;
  }
};

/**
 * Retorna array de erros formatados (útil para formulários)
 */
export const getValidationErrors = (error: AxiosError<ApiErrorResponse>): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (error.response?.status === 422) {
    const detail = error.response.data?.detail;
    
    if (Array.isArray(detail)) {
      detail.forEach((err: ValidationError) => {
        const field = err.loc[err.loc.length - 1];
        errors[field] = err.msg;
      });
    }
  }

  return errors;
};

/**
 * Verifica se o erro é de limite excedido
 */
export const isLimitExceededError = (error: AxiosError<ApiErrorResponse>): boolean => {
  const detail = error.response?.data?.detail;
  
  if (typeof detail === 'string') {
    return detail.toLowerCase().includes('limite');
  }
  
  return false;
};

/**
 * Verifica se o erro é de duplicação (conflito)
 */
export const isDuplicateError = (error: AxiosError<ApiErrorResponse>): boolean => {
  return error.response?.status === 409;
};

/**
 * Verifica se o erro é de autenticação
 */
export const isAuthError = (error: AxiosError<ApiErrorResponse>): boolean => {
  return error.response?.status === 401;
};

/**
 * Verifica se o erro é de permissão
 */
export const isPermissionError = (error: AxiosError<ApiErrorResponse>): boolean => {
  return error.response?.status === 403;
};
