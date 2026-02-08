import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import html2canvas from 'html2canvas';
import ReactDOM from 'react-dom/client';
import ElementsToolbar from '@/components/labels/ElementsToolbar';
import LabelCanvas from '@/components/labels/LabelCanvas';
import PropertiesPanel from '@/components/labels/PropertiesPanel';
import AdvancedConfigModal from '@/components/labels/AdvancedConfigModal';
import PagePrintConfigPanel from '@/components/labels/PagePrintConfigPanel';
import templateService from '@/services/templateService';
import { useAuth } from '@/hooks/useAuth';
import type { LabelTemplate, LabelConfig, LabelElement, ElementType, PagePrintConfig } from '@/types/label.types';
import { COMMON_LABEL_SIZES as LABEL_SIZES } from '@/types/label.types';
import egestorService, { converterProdutoParaImpressao } from '@/services/egestor.service';
import * as integracoesService from '@/services/integracoes.service';

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
  const [showPagePrintConfig, setShowPagePrintConfig] = useState(false);
  const [showVariablesHelp, setShowVariablesHelp] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Preview de produto
  const [previewProduct, setPreviewProduct] = useState<any | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  const [showStartupModal, setShowStartupModal] = useState(isNewTemplate);

  // Carregar template se fornecido via query param (da API)
  useEffect(() => {
    const templateId = searchParams.get('template');
    if (templateId) {
      loadTemplate(templateId);
      setShowStartupModal(false); // Se carregando existente, não mostra modal
    } else {
      setShowStartupModal(true); // Se nova, mostra modal
    }
  }, [searchParams]);

  // Suporte para teclas de atalho (setas e Delete)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedElementId) return;

      const selectedElement = template.elements.find(el => el.id === selectedElementId);
      if (!selectedElement || selectedElement.locked) return;

      const moveStep = e.shiftKey ? 10 : 1; // Shift para movimento mais rápido

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          handleUpdateElement(selectedElementId, { y: selectedElement.y - moveStep });
          break;
        case 'ArrowDown':
          e.preventDefault();
          handleUpdateElement(selectedElementId, { y: selectedElement.y + moveStep });
          break;
        case 'ArrowLeft':
          e.preventDefault();
          handleUpdateElement(selectedElementId, { x: selectedElement.x - moveStep });
          break;
        case 'ArrowRight':
          e.preventDefault();
          handleUpdateElement(selectedElementId, { x: selectedElement.x + moveStep });
          break;
        case 'Delete':
        case 'Backspace':
          e.preventDefault();
          handleDeleteElement(selectedElementId);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElementId, template.elements]);

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
      setShowStartupModal(false);
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
        setShowStartupModal(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Carregar produtos do eGestor para preview
  const loadProducts = async (search?: string) => {
    if (!user?.id) return;

    setLoadingProducts(true);
    try {
      // 1. Buscar integração id da API de integrações
      const responseIntegracao = await integracoesService.getIntegracoes(user.id);

      let integracaoId: number | null = null;

      if (responseIntegracao.success && responseIntegracao.data) {
        const egestorIntegracao = responseIntegracao.data.data.find(
          (i) => i.provedor === 'eGestor' && i.ativa && i.status_conexao === 'conectado'
        );
        if (egestorIntegracao) {
          integracaoId = egestorIntegracao.id;
          // Salvar no localStorage para uso futuro se necessário
          localStorage.setItem('egestor_integration_id', integracaoId.toString());
        }
      }

      // Se não achou na API, tenta localStorage ou valor default 1 (para testes)
      if (!integracaoId) {
        const saved = localStorage.getItem('egestor_integration_id');
        integracaoId = saved ? parseInt(saved) : 1;
      }

      console.log('🔄 Tentando carregar produtos com IntegracaoID:', integracaoId);

      // 2. Buscar produtos
      const response = await egestorService.getProdutos(integracaoId, {
        page: 1,
        filtro: search || '',
      });

      if (response.success && response.data) {
        setProducts(response.data.data);
        console.log('✅ Produtos carregados:', response.data.data.length);
        if (response.data.data.length > 0) {
          console.log('🔍 Estrutura do primeiro produto:', response.data.data[0]);
          console.log('🔑 Campos disponíveis:', Object.keys(response.data.data[0]));
        }
      } else {
        console.warn('❌ Resposta sem produtos:', response);
      }
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    } finally {
      setLoadingProducts(false);
    }
  };

  // Carregar produtos ao montar
  useEffect(() => {
    loadProducts();
  }, []);

  // Helper para conversão de unidades (igual ao LabelCanvas)
  const getPixelsFromUnit = (value: number, unit: string) => {
    const conversionRates = {
      mm: 3.7795275591,
      cm: 37.795275591,
      in: 96,
      px: 1,
    };
    // @ts-ignore
    return value * (conversionRates[unit] || 1);
  };

  // Adicionar novo elemento
  const handleAddElement = (type: ElementType, additionalProps?: Record<string, unknown>) => {
    // Calcular dimensões do canvas em pixels
    const canvasWidthPx = getPixelsFromUnit(template.config.width, template.config.unit);
    const canvasHeightPx = getPixelsFromUnit(template.config.height, template.config.unit);

    // Definir tamanhos padrão proporcionais ou fixos mas limitados e centralizar
    let width = 100;
    let height = 50;

    switch (type) {
      case 'text':
        // Texto: Começar pequeno, o auto-sizing vai crescer
        width = 20; // Mínimo, vai ajustar automaticamente
        height = 10;
        break;
      case 'qrcode':
        // QR Code: começar pequeno, usuário ajusta
        width = 40;
        height = 40;
        break;
      case 'barcode':
        // Barcode: começar compacto
        width = 80;
        height = 30;
        break;
      case 'image':
        width = 50;
        height = 50;
        break;
      case 'rectangle':
        width = 50;
        height = 30;
        break;
    }

    // Posição base: centralizada horizontalmente
    let x = (canvasWidthPx - width) / 2;

    // Offset vertical baseado no número de elementos para evitar sobreposição
    const elementOffset = 5; // 5px de espaço entre elementos (reduzido)
    const startY = 5; // Começar 5px do topo (reduzido)
    let y = startY + (template.elements.length * elementOffset);

    // Se passar do canvas, volta pro início com um pequeno offset horizontal
    if (y + height > canvasHeightPx) {
      y = startY;
      x = x + ((template.elements.length % 3) - 1) * 30; // Varia entre -30, 0, +30
    }

    const baseElement = {
      id: crypto.randomUUID(),
      type,
      x,
      y,
      width,
      height,
      zIndex: template.elements.length + 1,
      ...additionalProps,
    };

    let newElement: LabelElement;

    switch (type) {
      case 'text':
        newElement = {
          ...baseElement,
          type: 'text',
          content: (additionalProps?.content as string) || 'Texto',
          fontSize: 4,
          fontFamily: 'Arial',
          fontWeight: '400',
          color: '#000000',
          textAlign: 'left',
          noWrap: false,
        } as LabelElement;
        break;
      case 'qrcode':
        newElement = {
          ...baseElement,
          type: 'qrcode',
          value: 'https://innobyte.com',
          width: baseElement.width, // Usar o calculado
          height: baseElement.height, // Usar o calculado
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
          width: baseElement.width, // Usar o calculado
          height: baseElement.height, // Usar o calculado
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
      // Limpar preview para evitar conflitos de renderização durante o salvamento
      setPreviewProduct(null);

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

        // Passa canShare para indicar se deve incluir compartilhado
        const request = templateService.convertToCreateRequest({
          ...template,
          thumbnail,
          compartilhado,
        }, canShare);

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

        // Monta os dados para atualização
        // IMPORTANTE: Não envia compartilhado se não for master (backend bloqueia)
        const updateData: any = {
          nome: template.config.name,
          descricao: template.config.description,
          categoria: template.category,
          config: template.config,
          elements: template.elements,
          thumbnail,
          page_print_config: template.pagePrintConfig, // INCLUIR configuração de impressão
        };

        // DEBUG: Log para verificar o que está sendo enviado
        console.log('📤 [handleSave] updateData:', updateData);
        console.log('📤 [handleSave] elements:', updateData.elements);
        console.log('📤 [handleSave] elements.length:', updateData.elements?.length);
        console.log('📤 [handleSave] page_print_config:', updateData.page_print_config);
        console.log('📤 [handleSave] JSON.stringify(updateData):', JSON.stringify(updateData, null, 2));

        // Apenas master pode enviar o campo compartilhado
        if (canShare) {
          updateData.compartilhado = compartilhado;
        }

        await templateService.update(template.id, updateData);
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
    // 1. Converter unidades (96 DPI padrão do navegador)
    const getPixelsFromUnit = (value: number, unit: string) => {
      const rates = { mm: 3.7795275591, cm: 37.795275591, in: 96, px: 1 };
      return value * (rates[unit as keyof typeof rates] || 1);
    };

    const w = Math.ceil(getPixelsFromUnit(template.config.width, template.config.unit));
    const h = Math.ceil(getPixelsFromUnit(template.config.height, template.config.unit));

    // 2. Criar container no topo da tela (fixo) para garantir coordenadas (0,0)
    const container = document.createElement('div');
    container.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: ${w}px;
      height: ${h}px;
      z-index: 999999;
      background: white;
      overflow: hidden;
    `;
    document.body.appendChild(container);

    try {
      setIsSaving(true);
      await document.fonts.ready;

      // 3. Renderizar com o root real
      const root = ReactDOM.createRoot(container);
      root.render(
        <LabelCanvas
          config={{ ...template.config, showGrid: false, showCenterLine: false, showMargins: false, showBorders: false }}
          elements={template.elements}
          previewProduct={previewProduct}
          selectedElementId={null}
          onSelectElement={() => { }}
          onUpdateElement={() => { }}
          onDeleteElement={() => { }}
          zoom={1}
          isPrinting={true}
        />
      );

      // 4. Tempo de estabilização maior
      await new Promise(resolve => setTimeout(resolve, 1200));

      const captureTarget = container.querySelector('#label-capture-target') as HTMLElement;
      if (!captureTarget) throw new Error('Falha ao localizar etiqueta para captura');

      // 5. Captura direta. Como está em fixed(0,0), o html2canvas gera o recorte exato.
      const canvas = await html2canvas(captureTarget, {
        scale: 4,
        useCORS: true,
        allowTaint: true,
        backgroundColor: template.config.backgroundColor,
        // SEM x, y, windowWidth manuais para evitar desalinhamento do motor interno
        onclone: (clonedDoc: Document) => {
          const el = clonedDoc.querySelector('#label-capture-target') as HTMLElement;
          if (el) {
            el.style.boxShadow = 'none';
            el.style.border = 'none';
          }
        }
      });

      const link = document.createElement('a');
      link.download = `${template.config.name}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();

      // Limpar
      root.unmount();
      document.body.removeChild(container);
    } catch (error) {
      console.error('Erro ao exportar PNG:', error);
      alert('Erro ao exportar PNG');
    } finally {
      setIsSaving(false);
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

                  {/* Seletor de Produto para Preview */}
                  <div className="hidden lg:block">
                    <select
                      value={previewProduct?.id || ''}
                      onChange={(e) => {
                        const produtoId = e.target.value;
                        if (produtoId) {
                          const produto = products.find(p => p.codigo.toString() === produtoId);
                          if (produto) {
                            // Converter usando o helper do serviço
                            // Precisamos fazer cast para as interfaces coincidirem se necessário, 
                            // mas o converter já retorna o formato certo
                            const preview = converterProdutoParaImpressao(produto);
                            setPreviewProduct(preview);
                          } else {
                            setPreviewProduct(null);
                          }
                        } else {
                          setPreviewProduct(null);
                        }
                      }}
                      disabled={loadingProducts}
                      className="text-xs border border-purple-300 rounded px-2 py-1 bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors max-w-xs disabled:opacity-50"
                      title="Preview com produto do eGestor">
                      {loadingProducts ? (
                        <option>Carregando produtos...</option>
                      ) : products.length === 0 ? (
                        <option>Nenhum produto encontrado</option>
                      ) : (
                        <>
                          <option value="">Modo Edição (Variáveis)</option>
                          {products.map((prod) => (
                            <option key={prod.codigo} value={prod.codigo}>
                              {prod.nome} {prod.codigoBarras ? `(${prod.codigoBarras})` : ''}
                            </option>
                          ))}
                        </>
                      )}
                    </select>
                  </div>

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
            {/* Exportar PNG */}
            {/* <button
              onClick={handleExportPNG}
              className="px-2 sm:px-4 py-2 bg-primary text-white rounded-lg text-xs sm:text-sm font-medium hover:bg-blue-600"
              title="Exportar como PNG"
            >
              <i className="fas fa-image"></i>
              <span className="ml-1 hidden sm:inline">Exportar PNG</span>
            </button> */}
          </div>
        </div>

        {/* Linha 2: Ferramentas e Visualização */}
        <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
          {/* Zoom */}
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-2 py-1">
            <button
              onClick={() => setZoom(Math.max(1, zoom - 0.5))}
              className="text-gray-600 hover:text-gray-800 p-1"
              title="Diminuir zoom"
            >
              <i className="fas fa-minus text-xs"></i>
            </button>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="1"
                max="8"
                step="0.5"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-24 h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <span className="text-xs font-medium text-gray-700 min-w-[40px] text-center">
                {Math.round(zoom * 100)}%
              </span>
            </div>
            <button
              onClick={() => setZoom(Math.min(8, zoom + 0.5))}
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
              className={`p-2 rounded-lg text-xs transition-colors ${template.config.showGrid
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              title="Grade"
            >
              <i className="fas fa-th"></i>
            </button>

            <button
              onClick={() => handleUpdateConfig({ showMargins: !template.config.showMargins })}
              className={`p-2 rounded-lg text-xs transition-colors ${template.config.showMargins
                ? 'bg-red-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              title="Margens"
            >
              <i className="fas fa-compress-arrows-alt"></i>
            </button>

            <button
              onClick={() => handleUpdateConfig({ showCenterLine: !template.config.showCenterLine })}
              className={`p-2 rounded-lg text-xs transition-colors ${template.config.showCenterLine
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              title="Linha Central"
            >
              <i className="fas fa-arrows-alt-h"></i>
            </button>

            <button
              onClick={() => handleUpdateConfig({ showBorders: !template.config.showBorders })}
              className={`p-2 rounded-lg text-xs transition-colors ${template.config.showBorders
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
            onClick={() => setShowPagePrintConfig(true)}
            className="p-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg text-xs hover:from-green-600 hover:to-green-700"
            title="Configuração de Página/Impressão"
          >
            <i className="fas fa-print"></i>
            <span className="ml-1 hidden md:inline text-xs">Impressão</span>
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
      <div className="flex-1 flex overflow-hidden relative">
        {/* Toolbar de Elementos */}
        <ElementsToolbar onAddElement={handleAddElement} />

        {/* Canvas */}
        <div ref={canvasWrapperRef} className="flex-1 flex flex-col min-h-0 relative">
          <LabelCanvas
            config={template.config}
            elements={template.elements}
            selectedElementId={selectedElementId}
            onSelectElement={setSelectedElementId}
            onUpdateElement={handleUpdateElement}
            onDeleteElement={handleDeleteElement}
            zoom={zoom}
            previewProduct={previewProduct}
            pagePrintConfig={template.pagePrintConfig}
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

      {/* Modal de Configuração de Página/Impressão */}
      {showPagePrintConfig && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <PagePrintConfigPanel
                config={template.pagePrintConfig}
                labelConfig={template.config}
                onChange={(newConfig: PagePrintConfig) => {
                  setTemplate(prev => ({
                    ...prev,
                    pagePrintConfig: newConfig,
                  }));
                }}
              />

              <div className="mt-6 pt-4 border-t flex justify-end gap-3">
                <button
                  onClick={() => setShowPagePrintConfig(false)}
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Setup Inicial (Nova Etiqueta) */}
      {showStartupModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-fade-in-up">
            <div className="bg-gradient-to-r from-primary to-blue-600 p-6 text-white text-center">
              <i className="fas fa-magic text-4xl mb-3 opacity-90"></i>
              <h2 className="text-2xl font-bold">Nova Etiqueta</h2>
              <p className="text-blue-100 mt-1">Configure as dimensões iniciais</p>
            </div>

            <div className="p-8 space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Nome da Etiqueta
                </label>
                <input
                  type="text"
                  value={template.config.name}
                  onChange={(e) => handleUpdateConfig({ name: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-lg"
                  placeholder="Ex: Etiqueta de Joia"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Largura
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={template.config.width}
                      onChange={(e) => handleUpdateConfig({ width: parseFloat(e.target.value) })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-lg font-mono"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
                      {template.config.unit}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Altura
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={template.config.height}
                      onChange={(e) => handleUpdateConfig({ height: parseFloat(e.target.value) })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-lg font-mono"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
                      {template.config.unit}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Unidade de Medida
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {['mm', 'cm', 'in', 'px'].map((u) => (
                    <button
                      key={u}
                      onClick={() => handleUpdateConfig({ unit: u as any })}
                      className={`py-2 rounded-lg font-medium transition-all ${template.config.unit === u
                        ? 'bg-primary text-white shadow-md transform scale-105'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                      {u}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={() => setShowStartupModal(false)}
                  className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
                >
                  <i className="fas fa-check mr-2"></i>
                  Criar Etiqueta
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer Fixo com Instruções */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 px-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-40 flex items-center justify-center gap-6 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <kbd className="bg-gray-100 border border-gray-300 rounded px-2 py-0.5 font-sans font-semibold text-xs text-gray-500">Ctrl</kbd>
          <span>+ Arrastar para mover</span>
        </div>
        <div className="h-4 w-px bg-gray-300"></div>
        <div className="flex items-center gap-2">
          <kbd className="bg-gray-100 border border-gray-300 rounded px-2 py-0.5 font-sans font-semibold text-xs text-gray-500">Del</kbd>
          <span>Excluir</span>
        </div>
        <div className="h-4 w-px bg-gray-300"></div>
        <div className="flex items-center gap-2">
          <kbd className="bg-gray-100 border border-gray-300 rounded px-2 py-0.5 font-sans font-semibold text-xs text-gray-500">↑↓←→</kbd>
          <span>Ajuste fino</span>
        </div>
      </div>

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
                        <p className="text-sm text-gray-600">Código do produto</p>
                        <p className="text-xs text-gray-500 mt-1">Exemplo: <em>"PROD001"</em></p>
                      </div>
                    </div>
                  </div>

                  {/* SKU */}
                  <div className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="bg-purple-100 text-purple-600 rounded-lg p-2">
                        <i className="fas fa-fingerprint"></i>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <code className="bg-gray-100 px-2 py-1 rounded text-purple-600 font-mono text-sm font-semibold">
                            {'${sku}'}
                          </code>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText('${sku}');
                              alert('✅ Copiado para área de transferência!');
                            }}
                            className="text-xs text-gray-500 hover:text-purple-600"
                            title="Copiar"
                          >
                            <i className="fas fa-copy"></i>
                          </button>
                        </div>
                        <p className="text-sm text-gray-600">Código SKU (do E-gestor)</p>
                        <p className="text-xs text-gray-500 mt-1">Exemplo: <em>"SKU123456"</em></p>
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

              {/* Variáveis Especiais de Formatação */}
              <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-lg p-4">
                <h3 className="font-semibold text-orange-900 mb-3 flex items-center gap-2">
                  <i className="fas fa-magic"></i>
                  Variáveis Especiais de Formatação
                  <span className="text-xs bg-orange-200 text-orange-700 px-2 py-0.5 rounded-full">Avançado</span>
                </h3>
                <p className="text-sm text-orange-700 mb-4">
                  Variáveis especiais que dependem das configurações de impressão. Configure-as na tela de impressão.
                </p>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">

                  {/* Preço Mascarado */}
                  <div className="border border-orange-200 rounded-lg p-4 bg-white hover:border-orange-400 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="bg-orange-100 text-orange-600 rounded-lg p-2">
                        <i className="fas fa-mask"></i>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <code className="bg-orange-100 px-2 py-1 rounded text-orange-600 font-mono text-sm font-semibold">
                            {'${preco_mascarado}'}
                          </code>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText('${preco_mascarado}');
                              alert('✅ Copiado para área de transferência!');
                            }}
                            className="text-xs text-gray-500 hover:text-orange-600"
                            title="Copiar"
                          >
                            <i className="fas fa-copy"></i>
                          </button>
                        </div>
                        <p className="text-sm text-gray-600">2 letras do nome + "00" + centavos</p>
                        <p className="text-xs text-gray-500 mt-1">Ex: Coca-Cola R$10,33 → <em>"CO0033"</em></p>
                      </div>
                    </div>
                  </div>

                  {/* Preço Parcelado */}
                  <div className="border border-orange-200 rounded-lg p-4 bg-white hover:border-orange-400 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="bg-orange-100 text-orange-600 rounded-lg p-2">
                        <i className="fas fa-calculator"></i>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <code className="bg-orange-100 px-2 py-1 rounded text-orange-600 font-mono text-sm font-semibold">
                            {'${preco_parcelado}'}
                          </code>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText('${preco_parcelado}');
                              alert('✅ Copiado para área de transferência!');
                            }}
                            className="text-xs text-gray-500 hover:text-orange-600"
                            title="Copiar"
                          >
                            <i className="fas fa-copy"></i>
                          </button>
                        </div>
                        <p className="text-sm text-gray-600">Valor dividido em parcelas</p>
                        <p className="text-xs text-gray-500 mt-1">Ex: R$100 (2x) → <em>"2x de R$ 50,00"</em></p>
                      </div>
                    </div>
                  </div>

                  {/* Preço Cheio e Parcelado */}
                  <div className="border border-orange-200 rounded-lg p-4 bg-white hover:border-orange-400 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="bg-orange-100 text-orange-600 rounded-lg p-2">
                        <i className="fas fa-tags"></i>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <code className="bg-orange-100 px-2 py-1 rounded text-orange-600 font-mono text-sm font-semibold">
                            {'${preco_cheio_parcelado}'}
                          </code>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText('${preco_cheio_parcelado}');
                              alert('✅ Copiado para área de transferência!');
                            }}
                            className="text-xs text-gray-500 hover:text-orange-600"
                            title="Copiar"
                          >
                            <i className="fas fa-copy"></i>
                          </button>
                        </div>
                        <p className="text-sm text-gray-600">Mostra preço total + parcelado</p>
                        <p className="text-xs text-gray-500 mt-1">Ex: <em>"R$ 100,00 | 2x R$ 50,00"</em></p>
                      </div>
                    </div>
                  </div>

                  {/* Nome Abreviado */}
                  <div className="border border-orange-200 rounded-lg p-4 bg-white hover:border-orange-400 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="bg-orange-100 text-orange-600 rounded-lg p-2">
                        <i className="fas fa-cut"></i>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <code className="bg-orange-100 px-2 py-1 rounded text-orange-600 font-mono text-sm font-semibold">
                            {'${nome_abreviado}'}
                          </code>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText('${nome_abreviado}');
                              alert('✅ Copiado para área de transferência!');
                            }}
                            className="text-xs text-gray-500 hover:text-orange-600"
                            title="Copiar"
                          >
                            <i className="fas fa-copy"></i>
                          </button>
                        </div>
                        <p className="text-sm text-gray-600">Primeiras 4 letras de cada palavra</p>
                        <p className="text-xs text-gray-500 mt-1">Ex: Brinco Prata 925 → <em>"Brin Prat 925"</em></p>
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
