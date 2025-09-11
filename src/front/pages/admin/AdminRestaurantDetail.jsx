// src/front/pages/admin/AdminRestaurantDetail.jsx
import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link, useSearchParams } from "react-router-dom";
import adminService from "../../services/adminService";
import GastosChef from "../../components/GastosChef";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { MonedaSimbolo } from "../../services/MonedaSimbolo";

// Estilos ya incluidos en brand-unified.css
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
    <div className="min-vh-100" style={{ background: "var(--color-bg)" }}>
      {/* Header */}
      <div
        className="sticky-top"
        style={{ background: "var(--color-bg)", borderBottom: "1px solid var(--color-border)", zIndex: 10 }}
      >
        <div className="container-fluid px-4 py-3">
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-3">
              <button
                className="btn-gastock-outline btn-sm d-flex align-items-center gap-2"
                onClick={() => navigate(`/admin/dashboard`)}
                style={{ padding: '8px 12px' }}
              >
                <FiArrowLeft size={16} /> Volver
              </button>
              <div>
                <h1 className="h4 fw-bold mb-0" style={{ color: "var(--color-text)" }}>
                  🏢 {restaurante?.nombre || `Restaurante #${id}`}
                </h1>
                <p className="text-muted mb-0 small">Análisis detallado de ventas y gastos</p>
              </div>
            </div>

            {/* Controles de mes */}
            <div className="d-flex align-items-center gap-2">
              <button
                className="btn d-flex align-items-center justify-content-center"
                style={{ 
                  width: '40px', 
                  height: '40px', 
                  borderRadius: '10px',
                  background: 'var(--color-bg-card)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text)',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'var(--color-bg-subtle)';
                  e.target.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'var(--color-bg-card)';
                  e.target.style.transform = 'translateY(0)';
                }}
                onClick={retrocederMes}
                aria-label="Mes anterior"
              >
                ←
              </button>

              <div 
                className="px-4 py-2 fw-medium text-center" 
                style={{ 
                  background: 'linear-gradient(135deg, var(--color-bg-card), var(--color-bg-subtle))', 
                  border: '1px solid var(--color-border)', 
                  borderRadius: '12px',
                  minWidth: '200px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
                  fontSize: '0.95rem',
                  color: 'var(--color-text)'
                }}
              >
                📅 {nombreMes}
                <input
                  type="month"
                  style={{ position: 'absolute', left: '-9999px', opacity: 0 }}
                  value={fechaSeleccionada}
                  onChange={(e) => onChangeMesInput(e.target.value)}
                  aria-label="Seleccionar mes"
                />
              </div>

              <button
                className="btn d-flex align-items-center justify-content-center"
                style={{ 
                  width: '40px', 
                  height: '40px', 
                  borderRadius: '10px',
                  background: 'var(--color-bg-card)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text)',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'var(--color-bg-subtle)';
                  e.target.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'var(--color-bg-card)';
                  e.target.style.transform = 'translateY(0)';
                }}
                onClick={avanzarMes}
                aria-label="Mes siguiente"
              >
                →
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container-fluid px-4 py-4">

        {/* ===== KPIs móviles ===== */}
        <div className="row g-3 mb-4 d-md-none">
          <div className="col-6">
            <div 
              className="p-3 text-center h-100"
              style={{
                background: "var(--color-bg-card)",
                border: "1px solid var(--color-border)",
                borderRadius: "12px",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)"
              }}
            >
              <div 
                className="mx-auto mb-2 d-flex align-items-center justify-content-center"
                style={{
                  width: '40px',
                  height: '40px',
                  background: 'var(--color-bg-subtle)',
                  borderRadius: '10px',
                  color: 'var(--color-primary)'
                }}
              >
                <FiTrendingUp size={18} />
              </div>
              <div className="fw-bold text-success" style={{ fontSize: '1.1rem' }}>
                {totalVentas.toLocaleString("es-ES", { maximumFractionDigits: 0 })}{simbolo}
              </div>
              <div className="text-muted small">💰 Ventas</div>
            </div>
          </div>
          <div className="col-6">
            <div 
              className="p-3 text-center h-100"
              style={{
                background: "var(--color-bg-card)",
                border: "1px solid var(--color-border)",
                borderRadius: "12px",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)"
              }}
            >
              <div 
                className="mx-auto mb-2 d-flex align-items-center justify-content-center"
                style={{
                  width: '40px',
                  height: '40px',
                  background: 'var(--color-bg-subtle)',
                  borderRadius: '10px',
                  fontSize: '1.2rem'
                }}
              >
                {icono}
              </div>
              <div className={`fw-bold ${textClass}`} style={{ fontSize: '1.1rem' }}>
                {porcentaje.toFixed(1)}%
              </div>
              <div className="text-muted small">💸 % Gasto</div>
            </div>
          </div>
        </div>

        {cargando && (
          <div className="text-center py-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
            <p className="mt-3 text-muted">Cargando datos...</p>
          </div>
        )}

        {/* ===== VENTAS ===== */}
        <div 
          className="mb-4"
          style={{
            background: "var(--color-bg-card)",
            border: "1px solid var(--color-border)",
            borderRadius: "16px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)"
          }}
        >
          <div 
            className="px-4 py-3 d-flex align-items-center gap-3"
            style={{ borderBottom: "1px solid var(--color-border)" }}
          >
            <div 
              className="d-flex align-items-center justify-content-center"
              style={{
                width: '40px',
                height: '40px',
                background: 'var(--color-bg-subtle)',
                borderRadius: '10px',
                fontSize: '1.2rem'
              }}
            >
              📊
            </div>
            <h5 className="mb-0 fw-bold" style={{ color: "var(--color-text)" }}>Análisis de Ventas</h5>
          </div>
          <div className="p-4">
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
                    <Bar dataKey="monto" fill="var(--color-primary)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* ===== GASTOS ===== */}
        <div 
          className="mb-4"
          style={{
            background: "var(--color-bg-card)",
            border: "1px solid var(--color-border)",
            borderRadius: "16px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)"
          }}
        >
          <div 
            className="px-4 py-3 d-flex align-items-center gap-3"
            style={{ borderBottom: "1px solid var(--color-border)" }}
          >
            <div 
              className="d-flex align-items-center justify-content-center"
              style={{
                width: '40px',
                height: '40px',
                background: 'var(--color-bg-subtle)',
                borderRadius: '10px',
                fontSize: '1.2rem'
              }}
            >
              💸
            </div>
            <h5 className="mb-0 fw-bold" style={{ color: "var(--color-text)" }}>Análisis de Gastos</h5>
          </div>
          <div className="p-4">
            <div className="row align-items-center">
              <div className="col-12 col-md-3 d-flex flex-column gap-3 align-items-stretch">
                <ResumenCard icon="💸" color="info" label="Gastos actuales" value={gastoTotal} simbolo={simbolo} />

                <div 
                  className="p-3 text-center w-100"
                  style={{
                    background: "var(--color-bg-subtle)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "12px"
                  }}
                >
                  <div
                    className={`rounded-circle d-inline-flex align-items-center justify-content-center mb-2`}
                    style={{
                      width: '40px',
                      height: '40px',
                      fontSize: '1.2rem'
                    }}
                    aria-hidden="true"
                  >
                    {icono}
                  </div>
                  <h6 className={`fw-bold ${textClass}`}>% Gastos</h6>
                  <div className={`fs-4 fw-bold ${textClass}`}>{porcentaje.toFixed(2)}%</div>
                </div>
              </div>

              <div className="col-12 col-md-9 mt-3 mt-md-0">
                <h6 className="text-center mb-3" style={{ color: "var(--color-text)" }}>Gráfico Diario de Gastos</h6>
                <GastosChef
                  datos={gastoDatos}
                  ancho="100%"
                  alto={250}
                  rol="admin"
                  xAxisProps={{ dataKey: "dia" }}
                  yAxisProps={{ domain: [0, 100], tickFormatter: (v) => `${v}%` }}
                  tooltipProps={{ formatter: (v) => `${v}%` }}
                  lineProps={{ dataKey: "porcentaje", stroke: "var(--brand-600)", strokeWidth: 2, dot: { r: 3 }, name: "% gasto" }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ===== Acciones rápidas ===== */}
        <div 
          style={{
            background: "var(--color-bg-card)",
            border: "1px solid var(--color-border)",
            borderRadius: "16px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)"
          }}
        >
          <div 
            className="px-4 py-3 d-flex align-items-center gap-3"
            style={{ borderBottom: "1px solid var(--color-border)" }}
          >
            <div 
              className="d-flex align-items-center justify-content-center"
              style={{
                width: '40px',
                height: '40px',
                background: 'var(--color-bg-subtle)',
                borderRadius: '10px',
                fontSize: '1.2rem'
              }}
            >
              ⚡
            </div>
            <h5 className="mb-0 fw-bold" style={{ color: "var(--color-text)" }}>Acciones Rápidas</h5>
          </div>
          <div className="p-4">
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
                  className="text-decoration-none"
                  style={{ flex: "1 1 200px", maxWidth: "230px" }}
                >
                  <div 
                    className="p-4 h-100 text-center"
                    style={{
                      background: "var(--color-bg-subtle)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "12px",
                      transition: "all 0.2s ease",
                      color: "var(--color-text)"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div 
                      className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" 
                      style={{ 
                        width: '60px', 
                        height: '60px', 
                        fontSize: "1.5rem",
                        background: 'var(--color-bg-card)'
                      }}
                    >
                      {a.icon}
                    </div>
                    <h6 className="fw-bold mb-2">{a.title}</h6>
                    <small className="text-muted">{a.subtitle}</small>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ResumenCard = ({ icon, color, label, value, simbolo }) => (
  <div 
    className="p-3 text-center w-100"
    style={{
      background: "var(--color-bg-subtle)",
      border: "1px solid var(--color-border)",
      borderRadius: "12px"
    }}
  >
    <div
      className={`rounded-circle d-inline-flex align-items-center justify-content-center mb-2 text-${color}`}
      style={{
        width: '40px',
        height: '40px',
        fontSize: '1.2rem',
        background: 'var(--color-bg-card)'
      }}
      aria-hidden="true"
    >
      {icon}
    </div>
    <h6 className={`fw-bold text-${color} mb-1`}>{label}</h6>
    <div className={`fs-5 fw-bold text-${color}`}>
      {parseFloat(value || 0).toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      {simbolo}
    </div>
  </div>
);

export default AdminRestaurantDetail;