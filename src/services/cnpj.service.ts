/**
 * Serviço para consultar CNPJ via API externa
 * Usa múltiplas APIs como fallback para evitar problemas de CORS
 */

import axios from 'axios';

interface CNPJData {
  cnpj: string;
  razao_social: string;
  nome_fantasia: string;
  telefone: string;
  email: string;
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  municipio: string;
  uf: string;
}

/**
 * Consulta dados da empresa pelo CNPJ na Receita Federal
 * Tenta múltiplas APIs como fallback:
 * 1. BrasilAPI (melhor para CORS)
 * 2. ReceitaWS (fallback)
 * 3. API Publica Speedio (fallback)
 */
export const consultarCNPJ = async (cnpj: string): Promise<{ success: boolean; data?: CNPJData; message?: string }> => {
  try {
    // Remove formatação do CNPJ
    const cnpjLimpo = cnpj.replace(/[^\d]/g, '');
    
    if (cnpjLimpo.length !== 14) {
      return {
        success: false,
        message: 'CNPJ deve ter 14 dígitos',
      };
    }

    // Tenta BrasilAPI primeiro (melhor suporte a CORS)
    try {
      console.log('Tentando BrasilAPI...');
      const response = await axios.get(`https://brasilapi.com.br/api/cnpj/v1/${cnpjLimpo}`, {
        timeout: 10000,
      });
      
      console.log('BrasilAPI sucesso:', response.data);
      
      // Mapeia resposta da BrasilAPI para o formato esperado
      const data: CNPJData = {
        cnpj: response.data.cnpj || cnpjLimpo,
        razao_social: response.data.razao_social || response.data.nome_fantasia || '',
        nome_fantasia: response.data.nome_fantasia || '',
        telefone: response.data.ddd_telefone_1 || '',
        email: response.data.email || '',
        cep: response.data.cep || '',
        logradouro: response.data.logradouro || '',
        numero: response.data.numero || '',
        complemento: response.data.complemento || '',
        bairro: response.data.bairro || '',
        municipio: response.data.municipio || '',
        uf: response.data.uf || '',
      };

      return {
        success: true,
        data,
      };
    } catch (brasilApiError: any) {
      console.log('BrasilAPI falhou:', brasilApiError.message);
    }

    // Fallback: ReceitaWS
    try {
      console.log('Tentando ReceitaWS...');
      const response = await axios.get(`https://receitaws.com.br/v1/cnpj/${cnpjLimpo}`, {
        timeout: 10000,
      });
      
      console.log('ReceitaWS sucesso:', response.data);
      
      if (response.data.status === 'ERROR') {
        throw new Error(response.data.message || 'CNPJ não encontrado');
      }

      const data: CNPJData = {
        cnpj: response.data.cnpj,
        razao_social: response.data.nome || '',
        nome_fantasia: response.data.fantasia || '',
        telefone: response.data.telefone || '',
        email: response.data.email || '',
        cep: response.data.cep || '',
        logradouro: response.data.logradouro || '',
        numero: response.data.numero || '',
        complemento: response.data.complemento || '',
        bairro: response.data.bairro || '',
        municipio: response.data.municipio || '',
        uf: response.data.uf || '',
      };

      return {
        success: true,
        data,
      };
    } catch (receitaError: any) {
      console.log('ReceitaWS falhou:', receitaError.message);
      
      if (receitaError.response?.status === 429) {
        return {
          success: false,
          message: 'Limite de consultas atingido. Tente novamente em alguns segundos.',
        };
      }
    }

    // Fallback final: CNPJ.ws
    try {
      console.log('Tentando CNPJ.ws...');
      const response = await axios.get(`https://publica.cnpj.ws/cnpj/${cnpjLimpo}`, {
        timeout: 10000,
      });

      console.log('CNPJ.ws sucesso:', response.data);

      const data: CNPJData = {
        cnpj: cnpjLimpo,
        razao_social: response.data.razao_social || response.data.nome || '',
        nome_fantasia: response.data.estabelecimento?.nome_fantasia || '',
        telefone: response.data.estabelecimento?.ddd1 + response.data.estabelecimento?.telefone1 || '',
        email: response.data.estabelecimento?.email || '',
        cep: response.data.estabelecimento?.cep || '',
        logradouro: response.data.estabelecimento?.logradouro || '',
        numero: response.data.estabelecimento?.numero || '',
        complemento: response.data.estabelecimento?.complemento || '',
        bairro: response.data.estabelecimento?.bairro || '',
        municipio: response.data.estabelecimento?.cidade?.nome || '',
        uf: response.data.estabelecimento?.estado?.sigla || '',
      };

      return {
        success: true,
        data,
      };
    } catch (cnpjwsError: any) {
      console.log('CNPJ.ws falhou:', cnpjwsError.message);
    }

    // Se todas falharam
    return {
      success: false,
      message: 'Não foi possível consultar o CNPJ. Todas as APIs falharam. Tente novamente mais tarde.',
    };
    
  } catch (error: any) {
    console.error('Erro geral ao consultar CNPJ:', error);
    
    return {
      success: false,
      message: 'Erro ao consultar CNPJ. Verifique sua conexão.',
    };
  }
};

/**
 * Consulta CEP via API ViaCEP
 */
export const consultarCEP = async (cep: string): Promise<{ success: boolean; data?: any; message?: string }> => {
  try {
    const cepLimpo = cep.replace(/[^\d]/g, '');
    
    if (cepLimpo.length !== 8) {
      return {
        success: false,
        message: 'CEP deve ter 8 dígitos',
      };
    }

    const response = await axios.get(`https://viacep.com.br/ws/${cepLimpo}/json/`, {
      timeout: 10000,
    });
    
    if (response.data.erro) {
      return {
        success: false,
        message: 'CEP não encontrado',
      };
    }

    return {
      success: true,
      data: {
        cep: response.data.cep,
        logradouro: response.data.logradouro,
        complemento: response.data.complemento,
        bairro: response.data.bairro,
        cidade: response.data.localidade,
        estado: response.data.uf,
      },
    };
  } catch (error: any) {
    console.error('Erro ao consultar CEP:', error);
    return {
      success: false,
      message: 'Erro ao consultar CEP',
    };
  }
};
