import React, { useRef, useEffect, useState } from 'react';
import { Rnd } from 'react-rnd';
import { replaceVariables } from '@/utils/templateVariables';
import type { TextElementProps, PagePrintConfig } from '@/types/label.types';

interface DraggableTextProps {
  element: TextElementProps;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<TextElementProps>) => void;
  onDelete: () => void;
  scale: number;
  previewProduct?: any;
  isPrinting?: boolean;
  printOptions?: PagePrintConfig;
}

const DraggableText: React.FC<DraggableTextProps> = ({
  element,
  isSelected,
  onSelect,
  onUpdate,
  scale,
  previewProduct,
  isPrinting = false,
  printOptions,
}) => {
  const [isCtrlPressed, setIsCtrlPressed] = useState(false);
  const [lastMeasureKey, setLastMeasureKey] = useState("");

  const measureTextHeight = (text: string, width: number, fontSize: number, fontWeight: string | number, fontFamily: string, lineHeight: number) => {
    const minSafeHeight = Math.ceil(fontSize * lineHeight);
    if (!text || width <= 1) return minSafeHeight + 2;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return minSafeHeight + 2;

    ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;

    const words = text.split(' ');
    let linesCount = 0;
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine + word + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > width && currentLine !== '') {
        linesCount++;
        currentLine = word + ' ';
      } else {
        currentLine = testLine;
      }
    }
    linesCount++;

    const finalLines = Math.max(linesCount, text.split('\n').length);
    const lineAreaHeight = finalLines * fontSize * lineHeight;

    const metrics = ctx.measureText(text);
    const glyphHeight = (metrics.actualBoundingBoxAscent || fontSize * 0.8) +
      (metrics.actualBoundingBoxDescent || fontSize * 0.2);

    return Math.ceil(Math.max(lineAreaHeight, glyphHeight) + 2);
  };

  useEffect(() => {
    const textToMeasure = previewProduct
      ? replaceVariables(element.content || '', previewProduct, printOptions as any)
      : (element.content || '');

    const fontSize = element.fontSize || 12;
    const fontFamily = element.fontFamily || 'Arial';
    const fontWeight = element.fontWeight || 400;
    const lineHeight = element.lineHeight || 1.1;
    const currentWidth = element.width || 0;

    const measureKey = `${textToMeasure}-${currentWidth}-${fontSize}-${fontFamily}-${fontWeight}-${lineHeight}`;
    if (measureKey === lastMeasureKey) return;

    const calculatedHeight = measureTextHeight(textToMeasure, currentWidth || 100, fontSize, fontWeight, fontFamily, lineHeight);
    const safetyFloor = Math.ceil(fontSize * lineHeight);
    const finalHeight = Math.max(calculatedHeight, safetyFloor + 1);

    if (element.height < safetyFloor || (calculatedHeight > element.height && Math.abs(element.height - finalHeight) > 1) || element.width === 0) {
      setLastMeasureKey(measureKey);
      onUpdate({
        width: currentWidth || 80,
        height: finalHeight
      });
    }
  }, [element.content, element.width, previewProduct, element.fontSize, element.lineHeight, element.fontFamily, element.fontWeight, printOptions]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { if (e.ctrlKey) setIsCtrlPressed(true); };
    const handleKeyUp = (e: KeyboardEvent) => { if (!e.ctrlKey) setIsCtrlPressed(false); };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const handleDoubleClick = () => {
    const newContent = prompt('Digite o texto:', element.content);
    if (newContent !== null) onUpdate({ content: newContent });
  };

  const currentFontSize = element.fontSize || 12;
  const currentLineHeight = element.lineHeight || 1.1;

  const textStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: element.textAlign === 'center' ? 'center' : element.textAlign === 'right' ? 'flex-end' : 'flex-start',
    fontSize: `${currentFontSize}px`,
    fontFamily: element.fontFamily || 'Arial',
    fontWeight: element.fontWeight,
    color: element.color,
    fontStyle: element.italic ? 'italic' : 'normal',
    textDecoration: element.underline ? 'underline' : 'none',
    lineHeight: currentLineHeight,
    whiteSpace: element.noWrap ? 'nowrap' : 'pre-wrap',
    overflow: 'visible',
    wordBreak: 'break-word',
    boxSizing: 'border-box', // Consistent box-sizing
    margin: 0,
    padding: 0,
  };

  const contentRaw = previewProduct
    ? replaceVariables(element.content || 'Texto', previewProduct, printOptions as any)
    : (element.content || 'Texto');

  // Segurança: se a substituição retornar vazio (ex: variável não encontrada), exibir o original para não sumir
  const content = contentRaw.trim() === '' ? (element.content || 'Texto') : contentRaw;

  // Single Div Strategy for standardizing print output and fixing html2canvas shifts
  if (isPrinting) {
    return (
      <div
        style={{
          ...textStyle,
          position: 'absolute',
          transform: `translate(${element.x}px, ${element.y}px)`,
          left: 0,
          top: 0,
          width: `${element.width}px`,
          height: `${element.height}px`,
          zIndex: (element.zIndex || 1),
          // Reset global styles just in case
          margin: 0,
          padding: 0,
          boxSizing: 'border-box',
          // Explicitly force Block layout
          display: 'block',
          textAlign: element.textAlign || 'left',
          // Ensure line-height matches editor
          lineHeight: element.lineHeight || 1.1,
          justifyContent: undefined,
          alignItems: undefined,
        }}
      >
        {content}
      </div>
    );
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
      disableDragging={element.locked || !isCtrlPressed}
      enableResizing={!element.locked && isSelected}
      minWidth={1}
      minHeight={currentFontSize}
      style={{
        outline: isSelected ? '1px solid #3B82F6' : '0.5px dashed #CBD5E1',
        outlineOffset: '0px',
        zIndex: isSelected ? 9999 : (element.zIndex || 1),
        cursor: isCtrlPressed ? 'move' : 'pointer',
        backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.05)' : 'transparent',
      }}
      onMouseDown={(e) => { e.stopPropagation(); onSelect(); }}
    >
      <div onDoubleClick={handleDoubleClick} style={textStyle}>
        {content}
      </div>
    </Rnd>
  );
};

export default DraggableText;
