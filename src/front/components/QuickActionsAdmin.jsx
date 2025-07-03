import { Link } from "react-router-dom";

export const QuickActionsAdmin = () => {
  const actions = [
    {
      icon: "📈",
      title: "Ventas",
      subtitle: "Ver resumen mensual",
      link: "/admin/ventas",
      bg: "bg-success-subtle"
    },
    {
      icon: "🏢",
      title: "Crear Restaurante",
      subtitle: "Registrar nuevo local",
      link: "/admin/restaurantes/restaurant",
      bg: "bg-info-subtle"
    },
    {
      icon: "👥",
      title: "Usuarios",
      subtitle: "Gestionar roles",
      link: "/admin/usuarios",
      bg: "bg-warning-subtle"
    }
  ];

  return (
    <div className="mt-0 text-center">
      <h5 className="mb-3 fw-bold barralarga">⚡ Acciones Rápidas</h5>

      <div className="d-flex flex-wrap justify-content-center gap-4">
        {actions.map((a, i) => (
          <Link
            to={a.link}
            key={i}
            className="text-decoration-none text-dark"
            style={{ flex: "1 1 200px", maxWidth: "230px" }}
          >
            <div className="card shadow-sm rounded p-3 h-100 text-center hover-shadow">
              <div
                className={`rounded-circle ${a.bg} d-flex align-items-center justify-content-center mx-auto mb-3`}
                style={{ width: "60px", height: "60px", fontSize: "1.5rem" }}
              >
                {a.icon}
              </div>
              <h6 className="fw-bold">{a.title}</h6>
              <small className="text-muted">{a.subtitle}</small>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
