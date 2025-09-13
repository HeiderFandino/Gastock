import { useEffect, useState } from "react";
import GastosChef from "../../components/GastosChef";
import { TortaCategorias } from "../../components/TortaCategorias";
import chefServices from "../../services/chefServices";
import { QuickActionsChef } from "../../components/QuickActionsChef";

export const ChefDashboard = () => {
  const [datos, SetDatos] = useState([]);
  const [resumenMensual, setResumenMensual] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fecha = new Date();
    const mes = fecha.getMonth() + 1;
    const ano = fecha.getFullYear();

    Promise.all([
      chefServices.resumenDiarioGastos(mes, ano),
      chefServices.resumenGastoMensual(mes, ano)
    ])
      .then(([resumenDiario, resumenMensual]) => {
        const data = resumenDiario.map((item) => ({
          name: `${item.dia}`,
          porcentaje: item.porcentaje,
        }));
        SetDatos(data);
        setResumenMensual(resumenMensual);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));

    const el = document.getElementsByClassName("custom-sidebar")[0];
    if (el) el.scrollTo(0, 0);
  }, []);

  const porcentaje = resumenMensual?.porcentaje || 0;
  const gasto = resumenMensual?.gastos || 0;

  let bgClass = "bg-success-subtle";
  let textClass = "text-success";
  let icono = "✅";

  if (porcentaje > 36) {
    bgClass = "bg-danger-subtle";
    textClass = "text-danger";
    icono = "🚨";
  } else if (porcentaje > 33) {
    bgClass = "bg-warning-subtle";
    textClass = "text-warning";
    icono = "⚠️";
  }

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-3 text-muted">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Header unificado estilo gastock */}
      <div className="ag-header mb-4">
        <div className="ag-title-wrap">
          <h1 className="ag-title">👨‍🍳 Dashboard Chef</h1>
          <p className="ag-subtitle">Monitorea los gastos y categorías del restaurante</p>
        </div>
      </div>

      {/* Métricas simples */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-md-6">
          <div className="ag-card p-4">
            <div className="d-flex align-items-center gap-3">
              <div className="ag-icon">💸</div>
              <div>
                <h6 className="ag-card-title mb-1">Gastos del Mes</h6>
                <div className="ag-card-value">{gasto} €</div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-6">
          <div className="ag-card p-4">
            <div className="d-flex align-items-center gap-3">
              <div className="ag-icon">{icono}</div>
              <div>
                <h6 className="ag-card-title mb-1">Porcentaje</h6>
                <div className={`ag-card-value ${textClass}`}>{porcentaje}%</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico diario */}
      <div className="ag-card p-4 mb-4">
        <div className="d-flex align-items-center gap-2 mb-3">
          <span className="ag-icon">📊</span>
          <h5 className="ag-section-title mb-0">Evolución Diaria</h5>
        </div>
        <GastosChef datos={datos} alto={280} />
      </div>

      {/* Distribución por categorías */}
      <div className="ag-card p-4 mb-4">
        <div className="d-flex align-items-center gap-2 mb-3">
          <span className="ag-icon">🍰</span>
          <h5 className="ag-section-title mb-0">Distribución por Categoría</h5>
        </div>
        <TortaCategorias />
      </div>

      {/* Acciones rápidas */}
      <div className="ag-card p-4">
        <div className="d-flex align-items-center gap-2 mb-3">
          <span className="ag-icon">⚡</span>
          <h5 className="ag-section-title mb-0">Acciones Rápidas</h5>
        </div>
        <QuickActionsChef />
      </div>
    </div>
  );
};
