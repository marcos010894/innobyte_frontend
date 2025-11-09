import { useState } from 'react';

interface FiltersSectionProps {
  onClose?: () => void;
  onApply?: (filterData: any) => void;
  onClear?: () => void;
}

const FiltersSection = ({ onClose, onApply, onClear }: FiltersSectionProps) => {
  const [filters, setFilters] = useState({
    cliente: '',
    email: '',
    tipoLicenca: '',
    statusBloqueio: '', // '' = todos, 'ativa' = false, 'bloqueada' = true
  });

  const handleFilterChange = (field: string, value: any) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleApplyFilters = () => {
    console.log('Aplicando filtros:', filters);
    if (onApply) {
      onApply(filters);
    }
    if (onClose) onClose();
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      cliente: '',
      email: '',
      tipoLicenca: '',
      statusBloqueio: '',
    };
    setFilters(clearedFilters);
    if (onClear) {
      onClear();
    }
    if (onClose) onClose();
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4">
        {/* Cliente */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <i className="fas fa-building text-primary mr-2"></i>
            Nome do Cliente
          </label>
          <input
            type="text"
            value={filters.cliente}
            onChange={(e) => handleFilterChange('cliente', e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900"
            placeholder="Digite o nome da empresa..."
          />
          <p className="text-xs text-gray-500 mt-1">
            Busca por qualquer parte do nome (ex: "Tech" encontra "TechSolutions")
          </p>
        </div>

        {/* E-mail */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <i className="fas fa-envelope text-primary mr-2"></i>
            E-mail
          </label>
          <input
            type="email"
            value={filters.email}
            onChange={(e) => handleFilterChange('email', e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900"
            placeholder="Digite o e-mail..."
          />
          <p className="text-xs text-gray-500 mt-1">
            Busca parcial (ex: "gmail" encontra todos com @gmail.com)
          </p>
        </div>

        {/* Tipo de Licença */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <i className="fas fa-certificate text-primary mr-2"></i>
            Tipo de Licença
          </label>
          <select
            value={filters.tipoLicenca}
            onChange={(e) => handleFilterChange('tipoLicenca', e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 bg-white"
          >
            <option value="">Todos os Tipos</option>
            <option value="contrato">📄 Contrato</option>
            <option value="experiencia">🆓 Experiência</option>
            <option value="demonstracao">👁️ Demonstração</option>
          </select>
        </div>

        {/* Status de Bloqueio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <i className="fas fa-shield-alt text-primary mr-2"></i>
            Status da Licença
          </label>
          <select
            value={filters.statusBloqueio}
            onChange={(e) => handleFilterChange('statusBloqueio', e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 bg-white"
          >
            <option value="">Todas</option>
            <option value="ativa">✅ Ativas (Desbloqueadas)</option>
            <option value="bloqueada">🔒 Bloqueadas</option>
          </select>
        </div>
      </div>

      {/* Resumo dos Filtros Ativos */}
      {(filters.cliente || filters.email || filters.tipoLicenca || filters.statusBloqueio) && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-blue-800 mb-2 flex items-center">
            <i className="fas fa-filter mr-2"></i>
            Filtros Ativos:
          </h4>
          <div className="flex flex-wrap gap-2">
            {filters.cliente && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                <i className="fas fa-building"></i>
                Cliente: {filters.cliente}
              </span>
            )}
            {filters.email && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                <i className="fas fa-envelope"></i>
                E-mail: {filters.email}
              </span>
            )}
            {filters.tipoLicenca && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                <i className="fas fa-certificate"></i>
                {filters.tipoLicenca === 'contrato' && 'Contrato'}
                {filters.tipoLicenca === 'experiencia' && 'Experiência'}
                {filters.tipoLicenca === 'demonstracao' && 'Demonstração'}
              </span>
            )}
            {filters.statusBloqueio && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                <i className="fas fa-shield-alt"></i>
                {filters.statusBloqueio === 'ativa' ? 'Ativas' : 'Bloqueadas'}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Botões de Ação */}
      <div className="flex gap-3 pt-4 border-t border-gray-200">
        <button
          onClick={handleClearFilters}
          className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 font-medium"
        >
          <i className="fas fa-redo"></i>
          Limpar Filtros
        </button>
        <button
          onClick={handleApplyFilters}
          className="flex-1 px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 font-medium shadow-md"
        >
          <i className="fas fa-search"></i>
          Aplicar Filtros
        </button>
      </div>
    </div>
  );
};

export default FiltersSection;
