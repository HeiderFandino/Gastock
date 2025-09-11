// src/front/pages/admin/AdminRestaurantDetail.jsx
import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link, useSearchParams } from "react-router-dom";
import adminService from "../../services/adminService";
import GastosChef from "../../components/GastosChef";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { MonedaSimbolo } from "../../services/MonedaSimbolo";

// CSS unificado para admin
import "../../styles/AdminRestaurantDetail.css";
import "../../styles/AdminGastos.css";
import { FiArrowLeft, FiTrendingUp, FiDollarSign } from "react-icons/fi";

const AdminRestaurantDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const simbolo = MonedaSimbolo();

  const hoy = useMemo(() => new Date(), []);
  const mesUrl = Number(searchParams.get("mes"));
  const anoUrl = Number(searchParams.get("ano"));
  const [fechaSeleccionada, setFechaSeleccionada] = useState(() => {
    const m = mesUrl && mesUrl >= 1 && mesUrl <= 12 ? mesUrl : hoy.getMonth() + 1;
    const a = anoUrl || hoy.getFullYear();
    return `${a}-${String(m).padStart(2, "0")}`;
  });
  const [ano, mes] = fechaSeleccionada.split("-").map(Number);
  const diasDelMes = useMemo(() => new Date(ano, mes, 0).getDate(), [ano, mes]);

  const [ventas, setVentas] = useState([]);
  const [resumen, setResumen] = useState(null);
  const [gastoDatos, setGastoDatos] = useState([]);
  const [restaurante, setRestaurante] = useState(null);
  const [cargando, setCargando] = useState(false);

  // Fija --navbar-h según el header real (sticky exacto)
  useEffect(() => {
    const nav = document.querySelector("nav.navbar.sticky-top");
    const setVar = () => {
      const h = nav ? Math.ceil(nav.getBoundingClientRect().height) : 56;
      document.documentElement.style.setProperty("--navbar-h", `${h}px`);
    };
    setVar();
    window.addEventListener("resize", setVar);
    window.addEventListener("orientationchange", setVar);
    return () => {
      window.removeEventListener("resize", setVar);
      window.removeEventListener("orientationchange", setVar);
    };
  }, []);

  const setMesUrl = (y, m) => setSearchParams({ mes: String(m), ano: String(y) });
  const retrocederMes = () => {
    const [a, m] = fechaSeleccionada.split("-").map(Number);
    const nueva = new Date(a, m - 2, 1);
    const value = `${nueva.getFullYear()}-${String(nueva.getMonth() + 1).padStart(2, "0")}`;
    setFechaSeleccionada(value);
    setMesUrl(nueva.getFullYear(), nueva.getMonth() + 1);
  };
  const avanzarMes = () => {
    const [a, m] = fechaSeleccionada.split("-").map(Number);
    const nueva = new Date(a, m, 1);
    const value = `${nueva.getFullYear()}-${String(nueva.getMonth() + 1).padStart(2, "0")}`;
    setFechaSeleccionada(value);
    setMesUrl(nueva.getFullYear(), nueva.getMonth() + 1);
  };
  const onChangeMesInput = (value) => {
    setFechaSeleccionada(value);
    const [a, m] = value.split("-").map(Number);
    setMesUrl(a, m);
  };

  const agruparVentasPorDia = (lista) => {
    const acc = new Map();
    (lista || []).forEach((v) => {
      const dia =
        v.dia != null
          ? Number(v.dia)
          : v.fecha
            ? new Date(v.fecha).getDate()
            : null;
      if (!dia) return;
      const monto = Number(v.monto ?? 0);
      acc.set(dia, (acc.get(dia) || 0) + monto);
    });
    return Array.from(acc.entries())
      .map(([d, m]) => ({ dia: Number(d), monto: Number(m) }))
      .sort((a, b) => a.dia - b.dia);
  };

  useEffect(() => {
    let cancelado = false;
    const cargar = async () => {
      setCargando(true);
      try {
        const rid = Number(id);
        const [allRestaurantes, resumenPct, ventasDiarias, gastoDiario] = await Promise.all([
          adminService.getRestaurantes(),
          adminService.getResumenPorcentaje(rid, mes, ano),
          adminService.getVentasDiarias(rid, mes, ano),
          adminService.getGastoDiario(rid, mes, ano),
        ]);
        if (cancelado) return;

        const seleccionado = (allRestaurantes || []).find((r) => r.id === rid) || null;
        setRestaurante(seleccionado);

        setResumen(resumenPct || null);

        const ventasAgrupadas = agruparVentasPorDia(Array.isArray(ventasDiarias) ? ventasDiarias : []);
        setVentas(ventasAgrupadas);

        const g = Array.isArray(gastoDiario)
          ? gastoDiario.map((d) => ({
            dia: Number(d.dia),
            porcentaje: Number(d.porcentaje ?? 0),
          }))
          : [];
        setGastoDatos(g);
      } catch (e) {
        console.error("Error cargando detalle admin:", e);
      } finally {
        if (!cancelado) setCargando(false);
      }
    };
    cargar();
    return () => {
      cancelado = true;
    };
  }, [id, mes, ano]);

  const totalVentas = ventas.reduce((acc, item) => acc + Number(item.monto || 0), 0);
  const promedioDiario = ventas.length > 0 ? totalVentas / ventas.length : 0;
  const proyeccionMensual = promedioDiario * diasDelMes;

  const porcentaje = Number(resumen?.porcentaje ?? resumen?.porcentaje_gasto ?? 0);
  const gastoTotal = Number(resumen?.gastos ?? resumen?.total_gastos ?? 0);

  let textClass = "text-success";
  let icono = "✅";
  if (porcentaje > 36) { textClass = "text-danger"; icono = "🚨"; }
  else if (porcentaje > 33) { textClass = "text-warning"; icono = "⚠️"; }

  const nombreMes = useMemo(() => {
    const [a, m] = fechaSeleccionada.split("-").map(Number);
    return new Date(a, m - 1).toLocaleString("es", { month: "long", year: "numeric" });
  }, [fechaSeleccionada]);

  return (
    <div className="dashboard-container admin-bb admin-detail">
      {/* ===== Header compacto v2 ===== */}
      <div className="ag-header mb-3">
        <div className="ag-header-top">
          <button className="btn btn-light ag-back" onClick={() => navigate(`/admin/dashboard`)}>
            <FiArrowLeft size={16} className="me-1" /> Volver
          </button>
          <div className="ag-brand-dot" />
        </div>

        <div className="ag-title-wrap">
          <h1 className="ag-title">{restaurante?.nombre || `Restaurante #${id}`}</h1>
          <p className="ag-subtitle">Análisis detallado de ventas y gastos del restaurante.</p>
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
              onChange={(e) => onChangeMesInput(e.target.value)}
              aria-label="Seleccionar mes"
            />
          </div>

          <button className="ag-monthbtn" onClick={avanzarMes} aria-label="Mes siguiente">→</button>
        </div>
      </div>

      {/* ===== KPIs móviles ===== */}
      <div className="row g-2 mb-3 d-md-none">
        <div className="col-6">
          <div className="ag-card h-100">
            <div className="p-3 text-center">
              <div className="ag-icon mx-auto mb-2" style={{ background: 'var(--brand-surface)', color: 'var(--brand-primary)' }}>
                <FiTrendingUp size={18} />
              </div>
              <div className="fw-bold text-success" style={{ fontSize: '1.1rem' }}>
                {totalVentas.toLocaleString("es-ES", { maximumFractionDigits: 0 })}{simbolo}
              </div>
              <div className="text-muted small">{nombreMes}</div>
            </div>
          </div>
        </div>
        <div className="col-6">
          <div className="ag-card h-100">
            <div className="p-3 text-center">
              <div className="ag-icon mx-auto mb-2" style={{ background: 'var(--brand-surface)', color: 'var(--brand-primary)' }}>
                {icono}
              </div>
              <div className={`fw-bold ${textClass}`} style={{ fontSize: '1.1rem' }}>
                {porcentaje.toFixed(1)}%
              </div>
              <div className="text-muted small">% Gasto</div>
            </div>
          </div>
        </div>
      </div>

      {cargando && <div className="w-100 text-center py-2">Cargando…</div>}

      {/* ===== VENTAS ===== */}
      <div className="ag-card mb-4">
        <div className="ag-card-header">
          <div className="ag-icon">📊</div>
          <h5 className="mb-0">Análisis de Ventas</h5>
        </div>
        <div className="p-3 p-md-4">
          <div className="row align-items-center">
            <div className="col-12 col-md-3 d-flex flex-column gap-3 align-items-stretch">
              <ResumenCard icon="💰" color="info" label="Ventas actuales" value={totalVentas} simbolo={simbolo} />
              <ResumenCard icon="📈" color="warning" label="Promedio diario" value={promedioDiario} simbolo={simbolo} />
              <ResumenCard icon="📊" color="success" label="Proyección mensual" value={proyeccionMensual} simbolo={simbolo} />
            </div>

            <div className="col-12 col-md-9 mt-3 mt-md-0">
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
      </div>

      {/* ===== GASTOS ===== */}
      <div className="ag-card mb-4">
        <div className="ag-card-header">
          <div className="ag-icon">💸</div>
          <h5 className="mb-0">Análisis de Gastos</h5>
        </div>
        <div className="p-3 p-md-4">
          <div className="row align-items-center">
            <div className="col-12 col-md-3 d-flex flex-column gap-3 align-items-stretch">
              <ResumenCard icon="💸" color="info" label="Gastos actuales" value={gastoTotal} simbolo={simbolo} />

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
              <h6 className="text-center mb-3">Gráfico Diario de Gastos</h6>
              <GastosChef
                datos={gastoDatos}
                ancho="100%"
                alto={250}
                rol="admin"
                xAxisProps={{ dataKey: "dia" }}
                yAxisProps={{ domain: [0, 100], tickFormatter: (v) => `${v}%` }}
                tooltipProps={{ formatter: (v) => `${v}%` }}
                lineProps={{ dataKey: "porcentaje", stroke: "#82ca9d", strokeWidth: 2, dot: { r: 3 }, name: "% gasto" }}
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
          <div className="d-flex flex-wrap justify-content-center gap-3">
            {[
              {
                icon: "📊",
                title: "Ventas Detalladas",
                subtitle: "Ver ventas día a día",
                link: `/admin/ventas-detalle?restaurante_id=${id}&mes=${mes}&ano=${ano}`,
              },
              {
                icon: "💸",
                title: "Gastos Detallados",
                subtitle: "Ver gastos por fecha",
                link: `/admin/gastos-detalle?restaurante_id=${id}&mes=${mes}&ano=${ano}`,
              },
            ].map((a, i) => (
              <Link
                to={a.link}
                key={i}
                className="text-decoration-none text-dark"
                style={{ flex: "1 1 200px", maxWidth: "230px" }}
              >
                <div className="card-brand p-3 h-100 text-center hover-shadow">
                  <div className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3 icono-circular" style={{ width: 60, height: 60, fontSize: "1.5rem" }}>
                    {a.icon}
                  </div>
                  <h6 className="fw-bold">{a.title}</h6>
                  <small className="text-muted">{a.subtitle}</small>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
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

export default AdminRestaurantDetail;