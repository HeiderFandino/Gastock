import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import adminService from "../services/adminService";
// Estilos ya incluidos en brand-unified.css
import { QuickActionsAdmin } from "../components/QuickActionsAdmin";
import { MonedaSimbolo } from "../services/MonedaSimbolo";

const AdminDashboardBB = () => {
  const navigate = useNavigate();
  const simbolo = MonedaSimbolo();

  const [resumenes, setResumenes] = useState([]);
  const [ultimaVentaPorRest, setUltimaVentaPorRest] = useState({});
  const [cargando, setCargando] = useState(false);

  // Fija --navbar-h según el header real
  useEffect(() => {
    const nav = document.querySelector(".navbar.sticky-top");
    if (nav) {
      const h = nav.getBoundingClientRect().height;
      document.documentElement.style.setProperty("--navbar-h", `${h}px`);
    }
  }, []);

  const [fechaSeleccionada, setFechaSeleccionada] = useState(() => {
    const hoy = new Date();
    return `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}`;
  });
  const [ano, mes] = fechaSeleccionada.split("-").map(Number);

  const retrocederMes = () => {
    const [a, m] = fechaSeleccionada.split("-").map(Number);
    const nueva = new Date(a, m - 2, 1);
    setFechaSeleccionada(`${nueva.getFullYear()}-${String(nueva.getMonth() + 1).padStart(2, "0")}`);
  };
  const avanzarMes = () => {
    const [a, m] = fechaSeleccionada.split("-").map(Number);
    const nueva = new Date(a, m, 1);
    setFechaSeleccionada(`${nueva.getFullYear()}-${String(nueva.getMonth() + 1).padStart(2, "0")}`);
  };

  useEffect(() => {
    const cargar = async () => {
      setCargando(true);
      try {
        const data = await adminService.getResumenGeneral(mes, ano);
        const lista = Array.isArray(data) ? data : [];
        setResumenes(lista);

        const packs = await Promise.all(
          lista.map((r) =>
            adminService.getVentasDiarias(r.restaurante_id, mes, ano).then((ventas) => ({
              restaurante_id: r.restaurante_id,
              lastDate: getUltimaFecha(ventas),
            }))
          )
        );
        const mapa = {};
        packs.forEach(({ restaurante_id, lastDate }) => (mapa[restaurante_id] = lastDate));
        setUltimaVentaPorRest(mapa);
      } catch (e) {
        console.error("Error cargando la vista admin:", e);
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, [mes, ano]);

  const getColorClasses = (porcentaje) => {
    if (porcentaje > 36) return ["bg-danger-subtle", "text-danger", "🚨"];
    if (porcentaje > 33) return ["bg-warning-subtle", "text-warning", "⚠️"];
    return ["bg-success-subtle", "text-success", "✅"];
  };

  const formateaFechaCorta = (d) => {
    if (!d) return "Sin ventas este mes";
    try {
      return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
    } catch {
      return "Sin ventas este mes";
    }
  };

  const scrollToAcciones = () => {
    const el = document.getElementById("acciones-rapidas");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="dashboard-container admin-bb">

      {/* Toolbar móvil pegada al navbar */}
      <div className="ad-toolbar d-md-none">
        <button className="ad-ctrl" onClick={retrocederMes} aria-label="Mes anterior">←</button>
        <input
          type="month"
          className="form-control ad-month"
          value={fechaSeleccionada}
          onChange={(e) => setFechaSeleccionada(e.target.value)}
          aria-label="Seleccionar mes"
        />
        <button className="ad-ctrl" onClick={avanzarMes} aria-label="Mes siguiente">→</button>
      </div>

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h1 className="dashboard-title m-0">Vista General</h1>

      </div>

      {/* Desktop: selector de mes */}
      <div className="selector-mes d-none d-md-flex align-items-center justify-content-center gap-2 mb-3 mx-auto">
        <label className="fw-bold mb-0">Fecha:</label>
        <button className="btn-gastock-outline btn-sm" onClick={retrocederMes} aria-label="Mes anterior">←</button>
        <input
          type="month"
          className="form-control text-center selector-mes__input"
          value={fechaSeleccionada}
          onChange={(e) => setFechaSeleccionada(e.target.value)}
        />
        <button className="btn-gastock-outline btn-sm" onClick={avanzarMes} aria-label="Mes siguiente">→</button>
      </div>

      {/* Contenido */}
      <div className="gf-panel p-3 p-md-4 mb-4">
        {cargando && <div className="w-100 text-center py-3">Cargando…</div>}

        <div className="rest-list">
          {[...resumenes]
            .sort((a, b) => b.venta_total - a.venta_total)
            .map((r) => {
              const [bgClass, textClass, icono] = getColorClasses(r.porcentaje_gasto);
              const lastDate = ultimaVentaPorRest[r.restaurante_id] || null;

              return (
                <div key={r.restaurante_id} className="rest-block">
                  <h4 className="text-center fw-bold rest-block__title mb-1">
                    <span title={r.nombre}>{r.nombre}</span>
                  </h4>

                  <p className="text-center text-muted mb-3 rest-block__legend">
                    Últ. venta: {formateaFechaCorta(lastDate)}
                  </p>

                  <div className="d-flex flex-column flex-sm-row gap-2 gap-md-3 justify-content-between text-center">
                    <div className="rest-stat bg-info-subtle">
                      <div className="icono-circular">💰</div>
                      <p className="fw-bold text-info mb-1 small">Ventas</p>
                      <p className="fw-bold mb-0 rest-stat__value">
                        {r.venta_total.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {simbolo}
                      </p>
                    </div>

                    <div className={`rest-stat ${bgClass}`}>
                      <div className="icono-circular" aria-hidden="true">{icono}</div>
                      <p className={`fw-bold mb-1 small ${textClass}`}>% Gasto</p>
                      <p className={`fw-bold mb-0 rest-stat__value ${textClass}`}>
                        {r.venta_total > 0 ? `${r.porcentaje_gasto}%` : "0%"}
                      </p>
                    </div>
                  </div>

                  <div className="text-center mt-3">
                    <button
                      className="btn-gastock-outline btn-sm"
                      onClick={() => navigate(`/admin/restaurante/${r.restaurante_id}?mes=${mes}&ano=${ano}`)}
                    >
                      Ver todo
                    </button>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      <div id="acciones-rapidas" className="gf-panel mt-4 p-3 p-md-4">
        <QuickActionsAdmin />
      </div>

      <button
        className="ad-fab d-md-none"
        onClick={scrollToAcciones}
        aria-label="Acciones rápidas"
        title="Acciones rápidas"
      >
        <i className="bi bi-lightning-charge"></i>
      </button>
    </div>
  );
};

function getUltimaFecha(ventas = []) {
  if (!Array.isArray(ventas) || ventas.length === 0) return null;
  const fechas = ventas.map((v) => (v.fecha ? new Date(v.fecha) : null)).filter(Boolean);
  if (fechas.length === 0) return null;
  return new Date(Math.max(...fechas.map((d) => d.getTime())));
}

export default AdminDashboardBB;
