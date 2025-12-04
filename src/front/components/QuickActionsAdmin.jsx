import { Link } from "react-router-dom";
// Estilos ya incluidos en brand-unified.css

export const QuickActionsAdmin = () => {
  const actions = [
    {
      icon: "📅",
      title: "Ver Ventas",
      subtitle: "Historial mensual",
      link: "/admin/ventas",
      bgToken: "var(--tint-warning-12)",
      fgToken: "var(--color-warning)",
    },
    {
      icon: "📈",
      title: "Resumen de Gastos",
      subtitle: "Gasto mensual",
      link: "/admin/gastos",
      bgToken: "var(--tint-primary-12)",
      fgToken: "var(--color-primary)",
    },
    {
      icon: "👥",
      title: "Gestionar Usuarios",
      subtitle: "Roles y permisos",
      link: "/admin/usuarios",
      bgToken: "var(--tint-success-12)",
      fgToken: "var(--color-success)",
    },
    {
      icon: "⚡",
      title: "Actividad",
      subtitle: "Auditoría y cambios",
      link: "/admin/actividad",
      bgToken: "var(--tint-info-12)",
      fgToken: "var(--color-info)",
    },
  ];

  return (
    <div className="mt-0">
      {/* Grid responsive más compacto */}
      <div className="row g-2 justify-content-center">
        {actions.map((a, i) => {
          const content = (
            <div
              className="card-quic card-brand p-2 h-100 text-center d-flex flex-column align-items-center justify-content-center"
            >
              {/* Ícono circular más pequeño */}
              <div
                className="d-flex align-items-center justify-content-center rounded-circle mb-2"
                style={{
                  width: 45,
                  height: 45,
                  background: a.bgToken,
                  color: a.fgToken,
                  boxShadow: "var(--shadow-sm)",
                }}
              >
                <span style={{ fontSize: "1.2rem", lineHeight: 1 }}>{a.icon}</span>
              </div>

              <h6 className="fw-bold mb-1 text-center" style={{ color: "var(--color-text)", fontSize: "0.85rem" }}>
                {a.title}
              </h6>
              <small className="text-muted text-center" style={{ fontSize: "0.7rem" }}>{a.subtitle}</small>
            </div>
          );

          return (
            <div key={i} className="col-4 col-sm-4 col-md-4">
              <Link
                to={a.link}
                className="text-decoration-none"
                aria-label={a.title}
              >
                {content}
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
};
