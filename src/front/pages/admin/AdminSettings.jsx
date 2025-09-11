import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Estilos ya incluidos en brand-unified.css

export const AdminSettings = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const el = document.getElementsByClassName("custom-sidebar")[0];
    if (el) el.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-vh-100" style={{ background: 'var(--color-bg)' }}>
      {/* Header sticky moderno */}
      <div 
        className="position-sticky top-0 border-bottom" 
        style={{ 
          background: 'var(--color-bg)', 
          borderColor: 'var(--color-border)',
          zIndex: 10
        }}
      >
        <div className="container-fluid px-4 py-3">
          <h4 className="fw-bold mb-1">
            ⚙️ Configuración del Sistema
          </h4>
          <p className="text-muted small mb-0">
            Gestiona las configuraciones generales de la aplicación
          </p>
        </div>
      </div>

      <div className="container-fluid px-4 py-4">
        {/* Configuraciones disponibles */}
        <div className="row g-4 mb-4">
          <div className="col-12 col-md-6 col-xl-4">
            <div 
              className="h-100 position-relative overflow-hidden"
              style={{
                background: 'var(--color-bg-card)',
                border: '1px solid var(--color-border)',
                borderRadius: '16px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                transition: 'all 0.3ms ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)';
              }}
            >
              <div className="p-3 border-bottom" style={{ borderColor: 'var(--color-border)' }}>
                <div className="d-flex align-items-center gap-3">
                  <div 
                    className="d-flex align-items-center justify-content-center"
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))',
                      color: 'white',
                      fontSize: '18px'
                    }}
                  >
                    👥
                  </div>
                  <h5 className="mb-0 fw-semibold">Gestión de Usuarios</h5>
                </div>
              </div>
              <div className="p-3">
                <p className="text-muted mb-3">Administra los usuarios del sistema y sus permisos.</p>
                <button 
                  className="btn btn-gastock-outline w-100" 
                  onClick={() => navigate("/admin/usuarios")}
                >
                  Gestionar Usuarios
                </button>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-6 col-xl-4">
            <div 
              className="h-100 position-relative overflow-hidden"
              style={{
                background: 'var(--color-bg-card)',
                border: '1px solid var(--color-border)',
                borderRadius: '16px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                transition: 'all 0.3ms ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)';
              }}
            >
              <div className="p-3 border-bottom" style={{ borderColor: 'var(--color-border)' }}>
                <div className="d-flex align-items-center gap-3">
                  <div 
                    className="d-flex align-items-center justify-content-center"
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, var(--color-success), var(--color-success-dark))',
                      color: 'white',
                      fontSize: '18px'
                    }}
                  >
                    🏪
                  </div>
                  <h5 className="mb-0 fw-semibold">Restaurantes</h5>
                </div>
              </div>
              <div className="p-3">
                <p className="text-muted mb-3">Configura y administra los restaurantes registrados.</p>
                <button 
                  className="btn btn-gastock-outline w-100" 
                  onClick={() => navigate("/admin/restaurante")}
                >
                  Gestionar Restaurantes
                </button>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-6 col-xl-4">
            <div 
              className="h-100 position-relative overflow-hidden"
              style={{
                background: 'var(--color-bg-card)',
                border: '1px solid var(--color-border)',
                borderRadius: '16px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                transition: 'all 0.3ms ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)';
              }}
            >
              <div className="p-3 border-bottom" style={{ borderColor: 'var(--color-border)' }}>
                <div className="d-flex align-items-center gap-3">
                  <div 
                    className="d-flex align-items-center justify-content-center"
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, var(--color-info), var(--color-info-dark))',
                      color: 'white',
                      fontSize: '18px'
                    }}
                  >
                    📊
                  </div>
                  <h5 className="mb-0 fw-semibold">Reportes y Analytics</h5>
                </div>
              </div>
              <div className="p-3">
                <p className="text-muted mb-3">Accede a los reportes detallados de ventas y gastos.</p>
                <div className="d-grid gap-2">
                  <button 
                    className="btn btn-gastock-outline" 
                    onClick={() => navigate("/admin/ventas")}
                    style={{ fontSize: '0.875rem' }}
                  >
                    Ver Ventas
                  </button>
                  <button 
                    className="btn btn-gastock-outline" 
                    onClick={() => navigate("/admin/gastos")}
                    style={{ fontSize: '0.875rem' }}
                  >
                    Ver Gastos
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-6 col-xl-4">
            <div 
              className="h-100 position-relative overflow-hidden"
              style={{
                background: 'var(--color-bg-card)',
                border: '1px solid var(--color-border)',
                borderRadius: '16px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                transition: 'all 0.3ms ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)';
              }}
            >
              <div className="p-3 border-bottom" style={{ borderColor: 'var(--color-border)' }}>
                <div className="d-flex align-items-center gap-3">
                  <div 
                    className="d-flex align-items-center justify-content-center"
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, var(--color-warning), var(--color-warning-dark))',
                      color: 'white',
                      fontSize: '18px'
                    }}
                  >
                    ⚙️
                  </div>
                  <h5 className="mb-0 fw-semibold">Configuración General</h5>
                </div>
              </div>
              <div className="p-3">
                <p className="text-muted mb-3">Configuraciones generales del sistema.</p>
                <div 
                  className="p-3 rounded-3"
                  style={{
                    background: 'var(--color-info-light)',
                    color: 'var(--color-info)',
                    border: '1px solid var(--color-info-border)'
                  }}
                >
                  <small>
                    <strong>Próximamente:</strong> Configuración de monedas, idiomas, y notificaciones.
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Información del sistema */}
        <div className="row">
          <div className="col-12">
            <div 
              style={{
                background: 'var(--color-bg-card)',
                border: '1px solid var(--color-border)',
                borderRadius: '16px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
              }}
            >
              <div className="p-3 border-bottom" style={{ borderColor: 'var(--color-border)' }}>
                <div className="d-flex align-items-center gap-3">
                  <div 
                    className="d-flex align-items-center justify-content-center"
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, var(--color-secondary), var(--color-secondary-dark))',
                      color: 'white',
                      fontSize: '18px'
                    }}
                  >
                    ℹ️
                  </div>
                  <h5 className="mb-0 fw-semibold">Información del Sistema</h5>
                </div>
              </div>
              <div className="p-4">
                <div className="row g-4 text-center">
                  <div className="col-6 col-sm-3">
                    <div 
                      className="p-3 rounded-3"
                      style={{
                        background: 'var(--color-bg-subtle)',
                        border: '1px solid var(--color-border)'
                      }}
                    >
                      <div className="text-muted small mb-1">Versión</div>
                      <div className="fw-bold">v1.0.0</div>
                    </div>
                  </div>
                  <div className="col-6 col-sm-3">
                    <div 
                      className="p-3 rounded-3"
                      style={{
                        background: 'var(--color-bg-subtle)',
                        border: '1px solid var(--color-border)'
                      }}
                    >
                      <div className="text-muted small mb-1">Estado</div>
                      <div className="fw-bold" style={{ color: 'var(--color-success)' }}>Activo</div>
                    </div>
                  </div>
                  <div className="col-6 col-sm-3">
                    <div 
                      className="p-3 rounded-3"
                      style={{
                        background: 'var(--color-bg-subtle)',
                        border: '1px solid var(--color-border)'
                      }}
                    >
                      <div className="text-muted small mb-1">Base de Datos</div>
                      <div className="fw-bold" style={{ color: 'var(--color-success)' }}>Conectada</div>
                    </div>
                  </div>
                  <div className="col-6 col-sm-3">
                    <div 
                      className="p-3 rounded-3"
                      style={{
                        background: 'var(--color-bg-subtle)',
                        border: '1px solid var(--color-border)'
                      }}
                    >
                      <div className="text-muted small mb-1">Última actualización</div>
                      <div className="fw-bold">{new Date().toLocaleDateString()}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
