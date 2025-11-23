import React, { useRef, useEffect } from 'react';
import { Rnd } from 'react-rnd';
import type { TextElementProps } from '@/types/label.types';

interface DraggableTextProps {
  element: TextElementProps;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<TextElementProps>) => void;
  onDelete: () => void;
  scale: number;
}

const DraggableText: React.FC<DraggableTextProps> = ({
  element,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  scale,
}) => {
  const textRef = useRef<HTMLDivElement>(null);

  // Auto ajustar altura baseado no conteúdo
  useEffect(() => {
    if (textRef.current) {
      const contentHeight = textRef.current.scrollHeight;
      if (Math.abs(contentHeight - element.height) > 5) {
        onUpdate({ height: contentHeight });
      }
    }
  }, [element.content, element.fontSize, element.width]);

  const handleDoubleClick = () => {
    const newContent = prompt('Digite o texto:', element.content);
    if (newContent !== null) {
      onUpdate({ content: newContent });
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
        ref={textRef}
        className="w-full h-full cursor-move overflow-hidden"
        onDoubleClick={handleDoubleClick}
        style={{
          fontSize: `${element.fontSize}px`,
          fontFamily: element.fontFamily,
          fontWeight: element.fontWeight,
          color: element.color,
          textAlign: element.textAlign,
          fontStyle: element.italic ? 'italic' : 'normal',
          textDecoration: element.underline ? 'underline' : 'none',
          lineHeight: element.lineHeight || 1.2,
          padding: '4px',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}
      >
        {element.content || 'Texto'}
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

export default DraggableText;
