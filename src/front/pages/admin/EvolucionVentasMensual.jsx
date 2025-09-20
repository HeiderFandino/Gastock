import React, { useEffect, useMemo, useState } from "react";
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
import adminService from "../../services/adminService";
import { useSearchParams } from "react-router-dom";
import "../../styles/EncargadoDashboard.css";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

const EvolucionVentasMensual = ({ ano: anoProp, hastaMes: hastaMesProp, ultimos = 6 }) => {
  const [searchParams] = useSearchParams();
  const hoy = useMemo(() => new Date(), []);
  const anoFromUrl = Number(searchParams.get("ano")) || null;
  const mesFromUrl = Number(searchParams.get("mes")) || null;

  const ano = anoProp || anoFromUrl || hoy.getFullYear();
  const hastaMes = Math.max(1, Math.min(12, hastaMesProp || mesFromUrl || hoy.getMonth() + 1));

  const [datos, setDatos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancel = false;
    const fetchData = async () => {
      setLoading(true);
      try {
        const resultado = await adminService.getEvolucionVentaMensual(ano);
        if (cancel) return;

        const ordenados = (resultado || [])
          .map((d) => ({ mes: Number(d.mes), total_vendido: Number(d.total_vendido || 0) }))
          .filter((d) => d.mes >= 1 && d.mes <= hastaMes)
          .sort((a, b) => a.mes - b.mes);

        const sliceStart = Math.max(0, ordenados.length - ultimos);
        setDatos(ordenados.slice(sliceStart));
      } catch (error) {
        console.error("Error al obtener evolución mensual de ventas:", error);
        setDatos([]);
      } finally {
        if (!cancel) setLoading(false);
      }
    };
    fetchData();
    return () => { cancel = true; };
  }, [ano, hastaMes, ultimos]);

  const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  const data = {
    labels: datos.map((d) => meses[d.mes - 1]),
    datasets: [
      {
        label: "Ventas totales (€)",
        data: datos.map((d) => d.total_vendido),
        borderColor: "#87abe5",
        backgroundColor: "rgba(135,171,229,0.1)",
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
          callback: (v) => `€${Number(v).toLocaleString("es-ES")}`
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
  
  if (!datos.length || datos.every((d) => d.total_vendido === 0)) return (
    <div className="card-brand" style={{ minHeight: 360 }}>
      <div className="text-center py-5">
        <div className="ag-icon mx-auto mb-3" style={{ 
          background: '#fef3c7', 
          color: '#d97706', 
          width: 48, 
          height: 48, 
          fontSize: '1.5rem' 
        }}>📊</div>
        <p className="text-muted">No hay datos para mostrar.</p>
      </div>
    </div>
  );

  return (
    <div className="card-brand" style={{ minHeight: 380 }}>
      <h6 className="ag-card-title mb-4" style={{ color: '#2563eb' }}>📈 Evolución de ventas (últimos {datos.length} meses)</h6>
      <div style={{ height: 300, padding: '10px' }}>
        <Line data={data} options={options} />
      </div>
    </div>
  );
};

export default EvolucionVentasMensual;
