import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import "../../styles/AdminGastos.css";

export const AdminSettings = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const el = document.getElementsByClassName("custom-sidebar")[0];
    if (el) el.scrollTo(0, 0);
  }, []);

  return (
    <div className="dashboard-container">
      {/* ===== Header compacto v2 ===== */}
      <div className="ag-header mb-3">
        <div className="ag-header-top">

          <div className="ag-brand-dot" />
        </div>

        <div className="ag-title-wrap">
          <h1 className="ag-title">Configuración del Sistema</h1>
          <p className="ag-subtitle">Gestiona las configuraciones generales de la aplicación.</p>
        </div>
      </div>

      {/* ===== Configuraciones disponibles ===== */}
      <div className="ag-grid">
        <div className="ag-card">
          <div className="ag-card-header">
            <div className="ag-icon">👥</div>
            <h5 className="mb-0">Gestión de Usuarios</h5>
          </div>
          <div className="p-3">
            <p className="text-muted mb-3">Administra los usuarios del sistema y sus permisos.</p>
            <button className="btn btn-outline-primary w-100" onClick={() => navigate("/admin/usuarios")}>
              Gestionar Usuarios
            </button>
          </div>
        </div>

        <div className="ag-card">
          <div className="ag-card-header">
            <div className="ag-icon">🏪</div>
            <h5 className="mb-0">Restaurantes</h5>
          </div>
          <div className="p-3">
            <p className="text-muted mb-3">Configura y administra los restaurantes registrados.</p>
            <button className="btn btn-outline-primary w-100" onClick={() => navigate("/admin/restaurante")}>
              Gestionar Restaurantes
            </button>
          </div>
        </div>

        <div className="ag-card">
          <div className="ag-card-header">
            <div className="ag-icon">📊</div>
            <h5 className="mb-0">Reportes y Analytics</h5>
          </div>
          <div className="p-3">
            <p className="text-muted mb-3">Accede a los reportes detallados de ventas y gastos.</p>
            <div className="d-grid gap-2">
              <button className="btn btn-outline-success" onClick={() => navigate("/admin/ventas")}>
                Ver Ventas
              </button>
              <button className="btn btn-outline-danger" onClick={() => navigate("/admin/gastos")}>
                Ver Gastos
              </button>
            </div>
          </div>
        </div>

        <div className="ag-card">
          <div className="ag-card-header">
            <div className="ag-icon">⚙️</div>
            <h5 className="mb-0">Configuración General</h5>
          </div>
          <div className="p-3">
            <p className="text-muted mb-3">Configuraciones generales del sistema.</p>
            <div className="alert alert-info">
              <small>
                <strong>Próximamente:</strong> Configuración de monedas, idiomas, y notificaciones.
              </small>
            </div>
          </div>
        </div>
      </div>

      {/* ===== Información del sistema ===== */}
      <div className="ag-card mt-3">
        <div className="ag-card-header">
          <div className="ag-icon">ℹ️</div>
          <h5 className="mb-0">Información del Sistema</h5>
        </div>
        <div className="p-3">
          <div className="row g-3 text-center">
            <div className="col-6 col-sm-3">
              <div className="text-muted small">Versión</div>
              <div className="fw-bold">v1.0.0</div>
            </div>
            <div className="col-6 col-sm-3">
              <div className="text-muted small">Estado</div>
              <div className="fw-bold text-success">Activo</div>
            </div>
            <div className="col-6 col-sm-3">
              <div className="text-muted small">Base de Datos</div>
              <div className="fw-bold text-success">Conectada</div>
            </div>
            <div className="col-6 col-sm-3">
              <div className="text-muted small">Última actualización</div>
              <div className="fw-bold">{new Date().toLocaleDateString()}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
