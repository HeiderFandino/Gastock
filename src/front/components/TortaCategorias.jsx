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

  if (!data) return (
    <div className="text-center py-4">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Cargando...</span>
      </div>
      <p className="mt-3 text-muted">Cargando gráfica de categorías...</p>
    </div>
  );

  return (
    <div className="row">
      {/* Leyenda simple */}
      <div className="col-12 col-md-4">
        <div className="d-flex d-md-block gap-2 flex-wrap">
          {leyenda.map((item, i) => {
            let icono = "📦";
            const nombre = item.label.toLowerCase();

            if (nombre.includes("alimento")) icono = "🍎";
            else if (nombre.includes("bebida")) icono = "🥤";
            else if (nombre.includes("limpieza")) icono = "🧽";
            else icono = "🎯";

            return (
              <div key={i} className="d-flex align-items-center gap-2 p-2 mb-2 rounded" style={{
                backgroundColor: item.color,
                minWidth: '140px'
              }}>
                <span style={{ fontSize: '1.2rem' }}>{icono}</span>
                <div>
                  <div className="fw-bold text-dark" style={{ fontSize: '0.9rem' }}>
                    {item.label}
                  </div>
                  <div className="text-dark" style={{ fontSize: '0.8rem' }}>
                    €{item.valor.toFixed(2)} ({item.porcentaje}%)
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Gráfico simple */}
      <div className="col-12 col-md-8">
        <div className="d-flex justify-content-center" style={{ height: '300px' }}>
          <Pie
            data={data}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { display: false }
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};
