import { useEffect, useState, useMemo } from "react";
import GastosChef from "../../components/GastosChef";
import { QuickActionsEncargado } from "../../components/QuickActionsEncargado";
import "../../styles/EncargadoDashboard.css";
import "../../styles/AdminGastos.css";
import encargadoServices from "../../services/encargadoServices";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { MonedaSimbolo } from "../../services/MonedaSimbolo";
import useGlobalReducer from "../../hooks/useGlobalReducer";
import VentaModal from "./VentaModal";
import ventaServices from "../../services/ventaServices";
import { useNavigate } from "react-router-dom";
import { PatchAnnouncement } from "../../components/PatchAnnouncement";
import { FiTrendingUp, FiDollarSign, FiPercent, FiPlus } from "react-icons/fi";
import { getProximoFestivo, esHoyFestivo, esMananaFestivo } from "../../utils/festivosBarcelona";
import InlineLoader from "../../components/InlineLoader";

export const EncargadoDashboard = () => {
  const { store } = useGlobalReducer();
  const navigate = useNavigate();

  const simbolo = MonedaSimbolo();
  const [gastoDatos, setGastoDatos] = useState([]);
  const [resumenMensual, setResumenMensual] = useState(null);
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = store.user;
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mensaje, setMensaje] = useState("");

  const hoy = useMemo(() => new Date(), []);
  const [fechaSeleccionada, setFechaSeleccionada] = useState(() => {
    return `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}`;
  });

  const retrocederMes = () => {
    const [a, m] = fechaSeleccionada.split("-").map(Number);
    const nuevaFecha = new Date(a, m - 2, 1);
    setFechaSeleccionada(`${nuevaFecha.getFullYear()}-${String(nuevaFecha.getMonth() + 1).padStart(2, "0")}`);
  };
  const avanzarMes = () => {
    const [a, m] = fechaSeleccionada.split("-").map(Number);
    const nuevaFecha = new Date(a, m, 1);
    setFechaSeleccionada(`${nuevaFecha.getFullYear()}-${String(nuevaFecha.getMonth() + 1).padStart(2, "0")}`);
  };

  const [ano, mes] = fechaSeleccionada.split("-").map(Number);

  // Verificar si estamos después del día 10 del mes actual
  const mostrarPorcentajeGasto = useMemo(() => {
    const diaActual = new Date().getDate();
    const mesActual = new Date().getMonth() + 1;
    const anoActual = new Date().getFullYear();

    // Si estamos viendo el mes actual, solo mostrar % de gasto después del día 10
    if (ano === anoActual && mes === mesActual) {
      return diaActual >= 10;
    }

    // Si es un mes pasado, siempre mostrar
    return true;
  }, [ano, mes]);
  const diasDelMes = new Date(ano, mes, 0).getDate();

  const nombreMes = useMemo(() => {
    const [a, m] = fechaSeleccionada.split("-").map(Number);
    return new Date(a, m - 1).toLocaleString("es", { month: "long", year: "numeric" });
  }, [fechaSeleccionada]);

  // Estados para datos comparativos
  const [ventasMesAnterior, setVentasMesAnterior] = useState([]);
  const [ventasAnoAnterior, setVentasAnoAnterior] = useState([]);

  // Calcular fechas para comparación
  const fechaMesAnterior = useMemo(() => {
    const fecha = new Date(ano, mes - 2, 1);
    return {
      mes: fecha.getMonth() + 1,
      ano: fecha.getFullYear()
    };
  }, [ano, mes]);

  const fechaAnoAnterior = useMemo(() => {
    return {
      mes: mes,
      ano: ano - 1
    };
  }, [ano, mes]);

  const guardarVenta = async (form) => {
    try {
      await ventaServices.registrarVenta({
        ...form,
        restaurante_id: user.restaurante_id,
      });
      setMensaje("Venta registrada con éxito");
      setTimeout(() => setMensaje(""), 2000);
      setMostrarModal(false);
      navigate(`/encargado/ventas`);
    } catch {
      setMensaje("Error al registrar la venta");
      setTimeout(() => setMensaje(""), 2000);
    }
  };

  useEffect(() => {
    if (!mes || !ano) return;

    let isMounted = true;

    const cargarDatos = async () => {
      setLoading(true);

      const [gastoDiario, resumenMensualResp, ventasResp] = await Promise.allSettled([
        encargadoServices.resumenGastoDiario(mes, ano),
        encargadoServices.resumenGastoMensual(mes, ano),
        encargadoServices.resumenVentasDiarias(mes, ano)
      ]);

      if (!isMounted) return;

      if (gastoDiario.status === "fulfilled" && Array.isArray(gastoDiario.value)) {
        const data = gastoDiario.value.map((item) => ({
          dia: Number(item.dia),
          porcentaje: Number(item.porcentaje),
        }));
        setGastoDatos(data);
      } else if (gastoDiario.status === "rejected") {
        console.error("Error al cargar gasto diario", gastoDiario.reason);
        setGastoDatos([]);
      }

      if (resumenMensualResp.status === "fulfilled") {
        setResumenMensual(resumenMensualResp.value);
      } else if (resumenMensualResp.status === "rejected") {
        console.error("Error al cargar resumen mensual", resumenMensualResp.reason);
        setResumenMensual(null);
      }

      if (ventasResp.status === "fulfilled" && Array.isArray(ventasResp.value)) {
        setVentas(ventasResp.value);
      } else if (ventasResp.status === "rejected") {
        console.error("Error al cargar ventas diarias", ventasResp.reason);
        setVentas([]);
      }

      setLoading(false);
    };

    cargarDatos();

    const el = document.getElementsByClassName("custom-sidebar")[0];
    if (el) el.scrollTo(0, 0);

    return () => {
      isMounted = false;
    };
  }, [fechaSeleccionada, mes, ano]);

  // Cargar datos comparativos
  useEffect(() => {
    if (!mes || !ano) return;

    // Cargar ventas mes anterior
    encargadoServices
      .resumenVentasDiarias(fechaMesAnterior.mes, fechaMesAnterior.ano)
      .then((data) => setVentasMesAnterior(data))
      .catch(() => setVentasMesAnterior([]));

    // Cargar ventas año anterior
    encargadoServices
      .resumenVentasDiarias(fechaAnoAnterior.mes, fechaAnoAnterior.ano)
      .then((data) => setVentasAnoAnterior(data))
      .catch(() => setVentasAnoAnterior([]));
  }, [fechaMesAnterior.mes, fechaMesAnterior.ano, fechaAnoAnterior.mes, fechaAnoAnterior.ano]);

  // Altura real del navbar para que el sticky no se solape (móvil/zoom)
  useEffect(() => {
    const nav = document.querySelector('nav.navbar.sticky-top');
    const setVar = () => {
      const h = nav ? Math.ceil(nav.getBoundingClientRect().height) : 56;
      // guardamos en :root; sirve en toda la app
      document.documentElement.style.setProperty('--navbar-h', `${h}px`);
    };
    setVar();
    window.addEventListener('resize', setVar);
    window.addEventListener('orientationchange', setVar);
    return () => {
      window.removeEventListener('resize', setVar);
      window.removeEventListener('orientationchange', setVar);
    };
  }, []);

  const porcentaje = resumenMensual?.porcentaje || 0;
  const gasto = resumenMensual?.gastos || 0;
  const totalVentas = ventas.reduce((acc, item) => acc + item.monto, 0);
  const promedioDiario = ventas.length > 0 ? totalVentas / ventas.length : 0;
  const proyeccionMensual = promedioDiario * diasDelMes;

  // Calcular mejor día del mes
  const mejorDiaData = useMemo(() => {
    if (ventas.length === 0) return null;
    const mejorDia = ventas.reduce((max, venta) =>
      venta.monto > max.monto ? venta : max
    );

    return {
      monto: mejorDia.monto,
      dia: mejorDia.dia || 'N/A'
    };
  }, [ventas]);

  // Calcular cambios vs mes anterior
  const cambioMesAnterior = useMemo(() => {
    if (ventasMesAnterior.length === 0) return null;
    const totalAnterior = ventasMesAnterior.reduce((acc, item) => acc + item.monto, 0);
    if (totalAnterior === 0) return null;

    const cambio = ((totalVentas - totalAnterior) / totalAnterior) * 100;
    return {
      porcentaje: cambio,
      texto: cambio > 0 ? `+${cambio.toFixed(1)}%` : `${cambio.toFixed(1)}%`,
      color: cambio > 0 ? "text-success" : cambio < 0 ? "text-danger" : "text-muted"
    };
  }, [totalVentas, ventasMesAnterior]);

  // Calcular cambios vs año anterior
  const cambioAnoAnterior = useMemo(() => {
    if (ventasAnoAnterior.length === 0) return null;
    const totalAnoAnterior = ventasAnoAnterior.reduce((acc, item) => acc + item.monto, 0);
    if (totalAnoAnterior === 0) return null;

    const cambio = ((totalVentas - totalAnoAnterior) / totalAnoAnterior) * 100;
    return {
      porcentaje: cambio,
      texto: cambio > 0 ? `+${cambio.toFixed(1)}%` : `${cambio.toFixed(1)}%`,
      color: cambio > 0 ? "text-success" : cambio < 0 ? "text-danger" : "text-muted"
    };
  }, [totalVentas, ventasAnoAnterior]);

  // Calcular tendencia de ventas (últimos 3 días vs 3 días anteriores)
  const tendenciaVentas = useMemo(() => {
    if (ventas.length < 6) return null;

    const ventasOrdenadas = [...ventas].sort((a, b) => a.dia - b.dia);
    const ultimos3 = ventasOrdenadas.slice(-3);
    const anteriores3 = ventasOrdenadas.slice(-6, -3);

    const promedioUltimos = ultimos3.reduce((acc, v) => acc + v.monto, 0) / 3;
    const promedioAnteriores = anteriores3.reduce((acc, v) => acc + v.monto, 0) / 3;

    if (promedioAnteriores === 0) return null;

    const cambio = ((promedioUltimos - promedioAnteriores) / promedioAnteriores) * 100;

    if (cambio > 5) {
      return { icono: "📈", texto: "Subiendo", color: "text-success" };
    } else if (cambio < -5) {
      return { icono: "📉", texto: "Bajando", color: "text-danger" };
    } else {
      return { icono: "➡️", texto: "Estable", color: "text-warning" };
    }
  }, [ventas]);

  // Información de festivos
  const infoFestivos = useMemo(() => {
    const hoyFestivo = esHoyFestivo();
    const mananaFestivo = esMananaFestivo();
    const proximoFestivo = getProximoFestivo();

    if (hoyFestivo) {
      return { icono: "🎉", texto: `Hoy es ${hoyFestivo}`, color: "text-warning" };
    }

    if (mananaFestivo) {
      return { icono: "📅", texto: `Mañana: ${mananaFestivo}`, color: "text-info" };
    }

    if (proximoFestivo) {
      const fecha = proximoFestivo.fecha;
      const nombreDia = fecha.toLocaleDateString('es-ES', { weekday: 'long' });
      const fechaFormateada = fecha.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' });

      return {
        icono: "🗓️",
        texto: `Próximo festivo: ${nombreDia} - ${fechaFormateada} - ${proximoFestivo.nombre}`,
        color: "text-primary"
      };
    }

    return null;
  }, []);

  if (loading) {
    return (
      <div className="dashboard-container">
        <InlineLoader message="Cargando datos del encargado..." />
      </div>
    );
  }

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

  return (
    <div className="dashboard-container admin-bb dashboard-with-navbar-ticker">
      {(user?.rol === "encargado" || user?.rol === "chef") && <PatchAnnouncement />}

      {/* ===== Resumen Rápido - Dentro del dashboard pero pegado al navbar ===== */}
      <div className="resumen-rapido-card-pegado">
        <div className="resumen-rapido-content">
          <div className="resumen-rapido-title">
            <span className="resumen-icon">🌐</span>
            <span>www.gastock.es</span>
          </div>

          <div className="resumen-rapido-metrics">
            {/* Información de festivos - PRIMERO */}
            {infoFestivos && (
              <div className="metric-item">
                <span className="metric-icon">{infoFestivos.icono}</span>
                <span className="metric-text"><strong className={infoFestivos.color}>{infoFestivos.texto}</strong></span>
              </div>
            )}

            {/* Mejor día */}
            {mejorDiaData && (
              <div className="metric-item">
                <span className="metric-icon">🥇</span>
                <span className="metric-text">Mejor día: <strong className="text-warning">{mejorDiaData.monto.toFixed(0)}{simbolo}</strong> (día {mejorDiaData.dia})</span>
              </div>
            )}

            {/* vs Mes anterior */}
            {cambioMesAnterior && (
              <div className="metric-item">
                <span className="metric-icon">📈</span>
                <span className="metric-text">vs Mes anterior: <strong className={cambioMesAnterior.color}>{cambioMesAnterior.texto}</strong></span>
              </div>
            )}

            {/* vs Año anterior - solo mostrar cuando hay un año completo */}
            {(ano < new Date().getFullYear() || (ano === new Date().getFullYear() && mes < new Date().getMonth() + 1)) && (
              <div className="metric-item">
                <span className="metric-icon">🚀</span>
                <span className="metric-text">vs Año anterior:
                  {cambioAnoAnterior ? (
                    <strong className={cambioAnoAnterior.color}>{cambioAnoAnterior.texto}</strong>
                  ) : (
                    <strong className="text-muted">Faltan datos</strong>
                  )}
                </span>
              </div>
            )}

            {/* Tendencia */}
            {tendenciaVentas && (
              <div className="metric-item">
                <span className="metric-icon">{tendenciaVentas.icono}</span>
                <span className="metric-text">Tendencia: <strong className={tendenciaVentas.color}>{tendenciaVentas.texto}</strong></span>
              </div>
            )}

            {/* Promedio diario */}
            <div className="metric-item">
              <span className="metric-icon">💰</span>
              <span className="metric-text">Promedio: <strong className="text-info">{promedioDiario.toFixed(0)}{simbolo}/día</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* ===== Header con estilo de card ===== */}
      <div className="ag-card header-card mb-3">
        <div className="ag-card-header">
          <div className="ag-icon">🏪</div>
          <h1 className="header-title">Resumen De Tu Restaurante</h1>
          <div className="header-content">


          </div>
        </div>

        <div className="p-3">
          {/* Controles Mes */}
          <div className="month-controls">
            <button className="month-btn" onClick={retrocederMes} aria-label="Mes anterior">←</button>

            <div className="month-display">
              <span className="month-text">{nombreMes}</span>
              <input
                type="month"
                className="month-input-hidden"
                value={fechaSeleccionada}
                onChange={(e) => setFechaSeleccionada(e.target.value)}
                aria-label="Seleccionar mes"
              />
            </div>

            <button className="month-btn" onClick={avanzarMes} aria-label="Mes siguiente">→</button>
          </div>
        </div>
      </div>



      {/* ===== VENTAS ===== */}
      <div className="ag-card mb-4">
        <div className="ag-card-header">
          <div className="ag-icon">📊</div>
          <h5 className="mb-0">Análisis de Ventas</h5>
        </div>
        <div className="p-3 p-md-4">
          {/* KPIs móviles de ventas */}
          <div className="row g-2 mb-3 d-md-none">
            <div className="col-4">
              <div className="ag-card h-100">
                <div className="p-2 text-center">
                  <div className="ag-icon mx-auto mb-1" style={{ background: 'var(--tint-warning-12)', color: 'var(--color-warning)', width: 40, height: 40, fontSize: '1rem' }}>
                    💰
                  </div>
                  <div className="fw-bold text-warning" style={{ fontSize: '0.9rem' }}>
                    {totalVentas.toLocaleString("es-ES", { maximumFractionDigits: 0 })}{simbolo}
                  </div>
                  <div className="text-muted" style={{ fontSize: '0.7rem' }}>Ventas</div>
                </div>
              </div>
            </div>
            <div className="col-4">
              <div className="ag-card h-100">
                <div className="p-2 text-center">
                  <div className="ag-icon mx-auto mb-1" style={{ background: 'var(--tint-info-12)', color: 'var(--color-info)', width: 40, height: 40, fontSize: '1rem' }}>
                    📈
                  </div>
                  <div className="fw-bold text-info" style={{ fontSize: '0.9rem' }}>
                    {promedioDiario.toLocaleString("es-ES", { maximumFractionDigits: 0 })}{simbolo}
                  </div>
                  <div className="text-muted" style={{ fontSize: '0.7rem' }}>Promedio</div>
                </div>
              </div>
            </div>
            <div className="col-4">
              <div className="ag-card h-100">
                <div className="p-2 text-center">
                  <div className="ag-icon mx-auto mb-1" style={{ background: 'var(--tint-success-12)', color: 'var(--color-success)', width: 40, height: 40, fontSize: '1rem' }}>
                    📊
                  </div>
                  <div className="fw-bold text-success" style={{ fontSize: '0.9rem' }}>
                    {proyeccionMensual.toLocaleString("es-ES", { maximumFractionDigits: 0 })}{simbolo}
                  </div>
                  <div className="text-muted" style={{ fontSize: '0.7rem' }}>Proyección</div>
                </div>
              </div>
            </div>
          </div>

          <div className="row align-items-center">
            <div className="col-12 col-md-3 d-flex flex-column gap-3 align-items-stretch d-none d-md-flex">
              <ResumenCard icon="💰" color="warning" label="Ventas actuales" value={totalVentas} simbolo={simbolo} />
              <ResumenCard icon="📈" color="info" label="Promedio diario" value={promedioDiario} simbolo={simbolo} />
              <ResumenCard icon="📊" color="success" label="Proyección mensual" value={proyeccionMensual} simbolo={simbolo} />
            </div>

            <div className="col-12 col-md-9 mt-3 mt-md-0">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={ventas}>
                  <XAxis dataKey="dia" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="monto" fill="#87abe5" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* ===== GASTOS ===== */}
      <div className="ag-card mb-4">
        <div className="ag-card-header">
          <div className="ag-icon">💸</div>
          <h5 className="mb-0">Análisis de Gastos</h5>
        </div>
        <div className="p-3 p-md-4">
          {/* KPIs móviles de gastos */}
          <div className="row g-2 mb-3 d-md-none">
            <div className="col-6">
              <div className="ag-card h-100">
                <div className="p-2 text-center">
                  <div className="ag-icon mx-auto mb-1" style={{ background: 'var(--tint-info-12)', color: 'var(--color-info)', width: 40, height: 40, fontSize: '1rem' }}>
                    💸
                  </div>
                  <div className="fw-bold text-info" style={{ fontSize: '0.9rem' }}>
                    {gasto.toLocaleString("es-ES", { maximumFractionDigits: 0 })}{simbolo}
                  </div>
                  <div className="text-muted" style={{ fontSize: '0.7rem' }}>Gastos totales</div>
                </div>
              </div>
            </div>
            {mostrarPorcentajeGasto && (
              <div className="col-6">
                <div className="ag-card h-100">
                  <div className="p-2 text-center">
                    <div className="ag-icon mx-auto mb-1" style={{ background: 'var(--tint-warning-12)', color: 'var(--color-warning)', width: 40, height: 40, fontSize: '1rem' }}>
                      {icono}
                    </div>
                    <div className={`fw-bold ${textClass}`} style={{ fontSize: '0.9rem' }}>
                      {porcentaje.toFixed(1)}%
                    </div>
                    <div className="text-muted" style={{ fontSize: '0.7rem' }}>% Gastos</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="row align-items-center">
            <div className="col-12 col-md-3 d-flex flex-column gap-3 align-items-stretch d-none d-md-flex">
              <ResumenCard icon="💸" color="info" label="Gastos actuales" value={gasto} simbolo={simbolo} />

              {mostrarPorcentajeGasto && (
                <div className="card-brand p-3 text-center w-100">
                  <div
                    className={`icono-circular rounded-circle d-inline-flex align-items-center justify-content-center mb-2 ${textClass}`}
                    aria-hidden="true"
                  >
                    {icono}
                  </div>
                  <h6 className={`fw-bold ${textClass}`}>% Gastos</h6>
                  <div className={`fs-4 fw-bold ${textClass}`}>{porcentaje.toFixed(2)} %</div>
                </div>
              )}
            </div>

            <div className="col-12 col-md-9 mt-3 mt-md-0">
              <h6 className="text-center mb-3 d-none d-md-block">Gráfico Diario de Gastos</h6>
              <GastosChef
                datos={gastoDatos.map(item => ({
                  name: item.dia.toString(),
                  porcentaje: item.porcentaje
                }))}
                alto={250}
                rol="encargado"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ===== Acciones rápidas ===== */}
      <div className="ag-card">
        <div className="ag-card-header">
          <div className="ag-icon">⚡</div>
          <h5 className="mb-0">Acciones Rápidas</h5>
        </div>
        <div className="p-3 p-md-4">
          <QuickActionsEncargado onNuevaVenta={() => setMostrarModal(true)} />
        </div>
      </div>

      {/* FAB móvil para nueva venta */}
      <button
        className="ag-fab d-md-none"
        onClick={() => setMostrarModal(true)}
        aria-label="Nueva venta"
        title="Registrar nueva venta"
      >
        <FiPlus size={24} />
      </button>

      {mensaje && (
        <div className={`alert mt-3 ${mensaje.includes("éxito") ? "alert-success" : "alert-danger"}`}>
          {mensaje}
        </div>
      )}

      {mostrarModal && (
        <VentaModal onSave={guardarVenta} onClose={() => setMostrarModal(false)} />
      )}
    </div>
  );
};

const ResumenCard = ({ icon, color, label, value, simbolo }) => (
  <div className="card-brand p-3 text-center w-100">
    <div
      className={`rounded-circle d-inline-flex align-items-center justify-content-center mb-2 text-${color} icono-circular`}
      aria-hidden="true"
    >
      {icon}
    </div>
    <h6 className={`fw-bold text-${color}`}>{label}</h6>
    <div className={`fs-5 fw-bold text-${color}`}>
      {parseFloat(value || 0).toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      {simbolo}
    </div>
  </div>
);
