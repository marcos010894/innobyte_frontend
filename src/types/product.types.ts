// Tipos para gerenciamento de produtos e impressão em lote

export interface Product {
  id: string;
  name: string;
  code: string;
  price: number;
  quantity: number;
  category?: string;
  barcode?: string;
  sku?: string;  // Código SKU do produto
  image?: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PrintConfig {
  // Nome do preset (opcional, para identificação)
  name?: string;
  
  // Modo de impressão
  // 'grid' = Layout fixo em página A4 (colunas x linhas definidas manualmente)
  // 'auto' = Cada página do PDF tem o tamanho exato da etiqueta (uma etiqueta por página)
  printMode: 'grid' | 'auto';
  
  // Tamanho da página (papel)
  pageWidth: number; // Largura da página em mm
  pageHeight: number; // Altura da página em mm
  pageFormat: 'a4' | 'custom'; // Formato da página
  
  // Layout da página
  columns: number; // Colunas por página
  rows: number; // Linhas por página
  
  // Espaçamentos
  spacingHorizontal: number; // em mm
  spacingVertical: number; // em mm
  
  // Margens da página
  marginTop: number;
  marginBottom: number;
  marginLeft: number;
  marginRight: number;
  
  // Configurações da etiqueta
  labelWidth: number;
  labelHeight: number;
  unit: 'mm' | 'cm' | 'in';
  
  // Opções visuais
  showBorders?: boolean;
  showPrice?: boolean;
  showBarcode?: boolean;
  
  // Template de etiqueta a ser usado
  templateId?: string;
  
  // Opções de substituição de variáveis
  truncateNames?: boolean;
  maxNameLength?: number;
  priceFormat?: 'decimal' | 'integer'; // 19.90 ou 19
  pricePrefix?: string; // Ex: "R$ "
  
  // Opções de formatação de PREÇO
  ocultarCentavos?: boolean;    // R$ 100 em vez de R$ 100,00 (quando inteiro)
  exibirParcelado?: boolean;    // Mostrar "2x de R$ 50" em vez de "R$ 100"
  exibirPrecoMascarado?: boolean; // Mostrar "CO0033" em vez de "R$ 100,33"
  parcelamento?: number;        // Número de parcelas (2, 3, 4...)
  
  // Opções de formatação de NOME
  abreviarNomes?: boolean;      // "Brin Prat" em vez de "Brinco Prata"
  
  // Pular primeiras etiquetas (útil para folhas parcialmente usadas)
  skipLabels?: number;
}

export interface PrintJob {
  id: string;
  products: Product[];
  config: PrintConfig;
  totalLabels: number;
  totalPages: number;
  createdAt: Date;
}

export interface PrintPreset {
  id: string;
  name: string;
  description: string;
  icon: string;
  config: Partial<PrintConfig>;
}

// Presets comuns de impressão
export const PRINT_PRESETS: PrintPreset[] = [
  // === FOLHAS A4 COM ETIQUETAS ADESIVAS ===
  {
    id: 'pimaco-6180-126',
    name: '126 etiquetas (A4)',
    description: 'Pimaco 6180 - 35×17mm (6 col × 21 lin)',
    icon: '📋',
    config: {
      printMode: 'grid',
      pageWidth: 210,
      pageHeight: 297,
      pageFormat: 'a4',
      columns: 6,
      rows: 21,
      spacingHorizontal: 0,
      spacingVertical: 0,
      marginTop: 10.7,
      marginBottom: 10.7,
      marginLeft: 4.7,
      marginRight: 4.7,
      labelWidth: 35,
      labelHeight: 17,
      unit: 'mm',
    },
  },
  {
    id: 'pimaco-6182-65',
    name: '65 etiquetas (A4)',
    description: 'Pimaco 6182 - 46.5×16.9mm (5 col × 13 lin)',
    icon: '📄',
    config: {
      printMode: 'grid',
      pageWidth: 210,
      pageHeight: 297,
      pageFormat: 'a4',
      columns: 5,
      rows: 13,
      spacingHorizontal: 0,
      spacingVertical: 0,
      marginTop: 10.9,
      marginBottom: 10.9,
      marginLeft: 4.7,
      marginRight: 4.7,
      labelWidth: 46.5,
      labelHeight: 16.9,
      unit: 'mm',
    },
  },
  {
    id: 'small-24',
    name: '24 etiquetas (A4)',
    description: '50×30mm (3 col × 8 lin)',
    icon: '📑',
    config: {
      printMode: 'grid',
      pageWidth: 210,
      pageHeight: 297,
      pageFormat: 'a4',
      columns: 3,
      rows: 8,
      spacingHorizontal: 2,
      spacingVertical: 2,
      marginTop: 10,
      marginBottom: 10,
      marginLeft: 10,
      marginRight: 10,
      labelWidth: 50,
      labelHeight: 30,
      unit: 'mm',
    },
  },
  {
    id: 'medium-10',
    name: '10 etiquetas (A4)',
    description: '70×40mm (2 col × 5 lin)',
    icon: '📃',
    config: {
      printMode: 'grid',
      pageWidth: 210,
      pageHeight: 297,
      pageFormat: 'a4',
      columns: 2,
      rows: 5,
      spacingHorizontal: 3,
      spacingVertical: 3,
      marginTop: 10,
      marginBottom: 10,
      marginLeft: 10,
      marginRight: 10,
      labelWidth: 70,
      labelHeight: 40,
      unit: 'mm',
    },
  },
  // === IMPRESSORA TÉRMICA (ROLO) - UMA ETIQUETA POR PÁGINA ===
  {
    id: 'termica-33x21',
    name: '33×21mm (Térmica)',
    description: 'Uma etiqueta por página - impressora térmica',
    icon: '🖨️',
    config: {
      printMode: 'auto',
      pageWidth: 33,
      pageHeight: 21,
      pageFormat: 'custom',
      columns: 1,
      rows: 1,
      spacingHorizontal: 0,
      spacingVertical: 0,
      marginTop: 0,
      marginBottom: 0,
      marginLeft: 0,
      marginRight: 0,
      labelWidth: 33,
      labelHeight: 21,
      unit: 'mm',
    },
  },
  {
    id: 'rabicho-95x12',
    name: '95×12mm (Rabicho)',
    description: 'Uma etiqueta por página - gôndola',
    icon: '🏷️',
    config: {
      printMode: 'auto',
      pageWidth: 95,
      pageHeight: 12,
      pageFormat: 'custom',
      columns: 1,
      rows: 1,
      spacingHorizontal: 0,
      spacingVertical: 0,
      marginTop: 0,
      marginBottom: 0,
      marginLeft: 0,
      marginRight: 0,
      labelWidth: 95,
      labelHeight: 12,
      unit: 'mm',
    },
  },
];
