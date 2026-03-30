/**
 * Service de Integração com Bling V3
 * API: https://developer.bling.com.br/
 */

import api from './api';
import { handleApiError } from '../utils/errorHandler';
import type { ApiResponse } from '../types/api.types';

// ===== TIPOS BLING V3 =====

export interface BlingProduto {
  id: number;
  nome: string;
  codigo?: string;       // SKU
  preco: number;
  gtin?: string;        // EAN
  unidade?: string;
  situacao?: string;     // "A", "I"
  estoque?: number;
  idCategoria?: number;
}

export interface BlingCategoria {
  id: number;
  descricao: string;
}

export interface BlingPaginacao {
  pagina: number;
  total_de_paginas: number;
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
  origem?: string;  // "NF", "MOVIMENTACAO"
  documento?: string;
}

export interface BlingNotaFiscal {
  id: number;
  numero: string;
  serie?: string;
  dataEmissao: string;
  total: number;
  itens: {
    id: number;
    codigo?: string;
    descricao: string;
    quantidade: number;
    valorUnitario: number;
    unidade?: string;
  }[];
}

export interface BlingMovimentacao {
  id: number;
  data: string;
  quantidade: number;
  tipo: 'E' | 'S'; // E = Entrada, S = Saída
  observacoes?: string;
  produto: { id: number; nome?: string; codigo?: string };
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
 * Testa a conexão com a API Bling V3
 */
export const testarConexao = async (
  integracaoId: number
): Promise<ApiResponse<{ conectado: boolean }>> => {
  try {
    const response = await api.post<{
      success: boolean;
      data: { conectado: boolean };
      message?: string;
    }>(`/integracoes/${integracaoId}/bling/testar`);

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
 * Lista produtos do Bling
 */
export const getProdutos = async (
  integracaoId: number,
  options?: { pagina?: number; filtro?: string; categoriaId?: number }
): Promise<ApiResponse<{ data: BlingProduto[]; paginacao: BlingPaginacao }>> => {
  try {
    const params = new URLSearchParams();
    if (options?.pagina) params.append('pagina', options.pagina.toString());
    if (options?.filtro) params.append('filtro', options.filtro);
    if (options?.categoriaId) params.append('categoria_id', options.categoriaId.toString());

    const response = await api.get<{
      success: boolean;
      data: BlingProduto[];
      paginacao: BlingPaginacao;
    }>(`/integracoes/${integracaoId}/bling/produtos?${params.toString()}`);

    return {
      success: true,
      data: { data: response.data.data, paginacao: response.data.paginacao },
    };
  } catch (error: any) {
    return { success: false, message: handleApiError(error) };
  }
};

/**
 * Lista categorias de produtos do Bling
 */
export const getCategorias = async (
  integracaoId: number
): Promise<ApiResponse<BlingCategoria[]>> => {
  try {
    const response = await api.get<{
      success: boolean;
      data: BlingCategoria[];
    }>(`/integracoes/${integracaoId}/bling/categorias`);

    return {
      success: true,
      data: response.data.data,
    };
  } catch (error: any) {
    return { success: false, message: handleApiError(error) };
  }
};

/**
 * Troca o código de autorização pelos tokens iniciais
 */
export const exchangeCode = async (
  integracaoId: number,
  code: string
): Promise<ApiResponse<{ conectado: boolean }>> => {
  try {
    const response = await api.post<{
      success: boolean;
      data: { conectado: boolean };
      message?: string;
    }>(`/integracoes/${integracaoId}/bling/exchange`, { code });

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
 * Busca a última Nota Fiscal do Bling
 */
export const getUltimaNF = async (
  integracaoId: number
): Promise<ApiResponse<BlingNotaFiscal>> => {
  try {
    const response = await api.get<{
      success: boolean;
      data: BlingNotaFiscal;
      message?: string;
    }>(`/integracoes/${integracaoId}/bling/ultima-nfe`);

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
 * Busca a última movimentação de estoque do Bling
 */
export const getUltimaMovimentacao = async (
  integracaoId: number
): Promise<ApiResponse<BlingMovimentacao>> => {
  try {
    const response = await api.get<{
      success: boolean;
      data: BlingMovimentacao;
      message?: string;
    }>(`/integracoes/${integracaoId}/bling/ultima-movimentacao`);

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
 * Importa itens de uma Nota Fiscal para etiquetas
 */
export const importarNF = async (
  integracaoId: number,
  numeroNf: string,
  serie?: string
): Promise<ApiResponse<ImportacaoEtiquetasResponse>> => {
  try {
    const response = await api.post<{
      success: boolean;
      data: ImportacaoEtiquetasResponse;
      message?: string;
    }>(`/integracoes/${integracaoId}/bling/importar/nf`, {
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
 * Converter produto do Bling para formato do sistema de impressão
 */
export const converterProdutoParaImpressao = (produto: BlingProduto) => {
  return {
    id: produto.id.toString(),
    name: produto.nome,
    code: produto.codigo || produto.id.toString(),
    sku: produto.codigo || produto.id.toString(),
    price: produto.preco || 0,
    quantity: produto.estoque || 0,
    category: 'Sem categoria', // Precisaria cruzar com lista de categorias se quisermos nome
    barcode: produto.gtin || '',
    description: produto.nome,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
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
  getCategorias,
  importarNF,
  exchangeCode,
  getUltimaNF,
  getUltimaMovimentacao,
  converterProdutoParaImpressao,
  converterItemParaImpressao,
};
