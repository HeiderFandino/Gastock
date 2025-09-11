
import React from "react";
import { useNavigate } from "react-router-dom";

// Estilos ya incluidos en brand-unified.css

export const CrearUsuario = () => {
  const navigate = useNavigate();

  return (
    <div className="min-vh-100" style={{ background: "var(--color-bg)" }}>
      {/* Header simplificado */}
      <div
        className="sticky-top"
        style={{ background: "var(--color-bg)", borderBottom: "1px solid var(--color-border)", zIndex: 10 }}
      >
        <div className="container-fluid px-4 py-3">
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center">
              <button
                className="btn d-flex align-items-center justify-content-center me-3"
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  background: 'var(--color-bg-card)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-secondary)',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'var(--color-bg-subtle)';
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.color = 'var(--color-text)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'var(--color-bg-card)';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.color = 'var(--color-text-secondary)';
                }}
                onClick={() => navigate('/admin/usuarios')}
                title="Volver a Usuarios"
                aria-label="Volver a Usuarios"
              >
                ←
              </button>
              <div>
                <h1 className="h4 fw-bold mb-0" style={{ color: "var(--color-text)" }}>
                  👤 Crear Usuario
                </h1>
                <p className="text-muted mb-0 small">Registra un nuevo usuario en el sistema</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-fluid px-4 py-4">

        {/* ===== Formulario de creación ===== */}
        <div 
          style={{ 
            background: "var(--color-bg-card)", 
            border: "1px solid var(--color-border)", 
            borderRadius: "16px", 
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)" 
          }}
        >
          <div 
            className="d-flex align-items-center px-4 py-3" 
            style={{ borderBottom: "1px solid var(--color-border)" }}
          >
            <div 
              className="d-flex align-items-center justify-content-center me-3"
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))",
                color: "white"
              }}
            >
              👤
            </div>
            <h5 className="mb-0 fw-bold" style={{ color: "var(--color-text)" }}>
              Información del Usuario
            </h5>
          </div>
          <div className="p-4">
            <div 
              className="p-3 rounded-3 mb-3"
              style={{
                background: 'var(--color-info-light)',
                color: 'var(--color-info)',
                border: '1px solid var(--color-info-border)'
              }}
            >
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
    </div>
  );
};
