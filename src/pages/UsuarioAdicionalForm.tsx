import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  criarUsuarioAdicional,
  atualizarUsuarioAdicional,
  buscarUsuarioAdicional,
} from '../services/usuario-adicional.service';
import type {
  UsuarioAdicionalCreate,
  PermissoesAdicional,
} from '../types/usuario-adicional.types';

const UsuarioAdicionalForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEditing);
  const [form, setForm] = useState<UsuarioAdicionalCreate>({
    nome: '',
    email: '',
    senha: '',
    ativo: true,
    permissoes: {
      pode_criar_modelos: true,
      pode_editar_produtos: true,
      pode_visualizar_relatorios: false,
    },
  });

  useEffect(() => {
    if (isEditing && id) {
      carregarUsuario(parseInt(id));
    }
  }, [id, isEditing]);

  const carregarUsuario = async (userId: number) => {
    setLoadingData(true);
    const result = await buscarUsuarioAdicional(userId);

    if (result.success && result.data) {
      setForm({
        nome: result.data.nome,
        email: result.data.email,
        senha: '', // Não preencher senha ao editar
        ativo: result.data.ativo,
        permissoes: result.data.permissoes,
      });
    } else {
      toast.error('Erro ao carregar usuário: ' + result.message);
      navigate('/usuarios-adicionais');
    }
    setLoadingData(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isEditing && id) {
      // Atualizar
      const dados = { ...form };
      if (!dados.senha) {
        delete (dados as any).senha; // Não enviar senha se estiver vazia
      }

      const result = await atualizarUsuarioAdicional(parseInt(id), dados);

      if (result.success) {
        toast.success('Usuário atualizado com sucesso!');
        navigate('/usuarios-adicionais');
      } else {
        toast.error(result.message || 'Erro ao atualizar usuário');
      }
    } else {
      // Criar
      const result = await criarUsuarioAdicional(form);

      if (result.success) {
        toast.success('Usuário criado com sucesso!');
        navigate('/usuarios-adicionais');
      } else {
        toast.error(result.message || 'Erro ao criar usuário');
      }
    }

    setLoading(false);
  };

  const handlePermissaoChange = (permissao: keyof PermissoesAdicional) => {
    setForm({
      ...form,
      permissoes: {
        ...form.permissoes,
        [permissao]: !form.permissoes?.[permissao],
      },
    });
  };

  if (loadingData) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-gray-600">
          <i className="fas fa-spinner fa-spin text-2xl"></i>
          <p className="mt-2">Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/usuarios-adicionais')}
          className="text-gray-600 hover:text-gray-800"
        >
          <i className="fas fa-arrow-left text-xl"></i>
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {isEditing ? 'Editar Usuário Colaborador' : 'Novo Usuário Colaborador'}
          </h1>
          <p className="text-gray-600">
            {isEditing
              ? 'Atualize as informações do usuário'
              : 'Crie um novo usuário colaborador para acessar o sistema'}
          </p>
        </div>
      </div>

      {/* Formulário */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 space-y-6">
        {/* Informações Básicas */}
        <div>
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <i className="fas fa-user text-blue-600"></i>
            Informações Básicas
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome Completo *
              </label>
              <input
                type="text"
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900"
                placeholder="Ex: João Silva"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                E-mail *
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900"
                placeholder="usuario@empresa.com"
                required
              />
            </div>
          </div>
        </div>

        {/* Senha */}
        <div>
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <i className="fas fa-lock text-blue-600"></i>
            Segurança
          </h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Senha {isEditing && '(deixe em branco para manter a atual)'}
            </label>
            <input
              type="password"
              value={form.senha}
              onChange={(e) => setForm({ ...form, senha: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900"
              placeholder="Mínimo 8 caracteres"
              required={!isEditing}
              minLength={8}
            />
            <p className="text-xs text-gray-500 mt-1">
              A senha deve ter no mínimo 8 caracteres
            </p>
          </div>
        </div>

        {/* Status */}
        <div>
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <i className="fas fa-toggle-on text-blue-600"></i>
            Status
          </h3>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.ativo}
              onChange={(e) => setForm({ ...form, ativo: e.target.checked })}
              className="w-5 h-5 text-primary rounded focus:ring-primary"
            />
            <div>
              <p className="font-medium text-gray-800">Usuário Ativo</p>
              <p className="text-sm text-gray-600">
                Usuários inativos não podem fazer login no sistema
              </p>
            </div>
          </label>
        </div>

        {/* Permissões */}
        <div>
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <i className="fas fa-key text-blue-600"></i>
            Permissões
          </h3>
          <div className="space-y-3">
            <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="checkbox"
                checked={form.permissoes?.pode_criar_modelos || false}
                onChange={() => handlePermissaoChange('pode_criar_modelos')}
                className="w-5 h-5 text-primary rounded focus:ring-primary"
              />
              <div className="flex-1">
                <p className="font-medium text-gray-800">Criar e Editar Modelos</p>
                <p className="text-sm text-gray-600">
                  Permitir criar novos modelos de etiquetas e editar existentes
                </p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="checkbox"
                checked={form.permissoes?.pode_editar_produtos || false}
                onChange={() => handlePermissaoChange('pode_editar_produtos')}
                className="w-5 h-5 text-primary rounded focus:ring-primary"
              />
              <div className="flex-1">
                <p className="font-medium text-gray-800">Cadastrar e Editar Produtos</p>
                <p className="text-sm text-gray-600">
                  Permitir gerenciar o cadastro de produtos no sistema
                </p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="checkbox"
                checked={form.permissoes?.pode_visualizar_relatorios || false}
                onChange={() => handlePermissaoChange('pode_visualizar_relatorios')}
                className="w-5 h-5 text-primary rounded focus:ring-primary"
              />
              <div className="flex-1">
                <p className="font-medium text-gray-800">Visualizar Relatórios</p>
                <p className="text-sm text-gray-600">
                  Permitir acesso aos relatórios e estatísticas do sistema
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Botões */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={() => navigate('/usuarios-adicionais')}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            disabled={loading}
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Salvando...
              </>
            ) : isEditing ? (
              'Atualizar Usuário'
            ) : (
              'Criar Usuário'
            )}
          </button>
        </div>
      </form>

      {/* Info */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3">
        <i className="fas fa-lightbulb text-yellow-600 text-xl mt-0.5"></i>
        <div>
          <h4 className="font-bold text-yellow-800 mb-1">Dica</h4>
          <p className="text-sm text-yellow-700">
            Os usuários colaboradores compartilham a licença da sua conta e só podem
            acessar as funcionalidades que você permitir.
          </p>
        </div>
      </div>
    </div>
  );
};

export default UsuarioAdicionalForm;
