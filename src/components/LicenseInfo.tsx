import React from 'react';
import { usePermissions } from '@/hooks/usePermissions';

/**
 * 📄 Componente de Informações da Licença
 * 
 * Exibe informações detalhadas da licença do cliente:
 * - Status (ativa, vencida, bloqueada)
 * - Dias para vencer
 * - Permissões
 * - Empresas ativas
 */
const LicenseInfo: React.FC = () => {
  const {
    isCliente,
    licenca,
    licencaOK,
    licencaBloqueada,
    licencaVencida,
    licencaPertoDeVencer,
    diasRestantes,
    getStatusColor,
    getStatusText,
    podeUsarToken,
    podeCriarModelos,
    podeCadastrarProdutos,
    apenasModelosPDF,
    limitEmpresas,
    empresasAtivas,
    podeAdicionarEmpresa,
  } = usePermissions();

  // Não renderiza para Master
  if (!isCliente || !licenca) {
    return null;
  }

  const statusColor = getStatusColor();
  const statusText = getStatusText();

  // Cores baseadas no status
  const getColorClasses = () => {
    switch (statusColor) {
      case 'red':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'yellow':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'green':
        return 'bg-green-50 border-green-200 text-green-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        <span>📄</span>
        Sua Licença
      </h2>

      {/* Status da Licença */}
      <div className={`border-2 rounded-lg p-4 mb-4 ${getColorClasses()}`}>
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-semibold text-lg">{statusText}</h3>
            <p className="text-sm mt-1">
              Tipo: <span className="font-medium">{licenca.tipo_licenca}</span>
            </p>
          </div>
          <div className="text-right">
            {!licencaBloqueada && !licencaVencida && (
              <>
                <p className="text-sm">Expira em:</p>
                <p className="font-bold text-xl">{diasRestantes} dias</p>
              </>
            )}
            {(licencaBloqueada || licencaVencida) && (
              <span className="text-4xl">⚠️</span>
            )}
          </div>
        </div>
      </div>

      {/* Alerta de Vencimento */}
      {licencaPertoDeVencer && !licencaVencida && !licencaBloqueada && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4 rounded">
          <p className="font-medium">⚠️ Atenção!</p>
          <p className="text-sm mt-1">
            Sua licença vence em breve. Entre em contato com o suporte para renovação.
          </p>
        </div>
      )}

      {/* Informações Detalhadas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Data de Início */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-sm text-gray-600">📅 Data de Início</p>
          <p className="font-semibold text-gray-800">
            {new Date(licenca.data_inicio).toLocaleDateString('pt-BR')}
          </p>
        </div>

        {/* Data de Expiração */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-sm text-gray-600">📅 Data de Expiração</p>
          <p className="font-semibold text-gray-800">
            {new Date(licenca.data_expiracao).toLocaleDateString('pt-BR')}
          </p>
        </div>
      </div>

      {/* Empresas */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <h4 className="font-semibold text-blue-800 mb-2">🏢 Empresas</h4>
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-blue-700">
              <span className="font-bold text-2xl">{empresasAtivas}</span> / {limitEmpresas}
            </p>
            <p className="text-xs text-blue-600 mt-1">Empresas Ativas</p>
          </div>
          {!podeAdicionarEmpresa && (
            <div className="bg-red-100 text-red-700 px-3 py-1 rounded text-sm">
              Limite atingido
            </div>
          )}
          {podeAdicionarEmpresa && (
            <div className="bg-green-100 text-green-700 px-3 py-1 rounded text-sm">
              ✅ Pode adicionar
            </div>
          )}
        </div>
      </div>

      {/* Permissões */}
      <div>
        <h4 className="font-semibold text-gray-800 mb-3">🛡️ Permissões</h4>
        <div className="grid grid-cols-2 gap-2">
          <PermissionItem 
            label="Token API" 
            enabled={podeUsarToken} 
          />
          <PermissionItem 
            label="Criar Modelos" 
            enabled={podeCriarModelos} 
          />
          <PermissionItem 
            label="Cadastrar Produtos" 
            enabled={podeCadastrarProdutos} 
          />
          <PermissionItem 
            label="Apenas PDFs" 
            enabled={apenasModelosPDF}
            isRestriction 
          />
        </div>
      </div>

      {/* Ação de Suporte */}
      {!licencaOK && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button
            onClick={() => window.location.href = 'mailto:suporte@sistema.com'}
            className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primary-dark transition-colors font-medium"
          >
            📧 Entrar em Contato com Suporte
          </button>
        </div>
      )}
    </div>
  );
};

// Componente auxiliar para item de permissão
interface PermissionItemProps {
  label: string;
  enabled: boolean;
  isRestriction?: boolean;
}

const PermissionItem: React.FC<PermissionItemProps> = ({ 
  label, 
  enabled, 
  isRestriction = false 
}) => {
  return (
    <div className="flex items-center gap-2 bg-gray-50 p-2 rounded">
      <span className="text-lg">
        {enabled ? (isRestriction ? '⚠️' : '✅') : '❌'}
      </span>
      <span className="text-sm text-gray-700">{label}</span>
    </div>
  );
};

export default LicenseInfo;
