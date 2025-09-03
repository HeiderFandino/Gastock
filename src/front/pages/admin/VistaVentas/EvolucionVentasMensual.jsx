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
import adminService from "../../../services/adminService";
import { useSearchParams } from "react-router-dom";

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
        borderColor: "#ff5d1d",
        backgroundColor: "rgba(255,93,29,0.15)",
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
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, ticks: { callback: (v) => `€${v}` } },
    },
  };

  if (loading) return <p>Cargando evolución mensual de ventas...</p>;
  if (!datos.length || datos.every((d) => d.total_vendido === 0)) return <p>No hay datos para mostrar.</p>;

  return (
    <div className="p-3 bg-white rounded shadow-sm" style={{ height: 320 }}>
      <h6 className="mb-3 fw-bold">Evolución de ventas (últimos {datos.length} meses)</h6>
      <div style={{ height: 260 }}>
        <Line data={data} options={options} />
      </div>
    </div>
  );
};

export default EvolucionVentasMensual;
