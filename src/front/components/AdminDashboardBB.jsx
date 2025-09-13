import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import adminService from "../services/adminService";
import { QuickActionsAdmin } from "../components/QuickActionsAdmin";
import { MonedaSimbolo } from "../services/MonedaSimbolo";
import "../styles/AdminDashboardBB.css";

const AdminDashboardBB = () => {
  const navigate = useNavigate();
  const simbolo = MonedaSimbolo();

  const [resumenes, setResumenes] = useState([]);
  const [ultimaVentaPorRest, setUltimaVentaPorRest] = useState({});
  const [ultimaVentaDetalle, setUltimaVentaDetalle] = useState({});
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
            adminService.getVentasDiarias(r.restaurante_id, mes, ano).then((ventas) => {
              const ultimaVenta = getUltimaVentaCompleta(ventas);
              return {
                restaurante_id: r.restaurante_id,
                lastDate: ultimaVenta ? ultimaVenta.fecha : null,
                lastAmount: ultimaVenta ? ultimaVenta.monto : 0,
              };
            })
          )
        );
        const mapaFechas = {};
        const mapaDetalles = {};
        packs.forEach(({ restaurante_id, lastDate, lastAmount }) => {
          mapaFechas[restaurante_id] = lastDate;
          mapaDetalles[restaurante_id] = { fecha: lastDate, monto: lastAmount };
        });
        setUltimaVentaPorRest(mapaFechas);
        setUltimaVentaDetalle(mapaDetalles);
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

              // Layout unificado: mismo diseño para móvil y desktop
              return (
                <div key={r.restaurante_id} className="rest-block">
                  {/* DESKTOP: Nuevo layout unificado (oculto temporalmente) */}
                  <div className="d-none">
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

                  {/* UNIFICADO: Diseño para móvil y desktop */}
                  <div>
                    <div className="new-mobile-card">
                      {/* Header: Nombre centrado en negrita */}
                      <h4 className="restaurant-title">
                        {r.nombre}
                      </h4>

                      {/* Última actualización */}
                      <p className="last-update-info">
                        Últ act: {formateaFechaCorta(lastDate)}
                      </p>

                      {/* 2 divs principales en columna */}
                      <div className="mobile-stats-column">
                        {/* Div 1: KPIs de ventas */}
                        <div className="mobile-stat-box ventas-box">
                          <div className="stat-icon">💰</div>
                          <p className="stat-label">Ventas del mes</p>

                          {/* KPIs en mini-grid */}
                          <div className="kpis-grid">
                            {/* Resumen total */}
                            <div className="kpi-item">
                              <div className="kpi-icon">💰</div>
                              <div className="kpi-content">
                                <div className="kpi-label">Total</div>
                                <div className="kpi-value">
                                  {(r.venta_total / 1000).toFixed(0)}k{simbolo}
                                </div>
                              </div>
                            </div>

                            {/* Promedio diario */}
                            <div className="kpi-item">
                              <div className="kpi-icon">📈</div>
                              <div className="kpi-content">
                                <div className="kpi-label">Promedio</div>
                                <div className="kpi-value">
                                  {((r.venta_total / new Date().getDate()) / 1000).toFixed(1)}k{simbolo}
                                </div>
                              </div>
                            </div>

                            {/* Proyección mensual */}
                            <div className="kpi-item">
                              <div className="kpi-icon">📊</div>
                              <div className="kpi-content">
                                <div className="kpi-label">Proyección</div>
                                <div className="kpi-value">
                                  {(((r.venta_total / new Date().getDate()) * 30) / 1000).toFixed(0)}k{simbolo}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Última venta con fecha y monto */}
                          <div className="ultima-venta-info">
                            <div className="ultima-venta-header">
                              <span className="ultima-venta-icon">🕐</span>
                              <span className="ultima-venta-title">Última venta</span>
                            </div>
                            <div className="ultima-venta-content">
                              <div className="ultima-venta-fecha">{formateaFechaCorta(lastDate)}</div>
                              <div className="ultima-venta-monto">
                                {ultimaVentaDetalle[r.restaurante_id] && ultimaVentaDetalle[r.restaurante_id].monto > 0
                                  ? `${ultimaVentaDetalle[r.restaurante_id].monto.toFixed(0)} ${simbolo}`
                                  : 'Sin ventas'
                                }
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Div 2: % Gasto con bg dinámico */}
                        <div className={`mobile-stat-box gasto-box ${bgClass}`}>
                          <div className="stat-icon">{icono}</div>
                          <p className={`stat-label ${textClass}`}>% Gasto</p>
                          <p className={`stat-value ${textClass}`}>
                            {r.venta_total > 0 ? `${r.porcentaje_gasto}%` : "0%"}
                          </p>
                          <p className={`stat-extra ${textClass}`}>del total</p>
                        </div>
                      </div>

                      {/* Botón Ver todo */}
                      <div className="mobile-action">
                        <button
                          className="btn-ver-todo"
                          onClick={() => navigate(`/admin/restaurante/${r.restaurante_id}?mes=${mes}&ano=${ano}`)}
                        >
                          Ver todo
                        </button>
                      </div>
                    </div>
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

function getUltimaVentaCompleta(ventas = []) {
  if (!Array.isArray(ventas) || ventas.length === 0) return null;

  // Filtrar ventas válidas y convertir fechas
  const ventasValidas = ventas
    .filter(v => v && v.fecha && v.monto)
    .map(v => ({
      ...v,
      fechaObj: new Date(v.fecha)
    }))
    .filter(v => !isNaN(v.fechaObj.getTime()));

  if (ventasValidas.length === 0) return null;

  // Encontrar la venta con la fecha más reciente
  const ultimaVenta = ventasValidas.reduce((ultima, actual) =>
    actual.fechaObj > ultima.fechaObj ? actual : ultima
  );

  return {
    fecha: ultimaVenta.fechaObj,
    monto: parseFloat(ultimaVenta.monto) || 0
  };
}

export default AdminDashboardBB;
