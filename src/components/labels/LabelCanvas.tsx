import React, { useRef } from 'react';
import type { LabelElement, LabelConfig } from '@/types/label.types';
import DraggableText from './elements/DraggableText';
import DraggableQRCode from './elements/DraggableQRCode';
import DraggableBarcode from './elements/DraggableBarcode';
import DraggableImage from './elements/DraggableImage';
import DraggableRectangle from './elements/DraggableRectangle';

interface LabelCanvasProps {
  config: LabelConfig;
  elements: LabelElement[];
  selectedElementId: string | null;
  onSelectElement: (id: string | null) => void;
  onUpdateElement: (id: string, updates: Partial<LabelElement>) => void;
  onDeleteElement: (id: string) => void;
  zoom: number;
}

const LabelCanvas: React.FC<LabelCanvasProps> = ({
  config,
  elements,
  selectedElementId,
  onSelectElement,
  onUpdateElement,
  onDeleteElement,
  zoom,
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);

  // Converter unidades para pixels (aproximação)
  const getPixelsFromUnit = (value: number, unit: string) => {
    const conversionRates = {
      mm: 3.7795275591, // 1mm = ~3.78px (96 DPI)
      cm: 37.795275591,
      in: 96,
      px: 1,
    };
    return value * (conversionRates[unit as keyof typeof conversionRates] || 1);
  };

  const canvasWidthPx = getPixelsFromUnit(config.width, config.unit);
  const canvasHeightPx = getPixelsFromUnit(config.height, config.unit);

  // Calcular margens em pixels
  const marginTopPx = getPixelsFromUnit(config.marginTop || 0, config.unit);
  const marginLeftPx = getPixelsFromUnit(config.marginLeft || 0, config.unit);
  const marginRightPx = getPixelsFromUnit(config.marginRight || 0, config.unit);
  const marginBottomPx = getPixelsFromUnit(config.marginBottom || 0, config.unit);

  const handleCanvasClick = (e: React.MouseEvent) => {
    // Desselecionar se clicar no fundo
    if (e.target === e.currentTarget) {
      onSelectElement(null);
    }
  };

  const renderElement = (element: LabelElement) => {
    const isSelected = element.id === selectedElementId;
    const commonProps = {
      key: element.id,
      isSelected,
      onSelect: () => onSelectElement(element.id),
      onUpdate: (updates: Partial<LabelElement>) => onUpdateElement(element.id, updates),
      onDelete: () => onDeleteElement(element.id),
      scale: zoom,
    };

    switch (element.type) {
      case 'text':
        return <DraggableText element={element} {...commonProps} />;
      case 'qrcode':
        return <DraggableQRCode element={element} {...commonProps} />;
      case 'barcode':
        return <DraggableBarcode element={element} {...commonProps} />;
      case 'image':
        return <DraggableImage element={element} {...commonProps} />;
      case 'rectangle':
        return <DraggableRectangle element={element} {...commonProps} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 overflow-auto bg-gradient-to-br from-gray-50 to-gray-100 p-16 flex flex-col">
      <div className="flex-1 flex items-center justify-center" style={{ minHeight: 'calc(100vh - 250px)' }}>
        <div
          ref={canvasRef}
          className="relative shadow-2xl ring-1 ring-gray-300"
          style={{
            width: `${canvasWidthPx}px`,
            height: `${canvasHeightPx}px`,
            backgroundColor: config.backgroundColor,
            transform: `scale(${zoom})`,
            transformOrigin: 'center center',
            backgroundImage: config.showGrid
              ? `
                  repeating-linear-gradient(
                    0deg,
                    rgba(0, 0, 0, 0.05),
                    rgba(0, 0, 0, 0.05) 1px,
                    transparent 1px,
                    transparent ${config.gridSize || 10}px
                  ),
                  repeating-linear-gradient(
                    90deg,
                    rgba(0, 0, 0, 0.05),
                    rgba(0, 0, 0, 0.05) 1px,
                    transparent 1px,
                    transparent ${config.gridSize || 10}px
                  )
                `
              : 'none',
          }}
          onClick={handleCanvasClick}
        >
          {/* Margens visuais com cores (só quando ativado showMargins) */}
          {config.showMargins && marginTopPx > 0 && (
            <div
              className="absolute top-0 left-0 right-0 bg-red-50 border-b border-dashed border-red-300 opacity-60 pointer-events-none"
              style={{ height: `${marginTopPx}px` }}
              title={`Margem Superior: ${config.marginTop || 0}${config.unit}`}
            >
              <span className="absolute top-0.5 left-2 text-[10px] font-medium text-red-500">
                ↓ {config.marginTop}{config.unit}
              </span>
            </div>
          )}
          
          {config.showMargins && marginLeftPx > 0 && (
            <div
              className="absolute top-0 left-0 bottom-0 bg-red-50 border-r border-dashed border-red-300 opacity-60 pointer-events-none"
              style={{ width: `${marginLeftPx}px` }}
              title={`Margem Esquerda: ${config.marginLeft || 0}${config.unit}`}
            >
              <span className="absolute top-1/2 left-0.5 text-[10px] font-medium text-red-500 transform -rotate-90 origin-left whitespace-nowrap">
                → {config.marginLeft}{config.unit}
              </span>
            </div>
          )}
          
          {config.showMargins && marginRightPx > 0 && (
            <div
              className="absolute top-0 right-0 bottom-0 bg-red-50 border-l border-dashed border-red-300 opacity-60 pointer-events-none"
              style={{ width: `${marginRightPx}px` }}
              title={`Margem Direita: ${config.marginRight || 0}${config.unit}`}
            >
              <span className="absolute top-1/2 right-0.5 text-[10px] font-medium text-red-500 transform rotate-90 origin-right whitespace-nowrap">
                ← {config.marginRight}{config.unit}
              </span>
            </div>
          )}
          
          {config.showMargins && marginBottomPx > 0 && (
            <div
              className="absolute bottom-0 left-0 right-0 bg-red-50 border-t border-dashed border-red-300 opacity-60 pointer-events-none"
              style={{ height: `${marginBottomPx}px` }}
              title={`Margem Inferior: ${config.marginBottom || 0}${config.unit}`}
            >
              <span className="absolute bottom-0.5 left-2 text-[10px] font-medium text-red-500">
                ↑ {config.marginBottom}{config.unit}
              </span>
            </div>
          )}

          {/* Linha central (para etiquetas dobráveis) */}
          {config.showCenterLine && (
            <>
              <div
                className="absolute top-0 bottom-0 border-l border-dashed border-blue-400 opacity-60 pointer-events-none z-10"
                style={{ left: '50%' }}
                title="Centro Vertical"
              >
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded font-medium whitespace-nowrap shadow-sm">
                  <i className="fas fa-arrows-alt-h mr-1 text-[8px]"></i>
                  Centro
                </div>
              </div>
              
              {/* Linha central horizontal */}
              <div
                className="absolute left-0 right-0 border-t border-dashed border-blue-400 opacity-60 pointer-events-none z-10"
                style={{ top: '50%' }}
                title="Centro Horizontal"
              />
            </>
          )}

          {/* Bordas de teste (quando ativadas) */}
          {config.showBorders && (
            <div 
              className="absolute inset-0 border-2 border-black pointer-events-none z-20"
              title="Bordas de corte"
            >
              <div className="absolute -top-5 right-0 bg-black text-white text-[10px] px-1.5 py-0.5 rounded font-medium shadow-sm">
                Bordas de corte
              </div>
            </div>
          )}

          {/* Área útil com margens (destacada) */}
          {(marginTopPx > 0 || marginLeftPx > 0 || marginRightPx > 0 || marginBottomPx > 0) && config.showMargins && (
            <div
              style={{
                position: 'absolute',
                top: `${marginTopPx}px`,
                left: `${marginLeftPx}px`,
                right: `${marginRightPx}px`,
                bottom: `${marginBottomPx}px`,
                border: '2px solid rgba(34, 197, 94, 0.5)',
                pointerEvents: 'none',
                zIndex: 5,
                backgroundColor: 'rgba(34, 197, 94, 0.05)',
              }}
            >
              <div className="absolute top-1 left-1 text-xs font-semibold text-green-600 bg-white px-1 rounded">
                Área de impressão
              </div>
            </div>
          )}

          {/* Renderizar todos os elementos */}
          {elements.map(renderElement)}
        </div>
      </div>

      {/* Barra de Informações Inferior - FIXA */}
      <div className="mt-6 bg-white border-t-4 border-primary shadow-lg rounded-lg">
        <div className="px-6 py-4">
          <div className="flex items-center justify-center gap-8">
            {/* Largura */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-primary to-blue-600 rounded-lg flex items-center justify-center">
                <i className="fas fa-arrows-alt-h text-white"></i>
              </div>
              <div>
                <div className="text-xs text-gray-500 font-medium">Largura</div>
                <div className="text-lg font-bold text-gray-800">{config.width} {config.unit}</div>
              </div>
            </div>

            {/* Divisor */}
            <div className="h-12 w-px bg-gray-300"></div>

            {/* Altura */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <i className="fas fa-arrows-alt-v text-white"></i>
              </div>
              <div>
                <div className="text-xs text-gray-500 font-medium">Altura</div>
                <div className="text-lg font-bold text-gray-800">{config.height} {config.unit}</div>
              </div>
            </div>

            {/* Divisor */}
            <div className="h-12 w-px bg-gray-300"></div>

            {/* Dimensões Completas */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                <i className="fas fa-ruler-combined text-white"></i>
              </div>
              <div>
                <div className="text-xs text-gray-500 font-medium">Dimensões</div>
                <div className="text-lg font-bold text-gray-800">
                  {config.width} × {config.height} {config.unit}
                </div>
              </div>
            </div>

            {/* Layout de Impressão (se configurado) */}
            {config.columns && config.rows && (config.columns > 1 || config.rows > 1) && (
              <>
                <div className="h-12 w-px bg-gray-300"></div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg flex items-center justify-center">
                    <i className="fas fa-th text-white"></i>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 font-medium">Layout A4</div>
                    <div className="text-lg font-bold text-gray-800">
                      {config.columns}×{config.rows} = {config.columns * config.rows} etiquetas
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LabelCanvas;
