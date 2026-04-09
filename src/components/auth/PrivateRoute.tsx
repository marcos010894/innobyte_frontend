import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Lógica de Bloqueio por Atraso (> 3 dias)
  const isBloqueadaPorAtraso = user?.licenca && user.licenca.dias_para_vencer < -3;
  const realBloqueada = user?.licenca?.bloqueada || isBloqueadaPorAtraso;

  // Se o usuário estiver bloqueado e tentando acessar qualquer página que NÃO seja o dashboard ('/')
  if (realBloqueada && location.pathname !== '/') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default PrivateRoute;
