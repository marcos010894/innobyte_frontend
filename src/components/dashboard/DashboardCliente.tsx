import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@hooks/useAuth';
import api from '@services/api';

const DashboardCliente: React.FC = () => {
  const { user, loadUser } = useAuth();
  const [showPixModal, setShowPixModal] = useState(false);
  const [pixData, setPixData] = useState<any>(null);
  const [loadingPix, setLoadingPix] = useState(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const pollingInterval = useRef<any>(null);

  const licenca = user?.licenca;

  // Limpa o intervalo ao desmontar o componente
  useEffect(() => {
    return () => {
      if (pollingInterval.current) clearInterval(pollingInterval.current);
    };
  }, []);

  const handleAtivarPlano = async () => {
    if (!user) return;
    setLoadingPix(true);
    setShowPixModal(true);
    
    try {
      const response = await api.get(`/subscriptions/checkout-pix/${user.id}`);
      if (response.data.success) {
        setPixData(response.data);
        startPolling(response.data.order_id);
      }
    } catch (error) {
      console.error("Erro ao gerar PIX:", error);
      alert("Erro ao gerar pagamento. Tente novamente em instantes.");
      setShowPixModal(false);
    } finally {
      setLoadingPix(false);
    }
  };

  const startPolling = (orderId: string) => {
    if (pollingInterval.current) clearInterval(pollingInterval.current);
    
    pollingInterval.current = setInterval(async () => {
      try {
        const response = await api.get(`/subscriptions/payment-status/${user?.id}/${orderId}`);
        if (response.data.success && response.data.status === "PAGO") {
          clearInterval(pollingInterval.current);
          setPaymentConfirmed(true);
          // Recarrega os dados do usuário para atualizar a licença globalmente no sistema
          await loadUser();
        }
      } catch (error) {
        console.error("Erro ao consultar status:", error);
      }
    }, 5000); // Poll every 5 seconds
  };

  const handleVerificarManual = async () => {
    if (!pixData?.order_id) return;
    setLoadingPix(true);
    try {
      const response = await api.get(`/subscriptions/payment-status/${user?.id}/${pixData.order_id}`);
      if (response.data.success && response.data.status === "PAGO") {
        setPaymentConfirmed(true);
        await loadUser();
      } else {
        alert(response.data.message || "Pagamento ainda não detectado.");
      }
    } catch (error) {
      alert("Erro ao verificar pagamento.");
    } finally {
      setLoadingPix(false);
    }
  };

  if (!licenca) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Carregando informações da licença...</p>
      </div>
    );
  }

  // Calcula status e cores
  const isBloqueadaPorAtraso = licenca.dias_para_vencer < -3;
  const realBloqueada = licenca.bloqueada || isBloqueadaPorAtraso;

  const statusLicenca = realBloqueada
    ? 'Bloqueada' 
    : licenca.tipo_licenca === 'experiencia'
    ? 'Teste Grátis'
    : licenca.vencida 
    ? 'Vencida (Em Atraso)' 
    : licenca.dias_para_vencer <= 10 
    ? 'Renovação Necessária' 
    : 'Ativa';

  const statusColor = realBloqueada || licenca.vencida
    ? 'bg-red-100 text-red-800 border-red-300'
    : licenca.tipo_licenca === 'experiencia' || licenca.dias_para_vencer <= 10
    ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
    : 'bg-green-100 text-green-800 border-green-300';

  const progressoDias = Math.max(0, Math.min(100, (licenca.dias_para_vencer / (licenca.tipo_licenca === 'experiencia' ? 7 : 30)) * 100));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Bem-vindo, {user?.razao_social}!</h1>
          <p className="text-gray-600">Aqui está um resumo da sua licença e funcionalidades disponíveis</p>
        </div>
        {licenca.tipo_licenca === 'experiencia' && (
          <button 
            onClick={handleAtivarPlano}
            className="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-lg font-bold shadow-lg transform transition hover:scale-105 flex items-center gap-2"
          >
            <i className="fas fa-rocket"></i>
            Ativar Plano Pro
          </button>
        )}
      </div>

      {/* Alerta de Status */}
      {(realBloqueada || licenca.vencida || licenca.tipo_licenca === 'experiencia' || (licenca.dias_para_vencer <= 10 && licenca.dias_para_vencer > 0)) && (
        <div className={`rounded-xl border-2 p-5 ${statusColor} shadow-sm`}>
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-full ${realBloqueada || licenca.vencida ? 'bg-red-200' : 'bg-yellow-200'}`}>
              <i className={`fas ${realBloqueada || licenca.vencida ? 'fa-ban' : 'fa-clock'} text-2xl`}></i>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg mb-1">
                {realBloqueada && 'Acesso Bloqueado por Atraso'}
                {!realBloqueada && licenca.tipo_licenca === 'experiencia' && `Período de Teste Grátis: ${licenca.dias_para_vencer} dias restantes`}
                {!realBloqueada && licenca.vencida && 'Sua licença expirou (Tolerância de 3 dias)'}
                {!realBloqueada && licenca.tipo_licenca !== 'experiencia' && licenca.dias_para_vencer > 0 && licenca.dias_para_vencer <= 10 && `Vencimento em ${licenca.dias_para_vencer} dias`}
              </h3>
              <p className="text-sm opacity-90">
                {realBloqueada && 'Sua tolerância de 3 dias acabou. Ative um plano para desbloquear o sistema imediatamente.'}
                {!realBloqueada && licenca.tipo_licenca === 'experiencia' && 'Aproveite todas as funções durante o teste. Ative agora para não perder o acesso.'}
                {!realBloqueada && licenca.vencida && 'Atenção: Você está no período de tolerância. Regularize em até 3 dias para não ser bloqueado.'}
                {!realBloqueada && licenca.dias_para_vencer > 0 && licenca.dias_para_vencer <= 10 && 'Garanta a continuidade do seu serviço realizando o pagamento antecipado.'}
              </p>
            </div>
            {!licenca.bloqueada && (
              <button 
                onClick={handleAtivarPlano}
                className="bg-white text-gray-800 px-4 py-2 rounded-lg font-bold text-sm hover:bg-gray-50 transition-colors shadow-sm"
              >
                Pagar Agora
              </button>
            )}
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
          <p className="text-xs text-gray-500 capitalize">Contrato: {licenca.tipo_licenca}</p>
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

        {/* Renovação */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Mensalidade</h3>
            <i className="fas fa-wallet text-2xl text-purple-500"></i>
          </div>
          <p className="text-2xl font-bold text-purple-600 mb-1">
            R$ {licenca.valor_parcela?.toFixed(2).replace('.', ',') || '5,00'}
          </p>
          <p className="text-xs text-gray-500">Plano Atual</p>
        </div>
      </div>

      {/* Barra de Progresso do Período */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <i className="fas fa-hourglass-half text-blue-500"></i>
          Uso do Período Atual
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">Dias Restantes</span>
            <span className="font-bold text-gray-800">{licenca.dias_para_vencer} dias</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
            <div
              className={`h-full transition-all duration-1000 ${
                licenca.dias_para_vencer <= 3
                  ? 'bg-red-500'
                  : licenca.dias_para_vencer <= 10
                  ? 'bg-yellow-500'
                  : 'bg-green-500'
              }`}
              style={{ width: `${progressoDias}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 italic">
            {licenca.bloqueada ? 'A tolerância de 3 dias expirou.' : `Você tem até o dia ${new Date(new Date(licenca.data_expiracao).getTime() + 3*24*60*60*1000).toLocaleDateString('pt-BR')} (tolerância) para regularizar.`}
          </p>
        </div>
      </div>

      {/* Modal de Pagamento PIX */}
      {showPixModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[2000] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all">
            <div className="bg-primary p-6 text-white text-center relative">
              <button 
                onClick={() => setShowPixModal(false)}
                className="absolute top-4 right-4 text-white/80 hover:text-white"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
              <h2 className="text-2xl font-bold">Ativar Plano Pro</h2>
              <p className="text-white/80">Pagamento Instantâneo via PIX</p>
            </div>

            <div className="p-8 text-center">
              {loadingPix ? (
                <div className="py-12">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-4"></div>
                  <p className="text-gray-600 font-medium">Processando...</p>
                </div>
              ) : paymentConfirmed ? (
                <div className="py-8 animate-bounce">
                  <i className="fas fa-check-circle text-green-500 text-7xl mb-4"></i>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">Pagamento Confirmado!</h3>
                  <p className="text-gray-600 mb-6">Sua licença foi ativada com sucesso. Aproveite o Innobyte Etiquetas!</p>
                  <button 
                    onClick={() => window.location.reload()}
                    className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-xl font-bold"
                  >
                    Ir para o Sistema
                  </button>
                </div>
              ) : (
                <>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(pixData?.qr_code)}`} 
                      alt="QR Code PIX" 
                      className="mx-auto w-64 h-64 shadow-sm border-4 border-white rounded-lg"
                    />
                  </div>
                  
                  <div className="mb-6">
                    <p className="text-sm text-gray-500 mb-2 uppercase font-bold tracking-wider">Valor do Plano</p>
                    <p className="text-4xl font-black text-gray-800">R$ {pixData?.valor?.toFixed(2).replace('.', ',') || '5,00'}</p>
                  </div>

                  <div className="space-y-4">
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(pixData?.copy_paste);
                        alert('Código copiado!');
                      }}
                      className="w-full bg-blue-50 text-blue-600 border border-blue-200 px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-100 transition-colors"
                    >
                      <i className="fas fa-copy"></i>
                      Copiar Código PIX
                    </button>
                    
                    <button 
                      onClick={handleVerificarManual}
                      className="w-full bg-green-500 text-white px-6 py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-green-600 transition-all shadow-lg shadow-green-200"
                    >
                      <i className="fas fa-check"></i>
                      Já realizei o pagamento
                    </button>
                  </div>
                  
                  <p className="mt-6 text-xs text-gray-400">
                    O reconhecimento é automático. Após o pagamento, o sistema será liberado em instantes.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Grid de Permissões Detalhadas */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <i className="fas fa-list-check text-green-500"></i>
          Funcionalidades Disponíveis
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-4 rounded-lg border-2 bg-green-50 border-green-300">
            <i className="fas fa-file-alt text-2xl text-green-600"></i>
            <div className="flex-1">
              <p className="font-medium text-gray-800">Editor de Modelos</p>
              <p className="text-xs text-gray-600">Disponível em Modo Full</p>
            </div>
            <i className="fas fa-check-circle text-green-600 text-xl"></i>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-lg border-2 bg-green-50 border-green-300">
            <i className="fas fa-plug text-2xl text-green-600"></i>
            <div className="flex-1">
              <p className="font-medium text-gray-800">Integração API (Bling, Omie, e-gestor)</p>
              <p className="text-xs text-gray-600">Disponível em Modo Full</p>
            </div>
            <i className="fas fa-check-circle text-green-600 text-xl"></i>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardCliente;
