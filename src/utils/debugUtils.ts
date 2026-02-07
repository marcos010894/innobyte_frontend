import type { LabelElement } from '@/types/label.types';

export interface ElementPositionInfo {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
}

export interface PositionDifference {
  elementId: string;
  elementType: string;
  deltaX: number;
  deltaY: number;
  deltaWidth: number;
  deltaHeight: number;
  hasDifference: boolean;
}

/**
 * Compara as posições de elementos entre modo de edição e impressão
 */
export function compareElementPositions(
  editElements: LabelElement[],
  printElements: LabelElement[]
): PositionDifference[] {
  const differences: PositionDifference[] = [];

  editElements.forEach((editEl) => {
    const printEl = printElements.find((p) => p.id === editEl.id);
    if (!printEl) return;

    const deltaX = Math.abs(editEl.x - printEl.x);
    const deltaY = Math.abs(editEl.y - printEl.y);
    const deltaWidth = Math.abs(editEl.width - printEl.width);
    const deltaHeight = Math.abs(editEl.height - printEl.height);

    const hasDifference = deltaX > 1 || deltaY > 1 || deltaWidth > 1 || deltaHeight > 1;

    differences.push({
      elementId: editEl.id,
      elementType: editEl.type,
      deltaX,
      deltaY,
      deltaWidth,
      deltaHeight,
      hasDifference,
    });
  });

  return differences;
}

/**
 * Extrai informações de posição de elementos
 */
export function extractElementPositions(elements: LabelElement[]): ElementPositionInfo[] {
  return elements.map((el) => ({
    id: el.id,
    type: el.type,
    x: el.x,
    y: el.y,
    width: el.width,
    height: el.height,
    zIndex: el.zIndex || 1,
  }));
}

/**
 * Gera um relatório textual de debug com as diferenças encontradas
 */
export function generateDebugReport(
  templateName: string,
  differences: PositionDifference[],
  editPositions: ElementPositionInfo[],
  printPositions: ElementPositionInfo[]
): string {
  const lines: string[] = [];
  
  lines.push('='.repeat(80));
  lines.push(`RELATÓRIO DE DEBUG - COMPARAÇÃO EDIÇÃO vs IMPRESSÃO`);
  lines.push(`Template: ${templateName}`);
  lines.push(`Data: ${new Date().toLocaleString('pt-BR')}`);
  lines.push('='.repeat(80));
  lines.push('');

  const elementsWithDifferences = differences.filter((d) => d.hasDifference);

  if (elementsWithDifferences.length === 0) {
    lines.push('✅ NENHUMA DIFERENÇA DETECTADA');
    lines.push('Todos os elementos estão nas mesmas posições em ambos os modos.');
  } else {
    lines.push(`⚠️  DIFERENÇAS ENCONTRADAS: ${elementsWithDifferences.length} elemento(s)`);
    lines.push('');

    elementsWithDifferences.forEach((diff, index) => {
      const editPos = editPositions.find((p) => p.id === diff.elementId);
      const printPos = printPositions.find((p) => p.id === diff.elementId);

      lines.push(`${index + 1}. Elemento: ${diff.elementType.toUpperCase()} (ID: ${diff.elementId.substring(0, 8)}...)`);
      lines.push(`   Modo Edição:    X=${editPos?.x}px, Y=${editPos?.y}px, W=${editPos?.width}px, H=${editPos?.height}px`);
      lines.push(`   Modo Impressão: X=${printPos?.x}px, Y=${printPos?.y}px, W=${printPos?.width}px, H=${printPos?.height}px`);
      lines.push(`   Diferenças:     ΔX=${diff.deltaX.toFixed(1)}px, ΔY=${diff.deltaY.toFixed(1)}px, ΔW=${diff.deltaWidth.toFixed(1)}px, ΔH=${diff.deltaHeight.toFixed(1)}px`);
      lines.push('');
    });
  }

  lines.push('='.repeat(80));
  lines.push('DETALHES COMPLETOS DE TODOS OS ELEMENTOS');
  lines.push('='.repeat(80));
  lines.push('');

  editPositions.forEach((editPos, index) => {
    const printPos = printPositions.find((p) => p.id === editPos.id);
    lines.push(`${index + 1}. ${editPos.type.toUpperCase()} (ID: ${editPos.id.substring(0, 8)}...)`);
    lines.push(`   Edição:    X=${editPos.x}px, Y=${editPos.y}px, W=${editPos.width}px, H=${editPos.height}px, Z=${editPos.zIndex}`);
    if (printPos) {
      lines.push(`   Impressão: X=${printPos.x}px, Y=${printPos.y}px, W=${printPos.width}px, H=${printPos.height}px, Z=${printPos.zIndex}`);
    }
    lines.push('');
  });

  lines.push('='.repeat(80));
  lines.push('FIM DO RELATÓRIO');
  lines.push('='.repeat(80));

  return lines.join('\n');
}

/**
 * Copia texto para a área de transferência
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Erro ao copiar para área de transferência:', err);
    return false;
  }
}
