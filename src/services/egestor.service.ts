/**
 * Service de Integração com E-gestor
 * API: https://egestor.docs.apiary.io/
 */

import api from './api';
import { handleApiError } from '../utils/errorHandler';
import type { ApiResponse } from '../types/api.types';

// ===== TIPOS E-GESTOR =====

export interface EgestorProduto {
  codigo: number;
  nome: string;
  referencia?: string;
  codigoBarras?: string;
  preco: number;
  precoCusto?: number;
  estoque?: number;
  estoqueMinimo?: number;
  unidade?: string;
  ncm?: string;
  categoria?: {
    codigo: number;
    nome: string;
  };
  ativo?: boolean;
  foto?: string;
  descricao?: string;
}

export interface EgestorCategoria {
  codigo: number;
  nome: string;
  pai?: {
    codigo: number;
    nome: string;
  };
}

export interface EgestorEmpresa {
  codigo: number;
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  inscricaoEstadual?: string;
  email?: string;
  telefone?: string;
  endereco?: {
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    uf: string;
    cep: string;
  };
}

export interface EgestorPaginacao {
  page: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export interface EgestorConfig {
  personalToken: string;
  accessToken?: string;
  accessTokenExpires?: string;
}

// ===== FUNÇÕES DO SERVIÇO =====

/**
 * Obter Access Token do E-gestor usando personal_token
 */
export const getAccessToken = async (
  integracaoId: number
): Promise<ApiResponse<{ access_token: string; expires_in: number }>> => {
  try {
    const response = await api.post<{
      success: boolean;
      data: { access_token: string; expires_in: number };
      message?: string;
    }>(`/integracoes/${integracaoId}/egestor/token`);

    return {
      success: true,
      data: response.data.data,
    };
  } catch (error: any) {
    return {
      success: false,
      message: handleApiError(error),
    };
  }
};

/**
 * Buscar dados da empresa no E-gestor
 */
export const getEmpresa = async (
  integracaoId: number
): Promise<ApiResponse<EgestorEmpresa>> => {
  try {
    const response = await api.get<{
      success: boolean;
      data: EgestorEmpresa;
    }>(`/integracoes/${integracaoId}/egestor/empresa`);

    return {
      success: true,
      data: response.data.data,
    };
  } catch (error: any) {
    return {
      success: false,
      message: handleApiError(error),
    };
  }
};

/**
 * Buscar categorias de produtos no E-gestor
 */
export const getCategorias = async (
  integracaoId: number
): Promise<ApiResponse<{ data: EgestorCategoria[]; paginacao: EgestorPaginacao }>> => {
  try {
    const response = await api.get<{
      success: boolean;
      data: EgestorCategoria[];
      paginacao: EgestorPaginacao;
    }>(`/integracoes/${integracaoId}/egestor/categorias`);

    return {
      success: true,
      data: {
        data: response.data.data,
        paginacao: response.data.paginacao,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      message: handleApiError(error),
    };
  }
};

/**
 * Buscar produtos do E-gestor
 */
export const getProdutos = async (
  integracaoId: number,
  options?: {
    page?: number;
    filtro?: string;
    categoriaId?: number;
  }
): Promise<ApiResponse<{ data: EgestorProduto[]; paginacao: EgestorPaginacao }>> => {
  try {
    const params = new URLSearchParams();
    if (options?.page) params.append('page', options.page.toString());
    if (options?.filtro) params.append('filtro', options.filtro);
    if (options?.categoriaId) params.append('categoria_id', options.categoriaId.toString());

    const response = await api.get<{
      success: boolean;
      data: EgestorProduto[];
      paginacao: EgestorPaginacao;
    }>(`/integracoes/${integracaoId}/egestor/produtos?${params.toString()}`);

    return {
      success: true,
      data: {
        data: response.data.data,
        paginacao: response.data.paginacao,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      message: handleApiError(error),
    };
  }
};

/**
 * Buscar produto específico do E-gestor por código
 */
export const getProdutoById = async (
  integracaoId: number,
  produtoId: number
): Promise<ApiResponse<EgestorProduto>> => {
  try {
    const response = await api.get<{
      success: boolean;
      data: EgestorProduto;
    }>(`/integracoes/${integracaoId}/egestor/produtos/${produtoId}`);

    return {
      success: true,
      data: response.data.data,
    };
  } catch (error: any) {
    return {
      success: false,
      message: handleApiError(error),
    };
  }
};

/**
 * Sincronizar produtos do E-gestor (busca todos os produtos e atualiza cache local)
 */
export const sincronizarProdutos = async (
  integracaoId: number
): Promise<ApiResponse<{ total: number; sincronizados: number; erros: number }>> => {
  try {
    const response = await api.post<{
      success: boolean;
      data: { total: number; sincronizados: number; erros: number };
      message?: string;
    }>(`/integracoes/${integracaoId}/egestor/sincronizar`);

    return {
      success: true,
      data: response.data.data,
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
 * Testar conexão com E-gestor
 */
export const testarConexao = async (
  integracaoId: number
): Promise<ApiResponse<{ conectado: boolean; empresa?: EgestorEmpresa }>> => {
  try {
    const response = await api.post<{
      success: boolean;
      data: { conectado: boolean; empresa?: EgestorEmpresa };
      message?: string;
    }>(`/integracoes/${integracaoId}/egestor/testar`);

    return {
      success: true,
      data: response.data.data,
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
 * Converter produto do E-gestor para formato do sistema de impressão
 */
export const converterProdutoParaImpressao = (produto: EgestorProduto) => {
  return {
    id: produto.codigo.toString(),
    name: produto.nome,
    code: produto.referencia || produto.codigo.toString(),
    price: produto.preco || 0,
    quantity: produto.estoque || 0,
    category: produto.categoria?.nome || 'Sem categoria',
    barcode: produto.codigoBarras || '',
    image: produto.foto,
    description: produto.descricao,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
};

export default {
  getAccessToken,
  getEmpresa,
  getCategorias,
  getProdutos,
  getProdutoById,
  sincronizarProdutos,
  testarConexao,
  converterProdutoParaImpressao,
};
