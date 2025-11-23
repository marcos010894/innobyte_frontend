// Tipos para gerenciamento de produtos e impressão em lote

export interface Product {
  id: string;
  name: string;
  code: string;
  price: number;
  quantity: number;
  category?: string;
  barcode?: string;
  image?: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PrintConfig {
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
  {
    id: 'small-24',
    name: '3×8 (24 etiquetas)',
    description: 'Ideal para etiquetas pequenas 50×30mm',
    icon: '📋',
    config: {
      columns: 3,
      rows: 8,
      spacingHorizontal: 2,
      spacingVertical: 2,
      labelWidth: 50,
      labelHeight: 30,
      unit: 'mm',
    },
  },
  {
    id: 'medium-10',
    name: '2×5 (10 etiquetas)',
    description: 'Ideal para etiquetas médias 70×40mm',
    icon: '📄',
    config: {
      columns: 2,
      rows: 5,
      spacingHorizontal: 3,
      spacingVertical: 3,
      labelWidth: 70,
      labelHeight: 40,
      unit: 'mm',
    },
  },
  {
    id: 'tiny-40',
    name: '4×10 (40 etiquetas)',
    description: 'Ideal para etiquetas pequenas 30×20mm',
    icon: '📑',
    config: {
      columns: 4,
      rows: 10,
      spacingHorizontal: 1,
      spacingVertical: 1,
      labelWidth: 30,
      labelHeight: 20,
      unit: 'mm',
    },
  },
  {
    id: 'large-8',
    name: '2×4 (8 etiquetas)',
    description: 'Ideal para etiquetas grandes 90×50mm',
    icon: '📃',
    config: {
      columns: 2,
      rows: 4,
      spacingHorizontal: 5,
      spacingVertical: 5,
      labelWidth: 90,
      labelHeight: 50,
      unit: 'mm',
    },
  },
];
