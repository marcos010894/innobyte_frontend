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
  // Novas opções de formatação
  precoMascarado?: boolean;        // CO0033 (2 letras nome + 00 + centavos)
  parcelamento?: number;            // Número de parcelas (2, 3, 4, etc)
  mostrarParcelado?: boolean;       // Mostrar preço parcelado
  mostrarCheioEParcelado?: boolean; // Mostrar ambos
  ocultarCentavos?: boolean;        // Não mostrar centavos quando inteiro
  abreviarNomes?: boolean;          // Usar 4 letras de cada palavra
}

/**
 * Lista de variáveis disponíveis para substituição
 */
export const AVAILABLE_VARIABLES = [
  { key: '${nome}', description: 'Nome do produto', example: 'Produto Exemplo' },
  { key: '${nome_abreviado}', description: 'Nome abreviado (4 letras por palavra)', example: 'Prod Exem' },
  { key: '${preco}', description: 'Preço do produto', example: 'R$ 19,90' },
  { key: '${preco_mascarado}', description: 'Preço mascarado (2 letras + 00 + centavos)', example: 'PR0090' },
  { key: '${preco_parcelado}', description: 'Preço parcelado', example: '2x de R$ 9,95' },
  { key: '${preco_cheio_parcelado}', description: 'Preço cheio + parcelado', example: 'R$ 19,90 | 2x R$ 9,95' },
  { key: '${codigo}', description: 'Código do produto', example: 'PROD001' },
  { key: '${sku}', description: 'Código SKU', example: 'SKU123456' },
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
  
  // Ocultar centavos quando valor é inteiro
  if (options.ocultarCentavos) {
    const temCentavos = price % 1 !== 0;
    if (!temCentavos) {
      return `${prefix}${Math.floor(price)}`;
    }
  }
  
  if (options.priceFormat === 'integer') {
    return `${prefix}${Math.floor(price)}`;
  }
  
  // Formato decimal padrão brasileiro
  return `${prefix}${price.toFixed(2).replace('.', ',')}`;
}

/**
 * Gera preço mascarado: 2 primeiras letras do nome + "00" + centavos
 * Ex: Coca-Cola R$10,33 → CO0033
 */
function formatPrecoMascarado(price: number, productName: string): string {
  // Pegar 2 primeiras letras do nome (maiúsculas)
  const letras = productName.replace(/[^a-zA-Z]/g, '').substring(0, 2).toUpperCase();
  
  // Pegar os centavos (2 dígitos)
  const centavos = Math.round((price % 1) * 100).toString().padStart(2, '0');
  
  return `${letras}00${centavos}`;
}

/**
 * Formata preço parcelado
 */
function formatPrecoParcelado(price: number, parcelas: number, prefix: string = 'R$ '): string {
  if (parcelas <= 1) return formatPrice(price, { pricePrefix: prefix });
  
  const valorParcela = price / parcelas;
  return `${parcelas}x de ${prefix}${valorParcela.toFixed(2).replace('.', ',')}`;
}

/**
 * Formata preço cheio + parcelado
 */
function formatPrecoCheioEParcelado(price: number, parcelas: number, options: VariableOptions): string {
  const prefix = options.pricePrefix || 'R$ ';
  const precoCheio = formatPrice(price, options);
  
  if (parcelas <= 1) return precoCheio;
  
  const valorParcela = price / parcelas;
  return `${precoCheio} | ${parcelas}x ${prefix}${valorParcela.toFixed(2).replace('.', ',')}`;
}

/**
 * Abrevia nome: usa apenas 4 primeiras letras de cada palavra
 * Ex: "Brinco Prata" → "Brin Prat"
 */
function abreviarNome(name: string): string {
  return name
    .split(' ')
    .map(palavra => palavra.substring(0, 4))
    .join(' ');
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
  
  // ${nome_abreviado} - Nome abreviado (4 letras por palavra)
  const nomeAbreviado = abreviarNome(product.name);
  result = result.replace(/\$\{nome_abreviado\}/gi, nomeAbreviado);
  
  // ${preco} - Preço formatado
  const formattedPrice = formatPrice(product.price, options);
  result = result.replace(/\$\{preco\}/gi, formattedPrice);
  
  // ${preco_mascarado} - Preço mascarado (CO0033)
  const precoMascarado = formatPrecoMascarado(product.price, product.name);
  result = result.replace(/\$\{preco_mascarado\}/gi, precoMascarado);
  
  // ${preco_parcelado} - Preço parcelado (2x de R$ 9,95)
  const parcelas = options.parcelamento || 2;
  const precoParcelado = formatPrecoParcelado(product.price, parcelas, options.pricePrefix);
  result = result.replace(/\$\{preco_parcelado\}/gi, precoParcelado);
  
  // ${preco_cheio_parcelado} - Preço cheio + parcelado
  const precoCheioParcelado = formatPrecoCheioEParcelado(product.price, parcelas, options);
  result = result.replace(/\$\{preco_cheio_parcelado\}/gi, precoCheioParcelado);
  
  // ${codigo} - Código do produto
  result = result.replace(/\$\{codigo\}/gi, product.code || '');
  
  // ${barcode} - Código de barras
  result = result.replace(/\$\{barcode\}/gi, product.barcode || '');
  
  // ${sku} - Código SKU
  result = result.replace(/\$\{sku\}/gi, product.sku || '');
  
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
