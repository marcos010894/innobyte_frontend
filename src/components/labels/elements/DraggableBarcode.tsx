import React from 'react';
import { Rnd } from 'react-rnd';
import Barcode from 'react-barcode';
import type { BarcodeElementProps } from '@/types/label.types';

interface DraggableBarcodeProps {
  element: BarcodeElementProps;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<BarcodeElementProps>) => void;
  onDelete: () => void;
  scale: number;
}

const DraggableBarcode: React.FC<DraggableBarcodeProps> = ({
  element,
  isSelected,
  onSelect,
  onUpdate,
  scale,
}) => {
  const handleDoubleClick = () => {
    const newValue = prompt('Digite o código de barras:', element.value);
    if (newValue !== null && newValue.trim()) {
      onUpdate({ value: newValue });
    }
  };

  // Calcular largura da barra baseado no tamanho do elemento
  // Quanto menor o elemento, menor a largura da barra
  const calculateBarWidth = () => {
    if (element.width < 80) return 1;
    if (element.width < 120) return 1.5;
    if (element.width < 160) return 2;
    if (element.width < 200) return 2.5;
    return 3;
  };

  // Calcular tamanho da fonte baseado na altura
  const calculateFontSize = () => {
    if (element.height < 40) return 8;
    if (element.height < 60) return 10;
    return element.fontSize || 12;
  };

  return (
    <Rnd
      size={{ width: element.width, height: element.height }}
      position={{ x: element.x, y: element.y }}
      onDragStop={(_e, d) => {
        onUpdate({ x: d.x, y: d.y });
      }}
      onResizeStop={(_e, _direction, ref, _delta, position) => {
        onUpdate({
          width: parseInt(ref.style.width),
          height: parseInt(ref.style.height),
          ...position,
        });
      }}
      lockAspectRatio={false}
      bounds="parent"
      scale={scale}
      disableDragging={element.locked}
      enableResizing={!element.locked}
      minWidth={60}
      minHeight={30}
      style={{
        outline: 'none',
        outlineOffset: '0px',
        zIndex: element.zIndex || 1,
        border: isSelected ? '2px solid #3B82F6' : 'none',
        padding: 0,
        margin: 0,
        lineHeight: 0,
        overflow: 'visible',
        boxSizing: 'border-box',
        pointerEvents: 'auto',
      }}
      onMouseDown={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      <div
        className="cursor-move"
        style={{
          backgroundColor: 'transparent',
          padding: 0,
          margin: 0,
          width: '100%',
          height: '100%',
          lineHeight: 0,
          overflow: 'visible',
          boxSizing: 'border-box',
        }}
        onDoubleClick={handleDoubleClick}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            margin: 0,
            padding: 0,
            boxSizing: 'border-box',
            overflow: 'hidden',
          }}
        >
          <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <div style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Barcode
                value={element.value || '1234567890'}
                format={element.format}
                width={calculateBarWidth()}
                height={element.height}
                displayValue={element.displayValue !== false}
                fontSize={calculateFontSize()}
                lineColor={element.lineColor || '#000000'}
                background={element.background || 'transparent'}
                margin={0}
                marginTop={0}
                marginBottom={0}
                marginLeft={0}
                marginRight={0}
              />
            </div>
          </div>
          <style>{`
            /* Força o SVG do código de barras a preencher 100% do container */
            .cursor-move svg {
              width: 100% !important;
              height: 100% !important;
              max-width: 100% !important;
              max-height: 100% !important;
            }
          `}</style>
        </div>
      </div>
    </Rnd>
  );
};

export default DraggableBarcode;
