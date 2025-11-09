import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  listarUsuariosAdicionais,
  deletarUsuarioAdicional,
  toggleAtivoUsuarioAdicional,
} from '../services/usuario-adicional.service';
import type { UsuarioAdicional } from '../types/usuario-adicional.types';

const UsuariosAdicionais: React.FC = () => {
  const [usuarios, setUsuarios] = useState<UsuarioAdicional[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [total, setTotal] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    carregarUsuarios();
  }, []);

  const carregarUsuarios = async () => {
    setLoading(true);
    setError('');
    console.log('🔵 Carregando usuários adicionais...');
    
    const result = await listarUsuariosAdicionais(0, 100);
    
    console.log('🔵 Resultado:', result);

    if (result.success && result.data) {
      console.log('✅ Usuários carregados:', result.data.data);
      setUsuarios(result.data.data);  // Backend retorna 'data' não 'items'
      setTotal(result.data.total);
    } else {
      console.error('❌ Erro ao carregar:', result.message);
      setError(result.message || 'Erro ao carregar usuários');
    }
    setLoading(false);
  };

  const handleToggleAtivo = async (id: number) => {
    const result = await toggleAtivoUsuarioAdicional(id);

    if (result.success) {
      toast.success('Status atualizado com sucesso!');
      carregarUsuarios();
    } else {
      toast.error(result.message || 'Erro ao atualizar status');
    }
  };

  const handleDeletar = async (id: number, nome: string) => {
    if (!window.confirm(`Tem certeza que deseja deletar o usuário "${nome}"?`)) {
      return;
    }

    const result = await deletarUsuarioAdicional(id);

    if (result.success) {
      toast.success('Usuário deletado com sucesso!');
      carregarUsuarios();
    } else {
      toast.error(result.message || 'Erro ao deletar usuário');
    }
  };

  const formatarData = (data: string | null) => {
    if (!data) return 'Nunca';
    return new Date(data).toLocaleString('pt-BR');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-gray-600">
          <i className="fas fa-spinner fa-spin text-2xl"></i>
          <p className="mt-2">Carregando usuários...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-600 hover:text-gray-800"
          >
            <i className="fas fa-arrow-left text-xl"></i>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Usuários Colaboradores</h1>
          </div>
        </div>
        
        <div className="bg-red-50 border-2 border-red-300 rounded-xl p-6 text-center">
          <i className="fas fa-exclamation-circle text-red-500 text-5xl mb-4"></i>
          <h3 className="text-xl font-bold text-red-800 mb-2">Erro ao carregar usuários</h3>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={carregarUsuarios}
            className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
          >
            <i className="fas fa-redo mr-2"></i>
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Usuários Colaboradores</h1>
          <p className="text-gray-600">
            Gerencie os usuários adicionais com acesso ao sistema ({total} total)
          </p>
        </div>
        <button
          onClick={() => navigate('/usuarios-adicionais/new')}
          className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <i className="fas fa-plus"></i>
          Novo Usuário
        </button>
      </div>

      {/* Tabela */}
      {!usuarios || usuarios.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-200">
          <i className="fas fa-users text-6xl text-gray-300 mb-4"></i>
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            Nenhum usuário adicional cadastrado
          </h3>
          <p className="text-gray-600 mb-6">
            Crie usuários colaboradores para dar acesso ao sistema
          </p>
          <button
            onClick={() => navigate('/usuarios-adicionais/new')}
            className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <i className="fas fa-plus mr-2"></i>
            Criar Primeiro Usuário
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                  Nome
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                  E-mail
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase">
                  Status
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase">
                  Último Acesso
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {usuarios && usuarios.map((usuario) => (
                <tr key={usuario.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <i className="fas fa-user text-blue-600"></i>
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{usuario.nome}</p>
                        <p className="text-xs text-gray-500">ID: {usuario.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-gray-700">{usuario.email}</p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                        usuario.ativo
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      <i className={`fas ${usuario.ativo ? 'fa-check-circle' : 'fa-times-circle'}`}></i>
                      {usuario.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <p className="text-sm text-gray-600">
                      {formatarData(usuario.ultimo_acesso)}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => navigate(`/usuarios-adicionais/edit/${usuario.id}`)}
                        className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        onClick={() => handleToggleAtivo(usuario.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          usuario.ativo
                            ? 'text-orange-600 hover:text-orange-800 hover:bg-orange-50'
                            : 'text-green-600 hover:text-green-800 hover:bg-green-50'
                        }`}
                        title={usuario.ativo ? 'Desativar' : 'Ativar'}
                      >
                        <i className={`fas ${usuario.ativo ? 'fa-ban' : 'fa-check'}`}></i>
                      </button>
                      <button
                        onClick={() => handleDeletar(usuario.id, usuario.nome)}
                        className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-lg transition-colors"
                        title="Deletar"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Info Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <i className="fas fa-info-circle text-blue-600 text-xl mt-0.5"></i>
        <div>
          <h4 className="font-bold text-blue-800 mb-1">Sobre Usuários Colaboradores</h4>
          <p className="text-sm text-blue-700">
            Usuários colaboradores compartilham a mesma licença da sua conta e podem ter
            permissões personalizadas. Eles podem acessar o sistema com login próprio.
          </p>
        </div>
      </div>
    </div>
  );
};

export default UsuariosAdicionais;
