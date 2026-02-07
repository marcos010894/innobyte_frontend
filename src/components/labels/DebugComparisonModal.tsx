import React, { useState, useEffect } from 'react';
import type { LabelTemplate } from '@/types/label.types';
import type { Product } from '@/types/product.types';
import LabelCanvas from './LabelCanvas';
import { replaceTemplateVariables } from '@/utils/templateVariables';
import {
    compareElementPositions,
    extractElementPositions,
    generateDebugReport,
    copyToClipboard,
    type PositionDifference,
    type ElementPositionInfo,
} from '@/utils/debugUtils';

interface DebugComparisonModalProps {
    template: LabelTemplate;
    product: Product;
    isOpen: boolean;
    onClose: () => void;
}

const DebugComparisonModal: React.FC<DebugComparisonModalProps> = ({
    template,
    product,
    isOpen,
    onClose,
}) => {
    const [zoom, setZoom] = useState(1.5);
    const [showGrid, setShowGrid] = useState(true);
    const [differences, setDifferences] = useState<PositionDifference[]>([]);
    const [editPositions, setEditPositions] = useState<ElementPositionInfo[]>([]);
    const [printPositions, setPrintPositions] = useState<ElementPositionInfo[]>([]);
    const [copied, setCopied] = useState(false);

    // Elementos com dados substituídos para preview
    const elementsWithData = replaceTemplateVariables(template.elements, product, {});

    useEffect(() => {
        if (isOpen) {
            // Extrair posições dos elementos
            const editPos = extractElementPositions(template.elements);
            const printPos = extractElementPositions(elementsWithData);

            setEditPositions(editPos);
            setPrintPositions(printPos);

            // Comparar posições
            const diffs = compareElementPositions(template.elements, elementsWithData);
            setDifferences(diffs);
        }
    }, [isOpen, template.elements, elementsWithData]);

    const handleCopyReport = async () => {
        const report = generateDebugReport(
            template.config.name,
            differences,
            editPositions,
            printPositions
        );

        const success = await copyToClipboard(report);
        if (success) {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (!isOpen) return null;

    const elementsWithDifferences = differences.filter((d) => d.hasDifference);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-7xl max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">
                            🔍 Comparação: Edição vs Impressão
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                            Template: <strong>{template.config.name}</strong> | Produto: <strong>{product.name}</strong>
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <i className="fas fa-times mr-2"></i>
                        Fechar
                    </button>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-200">
                    <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-700">Zoom:</span>
                            <input
                                type="range"
                                min="0.5"
                                max="3"
                                step="0.1"
                                value={zoom}
                                onChange={(e) => setZoom(parseFloat(e.target.value))}
                                className="w-32"
                            />
                            <span className="text-sm text-gray-600 w-12">{(zoom * 100).toFixed(0)}%</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={showGrid}
                                onChange={(e) => setShowGrid(e.target.checked)}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className="text-sm font-medium text-gray-700">Mostrar Grid</span>
                        </label>
                    </div>
                    <button
                        onClick={handleCopyReport}
                        className={`px-4 py-2 rounded-lg transition-colors ${copied
                            ? 'bg-green-500 text-white'
                            : 'bg-blue-500 text-white hover:bg-blue-600'
                            }`}
                    >
                        <i className={`fas ${copied ? 'fa-check' : 'fa-copy'} mr-2`}></i>
                        {copied ? 'Copiado!' : 'Copiar Relatório'}
                    </button>
                </div>

                {/* Status Banner */}
                {elementsWithDifferences.length > 0 ? (
                    <div className="p-3 bg-yellow-50 border-b border-yellow-200">
                        <div className="flex items-center gap-2 text-yellow-800">
                            <i className="fas fa-exclamation-triangle"></i>
                            <span className="font-medium">
                                ⚠️ {elementsWithDifferences.length} elemento(s) com diferenças detectadas
                            </span>
                        </div>
                    </div>
                ) : (
                    <div className="p-3 bg-green-50 border-b border-green-200">
                        <div className="flex items-center gap-2 text-green-800">
                            <i className="fas fa-check-circle"></i>
                            <span className="font-medium">
                                ✅ Nenhuma diferença detectada - Renderização idêntica
                            </span>
                        </div>
                    </div>
                )}

                {/* Main Content */}
                <div className="flex-1 overflow-auto p-4">
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        {/* Modo Edição */}
                        <div className="border-2 border-blue-500 rounded-lg overflow-hidden">
                            <div className="bg-blue-500 text-white px-4 py-2 font-semibold">
                                📝 Modo Edição (Como você vê)
                            </div>
                            <div className="bg-gray-100 p-4 flex items-center justify-center min-h-[400px]">
                                <div style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}>
                                    <LabelCanvas
                                        config={{
                                            ...template.config,
                                            showGrid: showGrid,
                                            showBorders: true,
                                            showMargins: false,
                                            showCenterLine: false,
                                        }}
                                        elements={template.elements}
                                        selectedElementId={null}
                                        onSelectElement={() => { }}
                                        onUpdateElement={() => { }}
                                        onDeleteElement={() => { }}
                                        zoom={1}
                                        isPrinting={false}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Modo Impressão */}
                        <div className="border-2 border-purple-500 rounded-lg overflow-hidden">
                            <div className="bg-purple-500 text-white px-4 py-2 font-semibold">
                                🖨️ Modo Impressão (Como será exportado)
                            </div>
                            <div className="bg-gray-100 p-4 flex items-center justify-center min-h-[400px]">
                                <div style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}>
                                    <LabelCanvas
                                        config={{
                                            ...template.config,
                                            showGrid: showGrid,
                                            showBorders: true,
                                            showMargins: false,
                                            showCenterLine: false,
                                        }}
                                        elements={elementsWithData}
                                        selectedElementId={null}
                                        onSelectElement={() => { }}
                                        onUpdateElement={() => { }}
                                        onDeleteElement={() => { }}
                                        zoom={1}
                                        isPrinting={true}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tabela de Diferenças */}
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <div className="bg-gray-800 text-white px-4 py-2 font-semibold">
                            📊 Análise Detalhada de Posicionamento
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-100 border-b border-gray-200">
                                    <tr>
                                        <th className="px-4 py-2 text-left font-semibold text-gray-700">Elemento</th>
                                        <th className="px-4 py-2 text-left font-semibold text-gray-700">Modo Edição</th>
                                        <th className="px-4 py-2 text-left font-semibold text-gray-700">Modo Impressão</th>
                                        <th className="px-4 py-2 text-left font-semibold text-gray-700">Diferenças</th>
                                        <th className="px-4 py-2 text-center font-semibold text-gray-700">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {editPositions.map((editPos) => {
                                        const printPos = printPositions.find((p) => p.id === editPos.id);
                                        const diff = differences.find((d) => d.elementId === editPos.id);

                                        return (
                                            <tr
                                                key={editPos.id}
                                                className={`border-b border-gray-200 ${diff?.hasDifference ? 'bg-yellow-50' : 'bg-white'
                                                    }`}
                                            >
                                                <td className="px-4 py-3">
                                                    <div className="font-medium text-gray-900">
                                                        {editPos.type.toUpperCase()}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        ID: {editPos.id.substring(0, 8)}...
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="text-xs font-mono text-gray-700">
                                                        X: {editPos.x}px, Y: {editPos.y}px
                                                    </div>
                                                    <div className="text-xs font-mono text-gray-500">
                                                        W: {editPos.width}px, H: {editPos.height}px
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    {printPos ? (
                                                        <>
                                                            <div className="text-xs font-mono text-gray-700">
                                                                X: {printPos.x}px, Y: {printPos.y}px
                                                            </div>
                                                            <div className="text-xs font-mono text-gray-500">
                                                                W: {printPos.width}px, H: {printPos.height}px
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <span className="text-xs text-red-500">N/A</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {diff ? (
                                                        <>
                                                            <div className="text-xs font-mono text-gray-700">
                                                                ΔX: {diff.deltaX.toFixed(1)}px, ΔY: {diff.deltaY.toFixed(1)}px
                                                            </div>
                                                            <div className="text-xs font-mono text-gray-500">
                                                                ΔW: {diff.deltaWidth.toFixed(1)}px, ΔH: {diff.deltaHeight.toFixed(1)}px
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <span className="text-xs text-gray-400">-</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    {diff?.hasDifference ? (
                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                            <i className="fas fa-exclamation-triangle mr-1"></i>
                                                            Diferente
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                            <i className="fas fa-check mr-1"></i>
                                                            OK
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DebugComparisonModal;
