import { useState } from 'react';

const ApiConfigForm = () => {
  const [apiConfig, setApiConfig] = useState({
    dadosEmissao: '',
    nomeCliente: '',
    fornecedorApi: '',
    tokenApi: '',
  });

  const handleChange = (field: string, value: string) => {
    setApiConfig((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
      <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
        <i className="fas fa-robot mr-2 text-primary"></i>
        🤖 Configurações de API
      </h3>

      <div className="space-y-4">
        {/* Dados de Emissão */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Dados de Emissão</label>
          <select
            value={apiConfig.dadosEmissao}
            onChange={(e) => handleChange('dadosEmissao', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-gray-900"
          >
            <option value="">Selecionar</option>
            <option value="api">Via API</option>
            <option value="manual">Manual</option>
            <option value="planilha">Importar Planilha</option>
          </select>
        </div>

        {/* Link de Ajuda */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
          <a href="#" className="text-sm text-primary hover:text-blue-700 flex items-center gap-2">
            <i className="fas fa-question-circle"></i>
            Precisa de ajuda? Clique aqui
          </a>
        </div>

        {/* Nome do Cliente */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Cliente</label>
          <input
            type="text"
            value={apiConfig.nomeCliente}
            onChange={(e) => handleChange('nomeCliente', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-gray-900"
            placeholder="Nome do cliente na API"
          />
        </div>

        {/* Fornecedor da API */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fornecedor da API</label>
          <select
            value={apiConfig.fornecedorApi}
            onChange={(e) => handleChange('fornecedorApi', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-gray-900"
          >
            <option value="">Selecionar</option>
            <option value="egestor">eGestor</option>
            <option value="omie">Omie</option>
            <option value="bling">Bling</option>
            <option value="tiny">Tiny ERP</option>
            <option value="sap">SAP</option>
            <option value="totvs">TOTVS</option>
            <option value="outro">Outro</option>
          </select>
        </div>

        {/* Token da API */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Token da API</label>
          <input
            type="text"
            value={apiConfig.tokenApi}
            onChange={(e) => handleChange('tokenApi', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
            placeholder="cole-o-token-aqui..."
          />
          <p className="text-xs text-gray-500 mt-1">
            <i className="fas fa-info-circle mr-1"></i>
            Liberado no painel do cliente?
          </p>
        </div>

        {/* Test Connection Button */}
        <button className="w-full px-4 py-2 bg-accent text-white rounded-md hover:bg-yellow-600 transition-colors flex items-center justify-center gap-2">
          <i className="fas fa-plug"></i>
          Testar Conexão
        </button>
      </div>
    </div>
  );
};

export default ApiConfigForm;
