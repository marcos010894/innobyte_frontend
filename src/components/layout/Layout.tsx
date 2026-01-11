import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false); // Mobile
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false); // Desktop

  return (
    <div className="flex h-screen overflow-hidden">
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
