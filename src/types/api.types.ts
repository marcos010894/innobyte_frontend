/**
 * Tipos TypeScript para a API
 * Mantém type safety em toda a aplicação
 */

// ===== RESPONSE PADRÃO =====
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
  summary?: UsuariosSummary;
}

// ===== AUTENTICAÇÃO =====
export interface LoginCredentials {
  email: string;
  password: string;
}

// 🔐 Dados da Licença do Cliente (resposta do login)
export interface LicencaAuth {
  tipo_licenca: 'temporaria' | 'contrato';
  data_inicio: string;
  data_expiracao: string;
  dias_para_vencer: number;
  vencida: boolean;
  limite_empresas: number;
  empresas_ativas: number;
  bloqueada: boolean;
  permite_token: boolean;
  permite_criar_modelos: boolean;
  permite_cadastrar_produtos: boolean;
  apenas_modelos_pdf: boolean;
}

// 🔐 Usuário Master
export interface UsuarioMaster {
  id: number;
  email: string;
  nome: string;
  foto_perfil: string | null;
  tipo: 'master';
  ativo: boolean;
}

// 🔐 Usuário Cliente
export interface UsuarioCliente {
  id: number;
  email: string;
  razao_social: string;
  cnpj: string;
  telefone: string;
  tipo: 'cliente';
  ativo: boolean;
  licenca: LicencaAuth;
}

// 🔐 União de tipos de usuário
export type UserAuth = UsuarioMaster | UsuarioCliente;

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: UserAuth;
}

export interface UserMe {
  id: number;
  email: string;
  nome: string;
  razao_social?: string; // Para clientes
  cnpj?: string; // Para clientes
  telefone?: string; // Para clientes
  tipo: 'master' | 'admin' | 'usuario' | 'cliente';
  ativo: boolean;
  licenca?: LicencaAuth; // Apenas para clientes
}

export interface ChangePasswordData {
  current_password: string;
  new_password: string;
}

// ===== USUÁRIO =====
export interface Usuario {
  id: number;
  cnpj: string;
  razao_social: string;
  telefone: string;
  email: string;
  ativo: boolean;
  data_criacao: string;
  data_atualizacao: string;
}

export interface Licenca {
  id: number;
  usuario_id: number;
  tipo_licenca: 'contrato' | 'experiencia' | 'demonstracao';
  data_inicio: string;
  data_expiracao: string;
  dia_vencimento?: number;
  baseado_contratacao: boolean;
  intervalo: 'mensal' | 'trimestral' | 'semestral' | 'anual';
  limite_empresas: number;
  usuarios_adicionais: number;
  valor_parcela: number;
  bloqueada: boolean;
  renovacao_automatica: boolean;
  apenas_modelos_pdf: boolean;
  permite_token: boolean;
  permite_criar_modelos: boolean;
  permite_cadastrar_produtos: boolean;
  vencida: boolean;
  dias_para_vencer: number;
}

export interface UsuarioListItem {
  id: number;
  cliente: string;
  email: string;
  limite_empresas: number;
  empresas_ativas: number;
  data_inicio: string;
  data_expiracao: string;
  tipo_licenca: 'contrato' | 'experiencia' | 'demonstracao';
  bloqueada: boolean;
  vencida: boolean;
  dias_para_vencer: number;
}

export interface UsuarioDetail {
  usuario: Usuario;
  licenca: Licenca;
  empresas: Empresa[];
  integracoes: IntegracaoAPI[];
  tokens: TokenAPI[];
  estatisticas: {
    total_empresas: number;
    empresas_ativas: number;
    total_integracoes: number;
    integracoes_ativas: number;
  };
}

export interface CreateUsuarioData {
  // Dados do Cliente
  cnpj: string;
  razao_social: string;
  telefone: string;
  email: string;
  senha: string;
  
  // Dados da Licença
  tipo_licenca: 'contrato' | 'experiencia' | 'demonstracao';
  data_inicio: string;
  data_expiracao: string;
  dia_vencimento?: number;
  baseado_contratacao?: boolean;
  intervalo: 'mensal' | 'trimestral' | 'semestral' | 'anual';
  limite_empresas: number;
  usuarios_adicionais?: number;
  valor_parcela: number;
  bloqueada?: boolean;
  
  // Permissões
  renovacao_automatica?: boolean;
  apenas_modelos_pdf?: boolean;
  permite_token?: boolean;
  permite_criar_modelos?: boolean;
  permite_cadastrar_produtos?: boolean;
}

export interface UpdateUsuarioData {
  cnpj?: string;
  razao_social?: string;
  telefone?: string;
  email?: string;
  senha?: string;
  tipo_licenca?: 'contrato' | 'experiencia' | 'demonstracao';
  data_inicio?: string;
  data_expiracao?: string;
  dia_vencimento?: number;
  baseado_contratacao?: boolean;
  intervalo?: 'mensal' | 'trimestral' | 'semestral' | 'anual';
  limite_empresas?: number;
  usuarios_adicionais?: number;
  valor_parcela?: number;
  bloqueada?: boolean;
  renovacao_automatica?: boolean;
  apenas_modelos_pdf?: boolean;
  permite_token?: boolean;
  permite_criar_modelos?: boolean;
  permite_cadastrar_produtos?: boolean;
}

export interface UsuariosFilters {
  cliente?: string;
  email?: string;
  tipo_licenca?: 'contrato' | 'experiencia' | 'demonstracao';
  bloqueada?: boolean;
  page?: number;
  limit?: number;
}

export interface UsuariosSummary {
  vencidas_hoje: number;
  vencendo_3_dias: number;
  vencendo_7_dias: number;
  bloqueadas: number;
  ativas: number;
  total_licencas: number;
}

// ===== EMPRESA =====
export interface Empresa {
  id: number;
  usuario_id: number;
  nome_fantasia: string;
  razao_social: string;
  cnpj: string;
  inscricao_estadual?: string;
  cep: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  emails: string[];
  telefones: string[];
  ativa: boolean;
  data_criacao: string;
  data_atualizacao?: string;
}

export interface CreateEmpresaData {
  nome_fantasia: string;
  razao_social: string;
  cnpj: string;
  inscricao_estadual?: string;
  cep: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  emails: string[];
  telefones: string[];
}

export interface UpdateEmpresaData {
  nome_fantasia?: string;
  razao_social?: string;
  cnpj?: string;
  inscricao_estadual?: string;
  cep?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  emails?: string[];
  telefones?: string[];
  ativa?: boolean;
}

export interface EmpresasResponse {
  data: Empresa[];
  total: number;
  limite: number;
  disponivel: number;
}

// ===== INTEGRAÇÃO API =====
export interface IntegracaoAPI {
  id: number;
  usuario_id: number;
  provedor: 'eGestor' | 'Omie' | 'Bling' | 'Tiny' | 'Conta Azul' | 'Outro';
  nome_integracao: string;
  app_key: string;
  app_secret: string;
  token?: string;
  url_webhook?: string;
  ativa: boolean;
  status_conexao: 'conectado' | 'desconectado' | 'erro' | 'nunca_testado';
  data_ultima_conexao?: string;
  data_criacao: string;
  data_atualizacao?: string;
}

export interface CreateIntegracaoData {
  provedor: 'eGestor' | 'Omie' | 'Bling' | 'Tiny' | 'Conta Azul' | 'Outro';
  nome_integracao: string;
  app_key: string;
  app_secret: string;
  token?: string;
  url_webhook?: string;
}

export interface UpdateIntegracaoData {
  provedor?: 'eGestor' | 'Omie' | 'Bling' | 'Tiny' | 'Conta Azul' | 'Outro';
  nome_integracao?: string;
  app_key?: string;
  app_secret?: string;
  token?: string;
  url_webhook?: string;
  ativa?: boolean;
}

export interface TestarIntegracaoResponse {
  success: boolean;
  statusConexao: 'conectado' | 'desconectado' | 'erro';
  message: string;
  detalhes?: any;
}

// ===== TOKEN API =====
export interface TokenAPI {
  id: number;
  usuario_id: number;
  nome: string;
  tipo: 'producao' | 'desenvolvimento' | 'teste';
  token: string; // Mascarado no frontend (exceto ao criar)
  expiracao?: string;
  ativo: boolean;
  ultimo_uso?: string;
  data_criacao: string;
}

export interface CreateTokenData {
  nome: string;
  tipo: 'producao' | 'desenvolvimento' | 'teste';
  expiracao?: string; // ISO 8601 ou null para sem expiração
}

export interface CreateTokenResponse {
  success: true;
  message: string;
  data: {
    id: number;
    token: string; // Token completo - apenas retornado aqui!
    nome: string;
    tipo: 'producao' | 'desenvolvimento' | 'teste';
  };
}
