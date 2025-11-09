/**
 * Service de Tokens API
 * Gerencia tokens de acesso à API
 */

import api from './api';
import { handleApiError } from '../utils/errorHandler';
import type {
  TokenAPI,
  CreateTokenData,
  CreateTokenResponse,
  ApiResponse,
} from '../types/api.types';

/**
 * Lista tokens de um usuário
 */
export const getTokens = async (
  usuarioId: number
): Promise<ApiResponse<{ data: TokenAPI[] }>> => {
  try {
    const response = await api.get<{ data: TokenAPI[] }>(`/usuarios/${usuarioId}/tokens`);

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
 * Cria novo token
 * ⚠️ IMPORTANTE: O token completo só é retornado nesta chamada!
 * Exiba em modal para o usuário copiar.
 */
export const createToken = async (
  usuarioId: number,
  dados: CreateTokenData
): Promise<ApiResponse<CreateTokenResponse['data']>> => {
  try {
    const response = await api.post<CreateTokenResponse>(
      `/usuarios/${usuarioId}/tokens`,
      dados
    );

    return {
      success: true,
      data: response.data.data,
      message:
        response.data.message ||
        'Token criado com sucesso! Copie agora, não será mostrado novamente.',
    };
  } catch (error: any) {
    return {
      success: false,
      message: handleApiError(error),
    };
  }
};

/**
 * Exclui token
 */
export const deleteToken = async (tokenId: number): Promise<ApiResponse> => {
  try {
    const response = await api.delete(`/tokens/${tokenId}`);

    return {
      success: true,
      message: response.data.message || 'Token excluído com sucesso!',
    };
  } catch (error: any) {
    return {
      success: false,
      message: handleApiError(error),
    };
  }
};

/**
 * Copia token para clipboard
 */
export const copyTokenToClipboard = (token: string): Promise<void> => {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(token);
  } else {
    // Fallback para navegadores antigos
    const textArea = document.createElement('textarea');
    textArea.value = token;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      document.execCommand('copy');
      textArea.remove();
      return Promise.resolve();
    } catch (error) {
      textArea.remove();
      return Promise.reject(error);
    }
  }
};

/**
 * Mascara token para exibição (mostra apenas primeiros e últimos caracteres)
 */
export const maskToken = (token: string, showChars: number = 8): string => {
  if (token.length <= showChars * 2) {
    return token;
  }
  
  const start = token.substring(0, showChars);
  const end = token.substring(token.length - showChars);
  const middle = '*'.repeat(Math.min(token.length - showChars * 2, 20));
  
  return `${start}${middle}${end}`;
};
