import React from 'react';
import { Rnd } from 'react-rnd';
import { QRCodeSVG } from 'qrcode.react';
import type { QRCodeElementProps, PagePrintConfig } from '@/types/label.types';
import { replaceVariables } from '@/utils/templateVariables';

interface DraggableQRCodeProps {
  element: QRCodeElementProps;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<QRCodeElementProps>) => void;
  onDelete: () => void;
  scale: number;
  previewProduct?: any;
  isPrinting?: boolean;
  printOptions?: PagePrintConfig;
}

const DraggableQRCode: React.FC<DraggableQRCodeProps> = ({
  element,
  isSelected,
  onSelect,
  onUpdate,
  scale,
  previewProduct,
  isPrinting = false,
  printOptions,
}) => {
  const handleDoubleClick = () => {
    const newValue = prompt('Digite o valor do QR Code:', element.value);
    if (newValue !== null && newValue.trim()) {
      onUpdate({ value: newValue });
    }
  };

  // O QR Code deve ser sempre quadrado e caber no container
  const size = Math.min(element.width, element.height);
  const qrPadding = 4; // Respiro interno para evitar encostar nas bordas/seleção
  const qrSize = Math.max(size - (qrPadding * 2), 10);

  const qrValue = previewProduct
    ? replaceVariables(element.value || 'https://innobyte.com', previewProduct, printOptions as any)
    : (element.value || 'https://innobyte.com');

  const containerStyle: React.CSSProperties = {
    position: isPrinting ? 'absolute' : 'relative',
    left: isPrinting ? `${element.x}px` : 0,
    top: isPrinting ? `${element.y}px` : 0,
    width: `${element.width}px`,
    height: `${element.height}px`,
    zIndex: (element.zIndex || 1),
    backgroundColor: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    boxSizing: 'border-box',
  };

  if (isPrinting) {
    return (
      <div style={containerStyle}>
        <div style={{ padding: `${qrPadding}px`, boxSizing: 'border-box', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <QRCodeSVG
            value={qrValue}
            size={qrSize}
            bgColor={element.bgColor || '#FFFFFF'}
            fgColor={element.fgColor || '#000000'}
            level={element.errorCorrectionLevel || 'M'}
            includeMargin={false}
          />
        </div>
      </div>
    );
  }

  return (
    <Rnd
      size={{ width: element.width, height: element.height }}
      position={{ x: element.x, y: element.y }}
      onDragStop={(_e, d) => {
        onUpdate({ x: Math.round(d.x), y: Math.round(d.y) });
      }}
      onResizeStop={(_e, _direction, ref, _delta, position) => {
        const newWidth = parseInt(ref.style.width);
        const newHeight = parseInt(ref.style.height);
        // Garantir que o container seja quadrado se redimensionado
        const newSize = Math.round(Math.min(newWidth, newHeight));
        onUpdate({
          width: newSize,
          height: newSize,
          x: Math.round(position.x),
          y: Math.round(position.y),
        });
      }}
      lockAspectRatio={true}
      bounds="parent"
      scale={scale}
      disableDragging={element.locked}
      enableResizing={!element.locked && isSelected}
      style={{
        zIndex: isSelected ? 9999 : (element.zIndex || 1),
        outline: isSelected ? '1px solid #3B82F6' : '0.5px dashed #CBD5E1',
        outlineOffset: '0px',
        backgroundColor: '#FFFFFF',
      }}
      onMouseDown={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      <div
        className="w-full h-full cursor-move flex items-center justify-center"
        onDoubleClick={handleDoubleClick}
        style={{ padding: `${qrPadding}px`, boxSizing: 'border-box' }}
      >
        <QRCodeSVG
          value={qrValue}
          size={qrSize}
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
