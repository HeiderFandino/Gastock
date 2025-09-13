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

export const EncargadoDashboard = () => {
  const { store } = useGlobalReducer();
  const navigate = useNavigate();

  const simbolo = MonedaSimbolo();
  const [gastoDatos, setGastoDatos] = useState([]);
  const [resumenMensual, setResumenMensual] = useState(null);
  const [ventas, setVentas] = useState([]);
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
  const diasDelMes = new Date(ano, mes, 0).getDate();

  const nombreMes = useMemo(() => {
    const [a, m] = fechaSeleccionada.split("-").map(Number);
    return new Date(a, m - 1).toLocaleString("es", { month: "long", year: "numeric" });
  }, [fechaSeleccionada]);

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

    encargadoServices
      .resumenGastoDiario(mes, ano)
      .then((resumen) => {
        const data = resumen.map((item) => ({
          dia: Number(item.dia),
          porcentaje: Number(item.porcentaje),
        }));
        setGastoDatos(data);
      })
      .catch(console.error);

    encargadoServices
      .resumenGastoMensual(mes, ano)
      .then((resumen) => setResumenMensual(resumen))
      .catch(console.error);

    encargadoServices
      .resumenVentasDiarias(mes, ano)
      .then((data) => setVentas(data))
      .catch(console.error);

    const el = document.getElementsByClassName("custom-sidebar")[0];
    if (el) el.scrollTo(0, 0);
  }, [fechaSeleccionada]);

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
    <div className="dashboard-container admin-bb">
      {(user?.rol === "encargado" || user?.rol === "chef") && <PatchAnnouncement />}

      {/* ===== Header compacto v2 ===== */}
      <div className="ag-header mb-3">

        <div className="ag-title-wrap">
          <h1 className="ag-title">Resumen De Tu Restaurante</h1>
          <p className="ag-subtitle">Dashboard principal con métricas de ventas y gastos del restaurante.</p>
        </div>

        {/* Controles Mes (compactos y centrados) */}
        <div className="ag-monthbar">
          <button className="ag-monthbtn" onClick={retrocederMes} aria-label="Mes anterior">←</button>

          <div className="ag-monthpill">
            {nombreMes}
            {/* input real (oculto) para accesibilidad y teclado */}
            <input
              type="month"
              className="ag-month-hidden"
              value={fechaSeleccionada}
              onChange={(e) => setFechaSeleccionada(e.target.value)}
              aria-label="Seleccionar mes"
            />
          </div>

          <button className="ag-monthbtn" onClick={avanzarMes} aria-label="Mes siguiente">→</button>
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
          </div>

          <div className="row align-items-center">
            <div className="col-12 col-md-3 d-flex flex-column gap-3 align-items-stretch d-none d-md-flex">
              <ResumenCard icon="💸" color="info" label="Gastos actuales" value={gasto} simbolo={simbolo} />

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
