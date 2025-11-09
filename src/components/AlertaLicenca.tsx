import React from 'react';

interface AlertaLicencaProps {
  tipo: 'vencida' | 'bloqueada' | 'perto-vencer' | 'limite-empresas' | 'sem-permissao';
  mensagem?: string;
  diasRestantes?: number;
  onContato?: () => void;
  onVoltar?: () => void;
}

/**
 * 🚨 Componente de Alertas de Licença
 * 
 * Exibe alertas visuais para diferentes situações:
 * - Licença vencida
 * - Licença bloqueada
 * - Licença perto de vencer
 * - Limite de empresas atingido
 * - Sem permissão
 */
const AlertaLicenca: React.FC<AlertaLicencaProps> = ({
  tipo,
  mensagem,
  diasRestantes,
  onContato,
  onVoltar,
}) => {
  const configs = {
    'vencida': {
      icon: '⏰',
      title: 'Licença Vencida',
      description: mensagem || 'Sua licença expirou. Entre em contato com o suporte para renovação.',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-500',
      textColor: 'text-red-700',
      buttonColor: 'bg-red-600 hover:bg-red-700',
    },
    'bloqueada': {
      icon: '🔒',
      title: 'Licença Bloqueada',
      description: mensagem || 'Sua licença foi bloqueada. Entre em contato com o suporte.',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-500',
      textColor: 'text-red-700',
      buttonColor: 'bg-red-600 hover:bg-red-700',
    },
    'perto-vencer': {
      icon: '⚠️',
      title: 'Licença Próxima do Vencimento',
      description: mensagem || `Sua licença vence em ${diasRestantes || 0} dias. Renove agora para evitar interrupções.`,
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-500',
      textColor: 'text-yellow-700',
      buttonColor: 'bg-yellow-600 hover:bg-yellow-700',
    },
    'limite-empresas': {
      icon: '🏢',
      title: 'Limite de Empresas Atingido',
      description: mensagem || 'Você atingiu o limite de empresas da sua licença. Solicite um upgrade para adicionar mais empresas.',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-500',
      textColor: 'text-orange-700',
      buttonColor: 'bg-orange-600 hover:bg-orange-700',
    },
    'sem-permissao': {
      icon: '🚫',
      title: 'Sem Permissão',
      description: mensagem || 'Você não tem permissão para acessar esta funcionalidade. Entre em contato com o suporte.',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-500',
      textColor: 'text-gray-700',
      buttonColor: 'bg-gray-600 hover:bg-gray-700',
    },
  };

  const config = configs[tipo];

  return (
    <div className={`${config.bgColor} border-l-4 ${config.borderColor} p-4 rounded`}>
      <div className="flex items-start gap-3">
        <span className="text-3xl">{config.icon}</span>
        <div className="flex-1">
          <h3 className={`font-semibold text-lg ${config.textColor}`}>
            {config.title}
          </h3>
          <p className={`mt-1 text-sm ${config.textColor}`}>
            {config.description}
          </p>
          <div className="mt-3 flex gap-2">
            {onContato && (
              <button
                onClick={onContato}
                className={`${config.buttonColor} text-white px-4 py-2 rounded text-sm font-medium transition-colors`}
              >
                📧 Entrar em Contato
              </button>
            )}
            {onVoltar && (
              <button
                onClick={onVoltar}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded text-sm font-medium hover:bg-gray-300 transition-colors"
              >
                ← Voltar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * 🔔 Banner de Alerta no Topo
 * Versão compacta para exibir no topo da página
 */
export const BannerAlerta: React.FC<AlertaLicencaProps> = ({ tipo, mensagem, diasRestantes }) => {
  const configs = {
    'vencida': {
      icon: '⏰',
      bgColor: 'bg-red-600',
      text: mensagem || 'Licença vencida! Renove agora.',
    },
    'bloqueada': {
      icon: '🔒',
      bgColor: 'bg-red-600',
      text: mensagem || 'Licença bloqueada. Entre em contato.',
    },
    'perto-vencer': {
      icon: '⚠️',
      bgColor: 'bg-yellow-500',
      text: mensagem || `Sua licença vence em ${diasRestantes || 0} dias!`,
    },
    'limite-empresas': {
      icon: '🏢',
      bgColor: 'bg-orange-500',
      text: mensagem || 'Limite de empresas atingido.',
    },
    'sem-permissao': {
      icon: '🚫',
      bgColor: 'bg-gray-600',
      text: mensagem || 'Sem permissão para esta ação.',
    },
  };

  const config = configs[tipo];

  return (
    <div className={`${config.bgColor} text-white px-4 py-2 text-center text-sm font-medium`}>
      <span className="mr-2">{config.icon}</span>
      {config.text}
      {(tipo === 'vencida' || tipo === 'bloqueada' || tipo === 'perto-vencer') && (
        <a
          href="mailto:suporte@sistema.com"
          className="ml-3 underline font-semibold hover:text-gray-200"
        >
          Entrar em Contato
        </a>
      )}
    </div>
  );
};

export default AlertaLicenca;
