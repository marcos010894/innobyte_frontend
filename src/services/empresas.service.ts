/**
 * Service de Empresas
 * Gerencia empresas vinculadas aos usuários
 */

import api from './api';
import { handleApiError, isLimitExceededError } from '../utils/errorHandler';
import type {
  Empresa,
  EmpresasResponse,
  CreateEmpresaData,
  UpdateEmpresaData,
  ApiResponse,
} from '../types/api.types';

/**
 * Lista todas as empresas de um usuário
 */
export const getEmpresas = async (usuarioId: number): Promise<ApiResponse<EmpresasResponse>> => {
  try {
    const response = await api.get<EmpresasResponse>(`/usuarios/${usuarioId}/empresas`);

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
 * Busca empresa por ID
 */
export const getEmpresaById = async (empresaId: number): Promise<ApiResponse<Empresa>> => {
  try {
    const response = await api.get<Empresa>(`/empresas/${empresaId}`);

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
 * Cria nova empresa para um usuário
 */
export const createEmpresa = async (
  usuarioId: number,
  dados: CreateEmpresaData
): Promise<ApiResponse<Empresa> & { limitExceeded?: boolean }> => {
  try {
    const response = await api.post<{
      success: boolean;
      message: string;
      data: Empresa;
    }>(`/usuarios/${usuarioId}/empresas`, dados);

    return {
      success: true,
      data: response.data.data,
      message: response.data.message || 'Empresa cadastrada com sucesso!',
    };
  } catch (error: any) {
    return {
      success: false,
      message: handleApiError(error),
      limitExceeded: isLimitExceededError(error),
    };
  }
};

/**
 * Atualiza dados de uma empresa
 */
export const updateEmpresa = async (
  empresaId: number,
  dados: UpdateEmpresaData
): Promise<ApiResponse<Empresa>> => {
  try {
    const response = await api.put<{
      success: boolean;
      message: string;
      data: Empresa;
    }>(`/empresas/${empresaId}`, dados);

    return {
      success: true,
      data: response.data.data,
      message: response.data.message || 'Empresa atualizada com sucesso!',
    };
  } catch (error: any) {
    return {
      success: false,
      message: handleApiError(error),
    };
  }
};

/**
 * Exclui uma empresa
 */
export const deleteEmpresa = async (empresaId: number): Promise<ApiResponse> => {
  try {
    const response = await api.delete(`/empresas/${empresaId}`);

    return {
      success: true,
      message: response.data.message || 'Empresa excluída com sucesso!',
    };
  } catch (error: any) {
    return {
      success: false,
      message: handleApiError(error),
    };
  }
};

/**
 * Ativa uma empresa
 */
export const ativarEmpresa = async (empresaId: number): Promise<ApiResponse<Empresa>> => {
  return await updateEmpresa(empresaId, { ativa: true });
};

/**
 * Desativa uma empresa
 */
export const desativarEmpresa = async (empresaId: number): Promise<ApiResponse<Empresa>> => {
  return await updateEmpresa(empresaId, { ativa: false });
};
