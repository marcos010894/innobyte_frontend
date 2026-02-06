import api from './api';
import type { LabelTemplate, LabelConfig, LabelElement, PagePrintConfig } from '@/types/label.types';

export interface CreateTemplateRequest {
  id_empresa: number;
  nome: string;
  descricao?: string;
  categoria?: string;
  config: LabelConfig;
  elements: LabelElement[];
  thumbnail?: string;
  page_print_config?: PagePrintConfig;
  compartilhado?: boolean;
}

export interface UpdateTemplateRequest {
  nome?: string;
  descricao?: string;
  categoria?: string;
  config?: LabelConfig;
  elements?: LabelElement[];
  thumbnail?: string;
  page_print_config?: PagePrintConfig;
  compartilhado?: boolean;
}

export interface ListTemplatesParams {
  categoria?: string;
  compartilhado?: boolean;
  nome?: string;
  skip?: number;
  limit?: number;
}

export interface TemplateResponse {
  id: string;
  id_empresa: string;
  id_usuario_criador: string;
  nome: string;
  descricao?: string;
  categoria?: string;
  config: LabelConfig;
  elements: LabelElement[];
  thumbnail?: string;
  page_print_config?: PagePrintConfig;
  compartilhado: boolean;
  created_at: string;
  updated_at: string;
}

class TemplateService {
  private baseUrl = '/templates';

  /**
   * Lista todos os templates acessíveis pelo usuário
   * (templates da empresa + compartilhados)
   */
  async list(params?: ListTemplatesParams): Promise<TemplateResponse[]> {
    const response = await api.get(this.baseUrl, { params });
    return response.data;
  }

  /**
   * Busca um template específico por ID
   */
  async getById(id: string): Promise<TemplateResponse> {
    const response = await api.get(`${this.baseUrl}/${id}`);
    return response.data;
  }

  /**
   * Cria um novo template
   */
  async create(data: CreateTemplateRequest): Promise<TemplateResponse> {
    const response = await api.post(this.baseUrl, data);
    return response.data;
  }

  /**
   * Atualiza um template existente
   */
  async update(id: string, data: UpdateTemplateRequest): Promise<TemplateResponse> {
    const response = await api.put(`${this.baseUrl}/${id}`, data);
    return response.data;
  }

  /**
   * Deleta um template
   */
  async delete(id: string): Promise<void> {
    console.log('🗑️ [templateService] Chamando DELETE para:', `${this.baseUrl}/${id}`);
    try {
      await api.delete(`${this.baseUrl}/${id}`);
      console.log('🗑️ [templateService] DELETE concluído com sucesso!');
    } catch (err) {
      console.error('❌ [templateService] Erro no DELETE:', err);
      throw err;
    }
  }

  /**
   * Marca/desmarca template como compartilhado
   * (Apenas MASTER)
   */
  async compartilhar(id: string, compartilhado: boolean): Promise<TemplateResponse> {
    const response = await api.patch(`${this.baseUrl}/${id}/compartilhar`, {
      compartilhado,
    });
    return response.data;
  }

  /**
   * Converte TemplateResponse para LabelTemplate (formato frontend)
   */
  convertToLabelTemplate(response: TemplateResponse): LabelTemplate {
    if (!response) {
      console.error('❌ [convertToLabelTemplate] Response inválida/nula');
      throw new Error('Resposta da API inválida ao converter template');
    }

    // Validar visualização de debug
    console.log('🔄 [convertToLabelTemplate] Validando config...');

    // Validar que config existe e tem estrutura mínima
    const config = response.config || {
      name: response.nome || 'Template sem nome',
      width: 50,
      height: 30,
      unit: 'mm',
      backgroundColor: '#FFFFFF',
      padding: 0,
      showGrid: true,
      gridSize: 10,
      snapToGrid: false,
    };

    // Garantir que elements é um array válido
    let elements = response.elements || [];

    // Se elements for string (JSON), fazer parse
    if (typeof elements === 'string') {
      try {
        elements = JSON.parse(elements);
      } catch (err) {
        console.error('❌ [convertToLabelTemplate] Erro ao fazer parse de elements:', err);
        elements = [];
      }
    }

    // Se não for array, tentar extrair de alguma propriedade
    if (!Array.isArray(elements)) {
      console.warn('⚠️ [convertToLabelTemplate] Elements não é array:', elements);
      elements = [];
    }

    // Datas seguras
    const safeDate = (dateStr?: string) => {
      if (!dateStr) return new Date();
      const d = new Date(dateStr);
      return isNaN(d.getTime()) ? new Date() : d;
    };

    const converted = {
      id: response.id,
      config: config,
      elements: elements,
      createdAt: safeDate(response.created_at),
      updatedAt: safeDate(response.updated_at),
      thumbnail: response.thumbnail || undefined,
      category: response.categoria || undefined,
      compartilhado: response.compartilhado || false,
      pagePrintConfig: response.page_print_config || undefined,
    };

    console.log('✅ [convertToLabelTemplate] Template convertido final:', converted);
    console.log('✅ [convertToLabelTemplate] Elements no template convertido:', converted.elements);
    console.log('✅ [convertToLabelTemplate] Elements.length no convertido:', converted.elements.length);

    return converted;
  }

  /**
   * Converte LabelTemplate para CreateTemplateRequest (para API)
   * @param template Template a ser convertido
   * @param includeCompartilhado Se deve incluir o campo compartilhado (apenas master)
   */
  convertToCreateRequest(template: LabelTemplate, includeCompartilhado: boolean = false): CreateTemplateRequest {
    // Obter id_empresa do localStorage - prioriza user_data (novo) ou user (legado)
    const userData = localStorage.getItem('user_data') || localStorage.getItem('user');
    let id_empresa: number | null = null;

    if (userData) {
      try {
        const user = JSON.parse(userData);
        // Primeiro tenta id_empresa direto, depois primeira empresa da lista
        if (user.id_empresa) {
          id_empresa = user.id_empresa;
        } else if (user.empresas && user.empresas.length > 0) {
          id_empresa = user.empresas[0].id;
        }
      } catch (err) {
        console.error('Erro ao parsear dados do usuário:', err);
      }
    }

    // Se não encontrou empresa, usa 1 apenas para master (fallback)
    const userType = localStorage.getItem('user_type');
    if (!id_empresa && userType === 'master') {
      id_empresa = 1;
    }

    if (!id_empresa) {
      console.error('⚠️ Nenhuma empresa encontrada para o usuário. Verifique o login.');
    }

    const request: CreateTemplateRequest = {
      id_empresa: id_empresa || 1,
      nome: template.config.name,
      descricao: template.config.description,
      categoria: template.category,
      config: template.config,
      elements: template.elements,
      thumbnail: template.thumbnail,
      page_print_config: template.pagePrintConfig,
    };

    // Apenas inclui compartilhado se permitido (master)
    if (includeCompartilhado) {
      request.compartilhado = template.compartilhado || false;
    }

    return request;
  }
}

export const templateService = new TemplateService();
export default templateService;
