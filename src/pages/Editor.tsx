import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import html2canvas from 'html2canvas';
import ElementsToolbar from '@/components/labels/ElementsToolbar';
import LabelCanvas from '@/components/labels/LabelCanvas';
import PropertiesPanel from '@/components/labels/PropertiesPanel';
import AdvancedConfigModal from '@/components/labels/AdvancedConfigModal';
import templateService from '@/services/templateService';
import { useAuth } from '@/hooks/useAuth';
import type { LabelTemplate, LabelConfig, LabelElement, ElementType } from '@/types/label.types';
import { COMMON_LABEL_SIZES as LABEL_SIZES } from '@/types/label.types';

const Editor: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const canvasWrapperRef = useRef<HTMLDivElement>(null);

  // Estado inicial do template
  const [template, setTemplate] = useState<LabelTemplate>({
    id: '', // Deixar vazio para templates novos
    config: {
      name: 'Novo Template',
      width: 50,
      height: 30,
      unit: 'mm',
      backgroundColor: '#FFFFFF',
      padding: 0,
      showGrid: true,
      gridSize: 10,
      snapToGrid: false,
      // Configurações visuais ativadas por padrão
      showCenterLine: true,
      showMargins: true,
      showBorders: false,
      // Margens padrão
      marginTop: 5,
      marginBottom: 5,
      marginLeft: 5,
      marginRight: 5,
    },
    elements: [],
    compartilhado: false, // SEMPRE começa como false (apenas master pode alterar)
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const [isNewTemplate, setIsNewTemplate] = useState(true); // Flag para indicar se é novo

  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(2); // Zoom inicial ainda maior para melhor visualização
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showAdvancedConfig, setShowAdvancedConfig] = useState(false);
  const [showVariablesHelp, setShowVariablesHelp] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Carregar template se fornecido via query param (da API)
  useEffect(() => {
    const templateId = searchParams.get('template');
    if (templateId) {
      loadTemplate(templateId);
    }
  }, [searchParams]);

  const loadTemplate = async (id: string) => {
    setIsLoading(true);
    try {
      const response = await templateService.getById(id);
      const converted = templateService.convertToLabelTemplate(response);
      
      // IMPORTANTE: Se não for master, sempre forçar compartilhado = false
      // Isso evita que clientes tentem salvar templates compartilhados
      if (user?.tipo !== 'master') {
        converted.compartilhado = false;
      }
      
      setTemplate(converted);
      setIsNewTemplate(false); // Template carregado da API
    } catch (err: any) {
      console.error('Erro ao carregar template:', err);
      alert(`Erro ao carregar template: ${err.response?.data?.detail || err.message}`);
      
      // Tentar carregar do localStorage como fallback
      const templates = JSON.parse(localStorage.getItem('labelTemplates') || '[]');
      const found = templates.find((t: LabelTemplate) => t.id === id);
      if (found) {
        // IMPORTANTE: Se não for master, sempre forçar compartilhado = false
        if (user?.tipo !== 'master') {
          found.compartilhado = false;
        }
        setTemplate(found);
        setIsNewTemplate(false); // Template do localStorage
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Adicionar novo elemento
  const handleAddElement = (type: ElementType, additionalProps?: Record<string, unknown>) => {
    const baseElement = {
      id: crypto.randomUUID(),
      type,
      x: 50,
      y: 50,
      width: 100,
      height: 50,
      zIndex: template.elements.length + 1,
      ...additionalProps,
    };

    let newElement: LabelElement;

    switch (type) {
      case 'text':
        newElement = {
          ...baseElement,
          type: 'text',
          content: 'Texto',
          fontSize: 14,
          fontFamily: 'Arial',
          fontWeight: '400',
          color: '#000000',
          textAlign: 'left',
        } as LabelElement;
        break;
      case 'qrcode':
        newElement = {
          ...baseElement,
          type: 'qrcode',
          value: 'https://innobyte.com',
          width: 80,
          height: 80,
          bgColor: '#FFFFFF',
          fgColor: '#000000',
          errorCorrectionLevel: 'M',
        } as LabelElement;
        break;
      case 'barcode':
        newElement = {
          ...baseElement,
          type: 'barcode',
          value: '1234567890',
          format: additionalProps?.format || 'CODE128',
          width: 150,
          height: 60,
          displayValue: true,
        } as LabelElement;
        break;
      case 'image':
        newElement = {
          ...baseElement,
          type: 'image',
          src: '',
          opacity: 1,
          objectFit: 'contain',
        } as LabelElement;
        break;
      case 'rectangle':
        newElement = {
          ...baseElement,
          type: 'rectangle',
          fillColor: '#E5E7EB',
          borderColor: '#000000',
          borderWidth: 1,
          borderRadius: 0,
        } as LabelElement;
        break;
      default:
        return;
    }

    setTemplate({
      ...template,
      elements: [...template.elements, newElement],
      updatedAt: new Date(),
    });

    setSelectedElementId(newElement.id);
  };

  // Atualizar elemento
  const handleUpdateElement = (id: string, updates: Partial<LabelElement>) => {
    setTemplate({
      ...template,
      elements: template.elements.map((el) =>
        el.id === id ? ({ ...el, ...updates } as LabelElement) : el
      ),
      updatedAt: new Date(),
    });
  };

  // Deletar elemento
  const handleDeleteElement = (id: string) => {
    setTemplate({
      ...template,
      elements: template.elements.filter((el) => el.id !== id),
      updatedAt: new Date(),
    });
    setSelectedElementId(null);
  };

  // Atualizar configuração
  const handleUpdateConfig = (updates: Partial<LabelConfig>) => {
    setTemplate({
      ...template,
      config: { ...template.config, ...updates },
      updatedAt: new Date(),
    });
  };

  // Salvar template na API
  const handleSaveTemplate = async () => {
    setIsSaving(true);
    
    try {
      // Gerar thumbnail do canvas
      const canvasEl = canvasWrapperRef.current?.querySelector('[style*="transform"]');
      let thumbnail = '';
      
      if (canvasEl) {
        try {
          const canvas = await html2canvas(canvasEl as HTMLElement, {
            backgroundColor: template.config.backgroundColor,
            scale: 1,
          });
          thumbnail = canvas.toDataURL('image/png');
        } catch (err) {
          console.error('Erro ao gerar thumbnail:', err);
        }
      }

      // Usar o flag para determinar se é criação ou atualização
      if (isNewTemplate || !template.id) {
        // Criar novo template
        // Clientes e colaboradores NÃO podem compartilhar templates (apenas master)
        const canShare = user?.tipo === 'master';
        const compartilhado = canShare ? (template.compartilhado || false) : false;
        
        // Log para debug
        console.log('🔒 Salvando template:', {
          userTipo: user?.tipo,
          canShare,
          compartilhadoOriginal: template.compartilhado,
          compartilhadoFinal: compartilhado,
        });
        
        // Aviso se cliente tentar compartilhar
        if (!canShare && template.compartilhado) {
          console.warn('⚠️ Cliente tentou salvar como compartilhado - bloqueado!');
        }
        
        const request = templateService.convertToCreateRequest({
          ...template,
          thumbnail,
          compartilhado,
        });
        
        const response = await templateService.create(request);
        alert('✅ Template criado com sucesso!');
        
        // Atualizar estado com o template criado (com ID do backend)
        setTemplate(templateService.convertToLabelTemplate(response));
        setIsNewTemplate(false);
        
        // Opcional: redirecionar para a lista
        // navigate('/templates');
      } else {
        // Atualizar template existente
        // Clientes e colaboradores NÃO podem compartilhar templates (apenas master)
        const canShare = user?.tipo === 'master';
        const compartilhado = canShare ? (template.compartilhado || false) : false;
        
        // Log para debug
        console.log('🔒 Atualizando template:', {
          userTipo: user?.tipo,
          canShare,
          compartilhadoOriginal: template.compartilhado,
          compartilhadoFinal: compartilhado,
        });
        
        // Aviso se cliente tentar compartilhar
        if (!canShare && template.compartilhado) {
          console.warn('⚠️ Cliente tentou atualizar como compartilhado - bloqueado!');
        }
        
        await templateService.update(template.id, {
          nome: template.config.name,
          descricao: template.config.description,
          categoria: template.category,
          config: template.config,
          elements: template.elements,
          thumbnail,
          compartilhado,
        });
        alert('✅ Template atualizado com sucesso!');
      }
    } catch (err: any) {
      console.error('Erro ao salvar template:', err);
      const errorMsg = err.response?.data?.detail || err.message || 'Erro ao salvar template';
      alert(`❌ ${errorMsg}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Exportar como PNG
  const handleExportPNG = async () => {
    const canvas = canvasWrapperRef.current?.querySelector('[style*="transform"]');
    if (!canvas) return;

    try {
      const canvasEl = await html2canvas(canvas as HTMLElement, {
        backgroundColor: template.config.backgroundColor,
        scale: 2,
      });

      const link = document.createElement('a');
      link.download = `${template.config.name}.png`;
      link.href = canvasEl.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Erro ao exportar PNG:', error);
      alert('Erro ao exportar PNG');
    }
  };

  // Novo template
  const handleNewTemplate = () => {
    if (confirm('Deseja criar um novo template? As alterações não salvas serão perdidas.')) {
      setTemplate({
        id: '', // Deixar vazio para novo template
        config: {
          name: 'Novo Template',
          width: 50,
          height: 30,
          unit: 'mm',
          backgroundColor: '#FFFFFF',
          padding: 0,
          showGrid: true,
          gridSize: 10,
          snapToGrid: false,
        },
        elements: [],
        compartilhado: false, // SEMPRE começa como false
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      setSelectedElementId(null);
      setIsNewTemplate(true); // Resetar flag para novo template
    }
  };

  const selectedElement = template.elements.find((el) => el.id === selectedElementId) || null;

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-xl">
            <div className="flex flex-col items-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
              <p className="text-gray-600 font-medium">Carregando template...</p>
            </div>
          </div>
        </div>
      )}

      {/* Header - Compacto e Responsivo */}
      <div className="bg-white border-b border-gray-200 px-2 sm:px-4 py-2">
        {/* Linha 1: Info e Ações Principais */}
        <div className="flex items-center justify-between gap-2 mb-2">
          {/* Esquerda: Voltar + Nome */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <button
              onClick={() => navigate(-1)}
              className="text-gray-600 hover:text-gray-800 p-2"
              title="Voltar"
            >
              <i className="fas fa-arrow-left"></i>
            </button>
            <div className="h-6 w-px bg-gray-300 hidden sm:block"></div>
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <i className="fas fa-tag text-primary hidden sm:block"></i>
              <div className="flex-1 min-w-0">
                <input
                  type="text"
                  value={template.config.name}
                  onChange={(e) => handleUpdateConfig({ name: e.target.value })}
                  className="text-sm sm:text-base font-semibold text-gray-800 border-none focus:outline-none focus:ring-2 focus:ring-primary rounded px-2 w-full"
                  placeholder="Nome do template"
                />
                <div className="flex items-center gap-3">
                  <p className="text-xs text-gray-500 hidden sm:block">
                    {template.config.width} × {template.config.height} {template.config.unit}
                  </p>
                  
                  {/* Checkbox Compartilhado - apenas para MASTER */}
                  {user?.tipo === 'master' && (
                    <label className="flex items-center gap-1 text-xs text-gray-600 cursor-pointer hover:text-primary">
                      <input
                        type="checkbox"
                        checked={template.compartilhado || false}
                        onChange={(e) => {
                          // VALIDAÇÃO: Apenas master pode alterar
                          if (user?.tipo === 'master') {
                            setTemplate({ ...template, compartilhado: e.target.checked });
                          } else {
                            console.error('❌ Tentativa de alterar compartilhado sem ser master!');
                          }
                        }}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <i className="fas fa-share-alt text-xs"></i>
                      <span className="hidden sm:inline">Compartilhado</span>
                    </label>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Direita: Ações Principais */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Salvar */}
            <button
              onClick={handleSaveTemplate}
              disabled={isSaving}
              className="px-2 sm:px-4 py-2 bg-green-500 text-white rounded-lg text-xs sm:text-sm font-medium hover:bg-green-600 disabled:opacity-50"
              title="Salvar"
            >
              <i className={`fas fa-${isSaving ? 'spinner fa-spin' : 'save'}`}></i>
              <span className="ml-1 hidden sm:inline">Salvar</span>
            </button>

            {/* Exportar PNG */}
            <button
              onClick={handleExportPNG}
              className="px-2 sm:px-4 py-2 bg-primary text-white rounded-lg text-xs sm:text-sm font-medium hover:bg-blue-600"
              title="Exportar como PNG"
            >
              <i className="fas fa-image"></i>
              <span className="ml-1 hidden sm:inline">Exportar PNG</span>
            </button>
          </div>
        </div>

        {/* Linha 2: Ferramentas e Visualização */}
        <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
          {/* Zoom */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg px-2 py-1">
            <button
              onClick={() => setZoom(Math.max(0.5, zoom - 0.2))}
              className="text-gray-600 hover:text-gray-800 p-1"
              title="Diminuir zoom"
            >
              <i className="fas fa-minus text-xs"></i>
            </button>
            <span className="text-xs font-medium text-gray-700 min-w-[40px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom(Math.min(4, zoom + 0.2))}
              className="text-gray-600 hover:text-gray-800 p-1"
              title="Aumentar zoom"
            >
              <i className="fas fa-plus text-xs"></i>
            </button>
          </div>

          <div className="h-4 w-px bg-gray-300 hidden sm:block"></div>

          {/* Toggles de Visualização */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleUpdateConfig({ showGrid: !template.config.showGrid })}
              className={`p-2 rounded-lg text-xs transition-colors ${
                template.config.showGrid
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              title="Grade"
            >
              <i className="fas fa-th"></i>
            </button>

            <button
              onClick={() => handleUpdateConfig({ showMargins: !template.config.showMargins })}
              className={`p-2 rounded-lg text-xs transition-colors ${
                template.config.showMargins
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              title="Margens"
            >
              <i className="fas fa-compress-arrows-alt"></i>
            </button>

            <button
              onClick={() => handleUpdateConfig({ showCenterLine: !template.config.showCenterLine })}
              className={`p-2 rounded-lg text-xs transition-colors ${
                template.config.showCenterLine
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              title="Linha Central"
            >
              <i className="fas fa-arrows-alt-h"></i>
            </button>

            <button
              onClick={() => handleUpdateConfig({ showBorders: !template.config.showBorders })}
              className={`p-2 rounded-lg text-xs transition-colors ${
                template.config.showBorders
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              title="Bordas"
            >
              <i className="fas fa-border-style"></i>
            </button>
          </div>

          <div className="h-4 w-px bg-gray-300 hidden lg:block"></div>

          {/* Indicador de Etiquetas (oculto em telas pequenas) */}
          <div className="hidden lg:flex px-2 py-1 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
            <div className="text-[10px] text-gray-600 font-medium">
              {(template.config.columns || 1) * (template.config.rows || 1)} etiquetas/página
            </div>
          </div>

          <div className="h-4 w-px bg-gray-300 hidden sm:block"></div>

          {/* Configurações */}
          <button
            onClick={() => setShowConfigModal(true)}
            className="p-2 bg-gray-100 text-gray-700 rounded-lg text-xs hover:bg-gray-200"
            title="Configurações"
          >
            <i className="fas fa-cog"></i>
            <span className="ml-1 hidden md:inline text-xs">Config</span>
          </button>

          <button
            onClick={() => setShowAdvancedConfig(true)}
            className="p-2 bg-gradient-to-r from-primary to-blue-600 text-white rounded-lg text-xs hover:from-primary/90 hover:to-blue-600/90"
            title="Avançado"
          >
            <i className="fas fa-sliders-h"></i>
            <span className="ml-1 hidden md:inline text-xs">Avançado</span>
          </button>

          <button
            onClick={() => setShowVariablesHelp(true)}
            className="p-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg text-xs hover:from-purple-600 hover:to-purple-700"
            title="Variáveis Disponíveis (${nome}, ${codigo}, etc.)"
          >
            <i className="fas fa-code"></i>
            <span className="ml-1 hidden md:inline text-xs">Variáveis</span>
          </button>

          <button
            onClick={handleNewTemplate}
            className="p-2 bg-gray-100 text-gray-700 rounded-lg text-xs hover:bg-gray-200"
            title="Novo Template"
          >
            <i className="fas fa-file"></i>
          </button>
        </div>
      </div>

      {/* Editor Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Toolbar de Elementos */}
        <ElementsToolbar onAddElement={handleAddElement} />

        {/* Canvas */}
        <div ref={canvasWrapperRef} className="flex-1">
          <LabelCanvas
            config={template.config}
            elements={template.elements}
            selectedElementId={selectedElementId}
            onSelectElement={setSelectedElementId}
            onUpdateElement={handleUpdateElement}
            onDeleteElement={handleDeleteElement}
            zoom={zoom}
          />
        </div>

        {/* Painel de Propriedades */}
        <PropertiesPanel
          element={selectedElement}
          onUpdate={(updates) => {
            if (selectedElementId) {
              handleUpdateElement(selectedElementId, updates);
            }
          }}
        />
      </div>

      {/* Modal de Configurações */}
      {showConfigModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Configurações do Template
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tamanho Pré-definido
                </label>
                <select
                  onChange={(e) => {
                    const size = LABEL_SIZES.find((s) => s.id === e.target.value);
                    if (size) {
                      handleUpdateConfig({
                        width: size.width,
                        height: size.height,
                        unit: size.unit,
                      });
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                >
                  <option value="">Selecione um tamanho...</option>
                  {LABEL_SIZES.map((size) => (
                    <option key={size.id} value={size.id}>
                      {size.name} ({size.width} × {size.height} {size.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Largura
                  </label>
                  <input
                    type="number"
                    value={template.config.width}
                    onChange={(e) => handleUpdateConfig({ width: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Altura
                  </label>
                  <input
                    type="number"
                    value={template.config.height}
                    onChange={(e) => handleUpdateConfig({ height: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unidade
                </label>
                <select
                  value={template.config.unit}
                  onChange={(e) => handleUpdateConfig({ unit: e.target.value as typeof template.config.unit })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                >
                  <option value="mm">Milímetros (mm)</option>
                  <option value="cm">Centímetros (cm)</option>
                  <option value="in">Polegadas (in)</option>
                  <option value="px">Pixels (px)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cor de Fundo
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={template.config.backgroundColor}
                    onChange={(e) => handleUpdateConfig({ backgroundColor: e.target.value })}
                    className="w-16 h-10 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={template.config.backgroundColor}
                    onChange={(e) => handleUpdateConfig({ backgroundColor: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm text-gray-900"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowConfigModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Configurações Avançadas */}
      {showAdvancedConfig && (
        <AdvancedConfigModal
          config={template.config}
          onUpdate={handleUpdateConfig}
          onClose={() => setShowAdvancedConfig(false)}
        />
      )}

      {/* Modal de Ajuda - Variáveis Disponíveis */}
      {showVariablesHelp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <i className="fas fa-code"></i>
                    Variáveis Disponíveis
                  </h2>
                  <p className="text-purple-100 text-sm mt-1">
                    Use estas variáveis nos elementos de texto e código de barras
                  </p>
                </div>
                <button
                  onClick={() => setShowVariablesHelp(false)}
                  className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Instruções */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex gap-3">
                  <i className="fas fa-info-circle text-blue-500 text-xl mt-1"></i>
                  <div>
                    <h3 className="font-semibold text-blue-900 mb-1">Como usar:</h3>
                    <p className="text-sm text-blue-800">
                      Digite estas variáveis no campo <strong>Conteúdo</strong> dos elementos de <strong>Texto</strong>,
                      ou no campo <strong>Valor</strong> dos elementos de <strong>Código de Barras</strong> e <strong>QR Code</strong>.
                    </p>
                    <p className="text-sm text-blue-800 mt-2">
                      Na hora de imprimir, as variáveis serão substituídas automaticamente pelos dados reais de cada produto!
                    </p>
                  </div>
                </div>
              </div>

              {/* Lista de Variáveis */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-800 text-lg">Variáveis de Produto:</h3>
                
                <div className="grid gap-3">
                  {/* Nome */}
                  <div className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="bg-purple-100 text-purple-600 rounded-lg p-2">
                        <i className="fas fa-tag"></i>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <code className="bg-gray-100 px-2 py-1 rounded text-purple-600 font-mono text-sm font-semibold">
                            {'${nome}'}
                          </code>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText('${nome}');
                              alert('✅ Copiado para área de transferência!');
                            }}
                            className="text-xs text-gray-500 hover:text-purple-600"
                            title="Copiar"
                          >
                            <i className="fas fa-copy"></i>
                          </button>
                        </div>
                        <p className="text-sm text-gray-600">Nome do produto</p>
                        <p className="text-xs text-gray-500 mt-1">Exemplo: <em>"Teclado Mecânico RGB"</em></p>
                      </div>
                    </div>
                  </div>

                  {/* Código */}
                  <div className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="bg-purple-100 text-purple-600 rounded-lg p-2">
                        <i className="fas fa-hashtag"></i>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <code className="bg-gray-100 px-2 py-1 rounded text-purple-600 font-mono text-sm font-semibold">
                            {'${codigo}'}
                          </code>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText('${codigo}');
                              alert('✅ Copiado para área de transferência!');
                            }}
                            className="text-xs text-gray-500 hover:text-purple-600"
                            title="Copiar"
                          >
                            <i className="fas fa-copy"></i>
                          </button>
                        </div>
                        <p className="text-sm text-gray-600">Código do produto (SKU)</p>
                        <p className="text-xs text-gray-500 mt-1">Exemplo: <em>"PROD001"</em></p>
                      </div>
                    </div>
                  </div>

                  {/* Categoria */}
                  <div className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="bg-purple-100 text-purple-600 rounded-lg p-2">
                        <i className="fas fa-folder"></i>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <code className="bg-gray-100 px-2 py-1 rounded text-purple-600 font-mono text-sm font-semibold">
                            {'${categoria}'}
                          </code>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText('${categoria}');
                              alert('✅ Copiado para área de transferência!');
                            }}
                            className="text-xs text-gray-500 hover:text-purple-600"
                            title="Copiar"
                          >
                            <i className="fas fa-copy"></i>
                          </button>
                        </div>
                        <p className="text-sm text-gray-600">Categoria do produto</p>
                        <p className="text-xs text-gray-500 mt-1">Exemplo: <em>"Eletrônicos"</em></p>
                      </div>
                    </div>
                  </div>

                  {/* Preço */}
                  <div className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="bg-purple-100 text-purple-600 rounded-lg p-2">
                        <i className="fas fa-dollar-sign"></i>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <code className="bg-gray-100 px-2 py-1 rounded text-purple-600 font-mono text-sm font-semibold">
                            {'${preco}'}
                          </code>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText('${preco}');
                              alert('✅ Copiado para área de transferência!');
                            }}
                            className="text-xs text-gray-500 hover:text-purple-600"
                            title="Copiar"
                          >
                            <i className="fas fa-copy"></i>
                          </button>
                        </div>
                        <p className="text-sm text-gray-600">Preço formatado</p>
                        <p className="text-xs text-gray-500 mt-1">Exemplo: <em>"R$ 299,90"</em></p>
                      </div>
                    </div>
                  </div>

                  {/* Barcode */}
                  <div className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="bg-purple-100 text-purple-600 rounded-lg p-2">
                        <i className="fas fa-barcode"></i>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <code className="bg-gray-100 px-2 py-1 rounded text-purple-600 font-mono text-sm font-semibold">
                            {'${barcode}'}
                          </code>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText('${barcode}');
                              alert('✅ Copiado para área de transferência!');
                            }}
                            className="text-xs text-gray-500 hover:text-purple-600"
                            title="Copiar"
                          >
                            <i className="fas fa-copy"></i>
                          </button>
                        </div>
                        <p className="text-sm text-gray-600">Código de barras (EAN/UPC)</p>
                        <p className="text-xs text-gray-500 mt-1">Exemplo: <em>"7891234567890"</em></p>
                      </div>
                    </div>
                  </div>

                  {/* Descrição */}
                  <div className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="bg-purple-100 text-purple-600 rounded-lg p-2">
                        <i className="fas fa-align-left"></i>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <code className="bg-gray-100 px-2 py-1 rounded text-purple-600 font-mono text-sm font-semibold">
                            {'${descricao}'}
                          </code>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText('${descricao}');
                              alert('✅ Copiado para área de transferência!');
                            }}
                            className="text-xs text-gray-500 hover:text-purple-600"
                            title="Copiar"
                          >
                            <i className="fas fa-copy"></i>
                          </button>
                        </div>
                        <p className="text-sm text-gray-600">Descrição do produto</p>
                        <p className="text-xs text-gray-500 mt-1">Exemplo: <em>"Switch mecânico, iluminação RGB personalizável"</em></p>
                      </div>
                    </div>
                  </div>

                  {/* Quantidade */}
                  <div className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="bg-purple-100 text-purple-600 rounded-lg p-2">
                        <i className="fas fa-boxes"></i>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <code className="bg-gray-100 px-2 py-1 rounded text-purple-600 font-mono text-sm font-semibold">
                            {'${quantidade}'}
                          </code>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText('${quantidade}');
                              alert('✅ Copiado para área de transferência!');
                            }}
                            className="text-xs text-gray-500 hover:text-purple-600"
                            title="Copiar"
                          >
                            <i className="fas fa-copy"></i>
                          </button>
                        </div>
                        <p className="text-sm text-gray-600">Quantidade em estoque</p>
                        <p className="text-xs text-gray-500 mt-1">Exemplo: <em>"150"</em></p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Exemplos de Uso */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                  <i className="fas fa-lightbulb"></i>
                  Exemplos de Uso:
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="bg-white rounded p-3 border border-green-200">
                    <p className="text-gray-600 mb-1">Para mostrar apenas o nome:</p>
                    <code className="text-green-700 font-mono">{'${nome}'}</code>
                  </div>
                  <div className="bg-white rounded p-3 border border-green-200">
                    <p className="text-gray-600 mb-1">Para combinar texto fixo com variável:</p>
                    <code className="text-green-700 font-mono">{'Produto: ${nome} - ${preco}'}</code>
                  </div>
                  <div className="bg-white rounded p-3 border border-green-200">
                    <p className="text-gray-600 mb-1">Para código de barras usar o código do produto:</p>
                    <code className="text-green-700 font-mono">{'${codigo}'}</code>
                  </div>
                  <div className="bg-white rounded p-3 border border-green-200">
                    <p className="text-gray-600 mb-1">Para QR Code com URL do produto:</p>
                    <code className="text-green-700 font-mono">{'https://loja.com/produto/${codigo}'}</code>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 rounded-b-xl border-t border-gray-200">
              <button
                onClick={() => setShowVariablesHelp(false)}
                className="w-full px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg font-medium hover:from-purple-600 hover:to-purple-700 transition-all"
              >
                Entendi! Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Editor;
