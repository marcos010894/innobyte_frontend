import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { login as loginService, loginCliente, loginAdicional } from '../services/auth.service';

type TipoLogin = 'master' | 'cliente' | 'adicional';

const Login: React.FC = () => {
  const [tipoLogin, setTipoLogin] = useState<TipoLogin>('master');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { loadUser } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Chama o service correto baseado no tipo de login
    let result;
    if (tipoLogin === 'master') {
      result = await loginService(email, password);
    } else if (tipoLogin === 'cliente') {
      result = await loginCliente(email, password);
    } else {
      result = await loginAdicional(email, password);
    }

    if (result.success) {
      // Se marcou "Lembrar-me", pode salvar preferência futuramente
      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      }
      
      // Carrega os dados do usuário no contexto
      await loadUser();
      
      // Redireciona para dashboard
      navigate('/');
    } else {
      setError(result.message || 'Erro ao fazer login. Tente novamente.');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-blue-500 to-blue-700 flex items-center justify-center p-4">
      {/* Container Principal */}
      <div className="w-full max-w-md">
        {/* Card de Login */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header com Logo */}
          <div className="bg-gradient-to-r from-primary to-blue-600 p-8 text-center">
            <div className="inline-block bg-white rounded-full p-4 mb-4">
              <i className="fas fa-tag text-primary text-4xl"></i>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Innobyte Etiquetas</h1>
            <p className="text-blue-100">Sistema de Gerenciamento</p>
          </div>

          {/* Formulário */}
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">Bem-vindo de volta!</h2>
            <p className="text-gray-600 text-center mb-6">Faça login para continuar</p>

            {/* Alternador de Tipo de Login */}
            <div className="grid grid-cols-3 rounded-lg bg-gray-100 p-1 mb-6 gap-1">
              <button
                type="button"
                className={`py-2 px-3 rounded-md font-medium transition-all text-sm ${
                  tipoLogin === 'master'
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
                onClick={() => setTipoLogin('master')}
              >
                👑 Admin
              </button>
              <button
                type="button"
                className={`py-2 px-3 rounded-md font-medium transition-all text-sm ${
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
                className={`py-2 px-3 rounded-md font-medium transition-all text-sm ${
                  tipoLogin === 'adicional'
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
                onClick={() => setTipoLogin('adicional')}
              >
                👥 Colaborador
              </button>
            </div>

            {/* Mensagem de Erro */}
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <i className="fas fa-exclamation-circle text-red-500 mt-0.5"></i>
                <div className="flex-1">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* E-mail */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  E-mail
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className="fas fa-envelope text-gray-400"></i>
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 transition-all"
                    placeholder="seu@email.com.br"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Senha */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Senha
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className="fas fa-lock text-gray-400"></i>
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 transition-all"
                    placeholder="••••••••"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Lembrar-me e Esqueci a senha */}
              <div className="flex items-center justify-between">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded"
                    disabled={loading}
                  />
                  <span className="ml-2 text-sm text-gray-600">Lembrar-me</span>
                </label>
              </div>

              {/* Botão de Login */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-4 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all transform ${
                  loading ? 'opacity-70 cursor-not-allowed' : 'hover:scale-[1.02]'
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <i className="fas fa-spinner fa-spin"></i>
                    Entrando...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <i className="fas fa-sign-in-alt"></i>
                    Entrar
                  </span>
                )}
              </button>
            </form>

            {/* Divisor */}
            
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-8 py-4 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-600">
              Não tem uma conta?{' '}
              <button className="text-primary hover:text-blue-700 font-semibold transition-colors">
                Solicite acesso
              </button>
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 text-center">
          <p className="text-white text-sm">
            © 2025 Innobyte Etiquetas. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
