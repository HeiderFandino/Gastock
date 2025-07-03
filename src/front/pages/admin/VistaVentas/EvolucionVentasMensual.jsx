import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend } from "chart.js";
import adminService from "../../../services/adminService";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);
const EvolucionVentaMensual = () => {
  const [datos, setDatos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [anoActual] = useState(new Date().getFullYear());
  useEffect(() => {
    const fetchData = async () => {
      try {
        const resultado = await adminService.getEvolucionVentaMensual(anoActual);
        setDatos(resultado);
      } catch (error) {
        console.error("Error al obtener evolución mensual de ventas:", error);
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
        label: "Ventas totales (€)",
        data: datos.map(d => d.total_vendido),
        borderColor: "#ff5d1d",
        backgroundColor: "#ff5d1d",
        tension: 0.3,
        fill: true,
        pointBackgroundColor: "#ff5d1d",
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
  if (loading) return <p>Cargando evolución mensual de ventas...</p>;
  if (!datos.length || datos.every(d => d.total_vendido === 0)) return <p>No hay datos para mostrar este año.</p>;
  return (
    <div className="p-3 bg-white rounded shadow-sm" style={{ height: "320px" }}>
      <h1 className="mb-3 fw-bold">Evolución de ventas mensual (últimos 6 meses)</h1>
      <div style={{ height: "260px" }}>
        <Line data={data} options={options} />
      </div>
    </div>
  );
};
export default EvolucionVentaMensual;