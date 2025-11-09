// 🔐 Tipos para Autenticação

// Tipo de usuário
export type TipoUsuario = 'master' | 'cliente';

// Dados da licença do cliente
export interface Licenca {
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

// Usuário Master
export interface UsuarioMaster {
  id: number;
  email: string;
  nome: string;
  foto_perfil: string | null;
  tipo: 'master';
  ativo: boolean;
}

// Usuário Cliente
export interface UsuarioCliente {
  id: number;
  email: string;
  razao_social: string;
  cnpj: string;
  telefone: string;
  tipo: 'cliente';
  ativo: boolean;
  licenca: Licenca;
}

// União de tipos
export type Usuario = UsuarioMaster | UsuarioCliente;

// Resposta de login
export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: Usuario;
}

// Credenciais de login
export interface LoginCredentials {
  email: string;
  password: string;
}

// Permissões específicas
export type Permissao = 
  | 'permite_token'
  | 'permite_criar_modelos'
  | 'permite_cadastrar_produtos'
  | 'apenas_modelos_pdf';
