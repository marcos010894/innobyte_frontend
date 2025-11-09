import React from 'react';
import { useAuth } from '@hooks/useAuth';

const DashboardCliente: React.FC = () => {
  const { user } = useAuth();
  const licenca = user?.licenca;

  console.log('🎯 DashboardCliente - Usuário:', user);
  console.log('🎯 DashboardCliente - Licença:', licenca);

  if (!licenca) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Carregando informações da licença...</p>
      </div>
    );
  }

  // Calcula status e cores
  const statusLicenca = licenca.bloqueada 
    ? 'Bloqueada' 
    : licenca.vencida 
    ? 'Vencida' 
    : licenca.dias_para_vencer < 30 
    ? 'Perto de Vencer' 
    : 'Ativa';

  const statusColor = licenca.bloqueada || licenca.vencida
    ? 'bg-red-100 text-red-800 border-red-300'
    : licenca.dias_para_vencer < 30
    ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
    : 'bg-green-100 text-green-800 border-green-300';

  const progressoDias = Math.max(0, Math.min(100, (licenca.dias_para_vencer / 365) * 100));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Bem-vindo, {user?.razao_social}!</h1>
        <p className="text-gray-600">Aqui está um resumo da sua licença e funcionalidades disponíveis</p>
      </div>

      {/* Alerta de Status */}
      {(licenca.bloqueada || licenca.vencida || licenca.dias_para_vencer < 30) && (
        <div className={`rounded-lg border-2 p-4 ${statusColor}`}>
          <div className="flex items-start gap-3">
            <i className="fas fa-exclamation-triangle text-xl mt-0.5"></i>
            <div>
              <h3 className="font-bold mb-1">
                {licenca.bloqueada && 'Licença Bloqueada'}
                {!licenca.bloqueada && licenca.vencida && 'Licença Vencida'}
                {!licenca.bloqueada && !licenca.vencida && licenca.dias_para_vencer < 30 && 'Licença Próxima do Vencimento'}
              </h3>
              <p className="text-sm">
                {licenca.bloqueada && 'Entre em contato com o suporte para regularizar sua situação.'}
                {!licenca.bloqueada && licenca.vencida && 'Renove sua licença para continuar usando o sistema.'}
                {!licenca.bloqueada && !licenca.vencida && licenca.dias_para_vencer < 30 && `Sua licença vence em ${licenca.dias_para_vencer} dias. Renove com antecedência!`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Cards de Status da Licença */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Status */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Status da Licença</h3>
            <i className={`fas fa-shield-alt text-2xl ${
              licenca.bloqueada || licenca.vencida ? 'text-red-500' : 'text-green-500'
            }`}></i>
          </div>
          <p className={`text-2xl font-bold mb-1 ${
            licenca.bloqueada || licenca.vencida ? 'text-red-600' : 'text-green-600'
          }`}>
            {statusLicenca}
          </p>
          <p className="text-xs text-gray-500">Tipo: {licenca.tipo_licenca}</p>
        </div>

        {/* Dias para Vencer */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Validade</h3>
            <i className="fas fa-calendar-alt text-2xl text-blue-500"></i>
          </div>
          <p className="text-2xl font-bold text-blue-600 mb-1">
            {licenca.dias_para_vencer} dias
          </p>
          <p className="text-xs text-gray-500">Expira em: {new Date(licenca.data_expiracao).toLocaleDateString('pt-BR')}</p>
        </div>

        {/* Permissões Ativas */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Permissões</h3>
            <i className="fas fa-key text-2xl text-orange-500"></i>
          </div>
          <p className="text-2xl font-bold text-orange-600 mb-1">
            {[
              licenca.permite_token,
              licenca.permite_criar_modelos,
              licenca.permite_cadastrar_produtos,
            ].filter(Boolean).length} / 3
          </p>
          <p className="text-xs text-gray-500">Funcionalidades ativas</p>
        </div>
      </div>

      {/* Gráfico de Progresso de Validade */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <i className="fas fa-calendar-check text-blue-500"></i>
          Tempo de Licença
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">Dias Restantes</span>
            <span className="font-bold text-gray-800">{licenca.dias_para_vencer} dias</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
            <div
              className={`h-full transition-all ${
                licenca.dias_para_vencer < 30
                  ? 'bg-red-500'
                  : licenca.dias_para_vencer < 90
                  ? 'bg-yellow-500'
                  : 'bg-green-500'
              }`}
              style={{ width: `${progressoDias}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500">
            {licenca.dias_para_vencer < 30
              ? '⚠️ Sua licença está próxima do vencimento!'
              : licenca.dias_para_vencer < 90
              ? '⚠️ Programe a renovação da sua licença.'
              : '✓ Sua licença está válida.'}
          </p>
        </div>
      </div>

      {/* Grid de Permissões Detalhadas */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <i className="fas fa-list-check text-green-500"></i>
          Funcionalidades Disponíveis
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Editor de Modelos */}
          <div className={`flex items-center gap-3 p-4 rounded-lg border-2 ${
            licenca.permite_criar_modelos
              ? 'bg-green-50 border-green-300'
              : 'bg-gray-50 border-gray-300'
          }`}>
            <i className={`fas fa-file-alt text-2xl ${
              licenca.permite_criar_modelos ? 'text-green-600' : 'text-gray-400'
            }`}></i>
            <div className="flex-1">
              <p className="font-medium text-gray-800">Editor de Modelos</p>
              <p className="text-xs text-gray-600">
                {licenca.permite_criar_modelos ? 'Disponível' : 'Indisponível'}
                {licenca.apenas_modelos_pdf && ' (Apenas PDF)'}
              </p>
            </div>
            <i className={`fas ${
              licenca.permite_criar_modelos ? 'fa-check-circle text-green-600' : 'fa-times-circle text-gray-400'
            } text-xl`}></i>
          </div>

          {/* Integração API */}
          <div className={`flex items-center gap-3 p-4 rounded-lg border-2 ${
            licenca.permite_token
              ? 'bg-green-50 border-green-300'
              : 'bg-gray-50 border-gray-300'
          }`}>
            <i className={`fas fa-plug text-2xl ${
              licenca.permite_token ? 'text-green-600' : 'text-gray-400'
            }`}></i>
            <div className="flex-1">
              <p className="font-medium text-gray-800">Integração API</p>
              <p className="text-xs text-gray-600">
                {licenca.permite_token ? 'Disponível' : 'Indisponível'}
              </p>
            </div>
            <i className={`fas ${
              licenca.permite_token ? 'fa-check-circle text-green-600' : 'fa-times-circle text-gray-400'
            } text-xl`}></i>
          </div>

          {/* Cadastro de Produtos */}
          <div className={`flex items-center gap-3 p-4 rounded-lg border-2 ${
            licenca.permite_cadastrar_produtos
              ? 'bg-green-50 border-green-300'
              : 'bg-gray-50 border-gray-300'
          }`}>
            <i className={`fas fa-box text-2xl ${
              licenca.permite_cadastrar_produtos ? 'text-green-600' : 'text-gray-400'
            }`}></i>
            <div className="flex-1">
              <p className="font-medium text-gray-800">Cadastro de Produtos</p>
              <p className="text-xs text-gray-600">
                {licenca.permite_cadastrar_produtos ? 'Disponível' : 'Indisponível'}
              </p>
            </div>
            <i className={`fas ${
              licenca.permite_cadastrar_produtos ? 'fa-check-circle text-green-600' : 'fa-times-circle text-gray-400'
            } text-xl`}></i>
          </div>

          {/* Impressão */}
          <div className="flex items-center gap-3 p-4 rounded-lg border-2 bg-green-50 border-green-300">
            <i className="fas fa-print text-2xl text-green-600"></i>
            <div className="flex-1">
              <p className="font-medium text-gray-800">Impressão de Etiquetas</p>
              <p className="text-xs text-gray-600">Sempre disponível</p>
            </div>
            <i className="fas fa-check-circle text-green-600 text-xl"></i>
          </div>
        </div>
      </div>

      {/* Card de Suporte */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="bg-white/20 rounded-full p-4">
            <i className="fas fa-headset text-3xl"></i>
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold mb-1">Precisa de Ajuda?</h3>
            <p className="text-blue-100 text-sm">
              Nossa equipe está pronta para auxiliar você com qualquer dúvida ou renovação de licença.
            </p>
          </div>
          <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-blue-50 transition-colors">
            <i className="fas fa-phone mr-2"></i>
            Contatar Suporte
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardCliente;
