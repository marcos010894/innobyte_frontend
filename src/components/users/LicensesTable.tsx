interface License {
  id: number;
  cliente: string;
  email: string;
  plano: string;
  limiteEmpresas: number;
  dataInicio: string;
  dataExpiracao: string;
  formaPagamento: string;
  preco: number;
  repasse: boolean;
  bloqueada: boolean;
  isenta: boolean;
}

interface LicensesTableProps {
  onSelectLicense: (license: License) => void;
  usuarios?: any[];
  loading?: boolean;
  onDelete?: (usuarioId: number) => void;
}

const LicensesTable = ({ onSelectLicense, usuarios = [], loading = false, onDelete }: LicensesTableProps) => {
  // Converte dados da API para o formato da tabela
  const licenses: License[] = usuarios.map((user) => ({
    id: user.id,
    cliente: user.cliente || user.razao_social || 'N/A',
    email: user.email || '',
    plano: user.tipo_licenca?.toUpperCase() || 'PADRÃO',
    limiteEmpresas: user.limite_empresas || 0,
    dataInicio: user.data_inicio || '',
    dataExpiracao: user.data_expiracao || '',
    formaPagamento: 'Cobrança Manual', // API não tem esse campo
    preco: user.valor_parcela || 0,
    repasse: true, // API não tem esse campo
    bloqueada: user.bloqueada || false,
    isenta: false, // API não tem esse campo
  }));

  const isExpired = (dataExpiracao: string) => {
    const [dia, mes, ano] = dataExpiracao.split('/');
    const expirationDate = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
    return expirationDate < new Date();
  };

  const handleDelete = async (license: License) => {
    const confirma = window.confirm(
      `Tem certeza que deseja excluir o cliente "${license.cliente}"?\n\n` +
      `Esta ação é irreversível e irá também deletar:\n` +
      `- Licença do cliente\n` +
      `- Usuários adicionais vinculados\n` +
      `- Empresas cadastradas`
    );
    
    if (confirma && onDelete) {
      onDelete(license.id);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
      <div className="p-3 sm:p-4 border-b bg-gray-50">
        <h2 className="text-base sm:text-lg font-bold text-gray-800 flex items-center">
          <i className="fas fa-table mr-2 text-primary"></i>
          Resultados da Pesquisa de Licenças
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Cliente
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                E-mail
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Contrato
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Data Início
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Data Expiração
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Forma Pagamento
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Preço
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Repasse
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Bloqueada
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Isenta
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={11} className="px-4 py-8 text-center text-gray-500">
                  <i className="fas fa-spinner fa-spin text-2xl mb-2"></i>
                  <p>Carregando usuários...</p>
                </td>
              </tr>
            ) : licenses.length === 0 ? (
              <tr>
                <td colSpan={11} className="px-4 py-8 text-center text-gray-500">
                  <i className="fas fa-inbox text-3xl mb-2"></i>
                  <p>Nenhum usuário encontrado</p>
                </td>
              </tr>
            ) : (
              licenses.map((license) => (
                <tr
                  key={license.id}
                  className={`hover:bg-gray-50 transition-colors ${
                    isExpired(license.dataExpiracao) ? 'bg-red-50' : ''
                  }`}
                >
                <td className="px-4 py-3 text-sm text-gray-900 font-medium">{license.cliente}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{license.email}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded">
                    {license.plano}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{license.dataInicio}</td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  <span className={isExpired(license.dataExpiracao) ? 'text-red-600 font-semibold' : ''}>
                    {license.dataExpiracao}
                    {isExpired(license.dataExpiracao) && (
                      <i className="fas fa-exclamation-triangle ml-2 text-red-500"></i>
                    )}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{license.formaPagamento}</td>
                <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">
                  R$ {license.preco.toFixed(2)}
                </td>
                <td className="px-4 py-3 text-center">
                  {license.repasse ? (
                    <i className="fas fa-check text-success text-lg"></i>
                  ) : (
                    <i className="fas fa-times text-red-500 text-lg"></i>
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  {license.bloqueada ? (
                    <i className="fas fa-check text-success text-lg"></i>
                  ) : (
                    <i className="fas fa-times text-red-500 text-lg"></i>
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  {license.isenta ? (
                    <i className="fas fa-check text-success text-lg"></i>
                  ) : (
                    <i className="fas fa-times text-red-500 text-lg"></i>
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => onSelectLicense(license)}
                      className="p-2 text-primary hover:bg-blue-50 rounded transition-colors"
                      title="Editar"
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button
                      onClick={() => handleDelete(license)}
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

      {/* Pagination */}
      <div className="p-4 border-t bg-gray-50 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Mostrando <strong>1-{licenses.length}</strong> de <strong>{licenses.length}</strong> registros
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 transition-colors text-sm">
            <i className="fas fa-chevron-left"></i>
          </button>
          <button className="px-3 py-1 bg-primary text-white rounded hover:bg-blue-600 transition-colors text-sm">
            1
          </button>
          <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 transition-colors text-sm">
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LicensesTable;
