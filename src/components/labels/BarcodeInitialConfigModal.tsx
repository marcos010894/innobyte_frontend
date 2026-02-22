import React from 'react';


interface BarcodeInitialConfigModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (value: string) => void;
}

const BarcodeInitialConfigModal: React.FC<BarcodeInitialConfigModalProps> = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md animate-fade-in-up overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white text-center relative">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-full transition-colors"
                        title="Cancelar"
                    >
                        <i className="fas fa-times"></i>
                    </button>
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-md">
                        <i className="fas fa-barcode text-3xl"></i>
                    </div>
                    <h2 className="text-xl font-bold">Adicionar Código de Barras</h2>
                    <p className="text-green-100 text-sm mt-1">O que este código deve ler?</p>
                </div>

                {/* Content - Botões Diretos */}
                <div className="p-6 grid grid-cols-3 gap-4">

                    {/* Opção 1: Código */}
                    <button
                        onClick={() => onConfirm('${codigo}')}
                        className="flex flex-col items-center justify-center gap-3 p-4 rounded-xl border-2 border-gray-200 hover:border-green-500 hover:bg-green-50 transition-all group"
                    >
                        <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-500 group-hover:bg-green-100 group-hover:text-green-600 flex items-center justify-center text-lg transition-colors">
                            <i className="fas fa-hashtag"></i>
                        </div>
                        <div className="text-center">
                            <span className="block font-bold text-gray-800 group-hover:text-green-800 text-sm">Cód. Produto</span>
                            <code className="text-[10px] text-gray-500 mt-1 block">{'${codigo}'}</code>
                        </div>
                    </button>

                    {/* Opção 2: SKU */}
                    <button
                        onClick={() => onConfirm('${sku}')}
                        className="flex flex-col items-center justify-center gap-3 p-4 rounded-xl border-2 border-gray-200 hover:border-green-500 hover:bg-green-50 transition-all group"
                    >
                        <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-500 group-hover:bg-green-100 group-hover:text-green-600 flex items-center justify-center text-lg transition-colors">
                            <i className="fas fa-fingerprint"></i>
                        </div>
                        <div className="text-center">
                            <span className="block font-bold text-gray-800 group-hover:text-green-800 text-sm">SKU</span>
                            <code className="text-[10px] text-gray-500 mt-1 block">{'${sku}'}</code>
                        </div>
                    </button>

                    {/* Opção 3: Barcode */}
                    <button
                        onClick={() => onConfirm('${barcode}')}
                        className="flex flex-col items-center justify-center gap-3 p-4 rounded-xl border-2 border-gray-200 hover:border-green-500 hover:bg-green-50 transition-all group"
                    >
                        <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-500 group-hover:bg-green-100 group-hover:text-green-600 flex items-center justify-center text-lg transition-colors">
                            <i className="fas fa-barcode"></i>
                        </div>
                        <div className="text-center">
                            <span className="block font-bold text-gray-800 group-hover:text-green-800 text-sm">Barcode</span>
                            <code className="text-[10px] text-gray-500 mt-1 block">{'${barcode}'}</code>
                        </div>
                    </button>

                </div>

                <div className="bg-gray-50 p-3 text-center text-xs text-gray-500 border-t border-gray-100">
                    Dica: Você poderá alterar isso depois nas propriedades.
                </div>
            </div>
        </div>
    );
};

export default BarcodeInitialConfigModal;
