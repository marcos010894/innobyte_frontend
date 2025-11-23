import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { Product, PrintConfig, PrintPreset } from '@/types/product.types';
import { PRINT_PRESETS } from '@/types/product.types';
import type { LabelTemplate, LabelElement } from '@/types/label.types';
import { replaceTemplateVariables } from '@/utils/templateVariables';
import templateService from '@/services/templateService';
import LabelCanvas from '@/components/labels/LabelCanvas';
import PropertiesPanel from '@/components/labels/PropertiesPanel';

/**
 * Função auxiliar para renderizar um elemento do template no PDF
 */
function renderElementToPDF(
  pdf: jsPDF,
  element: LabelElement,
  offsetX: number,
  offsetY: number,
  labelWidth: number,
  labelHeight: number
): void {
  // Converter posições relativas (0-100%) para absolutas (mm)
  const elementX = offsetX + (element.x / 100) * labelWidth;
  const elementY = offsetY + (element.y / 100) * labelHeight;
  const elementWidth = (element.width / 100) * labelWidth;
  const elementHeight = (element.height / 100) * labelHeight;
  
  console.log(`🖼️ Renderizando ${element.type}:`, {
    elementX,
    elementY,
    elementWidth,
    elementHeight,
    originalX: element.x,
    originalY: element.y,
    offsetX,
    offsetY,
    labelWidth,
    labelHeight
  });

  switch (element.type) {
    case 'text': {
      // Renderizar texto
      const textElement = element as Extract<LabelElement, { type: 'text' }>;
      
      console.log(`📝 Texto a renderizar: "${textElement.content}"`);
      
      // Configurar fonte
      pdf.setFontSize(textElement.fontSize || 12);
      
      // Converter cor hex para RGB
      const color = textElement.color || '#000000';
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      pdf.setTextColor(r, g, b);
      
      // Configurar estilo
      const isBold = textElement.fontWeight === 'bold' || 
                     parseInt(textElement.fontWeight || '400') >= 600;
      pdf.setFont('helvetica', isBold ? 'bold' : 'normal');
      
      // Renderizar texto com alinhamento
      const textOptions: any = {
        maxWidth: elementWidth,
        align: textElement.textAlign || 'left',
      };
      
      pdf.text(textElement.content, elementX, elementY + (textElement.fontSize || 12) * 0.3, textOptions);
      break;
    }

    case 'rectangle': {
      // Renderizar retângulo
      const rectElement = element as Extract<LabelElement, { type: 'rectangle' }>;
      
      // Cor de preenchimento
      if (rectElement.fillColor) {
        const fillColor = rectElement.fillColor;
        const r = parseInt(fillColor.slice(1, 3), 16);
        const g = parseInt(fillColor.slice(3, 5), 16);
        const b = parseInt(fillColor.slice(5, 7), 16);
        pdf.setFillColor(r, g, b);
      }
      
      // Cor da borda
      if (rectElement.borderColor && rectElement.borderWidth) {
        const borderColor = rectElement.borderColor;
        const r = parseInt(borderColor.slice(1, 3), 16);
        const g = parseInt(borderColor.slice(3, 5), 16);
        const b = parseInt(borderColor.slice(5, 7), 16);
        pdf.setDrawColor(r, g, b);
        pdf.setLineWidth(rectElement.borderWidth || 1);
      }
      
      // Desenhar retângulo
      const fillStyle = rectElement.fillColor ? 'F' : '';
      const borderStyle = rectElement.borderColor && rectElement.borderWidth ? 'S' : '';
      const style = fillStyle + borderStyle || 'S';
      
      pdf.rect(elementX, elementY, elementWidth, elementHeight, style as any);
      break;
    }

    case 'line': {
      // Renderizar linha
      const lineElement = element as Extract<LabelElement, { type: 'line' }>;
      
      // Cor da linha
      const color = lineElement.color || '#000000';
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      pdf.setDrawColor(r, g, b);
      pdf.setLineWidth(lineElement.thickness || 1);
      
      // Desenhar linha
      if (lineElement.orientation === 'horizontal') {
        pdf.line(elementX, elementY, elementX + elementWidth, elementY);
      } else {
        pdf.line(elementX, elementY, elementX, elementY + elementHeight);
      }
      break;
    }

    case 'barcode': {
      // Renderizar código de barras (simplificado como texto por enquanto)
      const barcodeElement = element as Extract<LabelElement, { type: 'barcode' }>;
      
      pdf.setFontSize(8);
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('courier', 'normal');
      
      // Renderizar o valor do barcode como texto
      pdf.text(barcodeElement.value, elementX, elementY + elementHeight - 2, {
        maxWidth: elementWidth,
      });
      
      // Desenhar "barras" simuladas (linhas verticais)
      pdf.setLineWidth(0.5);
      const numBars = 20;
      const barSpacing = elementWidth / numBars;
      for (let i = 0; i < numBars; i++) {
        const barX = elementX + i * barSpacing;
        const barHeight = elementHeight - 6;
        pdf.line(barX, elementY, barX, elementY + barHeight);
      }
      break;
    }

    case 'qrcode': {
      // Renderizar QR Code (simplificado como texto por enquanto)
      const qrcodeElement = element as Extract<LabelElement, { type: 'qrcode' }>;
      
      // Desenhar borda do QR
      pdf.setDrawColor(0, 0, 0);
      pdf.setLineWidth(0.5);
      pdf.rect(elementX, elementY, elementWidth, elementHeight);
      
      // Desenhar alguns "pixels" simulados
      pdf.setFillColor(0, 0, 0);
      const pixelSize = elementWidth / 10;
      for (let i = 0; i < 10; i++) {
        for (let j = 0; j < 10; j++) {
          if ((i + j) % 2 === 0) {
            pdf.rect(
              elementX + i * pixelSize,
              elementY + j * pixelSize,
              pixelSize,
              pixelSize,
              'F'
            );
          }
        }
      }
      
      // Adicionar texto do valor embaixo (opcional)
      pdf.setFontSize(6);
      pdf.setTextColor(100, 100, 100);
      pdf.text(qrcodeElement.value.substring(0, 20), elementX, elementY + elementHeight + 2, {
        maxWidth: elementWidth,
      });
      break;
    }

    case 'image': {
      // Renderizar imagem (se src estiver disponível)
      const imageElement = element as Extract<LabelElement, { type: 'image' }>;
      
      if (imageElement.src) {
        try {
          pdf.addImage(
            imageElement.src,
            'PNG',
            elementX,
            elementY,
            elementWidth,
            elementHeight
          );
        } catch (err) {
          console.warn('Erro ao adicionar imagem ao PDF:', err);
          // Desenhar placeholder
          pdf.setDrawColor(200, 200, 200);
          pdf.rect(elementX, elementY, elementWidth, elementHeight);
          pdf.setFontSize(8);
          pdf.setTextColor(150, 150, 150);
          pdf.text('IMG', elementX + elementWidth / 2 - 5, elementY + elementHeight / 2);
        }
      }
      break;
    }

    default:
      // Tipo de elemento não suportado
      break;
  }
}

const Print: React.FC = () => {
  const navigate = useNavigate();
  
  // Estados
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [templates, setTemplates] = useState<LabelTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [selectedTemplateData, setSelectedTemplateData] = useState<LabelTemplate | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showConfig, setShowConfig] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Estados para edição de preview
  const [showPreviewEditor, setShowPreviewEditor] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<LabelTemplate | null>(null);
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [showPreviewWithData, setShowPreviewWithData] = useState(false); // Toggle para mostrar com dados reais
  
  // Configuração de impressão
  const [printConfig, setPrintConfig] = useState<PrintConfig>({
    columns: 3,
    rows: 8,
    spacingHorizontal: 2,
    spacingVertical: 2,
    marginTop: 10,
    marginBottom: 10,
    marginLeft: 10,
    marginRight: 10,
    labelWidth: 50,
    labelHeight: 30,
    unit: 'mm',
    showBorders: false,
    showPrice: true,
    showBarcode: true,
    // Novas opções de substituição de variáveis
    truncateNames: false,
    maxNameLength: 20,
    priceFormat: 'decimal',
    pricePrefix: 'R$ ',
    // Pular primeiras etiquetas (folhas parcialmente usadas)
    skipLabels: 0,
  });

  // Carregar produtos mockados e templates
  useEffect(() => {
    const loadData = async () => {
      // Produtos mockados (você pode substituir por API real)
      const mockProducts: Product[] = [
        {
          id: '1',
          name: 'Produto Exemplo 1',
          code: 'PROD001',
          price: 29.90,
          quantity: 100,
          category: 'Eletrônicos',
          barcode: '7891234567890',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          name: 'Produto Exemplo 2',
          code: 'PROD002',
          price: 49.90,
          quantity: 50,
          category: 'Alimentos',
          barcode: '7891234567891',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '3',
          name: 'Produto Exemplo 3',
          code: 'PROD003',
          price: 19.90,
          quantity: 200,
          category: 'Vestuário',
          barcode: '7891234567892',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      setProducts(mockProducts);

      // Carregar templates da API
      try {
        setIsLoading(true);
        const apiTemplates = await templateService.list();
        console.log('📋 Templates recebidos da API (RAW):', apiTemplates);
        console.log('📋 Primeiro template:', apiTemplates[0]);
        console.log('📋 Elements do primeiro template:', apiTemplates[0]?.elements);
        
        const converted = apiTemplates.map(templateService.convertToLabelTemplate);
        console.log('✅ Templates convertidos:', converted);
        console.log('✅ Elements do primeiro convertido:', converted[0]?.elements);
        
        setTemplates(converted);
        
        if (converted.length > 0) {
          setSelectedTemplate(converted[0].id);
        }
      } catch (err) {
        console.error('❌ Erro ao carregar templates da API:', err);
        alert('Erro ao carregar templates. Verifique sua conexão com a API.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Carregar template completo quando selecionado
  useEffect(() => {
    const loadFullTemplate = async () => {
      if (!selectedTemplate) {
        setSelectedTemplateData(null);
        return;
      }

      try {
        console.log('📥 Carregando template completo ID:', selectedTemplate);
        const response = await templateService.getById(selectedTemplate);
        const converted = templateService.convertToLabelTemplate(response);
        console.log('✅ Template completo carregado:', converted);
        console.log('📦 Elements:', converted.elements);
        setSelectedTemplateData(converted);
        
        // Calcular automaticamente o layout baseado no tamanho da etiqueta
        calculateLayout(converted);
      } catch (err) {
        console.error('❌ Erro ao carregar template completo:', err);
        setSelectedTemplateData(null);
      }
    };

    loadFullTemplate();
  }, [selectedTemplate]);

  // Calcular layout automaticamente baseado no tamanho da etiqueta
  const calculateLayout = (template: LabelTemplate) => {
    // Dimensões da folha A4 em mm
    const a4Width = 210;
    const a4Height = 297;
    
    // Margens padrão
    const marginTop = 10;
    const marginBottom = 10;
    const marginLeft = 10;
    const marginRight = 10;
    
    // Espaçamento padrão entre etiquetas
    const spacingH = 2;
    const spacingV = 2;
    
    // Dimensões da etiqueta (converter para mm se necessário)
    let labelWidth = template.config.width;
    let labelHeight = template.config.height;
    
    // Converter para mm se estiver em outras unidades
    if (template.config.unit === 'cm') {
      labelWidth = labelWidth * 10;
      labelHeight = labelHeight * 10;
    } else if (template.config.unit === 'in') {
      labelWidth = labelWidth * 25.4;
      labelHeight = labelHeight * 25.4;
    } else if (template.config.unit === 'px') {
      // Converter pixels para mm (assumindo 96 DPI)
      labelWidth = labelWidth * 0.2645833;
      labelHeight = labelHeight * 0.2645833;
    }
    
    // Área útil da folha A4
    const usableWidth = a4Width - marginLeft - marginRight;
    const usableHeight = a4Height - marginTop - marginBottom;
    
    // Calcular quantas etiquetas cabem
    const columns = Math.floor((usableWidth + spacingH) / (labelWidth + spacingH));
    const rows = Math.floor((usableHeight + spacingV) / (labelHeight + spacingV));
    
    console.log('📐 Layout calculado:', {
      labelWidth: template.config.width,
      labelHeight: template.config.height,
      unit: template.config.unit,
      columns,
      rows,
      totalPerPage: columns * rows
    });
    
    // Determinar unidade para printConfig (não usar px)
    const printUnit = template.config.unit === 'px' ? 'mm' : template.config.unit;
    
    // Atualizar configuração de impressão
    setPrintConfig({
      ...printConfig,
      columns,
      rows,
      spacingHorizontal: spacingH,
      spacingVertical: spacingV,
      marginTop,
      marginBottom,
      marginLeft,
      marginRight,
      labelWidth: template.config.width,
      labelHeight: template.config.height,
      unit: printUnit,
    });
  };

  // Filtrar produtos pela busca
  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Toggle seleção de produto
  const toggleProduct = (id: string) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedProducts(newSelected);
  };

  // Selecionar todos os produtos filtrados
  const selectAll = () => {
    setSelectedProducts(new Set(filteredProducts.map((p) => p.id)));
  };

  // Desselecionar todos
  const deselectAll = () => {
    setSelectedProducts(new Set());
  };

  // Aplicar preset de impressão
  const applyPreset = (preset: PrintPreset) => {
    setPrintConfig({
      ...printConfig,
      ...preset.config,
    });
  };

  // Calcular totais
  const totalLabels = selectedProducts.size;
  const labelsPerPage = printConfig.columns * printConfig.rows;
  const totalPages = Math.ceil(totalLabels / labelsPerPage);

  // Função auxiliar para renderizar uma etiqueta como HTML e capturar como imagem
  const renderLabelToCanvas = async (template: LabelTemplate, elements: LabelElement[]): Promise<string> => {
    // Criar um container temporário
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-99999px';
    container.style.top = '-99999px';
    document.body.appendChild(container);

    // Criar o componente React do LabelCanvas
    const root = ReactDOM.createRoot(container);
    
    return new Promise((resolve, reject) => {
      // Desativar todas as guias visuais para impressão
      const cleanConfig = {
        ...template.config,
        showGrid: false,
        showCenterLine: false,
        showMargins: false,
        showBorders: false,
      };

      // Renderizar o LabelCanvas
      root.render(
        <LabelCanvas
          config={cleanConfig}
          elements={elements}
          selectedElementId={null}
          onSelectElement={() => {}}
          onUpdateElement={() => {}}
          onDeleteElement={() => {}}
          zoom={1}
        />
      );

      // Esperar um pouco para garantir que renderizou
      setTimeout(async () => {
        try {
          const canvasElement = container.querySelector('[style*="transform"]') as HTMLElement;
          if (!canvasElement) {
            throw new Error('Canvas não encontrado');
          }

          // Capturar como imagem
          const canvas = await html2canvas(canvasElement, {
            backgroundColor: template.config.backgroundColor,
            scale: 2,
            useCORS: true,
          });

          const dataUrl = canvas.toDataURL('image/png');

          // Limpar
          root.unmount();
          document.body.removeChild(container);

          resolve(dataUrl);
        } catch (error) {
          root.unmount();
          document.body.removeChild(container);
          reject(error);
        }
      }, 100);
    });
  };

  // Função para abrir o preview/editor com um produto de exemplo
  const handleOpenPreviewEditor = () => {
    if (!selectedTemplateData) {
      alert('❌ Selecione um template primeiro!');
      return;
    }

    if (selectedProducts.size === 0) {
      alert('❌ Selecione pelo menos um produto para visualizar!');
      return;
    }

    // Pegar o primeiro produto selecionado como exemplo
    const firstProductId = Array.from(selectedProducts)[0];
    const product = products.find(p => p.id === firstProductId);
    
    if (!product) return;

    // Criar uma cópia do template para edição temporária
    const templateCopy: LabelTemplate = {
      ...selectedTemplateData,
      id: crypto.randomUUID(), // Novo ID temporário
      config: { ...selectedTemplateData.config, name: `${selectedTemplateData.config.name} (Editando)` },
      elements: selectedTemplateData.elements.map(el => ({ ...el })),
    };

    // NÃO substituir variáveis - mostrar ${nome}, ${preco}, etc. para o usuário saber onde vai cada dado
    // As variáveis serão substituídas apenas na hora de imprimir

    setPreviewTemplate(templateCopy);
    setPreviewProduct(product);
    setShowPreviewEditor(true);
  };

  // Função para atualizar elemento no template de preview
  const handleUpdatePreviewElement = (id: string, updates: Partial<LabelElement>) => {
    if (!previewTemplate) return;
    
    setPreviewTemplate({
      ...previewTemplate,
      elements: previewTemplate.elements.map(el =>
        el.id === id ? { ...el, ...updates } as LabelElement : el
      ),
    });
  };

  // Função para deletar elemento no preview
  const handleDeletePreviewElement = (id: string) => {
    if (!previewTemplate) return;
    
    setPreviewTemplate({
      ...previewTemplate,
      elements: previewTemplate.elements.filter(el => el.id !== id),
    });
    setSelectedElementId(null);
  };

  // Função para salvar o template editado como novo
  const handleSaveAsNewTemplate = async () => {
    if (!previewTemplate) return;

    const newName = prompt('Digite o nome do novo template:', `${selectedTemplateData?.config.name} - Editado`);
    if (!newName) return;

    try {
      const request = templateService.convertToCreateRequest({
        ...previewTemplate,
        config: { ...previewTemplate.config, name: newName },
        thumbnail: '',
        compartilhado: false,
      });

      await templateService.create(request);
      alert('✅ Novo template salvo com sucesso!');
      
      // Recarregar templates
      const apiTemplates = await templateService.list();
      const converted = apiTemplates.map(templateService.convertToLabelTemplate);
      setTemplates(converted);
      
      setShowPreviewEditor(false);
    } catch (err: any) {
      console.error('Erro ao salvar novo template:', err);
      alert(`❌ Erro ao salvar: ${err.response?.data?.detail || err.message}`);
    }
  };

  // Função de impressão com geração real de PDF
  const handlePrint = async (customTemplate?: LabelTemplate) => {
    if (selectedProducts.size === 0) {
      alert('Selecione pelo menos um produto para imprimir!');
      return;
    }

    if (!selectedTemplateData && !customTemplate) {
      alert('Selecione um template de etiqueta!');
      return;
    }

    setIsPrinting(true);
    
    try {
      // Usar o template customizado (editado) se fornecido, senão usar o selecionado
      const template = customTemplate || selectedTemplateData!;
      console.log('🏷️ Template para impressão:', template);
      console.log('📦 Elementos do template:', template.elements);

      // Validar se o template tem elementos
      if (!template.elements || template.elements.length === 0) {
        alert('⚠️ O template selecionado está vazio!\n\nPor favor:\n1. Vá para o Editor de Etiquetas\n2. Selecione este template\n3. Adicione elementos (texto, imagem, código de barras)\n4. Use ${nome}, ${preco}, ${codigo}, ${barcode} nos textos\n5. Salve o template\n6. Volte aqui e tente imprimir novamente');
        setIsPrinting(false);
        return;
      }

      // Criar PDF em formato A4
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: template.config.unit || printConfig.unit,
        format: 'a4',
      });

      // Usar dimensões do template, não do printConfig
      const labelWidth = template.config.width;
      const labelHeight = template.config.height;
      const { columns, rows, spacingHorizontal, spacingVertical, skipLabels } = printConfig;
      
      console.log('⚙️ Configuração de impressão:', { columns, rows, labelWidth, labelHeight, skipLabels });
      console.log('📏 Dimensões do template:', { width: template.config.width, height: template.config.height, unit: template.config.unit });
      const selectedProductsList = Array.from(selectedProducts).map(id => 
        products.find(p => p.id === id)
      ).filter(Boolean) as Product[];

      let currentPage = 1;
      // Começar do índice de etiquetas puladas (skipLabels ou 0)
      let labelIndex = skipLabels || 0;

      console.log('📋 Produtos selecionados:', selectedProductsList);

      // Para cada produto selecionado
      for (const product of selectedProductsList) {
        console.log('🏷️ Processando produto:', product.name);
        
        // Substituir variáveis do template com dados do produto
        const elementsWithData = replaceTemplateVariables(
          template.elements,
          product,
          {
            truncateNames: printConfig.truncateNames,
            maxNameLength: printConfig.maxNameLength,
            priceFormat: printConfig.priceFormat,
            pricePrefix: printConfig.pricePrefix,
          }
        );
        
        console.log('✏️ Elementos com dados substituídos:', elementsWithData);

        // Renderizar etiqueta como imagem usando html2canvas
        const labelImage = await renderLabelToCanvas(template, elementsWithData);
        
        // Calcular posição na grade
        const col = labelIndex % columns;
        const row = Math.floor((labelIndex % (columns * rows)) / columns);
        
        // Se começou uma nova página, adiciona página (exceto na primeira)
        if (labelIndex > 0 && labelIndex % (columns * rows) === 0) {
          pdf.addPage();
          currentPage++;
        }

        // Calcular posição X e Y
        const x = col * (labelWidth + spacingHorizontal) + printConfig.marginLeft;
        const y = row * (labelHeight + spacingVertical) + printConfig.marginTop;
        
        console.log(`📍 Posição da etiqueta: x=${x}, y=${y}, col=${col}, row=${row}`);

        // Desenhar borda se configurado
        if (printConfig.showBorders) {
          pdf.setDrawColor(200, 200, 200);
          pdf.rect(x, y, labelWidth, labelHeight);
        }

        // Adicionar a imagem da etiqueta ao PDF
        pdf.addImage(labelImage, 'PNG', x, y, labelWidth, labelHeight);

        labelIndex++;
      }

      // Salvar PDF
      const fileName = `etiquetas_${selectedProductsList.length}_produtos_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
      const skipInfo = skipLabels && skipLabels > 0 ? `\n• ${skipLabels} etiquetas puladas` : '';
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('❌ Erro ao gerar PDF. Verifique o console para mais detalhes.');
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">🖨️ Impressão em Lote</h1>
              <p className="text-sm text-gray-600 mt-1">
                Selecione os produtos e configure a impressão
              </p>
            </div>
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <i className="fas fa-arrow-left mr-2"></i>
              Voltar
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna Esquerda: Lista de Produtos */}
          <div className="lg:col-span-2 space-y-6">
            {/* Barra de Busca e Ações */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                  <input
                    type="text"
                    placeholder="Buscar produto por nome ou código..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <button
                  onClick={selectAll}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <i className="fas fa-check-double mr-2"></i>
                  Selecionar Todos
                </button>
                <button
                  onClick={deselectAll}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  <i className="fas fa-times mr-2"></i>
                  Limpar
                </button>
              </div>
            </div>

            {/* Lista de Produtos */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <h2 className="font-semibold text-gray-900">
                  Produtos Disponíveis ({filteredProducts.length})
                </h2>
              </div>
              <div className="max-h-[600px] overflow-y-auto">
                {filteredProducts.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <i className="fas fa-inbox text-4xl mb-3"></i>
                    <p>Nenhum produto encontrado</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {filteredProducts.map((product) => (
                      <div
                        key={product.id}
                        onClick={() => toggleProduct(product.id)}
                        className={`p-4 cursor-pointer transition-colors hover:bg-gray-50 ${
                          selectedProducts.has(product.id) ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={selectedProducts.has(product.id)}
                            onChange={() => {}}
                            className="w-5 h-5 text-primary rounded focus:ring-primary"
                          />
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="font-medium text-gray-900">{product.name}</h3>
                                <div className="flex items-center gap-3 mt-1 text-sm text-gray-600">
                                  <span>
                                    <i className="fas fa-barcode mr-1"></i>
                                    {product.code}
                                  </span>
                                  <span>
                                    <i className="fas fa-tag mr-1"></i>
                                    {product.category}
                                  </span>
                                  <span>
                                    <i className="fas fa-box mr-1"></i>
                                    {product.quantity} un.
                                  </span>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-bold text-green-600">
                                  R$ {product.price.toFixed(2)}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Coluna Direita: Configurações e Preview */}
          <div className="space-y-6">
            {/* Resumo */}
            <div className="bg-gradient-to-br from-primary to-blue-600 rounded-lg shadow-lg p-6 text-white">
              <h3 className="text-lg font-semibold mb-4">📊 Resumo da Impressão</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Produtos Selecionados:</span>
                  <span className="text-2xl font-bold">{selectedProducts.size}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Etiquetas por Página:</span>
                  <span className="text-xl font-bold">{labelsPerPage}</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-white/20">
                  <span>Total de Páginas:</span>
                  <span className="text-2xl font-bold">{totalPages}</span>
                </div>
                <div className="text-xs text-blue-100 mt-2">
                  {printConfig.columns} colunas × {printConfig.rows} linhas
                </div>
              </div>
            </div>

            {/* Template Selection */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="font-semibold text-gray-900 mb-3">
                <i className="fas fa-file-invoice mr-2 text-primary"></i>
                Template de Etiqueta
              </h3>
              <select
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-primary"
              >
                <option value="">Selecione um template...</option>
                {templates.map((template) => {
                  const elementCount = template.elements?.length || 0;
                  const status = elementCount === 0 ? '⚠️ Vazio' : `✅ ${elementCount} elementos`;
                  return (
                    <option key={template.id} value={template.id}>
                      {template.config.name} - {status} ({template.config.width}×{template.config.height}{template.config.unit})
                    </option>
                  );
                })}
              </select>
              {templates.length === 0 && (
                <p className="text-xs text-gray-500 mt-2">
                  <i className="fas fa-info-circle mr-1"></i>
                  Crie um template no Editor primeiro
                </p>
              )}
              {selectedTemplateData && selectedTemplateData.elements?.length === 0 && (
                <p className="text-xs text-amber-600 mt-2 bg-amber-50 p-2 rounded">
                  <i className="fas fa-exclamation-triangle mr-1"></i>
                  <strong>Template vazio!</strong> Adicione elementos (texto com ${'{'}nome{'}'}, ${'{'}preco{'}'}, etc.) no Editor
                </p>
              )}
              
              {/* Informações da etiqueta selecionada */}
              {selectedTemplateData && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="text-sm font-semibold text-blue-900 mb-2">
                    📏 Dimensões da Etiqueta
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-blue-700">Largura:</span>
                      <span className="ml-1 font-semibold text-blue-900">
                        {selectedTemplateData.config.width}{selectedTemplateData.config.unit}
                      </span>
                    </div>
                    <div>
                      <span className="text-blue-700">Altura:</span>
                      <span className="ml-1 font-semibold text-blue-900">
                        {selectedTemplateData.config.height}{selectedTemplateData.config.unit}
                      </span>
                    </div>
                    <div className="col-span-2 mt-1 pt-2 border-t border-blue-200">
                      <span className="text-blue-700">Layout calculado:</span>
                      <span className="ml-1 font-semibold text-blue-900">
                        {printConfig.columns}×{printConfig.rows} = {printConfig.columns * printConfig.rows} etiquetas/página
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Presets de Impressão */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="font-semibold text-gray-900 mb-3">
                <i className="fas fa-magic mr-2 text-primary"></i>
                Configurações Rápidas
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {PRINT_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => applyPreset(preset)}
                    className="p-3 border-2 border-gray-200 rounded-lg hover:border-primary hover:bg-blue-50 transition-colors text-left"
                  >
                    <div className="text-2xl mb-1">{preset.icon}</div>
                    <div className="font-medium text-sm text-gray-900">{preset.name}</div>
                    <div className="text-xs text-gray-500">{preset.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="space-y-3">
              {/* Botão Preview e Editar */}
              <button
                onClick={handleOpenPreviewEditor}
                disabled={selectedProducts.size === 0 || !selectedTemplate}
                className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                <i className="fas fa-eye mr-2"></i>
                Preview e Editar Etiqueta
              </button>

              <button
                onClick={() => setShowConfig(!showConfig)}
                className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                <i className="fas fa-cog mr-2"></i>
                Configurações Avançadas
              </button>
              
              <button
                onClick={() => handlePrint()}
                disabled={selectedProducts.size === 0 || !selectedTemplate || isPrinting}
                className="w-full px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-lg"
              >
                {isPrinting ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Gerando PDF...
                  </>
                ) : (
                  <>
                    <i className="fas fa-print mr-2"></i>
                    Gerar PDF ({totalPages} {totalPages === 1 ? 'página' : 'páginas'})
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Modal de Configurações Avançadas */}
        {showConfig && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-gradient-to-r from-primary to-blue-600 text-white p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold">⚙️ Configurações de Impressão</h2>
                  <button
                    onClick={() => setShowConfig(false)}
                    className="text-white hover:bg-white/20 rounded-full p-2"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Layout */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Layout da Página</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Colunas
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={printConfig.columns}
                        onChange={(e) =>
                          setPrintConfig({ ...printConfig, columns: parseInt(e.target.value) })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Linhas
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={printConfig.rows}
                        onChange={(e) =>
                          setPrintConfig({ ...printConfig, rows: parseInt(e.target.value) })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                      />
                    </div>
                  </div>
                </div>

                {/* Espaçamentos */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Espaçamentos (mm)</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Horizontal
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        value={printConfig.spacingHorizontal}
                        onChange={(e) =>
                          setPrintConfig({
                            ...printConfig,
                            spacingHorizontal: parseFloat(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Vertical
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        value={printConfig.spacingVertical}
                        onChange={(e) =>
                          setPrintConfig({
                            ...printConfig,
                            spacingVertical: parseFloat(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                      />
                    </div>
                  </div>
                </div>

                {/* Margens */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Margens (mm)</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Superior
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        value={printConfig.marginTop}
                        onChange={(e) =>
                          setPrintConfig({
                            ...printConfig,
                            marginTop: parseFloat(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Inferior
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        value={printConfig.marginBottom}
                        onChange={(e) =>
                          setPrintConfig({
                            ...printConfig,
                            marginBottom: parseFloat(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Esquerda
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        value={printConfig.marginLeft}
                        onChange={(e) =>
                          setPrintConfig({
                            ...printConfig,
                            marginLeft: parseFloat(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Direita
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        value={printConfig.marginRight}
                        onChange={(e) =>
                          setPrintConfig({
                            ...printConfig,
                            marginRight: parseFloat(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                      />
                    </div>
                  </div>
                </div>

                {/* Pular Primeiras Etiquetas */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Etiquetas Iniciais</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pular Primeiras Etiquetas
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={printConfig.skipLabels}
                      onChange={(e) =>
                        setPrintConfig({
                          ...printConfig,
                          skipLabels: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                      placeholder="0"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Útil para folhas A4 parcialmente usadas. Ex: pular as primeiras 6 etiquetas
                    </p>
                  </div>
                </div>

                {/* Opções */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Opções de Visualização</h3>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={printConfig.showBorders}
                        onChange={(e) =>
                          setPrintConfig({ ...printConfig, showBorders: e.target.checked })
                        }
                        className="rounded"
                      />
                      <span className="text-sm text-gray-700">Mostrar bordas de corte</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t">
                <button
                  onClick={() => setShowConfig(false)}
                  className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600"
                >
                  Aplicar Configurações
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Preview e Edição */}
        {showPreviewEditor && previewTemplate && previewProduct && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-7xl h-[90vh] flex flex-col">
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-t-xl flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <i className="fas fa-eye"></i>
                    Preview e Edição da Etiqueta
                  </h2>
                  <p className="text-purple-100 text-sm mt-1">
                    <i className="fas fa-info-circle mr-1"></i>
                    As variáveis <code className="bg-purple-600 px-1 rounded">{'${nome}'}</code>, <code className="bg-purple-600 px-1 rounded">{'${preco}'}</code>, etc. serão substituídas pelos dados reais na impressão
                  </p>
                  <p className="text-purple-100 text-xs mt-1">
                    Ajuste posições, tamanhos e estilos. Para salvar permanentemente, clique em "Salvar como Novo Template"
                  </p>
                </div>
                <button
                  onClick={() => setShowPreviewEditor(false)}
                  className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 flex overflow-hidden">
                {/* Canvas de Edição */}
                <div className="flex-1 overflow-auto bg-gray-50 p-8">
                  {/* Aviso sobre variáveis e Toggle */}
                  <div className="max-w-4xl mx-auto mb-4">
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg shadow-sm">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1">
                          <i className="fas fa-lightbulb text-blue-500 text-xl mt-1"></i>
                          <div className="flex-1">
                            <h3 className="font-semibold text-blue-900 mb-1">Como funciona:</h3>
                            <p className="text-sm text-blue-800">
                              Os textos como <code className="bg-blue-100 px-1 rounded font-mono">{'${nome}'}</code>, 
                              <code className="bg-blue-100 px-1 rounded font-mono ml-1">{'${preco}'}</code>, 
                              <code className="bg-blue-100 px-1 rounded font-mono ml-1">{'${codigo}'}</code> são 
                              <strong> variáveis</strong> que serão substituídas pelos dados reais de cada produto na hora de imprimir.
                            </p>
                            <p className="text-xs text-blue-700 mt-2">
                              💡 Ajuste a posição, tamanho e estilo dos elementos. Na impressão, cada etiqueta terá os dados do produto correspondente.
                            </p>
                          </div>
                        </div>
                        
                        {/* Toggle Visualização */}
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => setShowPreviewWithData(!showPreviewWithData)}
                            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                              showPreviewWithData
                                ? 'bg-green-500 text-white hover:bg-green-600'
                                : 'bg-blue-500 text-white hover:bg-blue-600'
                            }`}
                          >
                            <i className={`fas fa-${showPreviewWithData ? 'database' : 'code'} mr-2`}></i>
                            {showPreviewWithData ? 'Ver Variáveis' : 'Ver com Dados'}
                          </button>
                          {showPreviewWithData && (
                            <div className="text-xs text-blue-700 text-center">
                              Exemplo: {previewProduct?.name}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-center min-h-full">
                    <LabelCanvas
                      config={previewTemplate.config}
                      elements={
                        showPreviewWithData && previewProduct
                          ? replaceTemplateVariables(
                              previewTemplate.elements,
                              previewProduct,
                              {
                                truncateNames: printConfig.truncateNames,
                                maxNameLength: printConfig.maxNameLength,
                                priceFormat: printConfig.priceFormat,
                                pricePrefix: printConfig.pricePrefix,
                              }
                            )
                          : previewTemplate.elements
                      }
                      selectedElementId={selectedElementId}
                      onSelectElement={setSelectedElementId}
                      onUpdateElement={handleUpdatePreviewElement}
                      onDeleteElement={handleDeletePreviewElement}
                      zoom={2}
                    />
                  </div>
                </div>

                {/* Painel de Propriedades */}
                <div className="w-80 border-l border-gray-200 overflow-auto">
                  <PropertiesPanel
                    element={previewTemplate.elements.find(el => el.id === selectedElementId) || null}
                    onUpdate={(updates) => {
                      if (selectedElementId) {
                        handleUpdatePreviewElement(selectedElementId, updates);
                      }
                    }}
                  />
                </div>
              </div>

              {/* Footer com Ações */}
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  <i className="fas fa-info-circle mr-2"></i>
                  Alterações são temporárias até salvar como novo template
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowPreviewEditor(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
                  >
                    <i className="fas fa-times mr-2"></i>
                    Cancelar
                  </button>
                  <button
                    onClick={handleSaveAsNewTemplate}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium"
                  >
                    <i className="fas fa-save mr-2"></i>
                    Salvar como Novo Template
                  </button>
                  <button
                    onClick={() => {
                      setShowPreviewEditor(false);
                      handlePrint(previewTemplate!);
                    }}
                    className="px-6 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 font-medium"
                  >
                    <i className="fas fa-print mr-2"></i>
                    Imprimir com estas Alterações
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Print;
