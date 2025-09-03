// src/front/pages/admin/AdminRestaurantDetail.jsx
import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link, useSearchParams } from "react-router-dom";
import adminService from "../../services/adminService";
import GastosChef from "../../components/GastosChef";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { MonedaSimbolo } from "../../services/MonedaSimbolo";

const AdminRestaurantDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const simbolo = MonedaSimbolo();

  // === Fecha sincronizada con el dashboard (mes/ano por query) ===
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

  // === Estado ===
  const [ventas, setVentas] = useState([]);         // [{dia:number, monto:number}]
  const [resumen, setResumen] = useState(null);     // % gasto + totales
  const [gastoDatos, setGastoDatos] = useState([]); // [{dia:number, porcentaje:number}]
  const [restaurante, setRestaurante] = useState(null);
  const [cargando, setCargando] = useState(false);

  // === Navegar meses ===
  const retrocederMes = () => {
    const [a, m] = fechaSeleccionada.split("-").map(Number);
    const nueva = new Date(a, m - 2, 1);
    const value = `${nueva.getFullYear()}-${String(nueva.getMonth() + 1).padStart(2, "0")}`;
    setFechaSeleccionada(value);
    setSearchParams({ mes: String(nueva.getMonth() + 1), ano: String(nueva.getFullYear()) });
  };
  const avanzarMes = () => {
    const [a, m] = fechaSeleccionada.split("-").map(Number);
    const nueva = new Date(a, m, 1);
    const value = `${nueva.getFullYear()}-${String(nueva.getMonth() + 1).padStart(2, "0")}`;
    setFechaSeleccionada(value);
    setSearchParams({ mes: String(nueva.getMonth() + 1), ano: String(nueva.getFullYear()) });
  };

  // === Helpers ===
  const agruparVentasPorDia = (lista) => {
    // Soporta {dia,monto} o {fecha,monto}
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
    const salida = Array.from(acc.entries())
      .map(([d, m]) => ({ dia: Number(d), monto: Number(m) }))
      .sort((a, b) => a.dia - b.dia);
    return salida;
  };

  // === Carga de datos ===
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

        // 🔧 Normaliza ventas para el gráfico (si viene con fecha, la convertimos a día)
        const ventasAgrupadas = agruparVentasPorDia(Array.isArray(ventasDiarias) ? ventasDiarias : []);
        setVentas(ventasAgrupadas);

        // 🔧 Normaliza % gasto diario
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

  // === KPIs (como encargado) ===
  const totalVentas = ventas.reduce((acc, item) => acc + Number(item.monto || 0), 0);
  const promedioDiario = ventas.length > 0 ? totalVentas / ventas.length : 0;
  const proyeccionMensual = promedioDiario * diasDelMes;

  const porcentaje = Number(resumen?.porcentaje ?? resumen?.porcentaje_gasto ?? 0);
  const gastoTotal = Number(resumen?.gastos ?? resumen?.total_gastos ?? 0);

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
      <button onClick={() => navigate(`/admin/dashboard`)} className="btn btn-link mb-2">
        ← Volver a dashboard
      </button>
      <h1 className="dashboard-title">{restaurante?.nombre || `Restaurante #${id}`}</h1>
      <p className="dashboard-welcome mb-3">Detalle del negocio</p>

      {/* Selector de mes */}
      <div className="d-flex align-items-center justify-content-start gap-2 mb-3" style={{ maxWidth: 380 }}>
        <label className="fw-bold mb-0">Fecha:</label>
        <button
          className="btn btn-sm px-2 py-1 text-white"
          style={{ backgroundColor: "#ff5b00", borderRadius: 8 }}
          onClick={retrocederMes}
        >
          ←
        </button>
        <input
          type="month"
          className="form-control text-center border"
          style={{ flex: 1 }}
          value={fechaSeleccionada}
          onChange={(e) => {
            const value = e.target.value;
            setFechaSeleccionada(value);
            const [a, m] = value.split("-").map(Number);
            setSearchParams({ mes: String(m), ano: String(a) });
          }}
        />
        <button
          className="btn btn-sm px-2 py-1 text-white"
          style={{ backgroundColor: "#ff5b00", borderRadius: 8 }}
          onClick={avanzarMes}
        >
          →
        </button>
      </div>

      {/* VENTAS (tu snippet, intacto) */}
      <div className="card shadow-sm border rounded p-4 pt-0 px-0 mb-4">
        <h5 className="mb-3 fw-bold barralarga">VENTAS</h5>
        <div className="row align-items-center ms-3">
          <div className="col-11 col-sm-11 col-md-3 d-flex flex-column gap-4 align-items-center">
            <ResumenCard icon="💰" color="warning" label="Ventas actuales" value={totalVentas} simbolo={simbolo} />
            <ResumenCard icon="📈" color="info" label="Promedio diario" value={promedioDiario} simbolo={simbolo} />
            <ResumenCard icon="📊" color="success" label="Proyección mensual" value={proyeccionMensual} simbolo={simbolo} />
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

      {/* GASTOS (igual que tenías, solo normalizados los datos) */}
      <div className="card shadow-sm border rounded p-4 pt-0 px-0 mb-4">
        <h5 className="mb-3 fw-bold barralarga">GASTOS</h5>
        <div className="row align-items-center ms-3">
          <div className="col-11 col-sm-11 col-md-3 d-flex flex-column gap-4 align-items-center">
            <ResumenCard icon="💸" color="info" label="Gastos actuales" value={gastoTotal} simbolo={simbolo} />
            <div className={`rounded shadow-sm p-3 text-center w-100 ${bgClass}`}>
              <div className={`icono-circular rounded-circle ${textClass} bg-white d-inline-flex align-items-center justify-content-center mb-2`}>
                {icono}
              </div>
              <h6 className={`fw-bold ${textClass}`}>% Gastos</h6>
              <div className={`fs-4 fw-bold ${textClass}`}>{porcentaje.toFixed(2)} %</div>
            </div>
          </div>

          <div className="col-md-9">
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

      {/* Acciones rápidas */}
      <div className="mt-5 text-center">
        <h5 className="mb-3 fw-bold barralarga">⚡ Acciones Rápidas</h5>
        <div className="d-flex flex-wrap justify-content-center gap-4">
          {[
            {
              icon: "📊",
              title: "Ventas Detalladas",
              subtitle: "Ver ventas día a día",
              link: `/admin/ventas-detalle?restaurante_id=${id}&mes=${mes}&ano=${ano}`,
              bg: "bg-warning-subtle",
            },
            {
              icon: "💸",
              title: "Gastos Detallados",
              subtitle: "Ver gastos por fecha",
              link: `/admin/gastos-detalle?restaurante_id=${id}&mes=${mes}&ano=${ano}`,
              bg: "bg-info-subtle",
            },
          ].map((a, i) => (
            <Link
              to={a.link}
              key={i}
              className="text-decoration-none text-dark"
              style={{ flex: "1 1 200px", maxWidth: "230px" }}
            >
              <div className="card shadow-sm rounded p-3 h-100 text-center hover-shadow">
                <div
                  className={`rounded-circle ${a.bg} d-flex align-items-center justify-content-center mx-auto mb-3`}
                  style={{ width: 60, height: 60, fontSize: "1.5rem" }}
                >
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
  );
};

const ResumenCard = ({ icon, color, label, value, simbolo }) => (
  <div className={`rounded shadow-sm p-3 text-center bg-${color}-subtle w-100`}>
    <div
      className={`icono-circular rounded-circle bg-white text-${color} d-inline-flex align-items-center justify-content-center mb-2`}
      style={{ textShadow: "0 0 1px white" }}
    >
      {icon}
    </div>
    <h6 className={`fw-bold text-${color}`} style={{ textShadow: "0 0 2px white" }}>
      {label}
    </h6>
    <div className={`fs-5 fw-bold text-${color}`} style={{ textShadow: "0 0 2px white" }}>
      {parseFloat(value || 0).toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      {simbolo}
    </div>
  </div>
);

export default AdminRestaurantDetail;
