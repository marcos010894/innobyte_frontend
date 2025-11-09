import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import type { LicencaAuth } from '@/types/api.types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireMaster?: boolean;
  requireCliente?: boolean;
  requiredPermission?: keyof LicencaAuth;
}

/**
 * 🛡️ Componente de Rota Protegida
 * 
 * Protege rotas verificando:
 * - Se usuário está autenticado
 * - Se é do tipo correto (master ou cliente)
 * - Se tem a permissão necessária (para clientes)
 * - Se a licença está válida (para clientes)
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireMaster = false,
  requireCliente = false,
  requiredPermission,
}) => {
  const { isAuthenticated, isMaster, isCliente, temPermissao, licencaValida, loading } = useAuth();

  // Mostra loading enquanto carrega o usuário
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-primary mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  // 1. Verifica autenticação
  if (!isAuthenticated) {
    console.warn('⚠️ Usuário não autenticado, redirecionando para login');
    return <Navigate to="/login" replace />;
  }

  // 2. Verifica se requer Master
  if (requireMaster && !isMaster) {
    console.warn('⚠️ Acesso negado: rota requer usuário Master');
    return (
      <div className="flex items-center justify-center min-h-screen bg-red-50">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md text-center">
          <div className="text-red-500 text-6xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Acesso Negado</h2>
          <p className="text-gray-600 mb-4">
            Esta área é restrita para administradores do sistema.
          </p>
          <button
            onClick={() => window.history.back()}
            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  // 3. Verifica se requer Cliente
  if (requireCliente && !isCliente) {
    console.warn('⚠️ Acesso negado: rota requer usuário Cliente');
    return <Navigate to="/dashboard" replace />;
  }

  // 4. Verifica licença (para clientes)
  if (isCliente && !licencaValida()) {
    console.warn('⚠️ Licença inválida (bloqueada ou vencida)');
    return (
      <div className="flex items-center justify-center min-h-screen bg-yellow-50">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md text-center">
          <div className="text-yellow-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Licença Inválida</h2>
          <p className="text-gray-600 mb-4">
            Sua licença está vencida ou bloqueada. Entre em contato com o suporte para renovação.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => window.location.href = 'mailto:suporte@sistema.com'}
              className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors"
            >
              Entrar em Contato
            </button>
            <button
              onClick={() => window.history.back()}
              className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Voltar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 5. Verifica permissão específica (para clientes)
  if (requiredPermission && isCliente && !temPermissao(requiredPermission)) {
    console.warn(`⚠️ Permissão negada: ${requiredPermission}`);
    return (
      <div className="flex items-center justify-center min-h-screen bg-orange-50">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md text-center">
          <div className="text-orange-500 text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Permissão Negada</h2>
          <p className="text-gray-600 mb-4">
            Você não tem permissão para acessar esta funcionalidade. Entre em contato com o suporte para solicitar acesso.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => window.location.href = 'mailto:suporte@sistema.com'}
              className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors"
            >
              Solicitar Acesso
            </button>
            <button
              onClick={() => window.history.back()}
              className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Voltar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ✅ Tudo OK, renderiza o conteúdo
  return <>{children}</>;
};

export default ProtectedRoute;
