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
  isPrinting?: boolean;
}

const DraggableRectangle: React.FC<DraggableRectangleProps> = ({
  element,
  isSelected,
  onSelect,
  onUpdate,
  scale,
  isPrinting = false,
}) => {
  if (isPrinting) {
    return (
      <div
        style={{
          position: 'absolute',
          left: `${element.x}px`,
          top: `${element.y}px`,
          width: `${element.width}px`,
          height: `${element.height}px`,
          zIndex: (element.zIndex || 1),
          backgroundColor: element.fillColor || 'transparent',
          border: element.borderWidth ? `${element.borderWidth}px solid ${element.borderColor || '#000'}` : 'none',
          borderRadius: `${element.borderRadius || 0}px`,
        }}
      />
    );
  }

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
      enableResizing={!element.locked && isSelected}
      style={{
        outline: isSelected ? '1px solid #3B82F6' : 'none',
        outlineOffset: '0px',
        zIndex: isSelected ? 9999 : (element.zIndex || 1),
        pointerEvents: 'auto',
      }}
      onMouseDown={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      <div
        className="w-full h-full cursor-move"
        style={{
          backgroundColor: element.fillColor || 'transparent',
          border: element.borderWidth ? `${element.borderWidth}px solid ${element.borderColor || '#000'}` : 'none',
          borderRadius: `${element.borderRadius || 0}px`,
        }}
      />
    </Rnd>
  );
};

export default DraggableRectangle;
