import React, { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip } from "chart.js";
import chefServices from "../services/chefServices";

ChartJS.register(ArcElement, Tooltip);

export const TortaCategorias = () => {
  const [data, setData] = useState(null);
  const [leyenda, setLeyenda] = useState([]);

  useEffect(() => {
    const fecha = new Date();
    const mes = fecha.getMonth() + 1;
    const ano = fecha.getFullYear();

    chefServices.categoriasResumen(mes, ano)
      .then((resumen) => {
        const labels = resumen.map((item) => item.categoria);
        const valores = resumen.map((item) => item.total);
        const total = valores.reduce((acc, val) => acc + val, 0);

        const colores = [
          "#b6effb", // alimentos
          "#f8cfcf", // bebidas
          "#b5e48c", // limpieza (verde)
          "#a3dbc5", // otros
          "#d6d8db", // extra
          "#f1b0b7"  // extra
        ];

        const leyendaInfo = labels.map((label, i) => ({
          label,
          valor: valores[i],
          color: colores[i % colores.length],
          porcentaje: ((valores[i] / total) * 100).toFixed(1),
        }));

        setLeyenda(leyendaInfo);

        if (!labels || labels.length === 0) {
          setData(null);
          return;
        }

        setData({
          labels,
          datasets: [
            {
              data: valores,
              backgroundColor: colores.slice(0, labels.length),
              borderWidth: 1,
            },
          ],
        });
      })
      .catch(() => {
        setData(null);
      });
  }, []);

  if (!data) return <p className="text-muted">Cargando gráfica de categorías...</p>;

  return (
    <div className="row">
      <div className="col-11 col-sm-11 col-md-3 d-flex flex-column gap-3 pe-md-0 ms-4">
        {leyenda.map((item, i) => {
          let icono = "📦";
          const nombre = item.label.toLowerCase();

          if (nombre.includes("alimento")) icono = "🍎";
          else if (nombre.includes("bebida")) icono = "🥤";
          else if (nombre.includes("limpieza")) icono = "🧽";
          else icono = "🎯";

          let textClass = "text-dark";
          if (item.color === "#b6effb") textClass = "text-info";
          else if (item.color === "#f8cfcf") textClass = "text-danger";
          else if (item.color === "#ffe299") textClass = "text-warning";
          else if (item.color === "#a3dbc5") textClass = "text-success";

          return (
            <div
              key={i}
              className="rounded shadow-sm text-center px-3 py-2 mb-2"
              style={{ backgroundColor: item.color }}
            >
              <div
                className="rounded-circle bg-white border d-inline-flex align-items-center justify-content-center mb-2 fw-bold"
                style={{ width: "50px", height: "50px", fontSize: "1.5rem", color: item.color }}
              >
                {icono}
              </div>
              <h6 className={`fw-bold fs-4 ${textClass} mb-1`} style={{ fontSize: "0.95rem", textShadow: "0 0 2px white" }}>
                {item.label}
              </h6>
              <div className={`fs-5 fw-bold ${textClass}`} style={{ fontSize: "0.9rem", textShadow: "0 0 1px white" }}>
                {item.valor.toFixed(2)}€
              </div>
              <div className={`fs-5 fw-bold ${textClass}`} style={{ fontSize: "0.9rem", textShadow: "0 0 1px white" }}>
                {item.porcentaje}%
              </div>
            </div>
          );
        })}
      </div>

      <div className="col-md-8 d-flex justify-content-center align-items-center">
        <div style={{ maxWidth: "800px", height: "450px" }}>
          <Pie
            data={data}
            options={{
              responsive: true,
              maintainAspectRatio: false,
            }}
          />
        </div>
      </div>
    </div>
  );
};
