/**
 * Utilitário para substituir variáveis em templates de etiquetas
 * Suporta: ${nome}, ${preco}, ${codigo}, ${barcode}, ${categoria}, etc.
 */

import type { Product } from '@/types/product.types';
import type { LabelElement } from '@/types/label.types';

export interface VariableOptions {
  truncateNames?: boolean;
  maxNameLength?: number;
  priceFormat?: 'decimal' | 'integer';
  pricePrefix?: string;
}

/**
 * Lista de variáveis disponíveis para substituição
 */
export const AVAILABLE_VARIABLES = [
  { key: '${nome}', description: 'Nome do produto', example: 'Produto Exemplo' },
  { key: '${preco}', description: 'Preço do produto', example: 'R$ 19,90' },
  { key: '${codigo}', description: 'Código do produto', example: 'PROD001' },
  { key: '${barcode}', description: 'Código de barras', example: '7891234567890' },
  { key: '${categoria}', description: 'Categoria do produto', example: 'Eletrônicos' },
  { key: '${descricao}', description: 'Descrição do produto', example: 'Descrição detalhada' },
  { key: '${quantidade}', description: 'Quantidade em estoque', example: '100' },
] as const;

/**
 * Formata o preço de acordo com as opções
 */
function formatPrice(price: number, options: VariableOptions): string {
  const prefix = options.pricePrefix || 'R$ ';
  
  if (options.priceFormat === 'integer') {
    return `${prefix}${Math.floor(price)}`;
  }
  
  // Formato decimal padrão brasileiro
  return `${prefix}${price.toFixed(2).replace('.', ',')}`;
}

/**
 * Trunca texto se necessário
 */
function truncateText(text: string, options: VariableOptions): string {
  if (options.truncateNames && options.maxNameLength) {
    if (text.length > options.maxNameLength) {
      return text.substring(0, options.maxNameLength) + '...';
    }
  }
  return text;
}

/**
 * Substitui variáveis em uma string
 */
export function replaceVariables(
  text: string, 
  product: Product, 
  options: VariableOptions = {}
): string {
  let result = text;
  
  // ${nome} - Nome do produto (com opção de truncamento)
  const productName = truncateText(product.name, options);
  result = result.replace(/\$\{nome\}/gi, productName);
  
  // ${preco} - Preço formatado
  const formattedPrice = formatPrice(product.price, options);
  result = result.replace(/\$\{preco\}/gi, formattedPrice);
  
  // ${codigo} - Código do produto
  result = result.replace(/\$\{codigo\}/gi, product.code || '');
  
  // ${barcode} - Código de barras
  result = result.replace(/\$\{barcode\}/gi, product.barcode || '');
  
  // ${categoria} - Categoria
  result = result.replace(/\$\{categoria\}/gi, product.category || '');
  
  // ${descricao} - Descrição
  result = result.replace(/\$\{descricao\}/gi, product.description || '');
  
  // ${quantidade} - Quantidade
  result = result.replace(/\$\{quantidade\}/gi, product.quantity.toString());
  
  return result;
}

/**
 * Substitui variáveis em um elemento do template
 * Retorna uma cópia do elemento com as variáveis substituídas
 */
export function replaceElementVariables(
  element: LabelElement,
  product: Product,
  options: VariableOptions = {}
): LabelElement {
  switch (element.type) {
    case 'text': {
      // Substituir variáveis no conteúdo do texto
      const textElement = element as Extract<LabelElement, { type: 'text' }>;
      return {
        ...textElement,
        content: replaceVariables(textElement.content, product, options),
      };
    }
      
    case 'qrcode': {
      // Substituir variáveis no valor do QR Code
      const qrElement = element as Extract<LabelElement, { type: 'qrcode' }>;
      return {
        ...qrElement,
        value: replaceVariables(qrElement.value, product, options),
      };
    }
      
    case 'barcode': {
      // Substituir variáveis no valor do código de barras
      const barcodeElement = element as Extract<LabelElement, { type: 'barcode' }>;
      return {
        ...barcodeElement,
        value: replaceVariables(barcodeElement.value, product, options),
      };
    }
      
    default:
      // Outros tipos de elemento não precisam de substituição
      return element;
  }
}

/**
 * Substitui variáveis em todos os elementos de um template
 */
export function replaceTemplateVariables(
  elements: LabelElement[],
  product: Product,
  options: VariableOptions = {}
): LabelElement[] {
  return elements.map(element => replaceElementVariables(element, product, options));
}

/**
 * Detecta se um texto contém variáveis
 */
export function hasVariables(text: string): boolean {
  return /\$\{[^}]+\}/g.test(text);
}

/**
 * Extrai todas as variáveis de um texto
 */
export function extractVariables(text: string): string[] {
  const matches = text.match(/\$\{[^}]+\}/g);
  return matches || [];
}

/**
 * Valida se todas as variáveis em um texto são conhecidas
 */
export function validateVariables(text: string): { valid: boolean; unknown: string[] } {
  const variables = extractVariables(text);
  const knownVariables = AVAILABLE_VARIABLES.map(v => v.key);
  const unknown = variables.filter(v => !knownVariables.includes(v as any));
  
  return {
    valid: unknown.length === 0,
    unknown,
  };
}
