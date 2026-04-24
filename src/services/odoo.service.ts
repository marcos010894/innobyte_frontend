/**
 * Service de Integração com Odoo ERP (via Innobyte Labels API)
 */

import api from './api';
import { handleApiError } from '../utils/errorHandler';
import type { ApiResponse } from '../types/api.types';

// ===== TIPOS ODOO (Innobyte API) =====

export interface OdooProduto {
  id_produto: number;
  sku?: string;
  descricao: string;
  codigo_barras?: string;
  unidade?: string;
  preco_venda: number;
  preco_custo: number;
  estoque_atual: number;
}

export interface OdooPaginacao {
  total_registros: number;
  total_paginas: number;
  pagina_atual: number;
}

export interface OdooNotaFiscalHeader {
  numero_nf: string;
  serie?: string;
  fornecedor: string;
  data: string;
}

export interface OdooItemNota {
  sku?: string;
  descricao: string;
  quantidade: number;
  preco_unitario: number;
  codigo_barras?: string;
}

export interface OdooMovimentacao {
  produto: {
    sku?: string;
    descricao: string;
    preco_venda: number;
  };
  detalhes_movimento: {
    data: string;
    tipo: string;
    quantidade: number;
    valor: number;
    origem?: string;
  };
}

// ===== TIPOS IMPORTAÇÃO PARA ETIQUETAS =====

export interface ItemImportacaoEtiqueta {
  produto_id?: number | string;
  codigo_produto?: string;
  nome_produto: string;
  codigo_barras?: string;
  quantidade: number;
  preco_venda: number;
  origem: string;
  documento?: string;
}

export interface ImportacaoEtiquetasResponse {
  total_itens: number;
  total_quantidade: number;
  itens: ItemImportacaoEtiqueta[];
  origem: string;
  documento: string;
}

// ===== FUNÇÕES DO SERVIÇO =====

/**
 * Testa a conexão com a API Odoo
 */
export const testarConexao = async (
  integracaoId: number
): Promise<ApiResponse<{ conectado: boolean }>> => {
  try {
    const response = await api.post<{
      success: boolean;
      data: { conectado: boolean };
      message?: string;
    }>(`/integracoes/${integracaoId}/odoo/testar`);

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
 * Lista produtos do Odoo
 */
export const getProdutos = async (
  integracaoId: number,
  options?: { pagina?: number; filtro?: string }
): Promise<ApiResponse<{ data: OdooProduto[]; paginacao: OdooPaginacao }>> => {
  try {
    const params = new URLSearchParams();
    if (options?.pagina) params.append('pagina', options.pagina.toString());
    if (options?.filtro) params.append('filtro', options.filtro);

    const response = await api.get<{
      success: boolean;
      data: OdooProduto[];
      paginacao: OdooPaginacao;
    }>(`/integracoes/${integracaoId}/odoo/produtos?${params.toString()}`);

    return {
      success: true,
      data: { data: response.data.data, paginacao: response.data.paginacao },
    };
  } catch (error: any) {
    return { success: false, message: handleApiError(error) };
  }
};

/**
 * Lista notas fiscais de entrada
 */
export const getNotasFiscais = async (
  integracaoId: number,
  numeroNf?: string
): Promise<ApiResponse<OdooNotaFiscalHeader[]>> => {
  try {
    const params = new URLSearchParams();
    if (numeroNf) params.append('numero_nf', numeroNf);

    const response = await api.get<{
      success: boolean;
      data: OdooNotaFiscalHeader[];
    }>(`/integracoes/${integracaoId}/odoo/notas-fiscais?${params.toString()}`);

    return {
      success: true,
      data: response.data.data,
    };
  } catch (error: any) {
    return { success: false, message: handleApiError(error) };
  }
};

/**
 * Lista movimentações de estoque (entradas)
 * dataInicial e dataFinal no formato YYYY-MM-DD
 */
export const getMovimentacoes = async (
  integracaoId: number,
  options: { data_inicial: string; data_final: string }
): Promise<ApiResponse<{ data: OdooMovimentacao[] }>> => {
  try {
    const params = new URLSearchParams(options);

    const response = await api.get<{
      success: boolean;
      data: OdooMovimentacao[];
    }>(`/integracoes/${integracaoId}/odoo/movimentacoes?${params.toString()}`);

    return {
      success: true,
      data: { data: response.data.data },
    };
  } catch (error: any) {
    return { success: false, message: handleApiError(error) };
  }
};

/**
 * Importa itens de uma Nota de Entrada para etiquetas
 */
export const importarNf = async (
  integracaoId: number,
  numeroNf: string
): Promise<ApiResponse<ImportacaoEtiquetasResponse>> => {
  try {
    const response = await api.post<{
      success: boolean;
      data: ImportacaoEtiquetasResponse;
      message?: string;
    }>(`/integracoes/${integracaoId}/odoo/importar/nf`, {
      numero_nf: numeroNf,
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
 */
export const importarMovimentacao = async (
  integracaoId: number,
  dataInicial: string,
  data_final: string,
  agruparPorProduto: boolean = true
): Promise<ApiResponse<ImportacaoEtiquetasResponse>> => {
  try {
    const response = await api.post<{
      success: boolean;
      data: ImportacaoEtiquetasResponse;
      message?: string;
    }>(`/integracoes/${integracaoId}/odoo/importar/movimentacao`, {
      data_inicial: dataInicial,
      data_final: data_final,
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
 * Converter item Odoo para formato do sistema de impressão
 */
export const converterItemParaImpressao = (item: any) => {
  // 1. Se for um OdooProduto (do Catálogo)
  if ('id_produto' in item) {
    return {
      id: item.sku || item.id_produto.toString(),
      name: item.descricao,
      code: item.sku || item.id_produto.toString(),
      sku: item.sku || '',
      price: item.preco_venda || 0,
      quantity: item.estoque_atual || 0,
      category: 'Odoo',
      barcode: item.codigo_barras || '',
      description: item.descricao,
      createdAt: new Date(),
      updatedAt: new Date(),
      source: 'odoo'
    };
  }
  
  // 2. Se for um OdooMovimentacao (da lista de Movimentações)
  if ('detalhes_movimento' in item) {
    return {
      id: item.produto.sku || Math.random().toString(),
      name: item.produto.descricao,
      code: item.produto.sku || '',
      sku: item.produto.sku || '',
      price: item.produto.preco_venda || 0,
      quantity: item.detalhes_movimento.quantidade || 0,
      category: 'Odoo',
      barcode: '',
      description: item.produto.descricao,
      createdAt: new Date(),
      updatedAt: new Date(),
      source: 'odoo',
      origem: item.detalhes_movimento.origem,
      documento: item.detalhes_movimento.data
    };
  }

  // 3. Fallback para ItemImportacaoEtiqueta (retorno unificado do backend)
  return {
    id: (item.produto_id || item.codigo_produto || Math.random()).toString(),
    name: item.nome_produto,
    code: item.codigo_produto || item.produto_id?.toString() || '',
    sku: item.codigo_produto || item.produto_id?.toString() || '',
    price: item.preco_venda || 0,
    quantity: item.quantidade,
    category: 'Odoo',
    barcode: item.codigo_barras || '',
    description: item.nome_produto,
    createdAt: new Date(),
    updatedAt: new Date(),
    source: 'odoo',
    origem: item.origem,
    documento: item.documento,
  };
};

export default {
  testarConexao,
  getProdutos,
  getNotasFiscais,
  getMovimentacoes,
  importarNf,
  importarMovimentacao,
  converterItemParaImpressao,
};
