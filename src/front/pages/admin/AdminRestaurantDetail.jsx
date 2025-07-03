import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import adminService from "../../services/adminService";
import GastosChef from "../../components/GastosChef";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { MonedaSimbolo } from "../../services/MonedaSimbolo";

const AdminRestaurantDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const simbolo = MonedaSimbolo();
  const [ventas, setVentas] = useState([]);
  const [resumen, setResumen] = useState(null);
  const [gastoDatos, setGastoDatos] = useState([]);
  const [restaurante, setRestaurante] = useState(null);

  useEffect(() => {
    const fecha = new Date();
    const mes = fecha.getMonth() + 1;
    const ano = fecha.getFullYear();

    adminService.getRestaurantes()
      .then(data => {
        const seleccionado = data.find(r => r.id === parseInt(id));
        setRestaurante(seleccionado);
      })
      .catch(err => console.error("Error obteniendo restaurante:", err));

    adminService.getResumenPorcentaje(id, mes, ano)
      .then((data) => setResumen(data))
      .catch((err) => console.error(err));

    adminService.getVentasDiarias(id, mes, ano)
      .then((data) => setVentas(data))
      .catch((err) => console.error(err));

    adminService.getGastoDiario(id, mes, ano)
      .then((data) => {
        const formateado = data.map(d => ({
          name: d.dia,
          porcentaje: d.porcentaje ?? 0
        }));
        setGastoDatos(formateado);
      })
      .catch((err) => console.error("Error al cargar gasto diario:", err));
  }, [id]);

  const totalVentas = ventas.reduce((acc, item) => acc + item.monto, 0);
  const promedioDiario = ventas.length ? (totalVentas / ventas.length).toFixed(2) : 0;
  const proyeccionMensual = (promedioDiario * 30).toFixed(2);

  const porcentaje = resumen?.porcentaje || resumen?.porcentaje_gasto || 0;
  const gasto = resumen?.gastos || resumen?.total_gastos || 0;

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
      <button onClick={() => navigate('/admin/dashboard')} className="back-button">← Volver a dashboard</button>
      <h1 className="dashboard-title">{restaurante?.nombre || `Restaurante #${id}`}</h1>
      <p className="dashboard-welcome mb-4">Detalle del negocio</p>

      {/* Ventas */}
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

      {/* Gastos */}
      <div className="card shadow-sm border rounded p-4 pt-0 px-0 mb-4">
        <h5 className="mb-3 fw-bold barralarga">GASTOS</h5>
        <div className="row align-items-center ms-3">
          <div className="col-11 col-sm-11 col-md-3 d-flex flex-column gap-4 align-items-center">
            <ResumenCard icon="💸" color="info" label="Gastos actuales" value={gasto} simbolo={simbolo} />
            <div className={`rounded shadow-sm p-3 text-center w-100 ${bgClass}`}>
              <div className={`icono-circular rounded-circle ${textClass} bg-white d-inline-flex align-items-center justify-content-center mb-2`}>
                {icono}
              </div>
              <h6 className={`fw-bold ${textClass}`}>% Gastos</h6>
              <div className={`fs-4 fw-bold ${textClass}`}>{porcentaje} %</div>
            </div>
          </div>

          <div className="col-md-9">
            <h6 className="text-center mb-3">Gráfico Diario de Gastos</h6>
            <GastosChef
              datos={gastoDatos}
              ancho={800}
              alto={250}
              rol="admin"
              xAxisProps={{ dataKey: "name", interval: 0 }}
              yAxisProps={{ domain: [0, 100], tickFormatter: v => `${v}%` }}
              tooltipProps={{ formatter: v => `${v}%` }}
              lineProps={{ dataKey: "porcentaje", stroke: "#82ca9d", strokeWidth: 2, dot: { r: 3 } }}
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
              link: `/admin/ventas-detalle?restaurante_id=${id}`,
              bg: "bg-warning-subtle"
            },
            {
              icon: "💸",
              title: "Gastos Detallados",
              subtitle: "Ver gastos por fecha",
              link: `/admin/gastos-detalle?restaurante_id=${id}`,
              bg: "bg-info-subtle"
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
                  style={{ width: "60px", height: "60px", fontSize: "1.5rem" }}
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
      style={{ textShadow: '0 0 1px white' }}
    >
      {icon}
    </div>
    <h6
      className={`fw-bold text-${color}`}
      style={{ textShadow: '0 0 2px white' }}
    >
      {label}
    </h6>
    <div
      className={`fs-5 fw-bold text-${color}`}
      style={{ textShadow: '0 0 2px white' }}
    >
      {parseFloat(value).toLocaleString('es-ES', { minimumFractionDigits: 2 })}{simbolo}
    </div>
  </div>
);

export default AdminRestaurantDetail;
