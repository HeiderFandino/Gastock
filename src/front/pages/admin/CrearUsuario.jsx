
import React from "react";
import { useNavigate } from "react-router-dom";

import "../../styles/AdminGastos.css";

export const CrearUsuario = () => {
  const navigate = useNavigate();

  return (
    <div className="dashboard-container">
      {/* ===== Header compacto v2 ===== */}
      <div className="ag-header mb-3">
        <div className="ag-header-top">

          <div className="ag-brand-dot" />
        </div>

        <div className="ag-title-wrap">
          <h1 className="ag-title">Crear Usuario</h1>
          <p className="ag-subtitle">Registra un nuevo usuario en el sistema.</p>
        </div>
      </div>

      {/* ===== Formulario de creación ===== */}
      <div className="ag-card">
        <div className="ag-card-header">
          <div className="ag-icon">👤</div>
          <h5 className="mb-0">Información del Usuario</h5>
        </div>
        <div className="p-3">
          <div className="alert alert-info">
            <small>
              <strong>Próximamente:</strong> Funcionalidad de creación de usuarios en desarrollo.
            </small>
          </div>
          <p className="text-muted">
            Esta sección permitirá crear nuevos usuarios con diferentes roles y permisos en el sistema.
          </p>
        </div>
      </div>
    </div>
  );
};
