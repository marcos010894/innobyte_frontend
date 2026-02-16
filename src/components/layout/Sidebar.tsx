import { NavLink } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const { user } = useAuth();
  const isMaster = user?.tipo === 'master' || user?.tipo === 'admin';
  const isCliente = user?.tipo === 'cliente';

  const menuItems = [
    {
      section: 'Principal',
      items: [
        { path: '/', icon: 'fa-tachometer-alt', label: 'Dashboard' },
        { path: '/templates', icon: 'fa-layer-group', label: 'Modelos Salvos' },
        { path: '/editor', icon: 'fa-edit', label: 'Criador de Modelos' },
        { path: '/print', icon: 'fa-print', label: 'Impressão' },
        { path: '/api-integration', icon: 'fa-database', label: 'Integração API' },
      ],
    },
    {
      section: 'Gestão',
      showOnlyForCliente: true, // Esta seção é só para clientes
      items: [
        { path: '/usuarios-adicionais', icon: 'fa-user-friends', label: 'Colaboradores' },
      ],
    },
    {
      section: 'Gestão',
      showOnlyForMaster: true, // Esta seção é só para master
      items: [
        { path: '/users', icon: 'fa-users', label: 'Usuários e Licenças' },
        //{ path: '/history', icon: 'fa-history', label: 'Histórico' },
      ],
    },
    {
      section: 'Configurações',
      items: [
        //{ path: '/settings', icon: 'fa-cog', label: 'Configurações' },
        { path: '/profile', icon: 'fa-user-circle', label: 'Perfil' },
      ],
    },
  ];

  // Filtra seções baseado no tipo de usuário
  const filteredMenuItems = menuItems.filter(section => {
    if (section.showOnlyForMaster && !isMaster) {
      return false; // Esconde seção "Gestão" master para clientes
    }
    if (section.showOnlyForCliente && !isCliente) {
      return false; // Esconde seção "Gestão" cliente para masters
    }
    return true;
  });

  return (
    <>
      {/* Sidebar Desktop e Mobile */}
      <div 
        className={`
          sidebar bg-white shadow-md h-full overflow-y-auto
          fixed lg:static inset-y-0 left-0 z-50
          w-64 transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Header do Sidebar */}
        <div className="p-4 border-b flex items-center justify-between">
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-primary flex items-center">
              <i className="fas fa-tags mr-2"></i>
              Innobyte
            </h1>
            <p className="text-xs text-gray-500 mt-1 hidden sm:block">Sistema de emissão de etiquetas</p>
          </div>
          {/* Botão de fechar (só mobile) */}
          <button
            onClick={onClose}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-md"
          >
            <i className="fas fa-times text-gray-500"></i>
          </button>
        </div>

        {/* Menu de Navegação */}
        <nav className="mt-4 pb-4">
          {filteredMenuItems.map((section, idx) => (
            <div key={idx}>
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase mt-6 first:mt-0">
                {section.section}
              </div>
              {section.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose} // Fecha o menu ao clicar em um link (mobile)
                  className={({ isActive }) =>
                    `nav-link ${isActive ? 'nav-link-active' : ''}`
                  }
                >
                  <i className={`fas ${item.icon} mr-3 ${item.path === '/' ? 'text-primary' : ''}`}></i>
                  {item.label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
