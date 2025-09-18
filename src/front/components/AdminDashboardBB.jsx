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
  const [resumenesAnterior, setResumenesAnterior] = useState([]);
  const [resumenesAnoAnterior, setResumenesAnoAnterior] = useState([]);
  const [resumenesUltimos3Meses, setResumenesUltimos3Meses] = useState([]);
  const [ventasDiariasPorRest, setVentasDiariasPorRest] = useState({});
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

  // Calcular días transcurridos en el mes seleccionado
  const diasTranscurridos = useMemo(() => {
    const hoy = new Date();
    const mesSeleccionado = new Date(ano, mes - 1, 1);
    const ultimoDiaDelMes = new Date(ano, mes, 0).getDate();

    // Si es el mes actual, usar el día actual
    if (hoy.getFullYear() === ano && hoy.getMonth() + 1 === mes) {
      return hoy.getDate();
    }
    // Si es un mes pasado, usar todos los días del mes
    else if (mesSeleccionado < hoy) {
      return ultimoDiaDelMes;
    }
    // Si es un mes futuro, usar 1 día para evitar división por 0
    else {
      return 1;
    }
  }, [ano, mes]);

  // Determinar si es mes pasado, actual o futuro
  const tipoMes = useMemo(() => {
    const hoy = new Date();
    const mesSeleccionado = new Date(ano, mes - 1, 1);

    if (hoy.getFullYear() === ano && hoy.getMonth() + 1 === mes) {
      return 'actual';
    } else if (mesSeleccionado < hoy) {
      return 'pasado';
    } else {
      return 'futuro';
    }
  }, [ano, mes]);

  // Calcular mes anterior
  const mesAnterior = useMemo(() => {
    const fecha = new Date(ano, mes - 2, 1); // mes - 2 porque mes está en base 1
    return {
      mes: fecha.getMonth() + 1,
      ano: fecha.getFullYear()
    };
  }, [ano, mes]);

  // Calcular mismo mes año anterior
  const mesAnoAnterior = useMemo(() => {
    return {
      mes: mes,
      ano: ano - 1
    };
  }, [ano, mes]);

  // Calcular últimos 3 meses para tendencia
  const ultimos3Meses = useMemo(() => {
    const meses = [];
    for (let i = 2; i >= 0; i--) {
      const fecha = new Date(ano, mes - 1 - i, 1);
      meses.push({
        mes: fecha.getMonth() + 1,
        ano: fecha.getFullYear()
      });
    }
    return meses;
  }, [ano, mes]);

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
        // Cargar datos del mes actual
        const data = await adminService.getResumenGeneral(mes, ano);
        const lista = Array.isArray(data) ? data : [];
        setResumenes(lista);

        // Cargar datos del mes anterior para comparación
        try {
          const dataAnterior = await adminService.getResumenGeneral(mesAnterior.mes, mesAnterior.ano);
          const listaAnterior = Array.isArray(dataAnterior) ? dataAnterior : [];
          setResumenesAnterior(listaAnterior);
        } catch (e) {
          console.warn("No se pudieron cargar datos del mes anterior:", e);
          setResumenesAnterior([]);
        }

        // Cargar datos del mismo mes año anterior
        try {
          const dataAnoAnterior = await adminService.getResumenGeneral(mesAnoAnterior.mes, mesAnoAnterior.ano);
          const listaAnoAnterior = Array.isArray(dataAnoAnterior) ? dataAnoAnterior : [];
          setResumenesAnoAnterior(listaAnoAnterior);
        } catch (e) {
          console.warn("No se pudieron cargar datos del año anterior:", e);
          setResumenesAnoAnterior([]);
        }

        // Cargar datos de últimos 3 meses para tendencia
        try {
          const promesas3Meses = ultimos3Meses.map(({ mes: m, ano: a }) =>
            adminService.getResumenGeneral(m, a).catch(() => [])
          );
          const datos3Meses = await Promise.all(promesas3Meses);
          setResumenesUltimos3Meses(datos3Meses);
        } catch (e) {
          console.warn("No se pudieron cargar datos de últimos 3 meses:", e);
          setResumenesUltimos3Meses([]);
        }

        const packs = await Promise.all(
          lista.map((r) =>
            adminService.getVentasDiarias(r.restaurante_id, mes, ano).then((ventas) => {
              const ultimaVenta = getUltimaVentaCompleta(ventas);
              return {
                restaurante_id: r.restaurante_id,
                ventas: ventas || [],
                lastDate: ultimaVenta ? ultimaVenta.fecha : null,
                lastAmount: ultimaVenta ? ultimaVenta.monto : 0,
              };
            })
          )
        );

        const mapaFechas = {};
        const mapaDetalles = {};
        const mapaVentasDiarias = {};

        packs.forEach(({ restaurante_id, ventas, lastDate, lastAmount }) => {
          mapaFechas[restaurante_id] = lastDate;
          mapaDetalles[restaurante_id] = { fecha: lastDate, monto: lastAmount };
          mapaVentasDiarias[restaurante_id] = ventas;
        });

        setUltimaVentaPorRest(mapaFechas);
        setUltimaVentaDetalle(mapaDetalles);
        setVentasDiariasPorRest(mapaVentasDiarias);
      } catch (e) {
        console.error("Error cargando la vista admin:", e);
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, [mes, ano, mesAnterior.mes, mesAnterior.ano, mesAnoAnterior.mes, mesAnoAnterior.ano, ultimos3Meses]);

  // Función para calcular métricas de tendencia
  const calcularMetricasTendencia = (restaurante_id, ventaActual, ventasDiarias = []) => {
    const metricas = {};

    // 1. Cambio vs mes anterior
    const restauranteAnterior = resumenesAnterior.find(r => r.restaurante_id === restaurante_id);
    if (restauranteAnterior && restauranteAnterior.venta_total > 0) {
      const ventaAnterior = restauranteAnterior.venta_total;
      const cambio = ((ventaActual - ventaAnterior) / ventaAnterior) * 100;
      metricas.mesAnterior = {
        porcentaje: cambio,
        icono: cambio > 5 ? "📈" : cambio < -5 ? "📉" : "➡️",
        texto: cambio > 0 ? `+${cambio.toFixed(1)}%` : `${cambio.toFixed(1)}%`,
        color: cambio > 0 ? "text-success" : cambio < 0 ? "text-danger" : "text-muted"
      };
    }

    // 2. Mejor día del mes (de las ventas diarias)
    if (ventasDiarias && ventasDiarias.length > 0) {
      const mejorDia = ventasDiarias.reduce((max, dia) =>
        dia.monto > max.monto ? dia : max
      );
      if (mejorDia && mejorDia.monto > 0) {
        const fecha = new Date(mejorDia.fecha);
        metricas.mejorDia = {
          monto: mejorDia.monto,
          dia: fecha.getDate(),
          texto: `${mejorDia.monto.toFixed(0)}${simbolo}`,
          icono: "🥇"
        };
      }
    }

    // 3. Vs mismo mes año anterior
    const restauranteAnoAnterior = resumenesAnoAnterior.find(r => r.restaurante_id === restaurante_id);
    if (restauranteAnoAnterior && restauranteAnoAnterior.venta_total > 0) {
      const ventaAnoAnterior = restauranteAnoAnterior.venta_total;
      const cambioAnual = ((ventaActual - ventaAnoAnterior) / ventaAnoAnterior) * 100;
      metricas.anoAnterior = {
        porcentaje: cambioAnual,
        icono: cambioAnual > 10 ? "🚀" : cambioAnual > 0 ? "📈" : cambioAnual < -10 ? "📉" : "➡️",
        texto: cambioAnual > 0 ? `+${cambioAnual.toFixed(1)}%` : `${cambioAnual.toFixed(1)}%`,
        color: cambioAnual > 0 ? "text-success" : cambioAnual < 0 ? "text-danger" : "text-muted"
      };
    }

    // 4. Tendencia 3 meses
    if (resumenesUltimos3Meses.length >= 2) {
      const ventasPor3Meses = resumenesUltimos3Meses.map(mesData => {
        const restaurante = Array.isArray(mesData) ? mesData.find(r => r.restaurante_id === restaurante_id) : null;
        return restaurante ? restaurante.venta_total : 0;
      }).filter(venta => venta > 0);

      if (ventasPor3Meses.length >= 2) {
        const primera = ventasPor3Meses[0];
        const ultima = ventasPor3Meses[ventasPor3Meses.length - 1];
        const tendencia3M = ((ultima - primera) / primera) * 100;

        metricas.tendencia3M = {
          porcentaje: tendencia3M,
          icono: tendencia3M > 5 ? "📈" : tendencia3M < -5 ? "📉" : "➡️",
          texto: tendencia3M > 0 ? `+${tendencia3M.toFixed(1)}%` : `${tendencia3M.toFixed(1)}%`,
          color: tendencia3M > 0 ? "text-success" : tendencia3M < 0 ? "text-danger" : "text-muted"
        };
      }
    }

    return metricas;
  };

  // Función para calcular ranking
  const calcularRanking = (restaurante_id, ventaActual) => {
    const resumenesOrdenados = [...resumenes].sort((a, b) => b.venta_total - a.venta_total);
    const posicion = resumenesOrdenados.findIndex(r => r.restaurante_id === restaurante_id) + 1;
    const total = resumenesOrdenados.length;

    return {
      posicion,
      total,
      texto: posicion === 1 ? `#${posicion} 🥇` : `#${posicion} de ${total}`,
      icono: posicion === 1 ? "🏆" : posicion <= 3 ? "🥉" : "📊",
      color: posicion === 1 ? "text-warning" : posicion <= 3 ? "text-info" : "text-muted"
    };
  };

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
                          <div className="stat-header">
                            <div className="stat-icon">💰</div>
                            <p className="stat-label">Ventas del mes</p>
                          </div>

                          {/* KPIs en mini-grid */}
                          <div className="kpis-grid">
                            {/* Resumen total */}
                            <div className="kpi-item">
                              <div className="kpi-icon">💰</div>
                              <div className="kpi-content">
                                <div className="kpi-label">Ventas</div>
                                <div className="kpi-value">
                                  {r.venta_total.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {simbolo}
                                </div>
                              </div>
                            </div>

                            {/* Promedio diario */}
                            <div className="kpi-item">
                              <div className="kpi-icon">📈</div>
                              <div className="kpi-content">
                                <div className="kpi-label">Promedio</div>
                                <div className="kpi-value">
                                  {(r.venta_total / diasTranscurridos).toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {simbolo}
                                </div>
                              </div>
                            </div>


                            {/* Proyección mensual - solo para mes actual */}
                            {tipoMes === 'actual' && (
                              <div className="kpi-item">
                                <div className="kpi-icon">📊</div>
                                <div className="kpi-content">
                                  <div className="kpi-label">Proyección</div>
                                  <div className="kpi-value">
                                    {((r.venta_total / diasTranscurridos) * new Date(ano, mes, 0).getDate()).toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {simbolo}
                                  </div>
                                </div>
                              </div>
                            )}
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

                        {/* Div 2: Tendencias */}
                        <div className="mobile-stat-box tendencia-box">
                          <div className="stat-header">
                            <div className="stat-icon">📊</div>
                            <p className="stat-label">Tendencias</p>
                          </div>

                          {/* Mini-grid de métricas de tendencia */}
                          <div className="tendencia-grid">
                            {(() => {
                              const metricas = calcularMetricasTendencia(r.restaurante_id, r.venta_total, ventasDiariasPorRest[r.restaurante_id]);
                              const ranking = calcularRanking(r.restaurante_id, r.venta_total);

                              const items = [];

                              // Mes anterior
                              if (metricas.mesAnterior) {
                                items.push(
                                  <div key="anterior" className="tendencia-item">
                                    <div className="tend-icon">{metricas.mesAnterior.icono}</div>
                                    <div className="tend-content">
                                      <div className="tend-label">Mes anterior</div>
                                      <div className={`tend-value ${metricas.mesAnterior.color}`}>
                                        {metricas.mesAnterior.texto}
                                      </div>
                                    </div>
                                  </div>
                                );
                              }

                              // Ranking
                              items.push(
                                <div key="ranking" className="tendencia-item">
                                  <div className="tend-icon">{ranking.icono}</div>
                                  <div className="tend-content">
                                    <div className="tend-label">Ranking</div>
                                    <div className={`tend-value ${ranking.color}`}>
                                      {ranking.texto}
                                    </div>
                                  </div>
                                </div>
                              );

                              // Vs año anterior
                              if (metricas.anoAnterior) {
                                items.push(
                                  <div key="ano" className="tendencia-item">
                                    <div className="tend-icon">{metricas.anoAnterior.icono}</div>
                                    <div className="tend-content">
                                      <div className="tend-label">vs 2024</div>
                                      <div className={`tend-value ${metricas.anoAnterior.color}`}>
                                        {metricas.anoAnterior.texto}
                                      </div>
                                    </div>
                                  </div>
                                );
                              }

                              // Tendencia 3 meses
                              if (metricas.tendencia3M) {
                                items.push(
                                  <div key="tend3m" className="tendencia-item">
                                    <div className="tend-icon">{metricas.tendencia3M.icono}</div>
                                    <div className="tend-content">
                                      <div className="tend-label">3 meses</div>
                                      <div className={`tend-value ${metricas.tendencia3M.color}`}>
                                        {metricas.tendencia3M.texto}
                                      </div>
                                    </div>
                                  </div>
                                );
                              }

                              // Mejor día
                              if (metricas.mejorDia) {
                                items.push(
                                  <div key="mejor" className="tendencia-item">
                                    <div className="tend-icon">{metricas.mejorDia.icono}</div>
                                    <div className="tend-content">
                                      <div className="tend-label">Mejor día</div>
                                      <div className="tend-value text-success">
                                        {metricas.mejorDia.texto}
                                      </div>
                                    </div>
                                  </div>
                                );
                              }

                              return items;
                            })()}
                          </div>
                        </div>

                        {/* Div 3: % Gasto con bg dinámico */}
                        <div className={`mobile-stat-box gasto-box ${bgClass}`}>
                          <div className="stat-header">
                            <div className="stat-icon">{icono}</div>
                            <p className={`stat-label ${textClass}`}>Gasto</p>
                          </div>
                          <p className={`stat-value ${textClass}`}>
                            {r.venta_total > 0 ? `${r.porcentaje_gasto}%` : "0%"}
                          </p>
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