/**
 * Service de Integrações API (ERPs)
 * Gerencia integrações com sistemas externos
 */

import api from './api';
import { handleApiError } from '../utils/errorHandler';
import type {
  IntegracaoAPI,
  CreateIntegracaoData,
  UpdateIntegracaoData,
  TestarIntegracaoResponse,
  ApiResponse,
} from '../types/api.types';

/**
 * Lista integrações de um usuário
 */
export const getIntegracoes = async (
  usuarioId: number
): Promise<ApiResponse<{ data: IntegracaoAPI[] }>> => {
  try {
    const response = await api.get<{ data: IntegracaoAPI[] }>(
      `/usuarios/${usuarioId}/integracoes`
    );

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
 * Busca integração por ID
 */
export const getIntegracaoById = async (
  integracaoId: number
): Promise<ApiResponse<IntegracaoAPI>> => {
  try {
    const response = await api.get<IntegracaoAPI>(`/integracoes/${integracaoId}`);

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
 * Cria nova integração
 */
export const createIntegracao = async (
  usuarioId: number,
  dados: CreateIntegracaoData
): Promise<ApiResponse<IntegracaoAPI>> => {
  try {
    const response = await api.post<{
      success: boolean;
      message: string;
      data: IntegracaoAPI;
    }>(`/usuarios/${usuarioId}/integracoes`, dados);

    return {
      success: true,
      data: response.data.data,
      message: response.data.message || 'Integração criada com sucesso!',
    };
  } catch (error: any) {
    return {
      success: false,
      message: handleApiError(error),
    };
  }
};

/**
 * Atualiza integração
 */
export const updateIntegracao = async (
  integracaoId: number,
  dados: UpdateIntegracaoData
): Promise<ApiResponse<IntegracaoAPI>> => {
  try {
    const response = await api.put<{
      success: boolean;
      message: string;
      data: IntegracaoAPI;
    }>(`/integracoes/${integracaoId}`, dados);

    return {
      success: true,
      data: response.data.data,
      message: response.data.message || 'Integração atualizada com sucesso!',
    };
  } catch (error: any) {
    return {
      success: false,
      message: handleApiError(error),
    };
  }
};

/**
 * Testa conexão da integração
 */
export const testarIntegracao = async (
  integracaoId: number
): Promise<ApiResponse<TestarIntegracaoResponse>> => {
  try {
    const response = await api.post<TestarIntegracaoResponse>(
      `/integracoes/${integracaoId}/testar`
    );

    return {
      success: response.data.success,
      data: response.data,
      message: response.data.message,
    };
  } catch (error: any) {
    return {
      success: false,
      message: handleApiError(error),
    };
  }
};

/**
 * Exclui integração
 */
export const deleteIntegracao = async (integracaoId: number): Promise<ApiResponse> => {
  try {
    const response = await api.delete(`/integracoes/${integracaoId}`);

    return {
      success: true,
      message: response.data.message || 'Integração excluída com sucesso!',
    };
  } catch (error: any) {
    return {
      success: false,
      message: handleApiError(error),
    };
  }
};

/**
 * Ativa integração
 */
export const ativarIntegracao = async (
  integracaoId: number
): Promise<ApiResponse<IntegracaoAPI>> => {
  return await updateIntegracao(integracaoId, { ativa: true });
};

/**
 * Desativa integração
 */
export const desativarIntegracao = async (
  integracaoId: number
): Promise<ApiResponse<IntegracaoAPI>> => {
  return await updateIntegracao(integracaoId, { ativa: false });
};
