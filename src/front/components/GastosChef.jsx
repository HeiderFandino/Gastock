import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

const GastosChef = ({
  datos,
  ancho = "100%",
  alto = 300,
  rol = "grafico"
}) => {
  if (!datos || datos.length === 0) {
    return (
      <div className="text-center py-4" style={{ height: alto }}>
        <div className="ag-icon mx-auto mb-3" style={{
          background: '#fef3c7',
          color: '#d97706',
          width: 48,
          height: 48,
          fontSize: '1.5rem'
        }}>📊</div>
        <p className="text-muted">No hay datos para mostrar</p>
      </div>
    );
  }

  const data = {
    labels: datos.map(d => d.name),
    datasets: [
      {
        label: "Porcentaje de gastos",
        data: datos.map(d => d.porcentaje),
        borderColor: "#3B82F6",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        tension: 0.4,
        fill: true,
        pointBackgroundColor: "#3B82F6",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index',
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#ffffff',
        titleColor: '#1f2937',
        bodyColor: '#1f2937',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        titleFont: { weight: 'bold' },
        bodyFont: { size: 13 },
        callbacks: {
          label: (context) => `${context.parsed.y}%`
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: '#f3f4f6',
          borderDash: [3, 3]
        },
        ticks: {
          color: '#6b7280',
          font: { size: 12, weight: '500' }
        }
      },
      y: {
        beginAtZero: true,
        max: 100,
        grid: {
          color: '#f3f4f6',
          borderDash: [3, 3]
        },
        ticks: {
          color: '#6b7280',
          font: { size: 12, weight: '500' },
          callback: v => `${v}%`
        }
      },
    },
  };

  return (
    <div role={rol} style={{ height: alto, padding: '10px' }}>
      <Line data={data} options={options} />
    </div>
  );
};

export default GastosChef;
