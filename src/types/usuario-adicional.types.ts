/**
 * Tipos para Usuários Adicionais
 */

export interface PermissoesAdicional {
  pode_criar_modelos?: boolean;
  pode_editar_produtos?: boolean;
  pode_visualizar_relatorios?: boolean;
  [key: string]: boolean | undefined;
}

export interface UsuarioAdicional {
  id: number;
  usuario_id?: number;
  nome: string;
  email: string;
  ativo: boolean;
  permissoes?: PermissoesAdicional;
  data_criacao?: string;  // Backend retorna data_criacao
  criado_em?: string;
  atualizado_em?: string;
  ultimo_acesso: string | null;
}

export interface UsuarioAdicionalCreate {
  nome: string;
  email: string;
  senha: string;
  ativo?: boolean;
  permissoes?: PermissoesAdicional;
}

export interface UsuarioAdicionalUpdate {
  nome?: string;
  email?: string;
  senha?: string;
  ativo?: boolean;
  permissoes?: PermissoesAdicional;
}

export interface UsuarioAdicionalListResponse {
  data: UsuarioAdicional[];  // Backend retorna 'data' não 'items'
  total: number;
}
