/**
 * Service de Integração com Omie ERP
 * API: https://developer.omie.com.br/service-list/
 *
 * A Omie usa app_key + app_secret (sem OAuth).
 */

import api from './api';
import { handleApiError } from '../utils/errorHandler';
import type { ApiResponse } from '../types/api.types';

// ===== TIPOS OMIE =====

export interface OmieProduto {
  codigo_produto: number;
  codigo_produto_integracao?: string;
  codigo?: string;       // SKU / código interno
  descricao: string;
  codigo_barras?: string;
  unidade?: string;
  ncm?: string;
  valor_unitario?: number;
  preco_custo?: number;
  familia_produto?: string;
  ativo?: string;        // "S" ou "N"
  quantidade_estoque?: number;
}

export interface OmieEstoqueProduto {
  codigo_produto: number;
  codigo_produto_integracao?: string;
  descricao?: string;
  unidade?: string;
  saldo_fisico: number;
  saldo_fisico_empresa?: number;
  saldo_reservado?: number;
  valor_unitario?: number;
}

export interface OmieMovimentacaoEstoque {
  codigo_movimento?: number;
  codigo_produto?: number;
  descricao_produto?: string;
  data_movimentacao?: string;
  hora_movimentacao?: string;
  tipo_movimento?: string;  // "E" = entrada, "S" = saída
  quantidade: number;
  valor_unitario?: number;
  valor_total?: number;
  numero_documento?: string;
  observacao?: string;
}

export interface OmieNotaEntrada {
  codigo_nota_fiscal?: number;
  numero_nota: string;
  serie_nota?: string;
  data_entrada?: string;
  data_emissao?: string;
  codigo_fornecedor?: number;
  razao_social_fornecedor?: string;
  valor_total_nota?: number;
  itens: OmieItemNota[];
}

export interface OmieItemNota {
  codigo_produto?: number;
  descricao?: string;
  quantidade: number;
  valor_unitario?: number;
  unidade?: string;
  codigo_barras?: string;
  codigo_interno?: string;
}

export interface OmiePaginacao {
  pagina: number;
  total_de_paginas: number;
  registros: number;
  total_de_registros: number;
}

// ===== TIPOS IMPORTAÇÃO PARA ETIQUETAS =====

export interface ItemImportacaoEtiqueta {
  produto_id: number | string;
  codigo_produto?: string;
  nome_produto: string;
  referencia?: string;
  codigo_barras?: string;
  quantidade: number;
  preco_venda: number;
  categoria?: string;
  categoria_id?: number | string;
  origem?: string;   // "NF_ENTRADA", "MOVIMENTACAO"
  documento?: string;
}

export interface ImportacaoEtiquetasResponse {
  total_itens: number;
  total_quantidade: number;
  itens: ItemImportacaoEtiqueta[];
  origem?: string;
  documento?: string;
}

// ===== FUNÇÕES DO SERVIÇO =====

/**
 * Testa a conexão com a API Omie
 */
export const testarConexao = async (
  integracaoId: number
): Promise<ApiResponse<{ conectado: boolean }>> => {
  try {
    const response = await api.post<{
      success: boolean;
      data: { conectado: boolean };
      message?: string;
    }>(`/integracoes/${integracaoId}/omie/testar`);

    return {
      success: response.data.success,
      data: response.data.data,
      message: response.data.message,
    };
  } catch (error: any) {
    return { success: false, message: handleApiError(error) };
  }
};

/**
 * Lista produtos do Omie
 */
export const getProdutos = async (
  integracaoId: number,
  options?: { pagina?: number; filtro?: string }
): Promise<ApiResponse<{ data: OmieProduto[]; paginacao: OmiePaginacao }>> => {
  try {
    const params = new URLSearchParams();
    if (options?.pagina) params.append('pagina', options.pagina.toString());
    if (options?.filtro) params.append('filtro', options.filtro);

    const response = await api.get<{
      success: boolean;
      data: OmieProduto[];
      paginacao: OmiePaginacao;
    }>(`/integracoes/${integracaoId}/omie/produtos?${params.toString()}`);

    return {
      success: true,
      data: { data: response.data.data, paginacao: response.data.paginacao },
    };
  } catch (error: any) {
    return { success: false, message: handleApiError(error) };
  }
};

/**
 * Consulta posição de estoque
 */
export const getEstoque = async (
  integracaoId: number,
  options?: { pagina?: number; codigoProduto?: number }
): Promise<ApiResponse<{ data: OmieEstoqueProduto[]; paginacao: OmiePaginacao }>> => {
  try {
    const params = new URLSearchParams();
    if (options?.pagina) params.append('pagina', options.pagina.toString());
    if (options?.codigoProduto) params.append('codigo_produto', options.codigoProduto.toString());

    const response = await api.get<{
      success: boolean;
      data: OmieEstoqueProduto[];
      paginacao: OmiePaginacao;
    }>(`/integracoes/${integracaoId}/omie/estoque?${params.toString()}`);

    return {
      success: true,
      data: { data: response.data.data, paginacao: response.data.paginacao },
    };
  } catch (error: any) {
    return { success: false, message: handleApiError(error) };
  }
};

/**
 * Lista movimentações de estoque por período
 * dataInicial e dataFinal no formato DD/MM/AAAA
 */
export const getMovimentacoes = async (
  integracaoId: number,
  dataInicial: string,
  dataFinal: string,
  options?: { pagina?: number; tipoMovimento?: 'E' | 'S' }
): Promise<ApiResponse<{ data: OmieMovimentacaoEstoque[]; paginacao: OmiePaginacao }>> => {
  try {
    const params = new URLSearchParams({
      data_inicial: dataInicial,
      data_final: dataFinal,
    });
    if (options?.pagina) params.append('pagina', options.pagina.toString());
    if (options?.tipoMovimento) params.append('tipo_movimento', options.tipoMovimento);

    const response = await api.get<{
      success: boolean;
      data: OmieMovimentacaoEstoque[];
      paginacao: OmiePaginacao;
    }>(`/integracoes/${integracaoId}/omie/movimentacoes?${params.toString()}`);

    return {
      success: true,
      data: { data: response.data.data, paginacao: response.data.paginacao },
    };
  } catch (error: any) {
    return { success: false, message: handleApiError(error) };
  }
};

/**
 * Busca a última Nota de Entrada registrada no Omie
 */
export const getUltimaNotaEntrada = async (
  integracaoId: number
): Promise<ApiResponse<OmieNotaEntrada>> => {
  try {
    const response = await api.get<{
      success: boolean;
      data: OmieNotaEntrada | null;
      message?: string;
    }>(`/integracoes/${integracaoId}/omie/ultima-nota-entrada`);

    return {
      success: response.data.success,
      data: response.data.data ?? undefined,
      message: response.data.message,
    };
  } catch (error: any) {
    return { success: false, message: handleApiError(error) };
  }
};

/**
 * Busca a última movimentação de estoque
 */
export const getUltimaMovimentacao = async (
  integracaoId: number
): Promise<ApiResponse<OmieMovimentacaoEstoque>> => {
  try {
    const response = await api.get<{
      success: boolean;
      data: OmieMovimentacaoEstoque | null;
      message?: string;
    }>(`/integracoes/${integracaoId}/omie/ultima-movimentacao`);

    return {
      success: response.data.success,
      data: response.data.data ?? undefined,
      message: response.data.message,
    };
  } catch (error: any) {
    return { success: false, message: handleApiError(error) };
  }
};

/**
 * Importa itens de uma Nota de Entrada para etiquetas
 */
export const importarNFEntrada = async (
  integracaoId: number,
  numeroNf: string,
  serie?: string
): Promise<ApiResponse<ImportacaoEtiquetasResponse>> => {
  try {
    const response = await api.post<{
      success: boolean;
      data: ImportacaoEtiquetasResponse;
      message?: string;
    }>(`/integracoes/${integracaoId}/omie/importar/nf-entrada`, {
      numero_nf: numeroNf,
      serie: serie || null,
    });

    return {
      success: response.data.success,
      data: response.data.data,
      message: response.data.message,
    };
  } catch (error: any) {
    return { success: false, message: handleApiError(error) };
  }
};

/**
 * Importa movimentações de estoque por período para etiquetas
 * dataInicial e dataFinal no formato DD/MM/AAAA
 */
export const importarMovimentacao = async (
  integracaoId: number,
  dataInicial: string,
  dataFinal: string,
  agruparPorProduto: boolean = true
): Promise<ApiResponse<ImportacaoEtiquetasResponse>> => {
  try {
    const response = await api.post<{
      success: boolean;
      data: ImportacaoEtiquetasResponse;
      message?: string;
    }>(`/integracoes/${integracaoId}/omie/importar/movimentacao`, {
      data_inicial: dataInicial,
      data_final: dataFinal,
      agrupar_por_produto: agruparPorProduto,
    });

    return {
      success: response.data.success,
      data: response.data.data,
      message: response.data.message,
    };
  } catch (error: any) {
    return { success: false, message: handleApiError(error) };
  }
};

/**
 * Converter item importado para formato do sistema de impressão
 */
export const converterItemParaImpressao = (item: ItemImportacaoEtiqueta) => {
  return {
    id: item.produto_id.toString(),
    name: item.nome_produto,
    code: item.codigo_produto || item.produto_id.toString(),
    sku: item.codigo_produto || item.produto_id.toString(),
    price: item.preco_venda || 0,
    quantity: item.quantidade,
    category: item.categoria || 'Sem categoria',
    barcode: item.codigo_barras || '',
    description: item.nome_produto,
    createdAt: new Date(),
    updatedAt: new Date(),
    origem: item.origem,
    documento: item.documento,
    referencia: item.referencia,
  };
};

export default {
  testarConexao,
  getProdutos,
  getEstoque,
  getMovimentacoes,
  getUltimaNotaEntrada,
  getUltimaMovimentacao,
  importarNFEntrada,
  importarMovimentacao,
  converterItemParaImpressao,
};
