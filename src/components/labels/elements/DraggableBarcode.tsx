import React, { useEffect, useRef } from 'react';
import { Rnd } from 'react-rnd';
import JsBarcode from 'jsbarcode';
import type { BarcodeElementProps, PagePrintConfig } from '@/types/label.types';
import { replaceVariables } from '@/utils/templateVariables';

interface DraggableBarcodeProps {
  element: BarcodeElementProps;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<BarcodeElementProps>) => void;
  onDelete: () => void;
  scale: number;
  previewProduct?: any;
  isPrinting?: boolean;
  printOptions?: PagePrintConfig;
}

const DraggableBarcode: React.FC<DraggableBarcodeProps> = ({
  element,
  isSelected,
  onSelect,
  onUpdate,
  scale,
  previewProduct,
  isPrinting = false,
  printOptions,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  const barcodeValue = previewProduct
    ? replaceVariables(element.value || '1234567890', previewProduct, printOptions as any)
    : (element.value || '1234567890');

  useEffect(() => {
    if (svgRef.current) {
      try {
        JsBarcode(svgRef.current, barcodeValue, {
          format: element.format || 'CODE128',
          width: 2,
          height: 100,
          displayValue: element.displayValue !== false,
          fontSize: 16,
          margin: 0,
          background: 'transparent',
          lineColor: element.lineColor || '#000000',
        });

        // CORREÇÃO CRÍTICA: Remover larguras fixas do SVG para permitir que o CSS controle
        svgRef.current.removeAttribute('width');
        svgRef.current.removeAttribute('height');
        svgRef.current.style.width = '100%';
        svgRef.current.style.height = '100%';
      } catch (e) {
        console.error('Erro ao gerar barcode:', e);
      }
    }
  }, [barcodeValue, element.format, element.displayValue, element.fontSize, element.lineColor, element.height]);

  const handleDoubleClick = () => {
    const newValue = prompt('Digite o código de barras:', element.value);
    if (newValue !== null && newValue.trim()) {
      onUpdate({ value: newValue });
    }
  };

  const containerStyle: React.CSSProperties = {
    position: isPrinting ? 'absolute' : 'relative',
    left: isPrinting ? `${element.x}px` : 0,
    top: isPrinting ? `${element.y}px` : 0,
    width: `${element.width}px`,
    height: `${element.height}px`,
    zIndex: (element.zIndex || 1),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    boxSizing: 'border-box',
    backgroundColor: 'transparent',
    margin: 0,
    padding: 0,
  };

  const renderContent = () => (
    <div
      onDoubleClick={handleDoubleClick}
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        padding: '2px',
        boxSizing: 'border-box'
      }}
    >
      <svg
        ref={svgRef}
        preserveAspectRatio="xMidYMid meet"
        style={{
          width: '100%',
          height: '100%',
          display: 'block'
        }}
      />
    </div>
  );

  if (isPrinting) {
    return <div style={containerStyle}>{renderContent()}</div>;
  }

  return (
    <Rnd
      size={{ width: element.width, height: element.height }}
      position={{ x: element.x, y: element.y }}
      onDragStop={(_e, d) => onUpdate({ x: Math.round(d.x), y: Math.round(d.y) })}
      onResizeStop={(_e, _direction, ref, _delta, position) => {
        onUpdate({
          width: Math.round(parseFloat(ref.style.width)),
          height: Math.round(parseFloat(ref.style.height)),
          x: Math.round(position.x),
          y: Math.round(position.y),
        });
      }}
      lockAspectRatio={false}
      bounds="parent"
      scale={scale}
      disableDragging={element.locked}
      enableResizing={!element.locked && isSelected}
      minWidth={40}
      minHeight={20}
      style={{
        zIndex: isSelected ? 9999 : (element.zIndex || 1),
        outline: isSelected ? '1px solid #3B82F6' : '0.5px dashed #CBD5E1',
        backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.05)' : 'transparent',
        boxSizing: 'border-box'
      }}
      onMouseDown={(e) => { e.stopPropagation(); onSelect(); }}
    >
      {renderContent()}
    </Rnd>
  );
};

export default DraggableBarcode;
