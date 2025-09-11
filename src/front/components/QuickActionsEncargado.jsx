import { Link } from "react-router-dom";
// Estilos ya incluidos en brand-unified.css

export const QuickActionsEncargado = ({ onNuevaVenta }) => {
  const actions = [
    {
      icon: "➕",
      title: "Registrar Venta",
      subtitle: "Agregar ventas diarias",
      onClick: onNuevaVenta,
      bgToken: "var(--tint-warning-12)",
      fgToken: "var(--color-warning)",
    },
    {
      icon: "📅",
      title: "Ver Ventas",
      subtitle: "Historial mensual",
      link: "/encargado/ventas",
      bgToken: "var(--tint-primary-12)",
      fgToken: "var(--color-primary)",
    },
    {
      icon: "📈",
      title: "Resumen de Gastos",
      subtitle: "Gasto mensual",
      link: "/encargado/gastos",
      bgToken: "var(--tint-success-12)",
      fgToken: "var(--color-success)",
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
              {a.onClick ? (
                <button
                  onClick={a.onClick}
                  className="text-decoration-none btn p-0 w-100"
                  aria-label={a.title}
                  style={{ background: "none", border: "none" }}
                >
                  {content}
                </button>
              ) : (
                <Link
                  to={a.link}
                  className="text-decoration-none"
                  aria-label={a.title}
                >
                  {content}
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
