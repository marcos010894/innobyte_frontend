import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

type TipoLogin = 'master' | 'cliente';

const LoginPage: React.FC = () => {
  const [tipoLogin, setTipoLogin] = useState<TipoLogin>('cliente');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { loginMaster, loginCliente } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    console.log('🔵 Iniciando login...', { tipoLogin, email });

    try {
      const result = tipoLogin === 'master'
        ? await loginMaster(email, senha)
        : await loginCliente(email, senha);

      console.log('🔵 Resultado do login:', result);

      if (result.success) {
        console.log('✅ Login bem-sucedido, redirecionando para /...');
        navigate('/');
        console.log('✅ Navigate chamado!');
      } else {
        console.log('❌ Login falhou:', result.message);
        setError(result.message || 'Erro ao fazer login');
      }
    } catch (err: any) {
      console.error('❌ Exceção no login:', err);
      setError(err.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
        {/* Logo ou Título */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Sistema de Etiquetas
          </h1>
          <p className="text-gray-600">
            Bem-vindo de volta!
          </p>
        </div>

        {/* Alternador de Tipo de Login */}
        <div className="flex rounded-lg bg-gray-100 p-1 mb-6">
          <button
            type="button"
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
              tipoLogin === 'cliente'
                ? 'bg-white text-primary shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
            onClick={() => setTipoLogin('cliente')}
          >
            👤 Cliente
          </button>
          <button
            type="button"
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
              tipoLogin === 'master'
                ? 'bg-white text-primary shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
            onClick={() => setTipoLogin('master')}
          >
            👑 Administrador
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* E-mail */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900"
              placeholder={tipoLogin === 'cliente' ? 'seu@email.com' : 'admin@sistema.com'}
              required
              disabled={loading}
            />
          </div>

          {/* Senha */}
          <div>
            <label htmlFor="senha" className="block text-sm font-medium text-gray-700 mb-1">
              Senha
            </label>
            <input
              id="senha"
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900"
              placeholder="••••••••"
              required
              disabled={loading}
            />
          </div>

          {/* Mensagem de Erro */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              <span className="font-medium">⚠️ Erro:</span> {error}
            </div>
          )}

          {/* Botão de Login */}
          <button
            type="submit"
            className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Entrando...
              </span>
            ) : (
              `Entrar ${tipoLogin === 'cliente' ? '👤' : '👑'}`
            )}
          </button>
        </form>

        {/* Informações adicionais */}
        <div className="mt-6 text-center text-sm text-gray-600">
          {tipoLogin === 'cliente' ? (
            <p>
              Problemas com sua conta?{' '}
              <a href="#" className="text-primary hover:underline">
                Entre em contato
              </a>
            </p>
          ) : (
            <p className="text-xs text-gray-500">
              Acesso restrito para administradores do sistema
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
