import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header = ({ onMenuClick }: HeaderProps) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="bg-white shadow-sm z-10">
      <div className="flex items-center justify-between px-3 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center flex-1 gap-2 sm:gap-0">
          {/* Botão de menu mobile */}
          <button 
            onClick={onMenuClick}
            className="text-gray-500 focus:outline-none lg:hidden p-2 hover:bg-gray-100 rounded-md"
          >
            <i className="fas fa-bars text-xl"></i>
          </button>

          {/* Busca - esconde em telas muito pequenas */}
          <div className="relative w-full max-w-md hidden sm:block">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <i className="fas fa-search text-gray-500"></i>
            </span>
            <input
              className="w-full pl-10 pr-4 rounded-md border border-gray-300 bg-gray-100 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              type="text"
              placeholder="Buscar produto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          {/* Notificações */}
          <div className="relative">
            <button className="flex text-gray-600 focus:outline-none p-2 hover:bg-gray-100 rounded-md">
              <i className="fas fa-bell text-lg sm:text-xl"></i>
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500"></span>
            </button>
          </div>

          {/* Menu do usuário */}
          <div className="relative ml-1 sm:ml-2">
            <button 
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="relative flex items-center focus:outline-none gap-2 p-1 sm:p-2 hover:bg-gray-100 rounded-md"
            >
              <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm">
                {user?.nome ? user.nome.charAt(0).toUpperCase() : 'U'}
              </div>
              <span className="text-gray-700 text-sm hidden md:block">{user?.nome || 'Usuário'}</span>
              <i className="fas fa-chevron-down text-gray-500 text-xs hidden md:block"></i>
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowUserMenu(false)}
                ></div>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-20">
                  <button 
                    onClick={() => navigate('/profile')}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                  >
                    <i className="fas fa-user text-gray-500"></i>
                    Meu Perfil
                  </button>
                  <button 
                    onClick={() => navigate('/settings')}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                  >
                    <i className="fas fa-cog text-gray-500"></i>
                    Configurações
                  </button>
                  <hr className="my-2" />
                  <button 
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <i className="fas fa-sign-out-alt"></i>
                    Sair
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
