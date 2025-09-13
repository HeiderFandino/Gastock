// src/front/pages/admin/VistaGastos/EvolucionGastoMensual.jsx
import React, { useEffect, useState } from "react";
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
import adminService from "../../../services/adminService";
import "../../../styles/EncargadoDashboard.css";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

const EvolucionGastoMensual = ({ ano }) => {
  const [datos, setDatos] = useState([]);
  const [loading, setLoading] = useState(true);
  const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!ano) return;
      setLoading(true);
      try {
        const resultado = await adminService.getEvolucionGastoMensual(ano);
        if (!mounted) return;
        setDatos(resultado || []);
      } catch (error) {
        console.error("Error al obtener evolución mensual:", error);
        setDatos([]);
      } finally {
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [ano]);

  const data = {
    labels: datos.map(d => meses[d.mes - 1]),
    datasets: [
      {
        label: "Gasto total (€)",
        data: datos.map(d => d.total_gastado),
        borderColor: "#87abe5",
        backgroundColor: "rgba(135, 171, 229, 0.1)",
        tension: 0.4,
        fill: true,
        pointBackgroundColor: "#87abe5",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
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
        bodyFont: { size: 13 }
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
        grid: { 
          color: '#f3f4f6',
          borderDash: [3, 3]
        },
        ticks: { 
          color: '#6b7280',
          font: { size: 12, weight: '500' },
          callback: v => `€${Number(v).toLocaleString("es-ES")}`
        }
      },
    },
  };

  if (loading) return (
    <div className="card-brand" style={{ minHeight: 360 }}>
      <div className="text-center py-5">
        <div className="spinner-border" style={{ color: '#2563eb' }} role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p className="mt-3 text-muted">Cargando evolución mensual...</p>
      </div>
    </div>
  );
  
  if (!datos.length || datos.every(d => d.total_gastado === 0)) return (
    <div className="card-brand" style={{ minHeight: 360 }}>
      <div className="text-center py-5">
        <div className="ag-icon mx-auto mb-3" style={{ 
          background: '#fef3c7', 
          color: '#d97706', 
          width: 48, 
          height: 48, 
          fontSize: '1.5rem' 
        }}>📊</div>
        <p className="text-muted">No hay datos para mostrar este año.</p>
      </div>
    </div>
  );

  return (
    <div className="card-brand" style={{ minHeight: 380 }}>
      <h6 className="ag-card-title mb-4" style={{ color: '#2563eb' }}>📉 Evolución de gastos ({datos.length} meses)</h6>
      <div style={{ height: 300, padding: '10px' }}>
        <Line data={data} options={options} />
      </div>
    </div>
  );
};

export default EvolucionGastoMensual;
