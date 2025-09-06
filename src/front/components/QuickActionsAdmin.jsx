import { Link } from "react-router-dom";
import "../styles/AdminDashboardBB.css";

export const QuickActionsAdmin = () => {
  // Definimos colores usando tus design tokens (brand.css)
  const actions = [
    {
      icon: "📈",
      title: "Ventas",
      subtitle: "Ver resumen mensual",
      link: "/admin/ventas",
      bgToken: "var(--tint-success-12)",
      fgToken: "var(--color-success)",
    },
    {
      icon: "🏢",
      title: "Crear Restaurante",
      subtitle: "Registrar nuevo local",
      link: "/admin/restaurantes/restaurant",
      bgToken: "var(--tint-info-12)",
      fgToken: "var(--color-info)",
    },
    {
      icon: "👥",
      title: "Usuarios",
      subtitle: "Gestionar roles",
      link: "/admin/usuarios",
      bgToken: "var(--tint-warning-12)",
      fgToken: "var(--color-warning)",
    },
  ];

  return (
    <div className="mt-0">
      <h5 className="mb-3 fw-bold text-brand">⚡ Acciones rápidas</h5>

      {/* Grid responsive con tarjetas estilo Gastock */}
      <div className="row g-3 justify-content-center">
        {actions.map((a, i) => (
          <div key={i} className="col-6 col-sm-4 col-md-3">
            <Link
              to={a.link}
              className="text-decoration-none"
              aria-label={a.title}
            >
              <div
                className=" card-quic card-brand p-3 h-100 text-center d-flex flex-column align-items-center justify-content-start"

              >
                {/* Ícono circular con tinte del token */}
                <div
                  className="d-flex align-items-center justify-content-center rounded-circle mb-3"
                  style={{
                    width: 60,
                    height: 60,
                    background: a.bgToken,
                    color: a.fgToken,
                    boxShadow: "var(--shadow-sm)",
                  }}
                >
                  <span style={{ fontSize: "1.5rem", lineHeight: 1 }}>{a.icon}</span>
                </div>

                <h6 className="fw-bold mb-1 text-center" style={{ color: "var(--color-text)" }}>
                  {a.title}
                </h6>
                <small className="text-muted text-center">{a.subtitle}</small>

                {/* CTA opcional visual: mantiene toda la card clickable */}
                <div className="mt-3">
                  <span
                    className="btn-gastock-outline btn-sm"
                    role="button"
                    onClick={(e) => e.preventDefault()}
                    style={{ pointerEvents: "none" }}
                  >
                    Abrir
                  </span>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};
