// src/front/pages/admin/VistaGastos/FiltrosGasto.jsx
import React from "react";
import "../../styles/EncargadoDashboard.css";

const FiltrosGasto = () => {
  return (
    <div className="card-brand mt-4">
      <h6 className="ag-card-title mb-4" style={{ color: '#2563eb' }}>⚙️ Filtros de gastos</h6>
      
      <div className="d-flex justify-content-start align-items-end flex-wrap gap-3">
        <div className="mb-2">
          <label htmlFor="selectRestaurante" className="ag-card-label mb-2 d-block" style={{ color: '#374151', fontWeight: '600' }}>
            Restaurante
          </label>
          <select 
            className="form-select form-select-sm" 
            id="selectRestaurante" 
            disabled
            style={{
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              background: '#f9fafb',
              color: '#6b7280',
              fontSize: '0.875rem',
              minWidth: '200px'
            }}
          >
            <option>Selecciona un restaurante</option>
          </select>
        </div>
        
        <div className="mb-2">
          <button 
            className="btn btn-sm" 
            disabled
            style={{
              background: '#f3f4f6',
              border: '1px solid #e5e7eb',
              color: '#6b7280',
              borderRadius: '8px',
              fontWeight: '500',
              padding: '8px 16px'
            }}
          >
            Ver detalle
          </button>
        </div>
      </div>
    </div>
  );
};
export default FiltrosGasto;
