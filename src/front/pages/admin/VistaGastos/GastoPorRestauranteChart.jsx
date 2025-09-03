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

// helper: convierte "€1.234,56" o "1234.56" a número
const toNumber = (v) => {
  if (v == null) return 0;
  if (typeof v === "number") return v;
  const clean = String(v).replace(/[^\d.-]/g, "");
  const n = Number(clean);
  return Number.isFinite(n) ? n : 0;
};

const GastoPorRestauranteChart = ({ mes, ano }) => {
  const [dataChart, setDataChart] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!mes || !ano) return;
      setLoading(true);
      try {
        const data = await adminService.getGastoPorRestauranteChart(mes, ano);
        if (!mounted) return;
        setDataChart(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error en getGastoPorRestauranteChart:", err);
        setDataChart([]);
      } finally {
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [mes, ano]);

  if (loading) return <p>Cargando gráfico...</p>;
  if (!dataChart.length) return <p>No hay datos para mostrar en este periodo.</p>;

  const valores = dataChart.map((item) => toNumber(item.total_gastado));
  const max = Math.max(...valores, 0);
  const suggestedMax = max <= 0 ? 1 : Math.ceil(max * 1.1);

  // índice del mayor valor
  const maxIndex = valores.reduce((maxIdx, v, i, arr) => (v > arr[maxIdx] ? i : maxIdx), 0);

  const backgroundColors = valores.map((_, i) =>
    i === maxIndex ? "rgba(255, 91, 0, 0.85)" : "rgba(220, 220, 220, 0.8)"
  );
  const borderColors = valores.map((_, i) =>
    i === maxIndex ? "#ff5b00" : "rgba(0,0,0,0.06)"
  );

  const chartData = {
    labels: dataChart.map((item) => item.restaurante),
    datasets: [
      {
        label: "Gasto (€)",
        data: valores,
        backgroundColor: backgroundColors,
        borderColor: borderColors,
        borderWidth: 1,
        borderRadius: 8,
        barThickness: 24,
        maxBarThickness: 28,
      },
    ],
  };

  const options = {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
    layout: { padding: 6 },
    plugins: { legend: { display: false }, tooltip: { enabled: true } },
    scales: {
      x: {
        beginAtZero: true,
        suggestedMax,
        grid: { color: "#eef1f4" },
        ticks: {
          color: "#6b7280",
          maxTicksLimit: 6,
          callback: (v) => `€${Number(v).toLocaleString("es-ES")}`,
        },
      },
      y: {
        ticks: { color: "#6b7280", font: { weight: "bold" } },
        grid: { color: "#eef1f4" },
      },
    },
  };

  // el padre ya envuelve con .chart-wrap; si no, puedes envolver tú
  return <Bar data={chartData} options={options} />;
};

export default GastoPorRestauranteChart;
