import React from 'react';
import { useNavigate } from 'react-router-dom';

const QuickActionsSection: React.FC = () => {
  const navigate = useNavigate();

  const actions = [
    {
      id: 'batch-print',
      title: 'Impressão em Lote',
      description: 'Imprima múltiplas etiquetas de produtos',
      icon: 'fa-print',
      color: 'from-purple-500 to-pink-500',
      action: () => navigate('/batch-print'),
    },
    {
      id: 'new-label',
      title: 'Nova Etiqueta',
      description: 'Crie uma nova etiqueta do zero',
      icon: 'fa-plus-circle',
      color: 'from-blue-500 to-cyan-500',
      action: () => navigate('/editor'),
    },
    {
      id: 'templates',
      title: 'Meus Templates',
      description: 'Acesse seus templates salvos',
      icon: 'fa-folder-open',
      color: 'from-green-500 to-emerald-500',
      action: () => navigate('/templates'),
    },
    {
      id: 'api',
      title: 'Integração API',
      description: 'Configure integrações externas',
      icon: 'fa-plug',
      color: 'from-orange-500 to-red-500',
      action: () => navigate('/api-integration'),
    },
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Ações Rápidas</h2>
          <p className="text-sm text-gray-500 mt-1">
            Acesso rápido às funcionalidades principais
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={action.action}
            className="group relative overflow-hidden rounded-lg border border-gray-200 hover:border-transparent transition-all duration-300 hover:shadow-lg"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-10 transition-opacity`}></div>
            
            <div className="relative p-4 text-left">
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br ${action.color} text-white mb-3 shadow-lg`}>
                <i className={`fas ${action.icon} text-xl`}></i>
              </div>
              
              <h3 className="font-semibold text-gray-900 mb-1">
                {action.title}
              </h3>
              
              <p className="text-xs text-gray-500 leading-relaxed">
                {action.description}
              </p>
              
              <div className="mt-3 text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                Acessar <i className="fas fa-arrow-right ml-1"></i>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActionsSection;
