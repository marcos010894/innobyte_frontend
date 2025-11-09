import { useAuth } from '@/contexts/AuthContext';
import type { LicencaAuth } from '@/types/api.types';

/**
 * 🪝 Hook de Permissões
 * 
 * Facilita verificação de permissões em componentes
 */
export const usePermissions = () => {
  const { 
    user, 
    isMaster, 
    isCliente, 
    licenca, 
    temPermissao, 
    licencaValida,
    diasParaVencer 
  } = useAuth();

  // 👑 Master tem acesso a tudo
  const podeAcessarTudo = isMaster;

  // 📄 Verifica permissões específicas do cliente
  const podeUsarToken = isCliente && temPermissao('permite_token');
  const podeCriarModelos = isCliente && temPermissao('permite_criar_modelos');
  const podeCadastrarProdutos = isCliente && temPermissao('permite_cadastrar_produtos');
  const apenasModelosPDF = isCliente && licenca?.apenas_modelos_pdf === true;

  // ✅ Verifica se licença está OK
  const licencaOK = licencaValida();
  const licencaBloqueada = isCliente && licenca?.bloqueada === true;
  const licencaVencida = isCliente && licenca?.vencida === true;

  // ⚠️ Alertas de licença
  const diasRestantes = diasParaVencer();
  const licencaPertoDeVencer = diasRestantes > 0 && diasRestantes <= 30; // 30 dias
  const mostrarAlertaVencimento = licencaPertoDeVencer || licencaVencida;

  // 🏢 Informações de empresas
  const limitEmpresas = licenca?.limite_empresas || 0;
  const empresasAtivas = licenca?.empresas_ativas || 0;
  const podeAdicionarEmpresa = empresasAtivas < limitEmpresas;

  // 🎨 Obter cor do status da licença
  const getStatusColor = () => {
    if (!isCliente) return 'green';
    if (licencaBloqueada || licencaVencida) return 'red';
    if (licencaPertoDeVencer) return 'yellow';
    return 'green';
  };

  // 📊 Obter texto do status da licença
  const getStatusText = () => {
    if (!isCliente) return 'Administrador';
    if (licencaBloqueada) return 'Bloqueada';
    if (licencaVencida) return 'Vencida';
    if (licencaPertoDeVencer) return `Vence em ${diasRestantes} dias`;
    return 'Ativa';
  };

  // 🔍 Verificar permissão genérica
  const verificarPermissao = (permissao: keyof LicencaAuth): boolean => {
    if (isMaster) return true; // Master tem todas as permissões
    return temPermissao(permissao);
  };

  // 🛡️ Verificar múltiplas permissões (AND)
  const verificarTodasPermissoes = (...permissoes: (keyof LicencaAuth)[]): boolean => {
    if (isMaster) return true;
    return permissoes.every(p => temPermissao(p));
  };

  // 🛡️ Verificar se tem pelo menos uma permissão (OR)
  const verificarAlgumaPermissao = (...permissoes: (keyof LicencaAuth)[]): boolean => {
    if (isMaster) return true;
    return permissoes.some(p => temPermissao(p));
  };

  return {
    // Dados do usuário
    user,
    isMaster,
    isCliente,
    licenca,

    // Permissões específicas
    podeAcessarTudo,
    podeUsarToken,
    podeCriarModelos,
    podeCadastrarProdutos,
    apenasModelosPDF,

    // Status da licença
    licencaOK,
    licencaBloqueada,
    licencaVencida,
    licencaPertoDeVencer,
    mostrarAlertaVencimento,
    diasRestantes,

    // Empresas
    limitEmpresas,
    empresasAtivas,
    podeAdicionarEmpresa,

    // Helpers
    getStatusColor,
    getStatusText,
    verificarPermissao,
    verificarTodasPermissoes,
    verificarAlgumaPermissao,
  };
};
