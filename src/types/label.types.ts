// Tipos de elementos que podem ser adicionados à etiqueta
export type ElementType = 'text' | 'qrcode' | 'barcode' | 'image' | 'rectangle' | 'line';

// Alinhamento de texto
export type TextAlign = 'left' | 'center' | 'right';

// Tipo de código de barras
export type BarcodeFormat = 
  | 'CODE128' 
  | 'EAN13' 
  | 'EAN8' 
  | 'UPC' 
  | 'CODE39' 
  | 'ITF14' 
  | 'MSI' 
  | 'pharmacode';

// Propriedades base de qualquer elemento
export interface BaseElementProps {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  zIndex?: number;
  locked?: boolean;
}

// Propriedades específicas de texto
export interface TextElementProps extends BaseElementProps {
  type: 'text';
  content: string;
  fontSize: number;
  fontFamily: string;
  fontWeight: 'normal' | 'bold' | '400' | '500' | '600' | '700' | '800';
  color: string;
  textAlign: TextAlign;
  italic?: boolean;
  underline?: boolean;
  lineHeight?: number;
}

// Propriedades de QR Code
export interface QRCodeElementProps extends BaseElementProps {
  type: 'qrcode';
  value: string;
  bgColor?: string;
  fgColor?: string;
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
}

// Propriedades de Código de Barras
export interface BarcodeElementProps extends BaseElementProps {
  type: 'barcode';
  value: string;
  format: BarcodeFormat;
  displayValue?: boolean;
  fontSize?: number;
  lineColor?: string;
  background?: string;
}

// Propriedades de Imagem
export interface ImageElementProps extends BaseElementProps {
  type: 'image';
  src: string;
  opacity?: number;
  objectFit?: 'contain' | 'cover' | 'fill';
}

// Propriedades de Retângulo
export interface RectangleElementProps extends BaseElementProps {
  type: 'rectangle';
  fillColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
}

// Propriedades de Linha
export interface LineElementProps extends BaseElementProps {
  type: 'line';
  color: string;
  thickness: number;
  orientation: 'horizontal' | 'vertical';
}

// Union type de todos os elementos
export type LabelElement = 
  | TextElementProps 
  | QRCodeElementProps 
  | BarcodeElementProps 
  | ImageElementProps 
  | RectangleElementProps 
  | LineElementProps;

// Unidades de medida para etiquetas
export type LabelUnit = 'mm' | 'cm' | 'in' | 'px';

// Tamanhos pré-definidos de etiquetas
export interface LabelSize {
  id: string;
  name: string;
  width: number;
  height: number;
  unit: LabelUnit;
  description?: string;
}

// Configuração da etiqueta
export interface LabelConfig {
  id?: string;
  name: string;
  description?: string;
  width: number;
  height: number;
  unit: LabelUnit;
  backgroundColor: string;
  padding: number;
  showGrid?: boolean;
  gridSize?: number;
  snapToGrid?: boolean;
  
  // Configurações avançadas
  columns?: number; // Número de colunas
  rows?: number; // Número de linhas (para A4)
  marginTop?: number; // Margem superior
  marginBottom?: number; // Margem inferior
  marginLeft?: number; // Margem esquerda
  marginRight?: number; // Margem direita
  spacingHorizontal?: number; // Espaçamento horizontal entre etiquetas
  spacingVertical?: number; // Espaçamento vertical entre etiquetas
  showBorders?: boolean; // Mostrar bordas para teste
  showMargins?: boolean; // Mostrar margens visuais
  showCenterLine?: boolean; // Mostrar linha central (para etiquetas dobráveis)
  showPrice?: boolean; // Mostrar preço
  showBarcode?: boolean; // Mostrar código de barras
  showLogo?: boolean; // Mostrar logo
  logoMaxWidth?: number; // Largura máxima do logo (cm)
  barcodeHeight?: number; // Altura do código de barras
  barcodeThickness?: number; // Espessura das barras
  currencySymbol?: string; // Símbolo da moeda (R$, US$, etc)
  allowInstallments?: boolean; // Permitir parcelamento
  installmentsText?: string; // Texto de parcelamento
  breakLongWords?: boolean; // Quebrar palavras longas em múltiplas linhas
  foldableCenter?: boolean; // Marcar centro para etiquetas dobráveis
  skipLabels?: number; // Pular primeiras N etiquetas (A4 usado parcialmente)
}

// Template completo de etiqueta
export interface LabelTemplate {
  id: string;
  config: LabelConfig;
  elements: LabelElement[];
  createdAt: Date;
  updatedAt: Date;
  thumbnail?: string;
  category?: string;
  tags?: string[];
  isPublic?: boolean;
  userId?: string;
  compartilhado?: boolean;
}

// Estado do editor
export interface EditorState {
  template: LabelTemplate | null;
  selectedElementId: string | null;
  zoom: number;
  showGrid: boolean;
  snapToGrid: boolean;
  history: LabelTemplate[];
  historyIndex: number;
  isDirty: boolean;
}

// Ação do histórico (Undo/Redo)
export interface HistoryAction {
  type: 'add' | 'update' | 'delete' | 'move' | 'resize';
  element?: LabelElement;
  previousState?: Partial<LabelElement>;
  newState?: Partial<LabelElement>;
}

// Tamanhos comuns de etiquetas
export const COMMON_LABEL_SIZES: LabelSize[] = [
  { id: '40x30', name: 'Etiqueta Preço Pequena', width: 40, height: 30, unit: 'mm', description: 'Para preços e produtos' },
  { id: '50x30', name: 'Etiqueta Preço Média', width: 50, height: 30, unit: 'mm', description: 'Etiqueta padrão' },
  { id: '60x40', name: 'Etiqueta Grande', width: 60, height: 40, unit: 'mm', description: 'Produtos grandes' },
  { id: '70x50', name: 'Etiqueta Extra Grande', width: 70, height: 50, unit: 'mm', description: 'Destaque' },
  { id: '100x50', name: 'Etiqueta Prateleira', width: 100, height: 50, unit: 'mm', description: 'Rabicho para gôndolas' },
  { id: '100x150', name: 'Etiqueta A6', width: 100, height: 150, unit: 'mm', description: 'Formato A6' },
  { id: 'a4', name: 'Folha A4', width: 210, height: 297, unit: 'mm', description: 'Papel A4 completo' },
  { id: 'custom', name: 'Tamanho Personalizado', width: 50, height: 30, unit: 'mm', description: 'Defina suas próprias dimensões' },
];

// Fontes disponíveis
export const AVAILABLE_FONTS = [
  'Arial',
  'Helvetica',
  'Times New Roman',
  'Courier New',
  'Georgia',
  'Verdana',
  'Comic Sans MS',
  'Impact',
  'Trebuchet MS',
  'Arial Black',
  'Tahoma',
  'Lucida Console',
  'Roboto',
  'Open Sans',
  'Lato',
  'Montserrat',
];

// Tamanhos de fonte comuns
export const FONT_SIZES = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 60, 72];

// Pesos de fonte
export const FONT_WEIGHTS = [
  { value: '400', label: 'Normal' },
  { value: '500', label: 'Médio' },
  { value: '600', label: 'Semi-Bold' },
  { value: '700', label: 'Bold' },
  { value: '800', label: 'Extra Bold' },
];

// Cores pré-definidas
export const PRESET_COLORS = [
  '#000000', // Preto
  '#FFFFFF', // Branco
  '#FF0000', // Vermelho
  '#00FF00', // Verde
  '#0000FF', // Azul
  '#FFFF00', // Amarelo
  '#FF00FF', // Magenta
  '#00FFFF', // Ciano
  '#FFA500', // Laranja
  '#800080', // Roxo
  '#FFC0CB', // Rosa
  '#A52A2A', // Marrom
  '#808080', // Cinza
  '#C0C0C0', // Prata
  '#FFD700', // Ouro
];
