const ApiStatusSection = () => {
  return (
    <div className="dashboard-card bg-white rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Integração com ERP</h2>
        <button className="bg-primary text-white px-4 py-2 rounded-md flex items-center hover:bg-blue-600 transition-colors">
          <i className="fas fa-sync-alt mr-2"></i>
          Sincronizar
        </button>
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-md bg-green-100 flex items-center justify-center">
              <i className="fas fa-plug text-green-500"></i>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium">eGestor</h3>
              <p className="text-xs text-gray-500">Status da conexão</p>
            </div>
          </div>
          <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Ativa</span>
        </div>

        <div className="bg-gray-50 p-4 rounded-md">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Produtos sincronizados</p>
              <p className="font-medium">1,248</p>
            </div>
            <div>
              <p className="text-gray-500">Última sincronização</p>
              <p className="font-medium">Hoje, 14:30</p>
            </div>
            <div>
              <p className="text-gray-500">Próxima sincronização</p>
              <p className="font-medium">Automática (15min)</p>
            </div>
            <div>
              <p className="text-gray-500">Token API</p>
              <p className="font-medium">Válido</p>
            </div>
          </div>
        </div>

        <div className="flex space-x-2">
          <button className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-md flex items-center justify-center hover:bg-gray-200 transition-colors">
            <i className="fas fa-cog mr-2"></i>
            Configurar API
          </button>
          <button className="flex-1 bg-success text-white py-2 rounded-md flex items-center justify-center hover:bg-green-600 transition-colors">
            <i className="fas fa-download mr-2"></i>
            Exportar Dados
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApiStatusSection;
