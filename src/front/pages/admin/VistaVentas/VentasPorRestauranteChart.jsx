import React, { useEffect, useMemo, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import adminService from "../../../services/adminService";
import { useSearchParams } from "react-router-dom";
import "../../../styles/EncargadoDashboard.css";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const toNumber = (v) => {
  if (v == null) return 0;
  if (typeof v === "number") return v;
  const clean = String(v).replace(/[^\d.-]/g, "");
  const n = Number(clean);
  return Number.isFinite(n) ? n : 0;
};

const VentasPorRestauranteChart = ({
  mes: mesProp,
  ano: anoProp,
  showTitle = false, // dejar false para evitar duplicar títulos
}) => {
  const [searchParams] = useSearchParams();
  const hoy = useMemo(() => new Date(), []);
  const mesFromUrl = Number(searchParams.get("mes")) || null;
  const anoFromUrl = Number(searchParams.get("ano")) || null;

  const mes = mesProp || mesFromUrl || hoy.getMonth() + 1;
  const ano = anoProp || anoFromUrl || hoy.getFullYear();

  const [dataChart, setDataChart] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        setLoading(true);
        const data = await adminService.getVentasPorRestauranteChart(mes, ano);
        if (cancel) return;
        setDataChart(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("getVentasPorRestauranteChart:", err);
        setDataChart([]);
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => { cancel = true; };
  }, [mes, ano]);

  if (loading) return (
    <div className="text-center py-4">
      <div className="spinner-border" style={{ color: '#87abe5' }} role="status">
        <span className="visually-hidden">Cargando...</span>
      </div>
      <p className="mt-3 text-muted">Cargando gráfico...</p>
    </div>
  );
  
  if (!dataChart.length) return (
    <div className="text-center py-4">
      <div className="ag-icon mx-auto mb-3" style={{ 
        background: '#fef3c7', 
        color: '#d97706', 
        width: 48, 
        height: 48, 
        fontSize: '1.5rem' 
      }}>📊</div>
      <p className="text-muted">No hay datos para mostrar este mes.</p>
    </div>
  );

  const valores = dataChart.map((item) => toNumber(item.total_vendido));
  const max = Math.max(...valores, 0);
  const suggestedMax = max <= 0 ? 1 : Math.ceil(max * 1.1);

  // índice del mayor valor
  const maxIndex = valores.reduce((maxIdx, v, i, arr) => (v > arr[maxIdx] ? i : maxIdx), 0);

  const backgroundColors = valores.map((_, i) =>
    i === maxIndex ? "#87abe5" : "#f3f4f6"
  );
  const borderColors = valores.map((_, i) =>
    i === maxIndex ? "#1d4ed8" : "#e5e7eb"
  );

  const chartData = {
    labels: dataChart.map((item) => item.restaurante),
    datasets: [
      {
        label: "Ventas (€)",
        data: valores,
        backgroundColor: backgroundColors,
        borderColor: borderColors,
        borderWidth: 2,
        borderRadius: 8,
        barThickness: 22,
        maxBarThickness: 26,
      },
    ],
  };

  const options = {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
    layout: { padding: { top: 15, right: 15, bottom: 15, left: 15 } },
    plugins: { 
      legend: { display: false }, 
      tooltip: { 
        enabled: true,
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
        beginAtZero: true,
        suggestedMax,
        grid: { 
          color: "#f3f4f6",
          borderDash: [2, 2]
        },
        ticks: {
          color: "#6b7280",
          font: { size: 12, weight: '500' },
          maxTicksLimit: 5,
          callback: (v) => `€${Number(v).toLocaleString("es-ES")}`,
        },
      },
      y: { 
        ticks: { 
          color: "#374151", 
          font: { weight: "600", size: 13 }
        }, 
        grid: { 
          color: "#f3f4f6",
          borderDash: [2, 2]
        }
      },
    },
  };

  return (
    <>
      {showTitle && <h6 className="ag-card-title" style={{ color: '#2563eb' }}>🏢 Ventas por restaurante</h6>}
      <Bar data={chartData} options={options} />
    </>
  );
};

export default VentasPorRestauranteChart;
