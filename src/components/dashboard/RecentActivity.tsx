const RecentActivity = () => {
  const activities = [
    {
      id: 1,
      icon: 'fa-print',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-500',
      title: 'Lote impresso',
      description: '45 etiquetas do modelo "Preço 40x30mm"',
      time: 'Há 15 minutos',
    },
    {
      id: 2,
      icon: 'fa-sync-alt',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-500',
      title: 'Sincronização com API',
      description: 'Atualizados 23 produtos do eGestor',
      time: 'Há 2 horas',
    },
    {
      id: 3,
      icon: 'fa-edit',
      iconBg: 'bg-yellow-100',
      iconColor: 'text-yellow-500',
      title: 'Modelo atualizado',
      description: '"Etiqueta Produto A4" foi modificado',
      time: 'Hoje às 09:45',
    },
    {
      id: 4,
      icon: 'fa-plus',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-500',
      title: 'Novo modelo criado',
      description: '"Rabicho 95x12mm" adicionado aos modelos',
      time: 'Ontem às 16:30',
    },
  ];

  return (
    <div className="dashboard-card bg-white rounded-lg p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Atividade Recente</h2>
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start">
            <div className="flex-shrink-0">
              <div className={`h-10 w-10 rounded-full ${activity.iconBg} flex items-center justify-center`}>
                <i className={`fas ${activity.icon} ${activity.iconColor}`}></i>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-900">{activity.title}</p>
              <p className="text-sm text-gray-500">{activity.description}</p>
              <p className="text-xs text-gray-400">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivity;
