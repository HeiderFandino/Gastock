
import React from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/AdminGastos.css";
import { FiArrowLeft } from "react-icons/fi";

export const RegistrarGasto = () => {
  const navigate = useNavigate();

  return (
    <div className="dashboard-container admin-bb">
      {/* ===== Header compacto v2 ===== */}
      <div className="ag-header mb-3">
        <div className="ag-header-top">
          <button className="btn btn-light ag-back" onClick={() => navigate('/encargado/gastos')}>
            <FiArrowLeft size={16} className="me-1" /> Volver
          </button>
          <div className="ag-brand-dot" />
        </div>

        <div className="ag-title-wrap">
          <h1 className="ag-title">Registrar Gasto</h1>
          <p className="ag-subtitle">Registra un nuevo gasto para el restaurante.</p>
        </div>
      </div>

      {/* ===== Formulario placeholder ===== */}
      <div className="ag-card">
        <div className="ag-card-header">
          <div className="ag-icon">💸</div>
          <h5 className="mb-0">Formulario de Gastos</h5>
        </div>
        <div className="p-3 p-md-4">
          <div className="text-center py-4">
            <div className="ag-icon mx-auto mb-2" style={{ width: 48, height: 48, fontSize: '1.5rem' }}>🚧</div>
            <p className="text-muted">Esta página está en desarrollo.</p>
            <p className="text-muted small">El formulario de registro de gastos se implementará próximamente.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
