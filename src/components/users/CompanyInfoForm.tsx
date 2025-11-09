import { useState, useEffect } from 'react';
import { mascararCEP } from '../../utils/validation';
import { consultarCEP } from '../../services/cnpj.service';

interface CompanyInfoFormProps {
  data?: any;
  onChange?: (data: any) => void;
}

const CompanyInfoForm = ({ data, onChange }: CompanyInfoFormProps) => {
  const [companyInfo, setCompanyInfo] = useState({
    inscricao_estadual: data?.inscricao_estadual || '',
    cep: data?.cep || '',
    logradouro: data?.logradouro || '',
    numero: data?.numero || '',
    complemento: data?.complemento || '',
    bairro: data?.bairro || '',
    estado: data?.estado || '',
    cidade: data?.cidade || '',
    emails: data?.emails || [] as string[],
    telefones: data?.telefones || [] as string[],
  });

  const [emailInput, setEmailInput] = useState('');
  const [telefoneInput, setTelefoneInput] = useState('');
  const [consultandoCEP, setConsultandoCEP] = useState(false);

  useEffect(() => {
    if (data) {
      setCompanyInfo({
        inscricao_estadual: data.inscricao_estadual || '',
        cep: data.cep || '',
        logradouro: data.logradouro || '',
        numero: data.numero || '',
        complemento: data.complemento || '',
        bairro: data.bairro || '',
        estado: data.estado || '',
        cidade: data.cidade || '',
        emails: data.emails || [],
        telefones: data.telefones || [],
      });
    }
  }, [data]);

  const handleChange = (field: string, value: any) => {
    const newData = { ...companyInfo, [field]: value };
    setCompanyInfo(newData);
    
    if (onChange) {
      onChange(newData);
    }
  };

  const handleCEPChange = (value: string) => {
    const masked = mascararCEP(value);
    handleChange('cep', masked);
  };

  const handleConsultarCEP = async () => {
    if (!companyInfo.cep || companyInfo.cep.length < 9) return;

    setConsultandoCEP(true);
    const result = await consultarCEP(companyInfo.cep);
    
    if (result.success && result.data) {
      const newData = {
        ...companyInfo,
        logradouro: result.data.logradouro || companyInfo.logradouro,
        bairro: result.data.bairro || companyInfo.bairro,
        cidade: result.data.cidade || companyInfo.cidade,
        estado: result.data.estado || companyInfo.estado,
      };
      setCompanyInfo(newData);
      
      if (onChange) {
        onChange(newData);
      }
    }
    
    setConsultandoCEP(false);
  };

  const handleEmailKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && emailInput.trim()) {
      e.preventDefault();
      const newEmails = [...companyInfo.emails, emailInput.trim()];
      handleChange('emails', newEmails);
      setEmailInput('');
    }
  };

  const handleTelefoneKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && telefoneInput.trim()) {
      e.preventDefault();
      const newTelefones = [...companyInfo.telefones, telefoneInput.trim()];
      handleChange('telefones', newTelefones);
      setTelefoneInput('');
    }
  };

  const removeEmail = (index: number) => {
    const newEmails = companyInfo.emails.filter((_: string, i: number) => i !== index);
    handleChange('emails', newEmails);
  };

  const removeTelefone = (index: number) => {
    const newTelefones = companyInfo.telefones.filter((_: string, i: number) => i !== index);
    handleChange('telefones', newTelefones);
  };

  return (
    <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
      <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
        <i className="fas fa-building mr-2 text-primary"></i>
        🏢 Informações Adicionais da Empresa
      </h3>

      <div className="space-y-4">
        {/* Inscrição Estadual */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <i className="fas fa-file-alt mr-1"></i>
            Inscrição Estadual
          </label>
          <input
            type="text"
            value={companyInfo.inscricao_estadual}
            onChange={(e) => handleChange('inscricao_estadual', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-gray-900"
            placeholder="Inscrição estadual (opcional)"
          />
          <p className="text-xs text-gray-500 mt-1">
            <i className="fas fa-info-circle"></i> Nome Fantasia, Razão Social e CNPJ são preenchidos automaticamente na seção "Dados do Cliente"
          </p>
        </div>

        {/* CEP */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">CEP</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={companyInfo.cep}
              onChange={(e) => handleCEPChange(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-gray-900"
              placeholder="00000-000"
              maxLength={9}
            />
            <button
              type="button"
              onClick={handleConsultarCEP}
              disabled={consultandoCEP || !companyInfo.cep}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              title="Consultar CEP"
            >
              {consultandoCEP ? (
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
          <p className="text-xs text-gray-500 mt-1">
            <i className="fas fa-info-circle"></i> Clique em "Consultar" para preencher automaticamente
          </p>
        </div>

        {/* Logradouro */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Logradouro</label>
          <input
            type="text"
            value={companyInfo.logradouro}
            onChange={(e) => handleChange('logradouro', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-gray-900"
            placeholder="Rua, Avenida, etc."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Número */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Número</label>
            <input
              type="text"
              value={companyInfo.numero}
              onChange={(e) => handleChange('numero', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-gray-900"
              placeholder="123"
            />
          </div>

          {/* Complemento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Complemento</label>
            <input
              type="text"
              value={companyInfo.complemento}
              onChange={(e) => handleChange('complemento', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-gray-900"
              placeholder="Sala, Andar, etc."
            />
          </div>
        </div>

        {/* Bairro */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Bairro</label>
          <input
            type="text"
            value={companyInfo.bairro}
            onChange={(e) => handleChange('bairro', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-gray-900"
            placeholder="Nome do bairro"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Estado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <select
              value={companyInfo.estado}
              onChange={(e) => handleChange('estado', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-gray-900"
            >
              <option value="">Selecionar</option>
              <option value="AC">Acre</option>
              <option value="AL">Alagoas</option>
              <option value="AP">Amapá</option>
              <option value="AM">Amazonas</option>
              <option value="BA">Bahia</option>
              <option value="CE">Ceará</option>
              <option value="DF">Distrito Federal</option>
              <option value="ES">Espírito Santo</option>
              <option value="GO">Goiás</option>
              <option value="MA">Maranhão</option>
              <option value="MT">Mato Grosso</option>
              <option value="MS">Mato Grosso do Sul</option>
              <option value="MG">Minas Gerais</option>
              <option value="PA">Pará</option>
              <option value="PB">Paraíba</option>
              <option value="PR">Paraná</option>
              <option value="PE">Pernambuco</option>
              <option value="PI">Piauí</option>
              <option value="RJ">Rio de Janeiro</option>
              <option value="RN">Rio Grande do Norte</option>
              <option value="RS">Rio Grande do Sul</option>
              <option value="RO">Rondônia</option>
              <option value="RR">Roraima</option>
              <option value="SC">Santa Catarina</option>
              <option value="SP">São Paulo</option>
              <option value="SE">Sergipe</option>
              <option value="TO">Tocantins</option>
            </select>
          </div>

          {/* Cidade */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
            <input
              type="text"
              value={companyInfo.cidade}
              onChange={(e) => handleChange('cidade', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-gray-900"
              placeholder="Nome da cidade"
            />
          </div>
        </div>

        {/* E-mails */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">E-mails</label>
          <input
            type="email"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            onKeyPress={handleEmailKeyPress}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-gray-900"
            placeholder="Digite e pressione Enter para adicionar"
          />
          <p className="text-xs text-gray-500 mt-1">Adicionar com 'Enter'</p>
          {companyInfo.emails.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {companyInfo.emails.map((email: string, index: number) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  {email}
                  <button
                    onClick={() => removeEmail(index)}
                    className="hover:text-blue-900"
                    type="button"
                  >
                    <i className="fas fa-times text-xs"></i>
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Telefones */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Telefones</label>
          <input
            type="tel"
            value={telefoneInput}
            onChange={(e) => setTelefoneInput(e.target.value)}
            onKeyPress={handleTelefoneKeyPress}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-gray-900"
            placeholder="Digite e pressione Enter para adicionar"
          />
          <p className="text-xs text-gray-500 mt-1">Adicionar com 'Enter'</p>
          {companyInfo.telefones.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {companyInfo.telefones.map((telefone: string, index: number) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                >
                  {telefone}
                  <button
                    onClick={() => removeTelefone(index)}
                    className="hover:text-green-900"
                    type="button"
                  >
                    <i className="fas fa-times text-xs"></i>
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyInfoForm;
