import { Link } from "react-router-dom";
import "../styles/QuickActionCard.css";

export const QuickActionsEncargado = ({ onNuevaVenta }) => {
    const actions = [
        {
            icon: "➕",
            title: "Registrar Venta",
            subtitle: "Agregar ventas diarias",
            onClick: onNuevaVenta,
            tone: "warning",
        },
        {
            icon: "📅",
            title: "Ver Ventas",
            subtitle: "Historial mensual",
            link: "/encargado/ventas",
            tone: "primary",
        },
        {
            icon: "📈",
            title: "Resumen de Gastos",
            subtitle: "Gasto mensual",
            link: "/encargado/gastos",
            tone: "success",
        },
    ];

    return (
        <div className="section-wrapper">
            {/* Título sutil alineado con el resto de secciones */}
            <div className="section-title">⚡ Acciones Rápidas</div>

            {/* ====== Móvil: pills horizontales compactas ====== */}
            <div className="d-flex d-md-none qa-pills">
                {actions.map((a, i) =>
                    a.onClick ? (
                        <button
                            key={i}
                            className={`qa-pill qa-pill--${a.tone}`}
                            onClick={a.onClick}
                            title={a.title}
                            aria-label={a.title}
                        >
                            <span className="qa-pill__icon">{a.icon}</span>
                            <span className="qa-pill__text">{a.title}</span>
                        </button>
                    ) : (
                        <Link
                            key={i}
                            to={a.link}
                            className={`qa-pill qa-pill--${a.tone}`}
                            title={a.title}
                            aria-label={a.title}
                        >
                            <span className="qa-pill__icon">{a.icon}</span>
                            <span className="qa-pill__text">{a.title}</span>
                        </Link>
                    )
                )}
            </div>

            {/* ====== Desktop: tarjetas suaves con hover ====== */}
            <div className="d-none d-md-flex flex-wrap justify-content-center gap-4">
                {actions.map((a, i) =>
                    a.onClick ? (
                        <button
                            key={i}
                            className={`qa-card qa-card--${a.tone}`}
                            onClick={a.onClick}
                            title={a.title}
                        >
                            <div className="qa-card__icon">{a.icon}</div>
                            <div className="qa-card__title">{a.title}</div>
                            <div className="qa-card__sub">{a.subtitle}</div>
                        </button>
                    ) : (
                        <Link
                            key={i}
                            to={a.link}
                            className={`qa-card qa-card--${a.tone}`}
                            title={a.title}
                        >
                            <div className="qa-card__icon">{a.icon}</div>
                            <div className="qa-card__title">{a.title}</div>
                            <div className="qa-card__sub">{a.subtitle}</div>
                        </Link>
                    )
                )}
            </div>
        </div>
    );
};
