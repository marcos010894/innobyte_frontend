import React, { useState } from 'react';
import type { ElementType, BarcodeFormat } from '@/types/label.types';
import { AVAILABLE_VARIABLES } from '@/utils/templateVariables';

interface ElementsToolbarProps {
  onAddElement: (type: ElementType, additionalProps?: Record<string, unknown>) => void;
}

const ElementsToolbar: React.FC<ElementsToolbarProps> = ({ onAddElement }) => {
  const [isOpen, setIsOpen] = useState(false);

  const tools = [
    {
      type: 'text' as ElementType,
      icon: 'fa-font',
      label: 'Texto',
      color: 'bg-blue-100 text-blue-600 hover:bg-blue-200',
    },
    {
      type: 'qrcode' as ElementType,
      icon: 'fa-qrcode',
      label: 'QR Code',
      color: 'bg-purple-100 text-purple-600 hover:bg-purple-200',
    },
    {
      type: 'barcode' as ElementType,
      icon: 'fa-barcode',
      label: 'Código Barras',
      color: 'bg-green-100 text-green-600 hover:bg-green-200',
      additionalProps: { format: 'CODE128' as BarcodeFormat },
    },
    {
      type: 'image' as ElementType,
      icon: 'fa-image',
      label: 'Imagem',
      color: 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200',
    },
    {
      type: 'rectangle' as ElementType,
      icon: 'fa-square',
      label: 'Retângulo',
      color: 'bg-gray-100 text-gray-600 hover:bg-gray-200',
    },
  ];

  return (
    <>
      {/* Botão flutuante para abrir em mobile */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed bottom-4 left-4 z-50 w-12 h-12 bg-primary text-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-600 transition-all"
      >
        <i className={`fas fa-${isOpen ? 'times' : 'plus'}`}></i>
      </button>

      {/* Overlay em mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:relative
        inset-y-0 left-0
        z-40
        w-64 bg-white border-r border-gray-200 p-4 overflow-y-auto
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center">
            <i className="fas fa-toolbox mr-2 text-primary"></i>
            Elementos
          </h2>
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden text-gray-600 hover:text-gray-800"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

      <div className="space-y-2">
        {tools.map((tool) => (
          <button
            key={tool.type}
            onClick={() => onAddElement(tool.type, tool.additionalProps)}
            className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${tool.color}`}
          >
            <div className="w-10 h-10 flex items-center justify-center rounded-md bg-white shadow-sm">
              <i className={`fas ${tool.icon} text-xl`}></i>
            </div>
            <span className="font-medium">{tool.label}</span>
          </button>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-medium text-blue-900 mb-2 flex items-center">
          <i className="fas fa-lightbulb mr-2"></i>
          Dicas
        </h3>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>• Clique para adicionar elemento</li>
          <li>• Arraste para mover</li>
          <li>• Redimensione pelas bordas</li>
          <li>• Duplo clique para editar</li>
          <li>• Delete com o botão ×</li>
        </ul>
      </div>

      <div className="mt-4 p-4 bg-gradient-to-r from-primary/10 to-blue-500/10 rounded-lg border border-primary/20">
        <h3 className="font-medium text-gray-800 mb-2 flex items-center">
          <i className="fas fa-magic mr-2 text-primary"></i>
          Campos Dinâmicos
        </h3>
        <p className="text-xs text-gray-600 mb-3">
          Clique para inserir um campo dinâmico:
        </p>
        <div className="flex flex-wrap gap-1">
          {AVAILABLE_VARIABLES.map((variable) => (
            <button
              key={variable.key}
              onClick={() => onAddElement('text', { content: variable.key })}
              className="px-2 py-1 text-xs bg-white text-blue-700 rounded hover:bg-blue-50 border border-blue-200 font-mono transition-colors"
              title={variable.description}
            >
              {variable.key}
            </button>
          ))}
        </div>
      </div>
      </div>
    </>
  );
};

export default ElementsToolbar;
