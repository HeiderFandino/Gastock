import { Link } from "react-router-dom";
import { FiTrendingUp, FiSettings, FiUsers, FiPlusSquare, FiBarChart2, FiDollarSign } from "react-icons/fi";
import "../styles/AdminDashboardBB.css";

export const QuickActionsAdmin = () => {
  const actions = [
    {
      icon: <FiTrendingUp size={24} />,
      title: "Ventas",
      subtitle: "Ver resumen mensual",
      link: "/admin/ventas",
      bgToken: "var(--tint-success-12)",
      fgToken: "var(--color-success)",
    },
    {
      icon: <FiDollarSign size={24} />,
      title: "Gastos",
      subtitle: "Análisis de gastos",
      link: "/admin/gastos",
      bgToken: "var(--tint-danger-12)",
      fgToken: "var(--color-danger)",
    },
    {
      icon: <FiUsers size={24} />,
      title: "Usuarios",
      subtitle: "Gestionar roles",
      link: "/admin/usuarios",
      bgToken: "var(--tint-warning-12)",
      fgToken: "var(--color-warning)",
    },
    {
      icon: <FiPlusSquare size={24} />,
      title: "Restaurante",
      subtitle: "Crear nuevo",
      link: "/admin/restaurante",
      bgToken: "var(--tint-info-12)",
      fgToken: "var(--color-info)",
    },
    {
      icon: <FiBarChart2 size={24} />,
      title: "Reportes",
      subtitle: "Analytics avanzados",
      link: "/admin/reportes",
      bgToken: "var(--tint-purple-12, #f3f0ff)",
      fgToken: "var(--color-purple, #8b5cf6)",
    },
    {
      icon: <FiSettings size={24} />,
      title: "Configuración",
      subtitle: "Ajustes del sistema",
      link: "/admin/settings",
      bgToken: "var(--tint-gray-12, #f8f9fa)",
      fgToken: "var(--color-gray, #6c757d)",
    },
  ];

  return (
    <>
      {/* ===== Lista mobile (compacta) ===== */}
      <ul className="list-unstyled d-sm-none">
        {actions.map((a, i) => (
          <li key={i} className="mb-2">
            <Link
              to={a.link}
              className="text-decoration-none"
              aria-label={a.title}
            >
              <div className="d-flex align-items-center gap-3 p-3 rounded border" style={{ background: '#fff', borderColor: 'var(--border-100)' }}>
                <div
                  className="d-flex align-items-center justify-content-center rounded-circle"
                  style={{
                    width: 44,
                    height: 44,
                    background: a.bgToken,
                    color: a.fgToken,
                    flexShrink: 0
                  }}
                >
                  {a.icon}
                </div>
                <div className="flex-grow-1">
                  <div className="fw-bold" style={{ fontSize: '1rem', color: 'var(--color-text)' }}>{a.title}</div>
                  <div className="text-muted small">{a.subtitle}</div>
                </div>
                <div className="text-muted">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      {/* ===== Grid desktop ===== */}
      <div className="d-none d-sm-block">
        <div className="row g-3">
          {actions.map((a, i) => (
            <div key={i} className="col-6 col-md-4 col-lg-3">
              <Link
                to={a.link}
                className="text-decoration-none"
                aria-label={a.title}
              >
                <div className="p-3 h-100 text-center d-flex flex-column align-items-center justify-content-start rounded border hover-shadow" style={{ background: '#fff', borderColor: 'var(--border-100)', transition: 'transform 0.15s, box-shadow 0.15s' }}>
                  {/* Ícono circular con tinte del token */}
                  <div
                    className="d-flex align-items-center justify-content-center rounded-circle mb-3"
                    style={{
                      width: 52,
                      height: 52,
                      background: a.bgToken,
                      color: a.fgToken,
                      boxShadow: "var(--shadow-sm)",
                    }}
                  >
                    {a.icon}
                  </div>

                  <h6 className="fw-bold mb-1 text-center" style={{ color: "var(--color-text)" }}>
                    {a.title}
                  </h6>
                  <small className="text-muted text-center">{a.subtitle}</small>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};
