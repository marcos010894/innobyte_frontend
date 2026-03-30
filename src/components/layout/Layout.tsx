import { Outlet, useSearchParams } from 'react-router-dom';
import { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false); // Mobile
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false); // Desktop
  const [searchParams, setSearchParams] = useSearchParams();
  const oauthCode = searchParams.get('code');

  const closeOAuthModal = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('code');
    newParams.delete('state'); // Bling também envia state
    setSearchParams(newParams);
  };

  const copyCode = () => {
    if (oauthCode) {
      navigator.clipboard.writeText(oauthCode);
      // Opcionalmente usar um toast aqui se disponível
    }
  };


  return (
    <div className="flex h-screen overflow-hidden">
      {/* Modal de Código OAuth Bling */}
      {oauthCode && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4 transition-all animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 text-center border border-gray-100 animate-in zoom-in duration-300">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl">
              <i className="fas fa-check-circle"></i>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Autorização Concluída</h2>
            <p className="text-gray-500 mb-6 text-sm">O Bling gerou seu código. Copie-o abaixo e cole no Passo 3 da integração.</p>
            
            <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-3 mb-6 flex items-center justify-between group">
              <code className="text-blue-600 font-mono font-bold truncate max-w-[200px]">{oauthCode}</code>
              <button 
                onClick={copyCode}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95"
              >
                Copiar
              </button>
            </div>

            <button 
              onClick={closeOAuthModal}
              className="w-full bg-gray-900 hover:bg-black text-white font-bold py-3 rounded-xl transition-all"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
      {/* Overlay para mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`hidden lg:block transition-all duration-300 ${sidebarCollapsed ? 'w-0 overflow-hidden' : 'w-64'}`}>
        <Sidebar isOpen={true} onClose={() => {}} />
      </div>
      
      {/* Sidebar Mobile */}
      <div className="lg:hidden">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Botão Toggle Sidebar Desktop */}
      <button
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        className={`hidden lg:flex fixed top-20 z-50 bg-white border border-gray-300 rounded-r-lg px-2 py-3 shadow-lg hover:bg-gray-50 transition-all duration-300 items-center`}
        style={{ left: sidebarCollapsed ? '0' : '256px' }}
        title={sidebarCollapsed ? 'Mostrar menu' : 'Ocultar menu'}
      >
        <i className={`fas fa-chevron-${sidebarCollapsed ? 'right' : 'left'} text-gray-600`}></i>
      </button>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-100">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
