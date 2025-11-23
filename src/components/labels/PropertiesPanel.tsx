import React from 'react';
import type { LabelElement, TextElementProps, QRCodeElementProps, BarcodeElementProps, ImageElementProps, RectangleElementProps } from '@/types/label.types';
import { AVAILABLE_FONTS, FONT_SIZES, FONT_WEIGHTS, PRESET_COLORS } from '@/types/label.types';

interface PropertiesPanelProps {
  element: LabelElement | null;
  onUpdate: (updates: Partial<LabelElement>) => void;
}

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ element, onUpdate }) => {
  if (!element) {
    return (
      <div className="w-80 bg-white border-l border-gray-200 p-6">
        <div className="text-center text-gray-400 mt-12">
          <i className="fas fa-mouse-pointer text-6xl mb-4"></i>
          <p className="text-sm">Selecione um elemento</p>
          <p className="text-xs mt-2">para ver as propriedades</p>
        </div>
      </div>
    );
  }

  const renderTextProperties = (el: TextElementProps) => (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Conteúdo</label>
        <textarea
          value={el.content}
          onChange={(e) => onUpdate({ content: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm resize-none text-gray-900"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Fonte</label>
          <select
            value={el.fontFamily}
            onChange={(e) => onUpdate({ fontFamily: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900"
          >
            {AVAILABLE_FONTS.map((font) => (
              <option key={font} value={font}>
                {font}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tamanho</label>
          <select
            value={el.fontSize}
            onChange={(e) => onUpdate({ fontSize: parseInt(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900"
          >
            {FONT_SIZES.map((size) => (
              <option key={size} value={size}>
                {size}px
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Peso da Fonte</label>
        <select
          value={el.fontWeight}
          onChange={(e) => onUpdate({ fontWeight: e.target.value as TextElementProps['fontWeight'] })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900"
        >
          {FONT_WEIGHTS.map((weight) => (
            <option key={weight.value} value={weight.value}>
              {weight.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Alinhamento</label>
        <div className="flex gap-2">
          {['left', 'center', 'right'].map((align) => (
            <button
              key={align}
              onClick={() => onUpdate({ textAlign: align as TextElementProps['textAlign'] })}
              className={`flex-1 py-2 px-3 rounded-md text-sm ${
                el.textAlign === align
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <i className={`fas fa-align-${align}`}></i>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Cor</label>
        <div className="flex gap-2 items-center">
          <input
            type="color"
            value={el.color}
            onChange={(e) => onUpdate({ color: e.target.value })}
            className="w-12 h-10 rounded cursor-pointer"
          />
          <input
            type="text"
            value={el.color}
            onChange={(e) => onUpdate({ color: e.target.value })}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm font-mono"
            placeholder="#000000"
          />
        </div>
        <div className="grid grid-cols-8 gap-1 mt-2">
          {PRESET_COLORS.map((color) => (
            <button
              key={color}
              onClick={() => onUpdate({ color })}
              className="w-full h-6 rounded border-2 hover:scale-110 transition-transform"
              style={{
                backgroundColor: color,
                borderColor: el.color === color ? '#3B82F6' : '#E5E7EB',
              }}
              title={color}
            />
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={el.italic}
            onChange={(e) => onUpdate({ italic: e.target.checked })}
            className="rounded"
          />
          <i className="fas fa-italic"></i> Itálico
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={el.underline}
            onChange={(e) => onUpdate({ underline: e.target.checked })}
            className="rounded"
          />
          <i className="fas fa-underline"></i> Sublinhado
        </label>
      </div>
    </>
  );

  const renderQRCodeProperties = (el: QRCodeElementProps) => (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Valor do QR Code</label>
        <textarea
          value={el.value}
          onChange={(e) => onUpdate({ value: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-mono resize-none text-gray-900"
          rows={3}
          placeholder="https://exemplo.com"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Cor Fundo</label>
          <input
            type="color"
            value={el.bgColor || '#FFFFFF'}
            onChange={(e) => onUpdate({ bgColor: e.target.value })}
            className="w-full h-10 rounded cursor-pointer"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Cor QR</label>
          <input
            type="color"
            value={el.fgColor || '#000000'}
            onChange={(e) => onUpdate({ fgColor: e.target.value })}
            className="w-full h-10 rounded cursor-pointer"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Correção de Erro</label>
        <select
          value={el.errorCorrectionLevel || 'M'}
          onChange={(e) => onUpdate({ errorCorrectionLevel: e.target.value as QRCodeElementProps['errorCorrectionLevel'] })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900"
        >
          <option value="L">Baixa (7%)</option>
          <option value="M">Média (15%)</option>
          <option value="Q">Alta (25%)</option>
          <option value="H">Muito Alta (30%)</option>
        </select>
      </div>
    </>
  );

  const renderBarcodeProperties = (el: BarcodeElementProps) => (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Código</label>
        <input
          type="text"
          value={el.value}
          onChange={(e) => onUpdate({ value: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-mono text-gray-900"
          placeholder="1234567890"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Formato</label>
        <select
          value={el.format}
          onChange={(e) => onUpdate({ format: e.target.value as BarcodeElementProps['format'] })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900"
        >
          <option value="CODE128">CODE128</option>
          <option value="EAN13">EAN13</option>
          <option value="EAN8">EAN8</option>
          <option value="UPC">UPC</option>
          <option value="CODE39">CODE39</option>
          <option value="ITF14">ITF14</option>
        </select>
      </div>

      <div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={el.displayValue !== false}
            onChange={(e) => onUpdate({ displayValue: e.target.checked })}
            className="rounded"
          />
          Mostrar texto do código
        </label>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Cor Linha</label>
          <input
            type="color"
            value={el.lineColor || '#000000'}
            onChange={(e) => onUpdate({ lineColor: e.target.value })}
            className="w-full h-10 rounded cursor-pointer"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Cor Fundo</label>
          <input
            type="color"
            value={el.background || '#FFFFFF'}
            onChange={(e) => onUpdate({ background: e.target.value })}
            className="w-full h-10 rounded cursor-pointer"
          />
        </div>
      </div>
    </>
  );

  const renderImageProperties = (el: ImageElementProps) => (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">URL da Imagem</label>
        <input
          type="text"
          value={el.src}
          onChange={(e) => onUpdate({ src: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900"
          placeholder="https://..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Ajuste</label>
        <select
          value={el.objectFit || 'contain'}
          onChange={(e) => onUpdate({ objectFit: e.target.value as ImageElementProps['objectFit'] })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900"
        >
          <option value="contain">Conter</option>
          <option value="cover">Cobrir</option>
          <option value="fill">Preencher</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Opacidade: {Math.round((el.opacity || 1) * 100)}%
        </label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={el.opacity || 1}
          onChange={(e) => onUpdate({ opacity: parseFloat(e.target.value) })}
          className="w-full"
        />
      </div>
    </>
  );

  const renderRectangleProperties = (el: RectangleElementProps) => (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Cor de Preenchimento</label>
        <div className="flex gap-2">
          <input
            type="color"
            value={el.fillColor || '#FFFFFF'}
            onChange={(e) => onUpdate({ fillColor: e.target.value })}
            className="w-12 h-10 rounded cursor-pointer"
          />
          <input
            type="text"
            value={el.fillColor || '#FFFFFF'}
            onChange={(e) => onUpdate({ fillColor: e.target.value })}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm font-mono"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Cor da Borda</label>
        <div className="flex gap-2">
          <input
            type="color"
            value={el.borderColor || '#000000'}
            onChange={(e) => onUpdate({ borderColor: e.target.value })}
            className="w-12 h-10 rounded cursor-pointer"
          />
          <input
            type="text"
            value={el.borderColor || '#000000'}
            onChange={(e) => onUpdate({ borderColor: e.target.value })}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm font-mono"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Espessura da Borda: {el.borderWidth || 0}px
        </label>
        <input
          type="range"
          min="0"
          max="10"
          value={el.borderWidth || 0}
          onChange={(e) => onUpdate({ borderWidth: parseInt(e.target.value) })}
          className="w-full"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Borda Arredondada: {el.borderRadius || 0}px
        </label>
        <input
          type="range"
          min="0"
          max="50"
          value={el.borderRadius || 0}
          onChange={(e) => onUpdate({ borderRadius: parseInt(e.target.value) })}
          className="w-full"
        />
      </div>
    </>
  );

  return (
    <div className="w-80 bg-white border-l border-gray-200 p-4 overflow-y-auto">
      <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <i className="fas fa-sliders-h mr-2 text-primary"></i>
        Propriedades
      </h2>

      <div className="space-y-4">
        {/* Tipo do elemento */}
        <div className="pb-4 border-b">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
            {element.type === 'text' && <><i className="fas fa-font"></i> Texto</>}
            {element.type === 'qrcode' && <><i className="fas fa-qrcode"></i> QR Code</>}
            {element.type === 'barcode' && <><i className="fas fa-barcode"></i> Código de Barras</>}
            {element.type === 'image' && <><i className="fas fa-image"></i> Imagem</>}
            {element.type === 'rectangle' && <><i className="fas fa-square"></i> Retângulo</>}
          </span>
        </div>

        {/* Posição e Tamanho */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Posição e Tamanho</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">X</label>
              <input
                type="number"
                value={Math.round(element.x)}
                onChange={(e) => onUpdate({ x: parseInt(e.target.value) || 0 })}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-gray-900"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Y</label>
              <input
                type="number"
                value={Math.round(element.y)}
                onChange={(e) => onUpdate({ y: parseInt(e.target.value) || 0 })}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-gray-900"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Largura</label>
              <input
                type="number"
                value={Math.round(element.width)}
                onChange={(e) => onUpdate({ width: parseInt(e.target.value) || 50 })}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-gray-900"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Altura</label>
              <input
                type="number"
                value={Math.round(element.height)}
                onChange={(e) => onUpdate({ height: parseInt(e.target.value) || 30 })}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-gray-900"
              />
            </div>
          </div>
        </div>

        {/* Propriedades específicas */}
        {element.type === 'text' && renderTextProperties(element)}
        {element.type === 'qrcode' && renderQRCodeProperties(element)}
        {element.type === 'barcode' && renderBarcodeProperties(element)}
        {element.type === 'image' && renderImageProperties(element)}
        {element.type === 'rectangle' && renderRectangleProperties(element)}

        {/* Bloquear elemento */}
        <div className="pt-4 border-t">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={element.locked}
              onChange={(e) => onUpdate({ locked: e.target.checked })}
              className="rounded"
            />
            <i className={`fas fa-lock${element.locked ? '' : '-open'}`}></i>
            Bloquear elemento
          </label>
        </div>
      </div>
    </div>
  );
};

export default PropertiesPanel;
