import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useTemplates from '@/hooks/useTemplates';
import type { LabelTemplate } from '@/types/label.types';

const TemplatesPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  
  const { templates, loading, error, deleteTemplate, refresh } = useTemplates();

  const handleDelete = async (id: string) => {
    if (confirm('Deseja realmente excluir este template?')) {
      try {
        await deleteTemplate(id);
        alert('Template excluído com sucesso!');
      } catch (err: any) {
        alert(`Erro ao excluir template: ${err.message}`);
      }
    }
  };

  const handleDuplicate = async (template: LabelTemplate) => {
    const duplicated: LabelTemplate = {
      ...template,
      id: crypto.randomUUID(),
      config: {
        ...template.config,
        name: `${template.config?.name || 'Template'} (Cópia)`,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    try {
      // Salvar localmente por enquanto (pode implementar endpoint de duplicar depois)
      const saved = localStorage.getItem('labelTemplates') || '[]';
      const local = JSON.parse(saved);
      local.push(duplicated);
      localStorage.setItem('labelTemplates', JSON.stringify(local));
      
      alert('Template duplicado! (Salvo localmente)');
      await refresh();
    } catch (err: any) {
      alert(`Erro ao duplicar template: ${err.message}`);
    }
  };

  const filteredTemplates = templates.filter((t) => {
    // Verificar se config e config.name existem antes de acessar
    const name = t.config?.name || '';
    return name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-600">Carregando templates...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Erro ao carregar templates</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => refresh()}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Meus Templates</h1>
        <p className="text-gray-600">Gerencie seus modelos de etiquetas salvos</p>
      </div>

      {/* Barra de ações */}
      <div className="bg-white rounded-lg shadow p-4 mb-6 flex items-center justify-between">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            <input
              type="text"
              placeholder="Buscar templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>

        <button
          onClick={() => navigate('/editor')}
          className="ml-4 px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 font-medium"
        >
          <i className="fas fa-plus mr-2"></i>
          Novo Template
        </button>
      </div>

      {/* Grid de Templates */}
      {filteredTemplates.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <i className="fas fa-tags text-6xl text-gray-300 mb-4"></i>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            {templates.length === 0 ? 'Nenhum template criado' : 'Nenhum resultado encontrado'}
          </h3>
          <p className="text-gray-500 mb-6">
            {templates.length === 0
              ? 'Comece criando seu primeiro modelo de etiqueta'
              : 'Tente buscar por outro termo'}
          </p>
          {templates.length === 0 && (
            <button
              onClick={() => navigate('/editor')}
              className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-blue-600 font-medium"
            >
              <i className="fas fa-plus mr-2"></i>
              Criar Primeiro Template
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              className="bg-white rounded-lg shadow hover:shadow-xl transition-shadow overflow-hidden group"
            >
              {/* Preview */}
              <div
                className="h-48 bg-gray-100 flex items-center justify-center p-4 border-b cursor-pointer"
                onClick={() => navigate(`/editor?template=${template.id}`)}
                style={{ backgroundColor: template.config?.backgroundColor || '#FFFFFF' }}
              >
                <div className="text-center">
                  <i className="fas fa-tag text-5xl text-gray-400 mb-2"></i>
                  <p className="text-xs text-gray-500">
                    {template.elements.length} elemento{template.elements.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              {/* Info */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-gray-800 truncate flex-1">
                    {template.config?.name || 'Template sem nome'}
                  </h3>
                  {/* Badge Compartilhado */}
                  {template.compartilhado && (
                    <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full flex items-center gap-1">
                      <i className="fas fa-share-alt text-xs"></i>
                      Compartilhado
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mb-3">
                  {template.config?.width || 50} × {template.config?.height || 30} {template.config?.unit || 'mm'}
                </p>

                <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
                  <span>
                    <i className="far fa-calendar mr-1"></i>
                    {new Date(template.updatedAt).toLocaleDateString()}
                  </span>
                </div>

                {/* Ações */}
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/editor?template=${template.id}`)}
                    className="flex-1 px-3 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 text-sm font-medium"
                  >
                    <i className="fas fa-edit mr-1"></i>
                    Editar
                  </button>
                  <button
                    onClick={() => handleDuplicate(template)}
                    className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                    title="Duplicar"
                  >
                    <i className="fas fa-copy"></i>
                  </button>
                  <button
                    onClick={() => handleDelete(template.id)}
                    className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                    title="Excluir"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Estatísticas */}
      {templates.length > 0 && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-primary">
                <i className="fas fa-tags text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total de Templates</p>
                <p className="text-2xl font-bold text-gray-800">{templates.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <i className="fas fa-layer-group text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total de Elementos</p>
                <p className="text-2xl font-bold text-gray-800">
                  {templates.reduce((sum, t) => sum + t.elements.length, 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                <i className="fas fa-clock text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Última Atualização</p>
                <p className="text-sm font-semibold text-gray-800">
                  {templates.length > 0
                    ? new Date(
                        Math.max(...templates.map((t) => new Date(t.updatedAt).getTime()))
                      ).toLocaleDateString()
                    : '-'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplatesPage;
