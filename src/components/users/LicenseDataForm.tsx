import { useState } from 'react';
import { validarData } from '../../utils/validation';

interface LicenseDataFormProps {
  data?: any;
  onChange?: (data: any) => void;
  fieldErrors?: Record<string, boolean>; // 🆕 Erros de validação
}

const LicenseDataForm = ({ data, onChange, fieldErrors = {} }: LicenseDataFormProps) => {
  const [licenseData, setLicenseData] = useState({
    tipoLicenca: data?.tipoLicenca || 'contrato',
    experiencia: data?.experiencia || '',
    demonstracao: data?.demonstracao || '',
    dataInicio: data?.dataInicio || '',
    dataExpiracao: data?.dataExpiracao || '',
    diaVencimento: data?.diaVencimento || '',
    baseadoContratacao: data?.baseadoContratacao ?? true,
    intervalo: data?.intervalo || 'mensal',
    usuariosAdicionais: data?.usuariosAdicionais || 0,
    valorParcela: data?.valorParcela || 0,
    bloqueado: data?.bloqueado || false,
    renovacaoAutomatica: data?.renovacaoAutomatica || false,
    apenasModelosPDF: data?.apenasModelosPDF || false,
    permiteToken: data?.permiteToken || false,
    permiteCriarModelos: data?.permiteCriarModelos || false,
    permiteCadastrarProdutos: data?.permiteCadastrarProdutos || false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string, value: any) => {
    const newData = { ...licenseData, [field]: value };
    setLicenseData(newData);
    
    // Limpa erro do campo
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
    
    // Notifica o pai
    if (onChange) {
      onChange(newData);
    }
  };

  const handleBlur = (field: string) => {
    let error = '';
    
    switch (field) {
      case 'dataInicio':
        if (licenseData.dataInicio && !validarData(licenseData.dataInicio)) {
          error = 'Data inválida';
        }
        break;
      case 'dataExpiracao':
        if (licenseData.dataExpiracao) {
          if (!validarData(licenseData.dataExpiracao)) {
            error = 'Data inválida';
          } else if (licenseData.dataInicio && new Date(licenseData.dataExpiracao) <= new Date(licenseData.dataInicio)) {
            error = 'Data de expiração deve ser posterior à data de início';
          }
        }
        break;
      case 'valorParcela':
        if (licenseData.valorParcela < 0) {
          error = 'Valor não pode ser negativo';
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
        <i className="fas fa-key mr-2 text-primary"></i>
        🔑 Dados da Licença
      </h3>

      <div className="space-y-4">
        {/* Tipo Licença */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo Licença <span className="text-red-500">*</span>
          </label>
          <select
            value={licenseData.tipoLicenca}
            onChange={(e) => handleChange('tipoLicenca', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-gray-900"
          >
            <option value="contrato">Contrato</option>
            <option value="experiencia">Experiência</option>
            <option value="demonstracao">Demonstração</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Data Início */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data Início <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={licenseData.dataInicio}
              onChange={(e) => handleChange('dataInicio', e.target.value)}
              onBlur={() => handleBlur('dataInicio')}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 ${
                errors.dataInicio || fieldErrors['dataInicio'] ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
            />
            {(errors.dataInicio || fieldErrors['dataInicio']) && <p className="text-red-500 text-xs mt-1">{errors.dataInicio || 'Campo obrigatório'}</p>}
          </div>

          {/* Data Expiração */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data Expiração <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={licenseData.dataExpiracao}
              onChange={(e) => handleChange('dataExpiracao', e.target.value)}
              onBlur={() => handleBlur('dataExpiracao')}
              min={licenseData.dataInicio}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 ${
                errors.dataExpiracao || fieldErrors['dataExpiracao'] ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
            />
            {(errors.dataExpiracao || fieldErrors['dataExpiracao']) && <p className="text-red-500 text-xs mt-1">{errors.dataExpiracao || 'Campo obrigatório'}</p>}
          </div>
        </div>

        {/* Dia de Vencimento */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Dia de Vencimento</label>
          <select
            value={licenseData.diaVencimento}
            onChange={(e) => handleChange('diaVencimento', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-gray-900"
          >
            <option value="">Selecionar</option>
            {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
              <option key={day} value={day}>
                Dia {day}
              </option>
            ))}
          </select>
          <label className="flex items-center gap-2 mt-2 cursor-pointer">
            <input
              type="checkbox"
              checked={licenseData.baseadoContratacao}
              onChange={(e) => handleChange('baseadoContratacao', e.target.checked)}
              className="w-4 h-4 text-primary focus:ring-primary rounded"
            />
            <span className="text-sm text-gray-600">Com base no dia da contratação</span>
          </label>
        </div>

        {/* Intervalo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Intervalo <span className="text-red-500">*</span>
          </label>
          <select
            value={licenseData.intervalo}
            onChange={(e) => handleChange('intervalo', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-gray-900"
          >
            <option value="mensal">Mensal</option>
            <option value="trimestral">Trimestral</option>
            <option value="semestral">Semestral</option>
            <option value="anual">Anual</option>
          </select>
        </div>

        {/* Usuários Adicionais */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Usuários Adicionais</label>
          <input
            type="number"
            value={licenseData.usuariosAdicionais}
            onChange={(e) => handleChange('usuariosAdicionais', parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-gray-900"
            min="0"
          />
        </div>

        {/* Valor da Parcela */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Valor da Parcela (R$) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={licenseData.valorParcela}
            onChange={(e) => handleChange('valorParcela', parseFloat(e.target.value) || 0)}
            onBlur={() => handleBlur('valorParcela')}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 ${
              errors.valorParcela || fieldErrors['valorParcela'] ? 'border-red-500 bg-red-50' : 'border-gray-300'
            }`}
            min="0"
            step="0.01"
            placeholder="0,00"
          />
          {(errors.valorParcela || fieldErrors['valorParcela']) && <p className="text-red-500 text-xs mt-1">{errors.valorParcela || 'Campo obrigatório'}</p>}
        </div>

        {/* Opções */}
        <div className="space-y-2 pt-2 border-t border-gray-200">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={licenseData.bloqueado}
              onChange={(e) => handleChange('bloqueado', e.target.checked)}
              className="w-4 h-4 text-primary focus:ring-primary rounded"
            />
            <span className="text-sm text-gray-700">🚫 Licença Bloqueada</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={licenseData.renovacaoAutomatica}
              onChange={(e) => handleChange('renovacaoAutomatica', e.target.checked)}
              className="w-4 h-4 text-primary focus:ring-primary rounded"
            />
            <span className="text-sm text-gray-700">🔄 Renovação Automática</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={licenseData.apenasModelosPDF}
              onChange={(e) => handleChange('apenasModelosPDF', e.target.checked)}
              className="w-4 h-4 text-primary focus:ring-primary rounded"
            />
            <span className="text-sm text-gray-700">📄 Apenas Modelos PDF</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={licenseData.permiteToken}
              onChange={(e) => handleChange('permiteToken', e.target.checked)}
              className="w-4 h-4 text-primary focus:ring-primary rounded"
            />
            <span className="text-sm text-gray-700">🔑 Permite Token API</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={licenseData.permiteCriarModelos}
              onChange={(e) => handleChange('permiteCriarModelos', e.target.checked)}
              className="w-4 h-4 text-primary focus:ring-primary rounded"
            />
            <span className="text-sm text-gray-700">🎨 Permite Criar Modelos</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={licenseData.permiteCadastrarProdutos}
              onChange={(e) => handleChange('permiteCadastrarProdutos', e.target.checked)}
              className="w-4 h-4 text-primary focus:ring-primary rounded"
            />
            <span className="text-sm text-gray-700">📦 Permite Cadastrar Produtos</span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default LicenseDataForm;
