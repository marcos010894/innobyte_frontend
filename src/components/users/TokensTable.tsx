import { useState } from 'react';

interface Token {
  id: number;
  nomeEmissor: string;
  cnpjCpf: string;
  token: string;
}

const TokensTable = () => {
  const [tokens, setTokens] = useState<Token[]>([
    {
      id: 1,
      nomeEmissor: 'ANA CRISTINA PRODUTOS LTDA',
      cnpjCpf: '090729000180',
      token: '74d81203403a4f2e8b1c5d6e7f8a9b0c',
    },
    {
      id: 2,
      nomeEmissor: 'Rogério Bernardino',
      cnpjCpf: '000000000100',
      token: '0c3260c6d9944a1b2c3d4e5f6a7b8c9d',
    },
    {
      id: 3,
      nomeEmissor: 'CECILIA PAPELARIA',
      cnpjCpf: '000000000200',
      token: 'd8d12e95a987456123456789abcdef01',
    },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newToken, setNewToken] = useState({
    nomeEmissor: '',
    cnpjCpf: '',
    token: '',
  });

  const handleAddToken = () => {
    if (newToken.nomeEmissor && newToken.cnpjCpf && newToken.token) {
      setTokens([
        ...tokens,
        {
          id: tokens.length + 1,
          ...newToken,
        },
      ]);
      setNewToken({ nomeEmissor: '', cnpjCpf: '', token: '' });
      setShowAddModal(false);
    }
  };

  const handleDeleteToken = (id: number) => {
    if (confirm('Tem certeza que deseja excluir este token?')) {
      setTokens(tokens.filter((token) => token.id !== id));
    }
  };

  const maskToken = (token: string) => {
    if (token.length > 12) {
      return token.substring(0, 12) + '...';
    }
    return token;
  };

  return (
    <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-800 flex items-center">
          <i className="fas fa-list mr-2 text-primary"></i>
          📄 Listagem de Token // API // Clientes
        </h3>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-success text-white rounded-md hover:bg-green-600 transition-colors flex items-center gap-2"
        >
          <i className="fas fa-plus"></i>
          Novo
        </button>
      </div>

      {/* Add Token Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Adicionar Novo Token</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do Emissor <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newToken.nomeEmissor}
                  onChange={(e) => setNewToken({ ...newToken, nomeEmissor: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-gray-900"
                  placeholder="Nome do emissor"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CNPJ/CPF do Emissor <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newToken.cnpjCpf}
                  onChange={(e) => setNewToken({ ...newToken, cnpjCpf: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-gray-900"
                  placeholder="00000000000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Token <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newToken.token}
                  onChange={(e) => setNewToken({ ...newToken, token: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
                  placeholder="token-aqui..."
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleAddToken}
                className="flex-1 px-4 py-2 bg-success text-white rounded-md hover:bg-green-600 transition-colors"
              >
                Adicionar
              </button>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewToken({ nomeEmissor: '', cnpjCpf: '', token: '' });
                }}
                className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tokens Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Nome do Emissor
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                CNPJ/CPF do Emissor
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Token
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tokens.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                  <i className="fas fa-inbox text-4xl mb-2 block"></i>
                  Nenhum token cadastrado
                </td>
              </tr>
            ) : (
              tokens.map((token) => (
                <tr key={token.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm text-gray-900">{token.nomeEmissor}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 font-mono">{token.cnpjCpf}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 font-mono">
                    <span className="inline-flex items-center gap-2">
                      {maskToken(token.token)}
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(token.token);
                          alert('Token copiado!');
                        }}
                        className="text-primary hover:text-blue-700 transition-colors"
                        title="Copiar token"
                      >
                        <i className="fas fa-copy"></i>
                      </button>
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        className="p-2 text-primary hover:bg-blue-50 rounded transition-colors"
                        title="Editar"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        onClick={() => handleDeleteToken(token.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Excluir"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TokensTable;
