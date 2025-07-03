import React, { useEffect, useState } from "react";
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
ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);
const VentasPorRestauranteChart = () => {
  const [dataChart, setDataChart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(null); // ← estado de selección
  const fecha = new Date();
  const mes = fecha.getMonth() + 1;
  const ano = fecha.getFullYear();
  const fetchData = async () => {
    try {
      const data = await adminService.getVentasPorRestauranteChart(mes, ano);
      if (data.length === 0) throw new Error("Sin datos");
      setDataChart(data);
    } catch (err) {
      console.error("Error en getVentasPorRestauranteChart:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);
  if (loading) return <p>Cargando gráfico...</p>;
  if (error || !dataChart) return <p>No hay datos para mostrar este mes.</p>;
  const backgroundColors = dataChart.map((_, i) =>
    i === selectedIndex
      ? "rgba(255, 93, 29, 0.8)" // barra seleccionada
      : "rgba(200, 200, 200, 0.8)" // barra no seleccionada
  );
  const chartData = {
    labels: dataChart.map((item) => item.restaurante),
    datasets: [
      {
        label: "Ventas (€)",
        data: dataChart.map((item) => item.total_vendido),
        backgroundColor: backgroundColors,
        borderRadius: 6,
        barThickness: 24,
      },
    ],
  };
  const options = {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true },
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          callback: (value) => `€${value}`,
        },
      },
      y: {
        ticks: {
          font: {
            weight: "bold",
          },
        },
      },
    },
    onClick: (evt, elements) => {
      if (elements.length > 0) {
        const index = elements[0].index;
        setSelectedIndex(index);
      }
    },
  };
  return (
    <div className="mt-4 p-3 bg-white rounded shadow-sm" style={{ height: "350px" }}>
      <h6 className="fw-bold mb-3">Ventas por restaurante (junio {ano})</h6>
      <div style={{ height: "260px" }}>
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
};
export default VentasPorRestauranteChart;