const PrintersSection = () => {
  const printers = [
    {
      id: 1,
      name: 'Zebra ZD420',
      type: 'Thermal - ZPL | 58mm',
      status: 'Conectada',
      statusColor: 'bg-green-100 text-green-800',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-500',
    },
    {
      id: 2,
      name: 'Argox OS-214',
      type: 'Thermal - PPLA | 80mm',
      status: 'Conectada',
      statusColor: 'bg-green-100 text-green-800',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-500',
    },
    {
      id: 3,
      name: 'HP LaserJet Pro',
      type: 'A4 - PDF',
      status: 'Offline',
      statusColor: 'bg-yellow-100 text-yellow-800',
      iconBg: 'bg-gray-100',
      iconColor: 'text-gray-500',
    },
  ];

  return (
    <div className="dashboard-card bg-white rounded-lg p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Impressoras Configuradas</h2>
      <div className="space-y-4">
        {printers.map((printer) => (
          <div key={printer.id} className="flex items-center justify-between p-3 border rounded-md">
            <div className="flex items-center">
              <div className={`h-10 w-10 rounded-md ${printer.iconBg} flex items-center justify-center`}>
                <i className={`fas fa-print ${printer.iconColor}`}></i>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium">{printer.name}</h3>
                <p className="text-xs text-gray-500">{printer.type}</p>
              </div>
            </div>
            <span className={`px-2 py-1 text-xs rounded-full ${printer.statusColor}`}>
              {printer.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PrintersSection;
