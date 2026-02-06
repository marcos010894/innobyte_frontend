import React, { useRef } from 'react';
import type { LabelConfig, LabelElement, PagePrintConfig } from '@/types/label.types';
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
  previewProduct?: any;
  isPrinting?: boolean;
  pagePrintConfig?: PagePrintConfig;
}

const LabelCanvas: React.FC<LabelCanvasProps> = ({
  config,
  elements,
  selectedElementId,
  onSelectElement,
  onUpdateElement,
  onDeleteElement,
  zoom,
  previewProduct,
  isPrinting = false,
  pagePrintConfig,
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const gridSize = config.gridSize || 10;

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

  const canvasWidthPx = Math.ceil(getPixelsFromUnit(config.width, config.unit));
  const canvasHeightPx = Math.ceil(getPixelsFromUnit(config.height, config.unit));

  // Calcular margens em pixels (baseado nas configurações da etiqueta)
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
      previewProduct,
      isPrinting,
      printOptions: pagePrintConfig,
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

  if (isPrinting) {
    return (
      <div
        id="label-capture-target"
        style={{
          width: `${canvasWidthPx}px`,
          height: `${canvasHeightPx}px`,
          backgroundColor: config.backgroundColor,
          position: 'relative',
          margin: 0,
          padding: 0,
          boxSizing: 'border-box',
          overflow: 'hidden',
        }}
      >
        {elements.map(renderElement)}
      </div>
    );
  }

  return (
    <div
      className="flex-1 overflow-auto bg-gray-100 p-8 flex items-center justify-center min-h-[500px] relative select-none"
      onClick={handleCanvasClick}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div
        ref={canvasRef}
        className="bg-white shadow-2xl relative"
        style={{
          width: `${canvasWidthPx}px`,
          height: `${canvasHeightPx}px`,
          backgroundColor: config.backgroundColor,
          transform: `scale(${zoom})`,
          transformOrigin: 'center center',
          boxSizing: 'border-box', // Restaurar para evitar colapso/desvio
          fontKerning: 'none',
          textRendering: 'geometricPrecision',
          letterSpacing: '0px',
          backgroundImage: config.showGrid
            ? `
                repeating-linear-gradient(0deg, transparent, transparent ${gridSize}px, rgba(0, 0, 0, 0.05) ${gridSize}px, rgba(0, 0, 0, 0.05) ${gridSize + 1}px),
                repeating-linear-gradient(90deg, transparent, transparent ${gridSize}px, rgba(0, 0, 0, 0.05) ${gridSize}px, rgba(0, 0, 0, 0.05) ${gridSize + 1}px)
              `
            : 'none',
          backgroundSize: `${gridSize + 1}px ${gridSize + 1}px`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Renderizar Margens Visuais */}
        {config.showMargins && (
          <div
            className="absolute border border-red-300 pointer-events-none z-0"
            style={{
              top: `${marginTopPx}px`,
              left: `${marginLeftPx}px`,
              right: `${marginRightPx}px`,
              bottom: `${marginBottomPx}px`,
              borderStyle: 'dashed',
            }}
          />
        )}

        {/* Linha Central (para etiquetas dobráveis) */}
        {config.showCenterLine && (
          <>
            <div
              className="absolute top-1/2 left-0 right-0 border-t border-blue-400 pointer-events-none z-0"
              style={{ borderStyle: 'dashed' }}
            />
            <div
              className="absolute left-1/2 top-0 bottom-0 border-l border-blue-400 pointer-events-none z-0"
              style={{ borderStyle: 'dashed' }}
            />
          </>
        )}

        {/* Bordas de Teste */}
        {config.showBorders && (
          <div className="absolute inset-0 border border-black pointer-events-none z-50" />
        )}

        {/* Elementos */}
        {elements.map(renderElement)}
      </div>
    </div>
  );
};

export default LabelCanvas;
