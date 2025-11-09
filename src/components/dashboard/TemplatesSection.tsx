const TemplatesSection = () => {
  const templates = [
    {
      id: 1,
      name: 'Etiqueta Preço 40x30mm',
      description: 'Impressora térmica - ZPL',
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-500',
    },
    {
      id: 2,
      name: 'Etiqueta Produto A4',
      description: '96 etiquetas por folha',
      bgColor: 'bg-green-100',
      iconColor: 'text-green-500',
    },
    {
      id: 3,
      name: 'Rabicho 95x12mm',
      description: 'Para prateleiras',
      bgColor: 'bg-purple-100',
      iconColor: 'text-purple-500',
    },
  ];

  return (
    <div className="dashboard-card bg-white rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Modelos de Etiqueta</h2>
        <button className="bg-primary text-white px-4 py-2 rounded-md flex items-center hover:bg-blue-600 transition-colors">
          <i className="fas fa-plus mr-2"></i>
          Novo Modelo
        </button>
      </div>
      <div className="space-y-4">
        {templates.map((template) => (
          <div
            key={template.id}
            className="template-item p-3 border rounded-md flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center">
              <div className={`h-10 w-10 rounded-md ${template.bgColor} flex items-center justify-center`}>
                <i className={`fas fa-tag ${template.iconColor}`}></i>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium">{template.name}</h3>
                <p className="text-xs text-gray-500">{template.description}</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button className="text-primary hover:text-blue-800 transition-colors p-2">
                <i className="fas fa-edit"></i>
              </button>
              <button className="text-green-500 hover:text-green-800 transition-colors p-2">
                <i className="fas fa-copy"></i>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TemplatesSection;
