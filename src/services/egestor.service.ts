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
  referencia?: string; // DEPRECATED: use codigo_proprio
  codigoProprio?: string; // Este é o SKU no e-gestor (campo "código próprio")
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
    code: produto.codigoProprio || produto.referencia || produto.codigo.toString(), // Prioriza código próprio (SKU)
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

// ===== TIPOS PARA IMPORTAÇÃO DE ETIQUETAS =====

export interface ItemImportacaoEtiqueta {
  produto_id: number;
  codigo_produto?: string;
  nome_produto: string;
  referencia?: string;
  codigo_barras?: string;
  quantidade: number;
  preco_venda: number;
  categoria?: string;
  categoria_id?: number;
  origem?: string;  // "NF_COMPRA", "MOVIMENTACAO", "MANUAL"
  documento?: string;
}

export interface ImportacaoEtiquetasResponse {
  total_itens: number;
  total_quantidade: number;
  itens: ItemImportacaoEtiqueta[];
  origem?: string;
  documento?: string;
}

// ===== FUNÇÕES DE IMPORTAÇÃO PARA ETIQUETAS =====

/**
 * Importar itens de uma Nota Fiscal de Compra
 */
export const importarNFCompra = async (
  integracaoId: number,
  numeroNf: string,
  serie?: string
): Promise<ApiResponse<ImportacaoEtiquetasResponse>> => {
  try {
    const response = await api.post<{
      success: boolean;
      data: ImportacaoEtiquetasResponse;
      message?: string;
    }>(`/integracoes/${integracaoId}/egestor/importar/nf-compra`, {
      numero_nf: numeroNf,
      serie: serie || null,
    });

    return {
      success: response.data.success,
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
 * Importar itens de Movimentações de Estoque (Entradas)
 */
export const importarMovimentacaoEstoque = async (
  integracaoId: number,
  dataInicial: Date,
  dataFinal: Date,
  categoriaId?: number,
  agruparPorProduto: boolean = true
): Promise<ApiResponse<ImportacaoEtiquetasResponse>> => {
  try {
    const response = await api.post<{
      success: boolean;
      data: ImportacaoEtiquetasResponse;
      message?: string;
    }>(`/integracoes/${integracaoId}/egestor/importar/movimentacao`, {
      data_inicial: dataInicial.toISOString(),
      data_final: dataFinal.toISOString(),
      categoria_id: categoriaId || null,
      agrupar_por_produto: agruparPorProduto,
    });

    return {
      success: response.data.success,
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
 * Converter item importado para formato do sistema de impressão
 */
export const converterItemImportadoParaImpressao = (item: ItemImportacaoEtiqueta) => {
  return {
    id: item.produto_id.toString(),
    name: item.nome_produto,
    code: item.codigo_produto || item.produto_id.toString(),
    price: item.preco_venda || 0,
    quantity: item.quantidade,
    category: item.categoria || 'Sem categoria',
    barcode: item.codigo_barras || '',
    description: item.nome_produto,
    createdAt: new Date(),
    updatedAt: new Date(),
    // Campos extras para rastreabilidade
    origem: item.origem,
    documento: item.documento,
    referencia: item.referencia,
  };
};


// ===== SINCRONIZAÇÃO DE ESTOQUE =====

export interface SincronizacaoEstoque {
  id: number;
  data_sincronizacao: string;
  total_produtos: number;
  total_entradas: number;
  total_saidas: number;
  total_novos: number;
  observacao?: string;
}

export interface EstatisticasSincronizacao {
  entradas: number;
  saidas: number;
  novos: number;
  sem_alteracao: number;
}

export interface ItemSincronizacao {
  produto_id: number;
  codigo_produto: string;
  nome_produto: string;
  codigo_barras?: string;
  categoria?: string;
  quantidade: number;
  preco_venda?: number;
  preco_custo?: number;
  origem: string;
  tipo_movimento: string;
  quantidade_atual: number;
  quantidade_anterior: number;
}

export interface SincronizacaoResponse {
  sincronizacao_id: number;
  data_sincronizacao: string;
  total_produtos: number;
  estatisticas: EstatisticasSincronizacao;
}

export interface ImportacaoSincronizacaoResponse {
  total_itens: number;
  total_quantidade: number;
  itens: ItemSincronizacao[];
  origem: string;
  sincronizacao_id: number;
  data_sincronizacao?: string;
  estatisticas?: EstatisticasSincronizacao;
}

/**
 * Sincroniza estoque do E-gestor e calcula diferenças
 */
export const sincronizarEstoque = async (
  integracaoId: number,
  observacao?: string
): Promise<ApiResponse<SincronizacaoResponse>> => {
  try {
    const response = await api.post<{
      success: boolean;
      data: SincronizacaoResponse;
      message?: string;
    }>(`/integracoes/${integracaoId}/egestor/sincronizar-estoque`, null, {
      params: { observacao }
    });

    return {
      success: response.data.success,
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
 * Lista histórico de sincronizações
 */
export const listarSincronizacoes = async (
  integracaoId: number,
  limite: number = 10
): Promise<ApiResponse<SincronizacaoEstoque[]>> => {
  try {
    const response = await api.get<{
      success: boolean;
      data: SincronizacaoEstoque[];
    }>(`/integracoes/${integracaoId}/egestor/sincronizacoes`, {
      params: { limite }
    });

    return {
      success: response.data.success,
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
 * Importa entradas de estoque via sincronização
 * Este é o método principal para importar etiquetas por diferença de estoque
 * 
 * @param integracaoId ID da integração E-gestor
 * @param sincronizarAgora Se deve fazer nova sincronização antes
 * @param categoriaId Filtrar por categoria (opcional)
 * @param diasComparacao Comparar com sincronização de X dias atrás (opcional)
 * @param sincronizacaoBaseId ID específico da sincronização para comparar (opcional)
 */
export const importarViaSincronizacao = async (
  integracaoId: number,
  sincronizarAgora: boolean = true,
  categoriaId?: number,
  diasComparacao?: number,
  sincronizacaoBaseId?: number
): Promise<ApiResponse<ImportacaoSincronizacaoResponse>> => {
  try {
    const response = await api.post<{
      success: boolean;
      data: ImportacaoSincronizacaoResponse;
      message?: string;
    }>(`/integracoes/${integracaoId}/egestor/importar/sincronizacao`, null, {
      params: {
        sincronizar_agora: sincronizarAgora,
        categoria_id: categoriaId || undefined,
        dias_comparacao: diasComparacao || undefined,
        sincronizacao_base_id: sincronizacaoBaseId || undefined
      }
    });

    return {
      success: response.data.success,
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
 * Converter item de sincronização para formato do sistema de impressão
 */
export const converterItemSincronizacaoParaImpressao = (item: ItemSincronizacao) => {
  return {
    id: item.produto_id.toString(),
    name: item.nome_produto,
    code: item.codigo_produto || item.produto_id.toString(),
    price: item.preco_venda || 0,
    quantity: item.quantidade,
    category: item.categoria || 'Sem categoria',
    barcode: item.codigo_barras || '',
    description: item.nome_produto,
    createdAt: new Date(),
    updatedAt: new Date(),
    // Campos extras
    origem: item.origem,
    tipo_movimento: item.tipo_movimento,
    quantidade_atual: item.quantidade_atual,
    quantidade_anterior: item.quantidade_anterior,
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
  importarNFCompra,
  importarMovimentacaoEstoque,
  converterItemImportadoParaImpressao,
  // Novas funções de sincronização
  sincronizarEstoque,
  listarSincronizacoes,
  importarViaSincronizacao,
  converterItemSincronizacaoParaImpressao,
};
