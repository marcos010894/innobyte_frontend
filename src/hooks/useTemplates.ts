import { useState, useEffect, useCallback } from 'react';
import templateService, { type ListTemplatesParams } from '@/services/templateService';
import type { LabelTemplate } from '@/types/label.types';

interface UseTemplatesReturn {
  templates: LabelTemplate[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  createTemplate: (template: LabelTemplate) => Promise<void>;
  updateTemplate: (id: string, template: LabelTemplate) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
  compartilharTemplate: (id: string, compartilhado: boolean) => Promise<void>;
}

export function useTemplates(params?: ListTemplatesParams): UseTemplatesReturn {
  const [templates, setTemplates] = useState<LabelTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTemplates = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await templateService.list(params);
      const converted = response.map(templateService.convertToLabelTemplate);
      
      setTemplates(converted);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Erro ao carregar templates');
      console.error('Erro ao carregar templates:', err);
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  const createTemplate = async (template: LabelTemplate) => {
    try {
      setError(null);
      const request = templateService.convertToCreateRequest(template);
      await templateService.create(request);
      await loadTemplates(); // Recarrega lista
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || err.message || 'Erro ao criar template';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const updateTemplate = async (id: string, template: LabelTemplate) => {
    try {
      setError(null);
      await templateService.update(id, {
        nome: template.config.name,
        descricao: template.config.description,
        categoria: template.category,
        config: template.config,
        elements: template.elements,
        thumbnail: template.thumbnail,
      });
      await loadTemplates(); // Recarrega lista
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || err.message || 'Erro ao atualizar template';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const deleteTemplate = async (id: string) => {
    try {
      setError(null);
      await templateService.delete(id);
      await loadTemplates(); // Recarrega lista
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || err.message || 'Erro ao deletar template';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const compartilharTemplate = async (id: string, compartilhado: boolean) => {
    try {
      setError(null);
      await templateService.compartilhar(id, compartilhado);
      await loadTemplates(); // Recarrega lista
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || err.message || 'Erro ao compartilhar template';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  return {
    templates,
    loading,
    error,
    refresh: loadTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    compartilharTemplate,
  };
}

export default useTemplates;
