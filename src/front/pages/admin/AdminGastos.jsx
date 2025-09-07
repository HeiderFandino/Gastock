import React, { useMemo, useState, useEffect } from "react";
import ResumenGastos from "./VistaGastos/ResumenGastos";
import GastoPorRestauranteChart from "./VistaGastos/GastoPorRestauranteChart";
import EvolucionGastoMensual from "./VistaGastos/EvolucionGastoMensual";
import TablaProveedores from "./VistaGastos/TablaProveedores";


const AdminGastos = () => {
  // ÚNICA fecha para toda la vista
  const hoy = useMemo(() => new Date(), []);
  const [fechaSeleccionada, setFechaSeleccionada] = useState(
    `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}`
  );
  const [ano, mes] = fechaSeleccionada.split("-").map(Number);

  const retrocederMes = () => {
    const [a, m] = fechaSeleccionada.split("-").map(Number);
    const d = new Date(a, m - 2);
    setFechaSeleccionada(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  };

  const avanzarMes = () => {
    const [a, m] = fechaSeleccionada.split("-").map(Number);
    const d = new Date(a, m);
    setFechaSeleccionada(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  };

  // UX: al abrir la vista, subir al top del panel
  useEffect(() => {
    const el = document.getElementsByClassName("custom-sidebar")[0];
    if (el) el.scrollTo(0, 0);
  }, []);

  return (
    <div className="analytics-page">
      {/* Encabezado + ÚNICO control de fecha */}
      <div className="d-flex flex-wrap align-items-center justify-content-between analytics-header">
        <div>
          <h2 className="fw-bold mb-1">Resumen de gastos globales</h2>
          <p className="analytics-subtitle">Comparativa mensual por restaurante y proveedor</p>
        </div>

        <div className="d-flex align-items-center page-toolbar mt-3 mt-sm-0">
          <label className="fw-bold mb-0 me-2">Fecha:</label>
          <button className="btn btn-nav" onClick={retrocederMes}>←</button>
          <input
            type="month"
            className="form-control form-control-sm text-center"
            value={fechaSeleccionada}
            onChange={(e) => setFechaSeleccionada(e.target.value)}
          />
          <button className="btn btn-nav" onClick={avanzarMes}>→</button>
        </div>
      </div>

      {/* KPIs */}
      <ResumenGastos mes={mes} ano={ano} />

      {/* Gráficos */}
      <div className="row mt-3">
        <div className="col-12 col-lg-6 mb-4">
          <div className="card-plain p-3 h-100">
            <div className="block-title">Gasto por restaurante</div>
            <div className="chart-wrap">
              <GastoPorRestauranteChart mes={mes} ano={ano} />
            </div>
          </div>
        </div>
        <div className="col-12 col-lg-6 mb-4">
          <div className="card-plain p-3 h-100">
            <div className="block-title">Evolución de gasto mensual</div>
            <div className="chart-wrap">
              <EvolucionGastoMensual ano={ano} />
            </div>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="card-plain p-3">
        <h6 className="fw-bold mb-3">Top proveedores por gasto total</h6>
        <div className="table-responsive">
          <TablaProveedores mes={mes} ano={ano} />
        </div>
      </div>
    </div>
  );
};

export default AdminGastos;