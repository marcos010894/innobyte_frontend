import React from 'react';
import { Rnd } from 'react-rnd';
import { QRCodeSVG } from 'qrcode.react';
import type { QRCodeElementProps } from '@/types/label.types';

interface DraggableQRCodeProps {
  element: QRCodeElementProps;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<QRCodeElementProps>) => void;
  onDelete: () => void;
  scale: number;
}

const DraggableQRCode: React.FC<DraggableQRCodeProps> = ({
  element,
  isSelected,
  onSelect,
  onUpdate,
  scale,
}) => {
  const handleDoubleClick = () => {
    const newValue = prompt('Digite o valor do QR Code:', element.value);
    if (newValue !== null && newValue.trim()) {
      onUpdate({ value: newValue });
    }
  };

  const size = Math.min(element.width, element.height);

  return (
    <Rnd
      size={{ width: element.width, height: element.height }}
      position={{ x: element.x, y: element.y }}
      onDragStop={(_e, d) => {
        onUpdate({ x: d.x, y: d.y });
      }}
      onResizeStop={(_e, _direction, ref, _delta, position) => {
        const newWidth = parseInt(ref.style.width);
        const newHeight = parseInt(ref.style.height);
        // Manter proporção quadrada para QR Code
        const newSize = Math.min(newWidth, newHeight);
        onUpdate({
          width: newSize,
          height: newSize,
          ...position,
        });
      }}
      lockAspectRatio={true}
      bounds="parent"
      scale={scale}
      disableDragging={element.locked}
      enableResizing={!element.locked}
      style={{
        outline: isSelected ? '1px solid #3B82F6' : 'none',
        outlineOffset: '0px',
        zIndex: element.zIndex || 1,
        pointerEvents: 'auto',
      }}
      onMouseDown={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      <div
        className="w-full h-full cursor-move flex items-center justify-center bg-white"
        onDoubleClick={handleDoubleClick}
      >
        <QRCodeSVG
          value={element.value || 'https://innobyte.com'}
          size={size - 8}
          bgColor={element.bgColor || '#FFFFFF'}
          fgColor={element.fgColor || '#000000'}
          level={element.errorCorrectionLevel || 'M'}
          includeMargin={false}
        />
      </div>
    </Rnd>
  );
};

export default DraggableQRCode;
