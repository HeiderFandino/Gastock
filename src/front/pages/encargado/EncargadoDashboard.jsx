import { useEffect, useState } from "react";
import GastosChef from "../../components/GastosChef";
import { QuickActionsEncargado } from "../../components/QuickActionsEncargado";
import "../../styles/EncargadoDashboard.css";
import encargadoServices from "../../services/encargadoServices";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { MonedaSimbolo } from "../../services/MonedaSimbolo";
import useGlobalReducer from "../../hooks/useGlobalReducer";
import VentaModal from "./VentaModal";
import ventaServices from "../../services/ventaServices";
import { useNavigate } from "react-router-dom";
import { PatchAnnouncement } from "../../components/PatchAnnouncement";

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

  const [fechaSeleccionada, setFechaSeleccionada] = useState(() => {
    const hoy = new Date();
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
    <div className="dashboard-container">
      {(user?.rol === "encargado" || user?.rol === "chef") && <PatchAnnouncement />}

      <h1 className="dashboard-title">Resumen De Tu Restaurante</h1>

      {/* CONTROLES FECHA — MÓVIL (SIN CAMBIOS) */}
      <div className="dm-sticky-controls d-flex d-md-none align-items-center gap-2 mb-3 ms-md-3">
        <label className="fw-bold mb-0 d-none d-md-inline">Fecha:</label>
        <button
          className="btn btn-sm px-2 py-1 text-white"
          style={{ backgroundColor: "var(--color-primary)", borderRadius: "var(--radius-md)" }}
          onClick={retrocederMes}
          aria-label="Mes anterior"
        >
          ←
        </button>
        <input
          type="month"
          className="form-control text-center border"
          style={{ flex: 1 }}
          value={fechaSeleccionada}
          onChange={(e) => setFechaSeleccionada(e.target.value)}
          aria-label="Seleccionar mes"
        />
        <button
          className="btn btn-sm px-2 py-1 text-white"
          style={{ backgroundColor: "var(--color-primary)", borderRadius: "var(--radius-md)" }}
          onClick={avanzarMes}
          aria-label="Mes siguiente"
        >
          →
        </button>
      </div>

      {/* CONTROLES FECHA — DESKTOP (TOKENS) */}
      <div className="dm-sticky-controls d-none d-md-flex align-items-center gap-2 mb-3 ms-md-3">
        <label className="fw-bold mb-0">Fecha:</label>
        <button
          className="btn btn-sm px-2 py-1 text-white"
          style={{ backgroundColor: "var(--color-primary)", borderRadius: "var(--radius-md)" }}
          onClick={retrocederMes}
          aria-label="Mes anterior"
        >
          ←
        </button>
        <input
          type="month"
          className="form-control text-center border"
          style={{ flex: 1 }}
          value={fechaSeleccionada}
          onChange={(e) => setFechaSeleccionada(e.target.value)}
          aria-label="Seleccionar mes"
        />
        <button
          className="btn btn-sm px-2 py-1 text-white"
          style={{ backgroundColor: "var(--color-primary)", borderRadius: "var(--radius-md)" }}
          onClick={avanzarMes}
          aria-label="Mes siguiente"
        >
          →
        </button>
      </div>

      {/* ========== MOBILE: KPIs y GRÁFICOS DESPLEGADOS ========== */}
      <div className="d-block d-md-none dm-no-shadow">

        {/* 1) KPIs Ventas */}
        <div className="dm-kpi-row">
          <div className="dm-chip">
            <h6 className="text-warning mb-1">Ventas actuales</h6>
            <p className="dm-valor text-warning">
              {parseFloat(totalVentas).toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              {simbolo}
            </p>
          </div>
          <div className="dm-chip">
            <h6 className="text-info mb-1">Promedio diario</h6>
            <p className="dm-valor text-info">
              {parseFloat(promedioDiario).toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              {simbolo}
            </p>
          </div>
          <div className="dm-chip">
            <h6 className="text-success mb-1">Proyección mensual</h6>
            <p className="dm-valor text-success">
              {parseFloat(proyeccionMensual).toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              {simbolo}
            </p>
          </div>
        </div>

        {/* 2) Gráfico Ventas */}
        <div className="dm-chart mb-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={ventas}>
              <XAxis dataKey="dia" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="monto" fill="#ffa94d" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 3) KPIs Gastos */}
        <div className="dm-kpi-row mt-2">
          <div className="dm-chip">
            <h6 className="text-info mb-1">Gastos actuales</h6>
            <p className="dm-valor text-info">
              {parseFloat(gasto).toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              {simbolo}
            </p>
          </div>
          <div className="dm-chip">
            <h6 className={`${textClass} mb-1`}>% Gastos</h6>
            <p className={`dm-valor ${textClass}`}>{porcentaje} %</p>
          </div>
        </div>

        {/* 4) Gráfico Gastos */}
        <div className="dm-chart">
          <GastosChef
            datos={gastoDatos}
            ancho="100%"
            alto={180}
            rol="encargado"
            xAxisProps={{
              dataKey: "dia",
              type: "number",
              domain: [1, diasDelMes],
              allowDecimals: false,
              tickCount: diasDelMes,
            }}
            yAxisProps={{ domain: [0, 100], tickFormatter: (v) => `${v}%` }}
            tooltipProps={{ formatter: (v) => `${v}%` }}
            lineProps={{ dataKey: "porcentaje", stroke: "#82ca9d", strokeWidth: 2, dot: { r: 2 }, name: "% gasto" }}
          />
        </div>

        {/* Acciones rápidas compactas */}

        <QuickActionsEncargado onNuevaVenta={() => setMostrarModal(true)} />

      </div>

      {/* ========== DESKTOP: igual que ya tenías ========== */}
      <div className="d-none d-md-block">
        <div className="section-title">VENTAS</div>
        <div className="section-wrapper">
          <div className="row align-items-center ms-md-3">
            <div className="col-11 col-sm-11 col-md-3 d-flex flex-column gap-4 align-items-center mt-2">
              <div className="rounded shadow-sm p-3 text-center bg-warning-subtle w-100">
                <div className="icono-circular bg-white text-warning mb-2">💰</div>
                <h6 className="fw-bold text-warning">Ventas actuales</h6>
                <div className="fs-4 fw-bold text-warning">
                  {parseFloat(totalVentas).toLocaleString("es-ES", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                  {simbolo}
                </div>
              </div>
              <div className="rounded shadow-sm p-3 text-center bg-info-subtle w-100">
                <div className="icono-circular rounded-circle bg-white text-info d-inline-flex align-items-center justify-content-center mb-2">📈</div>
                <h6 className="fw-bold text-info">Promedio diario</h6>
                <div className="fs-5 fw-bold text-info" style={{ textShadow: "0 0 1px white" }}>
                  {parseFloat(promedioDiario).toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  {simbolo}
                </div>
              </div>
              <div className="rounded shadow-sm p-3 text-center bg-success-subtle w-100">
                <div className="icono-circular rounded-circle bg-white text-success d-inline-flex align-items-center justify-content-center mb-2">📊</div>
                <h6 className="fw-bold text-success">Proyección mensual</h6>
                <div className="fs-5 fw-bold text-success" style={{ textShadow: "0 0 1px white" }}>
                  {parseFloat(proyeccionMensual).toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  {simbolo}
                </div>
              </div>
            </div>
            <div className="col-md-9">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={ventas}>
                  <XAxis dataKey="dia" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="monto" fill="#ffa94d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* GASTOS */}
        <div className="section-title">GASTOS</div>
        <div className="section-wrapper">
          <div className="row align-items-center ms-md-3">
            <div className="col-11 col-sm-11 col-md-3 d-flex flex-column gap-4 align-items-center mt-2">
              <div className="rounded shadow-sm p-3 text-center bg-info-subtle w-100">
                <div className="icono-circular bg-white text-info mb-2">💸</div>
                <h6 className="fw-bold text-info">Gastos actuales</h6>
                <div className="fs-4 fw-bold text-info">
                  {parseFloat(gasto).toLocaleString("es-ES", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                  {simbolo}
                </div>
              </div>
              <div className={`rounded shadow-sm p-3 text-center w-100 ${bgClass}`}>
                <div className={`icono-circular rounded-circle ${textClass} bg-white d-inline-flex align-items-center justify-content-center mb-2`}>{icono}</div>
                <h6 className={`fw-bold ${textClass}`}>% Gastos</h6>
                <div className={`fs-4 fw-bold ${textClass}`} style={{ textShadow: "0 0 1px white" }}>
                  {porcentaje} %
                </div>
              </div>
            </div>
            <div className="col-md-9">
              <h6 className="text-center mb-3">Gráfico Diario de Gastos</h6>
              <GastosChef
                datos={gastoDatos}
                ancho="100%"
                alto={250}
                rol="encargado"
                xAxisProps={{
                  dataKey: "dia",
                  type: "number",
                  domain: [1, diasDelMes],
                  allowDecimals: false,
                  tickCount: diasDelMes,
                }}
                yAxisProps={{ domain: [0, 100], tickFormatter: (v) => `${v}%` }}
                tooltipProps={{ formatter: (v) => `${v}%` }}
                lineProps={{ dataKey: "porcentaje", stroke: "#82ca9d", strokeWidth: 2, dot: { r: 3 }, name: "% gasto" }}
              />
            </div>
          </div>
        </div>


        <QuickActionsEncargado onNuevaVenta={() => setMostrarModal(true)} />

      </div>

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
