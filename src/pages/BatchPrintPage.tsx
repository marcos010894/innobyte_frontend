import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Product, PrintConfig, PrintPreset } from '@/types/product.types';
import { PRINT_PRESETS } from '@/types/product.types';
import type { LabelTemplate } from '@/types/label.types';

const BatchPrintPage: React.FC = () => {
  const navigate = useNavigate();
  
  // Estados
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [templates, setTemplates] = useState<LabelTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showConfig, setShowConfig] = useState(false);
  
  // Configuração de impressão
  const [printConfig, setPrintConfig] = useState<PrintConfig>({
    columns: 3,
    rows: 8,
    spacingHorizontal: 2,
    spacingVertical: 2,
    marginTop: 5,
    marginBottom: 5,
    marginLeft: 5,
    marginRight: 5,
    labelWidth: 50,
    labelHeight: 30,
    unit: 'mm',
    showBorders: false,
    showPrice: true,
    showBarcode: true,
  });

  // Carregar produtos e templates do localStorage
  useEffect(() => {
    loadProducts();
    loadTemplates();
  }, []);

  const loadProducts = () => {
    // Simulação - você pode substituir por sua API real
    const mockProducts: Product[] = [
      {
        id: '1',
        name: 'Produto A',
        code: 'PRD001',
        price: 29.90,
        quantity: 100,
        category: 'Eletrônicos',
        barcode: '7891234567890',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '2',
        name: 'Produto B',
        code: 'PRD002',
        price: 49.90,
        quantity: 50,
        category: 'Roupas',
        barcode: '7891234567891',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // Adicione mais produtos conforme necessário
    ];
    
    const savedProducts = localStorage.getItem('products');
    setProducts(savedProducts ? JSON.parse(savedProducts) : mockProducts);
  };

  const loadTemplates = () => {
    const savedTemplates = localStorage.getItem('labelTemplates');
    if (savedTemplates) {
      setTemplates(JSON.parse(savedTemplates));
    }
  };

  // Filtrar produtos
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Toggle seleção de produto
  const toggleProduct = (productId: string) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProducts(newSelected);
  };

  // Selecionar todos
  const selectAll = () => {
    if (selectedProducts.size === filteredProducts.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(filteredProducts.map(p => p.id)));
    }
  };

  // Aplicar preset
  const applyPreset = (preset: PrintPreset) => {
    setPrintConfig(prev => ({
      ...prev,
      ...preset.config,
    }));
  };

  // Calcular estatísticas
  const totalLabels = selectedProducts.size;
  const labelsPerPage = printConfig.columns * printConfig.rows;
  const totalPages = Math.ceil(totalLabels / labelsPerPage);

  // Gerar impressão
  const handlePrint = () => {
    if (selectedProducts.size === 0) {
      alert('Selecione pelo menos um produto!');
      return;
    }
    
    if (!selectedTemplate) {
      alert('Selecione um template de etiqueta!');
      return;
    }

    // Aqui você implementará a geração do PDF
    console.log('Gerando impressão...', {
      products: Array.from(selectedProducts),
      template: selectedTemplate,
      config: printConfig,
      totalPages,
    });
    
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="text-gray-600 hover:text-gray-800"
              >
                <i className="fas fa-arrow-left"></i>
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Impressão em Lote
                </h1>
                <p className="text-sm text-gray-500">
                  Selecione os produtos e configure a impressão
                </p>
              </div>
            </div>
            
            <button
              onClick={handlePrint}
              disabled={selectedProducts.size === 0}
              className="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i className="fas fa-print mr-2"></i>
              Imprimir ({selectedProducts.size})
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lista de Produtos */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              {/* Toolbar */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center gap-4">
                  <div className="flex-1 relative">
                    <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                    <input
                      type="text"
                      placeholder="Buscar produtos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-gray-900"
                    />
                  </div>
                  
                  <button
                    onClick={selectAll}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200"
                  >
                    <i className="fas fa-check-square mr-2"></i>
                    {selectedProducts.size === filteredProducts.length ? 'Desmarcar' : 'Marcar'} Todos
                  </button>
                </div>
              </div>

              {/* Lista */}
              <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
                {filteredProducts.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <i className="fas fa-inbox text-4xl mb-4"></i>
                    <p>Nenhum produto encontrado</p>
                  </div>
                ) : (
                  filteredProducts.map(product => (
                    <div
                      key={product.id}
                      onClick={() => toggleProduct(product.id)}
                      className={`p-4 cursor-pointer transition-colors ${
                        selectedProducts.has(product.id)
                          ? 'bg-blue-50 hover:bg-blue-100'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 pt-1">
                          <input
                            type="checkbox"
                            checked={selectedProducts.has(product.id)}
                            onChange={() => {}}
                            className="w-5 h-5 rounded text-primary"
                          />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-medium text-gray-900">
                                {product.name}
                              </h3>
                              <p className="text-sm text-gray-500 mt-1">
                                Código: {product.code}
                              </p>
                              {product.barcode && (
                                <p className="text-sm text-gray-500">
                                  <i className="fas fa-barcode mr-1"></i>
                                  {product.barcode}
                                </p>
                              )}
                            </div>
                            
                            <div className="text-right">
                              <p className="text-lg font-bold text-green-600">
                                R$ {product.price.toFixed(2)}
                              </p>
                              <p className="text-sm text-gray-500">
                                Estoque: {product.quantity}
                              </p>
                            </div>
                          </div>
                          
                          {product.category && (
                            <span className="inline-block mt-2 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                              {product.category}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Painel de Configuração */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 sticky top-24">
              <div className="p-4 border-b border-gray-200">
                <h2 className="font-semibold text-gray-900">
                  <i className="fas fa-cog mr-2 text-primary"></i>
                  Configuração de Impressão
                </h2>
              </div>

              <div className="p-4 space-y-4">
                {/* Estatísticas */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Produtos:</span>
                      <span className="font-bold text-gray-900">{selectedProducts.size}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Por página:</span>
                      <span className="font-bold text-gray-900">{labelsPerPage}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total de páginas:</span>
                      <span className="font-bold text-primary">{totalPages}</span>
                    </div>
                  </div>
                </div>

                {/* Template */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Template de Etiqueta
                  </label>
                  <select
                    value={selectedTemplate}
                    onChange={(e) => setSelectedTemplate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                  >
                    <option value="">Selecione um template</option>
                    {templates.map(template => (
                      <option key={template.id} value={template.id}>
                        {template.config.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Presets Rápidos */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Configurações Rápidas
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {PRINT_PRESETS.map(preset => (
                      <button
                        key={preset.id}
                        onClick={() => applyPreset(preset)}
                        className="p-3 border border-gray-300 rounded-lg text-left hover:bg-blue-50 hover:border-blue-300 transition-colors"
                      >
                        <div className="text-2xl mb-1">{preset.icon}</div>
                        <div className="text-xs font-medium text-gray-900">
                          {preset.name}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Botão de Configurações Avançadas */}
                <button
                  onClick={() => setShowConfig(!showConfig)}
                  className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200"
                >
                  <i className={`fas fa-${showConfig ? 'minus' : 'plus'} mr-2`}></i>
                  {showConfig ? 'Ocultar' : 'Mostrar'} Configurações
                </button>

                {/* Configurações Expandidas */}
                {showConfig && (
                  <div className="space-y-3 pt-2 border-t border-gray-200">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Colunas
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="10"
                          value={printConfig.columns}
                          onChange={(e) => setPrintConfig({...printConfig, columns: parseInt(e.target.value)})}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-gray-900"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Linhas
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="20"
                          value={printConfig.rows}
                          onChange={(e) => setPrintConfig({...printConfig, rows: parseInt(e.target.value)})}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-gray-900"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Espaç. Horizontal (mm)
                        </label>
                        <input
                          type="number"
                          step="0.5"
                          value={printConfig.spacingHorizontal}
                          onChange={(e) => setPrintConfig({...printConfig, spacingHorizontal: parseFloat(e.target.value)})}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-gray-900"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Espaç. Vertical (mm)
                        </label>
                        <input
                          type="number"
                          step="0.5"
                          value={printConfig.spacingVertical}
                          onChange={(e) => setPrintConfig({...printConfig, spacingVertical: parseFloat(e.target.value)})}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-gray-900"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={printConfig.showBorders}
                          onChange={(e) => setPrintConfig({...printConfig, showBorders: e.target.checked})}
                          className="rounded"
                        />
                        <span className="text-sm text-gray-700">Mostrar bordas</span>
                      </label>
                      
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={printConfig.showPrice}
                          onChange={(e) => setPrintConfig({...printConfig, showPrice: e.target.checked})}
                          className="rounded"
                        />
                        <span className="text-sm text-gray-700">Mostrar preço</span>
                      </label>
                      
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={printConfig.showBarcode}
                          onChange={(e) => setPrintConfig({...printConfig, showBarcode: e.target.checked})}
                          className="rounded"
                        />
                        <span className="text-sm text-gray-700">Mostrar código de barras</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BatchPrintPage;
