import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import FiltersSection from '@components/users/FiltersSection';
import LicensesTable from '@components/users/LicensesTable';
import { getUsuarios, deleteUsuario } from '../services';
import type { UsuariosFilters } from '../types/api.types';

const UsersManagement = () => {
  const navigate = useNavigate();
  const [showFilters, setShowFilters] = useState(false);
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    vencidas_hoje: 0,
    vencendo_3_dias: 0,
    vencendo_7_dias: 0,
    bloqueadas: 0,
    ativas: 0,
    total_licencas: 0,
  });
  const [filters, setFilters] = useState<UsuariosFilters>({
    page: 1,
    limit: 100,
  });

  useEffect(() => {
    loadUsuarios();
  }, [filters]);

  const loadUsuarios = async () => {
    setLoading(true);
    const result = await getUsuarios(filters);
    
    if (result.success && result.data) {
      setUsuarios(result.data.data);
      setSummary(result.data.summary || summary);
    }
    setLoading(false);
  };

  const handleApplyFilters = (filterData: any) => {
    setFilters({
      ...filters,
      cliente: filterData.cliente || undefined,
      email: filterData.email || undefined,
      tipo_licenca: filterData.tipoLicenca || undefined,
      bloqueada: filterData.statusBloqueio === 'bloqueada' ? true : 
                 filterData.statusBloqueio === 'ativa' ? false : undefined,
      page: 1,
    });
    setShowFilters(false);
  };

  const handleClearFilters = () => {
    setFilters({ page: 1, limit: 100 });
  };

  const handleNewLicense = () => {
    navigate('/users/new');
  };

  const handleEditLicense = (license: any) => {
    navigate(`/users/edit/${license.id}`);
  };

  const handleDeleteUsuario = async (usuarioId: number) => {
    const result = await deleteUsuario(usuarioId);
    
    if (result.success) {
      toast.success('Cliente excluído com sucesso!');
      // Recarrega a lista
      loadUsuarios();
    } else {
      toast.error(`Erro ao excluir: ${result.message}`);
    }
  };

  return (
    <div>
      <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Gerenciamento de Usuários e Licenças</h1>
          <p className="text-sm sm:text-base text-gray-600">Gerencie licenças, clientes e permissões do sistema</p>
        </div>
        <div className="flex gap-2 sm:gap-3 flex-wrap">
          <button
            onClick={() => setShowFilters(true)}
            className="flex-1 sm:flex-none px-4 sm:px-6 py-2 sm:py-3 bg-primary text-white rounded-md hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 shadow-md text-sm sm:text-base"
          >
            <i className="fas fa-filter"></i>
            <span>Filtros</span>
          </button>
          <button
            onClick={handleNewLicense}
            className="flex-1 sm:flex-none px-4 sm:px-6 py-2 sm:py-3 bg-success text-white rounded-md hover:bg-green-600 transition-colors flex items-center justify-center gap-2 shadow-md text-sm sm:text-base"
          >
            <i className="fas fa-plus"></i>
            <span>Novo Usuário</span>
          </button>
        </div>
      </div>

      <div className="mb-4 sm:mb-6 grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 flex items-start gap-2 sm:gap-3">
          <i className="fas fa-bell text-red-500 text-lg sm:text-xl mt-0.5"></i>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-red-800 mb-1 text-sm sm:text-base">Atenção: Licenças Vencidas</h3>
            <div className="text-xs sm:text-sm text-red-700">
              <span className="font-medium">{summary.vencidas_hoje}</span> vencidas hoje •{' '}
              <span className="font-medium">{summary.vencendo_3_dias}</span> em 3 dias •{' '}
              <span className="font-medium">{summary.vencendo_7_dias}</span> em 7 dias
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4 flex items-start gap-2 sm:gap-3">
          <i className="fas fa-lock text-yellow-600 text-lg sm:text-xl mt-0.5"></i>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-yellow-800 mb-1 text-sm sm:text-base">Licenças Bloqueadas</h3>
            <div className="text-xs sm:text-sm text-yellow-700">
              <span className="font-medium">{summary.bloqueadas}</span> licenças bloqueadas
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4 flex items-start gap-2 sm:gap-3">
          <i className="fas fa-check-circle text-green-600 text-lg sm:text-xl mt-0.5"></i>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-green-800 mb-1 text-sm sm:text-base">Licenças Ativas</h3>
            <div className="text-xs sm:text-sm text-green-700">
              <span className="font-medium">{summary.ativas}</span> de {summary.total_licencas} ativas
            </div>
          </div>
        </div>
      </div>

      <LicensesTable 
        onSelectLicense={handleEditLicense}
        onDelete={handleDeleteUsuario}
        usuarios={usuarios}
        loading={loading}
      />

      {showFilters && (
        <>
          <div 
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 animate-fadeIn"
            onClick={() => setShowFilters(false)}
          ></div>
          
          <div className="fixed top-0 right-0 h-full w-full sm:w-[500px] bg-white shadow-2xl z-50 overflow-y-auto animate-slideInRight">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <i className="fas fa-filter text-primary"></i>
                  Filtros Avançados
                </h2>
                <button
                  onClick={() => setShowFilters(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors p-2 hover:bg-gray-100 rounded-full"
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>
              
              <FiltersSection 
                onClose={() => setShowFilters(false)}
                onApply={handleApplyFilters}
                onClear={handleClearFilters}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UsersManagement;
