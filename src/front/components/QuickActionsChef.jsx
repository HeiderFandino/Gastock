import { Link } from "react-router-dom";

export const QuickActionsChef = () => {
  const actions = [
    {
      icon: "➕",
      title: "Registrar Gasto",
      subtitle: "Agregar nuevos albaranes",
      link: "/chef/gastos/registrar",
      gradient: "linear-gradient(135deg, #EF4444, #DC2626)"
    },
    {
      icon: "🚚",
      title: "Proveedores",
      subtitle: "Gestionar proveedores",
      link: "/chef/proveedores",
      gradient: "linear-gradient(135deg, #F59E0B, #D97706)"
    },
    {
      icon: "📊",
      title: "Ver Gastos",
      subtitle: "Resumen y detalle",
      link: "/chef/gastos",
      gradient: "linear-gradient(135deg, #10B981, #059669)"
    }
  ];

  return (
    <div className="row g-3">
      {actions.map((action, i) => (
        <div key={i} className="col-12 col-md-4">
          <Link to={action.link} className="text-decoration-none">
            <div className="ag-card p-3 text-center h-100">
              <div className="ag-icon mb-2">{action.icon}</div>
              <h6 className="ag-card-title mb-1">{action.title}</h6>
              <p className="ag-card-subtitle mb-0">{action.subtitle}</p>
            </div>
          </Link>
        </div>
      ))}
    </div>
  );
};
