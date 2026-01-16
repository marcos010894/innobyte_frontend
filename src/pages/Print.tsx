import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { Product, PrintConfig } from '@/types/product.types';
import type { LabelTemplate, LabelElement } from '@/types/label.types';
import { replaceTemplateVariables } from '@/utils/templateVariables';
import { generateTemplateSubtitle } from '@/types/label.types';
import templateService from '@/services/templateService';
import LabelCanvas from '@/components/labels/LabelCanvas';
import PropertiesPanel from '@/components/labels/PropertiesPanel';
import { useAuth } from '@hooks/useAuth';
import * as integracoesService from '@/services/integracoes.service';
import * as egestorService from '@/services/egestor.service';
import type { IntegracaoAPI } from '@/types/api.types';
import {
  generateBatchThermalCommands,
  downloadThermalFile,
  THERMAL_FORMATS,
  COMMON_DPIS,
  type ThermalPrintConfig,
} from '@/services/thermalPrinter.service';

const Print: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Estados
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [templates, setTemplates] = useState<LabelTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [selectedTemplateData, setSelectedTemplateData] = useState<LabelTemplate | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showConfig, setShowConfig] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  
  // Estados para modo leitor de código de barras
  const [barcodeScannerMode, setBarcodeScannerMode] = useState(false);
  const [scannerInput, setScannerInput] = useState('');
  const scannerInputRef = useRef<HTMLInputElement>(null);
  
  // Estados para integração E-gestor
  const [integracaoEgestor, setIntegracaoEgestor] = useState<IntegracaoAPI | null>(null);
  const [fonteDesvios, setFonteDados] = useState<'manual' | 'egestor'>('manual');
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [egestorPage, setEgestorPage] = useState(1);
  const [hasMoreProducts, setHasMoreProducts] = useState(true);
  
  // Estado para quantidade de etiquetas por produto (chave: id do produto, valor: quantidade)
  const [printQuantities, setPrintQuantities] = useState<Record<string, number>>({});
  
  // Estados para edição de preview
  const [showPreviewEditor, setShowPreviewEditor] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<LabelTemplate | null>(null);
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [showPreviewWithData, setShowPreviewWithData] = useState(false); // Toggle para mostrar com dados reais
  
  // Estados para exportação de impressora térmica
  const [showThermalExport, setShowThermalExport] = useState(false);
  const [thermalConfig, setThermalConfig] = useState<ThermalPrintConfig>({
    format: 'ZPL',
    dpi: 203,
    labelWidth: 50,
    labelHeight: 30,
    printSpeed: 4,
    darkness: 15,
    copies: 1,
  });
  const [isGeneratingThermal, setIsGeneratingThermal] = useState(false);
  
  // Estados para importação de etiquetas
  const [showImportModal, setShowImportModal] = useState(false);
  const [importMode, setImportMode] = useState<'nf' | 'sincronizacao'>('sincronizacao');
  const [importNumeroNF, setImportNumeroNF] = useState('');
  const [importSerieNF, setImportSerieNF] = useState('');
  const [importCategoriaId, setImportCategoriaId] = useState<number | null>(null);
  const [diasComparacao, setDiasComparacao] = useState<number | null>(null); // null = última sincronização
  const [categorias, setCategorias] = useState<egestorService.EgestorCategoria[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [ultimaSincronizacao, setUltimaSincronizacao] = useState<egestorService.SincronizacaoEstoque | null>(null);
  const [importResult, setImportResult] = useState<{
    success: boolean;
    message: string;
    total: number;
    estatisticas?: egestorService.EstatisticasSincronizacao;
  } | null>(null);
  const [lastPrintSuccess, setLastPrintSuccess] = useState(false);
  
  // Configuração de impressão
  const [printConfig, setPrintConfig] = useState<PrintConfig>({
    name: 'Personalizado',
    // Modo de impressão
    printMode: 'auto', // 'grid' = layout manual, 'auto' = calcula automaticamente
    // Tamanho da página
    pageWidth: 210,
    pageHeight: 297,
    pageFormat: 'a4',
    // Layout
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
    // Novas opções de formatação
    ocultarCentavos: false,
    parcelamento: 2,
    abreviarNomes: false,
    // Pular primeiras etiquetas (folhas parcialmente usadas)
    skipLabels: 0,
  });

  // Carregar produtos mockados e templates
  useEffect(() => {
    const loadData = async () => {
      // Carregar templates da API
      try {
        const apiTemplates = await templateService.list();
        console.log('📋 Templates recebidos da API (RAW):', apiTemplates);
        
        const converted = apiTemplates.map(templateService.convertToLabelTemplate);
        console.log('✅ Templates convertidos:', converted);
        
        setTemplates(converted);
        
        if (converted.length > 0) {
          setSelectedTemplate(converted[0].id);
        }
      } catch (err) {
        console.error('❌ Erro ao carregar templates da API:', err);
      }

      // Verificar se tem integração com E-gestor
      if (user?.id) {
        try {
          const response = await integracoesService.getIntegracoes(user.id);
          if (response.success && response.data) {
            const egestorIntegracao = response.data.data.find(
              (i) => i.provedor === 'eGestor' && i.ativa && i.status_conexao === 'conectado'
            );
            if (egestorIntegracao) {
              setIntegracaoEgestor(egestorIntegracao);
              setFonteDados('egestor');
              // Carregar produtos do E-gestor
              await loadEgestorProducts(egestorIntegracao.id, 1);
            } else {
              // Sem integração, usar produtos de exemplo
              loadMockProducts();
            }
          } else {
            loadMockProducts();
          }
        } catch (err) {
          console.error('❌ Erro ao verificar integrações:', err);
          loadMockProducts();
        }
      } else {
        loadMockProducts();
      }
    };
    
    loadData();
  }, [user?.id]);

  // Função para carregar produtos mockados
  const loadMockProducts = () => {
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
    setFonteDados('manual');
  };

  // Função para carregar produtos do E-gestor
  const loadEgestorProducts = async (integracaoId: number, page: number, append: boolean = false) => {
    setIsLoadingProducts(true);
    try {
      const response = await egestorService.getProdutos(integracaoId, { page, filtro: searchTerm || undefined });
      
      if (response.success && response.data) {
        const convertedProducts = response.data.data.map(egestorService.converterProdutoParaImpressao);
        
        if (append) {
          setProducts(prev => [...prev, ...convertedProducts]);
        } else {
          setProducts(convertedProducts);
        }
        
        setEgestorPage(page);
        setHasMoreProducts(response.data.data.length >= 50);
      }
    } catch (err) {
      console.error('❌ Erro ao carregar produtos do E-gestor:', err);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  // Carregar mais produtos do E-gestor
  const loadMoreProducts = async () => {
    if (!integracaoEgestor || !hasMoreProducts || isLoadingProducts) return;
    await loadEgestorProducts(integracaoEgestor.id, egestorPage + 1, true);
  };

  // Recarregar produtos do E-gestor
  const refreshEgestorProducts = async () => {
    if (!integracaoEgestor) return;
    setProducts([]);
    setSelectedProducts(new Set());
    setPrintQuantities({});
    await loadEgestorProducts(integracaoEgestor.id, 1, false);
  };

  // Efeito para manter foco no input do scanner quando modo ativo
  useEffect(() => {
    if (barcodeScannerMode && scannerInputRef.current) {
      scannerInputRef.current.focus();
    }
  }, [barcodeScannerMode]);

  // Função para processar código de barras lido pelo scanner
  const handleBarcodeScanned = async (barcode: string) => {
    if (!barcode.trim()) return;
    
    console.log('🔍 Código de barras lido:', barcode);
    
    // Primeiro, verifica se o produto já está na lista
    const existingProduct = products.find(
      p => p.barcode === barcode || p.code === barcode || p.sku === barcode
    );
    
    if (existingProduct) {
      // Se já existe, seleciona e incrementa a quantidade
      setSelectedProducts(prev => {
        const newSet = new Set(prev);
        newSet.add(existingProduct.id);
        return newSet;
      });
      
      // Incrementar quantidade em 1
      setPrintQuantities(prev => ({
        ...prev,
        [existingProduct.id]: (prev[existingProduct.id] || 0) + 1,
      }));
      
      // Scroll automático e feedback visual
      setTimeout(() => {
        const productCard = document.getElementById(`product-card-${existingProduct.id}`);
        if (productCard) {
          productCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
          productCard.classList.add('ring-4', 'ring-green-500', 'bg-green-50');
          setTimeout(() => {
            productCard.classList.remove('ring-4', 'ring-green-500', 'bg-green-50');
          }, 1000);
        }
      }, 100);
      
      // Limpar input e manter foco
      setScannerInput('');
      if (scannerInputRef.current) {
        scannerInputRef.current.focus();
      }
      
      return;
    }
    
    // Se não encontrou localmente e tem integração E-gestor, busca na API
    if (integracaoEgestor) {
      setIsLoadingProducts(true);
      try {
        const response = await egestorService.getProdutos(integracaoEgestor.id, { 
          page: 1, 
          filtro: barcode 
        });
        
        if (response.success && response.data && response.data.data.length > 0) {
          const foundProducts = response.data.data.map(egestorService.converterProdutoParaImpressao);
          
          // Adiciona os produtos encontrados à lista (evita duplicatas)
          setProducts(prev => {
            const existingIds = new Set(prev.map(p => p.id));
            const newProducts = foundProducts.filter(p => !existingIds.has(p.id));
            return [...prev, ...newProducts];
          });
          
          // Seleciona o primeiro produto encontrado
          if (foundProducts.length > 0) {
            const firstProduct = foundProducts[0];
            setSelectedProducts(prev => {
              const newSet = new Set(prev);
              newSet.add(firstProduct.id);
              return newSet;
            });
            
            // Define quantidade como 1
            setPrintQuantities(prev => ({
              ...prev,
              [firstProduct.id]: 1,
            }));
            
            // Scroll automático e feedback visual (aguarda o DOM atualizar)
            setTimeout(() => {
              const productCard = document.getElementById(`product-card-${firstProduct.id}`);
              if (productCard) {
                productCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                productCard.classList.add('ring-4', 'ring-green-500', 'bg-green-50');
                setTimeout(() => {
                  productCard.classList.remove('ring-4', 'ring-green-500', 'bg-green-50');
                }, 1000);
              }
            }, 200);
          }
        } else {
          // Produto não encontrado
          alert(`❌ Produto não encontrado: ${barcode}`);
        }
      } catch (err) {
        console.error('❌ Erro ao buscar produto:', err);
        alert(`❌ Erro ao buscar produto: ${barcode}`);
      } finally {
        setIsLoadingProducts(false);
      }
    } else {
      // Sem integração E-gestor
      alert(`❌ Produto não encontrado na lista: ${barcode}`);
    }
    
    // Limpar input e manter foco
    setScannerInput('');
    if (scannerInputRef.current) {
      scannerInputRef.current.focus();
    }
  };

  // Handler para o input do scanner
  const handleScannerInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setScannerInput(e.target.value);
  };

  // Handler para Enter ou Tab do scanner
  const handleScannerKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      handleBarcodeScanned(scannerInput);
      setScannerInput('');
    }
  };

  // Carregar template completo quando selecionado
  useEffect(() => {
    const loadFullTemplate = async () => {
      if (!selectedTemplate) {
        setSelectedTemplateData(null);
        return;
      }

      try {
        console.log('📥 [loadFullTemplate] Carregando template completo ID:', selectedTemplate);
        const response = await templateService.getById(selectedTemplate);
        console.log('📥 [loadFullTemplate] Response do backend:', response);
        console.log('📥 [loadFullTemplate] Response.elements:', response.elements);
        
        const converted = templateService.convertToLabelTemplate(response);
        console.log('✅ [loadFullTemplate] Template completo carregado:', converted);
        console.log('📦 [loadFullTemplate] Elements:', converted.elements);
        console.log('📦 [loadFullTemplate] Elements.length:', converted.elements?.length);
        console.log('📋 [loadFullTemplate] pagePrintConfig:', converted.pagePrintConfig);
        
        setSelectedTemplateData(converted);
        
        // Calcular automaticamente o layout baseado no tamanho da etiqueta
        calculateLayout(converted);
      } catch (err) {
        console.error('❌ [loadFullTemplate] Erro ao carregar template completo:', err);
        setSelectedTemplateData(null);
      }
    };

    loadFullTemplate();
  }, [selectedTemplate]);

  // Carregar configuração de impressão do template (se existir) ou calcular automaticamente
  const calculateLayout = (template: LabelTemplate) => {
    // SE o template tem pagePrintConfig, usar diretamente
    if (template.pagePrintConfig) {
      console.log('📋 Usando configuração de impressão salva no template:', template.pagePrintConfig);
      
      const ppc = template.pagePrintConfig;
      const isThermal = ppc.pageSizeType === 'altura-etiqueta';
      
      // Determinar tamanho da página
      let pageWidth = 210;
      let pageHeight = 297;
      
      if (ppc.pageSizeType === 'a4') {
        pageWidth = 210;
        pageHeight = 297;
      } else if (ppc.pageSizeType === 'carta') {
        pageWidth = 215.9;
        pageHeight = 279.4;
      } else if (ppc.pageSizeType === 'altura-etiqueta') {
        // Térmica: página tem altura da etiqueta
        pageWidth = template.config.width * (ppc.columns || 1) + (ppc.marginLeft || 0) + (ppc.spacingHorizontal || 0) * ((ppc.columns || 1) - 1);
        pageHeight = template.config.height;
      } else if (ppc.pageSizeType === 'personalizado') {
        pageWidth = ppc.customPageWidth || 210;
        pageHeight = ppc.customPageHeight || 297;
      }
      
      // Atualizar printConfig com valores do template
      setPrintConfig(prev => ({
        ...prev,
        printMode: isThermal ? 'auto' : 'grid',
        pageWidth,
        pageHeight,
        pageFormat: ppc.pageSizeType === 'a4' ? 'a4' : 'custom', // Carta, personalizado e térmica usam 'custom'
        columns: ppc.columns,
        rows: ppc.rows || 1,
        marginTop: ppc.marginTop || 0,
        marginBottom: ppc.marginBottom || 0,
        marginLeft: ppc.marginLeft || 0,
        marginRight: ppc.marginRight || 0,
        spacingHorizontal: ppc.spacingHorizontal || 0,
        spacingVertical: ppc.spacingVertical || 0,
        skipLabels: ppc.skipLabels || 0,
        showBorders: ppc.showBorders || false,
        labelWidth: template.config.width,
        labelHeight: template.config.height,
        unit: template.config.unit === 'px' ? 'mm' : template.config.unit,
      }));
      
      return;
    }
    
    // SE não tem pagePrintConfig, calcular automaticamente (legado)
    console.log('🔄 Template sem configuração de impressão, calculando automaticamente...');
    
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
      // Remover quantidade quando desseleciona
      setPrintQuantities(prev => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });
    } else {
      newSelected.add(id);
      // Inicializar quantidade como 1 quando seleciona
      setPrintQuantities(prev => ({
        ...prev,
        [id]: 1
      }));
    }
    setSelectedProducts(newSelected);
  };

  // Selecionar todos os produtos filtrados
  const selectAll = () => {
    const newSelected = new Set(filteredProducts.map((p) => p.id));
    setSelectedProducts(newSelected);
    // Inicializar todas as quantidades como 1
    const newQuantities: Record<string, number> = {};
    filteredProducts.forEach(p => {
      newQuantities[p.id] = 1;
    });
    setPrintQuantities(newQuantities);
  };

  // Desselecionar todos
  const deselectAll = () => {
    setSelectedProducts(new Set());
    setPrintQuantities({});
  };

  // Atualizar quantidade de etiquetas para um produto
  const updatePrintQuantity = (productId: string, quantity: number) => {
    setPrintQuantities(prev => ({
      ...prev,
      [productId]: Math.max(1, quantity)
    }));
  };

  // Definir quantidade = estoque para um produto
  const setQuantityFromStock = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      setPrintQuantities(prev => ({
        ...prev,
        [productId]: product.quantity || 1
      }));
    }
  };

  // Aplicar quantidade a todos os produtos selecionados
  const applyQuantityToAll = (mode: 'stock' | 'custom', customQty?: number) => {
    const newQuantities: Record<string, number> = {};
    selectedProducts.forEach(productId => {
      const product = products.find(p => p.id === productId);
      if (product) {
        if (mode === 'stock') {
          newQuantities[productId] = product.quantity || 1;
        } else {
          newQuantities[productId] = customQty || 1;
        }
      }
    });
    setPrintQuantities(prev => ({ ...prev, ...newQuantities }));
  };

  // Obter quantidade de etiquetas para um produto (padrão: 1)
  const getPrintQuantity = (productId: string): number => {
    return printQuantities[productId] || 1;
  };

  // Calcular total de etiquetas considerando as quantidades
  const getTotalLabelsCount = (): number => {
    let total = 0;
    selectedProducts.forEach(productId => {
      total += getPrintQuantity(productId);
    });
    return total;
  };

  // ===== FUNÇÕES DE IMPORTAÇÃO =====
  
  // Carregar categorias do E-gestor para filtro
  const loadCategorias = async () => {
    if (!integracaoEgestor) return;
    
    try {
      // Carregar categorias
      const result = await egestorService.getCategorias(integracaoEgestor.id);
      if (result.success && result.data && result.data.data) {
        setCategorias(result.data.data);
      }
      
      // Carregar última sincronização
      const sincResult = await egestorService.listarSincronizacoes(integracaoEgestor.id, 1);
      if (sincResult.success && sincResult.data && sincResult.data.length > 0) {
        setUltimaSincronizacao(sincResult.data[0]);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  // Importar itens de NF de Compra
  const handleImportNF = async () => {
    if (!integracaoEgestor || !importNumeroNF.trim()) {
      alert('Informe o número da nota fiscal');
      return;
    }
    
    setIsImporting(true);
    setImportResult(null);
    
    try {
      const result = await egestorService.importarNFCompra(
        integracaoEgestor.id,
        importNumeroNF.trim(),
        importSerieNF.trim() || undefined
      );
      
      if (result.success && result.data) {
        const itensConvertidos = result.data.itens.map(
          egestorService.converterItemImportadoParaImpressao
        );
        
        // Adicionar produtos à lista
        setProducts(prev => {
          const produtosExistentes = new Set(prev.map(p => p.id));
          const novosProdutos = itensConvertidos.filter(p => !produtosExistentes.has(p.id));
          return [...prev, ...novosProdutos as Product[]];
        });
        
        // Selecionar todos os produtos importados e definir quantidades
        const novosIds = new Set(itensConvertidos.map(p => p.id));
        setSelectedProducts(prev => new Set([...prev, ...novosIds]));
        
        const novasQuantidades: Record<string, number> = {};
        result.data.itens.forEach(item => {
          novasQuantidades[item.produto_id.toString()] = item.quantidade;
        });
        setPrintQuantities(prev => ({ ...prev, ...novasQuantidades }));
        
        setImportResult({
          success: true,
          message: result.message || `Importados ${result.data.total_itens} itens da NF ${importNumeroNF}`,
          total: result.data.total_quantidade,
        });
        
        // Fechar modal após importação bem-sucedida
        setTimeout(() => setShowImportModal(false), 1500);
      } else {
        setImportResult({
          success: false,
          message: result.message || 'Nota fiscal não encontrada ou sem itens',
          total: 0,
        });
      }
    } catch (error: any) {
      setImportResult({
        success: false,
        message: error.message || 'Erro ao importar nota fiscal',
        total: 0,
      });
    } finally {
      setIsImporting(false);
    }
  };

  // Importar via Sincronização de Estoque (compara diferenças)
  const handleImportSincronizacao = async () => {
    if (!integracaoEgestor) {
      alert('Integração E-gestor não configurada');
      return;
    }
    
    setIsImporting(true);
    setImportResult(null);
    
    try {
      const result = await egestorService.importarViaSincronizacao(
        integracaoEgestor.id,
        true, // Sempre sincronizar antes de importar
        importCategoriaId || undefined,
        diasComparacao || undefined // Dias para comparação
      );
      
      if (result.success && result.data && result.data.itens.length > 0) {
        const itensConvertidos = result.data.itens.map(
          egestorService.converterItemSincronizacaoParaImpressao
        );
        
        // Adicionar produtos à lista
        setProducts(prev => {
          const produtosExistentes = new Set(prev.map(p => p.id));
          const novosProdutos = itensConvertidos.filter(p => !produtosExistentes.has(p.id));
          return [...prev, ...novosProdutos as Product[]];
        });
        
        // Selecionar todos os produtos importados e definir quantidades
        const novosIds = new Set(itensConvertidos.map(p => p.id));
        setSelectedProducts(prev => new Set([...prev, ...novosIds]));
        
        const novasQuantidades: Record<string, number> = {};
        result.data.itens.forEach(item => {
          novasQuantidades[item.produto_id.toString()] = item.quantidade;
        });
        setPrintQuantities(prev => ({ ...prev, ...novasQuantidades }));
        
        // Atualizar última sincronização
        if (result.data.sincronizacao_id) {
          const sincResult = await egestorService.listarSincronizacoes(integracaoEgestor.id, 1);
          if (sincResult.success && sincResult.data && sincResult.data.length > 0) {
            setUltimaSincronizacao(sincResult.data[0]);
          }
        }
        
        setImportResult({
          success: true,
          message: result.message || `Encontradas ${result.data.total_itens} entradas (${result.data.total_quantidade} etiquetas)`,
          total: result.data.total_quantidade,
          estatisticas: result.data.estatisticas,
        });
        
        // Fechar modal após importação bem-sucedida
        setTimeout(() => setShowImportModal(false), 2000);
      } else {
        setImportResult({
          success: false,
          message: result.message || 'Nenhuma entrada de estoque encontrada desde a última sincronização',
          total: 0,
          estatisticas: result.data?.estatisticas,
        });
      }
    } catch (error: any) {
      setImportResult({
        success: false,
        message: error.message || 'Erro ao sincronizar estoque',
        total: 0,
      });
    } finally {
      setIsImporting(false);
    }
  };

  // Excluir produtos selecionados da lista
  const handleExcluirSelecionados = () => {
    if (selectedProducts.size === 0) {
      alert('Nenhum produto selecionado');
      return;
    }
    
    const confirmar = window.confirm(
      `Deseja remover ${selectedProducts.size} item(s) da lista?`
    );
    
    if (confirmar) {
      setProducts(prev => prev.filter(p => !selectedProducts.has(p.id)));
      setSelectedProducts(new Set());
      setPrintQuantities(prev => {
        const novo = { ...prev };
        selectedProducts.forEach(id => delete novo[id]);
        return novo;
      });
    }
  };

  // Limpar toda a lista
  const handleLimparLista = () => {
    const confirmar = window.confirm(
      'Deseja limpar toda a lista de produtos?'
    );
    
    if (confirmar) {
      setProducts([]);
      setSelectedProducts(new Set());
      setPrintQuantities({});
      setLastPrintSuccess(false);
    }
  };

  // Calcular totais (usando quantidades definidas)
  const totalLabels = getTotalLabelsCount();
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
      console.log('🏷️ [handlePrint] Template para impressão:', template);
      console.log('📦 [handlePrint] template.elements:', template.elements);
      console.log('📦 [handlePrint] typeof template.elements:', typeof template.elements);
      console.log('📦 [handlePrint] Array.isArray(template.elements):', Array.isArray(template.elements));
      console.log('📦 [handlePrint] template.elements?.length:', template.elements?.length);
      console.log('📋 [handlePrint] template.pagePrintConfig:', template.pagePrintConfig);
      console.log('⚙️ [handlePrint] template.config:', template.config);
      
      // Debug: verificar estrutura completa
      console.log('🔍 [handlePrint] JSON.stringify(template):', JSON.stringify(template, null, 2));

      // Validar se o template tem elementos
      if (!template.elements || template.elements.length === 0) {
        console.error('❌ [handlePrint] TEMPLATE VAZIO!');
        console.error('❌ [handlePrint] template.elements:', template.elements);
        console.error('❌ [handlePrint] selectedTemplateData:', selectedTemplateData);
        console.error('❌ [handlePrint] customTemplate:', customTemplate);
        
        // Mostrar opção de ir para o editor
        const goToEditor = confirm(
          '⚠️ Template Vazio\n\n' +
          'Este template não possui elementos (textos, código de barras, imagens, etc).\n\n' +
          'Deseja abrir o Editor de Etiquetas para adicionar elementos?'
        );
        
        if (goToEditor && selectedTemplateData) {
          navigate(`/editor?template=${selectedTemplateData.id}`);
        }
        
        setIsPrinting(false);
        return;
      }

      // Usar dimensões do template
      const labelWidth = template.config.width;
      const labelHeight = template.config.height;
      const { spacingHorizontal, spacingVertical, skipLabels, pageWidth, pageHeight, pageFormat, printMode } = printConfig;
      let { columns, rows } = printConfig;
      
      // Calcular dimensões do PDF (inicializar com valores padrão)
      let pdfFormat: string | [number, number] = 'a4';
      let pdfOrientation: 'portrait' | 'landscape' = 'portrait';
      const effectiveMarginTop = printConfig.marginTop;
      const effectiveMarginLeft = printConfig.marginLeft;
      
      // Modos de impressão
      const isAutoMode = printMode === 'auto';
      
      if (isAutoMode) {
        // Modo AUTO: cada página do PDF tem o tamanho exato da etiqueta
        pdfFormat = [labelWidth, labelHeight];
        pdfOrientation = labelWidth > labelHeight ? 'landscape' : 'portrait';
        columns = 1;
        rows = 1;
        console.log('🎯 Modo AUTO: página =', labelWidth, 'x', labelHeight, 'mm (tamanho exato da etiqueta)');
      } else {
        // Modo GRID: usar página A4 ou personalizada com layout de grade
        if (pageFormat === 'a4') {
          pdfFormat = 'a4';
          pdfOrientation = 'portrait';
          console.log('📄 Modo GRID - Página A4 padrão');
        } else {
          // Usar dimensões personalizadas (Carta, Personalizado, etc)
          pdfFormat = [pageWidth, pageHeight];
          pdfOrientation = pageWidth > pageHeight ? 'landscape' : 'portrait';
          console.log('📐 Modo GRID - Página personalizada:', pageWidth, 'x', pageHeight, 'mm');
        }
      }

      // Criar PDF com formato dinâmico
      const pdf = new jsPDF({
        orientation: pdfOrientation,
        unit: printConfig.unit || 'mm',
        format: pdfFormat,
      });
      
      console.log('⚙️ Configuração de impressão:', { columns, rows, labelWidth, labelHeight, skipLabels, pageWidth, pageHeight, printMode });
      console.log('📏 Dimensões do template:', { width: template.config.width, height: template.config.height, unit: template.config.unit });
      const selectedProductsList = Array.from(selectedProducts).map(id => 
        products.find(p => p.id === id)
      ).filter(Boolean) as Product[];

      let currentPage = 1;
      // Começar do índice de etiquetas puladas (skipLabels ou 0)
      let labelIndex = skipLabels || 0;
      let totalLabelsPrinted = 0;

      console.log('📋 Produtos selecionados:', selectedProductsList);

      // Para cada produto selecionado, imprimir a quantidade definida
      for (const product of selectedProductsList) {
        const quantity = getPrintQuantity(product.id);
        console.log(`🏷️ Processando produto: ${product.name} (${quantity} etiquetas)`);
        
        // Substituir variáveis do template com dados do produto
        const elementsWithData = replaceTemplateVariables(
          template.elements,
          product,
          {
            truncateNames: printConfig.truncateNames,
            maxNameLength: printConfig.maxNameLength,
            priceFormat: printConfig.priceFormat,
            pricePrefix: printConfig.pricePrefix,
            // Opções de formatação de PREÇO
            ocultarCentavos: printConfig.ocultarCentavos,
            exibirParcelado: printConfig.exibirParcelado,
            incluirPrecoTotal: printConfig.incluirPrecoTotal,
            exibirPrecoMascarado: printConfig.exibirPrecoMascarado,
            parcelamento: printConfig.parcelamento,
            // Opções de formatação de NOME
            abreviarNomes: printConfig.abreviarNomes,
          }
        );
        
        console.log('✏️ Elementos com dados substituídos:', elementsWithData);

        // Renderizar etiqueta como imagem usando html2canvas (apenas uma vez por produto)
        const labelImage = await renderLabelToCanvas(template, elementsWithData);
        
        // Imprimir a quantidade de etiquetas definida para este produto
        for (let copy = 0; copy < quantity; copy++) {
          
          if (isAutoMode) {
            // === MODO AUTO: Uma etiqueta por página (tamanho exato da etiqueta) ===
            if (totalLabelsPrinted > 0) {
              pdf.addPage();
              currentPage++;
            }
            
            // Etiqueta na posição (0, 0) ocupando toda a página
            if (printConfig.showBorders) {
              pdf.setDrawColor(200, 200, 200);
              pdf.rect(0, 0, labelWidth, labelHeight);
            }
            
            pdf.addImage(labelImage, 'PNG', 0, 0, labelWidth, labelHeight);
            console.log(`📍 Etiqueta ${totalLabelsPrinted + 1} - Página ${currentPage} (${labelWidth}x${labelHeight}mm)`);
            
          } else {
            // === MODO GRID: Várias etiquetas por página A4 ===
            const col = labelIndex % columns;
            const row = Math.floor((labelIndex % (columns * rows)) / columns);
            
            // Se começou uma nova página, adiciona página (exceto na primeira)
            if (labelIndex > 0 && labelIndex % (columns * rows) === 0) {
              pdf.addPage();
              currentPage++;
            }

            // Calcular posição X e Y
            const x = col * (labelWidth + spacingHorizontal) + effectiveMarginLeft;
            const y = row * (labelHeight + spacingVertical) + effectiveMarginTop;
            
            console.log(`📍 Etiqueta ${totalLabelsPrinted + 1}: x=${x.toFixed(1)}, y=${y.toFixed(1)}, col=${col}, row=${row}, página ${currentPage}`);

            // Desenhar borda se configurado
            if (printConfig.showBorders) {
              pdf.setDrawColor(200, 200, 200);
              pdf.rect(x, y, labelWidth, labelHeight);
            }
            
            // Adicionar a imagem da etiqueta ao PDF
            pdf.addImage(labelImage, 'PNG', x, y, labelWidth, labelHeight);
            
            labelIndex++;
          }
          
          totalLabelsPrinted++;
        }
      }

      // Salvar PDF
      const fileName = `etiquetas_${totalLabels}_unidades_${selectedProductsList.length}_produtos_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
      // Marcar impressão como bem-sucedida
      setLastPrintSuccess(true);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('❌ Erro ao gerar PDF. Verifique o console para mais detalhes.');
    } finally {
      setIsPrinting(false);
    }
  };

  /**
   * Gera e baixa arquivo de comandos para impressora térmica (ZPL/EPL/TSPL)
   */
  const handleThermalExport = async () => {
    if (selectedProducts.size === 0) {
      alert('Selecione pelo menos um produto para exportar!');
      return;
    }

    if (!selectedTemplateData) {
      alert('Selecione um template de etiqueta!');
      return;
    }

    setIsGeneratingThermal(true);

    try {
      const template = selectedTemplateData;

      // Validar se o template tem elementos
      if (!template.elements || template.elements.length === 0) {
        const goToEditor = confirm(
          '⚠️ Template Vazio\n\n' +
          'Este template não possui elementos (textos, código de barras, imagens, etc).\n\n' +
          'Deseja abrir o Editor de Etiquetas para adicionar elementos?'
        );
        
        if (goToEditor) {
          navigate(`/editor?template=${selectedTemplateData.id}`);
        }
        
        setIsGeneratingThermal(false);
        return;
      }

      // Montar lista de produtos com quantidade
      const selectedProductsList = Array.from(selectedProducts).map(id => 
        products.find(p => p.id === id)
      ).filter(Boolean) as Product[];

      const productsWithQuantity = selectedProductsList.map(product => ({
        product,
        quantity: getPrintQuantity(product.id),
      }));

      // Usar dimensões do template se não configuradas manualmente
      const configToUse: ThermalPrintConfig = {
        ...thermalConfig,
        labelWidth: thermalConfig.labelWidth || template.config.width,
        labelHeight: thermalConfig.labelHeight || template.config.height,
      };

      // Gerar comandos
      const commands = generateBatchThermalCommands(
        template,
        productsWithQuantity,
        configToUse,
        {
          truncateNames: printConfig.truncateNames,
          maxNameLength: printConfig.maxNameLength,
          priceFormat: printConfig.priceFormat as 'decimal' | 'integer',
          pricePrefix: printConfig.pricePrefix,
        }
      );

      // Baixar arquivo
      const fileName = `etiquetas_${thermalConfig.format.toLowerCase()}_${totalLabels}un_${new Date().toISOString().split('T')[0]}`;
      downloadThermalFile(commands, thermalConfig.format, fileName);

      // Fechar modal
      setShowThermalExport(false);

      alert(`✅ Arquivo ${thermalConfig.format} gerado com sucesso!\n\nArquivo: ${fileName}.${thermalConfig.format === 'TSPL' ? 'prn' : thermalConfig.format.toLowerCase()}`);
    } catch (error) {
      console.error('Erro ao gerar arquivo térmico:', error);
      alert('❌ Erro ao gerar arquivo. Verifique o console para mais detalhes.');
    } finally {
      setIsGeneratingThermal(false);
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
            {/* Barra de Importação e Gerenciamento */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-sm p-4 text-white">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div>
                  <h3 className="font-semibold">
                    <i className="fas fa-file-import mr-2"></i>
                    Importar Produtos para Etiquetas
                  </h3>
                  <p className="text-sm text-blue-100">
                    Importe automaticamente de NF de Compra ou Movimentações de Estoque
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowImportModal(true);
                    loadCategorias();
                  }}
                  disabled={!integracaoEgestor}
                  className="px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <i className="fas fa-download mr-2"></i>
                  Importar
                </button>
              </div>
              {!integracaoEgestor && (
                <p className="text-xs text-yellow-200 mt-2">
                  <i className="fas fa-exclamation-triangle mr-1"></i>
                  Configure a integração E-gestor para usar a importação
                </p>
              )}
            </div>

            {/* Barra de Busca e Ações */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              {/* Contador e ações de seleção */}
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-700">
                    <i className="fas fa-list mr-2 text-primary"></i>
                    Selecionados: <strong className="text-primary">{selectedProducts.size}</strong> / {products.length}
                  </span>
                  <span className="text-sm text-gray-500">
                    ({totalLabels} etiquetas)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={selectAll}
                    className="px-3 py-1.5 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                  >
                    ✅ Selecionar tudo
                  </button>
                  <button
                    onClick={deselectAll}
                    className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    ⬜ Desmarcar tudo
                  </button>
                </div>
              </div>

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
                  onClick={handleExcluirSelecionados}
                  disabled={selectedProducts.size === 0}
                  className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <i className="fas fa-trash mr-2"></i>
                  Excluir Selecionados
                </button>
                <button
                  onClick={handleLimparLista}
                  disabled={products.length === 0}
                  className={`px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    lastPrintSuccess 
                      ? 'bg-green-500 text-white hover:bg-green-600' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <i className="fas fa-broom mr-2"></i>
                  Limpar Lista
                </button>
              </div>

              {/* Toggle e Input do Leitor de Código de Barras */}
              <div className="mt-4 p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={barcodeScannerMode}
                      onChange={(e) => setBarcodeScannerMode(e.target.checked)}
                      className="w-5 h-5 text-amber-500 border-gray-300 rounded focus:ring-amber-500"
                    />
                    <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <i className="fas fa-barcode text-amber-600"></i>
                      Modo Leitor de Código de Barras
                    </span>
                  </label>
                  
                  {barcodeScannerMode && (
                    <div className="flex-1 flex items-center gap-2">
                      <div className="relative flex-1">
                        <i className="fas fa-barcode absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-500 animate-pulse"></i>
                        <input
                          ref={scannerInputRef}
                          type="text"
                          value={scannerInput}
                          onChange={handleScannerInputChange}
                          onKeyDown={handleScannerKeyDown}
                          onBlur={() => {
                            // Refoca automaticamente após perder o foco se ainda estiver no modo scanner
                            if (barcodeScannerMode) {
                              setTimeout(() => scannerInputRef.current?.focus(), 100);
                            }
                          }}
                          placeholder="Bipe ou digite o código de barras..."
                          className="w-full pl-10 pr-4 py-2 border-2 border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white font-mono"
                          autoComplete="off"
                        />
                      </div>
                      <button
                        onClick={() => handleBarcodeScanned(scannerInput)}
                        disabled={!scannerInput.trim()}
                        className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50"
                        title="Buscar"
                      >
                        <i className="fas fa-search"></i>
                      </button>
                    </div>
                  )}
                </div>
                {barcodeScannerMode && (
                  <p className="text-xs text-amber-700 mt-2">
                    <i className="fas fa-info-circle mr-1"></i>
                    Bipe um código de barras ou digite manualmente e pressione Enter. O produto será adicionado e selecionado automaticamente.
                  </p>
                )}
              </div>
              
              {/* Barra de ações rápidas para quantidade - aparece quando há produtos selecionados */}
              {selectedProducts.size > 0 && (
                <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-sm font-medium text-gray-700">
                      <i className="fas fa-layer-group mr-2 text-primary"></i>
                      Aplicar quantidade a todos ({selectedProducts.size}):
                    </span>
                    <button
                      onClick={() => applyQuantityToAll('stock')}
                      className="px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                    >
                      <i className="fas fa-box mr-2"></i>
                      Usar Estoque
                    </button>
                    <button
                      onClick={() => applyQuantityToAll('custom', 1)}
                      className="px-3 py-1.5 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm font-medium"
                    >
                      1 cada
                    </button>
                    <button
                      onClick={() => applyQuantityToAll('custom', 5)}
                      className="px-3 py-1.5 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm font-medium"
                    >
                      5 cada
                    </button>
                    <button
                      onClick={() => applyQuantityToAll('custom', 10)}
                      className="px-3 py-1.5 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm font-medium"
                    >
                      10 cada
                    </button>
                    <div className="flex items-center gap-2 ml-auto">
                      <span className="text-xs text-gray-500">Personalizado:</span>
                      <input
                        type="number"
                        min="1"
                        placeholder="Qtd"
                        className="w-16 px-2 py-1.5 text-sm border border-gray-300 rounded-lg text-center"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const value = parseInt((e.target as HTMLInputElement).value);
                            if (value > 0) {
                              applyQuantityToAll('custom', value);
                              (e.target as HTMLInputElement).value = '';
                            }
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Lista de Produtos */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-gray-900">
                    Produtos Disponíveis ({filteredProducts.length})
                  </h2>
                  <div className="flex items-center gap-2">
                    {fonteDesvios === 'egestor' ? (
                      <>
                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                          <i className="fas fa-plug mr-1"></i>E-gestor
                        </span>
                        <button
                          onClick={refreshEgestorProducts}
                          disabled={isLoadingProducts}
                          className="p-1.5 text-gray-500 hover:text-primary hover:bg-gray-100 rounded transition-colors"
                          title="Recarregar produtos"
                        >
                          <i className={`fas fa-sync ${isLoadingProducts ? 'fa-spin' : ''}`}></i>
                        </button>
                      </>
                    ) : (
                      <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                        <i className="fas fa-edit mr-1"></i>Produtos de exemplo
                      </span>
                    )}
                  </div>
                </div>
                {fonteDesvios === 'manual' && (
                  <p className="text-xs text-amber-600 mt-2">
                    <i className="fas fa-info-circle mr-1"></i>
                    Configure a <a href="/api-integration" className="underline font-medium">integração com E-gestor</a> para importar seus produtos reais.
                  </p>
                )}
              </div>
              <div className="max-h-[600px] overflow-y-auto">
                {isLoadingProducts && products.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <i className="fas fa-spinner fa-spin text-4xl mb-3"></i>
                    <p>Carregando produtos do E-gestor...</p>
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <i className="fas fa-inbox text-4xl mb-3"></i>
                    <p>Nenhum produto encontrado</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {filteredProducts.map((product) => (
                      <div
                        key={product.id}
                        id={`product-card-${product.id}`}
                        className={`p-4 transition-all duration-200 ${
                          selectedProducts.has(product.id) ? 'bg-blue-50' : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={selectedProducts.has(product.id)}
                            onChange={() => toggleProduct(product.id)}
                            className="w-5 h-5 text-primary rounded focus:ring-primary cursor-pointer"
                          />
                          <div className="flex-1 cursor-pointer" onClick={() => toggleProduct(product.id)}>
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
                                  <span className="text-blue-600 font-medium">
                                    <i className="fas fa-box mr-1"></i>
                                    Estoque: {product.quantity} un.
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
                        
                        {/* Controles de quantidade - aparece quando produto está selecionado */}
                        {selectedProducts.has(product.id) && (
                          <div className="mt-3 ml-8 p-3 bg-white rounded-lg border border-blue-200 shadow-sm">
                            <div className="flex items-center justify-between gap-4">
                              <label className="text-sm font-medium text-gray-700">
                                <i className="fas fa-print mr-2 text-primary"></i>
                                Qtd. etiquetas:
                              </label>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updatePrintQuantity(product.id, getPrintQuantity(product.id) - 1);
                                  }}
                                  className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 font-bold transition-colors"
                                >
                                  -
                                </button>
                                <input
                                  type="number"
                                  min="1"
                                  value={getPrintQuantity(product.id)}
                                  onChange={(e) => {
                                    e.stopPropagation();
                                    updatePrintQuantity(product.id, parseInt(e.target.value) || 1);
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                  className="w-16 text-center px-2 py-1 border border-gray-300 rounded-lg text-gray-900 font-semibold"
                                />
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updatePrintQuantity(product.id, getPrintQuantity(product.id) + 1);
                                  }}
                                  className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 font-bold transition-colors"
                                >
                                  +
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setQuantityFromStock(product.id);
                                  }}
                                  className="ml-2 px-3 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg font-medium transition-colors"
                                  title="Usar quantidade em estoque"
                                >
                                  <i className="fas fa-box mr-1"></i>
                                  = Estoque ({product.quantity})
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {/* Botão Carregar Mais - E-gestor */}
                    {fonteDesvios === 'egestor' && hasMoreProducts && (
                      <div className="p-4 text-center border-t border-gray-100">
                        <button
                          onClick={loadMoreProducts}
                          disabled={isLoadingProducts}
                          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
                        >
                          {isLoadingProducts ? (
                            <>
                              <i className="fas fa-spinner fa-spin mr-2"></i>
                              Carregando...
                            </>
                          ) : (
                            <>
                              <i className="fas fa-plus mr-2"></i>
                              Carregar mais produtos
                            </>
                          )}
                        </button>
                      </div>
                    )}
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
                  <span className="text-xl font-bold">{selectedProducts.size}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Total de Etiquetas:</span>
                  <span className="text-2xl font-bold text-yellow-300">{totalLabels}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Etiquetas por Página:</span>
                  <span className="text-lg font-bold">{labelsPerPage}</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-white/20">
                  <span>Total de Páginas:</span>
                  <span className="text-2xl font-bold">{totalPages}</span>
                </div>
                <div className="text-xs text-blue-100 mt-2">
                  {printConfig.columns} colunas × {printConfig.rows} linhas
                </div>
                {totalLabels > 0 && (
                  <div className="mt-3 p-2 bg-white/10 rounded-lg text-xs">
                    <i className="fas fa-info-circle mr-2"></i>
                    {selectedProducts.size} produto(s) × quantidades definidas = {totalLabels} etiqueta(s)
                  </div>
                )}
              </div>
            </div>

            {/* Template Selection */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="font-semibold text-gray-900 mb-3">
                <i className="fas fa-file-invoice mr-2 text-primary"></i>
                Template de Etiqueta
              </h3>
              
              {/* Lista de templates em cards em vez de select */}
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {templates.length === 0 && (
                  <p className="text-sm text-gray-500 p-3 bg-gray-50 rounded-lg">
                    <i className="fas fa-info-circle mr-1"></i>
                    Crie um template no Editor primeiro
                  </p>
                )}
                {templates.map((template) => {
                  const isSelected = selectedTemplate === template.id;
                  const subtitle = generateTemplateSubtitle(template);
                  const hasConfig = !!template.pagePrintConfig;
                  
                  return (
                    <button
                      key={template.id}
                      onClick={() => setSelectedTemplate(template.id)}
                      className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                        isSelected 
                          ? 'border-primary bg-primary/5' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900 truncate">
                              {template.config.name}
                            </span>
                            {hasConfig && (
                              <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
                                ✓ Pronto
                              </span>
                            )}
                            {!hasConfig && (
                              <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded">
                                Sem config
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            {subtitle}
                          </div>
                        </div>
                        {isSelected && (
                          <i className="fas fa-check-circle text-primary"></i>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
              
              {/* Aviso de template vazio */}
              {selectedTemplateData && selectedTemplateData.elements?.length === 0 && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <h4 className="text-sm font-semibold text-red-900 mb-2 flex items-center gap-2">
                    <i className="fas fa-exclamation-triangle"></i>
                    Template Vazio
                  </h4>
                  <p className="text-xs text-red-700 mb-2">
                    Este template não possui elementos (textos, código de barras, etc). Você precisa adicionar elementos antes de imprimir.
                  </p>
                  <button
                    onClick={() => navigate(`/editor?template=${selectedTemplateData.id}`)}
                    className="w-full px-3 py-2 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <i className="fas fa-edit"></i>
                    Abrir no Editor de Etiquetas
                  </button>
                </div>
              )}
              
              {/* Informações da configuração do template */}
              {selectedTemplateData && selectedTemplateData.pagePrintConfig && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="text-sm font-semibold text-green-900 mb-2 flex items-center gap-2">
                    <i className="fas fa-check-circle"></i>
                    Configuração de Impressão Salva
                  </h4>
                  <div className="text-xs text-green-700">
                    {generateTemplateSubtitle(selectedTemplateData)}
                  </div>
                  <p className="text-xs text-green-600 mt-2 italic">
                    As configurações já estão definidas no template. Basta imprimir!
                  </p>
                </div>
              )}
              
              {selectedTemplateData && !selectedTemplateData.pagePrintConfig && (
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="text-sm font-semibold text-yellow-900 mb-2 flex items-center gap-2">
                    <i className="fas fa-exclamation-triangle"></i>
                    Template sem configuração de impressão
                  </h4>
                  <p className="text-xs text-yellow-700">
                    Configure a impressão no Editor de Etiquetas (botão "Impressão") para salvar as configurações junto com o template.
                  </p>
                  <div className="mt-2 pt-2 border-t border-yellow-200">
                    <p className="text-xs text-yellow-600">
                      <strong>Layout calculado automaticamente:</strong> {printConfig.columns}×{printConfig.rows} = {printConfig.columns * printConfig.rows} etiquetas/página
                    </p>
                  </div>
                </div>
              )}
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

              {/* Botão Config Avançadas */}
              <button
                onClick={() => setShowConfig(!showConfig)}
                className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                <i className="fas fa-cog mr-2"></i>
                Configurações Avançadas
              </button>
            </div>

            {/* Formatação de Preço e Nome - Visível na tela */}
            <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-orange-50 rounded-lg border border-purple-200">
              <h4 className="text-sm font-semibold text-purple-900 mb-3 flex items-center gap-2">
                <i className="fas fa-magic text-purple-500"></i>
                Formatação ao Imprimir
              </h4>
              
              {/* Opções de PREÇO */}
              <div className="mb-3 p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-xs font-semibold text-green-800 mb-2">
                  <i className="fas fa-dollar-sign mr-1"></i> Preço
                </p>
                
                <div className="space-y-2">
                  {/* Opção: Ocultar centavos */}
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={printConfig.ocultarCentavos || false}
                      onChange={(e) =>
                        setPrintConfig({ ...printConfig, ocultarCentavos: e.target.checked })
                      }
                      className="rounded text-green-500 mt-0.5"
                    />
                    <div>
                      <span className="text-xs text-gray-700 font-medium">Ocultar centavos</span>
                      <p className="text-[10px] text-gray-500">R$ 100 em vez de R$ 100,00 (apenas quando inteiro)</p>
                    </div>
                  </label>
                  
                  {/* Opção: Exibir parcelado */}
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={printConfig.exibirParcelado || false}
                      onChange={(e) =>
                        setPrintConfig({ 
                          ...printConfig, 
                          exibirParcelado: e.target.checked,
                          exibirPrecoMascarado: false // Desativa o outro se ativar este
                        })
                      }
                      className="rounded text-green-500 mt-0.5"
                    />
                    <div>
                      <span className="text-xs text-gray-700 font-medium">Mostrar parcelado</span>
                      <p className="text-[10px] text-gray-500">2x de R$ 50 em vez de R$ 100</p>
                    </div>
                  </label>
                  
                  {/* Opção: Preço mascarado */}
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={printConfig.exibirPrecoMascarado || false}
                      onChange={(e) =>
                        setPrintConfig({ 
                          ...printConfig, 
                          exibirPrecoMascarado: e.target.checked,
                          exibirParcelado: false // Desativa o outro se ativar este
                        })
                      }
                      className="rounded text-green-500 mt-0.5"
                    />
                    <div>
                      <span className="text-xs text-gray-700 font-medium">Preço mascarado</span>
                      <p className="text-[10px] text-gray-500">CO0033 (2 letras do nome + centavos)</p>
                    </div>
                  </label>
                  
                  {/* Parcelamento - só mostra se exibir parcelado */}
                  {printConfig.exibirParcelado && (
                    <div className="pl-5 pt-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <label className="text-xs text-gray-600">Parcelas:</label>
                        <select
                          value={printConfig.parcelamento || 2}
                          onChange={(e) =>
                            setPrintConfig({ ...printConfig, parcelamento: parseInt(e.target.value) })
                          }
                          className="px-2 py-1 border border-gray-300 rounded text-xs text-gray-900 bg-white"
                        >
                          <option value="2">2x</option>
                          <option value="3">3x</option>
                          <option value="4">4x</option>
                          <option value="5">5x</option>
                          <option value="6">6x</option>
                          <option value="10">10x</option>
                          <option value="12">12x</option>
                        </select>
                      </div>
                      <label className="flex items-start gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={printConfig.incluirPrecoTotal || false}
                          onChange={(e) =>
                            setPrintConfig({ ...printConfig, incluirPrecoTotal: e.target.checked })
                          }
                          className="rounded text-green-500 mt-0.5"
                        />
                        <div>
                          <span className="text-xs text-gray-700 font-medium">Incluir preço total</span>
                          <p className="text-[10px] text-gray-500">R$ 100,00 | 2x R$ 50,00</p>
                        </div>
                      </label>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Opções de NOME */}
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-xs font-semibold text-blue-800 mb-2">
                  <i className="fas fa-font mr-1"></i> Nome do Produto
                </p>
                
                <div className="space-y-2">
                  {/* Opção: Abreviar nomes */}
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={printConfig.abreviarNomes || false}
                      onChange={(e) =>
                        setPrintConfig({ ...printConfig, abreviarNomes: e.target.checked })
                      }
                      className="rounded text-blue-500 mt-0.5"
                    />
                    <div>
                      <span className="text-xs text-gray-700 font-medium">Abreviar nomes (4 letras)</span>
                      <p className="text-[10px] text-gray-500">"Brinco Prata" → "Brin Prat"</p>
                    </div>
                  </label>
                  
                  {/* Opção: Truncar nomes */}
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={printConfig.truncateNames || false}
                      onChange={(e) =>
                        setPrintConfig({ ...printConfig, truncateNames: e.target.checked })
                      }
                      className="rounded text-blue-500 mt-0.5"
                    />
                    <div>
                      <span className="text-xs text-gray-700 font-medium">Truncar nomes longos</span>
                      <p className="text-[10px] text-gray-500">Corta nomes muito longos com "..."</p>
                    </div>
                  </label>
                  
                  {/* Max length - só mostra se truncar */}
                  {printConfig.truncateNames && (
                    <div className="flex items-center gap-2 pl-5 pt-1">
                      <label className="text-xs text-gray-600">Máximo:</label>
                      <input
                        type="number"
                        min="5"
                        max="50"
                        value={printConfig.maxNameLength || 20}
                        onChange={(e) =>
                          setPrintConfig({ ...printConfig, maxNameLength: parseInt(e.target.value) })
                        }
                        className="w-16 px-2 py-1 border border-gray-300 rounded text-xs text-gray-900 bg-white"
                      />
                      <span className="text-xs text-gray-500">caracteres</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Botão Imprimir */}
            <div className="mt-4">
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
                    Gerar PDF - {totalLabels} etiqueta{totalLabels !== 1 ? 's' : ''} ({totalPages} {totalPages === 1 ? 'página' : 'páginas'})
                  </>
                )}
              </button>
              
              {/* Botão Impressora Térmica */}
              <br />
              <button
                onClick={() => setShowThermalExport(true)}
                disabled={selectedProducts.size === 0 || !selectedTemplate}
                className="w-full px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                <i className="fas fa-barcode mr-2"></i>
                Exportar para Impressora Térmica (ZPL/EPL/TSPL)
              </button>
            </div>
          </div>
        </div>

        {/* Modal de Importação de Produtos */}
        {showImportModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold">
                    <i className="fas fa-file-import mr-2"></i>
                    Importar para Etiquetas
                  </h2>
                  <button
                    onClick={() => setShowImportModal(false)}
                    className="text-white hover:bg-white/20 rounded-full p-2"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Seletor de modo de importação */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Importar de:
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setImportMode('sincronizacao')}
                      className={`p-4 border-2 rounded-lg text-center transition-colors ${
                        importMode === 'sincronizacao'
                          ? 'border-purple-500 bg-purple-50 text-purple-700'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      <i className="fas fa-sync-alt text-2xl mb-2"></i>
                      <div className="font-medium">Entrada de Estoque</div>
                      <div className="text-xs text-gray-500">Sincroniza e mostra diferenças</div>
                    </button>
                    <button
                      onClick={() => setImportMode('nf')}
                      className={`p-4 border-2 rounded-lg text-center transition-colors ${
                        importMode === 'nf'
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <i className="fas fa-file-invoice text-2xl mb-2"></i>
                      <div className="font-medium">Nota Fiscal</div>
                      <div className="text-xs text-gray-500">Importar de uma NF específica</div>
                    </button>
                  </div>
                </div>

                {/* Formulário para Sincronização de Estoque */}
                {importMode === 'sincronizacao' && (
                  <div className="space-y-4">
                    {/* Info sobre última sincronização */}
                    {ultimaSincronizacao && (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <p className="text-sm text-gray-600">
                          <i className="fas fa-history mr-2"></i>
                          <strong>Última sincronização:</strong>{' '}
                          {new Date(ultimaSincronizacao.data_sincronizacao).toLocaleString('pt-BR')}
                        </p>
                        <div className="flex gap-4 mt-2 text-xs text-gray-500">
                          <span>📦 {ultimaSincronizacao.total_produtos} produtos</span>
                          <span>📥 {ultimaSincronizacao.total_entradas + ultimaSincronizacao.total_novos} entradas</span>
                          <span>📤 {ultimaSincronizacao.total_saidas} saídas</span>
                        </div>
                      </div>
                    )}
                    
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <p className="text-sm text-purple-700">
                        <i className="fas fa-info-circle mr-2"></i>
                        <strong>Como funciona:</strong>
                      </p>
                      <ol className="text-xs text-purple-600 mt-2 space-y-1 list-decimal list-inside">
                        <li>O sistema busca todos os produtos no E-gestor</li>
                        <li>Compara com a última sincronização</li>
                        <li>Mostra apenas os que <strong>aumentaram</strong> de estoque</li>
                        <li>A quantidade de etiquetas = quantidade que entrou</li>
                      </ol>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <i className="fas fa-tags mr-2"></i>
                        Filtrar por Grupo/Categoria (opcional)
                      </label>
                      <select
                        value={importCategoriaId || ''}
                        onChange={(e) => setImportCategoriaId(e.target.value ? parseInt(e.target.value) : null)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="">Todos os grupos</option>
                        {categorias.map((cat) => (
                          <option key={cat.codigo} value={cat.codigo}>
                            {cat.nome}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <i className="fas fa-calendar-alt mr-2"></i>
                        Período de Comparação
                      </label>
                      <select
                        value={diasComparacao === null ? '' : diasComparacao}
                        onChange={(e) => setDiasComparacao(e.target.value === '' ? null : parseInt(e.target.value))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="">Última sincronização</option>
                        <option value="1">Desde ontem (1 dia)</option>
                        <option value="3">Últimos 3 dias</option>
                        <option value="7">Última semana (7 dias)</option>
                        <option value="15">Últimos 15 dias</option>
                        <option value="30">Último mês (30 dias)</option>
                        <option value="60">Últimos 2 meses</option>
                        <option value="90">Últimos 3 meses</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        {diasComparacao === null 
                          ? 'Compara com a sincronização anterior mais recente'
                          : `Compara estoque atual com o de ${diasComparacao} dia(s) atrás`
                        }
                      </p>
                    </div>
                  </div>
                )}

                {/* Formulário para NF de Compra */}
                {importMode === 'nf' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <i className="fas fa-hashtag mr-2"></i>
                        Número da Nota Fiscal *
                      </label>
                      <input
                        type="text"
                        value={importNumeroNF}
                        onChange={(e) => setImportNumeroNF(e.target.value)}
                        placeholder="Ex: 12345"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Série (opcional)
                      </label>
                      <input
                        type="text"
                        value={importSerieNF}
                        onChange={(e) => setImportSerieNF(e.target.value)}
                        placeholder="Ex: 1"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-700">
                        <i className="fas fa-lightbulb mr-2"></i>
                        <strong>Dica:</strong> A quantidade de cada item será a quantidade da nota.
                        O preço de venda será buscado da nota ou do cadastro do produto.
                      </p>
                    </div>
                  </div>
                )}

                {/* Resultado da importação */}
                {importResult && (
                  <div className={`p-4 rounded-lg ${
                    importResult.success 
                      ? 'bg-green-50 border border-green-200' 
                      : 'bg-yellow-50 border border-yellow-200'
                  }`}>
                    <div className={`flex items-center ${
                      importResult.success ? 'text-green-700' : 'text-yellow-700'
                    }`}>
                      <i className={`fas ${importResult.success ? 'fa-check-circle' : 'fa-info-circle'} mr-2`}></i>
                      <span>{importResult.message}</span>
                    </div>
                    {importResult.success && importResult.total > 0 && (
                      <div className="text-green-600 text-sm mt-1">
                        <i className="fas fa-tag mr-1"></i>
                        Total de etiquetas: <strong>{importResult.total}</strong>
                      </div>
                    )}
                    {importResult.estatisticas && (
                      <div className="flex gap-3 mt-2 text-xs text-gray-600">
                        <span>📥 {importResult.estatisticas.entradas} entradas</span>
                        <span>🆕 {importResult.estatisticas.novos} novos</span>
                        <span>📤 {importResult.estatisticas.saidas} saídas</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Botões */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowImportModal(false)}
                    className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={importMode === 'nf' ? handleImportNF : handleImportSincronizacao}
                    disabled={isImporting || (importMode === 'nf' && !importNumeroNF.trim())}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    {isImporting ? (
                      <>
                        <i className="fas fa-spinner fa-spin mr-2"></i>
                        {importMode === 'sincronizacao' ? 'Sincronizando...' : 'Importando...'}
                      </>
                    ) : (
                      <>
                        <i className={`fas ${importMode === 'sincronizacao' ? 'fa-sync-alt' : 'fa-download'} mr-2`}></i>
                        {importMode === 'sincronizacao' ? 'Sincronizar e Importar' : 'Importar'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Exportação Térmica */}
        {showThermalExport && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold">🖨️ Exportar para Impressora Térmica</h2>
                  <button
                    onClick={() => setShowThermalExport(false)}
                    className="text-white hover:bg-white/20 rounded-full p-2"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Formato da Impressora */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <i className="fas fa-print mr-2"></i>
                    Formato/Linguagem
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {THERMAL_FORMATS.map((format) => (
                      <button
                        key={format.value}
                        onClick={() => setThermalConfig({ ...thermalConfig, format: format.value })}
                        className={`p-3 border-2 rounded-lg text-center transition-colors ${
                          thermalConfig.format === format.value
                            ? 'border-orange-500 bg-orange-50 text-orange-700'
                            : 'border-gray-200 hover:border-orange-300'
                        }`}
                      >
                        <div className="font-bold text-sm">{format.label}</div>
                        <div className="text-xs text-gray-500 mt-1">{format.description.split(' - ')[1]}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* DPI */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <i className="fas fa-ruler mr-2"></i>
                    Resolução (DPI)
                  </label>
                  <select
                    value={thermalConfig.dpi}
                    onChange={(e) => setThermalConfig({ ...thermalConfig, dpi: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                  >
                    {COMMON_DPIS.map((dpi) => (
                      <option key={dpi.value} value={dpi.value}>
                        {dpi.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    A maioria das impressoras térmicas usa 203 DPI
                  </p>
                </div>

                {/* Dimensões do Label */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Largura (mm)
                    </label>
                    <input
                      type="number"
                      min="10"
                      max="200"
                      value={thermalConfig.labelWidth}
                      onChange={(e) => setThermalConfig({ ...thermalConfig, labelWidth: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Altura (mm)
                    </label>
                    <input
                      type="number"
                      min="10"
                      max="200"
                      value={thermalConfig.labelHeight}
                      onChange={(e) => setThermalConfig({ ...thermalConfig, labelHeight: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                    />
                  </div>
                </div>

                {/* Velocidade e Densidade */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Velocidade (1-10)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={thermalConfig.printSpeed}
                      onChange={(e) => setThermalConfig({ ...thermalConfig, printSpeed: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Escuridão (0-30)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="30"
                      value={thermalConfig.darkness}
                      onChange={(e) => setThermalConfig({ ...thermalConfig, darkness: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                    />
                  </div>
                </div>

                {/* Resumo */}
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h4 className="font-semibold text-orange-800 mb-2">
                    <i className="fas fa-info-circle mr-2"></i>
                    Resumo da Exportação
                  </h4>
                  <div className="text-sm text-orange-700 space-y-1">
                    <div>• Formato: <strong>{thermalConfig.format}</strong></div>
                    <div>• Produtos: <strong>{selectedProducts.size}</strong></div>
                    <div>• Total de etiquetas: <strong>{totalLabels}</strong></div>
                    <div>• Tamanho: <strong>{thermalConfig.labelWidth}×{thermalConfig.labelHeight}mm</strong></div>
                  </div>
                </div>

                {/* Aviso */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-700">
                    <i className="fas fa-lightbulb mr-2"></i>
                    <strong>Dica:</strong> O arquivo gerado pode ser enviado diretamente para a impressora térmica via porta serial, USB ou rede, dependendo do modelo da impressora.
                  </p>
                </div>

                {/* Botões */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowThermalExport(false)}
                    className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleThermalExport}
                    disabled={isGeneratingThermal}
                    className="flex-1 px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    {isGeneratingThermal ? (
                      <>
                        <i className="fas fa-spinner fa-spin mr-2"></i>
                        Gerando...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-download mr-2"></i>
                        Baixar Arquivo {thermalConfig.format}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

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
                {/* Modo de Impressão */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">🖨️ Modo de Impressão</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setPrintConfig({ ...printConfig, printMode: 'grid' })}
                      className={`p-4 border-2 rounded-lg text-left transition-all ${
                        printConfig.printMode === 'grid'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">📋</span>
                        <div>
                          <div className="font-medium text-gray-900">Grade (A4)</div>
                          <div className="text-xs text-gray-500">Múltiplas etiquetas por página</div>
                        </div>
                      </div>
                    </button>
                    <button
                      onClick={() => setPrintConfig({ ...printConfig, printMode: 'auto' })}
                      className={`p-4 border-2 rounded-lg text-left transition-all ${
                        printConfig.printMode === 'auto'
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">🎯</span>
                        <div>
                          <div className="font-medium text-gray-900">Automático</div>
                          <div className="text-xs text-gray-500">Página = tamanho da etiqueta</div>
                        </div>
                      </div>
                    </button>
                  </div>
                  
                  {printConfig.printMode === 'grid' && (
                    <p className="text-sm text-blue-600 mt-2 bg-blue-50 p-2 rounded">
                      📋 Múltiplas etiquetas numa folha A4 com layout definido (colunas × linhas)
                    </p>
                  )}
                  {printConfig.printMode === 'auto' && (
                    <p className="text-sm text-green-600 mt-2 bg-green-50 p-2 rounded">
                      🎯 Cada página do PDF terá o tamanho exato da etiqueta (ex: 33×21mm). Ideal para impressoras térmicas.
                    </p>
                  )}
                </div>

                {/* Tamanho da Página - só mostra no modo grid */}
                {printConfig.printMode === 'grid' && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">📄 Tamanho da Página</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Formato
                      </label>
                      <select
                        value={printConfig.pageFormat}
                        onChange={(e) => {
                          const format = e.target.value as 'a4' | 'custom';
                          if (format === 'a4') {
                            setPrintConfig({ ...printConfig, pageFormat: format, pageWidth: 210, pageHeight: 297 });
                          } else {
                            setPrintConfig({ ...printConfig, pageFormat: format });
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                      >
                        <option value="a4">A4 (210x297mm)</option>
                        <option value="custom">Personalizado</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Largura (mm)
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        min="10"
                        max="500"
                        value={printConfig.pageWidth}
                        onChange={(e) =>
                          setPrintConfig({ ...printConfig, pageWidth: parseFloat(e.target.value), pageFormat: 'custom' })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                        disabled={printConfig.pageFormat === 'a4'}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Altura (mm)
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        min="10"
                        max="500"
                        value={printConfig.pageHeight}
                        onChange={(e) =>
                          setPrintConfig({ ...printConfig, pageHeight: parseFloat(e.target.value), pageFormat: 'custom' })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                        disabled={printConfig.pageFormat === 'a4'}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Use "Personalizado" para etiquetadoras térmicas (ex: 33x21mm, 95x12mm)
                  </p>
                </div>
                )}

                {/* Layout - só mostra no modo grid (manual) */}
                {printConfig.printMode === 'grid' && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">📐 Layout da Grade</h3>
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
                )}

                {/* Espaçamentos - só mostra no modo grid */}
                {printConfig.printMode === 'grid' && (
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
                )}

                {/* Margens - só mostra no modo grid */}
                {printConfig.printMode === 'grid' && (
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
                )}

                {/* Pular Primeiras Etiquetas - só mostra no modo grid */}
                {printConfig.printMode === 'grid' && (
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
                )}

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

                {/* Opções Avançadas de Formatação */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">
                    <i className="fas fa-magic mr-2 text-purple-500"></i>
                    Formatação Avançada
                  </h3>
                  
                  {/* Opções de Preço */}
                  <div className="space-y-3 mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm font-medium text-green-800">
                      <i className="fas fa-dollar-sign mr-2"></i>
                      Opções de Preço
                    </p>
                    
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={printConfig.ocultarCentavos}
                        onChange={(e) =>
                          setPrintConfig({ ...printConfig, ocultarCentavos: e.target.checked })
                        }
                        className="rounded text-green-500"
                      />
                      <span className="text-sm text-gray-700">
                        Ocultar centavos quando valor é inteiro
                        <span className="text-xs text-gray-500 ml-1">(R$ 100 em vez de R$ 100,00)</span>
                      </span>
                    </label>
                    
                    <div className="flex items-center gap-3">
                      <label className="text-sm text-gray-700">Parcelamento:</label>
                      <select
                        value={printConfig.parcelamento || 2}
                        onChange={(e) =>
                          setPrintConfig({ ...printConfig, parcelamento: parseInt(e.target.value) })
                        }
                        className="px-3 py-1 border border-gray-300 rounded-lg text-sm text-gray-900"
                      >
                        <option value="2">2x</option>
                        <option value="3">3x</option>
                        <option value="4">4x</option>
                        <option value="5">5x</option>
                        <option value="6">6x</option>
                        <option value="10">10x</option>
                        <option value="12">12x</option>
                      </select>
                      <span className="text-xs text-gray-500">
                        (usado em $&#123;preco_parcelado&#125;)
                      </span>
                    </div>
                  </div>
                  
                  {/* Opções de Nome */}
                  <div className="space-y-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm font-medium text-blue-800">
                      <i className="fas fa-font mr-2"></i>
                      Opções de Nome
                    </p>
                    
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={printConfig.abreviarNomes}
                        onChange={(e) =>
                          setPrintConfig({ ...printConfig, abreviarNomes: e.target.checked })
                        }
                        className="rounded text-blue-500"
                      />
                      <span className="text-sm text-gray-700">
                        Abreviar nomes (4 letras por palavra)
                        <span className="text-xs text-gray-500 ml-1">("Brinco Prata" → "Brin Prat")</span>
                      </span>
                    </label>
                    
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={printConfig.truncateNames}
                        onChange={(e) =>
                          setPrintConfig({ ...printConfig, truncateNames: e.target.checked })
                        }
                        className="rounded text-blue-500"
                      />
                      <span className="text-sm text-gray-700">Truncar nomes longos</span>
                    </label>
                    
                    {printConfig.truncateNames && (
                      <div className="flex items-center gap-2 ml-6">
                        <label className="text-sm text-gray-700">Máx. caracteres:</label>
                        <input
                          type="number"
                          min="5"
                          max="50"
                          value={printConfig.maxNameLength || 20}
                          onChange={(e) =>
                            setPrintConfig({ ...printConfig, maxNameLength: parseInt(e.target.value) })
                          }
                          className="w-20 px-2 py-1 border border-gray-300 rounded text-sm text-gray-900"
                        />
                      </div>
                    )}
                  </div>
                  
                  {/* Dica de variáveis especiais */}
                  <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <p className="text-sm font-medium text-purple-800 mb-2">
                      <i className="fas fa-info-circle mr-2"></i>
                      Variáveis Especiais
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-white rounded px-2 py-1">
                        <code className="text-purple-600">$&#123;preco_mascarado&#125;</code>
                        <p className="text-gray-500">CO0033 (2 letras + centavos)</p>
                      </div>
                      <div className="bg-white rounded px-2 py-1">
                        <code className="text-purple-600">$&#123;preco_parcelado&#125;</code>
                        <p className="text-gray-500">2x de R$ 9,95</p>
                      </div>
                      <div className="bg-white rounded px-2 py-1">
                        <code className="text-purple-600">$&#123;preco_cheio_parcelado&#125;</code>
                        <p className="text-gray-500">R$ 19,90 | 2x R$ 9,95</p>
                      </div>
                      <div className="bg-white rounded px-2 py-1">
                        <code className="text-purple-600">$&#123;nome_abreviado&#125;</code>
                        <p className="text-gray-500">Brin Prat (4 letras)</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Presets Rápidos */}
                {/* <div>
                  <h3 className="font-semibold text-gray-900 mb-4">🎯 Presets Rápidos</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {PRINT_PRESETS.map((preset, index) => (
                      <button
                        key={preset.id || index}
                        onClick={() => setPrintConfig({
                          ...printConfig,
                          ...preset.config,
                          name: preset.name,
                        })}
                        className={`text-left p-3 border rounded-lg text-sm hover:border-blue-500 hover:bg-blue-50 transition-colors ${
                          printConfig.name === preset.name ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                        }`}
                      >
                        <div className="font-medium text-gray-900">{preset.name}</div>
                        <div className="text-xs text-gray-500">
                          {preset.config.columns}x{preset.config.rows} | {preset.config.pageWidth}x{preset.config.pageHeight}mm
                        </div>
                      </button>
                    ))}
                  </div>
                </div> */}
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
                                // Opções de formatação de PREÇO
                                ocultarCentavos: printConfig.ocultarCentavos,
                                exibirParcelado: printConfig.exibirParcelado,
                                incluirPrecoTotal: printConfig.incluirPrecoTotal,
                                exibirPrecoMascarado: printConfig.exibirPrecoMascarado,
                                parcelamento: printConfig.parcelamento,
                                // Opções de formatação de NOME
                                abreviarNomes: printConfig.abreviarNomes,
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
