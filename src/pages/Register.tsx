import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import api from '@services/api';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { loadUser } = useAuth();
  
  const [formData, setFormData] = useState({
    razao_social: '',
    cnpj: '',
    email: '',
    senha: '', 
    confirmarSenha: '',
    telefone: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.senha !== formData.confirmarSenha) {
      setError('As senhas não coincidem');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        razao_social: formData.razao_social,
        cnpj: formData.cnpj,
        email: formData.email,
        senha: formData.senha,
        telefone: formData.telefone,
        tipo_licenca: 'experiencia',
        data_inicio: new Date().toISOString().split('T')[0],
        data_expiracao: new Date().toISOString().split('T')[0],
        intervalo: 'mensal',
        limite_empresas: 1,
        valor_parcela: 0
      };

      const response = await api.post('/subscriptions/register', payload);
      
      if (response.data.access_token) {
        localStorage.setItem('token', response.data.access_token);
        await loadUser();
        navigate('/');
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erro ao criar conta. Verifique os dados e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 transform transition-all">
        <div className="text-center mb-8">
          <div className="bg-blue-100 text-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-tag text-3xl"></i>
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Crie sua conta</h1>
          <p className="text-gray-500">Inicie seus 7 dias de teste grátis agora</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm flex items-center gap-2 border border-red-100">
            <i className="fas fa-exclamation-circle text-lg"></i>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Razão Social</label>
              <input 
                type="text" name="razao_social" required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                placeholder="Nome da sua empresa"
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">CNPJ</label>
              <input 
                type="text" name="cnpj" required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                placeholder="00.000.000/0000-00"
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">E-mail Corporativo</label>
            <input 
              type="email" name="email" required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
              placeholder="seu@email.com.br"
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Senha</label>
              <input 
                type="password" name="senha" required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                placeholder="••••••••"
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Confirmar Senha</label>
              <input 
                type="password" name="confirmarSenha" required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                placeholder="••••••••"
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Telefone</label>
            <input 
              type="text" name="telefone" required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
              placeholder="(00) 00000-0000"
              onChange={handleChange}
            />
          </div>

          <div className="bg-gray-50 p-4 rounded-xl border-2 border-dashed border-gray-200 mb-4">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Plano Selecionado</label>
            <div className="flex items-center justify-between">
              <span className="font-bold text-gray-700">Plano Pro - 7 dias de teste</span>
              <span className="text-blue-600 font-bold">Grátis</span>
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 transform transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                <i className="fas fa-check-circle"></i>
                Criar Minha Conta Grátis
              </>
            )}
          </button>
        </form>

        <p className="text-center mt-8 text-sm text-gray-500">
          Já tem uma conta? <a href="/login" className="text-blue-600 font-bold hover:underline">Faça login</a>
        </p>
      </div>
    </div>
  );
};

export default Register;
