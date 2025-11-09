import { useAuth } from '@hooks/useAuth';
import StatsCards from '@components/dashboard/StatsCards';
import ChartsSection from '@components/dashboard/ChartsSection';
import TemplatesSection from '@components/dashboard/TemplatesSection';
import RecentActivity from '@components/dashboard/RecentActivity';
import PrintersSection from '@components/dashboard/PrintersSection';
import ApiStatusSection from '@components/dashboard/ApiStatusSection';
import DashboardCliente from '../components/dashboard/DashboardCliente';

const Dashboard = () => {
  const { user } = useAuth();

  console.log('📊 Dashboard - Usuário:', user);
  console.log('📊 Dashboard - Tipo:', user?.tipo);

  // Se for cliente, mostra dashboard específico
  if (user?.tipo === 'cliente') {
    console.log('✅ Renderizando DashboardCliente');
    return <DashboardCliente />;
  }

  console.log('✅ Renderizando Dashboard Master');
  
  // Dashboard Master (original)
  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard de Etiquetas</h1>
        <p className="text-gray-600">Sistema de emissão de etiquetas com integração API</p>
      </div>

      <StatsCards />
      <ChartsSection />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <TemplatesSection />
        <RecentActivity />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PrintersSection />
        <ApiStatusSection />
      </div>
    </>
  );
};

export default Dashboard;
