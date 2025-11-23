import React, { useState } from 'react';
import type { LabelConfig } from '@/types/label.types';

interface AdvancedConfigModalProps {
  config: LabelConfig;
  onUpdate: (updates: Partial<LabelConfig>) => void;
  onClose: () => void;
}

const AdvancedConfigModal: React.FC<AdvancedConfigModalProps> = ({
  config,
  onUpdate,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'dimensions' | 'layout'>('dimensions');

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden mx-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-blue-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Configurações Avançadas</h2>
              <p className="text-blue-100 text-sm mt-1">
                Configure todos os detalhes da sua etiqueta
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
            >
              <i className="fas fa-times text-xl"></i>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 bg-gray-50">
          <div className="flex overflow-x-auto">
            <button
              onClick={() => setActiveTab('dimensions')}
              className={`px-6 py-3 font-medium text-sm whitespace-nowrap transition-colors ${
                activeTab === 'dimensions'
                  ? 'border-b-2 border-primary text-primary bg-white'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <i className="fas fa-ruler-combined mr-2"></i>
              Dimensões
            </button>
            <button
              onClick={() => setActiveTab('layout')}
              className={`px-6 py-3 font-medium text-sm whitespace-nowrap transition-colors ${
                activeTab === 'layout'
                  ? 'border-b-2 border-primary text-primary bg-white'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <i className="fas fa-th mr-2"></i>
              Layout e Margens
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Tab: Dimensões */}
          {activeTab === 'dimensions' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Largura da Etiqueta ({config.unit})
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={config.width}
                    onChange={(e) => onUpdate({ width: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                  />
                  <p className="text-xs text-gray-500 mt-1">Largura individual de cada etiqueta</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Altura da Etiqueta ({config.unit})
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={config.height}
                    onChange={(e) => onUpdate({ height: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                  />
                  <p className="text-xs text-gray-500 mt-1">Altura individual de cada etiqueta</p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
                  <i className="fas fa-info-circle mr-2"></i>
                  Dimensões Comuns
                </h4>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <button
                    onClick={() => onUpdate({ width: 5, height: 3, unit: 'cm' })}
                    className="px-3 py-2 bg-white rounded text-gray-700 hover:bg-blue-100"
                  >
                    5×3 cm
                  </button>
                  <button
                    onClick={() => onUpdate({ width: 2.7, height: 1.5, unit: 'cm' })}
                    className="px-3 py-2 bg-white rounded text-gray-700 hover:bg-blue-100"
                  >
                    2.7×1.5 cm
                  </button>
                  <button
                    onClick={() => onUpdate({ width: 10, height: 5, unit: 'cm' })}
                    className="px-3 py-2 bg-white rounded text-gray-700 hover:bg-blue-100"
                  >
                    10×5 cm (Rabicho)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unidade de Medida
                </label>
                <select
                  value={config.unit}
                  onChange={(e) => onUpdate({ unit: e.target.value as LabelConfig['unit'] })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                >
                  <option value="mm">Milímetros (mm)</option>
                  <option value="cm">Centímetros (cm)</option>
                  <option value="in">Polegadas (in)</option>
                  <option value="px">Pixels (px)</option>
                </select>
              </div>
            </div>
          )}

          {/* Tab: Layout e Margens */}
          {activeTab === 'layout' && (
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-gray-800 mb-4">Margens da Página</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Margem Superior ({config.unit})
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={config.marginTop || 0}
                      onChange={(e) => onUpdate({ marginTop: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Margem Inferior ({config.unit})
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={config.marginBottom || 0}
                      onChange={(e) => onUpdate({ marginBottom: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Margem Esquerda ({config.unit})
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={config.marginLeft || 0}
                      onChange={(e) => onUpdate({ marginLeft: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                    />
                    <p className="text-xs text-gray-500 mt-1">Ex: 10mm para ajuste fino</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Margem Direita ({config.unit})
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={config.marginRight || 0}
                      onChange={(e) => onUpdate({ marginRight: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-800 mb-4">Espaçamentos</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Espaçamento Horizontal ({config.unit})
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={config.spacingHorizontal || 0}
                      onChange={(e) => onUpdate({ spacingHorizontal: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                    />
                    <p className="text-xs text-gray-500 mt-1">Espaço entre colunas</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Espaçamento Vertical ({config.unit})
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={config.spacingVertical || 0}
                      onChange={(e) => onUpdate({ spacingVertical: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                    />
                    <p className="text-xs text-gray-500 mt-1">Espaço entre linhas</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <input
                  type="checkbox"
                  id="showCenterLine"
                  checked={config.showCenterLine || false}
                  onChange={(e) => onUpdate({ showCenterLine: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="showCenterLine" className="text-sm text-gray-700">
                  <i className="fas fa-arrows-alt mr-2 text-blue-600"></i>
                  Mostrar linha central (etiquetas dobráveis)
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t bg-gray-50 px-6 py-4 flex justify-between items-center">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Fechar
          </button>
          <div className="flex gap-3">
            <button
              onClick={() => {
                // Reset to defaults
                onUpdate({
                  columns: 1,
                  rows: 1,
                  marginTop: 0,
                  marginBottom: 0,
                  marginLeft: 0,
                  marginRight: 0,
                  spacingHorizontal: 0,
                  spacingVertical: 0,
                  showBorders: false,
                  showPrice: true,
                  showBarcode: true,
                  showLogo: false,
                  skipLabels: 0,
                });
              }}
              className="px-6 py-2 text-primary hover:bg-blue-50 rounded-lg transition-colors"
            >
              <i className="fas fa-undo mr-2"></i>
              Restaurar Padrão
            </button>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <i className="fas fa-check mr-2"></i>
              Aplicar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedConfigModal;
