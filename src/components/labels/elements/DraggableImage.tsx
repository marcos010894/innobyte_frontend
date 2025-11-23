import React from 'react';
import { Rnd } from 'react-rnd';
import type { ImageElementProps } from '@/types/label.types';

interface DraggableImageProps {
  element: ImageElementProps;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<ImageElementProps>) => void;
  onDelete: () => void;
  scale: number;
}

const DraggableImage: React.FC<DraggableImageProps> = ({
  element,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  scale,
}) => {
  const handleDoubleClick = () => {
    const newSrc = prompt('Cole a URL da imagem:', element.src);
    if (newSrc !== null && newSrc.trim()) {
      onUpdate({ src: newSrc });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdate({ src: reader.result as string });
      };
      reader.readAsDataURL(file);
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
        className="w-full h-full cursor-move relative overflow-hidden bg-gray-100"
        onDoubleClick={handleDoubleClick}
      >
        {element.src ? (
          <img
            src={element.src}
            alt="Label element"
            className="w-full h-full"
            style={{
              objectFit: element.objectFit || 'contain',
              opacity: element.opacity || 1,
            }}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
            <i className="fas fa-image text-3xl mb-2"></i>
            <p className="text-xs">Sem imagem</p>
            <p className="text-xs">Clique 2x para adicionar</p>
          </div>
        )}
        
        {/* Input de arquivo escondido */}
        {isSelected && !element.locked && (
          <label className="absolute bottom-1 right-1 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-blue-600 shadow-md cursor-pointer">
            <i className="fas fa-upload text-xs"></i>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        )}
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

export default DraggableImage;
