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

  const total = leyenda.reduce((acc, item) => acc + item.valor, 0);

  return (
    <div className="row g-3">
      {leyenda.map((item, i) => {
        let icono = "📦";
        const nombre = item.label.toLowerCase();

        if (nombre.includes("alimento")) icono = "🍎";
        else if (nombre.includes("bebida")) icono = "🥤";
        else if (nombre.includes("limpieza")) icono = "🧽";
        else icono = "🎯";

        const porcentajeWidth = (item.valor / total) * 100;

        return (
          <div key={i} className="col-12 col-md-6 col-lg-3">
            <div className="ag-card p-3">
              <div className="d-flex align-items-center gap-2 mb-2">
                <span className="ag-icon" style={{ fontSize: '1.5rem' }}>{icono}</span>
                <div className="flex-grow-1">
                  <h6 className="ag-card-title mb-0">{item.label}</h6>
                </div>
              </div>

              <div className="ag-card-value mb-2">€{item.valor.toFixed(2)}</div>

              <div className="mb-2">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <small className="text-muted">Porcentaje del total</small>
                  <small className="fw-bold">{item.porcentaje}%</small>
                </div>
                <div className="progress" style={{ height: '6px' }}>
                  <div
                    className="progress-bar"
                    style={{
                      width: `${porcentajeWidth}%`,
                      backgroundColor: item.color
                    }}
                  ></div>
                </div>
              </div>

              <div className="d-flex justify-content-between text-muted" style={{ fontSize: '0.8rem' }}>
                <span>Promedio día</span>
                <span>€{(item.valor / new Date().getDate()).toFixed(1)}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
