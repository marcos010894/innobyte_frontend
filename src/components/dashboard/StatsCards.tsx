interface StatCardProps {
  icon: string;
  iconBgColor: string;
  iconColor: string;
  title: string;
  value: string | number;
  badge: {
    icon: string;
    text: string;
    color: string;
  };
  subtitle: string;
}

const StatCard = ({ icon, iconBgColor, iconColor, title, value, badge, subtitle }: StatCardProps) => (
  <div className="dashboard-card bg-white rounded-lg p-6">
    <div className="flex items-center">
      <div className={`p-3 rounded-full ${iconBgColor} ${iconColor}`}>
        <i className={`fas ${icon} text-xl`}></i>
      </div>
      <div className="ml-4">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
      </div>
    </div>
    <div className="mt-4">
      <span className={`text-sm font-medium ${badge.color}`}>
        <i className={`fas ${badge.icon} mr-1`}></i>
        {badge.text}
      </span>
      <span className="text-gray-500 text-sm ml-1">{subtitle}</span>
    </div>
  </div>
);

const StatsCards = () => {
  const stats = [
    {
      icon: 'fa-layer-group',
      iconBgColor: 'bg-blue-100',
      iconColor: 'text-primary',
      title: 'Modelos de Etiqueta',
      value: 12,
      badge: {
        icon: 'fa-plus',
        text: '2 novos',
        color: 'text-green-500',
      },
      subtitle: 'este mês',
    },
    {
      icon: 'fa-print',
      iconBgColor: 'bg-green-100',
      iconColor: 'text-success',
      title: 'Etiquetas Impressas',
      value: '3,842',
      badge: {
        icon: 'fa-arrow-up',
        text: '18.5%',
        color: 'text-green-500',
      },
      subtitle: 'vs último mês',
    },
    {
      icon: 'fa-barcode',
      iconBgColor: 'bg-yellow-100',
      iconColor: 'text-yellow-500',
      title: 'Produtos no ERP',
      value: '1,248',
      badge: {
        icon: 'fa-sync-alt',
        text: 'Sincronizado',
        color: 'text-green-500',
      },
      subtitle: 'há 15 min',
    },
    {
      icon: 'fa-plug',
      iconBgColor: 'bg-purple-100',
      iconColor: 'text-purple-500',
      title: 'Conexão API',
      value: 'Ativa',
      badge: {
        icon: 'fa-check-circle',
        text: 'eGestor',
        color: 'text-green-500',
      },
      subtitle: 'Integração OK',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
};

export default StatsCards;
