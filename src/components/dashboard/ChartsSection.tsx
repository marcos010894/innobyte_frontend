import { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

const ChartsSection = () => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    // Destroy existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    chartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
        datasets: [
          {
            label: 'Etiquetas Térmicas',
            data: [320, 450, 380, 510, 420, 600, 550, 480, 520, 610, 580, 630],
            backgroundColor: '#3B82F6',
          },
          {
            label: 'Etiquetas A4',
            data: [120, 150, 180, 210, 190, 230, 250, 220, 240, 260, 280, 300],
            backgroundColor: '#10B981',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Quantidade de Etiquetas',
            },
          },
        },
      },
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <div className="dashboard-card bg-white rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Etiquetas Impressas por Tipo</h2>
          <div className="flex space-x-2">
            <button className="px-3 py-1 text-xs bg-blue-100 text-primary rounded-md">Mensal</button>
            <button className="px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded-md">Trimestral</button>
          </div>
        </div>
        <div className="h-80">
          <canvas ref={chartRef}></canvas>
        </div>
      </div>

      <div className="dashboard-card bg-white rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Pré-visualização do Modelo</h2>
        <div className="border rounded-lg p-4 bg-gray-50 mb-4">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium">
              Modelo: <span className="text-primary">Etiqueta Preço 40x30mm</span>
            </span>
            <span className="text-sm text-gray-500">Impressora Térmica</span>
          </div>

          <div className="preview-label mx-auto p-4 rounded" style={{ width: '240px', height: '180px' }}>
            <div className="flex justify-between items-start mb-2">
              <div className="text-xs font-bold">INNOBYTE</div>
              <div className="text-xs bg-yellow-100 px-1 rounded">DESTAQUE</div>
            </div>
            <div className="text-center mb-2">
              <div className="text-sm font-semibold">Notebook Dell i7</div>
              <div className="text-xs text-gray-600">15.6" 16GB 512SSD</div>
            </div>
            <div className="flex justify-center mb-2">
              <div className="bg-white p-1 rounded border inline-block">
                <div className="flex items-center justify-center h-8">
                  <div className="h-1 w-1 bg-black mr-1"></div>
                  <div className="h-1 w-1 bg-black mr-1"></div>
                  <div className="h-1 w-3 bg-black mr-1"></div>
                  <div className="h-1 w-1 bg-black mr-1"></div>
                  <div className="h-1 w-2 bg-black mr-1"></div>
                  <div className="h-1 w-1 bg-black mr-1"></div>
                  <div className="h-1 w-1 bg-black mr-1"></div>
                </div>
                <div className="text-xs text-center mt-1">7891234567890</div>
              </div>
            </div>
            <div className="flex justify-between items-end">
              <div className="text-xs">
                <div>SKU: DELL-NB-001</div>
                <div>Cor: Prata</div>
              </div>
              <div className="text-lg font-bold text-red-600">R$ 3.499,00</div>
            </div>
          </div>
        </div>

        <div className="flex space-x-2">
          <button className="flex-1 bg-primary text-white py-2 rounded-md flex items-center justify-center hover:bg-blue-600 transition-colors">
            <i className="fas fa-edit mr-2"></i>
            Editar Modelo
          </button>
          <button className="flex-1 bg-success text-white py-2 rounded-md flex items-center justify-center hover:bg-green-600 transition-colors">
            <i className="fas fa-print mr-2"></i>
            Imprimir Teste
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChartsSection;
