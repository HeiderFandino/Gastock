import { Link } from "react-router-dom";
import "../styles/QuickActionCard.css"; // agrega estilos específicos

export const QuickActionsEncargado = ({ onNuevaVenta }) => {
    const actions = [
        {
            icon: "➕",
            title: "Registrar Venta",
            subtitle: "Agregar ventas diarias",
            onClick: onNuevaVenta,
            bg: "bg-warning-subtle",
        },
        {
            icon: "📅",
            title: "Ver Ventas",
            subtitle: "Historial mensual",
            link: "/encargado/ventas",
            bg: "bg-primary-subtle",
        },
        {
            icon: "📈",
            title: "Resumen de Gastos",
            subtitle: "Gasto mensual",
            link: "/encargado/gastos",
            bg: "bg-success-subtle",
        },
    ];

    return (
        <div className="mt-0 text-center">
            <h5 className="mb-3 fw-bold barralarga">⚡ Acciones Rápidas</h5>

            {/* ✅ Móvil: grid simple */}
            <div className="d-flex d-md-none justify-content-around gap-2">
                {actions.map((a, i) =>
                    a.onClick ? (
                        <button
                            key={i}
                            className="qa-icon-btn"
                            onClick={a.onClick}
                            title={a.title}
                        >
                            <div className={`qa-circle ${a.bg}`}>{a.icon}</div>
                            <small className="d-block mt-1">{a.title}</small>
                        </button>
                    ) : (
                        <Link key={i} to={a.link} className="qa-icon-btn text-dark">
                            <div className={`qa-circle ${a.bg}`}>{a.icon}</div>
                            <small className="d-block mt-1">{a.title}</small>
                        </Link>
                    )
                )}
            </div>

            {/* ✅ Desktop: tarjetas como antes */}
            <div className="d-none d-md-flex flex-wrap justify-content-center gap-4">
                {actions.map((a, i) =>
                    a.onClick ? (
                        <div
                            key={i}
                            className="card shadow-sm rounded p-3 h-100 text-center hover-shadow"
                            style={{ flex: "1 1 200px", maxWidth: "230px", cursor: "pointer" }}
                            onClick={a.onClick}
                        >
                            <div
                                className={`rounded-circle ${a.bg} d-flex align-items-center justify-content-center mx-auto mb-3`}
                                style={{ width: "60px", height: "60px", fontSize: "1.5rem" }}
                            >
                                {a.icon}
                            </div>
                            <h6 className="fw-bold">{a.title}</h6>
                            <small className="text-muted">{a.subtitle}</small>
                        </div>
                    ) : (
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
                    )
                )}
            </div>
        </div>
    );
};
