import React, { useState, useEffect } from 'react';
import { useAuth } from '@hooks/useAuth';
import * as integracoesService from '@/services/integracoes.service';
import * as odooService from '@/services/odoo.service';
import type { IntegracaoAPI } from '@/types/api.types';
import type {
  OdooProduto,
  OdooNotaFiscalHeader,
  OdooMovimentacao,
} from '@/services/odoo.service';

const OdooIntegration: React.FC = () => {
  const { user } = useAuth();

  // Estados principais
  const [integracoes, setIntegracoes] = useState<IntegracaoAPI[]>([]);
  const [selectedIntegracao, setSelectedIntegracao] = useState<IntegracaoAPI | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Estados de consulta
  const [produtosPreview, setProdutosPreview] = useState<OdooProduto[]>([]);
  const [ultimaNota, setUltimaNota] = useState<OdooNotaFiscalHeader | null>(null);
  const [ultimaMovimentacao, setUltimaMovimentacao] = useState<OdooMovimentacao | null>(null);
  const [isLoadingInfo, setIsLoadingInfo] = useState(false);

  // Form de nova integração
  const [formData, setFormData] = useState({ nome_integracao: '', app_key: '' });

  useEffect(() => {
    if (user?.id) loadIntegracoes();
  }, [user?.id]);

  const loadIntegracoes = async () => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      const response = await integracoesService.getIntegracoes(user.id);
      if (response.success && response.data) {
        const odooIntegracoes = response.data.data.filter((i) => i.provedor === 'Odoo');
        setIntegracoes(odooIntegracoes);
        if (!selectedIntegracao) {
          const ativa = odooIntegracoes.find((i) => i.ativa);
          if (ativa) setSelectedIntegracao(ativa);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateIntegracao = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    setIsLoading(true);
    setMessage(null);
    try {
      const response = await integracoesService.createIntegracao(user.id, {
        provedor: 'Odoo',
        nome_integracao: formData.nome_integracao || 'Odoo',
        app_key: formData.app_key,
        app_secret: '', // Odoo não usa app_secret
      });
      if (response.success && response.data) {
        setMessage({ type: 'success', text: 'Integração criada com sucesso!' });
        setShowForm(false);
        setFormData({ nome_integracao: '', app_key: '' });
        await loadIntegracoes();
        setSelectedIntegracao(response.data);
      } else {
        setMessage({ type: 'error', text: response.message || 'Erro ao criar integração' });
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Erro ao criar integração' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestarConexao = async () => {
    if (!selectedIntegracao) return;
    setIsTesting(true);
    setMessage(null);
    try {
      const response = await odooService.testarConexao(selectedIntegracao.id);
      if (response.success && response.data?.conectado) {
        setMessage({ type: 'success', text: '✅ Conexão com Odoo estabelecida com sucesso!' });
        await loadIntegracoes();
        await loadInfoRapida();
      } else {
        setMessage({ type: 'error', text: response.message || 'Falha na conexão com Odoo' });
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Erro ao testar conexão' });
    } finally {
      setIsTesting(false);
    }
  };

  const loadInfoRapida = async () => {
    if (!selectedIntegracao) return;
    setIsLoadingInfo(true);
    try {
      const [catalogoRes, notaRes, movRes] = await Promise.all([
        odooService.getProdutos(selectedIntegracao.id, { pagina: 1 }),
        odooService.getNotasFiscais(selectedIntegracao.id, { pagina: 1 }),
        odooService.getMovimentacoes(selectedIntegracao.id, { 
          data_inicial: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Últimos 30 dias
          data_final: new Date().toISOString().split('T')[0]
        }),
      ]);

      if (catalogoRes.success && catalogoRes.data?.data) {
        setProdutosPreview(catalogoRes.data.data.slice(0, 5));
      }
      if (notaRes.success && notaRes.data && (notaRes.data as any[]).length > 0) {
        setUltimaNota((notaRes.data as any[])[0]);
      }
      if (movRes.success && movRes.data?.data && movRes.data.data.length > 0) {
        setUltimaMovimentacao(movRes.data.data[movRes.data.data.length - 1]);
      }
    } finally {
      setIsLoadingInfo(false);
    }
  };

  const handleDeleteIntegracao = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir esta integração Odoo?')) return;
    try {
      const response = await integracoesService.deleteIntegracao(id);
      if (response.success) {
        setMessage({ type: 'success', text: 'Integração excluída com sucesso!' });
        if (selectedIntegracao?.id === id) {
          setSelectedIntegracao(null);
          setProdutosPreview([]);
          setUltimaNota(null);
          setUltimaMovimentacao(null);
        }
        await loadIntegracoes();
      } else {
        setMessage({ type: 'error', text: response.message || 'Erro ao excluir' });
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Erro ao excluir integração' });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'conectado':
        return (
          <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
            <i className="fas fa-check-circle mr-1"></i>Conectado
          </span>
        );
      case 'erro':
        return (
          <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
            <i className="fas fa-times-circle mr-1"></i>Erro
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
            <i className="fas fa-question-circle mr-1"></i>Não testado
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            <i className="fas fa-plug mr-3 text-orange-500"></i>
            Integração Odoo
          </h1>
          <p className="mt-1 text-gray-600">
            Conecte seu sistema Odoo via Innobyte API para importar produtos, notas e movimentações
          </p>
        </div>

        {/* Mensagem de feedback */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-50 border border-green-200 text-green-800'
                : message.type === 'error'
                ? 'bg-red-50 border border-red-200 text-red-800'
                : 'bg-blue-50 border border-blue-200 text-blue-800'
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna Esquerda - Lista de Integrações */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="font-semibold text-gray-900">Suas Integrações</h2>
                <button
                  onClick={() => setShowForm(true)}
                  className="px-3 py-1.5 bg-primary text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <i className="fas fa-plus mr-1"></i>Nova
                </button>
              </div>

              <div className="p-4">
                {isLoading && integracoes.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <i className="fas fa-spinner fa-spin text-2xl mb-2"></i>
                    <p>Carregando...</p>
                  </div>
                ) : integracoes.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <i className="fas fa-plug text-4xl mb-3 opacity-50 text-orange-400"></i>
                    <p className="mb-2">Nenhuma integração Odoo configurada</p>
                    <button onClick={() => setShowForm(true)} className="text-primary hover:underline">
                      Adicionar integração
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {integracoes.map((integracao) => (
                      <div
                        key={integracao.id}
                        onClick={() => setSelectedIntegracao(integracao)}
                        className={`p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                          selectedIntegracao?.id === integracao.id
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-medium text-gray-900">{integracao.nome_integracao}</h3>
                            <p className="text-xs text-gray-500 mt-1">{integracao.provedor}</p>
                          </div>
                          {getStatusBadge(integracao.status_conexao)}
                        </div>
                        {integracao.data_ultima_conexao && (
                          <p className="text-xs text-gray-400 mt-2">
                            Última conexão: {new Date(integracao.data_ultima_conexao).toLocaleString('pt-BR')}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Instruções */}
            <div className="mt-6 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-4 border border-orange-200">
              <h3 className="font-semibold text-orange-900 mb-2">
                <i className="fas fa-info-circle mr-2"></i>
                Como obter a API Key?
              </h3>
              <ol className="text-sm text-orange-800 space-y-2">
                <li>1. Acesse o sistema Odoo da sua empresa</li>
                <li>2. Solicite a chave de API ao administrador do Innobyte Labels</li>
                <li>3. Cole o valor do cabeçalho <strong>X-API-Key</strong> no campo ao lado</li>
              </ol>
            </div>
          </div>

          {/* Coluna Direita - Detalhes e Ações */}
          <div className="lg:col-span-2">
            {showForm ? (
              /* Formulário de Nova Integração */
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">
                    <i className="fas fa-plus-circle mr-2 text-orange-500"></i>
                    Nova Integração Odoo
                  </h2>
                  <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                    <i className="fas fa-times"></i>
                  </button>
                </div>

                <form onSubmit={handleCreateIntegracao} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome da Integração
                    </label>
                    <input
                      type="text"
                      value={formData.nome_integracao}
                      onChange={(e) => setFormData({ ...formData, nome_integracao: e.target.value })}
                      placeholder="Ex: Odoo Global"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      API Key (X-API-Key) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.app_key}
                      onChange={(e) => setFormData({ ...formData, app_key: e.target.value })}
                      placeholder="Insira sua chave de API"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent font-mono text-sm"
                    />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading || !formData.app_key}
                      className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-colors"
                    >
                      {isLoading ? (
                        <><i className="fas fa-spinner fa-spin mr-2"></i>Salvando...</>
                      ) : (
                        <><i className="fas fa-save mr-2"></i>Salvar Integração</>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            ) : selectedIntegracao ? (
              <div className="space-y-6">
                {/* Card de Status e Ações */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">{selectedIntegracao.nome_integracao}</h2>
                      <div className="flex items-center gap-3 mt-2">
                        {getStatusBadge(selectedIntegracao.status_conexao)}
                        {selectedIntegracao.ativa ? (
                          <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">Ativa</span>
                        ) : (
                          <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">Inativa</span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteIntegracao(selectedIntegracao.id)}
                      className="text-red-500 hover:text-red-700 p-2"
                      title="Excluir integração"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={handleTestarConexao}
                      disabled={isTesting || !selectedIntegracao}
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 disabled:opacity-50 transition-all font-medium"
                    >
                      {isTesting ? (
                        <><i className="fas fa-spinner fa-spin mr-2"></i>Testando...</>
                      ) : (
                        <><i className="fas fa-plug mr-2"></i>Testar Conexão</>
                      )}
                    </button>
                    <button
                      onClick={loadInfoRapida}
                      disabled={isLoadingInfo || !selectedIntegracao || selectedIntegracao.status_conexao !== 'conectado'}
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 transition-all font-medium"
                    >
                      {isLoadingInfo ? (
                        <><i className="fas fa-spinner fa-spin mr-2"></i>Carregando...</>
                      ) : (
                        <><i className="fas fa-sync mr-2"></i>Carregar Info</>
                      )}
                    </button>
                  </div>
                </div>

                {/* Última Nota de Fiscal */}
                {ultimaNota && (
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">
                      <i className="fas fa-file-invoice mr-2 text-purple-500"></i>
                      Última Nota Fiscal (Cabeçalho)
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Número da NF:</span>
                        <p className="font-medium text-gray-900">{ultimaNota.numero_nf}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Data de Emissão:</span>
                        <p className="font-medium text-gray-900">{ultimaNota.data_emissao}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Fornecedor:</span>
                        <p className="font-medium text-gray-900">{ultimaNota.fornecedor}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Status:</span>
                        <p className="font-medium text-gray-900">{ultimaNota.status}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Última Movimentação */}
                {ultimaMovimentacao && (
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">
                      <i className="fas fa-exchange-alt mr-2 text-orange-500"></i>
                      Última Movimentação (Amostra)
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Produto:</span>
                        <p className="font-medium text-gray-900">{ultimaMovimentacao.produto.descricao}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Referência:</span>
                        <p className="font-medium text-gray-900 font-mono">{ultimaMovimentacao.produto.sku || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Quantidade:</span>
                        <p className="font-medium text-gray-900">{ultimaMovimentacao.detalhes_movimento.quantidade}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Data:</span>
                        <p className="font-medium text-gray-900">{ultimaMovimentacao.detalhes_movimento.data}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Preview de Protudos */}
                {produtosPreview.length > 0 && (
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">
                      <i className="fas fa-boxes mr-2 text-orange-500"></i>
                      Produtos no Catálogo (Amostra)
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 py-2 text-left text-gray-600">SKU</th>
                            <th className="px-3 py-2 text-left text-gray-600">Nome</th>
                            <th className="px-3 py-2 text-right text-gray-600">Preço</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {produtosPreview.map((item) => (
                            <tr key={item.id_produto} className="hover:bg-gray-50">
                              <td className="px-3 py-2 text-gray-600 font-mono">{item.sku || item.id_produto}</td>
                              <td className="px-3 py-2 text-gray-900">{item.descricao}</td>
                              <td className="px-3 py-2 text-right text-green-600">
                                {item.preco_venda ? `R$ ${item.preco_venda.toFixed(2)}` : 'R$ 0,00'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Nenhuma integração selecionada */
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <i className="fas fa-plug text-6xl text-orange-300 mb-4"></i>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Conecte com seu Odoo</h3>
                <p className="text-gray-600 max-w-md mx-auto mb-6">
                  Integre com o Odoo via API Innobyte para importar produtos e notas fiscais facilmente.
                </p>
                <button
                  onClick={() => setShowForm(true)}
                  className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
                >
                  <i className="fas fa-plus mr-2"></i>
                  Configurar Integração Odoo
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OdooIntegration;
