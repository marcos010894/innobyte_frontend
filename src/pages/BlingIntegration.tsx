import React, { useState, useEffect } from 'react';
import { useAuth } from '@hooks/useAuth';
import * as integracoesService from '@/services/integracoes.service';
import * as blingService from '@/services/bling.service';
import type { IntegracaoAPI } from '@/types/api.types';
import type { BlingProduto, BlingCategoria, BlingNotaFiscal, BlingMovimentacao } from '@/services/bling.service';

const BlingIntegration: React.FC = () => {
  const { user } = useAuth();

  // Estados principais
  const [integracoes, setIntegracoes] = useState<IntegracaoAPI[]>([]);
  const [selectedIntegracao, setSelectedIntegracao] = useState<IntegracaoAPI | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Estados de consulta
  const [produtosPreview, setProdutosPreview] = useState<BlingProduto[]>([]);
  const [categorias, setCategorias] = useState<BlingCategoria[]>([]);
  const [ultimaNota, setUltimaNota] = useState<BlingNotaFiscal | null>(null);
  const [ultimaMovimentacao, setUltimaMovimentacao] = useState<BlingMovimentacao | null>(null);
  const [isExchanging, setIsExchanging] = useState(false);
  const [authCode, setAuthCode] = useState('');

  // Form de nova integração
  const [formData, setFormData] = useState({ 
    nome_integracao: 'Bling V3', 
    client_id: 'cd71558cb18da5a73cb23c64dab2772600e8d5f6', 
    client_secret: '4649e66b3ecc8db6b070e45b4b029e62bb9f8a85d2bbf18c892db627dc24',
    token: '' 
  });

  useEffect(() => {
    if (user?.id) loadIntegracoes();
  }, [user?.id]);

  const loadIntegracoes = async () => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      const response = await integracoesService.getIntegracoes(user.id);
      if (response.success && response.data) {
        const blingIntegracoes = response.data.data.filter((i) => i.provedor === 'Bling');
        setIntegracoes(blingIntegracoes);
        if (!selectedIntegracao) {
          const ativa = blingIntegracoes.find((i) => i.ativa);
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
        provedor: 'Bling',
        nome_integracao: formData.nome_integracao || 'Bling V3',
        app_key: formData.client_id,
        app_secret: formData.client_secret,
        // O token pode ser o refresh_token inicial ou o access_token
        // Vamos salvar como um JSON básico para o CRUD entender
        token: formData.token.includes('{') ? formData.token : JSON.stringify({ access_token: formData.token, refresh_token: formData.token }),
      } as any);

      if (response.success && response.data) {
        setMessage({ type: 'success', text: 'Integração Bling criada com sucesso!' });
        setShowForm(false);
        setFormData({ nome_integracao: '', client_id: '', client_secret: '', token: '' });
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
    
    if (!selectedIntegracao.token) {
      setMessage({ 
        type: 'error', 
        text: '⚠️ Token não configurado. Você precisa gerar os tokens no Passo 3 abaixo antes de testar a conexão.' 
      });
      return;
    }

    setIsTesting(true);
    setMessage(null);
    try {
      const response = await blingService.testarConexao(selectedIntegracao.id);
      if (response.success && response.data?.conectado) {
        setMessage({ type: 'success', text: '✅ Conexão com Bling V3 estabelecida com sucesso!' });
        await loadIntegracoes();
        await loadInfoRapida();
      } else {
        setMessage({ type: 'error', text: response.message || 'Falha na conexão com Bling. Verifique se o token é válido.' });
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Erro ao testar conexão' });
    } finally {
      setIsTesting(false);
    }
  };

  const handleExchangeCode = async () => {
    if (!selectedIntegracao || !authCode) return;
    setIsExchanging(true);
    setMessage(null);
    try {
      const response = await blingService.exchangeCode(selectedIntegracao.id, authCode);
      if (response.success) {
        setMessage({ type: 'success', text: '✅ Tokens gerados e salvos com sucesso!' });
        setAuthCode('');
        await loadIntegracoes();
        await loadInfoRapida();
      } else {
        setMessage({ type: 'error', text: response.message || 'Erro ao trocar código por tokens' });
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Erro ao processar tokens' });
    } finally {
      setIsExchanging(false);
    }
  };

  const loadInfoRapida = async () => {
    if (!selectedIntegracao || !selectedIntegracao.token) return;
    try {
      const [prodRes, catRes, notaRes, movRes] = await Promise.all([
        blingService.getProdutos(selectedIntegracao.id, { pagina: 1 }),
        blingService.getCategorias(selectedIntegracao.id),
        blingService.getUltimaNF(selectedIntegracao.id).catch(() => ({ success: false })),
        blingService.getUltimaMovimentacao(selectedIntegracao.id).catch(() => ({ success: false })),
      ]);

      if (prodRes.success && prodRes.data) {
        setProdutosPreview(prodRes.data.data.slice(0, 5));
      }
      if (catRes.success && catRes.data) {
        setCategorias(catRes.data);
      }
      if (notaRes && 'success' in notaRes && notaRes.success && (notaRes as any).data) {
        setUltimaNota((notaRes as any).data as BlingNotaFiscal);
      }
      if (movRes && 'success' in movRes && movRes.success && (movRes as any).data) {
        setUltimaMovimentacao((movRes as any).data as BlingMovimentacao);
      }
    } finally {
    }
  };

  const handleDeleteIntegracao = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir esta integração Bling?')) return;
    try {
      const response = await integracoesService.deleteIntegracao(id);
      if (response.success) {
        setMessage({ type: 'success', text: 'Integração excluída com sucesso!' });
        if (selectedIntegracao?.id === id) {
          setSelectedIntegracao(null);
          setProdutosPreview([]);
          setCategorias([]);
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
            <i className="fas fa-tags mr-3 text-primary"></i>
            Integração Bling V3
          </h1>
          <p className="mt-1 text-gray-600">
            Importe produtos e notas diretamente do seu ERP Bling para imprimir etiquetas
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
                    <i className="fas fa-tags text-4xl mb-3 opacity-50"></i>
                    <p className="mb-2">Nenhuma integração Bling configurada</p>
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
                            ? 'border-primary bg-blue-50'
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
            <div className="mt-6 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg p-4 border border-green-200">
              <h3 className="font-semibold text-green-900 mb-2">
                <i className="fas fa-info-circle mr-2"></i>
                Como configurar o Bling V3?
              </h3>
              <ul className="text-sm text-green-800 space-y-2">
                <li>1. Acesse o <strong>Sistema Bling</strong></li>
                <li>2. Vá em <strong>Preferências → Sistema → API</strong></li>
                <li>3. Crie um aplicativo e obtenha o <strong>Client ID</strong> e <strong>Client Secret</strong></li>
                <li>4. Salve os dados aqui e depois use o <strong>Código de Autorização</strong> para gerar os tokens</li>
              </ul>
            </div>
          </div>

          {/* Coluna Direita - Detalhes e Ações */}
          <div className="lg:col-span-2">
            {showForm ? (
              /* Formulário de Nova Integração */
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">
                    <i className="fas fa-plus-circle mr-2 text-primary"></i>
                    Nova Integração Bling V3
                  </h2>
                  <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                    <i className="fas fa-times"></i>
                  </button>
                </div>

                <form onSubmit={handleCreateIntegracao} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Integração</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      value={formData.nome_integracao}
                      onChange={(e) => setFormData({ ...formData, nome_integracao: e.target.value })}
                      placeholder="Ex: Bling Principal"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Client ID *</label>
                      <input
                        type="text"
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg font-mono text-sm"
                        value={formData.client_id}
                        onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Client Secret *</label>
                      <input
                        type="password"
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg font-mono text-sm"
                        value={formData.client_secret}
                        onChange={(e) => setFormData({ ...formData, client_secret: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Access Token / Refresh Token (Opcional)</label>
                    <textarea
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg font-mono text-xs"
                      value={formData.token}
                      onChange={(e) => setFormData({ ...formData, token: e.target.value })}
                      placeholder="Pode deixar em branco e gerar no próximo passo, ou cole um token se já tiver..."
                    />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 font-medium"
                    >
                      {isLoading ? 'Salvando...' : 'Salvar Integração'}
                    </button>
                  </div>
                </form>
              </div>
            ) : selectedIntegracao ? (
              <div className="space-y-6">
                {/* Status e Ações */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">{selectedIntegracao.nome_integracao}</h2>
                      <div className="flex items-center gap-2 mt-2">
                        {getStatusBadge(selectedIntegracao.status_conexao)}
                      </div>
                    </div>
                    <button onClick={() => handleDeleteIntegracao(selectedIntegracao.id)} className="text-red-500 hover:text-red-700 p-2">
                      <i className="fas fa-trash-alt"></i>
                    </button>
                  </div>

                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mt-6">
                    <p className="text-sm text-blue-800">
                      <i className="fas fa-info-circle mr-2"></i>
                      Utilize o guia abaixo para completar a configuração e gerar os tokens de acesso.
                    </p>
                  </div>
                </div>

                {/* Guia de Configuração Passo a Passo */}
                <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                    <i className="fas fa-list-ol mr-2 text-blue-500"></i>
                    Guia de Configuração (Passo a Passo)
                  </h3>
                  
                  <div className="space-y-6">
                    {/* Passo 1 */}
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">1</div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">Salvar Credenciais</p>
                        <p className="text-sm text-gray-600 mt-1">
                          Certifique-se de que o <strong>Client ID</strong> e <strong>Client Secret</strong> estão salvos corretamente.
                        </p>
                      </div>
                    </div>

                    {/* Passo 2 */}
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">2</div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">Autorizar no Bling</p>
                        <p className="text-sm text-gray-600 mt-1 mb-3">
                          Clique no link abaixo para autorizar este aplicativo no seu sistema Bling.
                        </p>
                        <a 
                          href={`https://www.bling.com.br/Api/v3/oauth/authorize?response_type=code&client_id=${selectedIntegracao.app_key}&state=${Math.random().toString(36).substring(7)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                        >
                          <i className="fas fa-external-link-alt mr-2"></i>
                          Abrir Link de Autorização
                        </a>
                      </div>
                    </div>

                    {/* Passo 3 */}
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">3</div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">Gerar Tokens</p>
                        <p className="text-sm text-gray-600 mt-1 mb-3">
                          Após autorizar, você será redirecionado para uma página. Copie o <strong>código</strong> que aparece na barra de endereços (após <code>?code=...</code>) e cole abaixo:
                        </p>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            className="flex-1 px-4 py-2 border border-blue-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Cole o código aqui (Ex: cd71558...)"
                            value={authCode}
                            onChange={(e) => setAuthCode(e.target.value)}
                          />
                          <button
                            onClick={handleExchangeCode}
                            disabled={isExchanging || !authCode}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-bold disabled:opacity-50 transition-all shadow-sm"
                          >
                            {isExchanging ? (
                              <><i className="fas fa-spinner fa-spin mr-2"></i>Processando...</>
                            ) : (
                              'Gerar Tokens'
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Passo 4 */}
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">4</div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">Testar Conexão</p>
                        <p className="text-sm text-gray-600 mt-1 mb-3">
                          Agora que os tokens foram gerados, você pode testar a comunicação final com o Bling.
                        </p>
                        <button
                          onClick={handleTestarConexao}
                          disabled={isTesting}
                          className="px-6 py-2 border-2 border-green-600 text-green-600 rounded-lg hover:bg-green-50 font-bold transition-all disabled:opacity-50"
                        >
                          {isTesting ? 'Testando...' : 'Finalizar e Testar Conexão'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Última Nota Fiscal */}
                {ultimaNota && (
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">
                      <i className="fas fa-file-invoice mr-2 text-purple-500"></i>
                      Última Nota Fiscal
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Número:</span>
                        <p className="font-medium text-gray-900">
                          {ultimaNota.numero}{ultimaNota.serie ? `/${ultimaNota.serie}` : ''}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">Data de Emissão:</span>
                        <p className="font-medium text-gray-900">{ultimaNota.dataEmissao || '—'}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Total de Itens:</span>
                        <p className="font-medium text-gray-900">{ultimaNota.itens?.length || 0} itens</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Valor Total:</span>
                        <p className="font-medium text-green-600">
                          R$ {ultimaNota.total.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Última Movimentação */}
                {ultimaMovimentacao && (
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">
                      <i className="fas fa-exchange-alt mr-2 text-orange-500"></i>
                      Última Movimentação de Estoque
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Produto:</span>
                        <p className="font-medium text-gray-900">
                          {ultimaMovimentacao.produto?.nome || `ID: ${ultimaMovimentacao.produto?.id}`}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">Tipo:</span>
                        <p className={`font-medium ${ultimaMovimentacao.tipo === 'E' ? 'text-green-600' : 'text-red-600'}`}>
                          {ultimaMovimentacao.tipo === 'E' ? '▲ Entrada' : '▼ Saída'}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">Quantidade:</span>
                        <p className="font-medium text-gray-900">{ultimaMovimentacao.quantidade}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Data:</span>
                        <p className="font-medium text-gray-900">{ultimaMovimentacao.data || '—'}</p>
                      </div>
                      {ultimaMovimentacao.observacoes && (
                        <div className="col-span-2">
                          <span className="text-gray-500">Observações:</span>
                          <p className="font-medium text-gray-900 italic">{ultimaMovimentacao.observacoes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Categorias */}
                {categorias.length > 0 && (
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Categorias ({categorias.length})</h3>
                    <div className="flex flex-wrap gap-2">
                      {categorias.slice(0, 10).map((cat) => (
                        <span key={cat.id} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                          {cat.descricao}
                        </span>
                      ))}
                      {categorias.length > 10 && <span className="text-gray-400 text-xs italic">e mais {categorias.length - 10}...</span>}
                    </div>
                  </div>
                )}

                {/* Preview de Produtos */}
                {produtosPreview.length > 0 && (
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Produtos Sincronizados (Amostra)</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 py-2 text-left">SKU</th>
                            <th className="px-3 py-2 text-left">Nome</th>
                            <th className="px-3 py-2 text-right">Preço</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {produtosPreview.map((prod) => (
                            <tr key={prod.id}>
                              <td className="px-3 py-2 font-mono">{prod.codigo || prod.id}</td>
                              <td className="px-3 py-2">{prod.nome}</td>
                              <td className="px-3 py-2 text-right">R$ {prod.preco.toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Dica de uso */}
                <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg p-4 border border-amber-200">
                  <h4 className="font-semibold text-amber-900 mb-2">
                    <i className="fas fa-lightbulb mr-2"></i>
                    Como usar?
                  </h4>
                  <p className="text-sm text-amber-800">
                    Com a integração conectada, vá para a página de <strong>Impressão</strong> e
                    utilize a opção de importar por <strong>NF de Entrada</strong> ou
                    <strong> Movimentação</strong> para gerar etiquetas automaticamente com os dados do Bling.
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <i className="fas fa-tags text-6xl text-gray-300 mb-4"></i>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Conecte com o Bling V3</h3>
                <p className="text-gray-600 mb-6">Importe produtos e notas fiscais facilmente.</p>
                <button
                  onClick={() => setShowForm(true)}
                  className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-blue-600 font-medium"
                >
                  <i className="fas fa-plus mr-2"></i>Configurar Agora
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlingIntegration;
