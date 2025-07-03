import React from "react";
import ResumenVentas from "./VistaVentas/ResumenVentas";
import VentasPorRestauranteChart from "./VistaVentas/VentasPorRestauranteChart";
import EvolucionVentasMensual from "./VistaVentas/EvolucionVentasMensual";
import TablaTopRestaurantes from "./VistaVentas/TablaTopRestaurantes";

const AdminVentas = () => {
  return (
    <div className="dashboard-container">
      {/* Encabezado */}
      <div className="mb-4">
        <h2 className="fw-bold">Resumen de ventas globales</h2>
        <p className="text-muted">
          Comparativa mensual por restaurante y evolución de ingresos
        </p>
      </div>
      {/* KPIs principales */}
      <ResumenVentas />
      {/* Gráficos: barras y línea */}
      <div className="row mt-4">
        <div className="col-md-6 mb-4">
          <div className="card p-3 h-100">
            <VentasPorRestauranteChart />
          </div>
        </div>
        <div className="col-md-6 mb-4">
          <div className="card p-3 h-100">
            <EvolucionVentasMensual />
          </div>
        </div>
      </div>
      {/* Tabla Top Restaurantes */}
      <div className="row">
        <div className="col-md-12 mb-4">
          <div className="card p-3 h-100">
            <h1 className="mb-3">Top restaurantes por ventas</h1>
            <TablaTopRestaurantes />
          </div>
        </div>
      </div>
    </div>
  );
};
export default AdminVentas;










