/**
 * Service de Usuários (Clientes)
 * CRUD completo de usuários e licenças
 */

import api from './api';
import { handleApiError } from '../utils/errorHandler';
import type {
  UsuarioListItem,
  UsuarioDetail,
  CreateUsuarioData,
  UpdateUsuarioData,
  UsuariosFilters,
  PaginatedResponse,
  ApiResponse,
} from '../types/api.types';

/**
 * Lista todos os usuários com filtros e paginação
 */
export const getUsuarios = async (
  filters: UsuariosFilters = {}
): Promise<ApiResponse<PaginatedResponse<UsuarioListItem>>> => {
  try {
    const params = new URLSearchParams();

    // Adiciona filtros opcionais
    if (filters.cliente) params.append('cliente', filters.cliente);
    if (filters.email) params.append('email', filters.email);
    if (filters.tipo_licenca) params.append('tipo_licenca', filters.tipo_licenca);
    if (filters.bloqueada !== undefined) params.append('bloqueada', String(filters.bloqueada));
    if (filters.page) params.append('page', String(filters.page));
    if (filters.limit) params.append('limit', String(filters.limit));

    const response = await api.get<PaginatedResponse<UsuarioListItem>>(
      `/usuarios?${params.toString()}`
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
 * Busca usuário por ID com todos os detalhes
 */
export const getUsuarioById = async (id: number): Promise<ApiResponse<UsuarioDetail>> => {
  try {
    const response = await api.get<UsuarioDetail>(`/usuarios/${id}`);

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
 * Cria novo usuário com licença
 */
export const createUsuario = async (
  dados: CreateUsuarioData
): Promise<ApiResponse<{ usuario_id: number; licenca_id: number }>> => {
  try {
    const response = await api.post<{
      success: boolean;
      message: string;
      data: { usuario_id: number; licenca_id: number };
    }>('/usuarios', dados);

    return {
      success: true,
      data: response.data.data,
      message: response.data.message || 'Usuário criado com sucesso!',
    };
  } catch (error: any) {
    return {
      success: false,
      message: handleApiError(error),
    };
  }
};

/**
 * Atualiza dados do usuário e/ou licença
 */
export const updateUsuario = async (
  id: number,
  dados: UpdateUsuarioData
): Promise<ApiResponse> => {
  try {
    const response = await api.put(`/usuarios/${id}`, dados);

    return {
      success: true,
      message: response.data.message || 'Usuário atualizado com sucesso!',
    };
  } catch (error: any) {
    return {
      success: false,
      message: handleApiError(error),
    };
  }
};

/**
 * Exclui usuário (soft delete)
 */
export const deleteUsuario = async (id: number): Promise<ApiResponse> => {
  try {
    const response = await api.delete(`/usuarios/${id}`);

    return {
      success: true,
      message: response.data.message || 'Usuário excluído com sucesso!',
    };
  } catch (error: any) {
    return {
      success: false,
      message: handleApiError(error),
    };
  }
};

/**
 * Bloqueia um usuário
 */
export const bloquearUsuario = async (id: number): Promise<ApiResponse> => {
  return await updateUsuario(id, { bloqueada: true });
};

/**
 * Desbloqueia um usuário
 */
export const desbloquearUsuario = async (id: number): Promise<ApiResponse> => {
  return await updateUsuario(id, { bloqueada: false });
};

/**
 * Renova licença de um usuário
 */
export const renovarLicenca = async (
  id: number,
  novaDataExpiracao: string
): Promise<ApiResponse> => {
  return await updateUsuario(id, { data_expiracao: novaDataExpiracao });
};
