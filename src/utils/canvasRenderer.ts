import type { LabelElement, LabelConfig, PagePrintConfig } from '@/types/label.types';
import type { Product } from '@/types/product.types';
import { replaceVariables } from './templateVariables';
import JsBarcode from 'jsbarcode';
import * as QRCode from 'qrcode';

/**
 * Renderiza elementos de etiqueta diretamente em um Canvas nativo
 * Isso garante posicionamento pixel-perfect sem depender de html2canvas
 */
export async function renderLabelToNativeCanvas(
  config: LabelConfig,
  elements: LabelElement[],
  previewProduct?: Product,
  printOptions?: PagePrintConfig
): Promise<string> {
  // Converter unidades para pixels
  const getPixelsFromUnit = (value: number, unit: string) => {
    const conversionRates = {
      mm: 3.7795275591, // 96 DPI
      cm: 37.795275591,
      in: 96,
      px: 1,
    };
    return value * (conversionRates[unit as keyof typeof conversionRates] || 1);
  };

  const widthPx = getPixelsFromUnit(config.width, config.unit);
  const heightPx = getPixelsFromUnit(config.height, config.unit);

  // Criar canvas
  const canvas = document.createElement('canvas');
  canvas.width = Math.ceil(widthPx * 2); // 2x para alta qualidade
  canvas.height = Math.ceil(heightPx * 2);
  const ctx = canvas.getContext('2d')!;

  // Escalar para alta qualidade
  ctx.scale(2, 2);

  // Fundo
  ctx.fillStyle = config.backgroundColor || '#FFFFFF';
  ctx.fillRect(0, 0, widthPx, heightPx);

  // Ordenar elementos por zIndex
  const sortedElements = [...elements].sort((a, b) => (a.zIndex || 1) - (b.zIndex || 1));

  // Renderizar cada elemento
  for (const element of sortedElements) {
    try {
      switch (element.type) {
        case 'text':
          await renderTextElement(ctx, element, previewProduct, printOptions);
          break;
        case 'barcode':
          await renderBarcodeElement(ctx, element, previewProduct, printOptions);
          break;
        case 'qrcode':
          await renderQRCodeElement(ctx, element, previewProduct, printOptions);
          break;
        case 'image':
          await renderImageElement(ctx, element);
          break;
        case 'rectangle':
          renderRectangleElement(ctx, element);
          break;
      }
    } catch (error) {
      console.error(`Erro ao renderizar elemento ${element.type}:`, error);
    }
  }

  // Retornar como data URL
  return canvas.toDataURL('image/png', 1.0);
}

// Renderizar elemento de texto
async function renderTextElement(
  ctx: CanvasRenderingContext2D,
  element: any,
  previewProduct?: Product,
  printOptions?: PagePrintConfig
) {
  const contentRaw = previewProduct
    ? replaceVariables(element.content || 'Texto', previewProduct, printOptions as any)
    : (element.content || 'Texto');
  
  const content = contentRaw.trim() === '' ? (element.content || 'Texto') : contentRaw;

  // Configurar fonte
  const fontSize = element.fontSize || 12;
  const fontFamily = element.fontFamily || 'Arial';
  const fontWeight = element.fontWeight || 'normal';
  const fontStyle = element.italic ? 'italic' : 'normal';
  
  ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
  ctx.fillStyle = element.color || '#000000';
  ctx.textBaseline = 'top';

  // Alinhamento
  const textAlign = element.textAlign || 'left';
  let x = element.x;
  
  if (textAlign === 'center') {
    ctx.textAlign = 'center';
    x = element.x + element.width / 2;
  } else if (textAlign === 'right') {
    ctx.textAlign = 'right';
    x = element.x + element.width;
  } else {
    ctx.textAlign = 'left';
  }

  // Desenhar texto com quebra de linha automática (word wrap)
  const lineHeight = (element.lineHeight || 1.1) * fontSize;
  
  // 1. Dividir por quebras de linha explícitas (\n)
  const paragraphs = content.split('\n');
  let allLines: string[] = [];
  
  // 2. Para cada parágrafo, aplicar word wrap se necessário
  if (element.noWrap) {
    allLines = paragraphs;
  } else {
    paragraphs.forEach((paragraph: string) => {
      // Se a linha for vazia, manter vazia
      if (paragraph === '') {
        allLines.push('');
      } else {
        const wrapped = wrapText(ctx, paragraph, element.width);
        allLines.push(...wrapped);
      }
    });
  }
  
  // 3. Desenhar todas as linhas
  allLines.forEach((line: string, index: number) => {
    const y = element.y + (index * lineHeight);
    
    // Aplicar decorações
    if (element.underline) {
      const metrics = ctx.measureText(line);
      const underlineY = y + fontSize;
      ctx.beginPath();
      ctx.moveTo(x - (textAlign === 'center' ? metrics.width / 2 : 0), underlineY);
      ctx.lineTo(x + (textAlign === 'center' ? metrics.width / 2 : metrics.width), underlineY);
      ctx.strokeStyle = element.color || '#000000';
      ctx.stroke();
    }
    
    ctx.fillText(line, x, y);
  });
}

/**
 * Quebra o texto em linhas para caber na largura máxima
 */
function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = words[0];

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const width = ctx.measureText(currentLine + " " + word).width;
    if (width < maxWidth) {
      currentLine += " " + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  lines.push(currentLine);
  return lines;
}

// Renderizar código de barras
async function renderBarcodeElement(
  ctx: CanvasRenderingContext2D,
  element: any,
  previewProduct?: Product,
  printOptions?: PagePrintConfig
) {
  const barcodeValue = previewProduct
    ? replaceVariables(element.value || '1234567890', previewProduct, printOptions as any)
    : (element.value || '1234567890');

  // Criar SVG temporário
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  
  try {
    JsBarcode(svg, barcodeValue, {
      format: element.format || 'CODE128',
      width: 2,
      height: 100,
      displayValue: element.displayValue !== false,
      fontSize: 16,
      margin: 0,
      background: 'transparent',
      lineColor: element.lineColor || '#000000',
    });

    // Converter SVG para imagem
    const svgData = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    });

    // Desenhar imagem no canvas
    ctx.drawImage(img, element.x, element.y, element.width, element.height);
  } catch (error) {
    console.error('Erro ao gerar barcode:', error);
  }
}

// Renderizar QR Code
async function renderQRCodeElement(
  ctx: CanvasRenderingContext2D,
  element: any,
  previewProduct?: Product,
  printOptions?: PagePrintConfig
) {
  const qrValue = previewProduct
    ? replaceVariables(element.value || 'https://innobyte.com', previewProduct, printOptions as any)
    : (element.value || 'https://innobyte.com');

  try {
    // Gerar QR Code como data URL
    const qrDataUrl = await QRCode.toDataURL(qrValue, {
      errorCorrectionLevel: element.errorCorrectionLevel || 'M',
      margin: 0,
      width: element.width * 2, // Alta qualidade
      color: {
        dark: element.fgColor || '#000000',
        light: element.bgColor || '#FFFFFF',
      },
    });

    // Carregar e desenhar imagem
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = qrDataUrl;
    });

    ctx.drawImage(img, element.x, element.y, element.width, element.height);
  } catch (error) {
    console.error('Erro ao gerar QR code:', error);
  }
}

// Renderizar imagem
async function renderImageElement(ctx: CanvasRenderingContext2D, element: any) {
  if (!element.src) return;

  try {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = element.src;
    });

    // Aplicar opacidade se necessário
    if (element.opacity && element.opacity < 1) {
      ctx.globalAlpha = element.opacity;
    }

    // Desenhar com objectFit
    const objectFit = element.objectFit || 'contain';
    if (objectFit === 'cover') {
      // Calcular dimensões para cover
      const imgRatio = img.width / img.height;
      const boxRatio = element.width / element.height;
      
      let drawWidth, drawHeight, offsetX, offsetY;
      
      if (imgRatio > boxRatio) {
        drawHeight = element.height;
        drawWidth = img.width * (element.height / img.height);
        offsetX = (element.width - drawWidth) / 2;
        offsetY = 0;
      } else {
        drawWidth = element.width;
        drawHeight = img.height * (element.width / img.width);
        offsetX = 0;
        offsetY = (element.height - drawHeight) / 2;
      }
      
      ctx.save();
      ctx.beginPath();
      ctx.rect(element.x, element.y, element.width, element.height);
      ctx.clip();
      ctx.drawImage(img, element.x + offsetX, element.y + offsetY, drawWidth, drawHeight);
      ctx.restore();
    } else {
      // contain (padrão)
      ctx.drawImage(img, element.x, element.y, element.width, element.height);
    }

    // Restaurar opacidade
    if (element.opacity && element.opacity < 1) {
      ctx.globalAlpha = 1;
    }
  } catch (error) {
    console.error('Erro ao carregar imagem:', error);
  }
}

// Renderizar retângulo
function renderRectangleElement(ctx: CanvasRenderingContext2D, element: any) {
  // Preencher
  if (element.fillColor) {
    ctx.fillStyle = element.fillColor;
    if (element.borderRadius) {
      roundRect(ctx, element.x, element.y, element.width, element.height, element.borderRadius);
      ctx.fill();
    } else {
      ctx.fillRect(element.x, element.y, element.width, element.height);
    }
  }

  // Borda
  if (element.borderWidth) {
    ctx.strokeStyle = element.borderColor || '#000000';
    ctx.lineWidth = element.borderWidth;
    if (element.borderRadius) {
      roundRect(ctx, element.x, element.y, element.width, element.height, element.borderRadius);
      ctx.stroke();
    } else {
      ctx.strokeRect(element.x, element.y, element.width, element.height);
    }
  }
}

// Helper para desenhar retângulo com bordas arredondadas
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}
