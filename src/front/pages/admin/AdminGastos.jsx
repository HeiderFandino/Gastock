import React from "react";
import ResumenGastos from "./VistaGastos/ResumenGastos";
import GastoPorRestauranteChart from "./VistaGastos/GastoPorRestauranteChart";
import EvolucionGastoMensual from "./VistaGastos/EvolucionGastoMensual";
import TablaProveedores from "./VistaGastos/TablaProveedores";
import FiltrosGasto from "./VistaGastos/FiltrosGasto";
const AdminGastos = () => {
  return (
    <div className="dashboard-container">
      {/* Encabezado */}
      <h2 className="fw-bold">Resumen de gastos globales</h2>
      <p className="text-muted">
        Comparativa mensual por restaurante y proveedor
      </p>
      {/* KPIs principales */}
      <ResumenGastos />
      {/* Gráficos: barras y línea */}
      <div className="row mt-4">
        <div className="col-12 col-sm-12 col-md-12 col-md-12 col-lg-6 mb-md-4">
          <div className="card p-3 h-100">
            <GastoPorRestauranteChart />
          </div>
        </div>
        <div className="col-12 col-sm-12 col-md-12 col-md-12 col-lg-6 mb-md-4">
          <div className="card p-3 h-100">
            <EvolucionGastoMensual />
          </div>
        </div>
      </div>
      {/* Tabla + filtros como columnas separadas */}
      <div className="row">
        <div className="col-md-15 mb-4">
          <div className="card p-3 h-100">
            <h1 className="mb-3">Top proveedores por gasto total</h1>
            <TablaProveedores />
          </div>
        </div>
        {/* <div className="col-md-4 mb-4">
          <div className="card p-3 h-100">
            <h6 className="mb-3">Filtros</h6>
            <FiltrosGasto />
          </div>
        </div> */}
      </div>
    </div>
  );
};
export default AdminGastos;





















