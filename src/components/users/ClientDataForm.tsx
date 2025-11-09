import { useState } from 'react';
import { consultarCNPJ } from '../../services/cnpj.service';
import { validarCNPJ, validarEmail, validarTelefone, mascararCNPJ, mascararTelefone, removerMascara } from '../../utils/validation';

interface ClientDataFormProps {
  data?: {
    cnpj: string;
    razaoSocial: string;
    telefone: string;
    email: string;
    senha: string;
  };
  onChange?: (data: any) => void;
  onCompanyDataFetched?: (companyData: any) => void;
  fieldErrors?: Record<string, boolean>; // 🆕 Erros de validação
}

const ClientDataForm = ({ data, onChange, onCompanyDataFetched, fieldErrors = {} }: ClientDataFormProps) => {
  const [clientData, setClientData] = useState({
    cnpj: data?.cnpj || '',
    razaoSocial: data?.razaoSocial || '',
    telefone: data?.telefone || '',
    email: data?.email || '',
    senha: data?.senha || '',
  });

  const [consultandoCNPJ, setConsultandoCNPJ] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string, value: string) => {
    const newData = { ...clientData, [field]: value };
    setClientData(newData);
    
    // Limpa erro do campo
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
    
    // Notifica o pai
    if (onChange) {
      onChange(newData);
    }
  };

  const handleCNPJChange = (value: string) => {
    const masked = mascararCNPJ(value);
    handleChange('cnpj', masked);
  };

  const handleTelefoneChange = (value: string) => {
    const masked = mascararTelefone(value);
    handleChange('telefone', masked);
  };

  const handleConsultarCNPJ = async () => {
    const cnpjLimpo = removerMascara(clientData.cnpj);
    
    if (!validarCNPJ(cnpjLimpo)) {
      setErrors((prev) => ({ ...prev, cnpj: 'CNPJ inválido' }));
      return;
    }

    setConsultandoCNPJ(true);
    setErrors((prev) => ({ ...prev, cnpj: '' }));

    const result = await consultarCNPJ(cnpjLimpo);

    if (result.success && result.data) {
      // Preenche dados do cliente
      const newData = {
        ...clientData,
        razaoSocial: result.data.razao_social,
        telefone: mascararTelefone(result.data.telefone),
        email: result.data.email,
      };
      setClientData(newData);
      
      if (onChange) {
        onChange(newData);
      }

      // 🆕 Envia dados da empresa para o CompanyInfoForm
      if (onCompanyDataFetched && result.data) {
        onCompanyDataFetched({
          inscricao_estadual: '', // Não vem na API pública
          cep: result.data.cep || '',
          logradouro: result.data.logradouro || '',
          numero: result.data.numero || '',
          complemento: result.data.complemento || '',
          bairro: result.data.bairro || '',
          cidade: result.data.municipio || '',
          estado: result.data.uf || '',
          emails: result.data.email ? [result.data.email] : [],
          telefones: result.data.telefone ? [result.data.telefone] : [],
        });
      }
      
      alert('✅ Dados da empresa preenchidos automaticamente!');
    } else {
      setErrors((prev) => ({ ...prev, cnpj: result.message || 'Erro ao consultar CNPJ' }));
    }

    setConsultandoCNPJ(false);
  };

  const handleBlur = (field: string) => {
    let error = '';
    
    switch (field) {
      case 'cnpj':
        const cnpjLimpo = removerMascara(clientData.cnpj);
        if (cnpjLimpo && !validarCNPJ(cnpjLimpo)) {
          error = 'CNPJ inválido';
        }
        break;
      case 'email':
        if (clientData.email && !validarEmail(clientData.email)) {
          error = 'E-mail inválido';
        }
        break;
      case 'telefone':
        const telefoneLimpo = removerMascara(clientData.telefone);
        if (telefoneLimpo && !validarTelefone(telefoneLimpo)) {
          error = 'Telefone inválido';
        }
        break;
      case 'razaoSocial':
        if (clientData.razaoSocial && clientData.razaoSocial.length < 3) {
          error = 'Razão social deve ter pelo menos 3 caracteres';
        }
        break;
    }
    
    if (error) {
      setErrors((prev) => ({ ...prev, [field]: error }));
    }
  };

  return (
    <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
      <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
        <i className="fas fa-user mr-2 text-primary"></i>
        👤 Dados Principais do Cliente
      </h3>

      <div className="space-y-4">
        {/* CNPJ */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            CNPJ <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={clientData.cnpj}
              onChange={(e) => handleCNPJChange(e.target.value)}
              onBlur={() => handleBlur('cnpj')}
              className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 ${
                errors.cnpj || fieldErrors['cnpj'] ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="00.000.000/0000-00"
              maxLength={18}
            />
            <button
              type="button"
              onClick={handleConsultarCNPJ}
              disabled={consultandoCNPJ || !clientData.cnpj}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              title="Consultar dados da Receita Federal"
            >
              {consultandoCNPJ ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  <span className="hidden sm:inline">Consultando...</span>
                </>
              ) : (
                <>
                  <i className="fas fa-search"></i>
                  <span className="hidden sm:inline">Consultar</span>
                </>
              )}
            </button>
          </div>
          {errors.cnpj && <p className="text-red-500 text-xs mt-1">{errors.cnpj}</p>}
          <p className="text-xs text-gray-500 mt-1">
            <i className="fas fa-info-circle"></i> Clique em "Consultar" para preencher automaticamente os dados da empresa
          </p>
        </div>

        {/* Razão Social */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Razão Social <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={clientData.razaoSocial}
            onChange={(e) => handleChange('razaoSocial', e.target.value)}
            onBlur={() => handleBlur('razaoSocial')}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 ${
              errors.razaoSocial || fieldErrors['razaoSocial'] ? 'border-red-500 bg-red-50' : 'border-gray-300'
            }`}
            placeholder="Nome da empresa"
          />
          {(errors.razaoSocial || fieldErrors['razaoSocial']) && <p className="text-red-500 text-xs mt-1">{errors.razaoSocial || 'Campo obrigatório'}</p>}
        </div>

        {/* Telefone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Telefone <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            value={clientData.telefone}
            onChange={(e) => handleTelefoneChange(e.target.value)}
            onBlur={() => handleBlur('telefone')}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 ${
              errors.telefone ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="(00) 00000-0000"
            maxLength={15}
          />
          {errors.telefone && <p className="text-red-500 text-xs mt-1">{errors.telefone}</p>}
        </div>

        {/* E-mail */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            E-mail <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={clientData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            onBlur={() => handleBlur('email')}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 ${
              errors.email || fieldErrors['email'] ? 'border-red-500 bg-red-50' : 'border-gray-300'
            }`}
            placeholder="contato@empresa.com.br"
          />
          {(errors.email || fieldErrors['email']) && <p className="text-red-500 text-xs mt-1">{errors.email || 'Campo obrigatório'}</p>}
        </div>

        {/* Senha */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Senha <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            value={clientData.senha}
            onChange={(e) => handleChange('senha', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 ${
              fieldErrors['senha'] ? 'border-red-500 bg-red-50' : 'border-gray-300'
            }`}
            placeholder="••••••••"
            minLength={6}
          />
          {fieldErrors['senha'] && <p className="text-red-500 text-xs mt-1">Senha deve ter pelo menos 6 caracteres</p>}
          {!fieldErrors['senha'] && <p className="text-xs text-gray-500 mt-1">Mínimo 6 caracteres</p>}
        </div>
      </div>
    </div>
  );
};

export default ClientDataForm;
