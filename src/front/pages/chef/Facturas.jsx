import React from "react";

export const Facturas = () => {
  return (
    <div className="dashboard-container">
      {/* Header estilo gastock */}
      <div className="ag-header mb-4">
        <div className="ag-title-wrap">
          <h1 className="ag-title">🧾 Facturas</h1>
          <p className="ag-subtitle">Gestiona las facturas del restaurante</p>
        </div>
      </div>

      {/* Estado vacío */}
      <div className="empty-state text-center py-5">
        <div className="empty-icon mb-3">🧾</div>
        <h3 className="empty-title">Sección en desarrollo</h3>
        <p className="empty-text mb-4">La gestión de facturas estará disponible próximamente</p>
        <button className="btn-gastock" disabled>
          🕰️ Próximamente
        </button>
      </div>
    </div>
  );
};
