import React from "react";

const FiltrosGasto = () => {
  return (
    <div className="d-flex justify-content-start align-items-end mt-4 flex-wrap">
      <div className="mb-2 me-3">
        <label htmlFor="selectRestaurante" className="form-label fw-bold">
          Restaurante
        </label>
        <select className="form-select form-select-sm me-2" id="selectRestaurante" disabled>
          <option>Selecciona un restaurante</option>
          {/* Opciones dinámicas irán aquí */}
        </select>
      </div>
      <div className="mb-2">
        <button className="btn btn-outline-primary btn-sm" disabled>
          Ver detalle
        </button>
      </div>
    </div>
  );
};
export default FiltrosGasto;






