import { useEffect, useState } from "react";
import GastosChef from "../../components/GastosChef";
import { TortaCategorias } from "../../components/TortaCategorias";
import chefServices from "../../services/chefServices";
import { QuickActionsChef } from "../../components/QuickActionsChef";
import InlineLoader from "../../components/InlineLoader";
import restauranteService from "../../services/restauranteServices";
import useGlobalReducer from "../../hooks/useGlobalReducer";

export const ChefDashboard = () => {
  const { store } = useGlobalReducer();
  const [datos, SetDatos] = useState([]);
  const [resumenMensual, setResumenMensual] = useState(null);
  const [loading, setLoading] = useState(true);
  const [margenMin, setMargenMin] = useState(33);
  const [margenMax, setMargenMax] = useState(36);
  const restauranteId = store?.user?.restaurante_id || null;

  useEffect(() => {
    const fecha = new Date();
    const mes = fecha.getMonth() + 1;
    const ano = fecha.getFullYear();

    Promise.all([
      chefServices.resumenDiarioGastos(mes, ano),
      chefServices.resumenGastoMensual(mes, ano),
      restauranteService.getRestaurantes(sessionStorage.getItem("token"))
    ])
      .then(([resumenDiario, resumenMensual, restaurantes]) => {
        const data = resumenDiario.map((item) => ({
          name: `${item.dia}`,
          porcentaje: item.porcentaje,
        }));
        SetDatos(data);
        setResumenMensual(resumenMensual);

        if (Array.isArray(restaurantes)) {
          const r = restauranteId
            ? restaurantes.find((rr) => rr.id === restauranteId)
            : restaurantes[0];
          if (r) {
            if (r.porcentaje_min !== undefined && r.porcentaje_min !== null) {
              setMargenMin(Number(r.porcentaje_min));
            }
            if (r.porcentaje_max !== undefined && r.porcentaje_max !== null) {
              setMargenMax(Number(r.porcentaje_max));
            }
          }
        }
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

  if (porcentaje >= margenMax) {
    bgClass = "bg-danger-subtle";
    textClass = "text-danger";
    icono = "🚨";
  } else if (porcentaje > margenMin) {
    bgClass = "bg-warning-subtle";
    textClass = "text-warning";
    icono = "⚠️";
  }

  if (loading) {
    return (
      <div className="dashboard-container">
        <InlineLoader message="Cargando dashboard..." />
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Header optimizado para móvil */}
      <div className="ag-header mb-3 mb-md-4">
        <div className="ag-title-wrap text-center text-md-start">
          <h1 className="ag-title">👨‍🍳 Dashboard Chef</h1>
          <p className="ag-subtitle d-none d-md-block">Monitorea los gastos y categorías del restaurante</p>
          <p className="ag-subtitle d-md-none">Control de gastos</p>
        </div>
      </div>

      {/* Métricas - móvil optimizado */}
      <div className="row g-2 g-md-3 mb-3 mb-md-4">
        <div className="col-6 col-md-3">
          <div className="ag-card p-2 p-md-3 text-center">
            <div className="ag-icon mb-1 mb-md-2" style={{fontSize: '1.2rem'}}>💸</div>
            <h6 className="ag-card-title mb-1" style={{fontSize: '0.8rem'}}>Gastos</h6>
            <div className="ag-card-value" style={{fontSize: '1rem'}}>€{gasto}</div>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div className={`ag-card p-2 p-md-3 text-center status-card ${bgClass}`} style={{ borderRadius: 16 }}>
            <div className="ag-icon mb-1 mb-md-2" style={{fontSize: '1.2rem'}}>{icono}</div>
            <h6 className="ag-card-title mb-1" style={{fontSize: '0.8rem'}}>Margen</h6>
            <div className={`ag-card-value ${textClass}`} style={{fontSize: '1rem'}}>{porcentaje}%</div>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div className="ag-card p-2 p-md-3 text-center">
            <div className="ag-icon mb-1 mb-md-2" style={{fontSize: '1.2rem'}}>📋</div>
            <h6 className="ag-card-title mb-1" style={{fontSize: '0.8rem'}}>Diario</h6>
            <div className="ag-card-value" style={{fontSize: '1rem'}}>€{Math.round(gasto / new Date().getDate())}</div>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div className="ag-card p-2 p-md-3 text-center">
            <div className="ag-icon mb-1 mb-md-2" style={{fontSize: '1.2rem'}}>⏰</div>
            <h6 className="ag-card-title mb-1" style={{fontSize: '0.8rem'}}>Compra</h6>
            <div className="ag-card-subtitle" style={{fontSize: '0.8rem'}}>2 días</div>
          </div>
        </div>
      </div>

      {/* Gráfico - responsive */}
      <div className="ag-card p-3 p-md-4 mb-3 mb-md-4">
        <div className="d-flex align-items-center gap-2 mb-2 mb-md-3">
          <span className="ag-icon">📊</span>
          <h5 className="ag-section-title mb-0 d-none d-md-block">Evolución Diaria</h5>
          <h6 className="ag-section-title mb-0 d-md-none">Evolución</h6>
        </div>
        <div style={{height: '200px'}} className="d-md-none">
          <GastosChef datos={datos} alto={200} />
        </div>
        <div className="d-none d-md-block">
          <GastosChef datos={datos} alto={280} />
        </div>
      </div>

      {/* Categorías - móvil optimizado */}
      <div className="ag-card p-3 p-md-4 mb-3 mb-md-4">
        <div className="d-flex align-items-center gap-2 mb-2 mb-md-3">
          <span className="ag-icon">🍰</span>
          <h5 className="ag-section-title mb-0 d-none d-md-block">Distribución por Categoría</h5>
          <h6 className="ag-section-title mb-0 d-md-none">Categorías</h6>
        </div>
        <TortaCategorias />
      </div>

      {/* Información - móvil optimizado */}
      <div className="row g-2 g-md-3 mb-3 mb-md-4">
        <div className="col-12 col-md-6">
          <div className="ag-card p-3 p-md-4">
            <div className="d-flex align-items-center gap-2 mb-2 mb-md-3">
              <span className="ag-icon">⏳</span>
              <h5 className="ag-section-title mb-0 d-none d-md-block">Actividad Reciente</h5>
              <h6 className="ag-section-title mb-0 d-md-none">Actividad</h6>
            </div>
            <div className="d-flex justify-content-between mb-1 mb-md-2">
              <span className="text-muted" style={{fontSize: '0.85rem'}}>📝 Último:</span>
              <span className="fw-bold" style={{fontSize: '0.85rem'}}>Mercado - €45</span>
            </div>
            <div className="d-flex justify-content-between mb-1 mb-md-2">
              <span className="text-muted" style={{fontSize: '0.85rem'}}>📅 Semana:</span>
              <span className="fw-bold" style={{fontSize: '0.85rem'}}>€{Math.round(gasto * 0.25)}</span>
            </div>
            <div className="d-flex justify-content-between mb-1 mb-md-2">
              <span className="text-muted" style={{fontSize: '0.85rem'}}>📊 Tendencia:</span>
              <span className="text-success fw-bold" style={{fontSize: '0.85rem'}}>+5%</span>
            </div>
            <div className="d-flex justify-content-between">
              <span className="text-muted" style={{fontSize: '0.85rem'}}>⚡ Activos:</span>
              <span className="fw-bold" style={{fontSize: '0.85rem'}}>L,M,V</span>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-6">
          <div className="ag-card p-3 p-md-4">
            <div className="d-flex align-items-center gap-2 mb-2 mb-md-3">
              <span className="ag-icon">🏢</span>
              <h5 className="ag-section-title mb-0 d-none d-md-block">Proveedores Top</h5>
              <h6 className="ag-section-title mb-0 d-md-none">Proveedores</h6>
            </div>
            <div className="d-flex justify-content-between mb-1 mb-md-2">
              <span className="text-muted" style={{fontSize: '0.85rem'}}>🥇 Mercado:</span>
              <span className="fw-bold" style={{fontSize: '0.85rem'}}>€{Math.round(gasto * 0.45)}</span>
            </div>
            <div className="d-flex justify-content-between mb-1 mb-md-2">
              <span className="text-muted" style={{fontSize: '0.85rem'}}>🥈 Carnicería:</span>
              <span className="fw-bold" style={{fontSize: '0.85rem'}}>€{Math.round(gasto * 0.25)}</span>
            </div>
            <div className="d-flex justify-content-between mb-1 mb-md-2">
              <span className="text-muted" style={{fontSize: '0.85rem'}}>🥉 Pescadería:</span>
              <span className="fw-bold" style={{fontSize: '0.85rem'}}>€{Math.round(gasto * 0.18)}</span>
            </div>
            <div className="d-flex justify-content-between">
              <span className="text-muted" style={{fontSize: '0.85rem'}}>📞 Entrega:</span>
              <span className="text-primary fw-bold" style={{fontSize: '0.85rem'}}>Mañana</span>
            </div>
          </div>
        </div>
      </div>

      {/* Acciones rápidas */}
      <div className="ag-card p-3 p-md-4 mb-5 mb-md-0">
        <div className="d-flex align-items-center gap-2 mb-2 mb-md-3">
          <span className="ag-icon">⚡</span>
          <h5 className="ag-section-title mb-0 d-none d-md-block">Acciones Rápidas</h5>
          <h6 className="ag-section-title mb-0 d-md-none">Acciones</h6>
        </div>
        <QuickActionsChef />
      </div>
    </div>
  );
};
