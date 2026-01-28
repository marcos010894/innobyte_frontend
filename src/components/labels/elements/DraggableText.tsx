import React, { useRef, useEffect, useState } from 'react';
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
  scale,
}) => {
  const textRef = useRef<HTMLDivElement>(null);
  const [isCtrlPressed, setIsCtrlPressed] = useState(false);

  // Auto ajustar altura baseado no conteúdo
  useEffect(() => {
    if (textRef.current) {
      const contentHeight = textRef.current.scrollHeight;
      if (Math.abs(contentHeight - element.height) > 5) {
        onUpdate({ height: contentHeight });
      }
    }
  }, [element.content, element.fontSize, element.width]);

  // Detectar Ctrl key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey) setIsCtrlPressed(true);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (!e.ctrlKey) setIsCtrlPressed(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

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
      disableDragging={element.locked || !isCtrlPressed}
      enableResizing={!element.locked}
      style={{
        outline: isSelected ? '2px solid #3B82F6' : '1px dashed #CBD5E1',
        outlineOffset: '0px',
        zIndex: element.zIndex || 1,
        cursor: isCtrlPressed ? 'move' : 'pointer',
        backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.05)' : 'transparent',
        transition: 'all 0.15s ease',
      }}
      onMouseDown={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      <div
        ref={textRef}
        className="w-full h-full"
        onDoubleClick={handleDoubleClick}
        style={{
          fontSize: `${element.fontSize}px`,
          fontFamily: element.fontFamily,
          fontWeight: element.fontWeight,
          color: element.color,
          textAlign: element.textAlign,
          fontStyle: element.italic ? 'italic' : 'normal',
          textDecoration: element.underline ? 'underline' : 'none',
          lineHeight: element.lineHeight || 1.3,
          padding: '4px',
          whiteSpace: element.noWrap ? 'nowrap' : 'pre-wrap',
          wordBreak: 'break-word',
          overflow: element.noWrap ? 'hidden' : 'visible',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: element.textAlign === 'center' ? 'center' : 'flex-start',
          minHeight: '100%',
          minWidth: '100%',
          boxSizing: 'border-box',
        }}
      >
        {element.content || 'Texto'}
      </div>

      {/* Dica visual quando selecionado */}
      {isSelected && !isCtrlPressed && (
        <div
          style={{
            position: 'absolute',
            bottom: '-22px',
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: '10px',
            color: '#3B82F6',
            backgroundColor: 'white',
            padding: '2px 8px',
            borderRadius: '4px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            zIndex: 1000,
          }}
        >
          Ctrl + arrastar para mover
        </div>
      )}
    </Rnd>
  );
};

export default DraggableText;
