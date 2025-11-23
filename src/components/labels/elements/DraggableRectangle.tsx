import React from 'react';
import { Rnd } from 'react-rnd';
import type { RectangleElementProps } from '@/types/label.types';

interface DraggableRectangleProps {
  element: RectangleElementProps;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<RectangleElementProps>) => void;
  onDelete: () => void;
  scale: number;
}

const DraggableRectangle: React.FC<DraggableRectangleProps> = ({
  element,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  scale,
}) => {
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
        className="w-full h-full cursor-move"
        style={{
          backgroundColor: element.fillColor || 'transparent',
          border: element.borderWidth ? `${element.borderWidth}px solid ${element.borderColor || '#000'}` : 'none',
          borderRadius: `${element.borderRadius || 0}px`,
        }}
      />

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

export default DraggableRectangle;
