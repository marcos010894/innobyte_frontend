/**
 * Service para gerenciar Usuários Adicionais
 */

import api from './api';
import { handleApiError } from '../utils/errorHandler';
import type { ApiResponse } from '../types/api.types';
import type {
  UsuarioAdicional,
  UsuarioAdicionalCreate,
  UsuarioAdicionalUpdate,
  UsuarioAdicionalListResponse,
} from '../types/usuario-adicional.types';

/**
 * Lista todos os usuários adicionais do cliente
 */
export const listarUsuariosAdicionais = async (
  skip = 0,
  limit = 100
): Promise<ApiResponse<UsuarioAdicionalListResponse>> => {
  try {
    const response = await api.get<UsuarioAdicionalListResponse>('/usuarios-adicionais', {
      params: { skip, limit },
    });

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
 * Busca um usuário adicional específico
 */
export const buscarUsuarioAdicional = async (
  id: number
): Promise<ApiResponse<UsuarioAdicional>> => {
  try {
    const response = await api.get<UsuarioAdicional>(`/usuarios-adicionais/${id}`);

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
 * Cria um novo usuário adicional
 */
export const criarUsuarioAdicional = async (
  dados: UsuarioAdicionalCreate
): Promise<ApiResponse<UsuarioAdicional>> => {
  try {
    const response = await api.post<UsuarioAdicional>('/usuarios-adicionais', dados);

    return {
      success: true,
      data: response.data,
      message: 'Usuário criado com sucesso!',
    };
  } catch (error: any) {
    return {
      success: false,
      message: handleApiError(error),
    };
  }
};

/**
 * Atualiza um usuário adicional
 */
export const atualizarUsuarioAdicional = async (
  id: number,
  dados: UsuarioAdicionalUpdate
): Promise<ApiResponse<UsuarioAdicional>> => {
  try {
    const response = await api.put<UsuarioAdicional>(
      `/usuarios-adicionais/${id}`,
      dados
    );

    return {
      success: true,
      data: response.data,
      message: 'Usuário atualizado com sucesso!',
    };
  } catch (error: any) {
    return {
      success: false,
      message: handleApiError(error),
    };
  }
};

/**
 * Deleta um usuário adicional
 */
export const deletarUsuarioAdicional = async (
  id: number
): Promise<ApiResponse> => {
  try {
    await api.delete(`/usuarios-adicionais/${id}`);

    return {
      success: true,
      message: 'Usuário deletado com sucesso!',
    };
  } catch (error: any) {
    return {
      success: false,
      message: handleApiError(error),
    };
  }
};

/**
 * Ativa/Desativa um usuário adicional
 */
export const toggleAtivoUsuarioAdicional = async (
  id: number
): Promise<ApiResponse<UsuarioAdicional>> => {
  try {
    const response = await api.put<UsuarioAdicional>(
      `/usuarios-adicionais/${id}/toggle-ativo`
    );

    return {
      success: true,
      data: response.data,
      message: 'Status alterado com sucesso!',
    };
  } catch (error: any) {
    return {
      success: false,
      message: handleApiError(error),
    };
  }
};
