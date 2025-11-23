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
  onDelete,
  scale,
}) => {
  const handleDoubleClick = () => {
    const newValue = prompt('Digite o código de barras:', element.value);
    if (newValue !== null && newValue.trim()) {
      onUpdate({ value: newValue });
    }
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
      style={{
        border: isSelected ? '2px solid #3B82F6' : '1px dashed transparent',
        zIndex: element.zIndex || 1,
      }}
      onMouseDown={onSelect}
    >
      <div
        className="w-full h-full cursor-move flex items-center justify-center overflow-hidden bg-white"
        onDoubleClick={handleDoubleClick}
      >
        <Barcode
          value={element.value || '1234567890'}
          format={element.format}
          width={element.width > 150 ? 2 : 1}
          height={element.height - (element.displayValue !== false ? 30 : 10)}
          displayValue={element.displayValue !== false}
          fontSize={element.fontSize || 12}
          lineColor={element.lineColor || '#000000'}
          background={element.background || 'transparent'}
          margin={0}
        />
      </div>

      {/* Botão de deletar quando selecionado */}
      {isSelected && !element.locked && (
        <button
          onClick={onDelete}
          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 shadow-md z-10"
          style={{ fontSize: '12px' }}
        >
          ×
        </button>
      )}
    </Rnd>
  );
};

export default DraggableBarcode;
