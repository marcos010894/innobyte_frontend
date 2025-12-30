import React, { useState, useEffect } from 'react';
import { useAuth } from '@hooks/useAuth';
import * as integracoesService from '@/services/integracoes.service';
import * as egestorService from '@/services/egestor.service';
import type { IntegracaoAPI } from '@/types/api.types';
import type { EgestorEmpresa, EgestorProduto } from '@/services/egestor.service';

const ApiIntegration: React.FC = () => {
  const { user } = useAuth();
  
  // Estados
  const [integracoes, setIntegracoes] = useState<IntegracaoAPI[]>([]);
  const [selectedIntegracao, setSelectedIntegracao] = useState<IntegracaoAPI | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [empresaInfo, setEmpresaInfo] = useState<EgestorEmpresa | null>(null);
  const [produtosPreview, setProdutosPreview] = useState<EgestorProduto[]>([]);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  
  // Form states
  const [formData, setFormData] = useState({
    nome_integracao: '',
    personal_token: '',
  });

  // Carregar integrações ao montar
  useEffect(() => {
    if (user?.id) {
      loadIntegracoes();
    }
  }, [user?.id]);

  const loadIntegracoes = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const response = await integracoesService.getIntegracoes(user.id);
      if (response.success && response.data) {
        // Filtrar apenas integrações do E-gestor
        const egestorIntegracoes = response.data.data.filter(
          (i) => i.provedor === 'eGestor'
        );
        setIntegracoes(egestorIntegracoes);
        
        // Se já tem uma integração selecionada, atualizar com os novos dados
        if (selectedIntegracao) {
          const atualizada = egestorIntegracoes.find((i) => i.id === selectedIntegracao.id);
          if (atualizada) {
            setSelectedIntegracao(atualizada);
          }
        } else {
          // Se não tem selecionada, selecionar a primeira ativa
          const ativa = egestorIntegracoes.find((i) => i.ativa);
          if (ativa) {
            setSelectedIntegracao(ativa);
          }
        }
      }
    } catch (error) {
      console.error('Erro ao carregar integrações:', error);
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
        provedor: 'eGestor',
        nome_integracao: formData.nome_integracao || 'E-gestor',
        app_key: formData.personal_token, // Personal token vai no app_key
        app_secret: '', // E-gestor não usa app_secret
      });

      if (response.success && response.data) {
        setMessage({ type: 'success', text: 'Integração criada com sucesso!' });
        setShowForm(false);
        setFormData({ nome_integracao: '', personal_token: '' });
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
    setEmpresaInfo(null);

    try {
      const response = await egestorService.testarConexao(selectedIntegracao.id);
      
      if (response.success && response.data?.conectado) {
        setMessage({ type: 'success', text: '✅ Conexão estabelecida com sucesso!' });
        if (response.data.empresa) {
          setEmpresaInfo(response.data.empresa);
        }
        await loadIntegracoes(); // Atualizar status
      } else {
        setMessage({ type: 'error', text: response.message || 'Falha na conexão' });
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Erro ao testar conexão' });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSincronizar = async () => {
    if (!selectedIntegracao) return;

    setIsSyncing(true);
    setMessage(null);

    try {
      const response = await egestorService.sincronizarProdutos(selectedIntegracao.id);
      
      if (response.success && response.data) {
        setMessage({
          type: 'success',
          text: `✅ Sincronização concluída! ${response.data.sincronizados} produtos sincronizados.`,
        });
        // Carregar preview dos produtos
        await loadProdutosPreview();
      } else {
        setMessage({ type: 'error', text: response.message || 'Erro na sincronização' });
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Erro ao sincronizar' });
    } finally {
      setIsSyncing(false);
    }
  };

  const loadProdutosPreview = async () => {
    if (!selectedIntegracao) return;

    try {
      const response = await egestorService.getProdutos(selectedIntegracao.id, { page: 1 });
      if (response.success && response.data) {
        setProdutosPreview(response.data.data.slice(0, 5));
      }
    } catch (error) {
      console.error('Erro ao carregar preview de produtos:', error);
    }
  };

  const handleDeleteIntegracao = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir esta integração?')) return;

    try {
      const response = await integracoesService.deleteIntegracao(id);
      if (response.success) {
        setMessage({ type: 'success', text: 'Integração excluída com sucesso!' });
        if (selectedIntegracao?.id === id) {
          setSelectedIntegracao(null);
          setEmpresaInfo(null);
          setProdutosPreview([]);
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
            <i className="fas fa-plug mr-3 text-primary"></i>
            Integração E-gestor
          </h1>
          <p className="mt-1 text-gray-600">
            Conecte sua conta do E-gestor para importar produtos automaticamente
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
                    <i className="fas fa-plug text-4xl mb-3 opacity-50"></i>
                    <p className="mb-2">Nenhuma integração configurada</p>
                    <button
                      onClick={() => setShowForm(true)}
                      className="text-primary hover:underline"
                    >
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
                            <h3 className="font-medium text-gray-900">
                              {integracao.nome_integracao}
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">
                              {integracao.provedor}
                            </p>
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
            <div className="mt-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-2">
                <i className="fas fa-info-circle mr-2"></i>
                Como obter o Personal Token?
              </h3>
              <ol className="text-sm text-blue-800 space-y-2">
                <li>1. Acesse sua conta no <a href="https://www.egestor.com.br" target="_blank" rel="noopener noreferrer" className="underline">E-gestor</a></li>
                <li>2. Vá em <strong>Configurações</strong></li>
                <li>3. Clique na aba <strong>API</strong></li>
                <li>4. Gere ou copie seu <strong>Personal Token</strong></li>
              </ol>
              <a
                href="https://www.youtube.com/watch?v=2y648YPA9Us"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center mt-3 text-sm text-blue-600 hover:underline"
              >
                <i className="fab fa-youtube mr-1"></i>
                Ver vídeo tutorial
              </a>
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
                    Nova Integração E-gestor
                  </h2>
                  <button
                    onClick={() => setShowForm(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
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
                      onChange={(e) =>
                        setFormData({ ...formData, nome_integracao: e.target.value })
                      }
                      placeholder="Ex: Minha Loja E-gestor"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Personal Token <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={formData.personal_token}
                      onChange={(e) =>
                        setFormData({ ...formData, personal_token: e.target.value })
                      }
                      placeholder="Cole aqui o Personal Token do E-gestor..."
                      rows={4}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent font-mono text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      <i className="fas fa-lock mr-1"></i>
                      Seu token será armazenado de forma segura e criptografada
                    </p>
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
                      disabled={isLoading || !formData.personal_token}
                      className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
                    >
                      {isLoading ? (
                        <>
                          <i className="fas fa-spinner fa-spin mr-2"></i>
                          Salvando...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-save mr-2"></i>
                          Salvar Integração
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            ) : selectedIntegracao ? (
              /* Detalhes da Integração Selecionada */
              <div className="space-y-6">
                {/* Card de Status */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">
                        {selectedIntegracao.nome_integracao}
                      </h2>
                      <div className="flex items-center gap-3 mt-2">
                        {getStatusBadge(selectedIntegracao.status_conexao)}
                        {selectedIntegracao.ativa ? (
                          <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                            Ativa
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                            Inativa
                          </span>
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

                  {/* Botões de Ação */}
                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={handleTestarConexao}
                      disabled={isTesting}
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 disabled:opacity-50 transition-all font-medium"
                    >
                      {isTesting ? (
                        <>
                          <i className="fas fa-spinner fa-spin mr-2"></i>
                          Testando...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-plug mr-2"></i>
                          Testar Conexão
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleSincronizar}
                      disabled={isSyncing || selectedIntegracao.status_conexao !== 'conectado'}
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 disabled:opacity-50 transition-all font-medium"
                    >
                      {isSyncing ? (
                        <>
                          <i className="fas fa-sync fa-spin mr-2"></i>
                          Sincronizando...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-sync mr-2"></i>
                          Sincronizar Produtos
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Dados da Empresa (se conectado) */}
                {empresaInfo && (
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">
                      <i className="fas fa-building mr-2 text-primary"></i>
                      Dados da Empresa
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Razão Social:</span>
                        <p className="font-medium text-gray-900">{empresaInfo.razaoSocial}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Nome Fantasia:</span>
                        <p className="font-medium text-gray-900">{empresaInfo.nomeFantasia}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">CNPJ:</span>
                        <p className="font-medium text-gray-900">{empresaInfo.cnpj}</p>
                      </div>
                      {empresaInfo.email && (
                        <div>
                          <span className="text-gray-500">E-mail:</span>
                          <p className="font-medium text-gray-900">{empresaInfo.email}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Preview de Produtos */}
                {produtosPreview.length > 0 && (
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">
                      <i className="fas fa-boxes mr-2 text-primary"></i>
                      Produtos Sincronizados (Amostra)
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 py-2 text-left text-gray-600">Código</th>
                            <th className="px-3 py-2 text-left text-gray-600">Produto</th>
                            <th className="px-3 py-2 text-right text-gray-600">Preço</th>
                            <th className="px-3 py-2 text-right text-gray-600">Estoque</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {produtosPreview.map((produto) => (
                            <tr key={produto.codigo} className="hover:bg-gray-50">
                              <td className="px-3 py-2 text-gray-600 font-mono">
                                {produto.referencia || produto.codigo}
                              </td>
                              <td className="px-3 py-2 text-gray-900">{produto.nome}</td>
                              <td className="px-3 py-2 text-right text-green-600 font-medium">
                                R$ {produto.preco?.toFixed(2) || '0,00'}
                              </td>
                              <td className="px-3 py-2 text-right text-gray-600">
                                {produto.estoque || 0}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <p className="text-xs text-gray-500 mt-3">
                      <i className="fas fa-info-circle mr-1"></i>
                      Esses produtos estarão disponíveis na tela de Impressão
                    </p>
                  </div>
                )}

                {/* Dica de uso */}
                <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg p-4 border border-amber-200">
                  <h4 className="font-semibold text-amber-900 mb-2">
                    <i className="fas fa-lightbulb mr-2"></i>
                    Como usar?
                  </h4>
                  <p className="text-sm text-amber-800">
                    Após sincronizar, vá para a página de <strong>Impressão</strong> e seus produtos
                    do E-gestor estarão disponíveis para selecionar e imprimir etiquetas!
                  </p>
                </div>
              </div>
            ) : (
              /* Nenhuma integração selecionada */
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <img
                  src="https://www.egestor.com.br/wp-content/themes/developer/images/logo.png"
                  alt="E-gestor"
                  className="h-12 mx-auto mb-6 opacity-50"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                <i className="fas fa-plug text-6xl text-gray-300 mb-4"></i>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Conecte com o E-gestor
                </h3>
                <p className="text-gray-600 max-w-md mx-auto mb-6">
                  Importe seus produtos diretamente do E-gestor e gere etiquetas
                  com os dados atualizados de estoque e preço.
                </p>
                <button
                  onClick={() => setShowForm(true)}
                  className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                >
                  <i className="fas fa-plus mr-2"></i>
                  Configurar Integração
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiIntegration;
