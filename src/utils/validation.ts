/**
 * Funções utilitárias para validação de campos
 */

/**
 * Valida CNPJ
 */
export const validarCNPJ = (cnpj: string): boolean => {
  const cnpjLimpo = cnpj.replace(/[^\d]/g, '');
  
  if (cnpjLimpo.length !== 14) return false;
  if (/^(\d)\1+$/.test(cnpjLimpo)) return false; // Todos os dígitos iguais

  let tamanho = cnpjLimpo.length - 2;
  let numeros = cnpjLimpo.substring(0, tamanho);
  const digitos = cnpjLimpo.substring(tamanho);
  let soma = 0;
  let pos = tamanho - 7;

  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado !== parseInt(digitos.charAt(0))) return false;

  tamanho = tamanho + 1;
  numeros = cnpjLimpo.substring(0, tamanho);
  soma = 0;
  pos = tamanho - 7;

  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  return resultado === parseInt(digitos.charAt(1));
};

/**
 * Valida e-mail
 */
export const validarEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

/**
 * Valida data no formato YYYY-MM-DD
 */
export const validarData = (data: string): boolean => {
  if (!data) return false;
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(data)) return false;
  
  const date = new Date(data);
  return !isNaN(date.getTime());
};

/**
 * Valida telefone
 */
export const validarTelefone = (telefone: string): boolean => {
  const telefoneLimpo = telefone.replace(/[^\d]/g, '');
  return telefoneLimpo.length >= 10 && telefoneLimpo.length <= 11;
};

/**
 * Aplica máscara de CNPJ
 */
export const mascararCNPJ = (value: string): string => {
  const cnpj = value.replace(/[^\d]/g, '');
  return cnpj
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
    .substring(0, 18);
};

/**
 * Aplica máscara de telefone
 */
export const mascararTelefone = (value: string): string => {
  const telefone = value.replace(/[^\d]/g, '');
  if (telefone.length <= 10) {
    return telefone
      .replace(/^(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .substring(0, 14);
  }
  return telefone
    .replace(/^(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .substring(0, 15);
};

/**
 * Aplica máscara de CEP
 */
export const mascararCEP = (value: string): string => {
  const cep = value.replace(/[^\d]/g, '');
  return cep.replace(/^(\d{5})(\d)/, '$1-$2').substring(0, 9);
};

/**
 * Remove máscara (deixa só números)
 */
export const removerMascara = (value: string): string => {
  return value.replace(/[^\d]/g, '');
};

/**
 * Formata valor monetário
 */
export const formatarMoeda = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

/**
 * Formata data de YYYY-MM-DD para DD/MM/YYYY
 */
export const formatarData = (data: string): string => {
  if (!data) return '';
  const [ano, mes, dia] = data.split('-');
  return `${dia}/${mes}/${ano}`;
};

/**
 * Converte data de DD/MM/YYYY para YYYY-MM-DD
 */
export const converterDataParaISO = (data: string): string => {
  if (!data) return '';
  const [dia, mes, ano] = data.split('/');
  return `${ano}-${mes}-${dia}`;
};
