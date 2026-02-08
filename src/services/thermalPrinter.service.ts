/**
 * Serviço de Geração de Comandos para Impressoras Térmicas
 * 
 * Suporta os seguintes formatos:
 * - ZPL (Zebra Programming Language) - Impressoras Zebra
 * - EPL (Eltron Programming Language) - Impressoras Zebra antigas/Eltron
 * - TSPL (TSC Printer Language) - Impressoras TSC
 */

import type { LabelElement, LabelTemplate, BarcodeFormat } from '@/types/label.types';
import type { Product } from '@/types/product.types';
import { replaceTemplateVariables } from '@/utils/templateVariables';

export type ThermalPrinterFormat = 'ZPL' | 'EPL' | 'TSPL';

export interface ThermalPrintConfig {
  /** Formato do comando (ZPL, EPL, TSPL) */
  format: ThermalPrinterFormat;
  /** DPI da impressora (203, 300, 600) */
  dpi: number;
  /** Largura do label em mm */
  labelWidth: number;
  /** Altura do label em mm */
  labelHeight: number;
  /** Velocidade de impressão (1-10) */
  printSpeed?: number;
  /** Densidade/Escuridão (0-30 para ZPL, 0-15 para EPL) */
  darkness?: number;
  /** Quantidade de cópias por etiqueta */
  copies?: number;
}

/**
 * Converte mm para dots baseado no DPI
 */
function mmToDots(mm: number, dpi: number): number {
  // 1 inch = 25.4mm
  return Math.round((mm / 25.4) * dpi);
}

/**
 * Converte pixels (96 DPI do navegador) para dots da impressora
 */
function pxToDots(px: number, dpi: number): number {
  return Math.round(px * (dpi / 96));
}

/**
 * Converte tamanho de fonte para dots
 * Assume que o editor usa pixels. 1px = 1/96 inch
 */
function fontSizeToDots(fontSize: number, dpi: number): number {
  return pxToDots(fontSize, dpi);
}

/**
 * Mapeia formato de código de barras para código ZPL
 */
function getBarcodeZPLCode(format: BarcodeFormat): string {
  const mapping: Record<BarcodeFormat, string> = {
    'CODE128': 'BC',
    'EAN13': 'BE',
    'EAN8': 'B8',
    'UPC': 'BU',
    'CODE39': 'B3',
    'ITF14': 'BI',
    'MSI': 'BM',
    'pharmacode': 'BP',
  };
  return mapping[format] || 'BC';
}

/**
 * Mapeia formato de código de barras para código EPL
 */
function getBarcodeEPLCode(format: BarcodeFormat): string {
  const mapping: Record<BarcodeFormat, string> = {
    'CODE128': '1',
    'EAN13': 'E30',
    'EAN8': 'E80',
    'UPC': 'UA0',
    'CODE39': '3',
    'ITF14': '2',
    'MSI': 'M',
    'pharmacode': '3',
  };
  return mapping[format] || '1';
}

/**
 * Mapeia formato de código de barras para código TSPL
 */
function getBarcodeTSPLCode(format: BarcodeFormat): string {
  const mapping: Record<BarcodeFormat, string> = {
    'CODE128': '128',
    'EAN13': 'EAN13',
    'EAN8': 'EAN8',
    'UPC': 'UPCA',
    'CODE39': '39',
    'ITF14': 'ITF14',
    'MSI': 'MSI',
    'pharmacode': '93',
  };
  return mapping[format] || '128';
}

/**
 * Estima a largura de um código de barras em dots
 * Baseado no formato e conteúdo
 * Usado para calcular alinhamento centralizado/direita
 */
function estimateBarcodeWidth(format: BarcodeFormat, value: string): number {
  const narrowBarWidth = 2; // dots (padrão ^BY)
  
  switch (format) {
    case 'CODE128':
      // CODE128: ~11 módulos por caractere + 35 para start/stop/checksum
      const modules = (value.length * 11) + 35;
      return modules * narrowBarWidth;
      
    case 'EAN13':
      // EAN13: largura fixa de 95 módulos
      return 95 * narrowBarWidth;
      
    case 'EAN8':
      // EAN8: largura fixa de 67 módulos
      return 67 * narrowBarWidth;
      
    case 'CODE39':
      // CODE39: 13 módulos por caractere (9 barras + 4 espaços) + start/stop
      return ((value.length * 13) + 25) * narrowBarWidth;
      
    case 'UPC':
      // UPC-A: largura fixa de 95 módulos
      return 95 * narrowBarWidth;
      
    case 'ITF14':
      // ITF14: 14 dígitos, ~18 módulos por par de dígitos
      return (7 * 18 + 20) * narrowBarWidth;
      
    default:
      // Estimativa genérica
      return value.length * 12 * narrowBarWidth;
  }
}

// ===================== ZPL Generator =====================

/**
 * Gera comandos ZPL para uma etiqueta
 */
function generateZPL(
  elements: LabelElement[],
  config: ThermalPrintConfig
): string {
  const { dpi, labelWidth, labelHeight, printSpeed = 4, darkness = 15, copies = 1 } = config;

  const lines: string[] = [];

  // Início do label
  lines.push('^XA'); // Start Format

  // Configurações do label
  lines.push(`^PW${mmToDots(labelWidth, dpi)}`); // Print Width
  lines.push(`^LL${mmToDots(labelHeight, dpi)}`); // Label Length
  lines.push(`^PR${printSpeed}`); // Print Rate/Speed
  lines.push(`~SD${darkness}`); // Set Darkness
  lines.push('^LH0,0'); // Label Home (origin)

  // Processar cada elemento
  for (const element of elements) {
    const x = pxToDots(element.x, dpi);
    const y = pxToDots(element.y, dpi);
    const width = pxToDots(element.width, dpi);
    const height = pxToDots(element.height, dpi);

    switch (element.type) {
      case 'text': {
        const textEl = element;
        const fontHeight = fontSizeToDots(textEl.fontSize || 12, dpi);
        // Font weight pode ser usado para selecionar fonte bold quando disponível
        const fontStyle = (textEl.fontWeight === 'bold' || parseInt(textEl.fontWeight || '400') >= 600) ? 'B' : 'N';

        lines.push(`^FO${x},${y}`); // Field Origin

        // Usar fonte escalável (^A0) com tamanho - fontStyle indica Normal ou Bold
        lines.push(`^A0${fontStyle},${fontHeight},${Math.round(fontHeight * 0.7)}`);

        // Alinhamento
        if (textEl.textAlign === 'center') {
          lines.push(`^FB${width},1,0,C,0`); // Field Block centered
        } else if (textEl.textAlign === 'right') {
          lines.push(`^FB${width},1,0,R,0`); // Field Block right
        }

        // Texto
        lines.push(`^FD${textEl.content}^FS`);
        break;
      }

      case 'barcode': {
        const barcodeEl = element;
        // Se mostrar texto, reduzir altura das barras para caber o texto (aprox 75%)
        const heightFactor = barcodeEl.displayValue !== false ? 0.75 : 1.0;
        const barcodeHeight = Math.max(Math.round(height * heightFactor), mmToDots(5, dpi));
        const barcodeType = getBarcodeZPLCode(barcodeEl.format);

        // Calcular posição X baseado no alinhamento
        let adjustedX = x;
        
        if (barcodeEl.textAlign === 'center' || barcodeEl.textAlign === 'right') {
          // Estimar largura do barcode
          const estimatedBarcodeWidth = estimateBarcodeWidth(barcodeEl.format, barcodeEl.value);
          
          if (barcodeEl.textAlign === 'center') {
            // Centralizar: mover X para a direita pela metade da diferença
            const offset = Math.round((width - estimatedBarcodeWidth) / 2);
            adjustedX = x + Math.max(0, offset);
          } else if (barcodeEl.textAlign === 'right') {
            // Alinhar à direita
            const offset = width - estimatedBarcodeWidth;
            adjustedX = x + Math.max(0, offset);
          }
        }

        lines.push(`^FO${adjustedX},${y}`);
        lines.push(`^BY2,2,${barcodeHeight}`); // Bar code defaults

        // Tipo de código de barras e valor
        lines.push(`^${barcodeType}N,${barcodeHeight},Y,N,N`);
        lines.push(`^FD${barcodeEl.value}^FS`);
        break;
      }

      case 'qrcode': {
        const qrEl = element;
        // ZPL QR Code size depends on magnification (1-10)
        // We estimate magnification based on desired pixel size
        const desiredSizeDots = Math.min(width, height);
        // Base size is roughly 25-30 dots per magnification unit depending on model, trying approximation
        // ZPL BQN: magnification factor 1-10.
        const magnification = Math.max(1, Math.min(10, Math.round(desiredSizeDots / 30)));

        lines.push(`^FO${x},${y}`);
        lines.push(`^BQN,2,${magnification}`); // QR Code
        lines.push(`^FDQA,${qrEl.value}^FS`);
        break;
      }

      case 'rectangle': {
        const rectEl = element;
        const borderWidth = pxToDots(rectEl.borderWidth || 1, dpi);

        lines.push(`^FO${x},${y}`);

        if (rectEl.fillColor && rectEl.fillColor !== 'transparent') {
          // Retângulo preenchido
          lines.push(`^GB${width},${height},${width},B,0^FS`);
        } else {
          // Apenas borda
          lines.push(`^GB${width},${height},${borderWidth}^FS`);
        }
        break;
      }

      case 'line': {
        const lineEl = element;
        const thickness = pxToDots(lineEl.thickness || 1, dpi);

        lines.push(`^FO${x},${y}`);

        if (lineEl.orientation === 'horizontal') {
          lines.push(`^GB${width},${thickness},${thickness}^FS`);
        } else {
          lines.push(`^GB${thickness},${height},${thickness}^FS`);
        }
        break;
      }

      case 'image': {
        // Imagens em ZPL requerem conversão para GRF (Zebra Graphics Format)
        // Por enquanto, apenas adiciona um placeholder
        lines.push(`^FO${x},${y}`);
        lines.push(`^GB${width},${height},1^FS`); // Placeholder box
        lines.push(`; Image placeholder - requires GRF conversion`);
        break;
      }
    }
  }

  // Quantidade de cópias
  if (copies > 1) {
    lines.push(`^PQ${copies}`);
  }

  // Fim do label
  lines.push('^XZ'); // End Format

  return lines.join('\n');
}

// ===================== EPL Generator =====================

/**
 * Gera comandos EPL para uma etiqueta
 */
function generateEPL(
  elements: LabelElement[],
  config: ThermalPrintConfig
): string {
  const { dpi, labelWidth, labelHeight, printSpeed = 3, darkness = 10, copies = 1 } = config;

  const lines: string[] = [];

  // Início/Reset
  lines.push(''); // Linha em branco
  lines.push('N'); // Clear image buffer

  // Configurações
  lines.push(`q${mmToDots(labelWidth, dpi)}`); // Set label width
  lines.push(`Q${mmToDots(labelHeight, dpi)},24`); // Set label height + gap
  lines.push(`S${printSpeed}`); // Speed
  lines.push(`D${darkness}`); // Density

  // Processar cada elemento
  for (const element of elements) {
    const x = pxToDots(element.x, dpi);
    const y = pxToDots(element.y, dpi);
    const width = pxToDots(element.width, dpi);
    const height = pxToDots(element.height, dpi);

    switch (element.type) {
      case 'text': {
        const textEl = element;
        const fontSize = textEl.fontSize || 12;

        // EPL usa fontes numeradas (1-5 ou A-Z para fontes baixadas)
        let font = '3'; // Fonte média padrão
        if (fontSize <= 8) font = '1';
        else if (fontSize <= 10) font = '2';
        else if (fontSize <= 14) font = '3';
        else if (fontSize <= 18) font = '4';
        else font = '5';

        // Multiplicadores (horizontal, vertical)
        const multiplier = Math.max(1, Math.min(8, Math.round(fontSize / 12)));

        // A = ASCII text
        lines.push(`A${x},${y},0,${font},${multiplier},${multiplier},N,"${textEl.content}"`);
        break;
      }

      case 'barcode': {
        const barcodeEl = element;
        // Se mostrar texto, reduzir altura das barras para caber o texto
        const heightFactor = barcodeEl.displayValue !== false ? 0.75 : 1.0;
        const barcodeHeight = Math.max(Math.round(height * heightFactor), mmToDots(5, dpi));
        const barcodeType = getBarcodeEPLCode(barcodeEl.format);

        // Narrow bar width
        const narrowBar = 2;

        // B = Barcode
        lines.push(`B${x},${y},0,${barcodeType},${narrowBar},2,${barcodeHeight},B,"${barcodeEl.value}"`);
        break;
      }

      case 'qrcode': {
        const qrEl = element;
        // EPL não tem suporte nativo a QR Code em versões antigas
        // Usando código 2D DataMatrix como alternativa ou placeholder
        lines.push(`; QR Code not directly supported in EPL`);
        lines.push(`; Value: ${qrEl.value}`);
        lines.push(`A${x},${y},0,2,1,1,N,"QR:${qrEl.value.substring(0, 20)}"`);
        break;
      }

      case 'rectangle': {
        const rectEl = element;
        const borderWidth = pxToDots(rectEl.borderWidth || 1, dpi);

        // LO = Line Draw Black
        // Top line
        lines.push(`LO${x},${y},${width},${borderWidth}`);
        // Bottom line
        lines.push(`LO${x},${y + height - borderWidth},${width},${borderWidth}`);
        // Left line
        lines.push(`LO${x},${y},${borderWidth},${height}`);
        // Right line
        lines.push(`LO${x + width - borderWidth},${y},${borderWidth},${height}`);
        break;
      }

      case 'line': {
        const lineEl = element;
        const thickness = pxToDots(lineEl.thickness || 1, dpi);

        if (lineEl.orientation === 'horizontal') {
          lines.push(`LO${x},${y},${width},${thickness}`);
        } else {
          lines.push(`LO${x},${y},${thickness},${height}`);
        }
        break;
      }

      case 'image': {
        lines.push(`; Image placeholder at ${x},${y}`);
        lines.push(`LO${x},${y},${width},${height}`);
        break;
      }
    }
  }

  // Imprimir
  lines.push(`P${copies}`); // Print X copies

  return lines.join('\n');
}

// ===================== TSPL Generator =====================

/**
 * Gera comandos TSPL para uma etiqueta
 */
function generateTSPL(
  elements: LabelElement[],
  config: ThermalPrintConfig
): string {
  const { dpi, labelWidth, labelHeight, printSpeed = 4, darkness = 8, copies = 1 } = config;

  const lines: string[] = [];

  // Configuração inicial
  lines.push(`SIZE ${labelWidth} mm, ${labelHeight} mm`);
  lines.push(`GAP 2 mm, 0 mm`); // Gap entre etiquetas
  lines.push(`SPEED ${printSpeed}`);
  lines.push(`DENSITY ${darkness}`);
  lines.push(`DIRECTION 1`);
  lines.push(`REFERENCE 0,0`);
  lines.push(`CLS`); // Clear buffer

  // Processar cada elemento
  for (const element of elements) {
    const x = pxToDots(element.x, dpi);
    const y = pxToDots(element.y, dpi);
    const width = pxToDots(element.width, dpi);
    const height = pxToDots(element.height, dpi);

    switch (element.type) {
      case 'text': {
        const textEl = element;
        const fontSize = textEl.fontSize || 12;

        // TSPL usa fontes numeradas ou TrueType
        // Calculamos o multiplicador baseado no tamanho da fonte
        const fontMultiplier = Math.max(1, Math.round(fontSize / 12));
        const font = '"2"'; // Fonte padrão

        // Rotação (0, 90, 180, 270)
        const rotation = 0;

        // TEXT x,y,"font",rotation,x-mul,y-mul,"content"
        lines.push(`TEXT ${x},${y},${font},${rotation},${fontMultiplier},${fontMultiplier},"${textEl.content}"`);
        break;
      }

      case 'barcode': {
        const barcodeEl = element;
        // Se mostrar texto, reduzir altura das barras para caber o texto
        const heightFactor = barcodeEl.displayValue !== false ? 0.75 : 1.0;
        const barcodeHeight = Math.max(Math.round(height * heightFactor), mmToDots(5, dpi));
        const barcodeType = getBarcodeTSPLCode(barcodeEl.format);

        // BARCODE x,y,"type",height,readable,rotation,narrow,wide,"content"
        const readable = barcodeEl.displayValue !== false ? 1 : 0;
        lines.push(`BARCODE ${x},${y},"${barcodeType}",${barcodeHeight},${readable},0,2,4,"${barcodeEl.value}"`);
        break;
      }

      case 'qrcode': {
        const qrEl = element;
        const cellWidth = Math.max(2, Math.min(10, Math.round(width / 50)));

        // QRCODE x,y,ECC level,cell width,mode,rotation,"content"
        lines.push(`QRCODE ${x},${y},H,${cellWidth},A,0,"${qrEl.value}"`);
        break;
      }

      case 'rectangle': {
        const rectEl = element;
        const borderWidth = pxToDots(rectEl.borderWidth || 1, dpi);

        // BOX x,y,width,height,thickness
        lines.push(`BOX ${x},${y},${x + width},${y + height},${borderWidth}`);
        break;
      }

      case 'line': {
        const lineEl = element;
        const thickness = pxToDots(lineEl.thickness || 1, dpi);

        // BAR x,y,width,height
        if (lineEl.orientation === 'horizontal') {
          lines.push(`BAR ${x},${y},${width},${thickness}`);
        } else {
          lines.push(`BAR ${x},${y},${thickness},${height}`);
        }
        break;
      }

      case 'image': {
        lines.push(`REM Image placeholder at ${x},${y}`);
        lines.push(`BOX ${x},${y},${x + width},${y + height},1`);
        break;
      }
    }
  }

  // Imprimir
  lines.push(`PRINT ${copies},1`); // quantity, copies

  return lines.join('\n');
}

// ===================== Public API =====================

/**
 * Gera comandos de impressora térmica para um produto
 */
export function generateThermalCommands(
  template: LabelTemplate,
  product: Product,
  config: ThermalPrintConfig,
  printOptions?: {
    truncateNames?: boolean;
    maxNameLength?: number;
    priceFormat?: 'decimal' | 'integer';
    pricePrefix?: string;
  }
): string {
  // Substituir variáveis do template com dados do produto
  const elementsWithData = replaceTemplateVariables(
    template.elements,
    product,
    printOptions || {}
  );

  // Gerar comandos baseado no formato
  switch (config.format) {
    case 'ZPL':
      return generateZPL(elementsWithData, config);
    case 'EPL':
      return generateEPL(elementsWithData, config);
    case 'TSPL':
      return generateTSPL(elementsWithData, config);
    default:
      throw new Error(`Formato não suportado: ${config.format}`);
  }
}

/**
 * Gera comandos para múltiplos produtos
 */
export function generateBatchThermalCommands(
  template: LabelTemplate,
  products: Array<{ product: Product; quantity: number }>,
  config: ThermalPrintConfig,
  printOptions?: {
    truncateNames?: boolean;
    maxNameLength?: number;
    priceFormat?: 'decimal' | 'integer';
    pricePrefix?: string;
  }
): string {
  const allCommands: string[] = [];

  for (const { product, quantity } of products) {
    // Configurar quantidade no config
    const configWithQuantity = { ...config, copies: quantity };

    const commands = generateThermalCommands(
      template,
      product,
      configWithQuantity,
      printOptions
    );

    allCommands.push(`; === Produto: ${product.name} (${quantity}x) ===`);
    allCommands.push(commands);
    allCommands.push(''); // Linha em branco entre produtos
  }

  return allCommands.join('\n');
}

/**
 * Faz download do arquivo de comandos
 */
export function downloadThermalFile(
  content: string,
  format: ThermalPrinterFormat,
  filename?: string
): void {
  const extensions: Record<ThermalPrinterFormat, string> = {
    'ZPL': 'zpl',
    'EPL': 'epl',
    'TSPL': 'prn',
  };

  const ext = extensions[format];
  const name = filename || `etiquetas_${new Date().toISOString().split('T')[0]}`;

  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `${name}.${ext}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Configurações padrão por DPI
 */
export const DEFAULT_THERMAL_CONFIGS: Record<number, Partial<ThermalPrintConfig>> = {
  203: { dpi: 203, printSpeed: 4, darkness: 15 },
  300: { dpi: 300, printSpeed: 4, darkness: 15 },
  600: { dpi: 600, printSpeed: 3, darkness: 12 },
};

/**
 * Lista de formatos suportados com descrição
 */
export const THERMAL_FORMATS = [
  { value: 'ZPL' as ThermalPrinterFormat, label: 'ZPL (Zebra)', description: 'Zebra Programming Language - Impressoras Zebra' },
  { value: 'EPL' as ThermalPrinterFormat, label: 'EPL (Eltron)', description: 'Eltron Programming Language - Impressoras Zebra antigas' },
  { value: 'TSPL' as ThermalPrinterFormat, label: 'TSPL (TSC)', description: 'TSC Printer Language - Impressoras TSC' },
] as const;

/**
 * Lista de DPIs comuns
 */
export const COMMON_DPIS = [
  { value: 203, label: '203 DPI (8 dots/mm)' },
  { value: 300, label: '300 DPI (12 dots/mm)' },
  { value: 600, label: '600 DPI (24 dots/mm)' },
] as const;
