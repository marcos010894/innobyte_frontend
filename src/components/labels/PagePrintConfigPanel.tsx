import React from 'react';
import type { PagePrintConfig, LabelConfig } from '@/types/label.types';
import { PAGE_SIZES } from '@/types/label.types';

interface PagePrintConfigPanelProps {
  config: PagePrintConfig | undefined;
  labelConfig: LabelConfig; // Para calcular total por folha
  onChange: (config: PagePrintConfig) => void;
}

// Configuração padrão
const getDefaultConfig = (): PagePrintConfig => ({
  pageSizeType: 'a4',
  columns: 1,
  rows: 1,
  marginTop: 10,
  marginBottom: 10,
  marginLeft: 10,
  marginRight: 10,
  spacingHorizontal: 2,
  spacingVertical: 2,
  showBorders: false,
  skipLabels: 0,
});

const PagePrintConfigPanel: React.FC<PagePrintConfigPanelProps> = ({
  config,
  labelConfig,
  onChange,
}) => {
  // Usar config padrão se não existir
  const currentConfig = config || getDefaultConfig();
  const isThermal = currentConfig.pageSizeType === 'altura-etiqueta';
  const isCustom = currentConfig.pageSizeType === 'personalizado';

  // Calcular dimensões da página baseado no tipo
  const getPageDimensions = () => {
    switch (currentConfig.pageSizeType) {
      case 'a4':
        return PAGE_SIZES.a4;
      case 'carta':
        return PAGE_SIZES.carta;
      case 'altura-etiqueta':
        return { width: currentConfig.customPageWidth || 108, height: labelConfig.height }; // Largura térmica padrão 108
      case 'personalizado':
        return {
          width: currentConfig.customPageWidth || 210,
          height: currentConfig.customPageHeight || 297,
        };
      default:
        return PAGE_SIZES.a4;
    }
  };

  // Calcular total de etiquetas por folha
  const calculateTotalPerSheet = () => {
    if (isThermal) return null; // Térmica não tem "por folha"

    const cols = currentConfig.columns;
    const rows = currentConfig.rows || 1;

    return cols * rows;
  };

  const handleUpdate = (updates: Partial<PagePrintConfig>) => {
    onChange({ ...currentConfig, ...updates });
  };

  // Calcular colunas/linhas automaticamente
  const handleAutoCalculate = () => {
    const page = getPageDimensions();
    const marginTop = currentConfig.marginTop || 0;
    const marginBottom = currentConfig.marginBottom || 0;
    const marginLeft = currentConfig.marginLeft || 0;
    const marginRight = currentConfig.marginRight || 0;
    const spacingH = currentConfig.spacingHorizontal || 0;
    const spacingV = currentConfig.spacingVertical || 0;

    // Espaço útil disponível (descontando margens)
    const usableWidth = page.width - marginLeft - marginRight;
    const usableHeight = page.height - marginTop - marginBottom;

    // Fórmula correta: (espaço_útil + espaçamento) / (tamanho_etiqueta + espaçamento)
    // Isso funciona porque:
    // - Se cabe 1 etiqueta: largura_etiqueta <= espaço_útil
    // - Se cabem 2: 2*largura + 1*espaçamento <= espaço_útil
    // - Se cabem N: N*largura + (N-1)*espaçamento <= espaço_útil
    // Resolvendo para N: N <= (espaço_útil + espaçamento) / (largura + espaçamento)

    const cols = Math.max(1, Math.floor((usableWidth + spacingH) / (labelConfig.width + spacingH)));
    const rows = isThermal ? 1 : Math.max(1, Math.floor((usableHeight + spacingV) / (labelConfig.height + spacingV)));

    console.log('🧮 Cálculo automático de grid:');
    console.log(`   Página: ${page.width} × ${page.height} mm`);
    console.log(`   Margens: T:${marginTop} B:${marginBottom} L:${marginLeft} R:${marginRight}`);
    console.log(`   Espaço útil: ${usableWidth.toFixed(1)} × ${usableHeight.toFixed(1)} mm`);
    console.log(`   Etiqueta: ${labelConfig.width} × ${labelConfig.height} mm`);
    console.log(`   Espaçamento: H:${spacingH} V:${spacingV}`);
    console.log(`   Colunas: floor((${usableWidth.toFixed(1)} + ${spacingH}) / (${labelConfig.width} + ${spacingH})) = ${cols}`);
    console.log(`   Linhas: floor((${usableHeight.toFixed(1)} + ${spacingV}) / (${labelConfig.height} + ${spacingV})) = ${rows}`);
    console.log(`   ✅ Resultado: ${cols} colunas × ${rows} linhas = ${cols * rows} etiquetas/página`);

    handleUpdate({ columns: cols, rows: rows });
  };

  const totalPerSheet = calculateTotalPerSheet();

  return (
    <div className="space-y-6">
      {/* Título */}
      <div className="border-b pb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <i className="fas fa-print text-blue-600"></i>
          Configuração de Página/Impressão
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          Define como as etiquetas serão impressas. Salvo junto com o template.
        </p>
      </div>

      {/* Tipo de Página */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          📄 Tamanho da Página
        </label>
        <div className="grid grid-cols-2 gap-3">
          {/* A4 */}
          <button
            onClick={() => handleUpdate({ pageSizeType: 'a4' })}
            className={`p-4 border-2 rounded-lg text-left transition-all ${currentConfig.pageSizeType === 'a4'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'
              }`}
          >
            <div className="font-medium text-gray-900">A4</div>
            <div className="text-xs text-gray-500">210 × 297 mm</div>
          </button>

          {/* Carta */}
          <button
            onClick={() => handleUpdate({ pageSizeType: 'carta' })}
            className={`p-4 border-2 rounded-lg text-left transition-all ${currentConfig.pageSizeType === 'carta'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'
              }`}
          >
            <div className="font-medium text-gray-900">Carta (Letter)</div>
            <div className="text-xs text-gray-500">215.9 × 279.4 mm</div>
          </button>

          {/* Altura da Etiqueta (Térmica) */}
          <button
            onClick={() => {
              const columns = currentConfig.columns || 1;
              const spacingH = currentConfig.spacingHorizontal || 0;
              // Sugerir largura baseada nas colunas (ex: 2 colunas de 30mm + 2mm spacing = 62mm)
              const suggestedWidth = Math.max(108, (labelConfig.width * columns) + (spacingH * (columns - 1)));
              
              handleUpdate({
                pageSizeType: 'altura-etiqueta',
                rows: 1,
                // Preservar colunas existentes se houver
                columns: columns,
                marginTop: 0,
                marginBottom: 0,
                spacingVertical: 0,
                spacingHorizontal: spacingH,
                customPageWidth: suggestedWidth,
              });
            }}
            className={`p-4 border-2 rounded-lg text-left transition-all ${currentConfig.pageSizeType === 'altura-etiqueta'
              ? 'border-green-500 bg-green-50'
              : 'border-gray-200 hover:border-gray-300'
              }`}
          >
            <div className="font-medium text-gray-900">Altura da Etiqueta</div>
            <div className="text-xs text-gray-500">Para impressoras térmicas</div>
          </button>

          {/* Personalizado */}
          <button
            onClick={() => handleUpdate({ pageSizeType: 'personalizado' })}
            className={`p-4 border-2 rounded-lg text-left transition-all ${currentConfig.pageSizeType === 'personalizado'
              ? 'border-purple-500 bg-purple-50'
              : 'border-gray-200 hover:border-gray-300'
              }`}
          >
            <div className="font-medium text-gray-900">Personalizado</div>
            <div className="text-xs text-gray-500">Definir manualmente</div>
          </button>
        </div>

        {/* Mensagem explicativa para térmica */}
        {isThermal && (
          <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex gap-2">
              <i className="fas fa-info-circle text-green-600 mt-0.5"></i>
              <div className="text-sm text-green-800">
                <strong>Modo Térmica:</strong> A altura da página será igual à altura da etiqueta
                ({labelConfig.height} {labelConfig.unit}). Ideal para impressoras de rolo contínuo.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Dimensões da Página (Personalizado ou Térmica) */}
      {(isCustom || isThermal) && (
        <div className={`${isThermal ? 'bg-green-50 border-green-200' : 'bg-purple-50 border-purple-200'} border rounded-lg p-4`}>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            📐 Dimensões da Página (mm)
          </label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Largura</label>
              <input
                type="number"
                value={currentConfig.customPageWidth || (isThermal ? 108 : 210)}
                onChange={(e) => handleUpdate({ customPageWidth: parseFloat(e.target.value) || (isThermal ? 108 : 210) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                min="10"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Altura</label>
              <input
                type="number"
                value={isThermal ? labelConfig.height : (currentConfig.customPageHeight || 297)}
                onChange={(e) => !isThermal && handleUpdate({ customPageHeight: parseFloat(e.target.value) || 297 })}
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 ${isThermal ? 'bg-gray-100 cursor-not-allowed text-gray-500' : ''}`}
                disabled={isThermal}
                min="10"
              />
            </div>
          </div>
        </div>
      )}

      {/* Layout (Colunas e Linhas) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-gray-700">
            📊 Layout da Grade
          </label>
          {!isThermal && (
            <button
              onClick={handleAutoCalculate}
              className="text-xs bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-1"
            >
              <i className="fas fa-magic"></i>
              Calcular Automático
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Colunas */}
          <div>
              <label className="block text-xs text-gray-600 mb-1">
                Colunas (horizontal)
              </label>
              <input
                type="number"
                value={currentConfig.columns}
                onChange={(e) => handleUpdate({ columns: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                min="1"
              />
            </div>

            {/* Linhas - só mostra se não for térmica */}
            {!isThermal && (
              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  Linhas (vertical)
                </label>
                <input
                  type="number"
                  value={currentConfig.rows || 1}
                  onChange={(e) => handleUpdate({ rows: parseInt(e.target.value) || 1 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                  min="1"
                />
              </div>
            )}
          </div>

          {/* Total por folha */}
          {totalPerSheet && totalPerSheet > 0 && (
            <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <i className="fas fa-calculator text-blue-600"></i>
                <span className="text-sm text-blue-800">
                  <strong>Total por folha:</strong> {totalPerSheet} etiquetas
                  ({currentConfig.columns} × {currentConfig.rows || 1})
                </span>
              </div>
            </div>
          )}
        </div>

      {/* Margens - sempre visíveis, incluindo térmica */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          📏 Margens (mm)
        </label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Superior</label>
            <input
              type="number"
              value={currentConfig.marginTop || 0}
              onChange={(e) => handleUpdate({ marginTop: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
              min="0"
              step="0.5"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Inferior</label>
            <input
              type="number"
              value={currentConfig.marginBottom || 0}
              onChange={(e) => handleUpdate({ marginBottom: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
              min="0"
              step="0.5"
            />
          </div>
        </div>
      </div>

      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-3">
        </label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Esquerda</label>
            <input
              type="number"
              value={currentConfig.marginLeft || 0}
              onChange={(e) => handleUpdate({ marginLeft: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
              min="0"
              step="0.5"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Direita</label>
            <input
              type="number"
              value={currentConfig.marginRight || 0}
              onChange={(e) => handleUpdate({ marginRight: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
              min="0"
              step="0.5"
            />
          </div>
        </div>
      </div>

      {/* Espaçamentos */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          ↔️ Espaçamento entre Etiquetas (mm)
        </label>
        <div className={`grid ${isThermal ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Horizontal (entre colunas)
            </label>
            <input
              type="number"
              value={currentConfig.spacingHorizontal || 0}
              onChange={(e) => handleUpdate({ spacingHorizontal: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
              min="0"
              step="0.5"
            />
          </div>
          {!isThermal && (
            <div>
              <label className="block text-xs text-gray-600 mb-1">
                Vertical (entre linhas)
              </label>
              <input
                type="number"
                value={currentConfig.spacingVertical || 0}
                onChange={(e) => handleUpdate({ spacingVertical: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                min="0"
                step="0.5"
              />
            </div>
          )}
        </div>
      </div>

      {/* Opções adicionais */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          ⚙️ Opções Adicionais
        </label>
        <div className="space-y-3">
          {/* Pular etiquetas */}
          {!isThermal && (
            <div>
              <label className="block text-xs text-gray-600 mb-1">
                Pular primeiras etiquetas (folha parcialmente usada)
              </label>
              <input
                type="number"
                value={currentConfig.skipLabels || 0}
                onChange={(e) => handleUpdate({ skipLabels: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                min="0"
                placeholder="0"
              />
            </div>
          )}

          {/* Mostrar bordas */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={currentConfig.showBorders || false}
              onChange={(e) => handleUpdate({ showBorders: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <span className="text-sm text-gray-700">
              Mostrar bordas (para teste de alinhamento)
            </span>
          </label>
        </div>
      </div>

      {/* Resumo */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-6">
        <h4 className="font-medium text-gray-800 mb-2">📋 Resumo da Configuração</h4>
        <div className="text-sm text-gray-600 space-y-1">
          <div>
            <strong>Etiqueta:</strong> {labelConfig.width} × {labelConfig.height} {labelConfig.unit}
          </div>
          <div>
            <strong>Página:</strong> {
              isThermal
                ? `Térmica (${currentConfig.customPageWidth || 108} × ${labelConfig.height} ${labelConfig.unit})`
                : currentConfig.pageSizeType === 'a4'
                  ? 'A4 (210 × 297 mm)'
                  : currentConfig.pageSizeType === 'carta'
                    ? 'Carta (215.9 × 279.4 mm)'
                    : `Personalizado (${currentConfig.customPageWidth || 210} × ${currentConfig.customPageHeight || 297} mm)`
            }
          </div>
          <div>
            <strong>Layout:</strong> {currentConfig.columns} coluna{currentConfig.columns > 1 ? 's' : ''}
            {!isThermal && ` × ${currentConfig.rows || 1} linha${(currentConfig.rows || 1) > 1 ? 's' : ''}`}
          </div>
          {totalPerSheet && (
            <div className="text-blue-700 font-medium">
              <strong>Total por folha:</strong> {totalPerSheet} etiquetas
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PagePrintConfigPanel;
