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
ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);
const EvolucionGastoMensual = () => {
  const [datos, setDatos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [anoActual] = useState(new Date().getFullYear());
  useEffect(() => {
    const fetchData = async () => {
      try {
        const resultado = await adminService.getEvolucionGastoMensual(anoActual);
        setDatos(resultado);
      } catch (error) {
        console.error("Error al obtener evolución mensual:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [anoActual]);
  const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  const data = {
    labels: datos.map(d => meses[d.mes - 1]),
    datasets: [
      {
        label: "Gasto total (€)",
        data: datos.map(d => d.total_gastado),
        borderColor: "#FF6600",
        backgroundColor: "rgba(255, 102, 0, 0.2)",
        tension: 0.3,
        fill: true,
        pointBackgroundColor: "#FF6600",
        pointRadius: 4,
      },
    ],
  };
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: value => `€${value}`,
        },
      },
    },
  };
  if (loading) return <p>Cargando evolución mensual...</p>;
  if (!datos.length || datos.every(d => d.total_gastado === 0)) return <p>No hay datos para mostrar este año.</p>;
  return (
    <div className="p-3 bg-white rounded shadow-sm" style={{ height: "320px" }}>
      <h6 className="mb-3 fw-bold">Evolución de gasto mensual (últimos 6 meses)</h6>
      <div style={{ height: "260px" }}>
        <Line data={data} options={options} />
      </div>
    </div>
  );
};
export default EvolucionGastoMensual;
















