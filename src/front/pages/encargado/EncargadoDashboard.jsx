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


  const guardarVenta = async (form) => {
    try {
      await ventaServices.registrarVenta({
        ...form,
        restaurante_id: user.restaurante_id,
      });
      setMensaje("Venta registrada con éxito");
      setTimeout(() => setMensaje(""), 2000);
      setMostrarModal(false);
      navigate(`/encargado/ventas`)
    } catch (error) {
      setMensaje("Error al registrar la venta");
      setTimeout(() => setMensaje(""), 2000);
    }
  };

  useEffect(() => {
    const fecha = new Date();
    const mes = fecha.getMonth() + 1;
    const ano = fecha.getFullYear();

    encargadoServices.resumenGastoDiario(mes, ano)
      .then((resumen) => {
        const data = resumen.map((item) => ({
          name: `${item.dia}`,
          porcentaje: item.porcentaje,
        }));
        setGastoDatos(data);
      })
      .catch((err) => console.error(err));

    encargadoServices.resumenGastoMensual(mes, ano)
      .then((resumen) => setResumenMensual(resumen))
      .catch((err) => console.error(err));

    encargadoServices.resumenVentasDiarias(mes, ano)
      .then((data) => setVentas(data))
      .catch((err) => console.error(err));

    const el = document.getElementsByClassName("custom-sidebar")[0];
    if (el) el.scrollTo(0, 0);
  }, []);

  const porcentaje = resumenMensual?.porcentaje || 0;
  const gasto = resumenMensual?.gastos || 0;
  const totalVentas = ventas.reduce((acc, item) => acc + item.monto, 0);
  const promedioDiario = ventas.length > 0 ? (totalVentas / ventas.length) : 0;
  const proyeccionMensual = promedioDiario * 30;

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
      <h1 className="dashboard-title">Resumen De Tu Restaurante</h1>
      <p className="dashboard-welcome mb-4">Configura tu Restaurante</p>

      <div className="card shadow-sm border rounded p-4 pt-0 px-0 mb-4">
        <h5 className="mb-3 fw-bold barralarga">VENTAS</h5>
        <div className="row align-items-center ms-3">
          <div className="col-11 col-sm-11 col-md-3 d-flex flex-column gap-4 align-items-center">
            <div className="rounded shadow-sm p-3 text-center bg-warning-subtle w-100">
              <div className="icono-circular rounded-circle bg-white text-warning d-inline-flex align-items-center justify-content-center mb-2">
                💰
              </div>
              <h6 className="fw-bold text-warning">Ventas actuales</h6>
              <div className="fs-4 fw-bold text-warning" style={{ textShadow: '0 0 1px white' }}>
                {parseFloat(totalVentas).toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{simbolo}
              </div>
            </div>

            <div className="rounded shadow-sm p-3 text-center bg-info-subtle w-100">
              <div className="icono-circular rounded-circle bg-white text-info d-inline-flex align-items-center justify-content-center mb-2">
                📈
              </div>
              <h6 className="fw-bold text-info">Promedio diario</h6>
              <div className="fs-5 fw-bold text-info" style={{ textShadow: '0 0 1px white' }}>
                {parseFloat(promedioDiario).toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{simbolo}
              </div>
            </div>

            <div className="rounded shadow-sm p-3 text-center bg-success-subtle w-100">
              <div className="icono-circular rounded-circle bg-white text-success d-inline-flex align-items-center justify-content-center mb-2">
                📊
              </div>
              <h6 className="fw-bold text-success">Proyección mensual</h6>
              <div className="fs-5 fw-bold text-success" style={{ textShadow: '0 0 1px white' }}>
                {parseFloat(proyeccionMensual).toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{simbolo}
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

      <div className="card shadow-sm border rounded p-4 pt-0 px-0 mb-4">
        <h5 className="mb-3 fw-bold barralarga">GASTOS</h5>
        <div className="row align-items-center ms-3">
          <div className="col-11 col-sm-11 col-md-3 d-flex flex-column gap-4 align-items-center">
            <div className="rounded shadow-sm p-3 text-center bg-info-subtle w-100">
              <div className="icono-circular rounded-circle bg-white text-info d-inline-flex align-items-center justify-content-center mb-2">
                💸
              </div>
              <h6 className="fw-bold text-info">Gastos Actuales</h6>
              <div className="fs-4 fw-bold text-info" style={{ textShadow: '0 0 1px white' }}>
                {parseFloat(gasto).toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{simbolo}
              </div>
            </div>

            <div className={`rounded shadow-sm p-3 text-center w-100 ${bgClass}`}>
              <div className={`icono-circular rounded-circle ${textClass} bg-white d-inline-flex align-items-center justify-content-center mb-2`}>
                {icono}
              </div>
              <h6 className={`fw-bold ${textClass}`}>% Gastos</h6>
              <div className={`fs-4 fw-bold ${textClass}`} style={{ textShadow: '0 0 1px white' }}>
                {porcentaje} %
              </div>
            </div>
          </div>

          <div className="col-md-9">
            <h6 className="text-center mb-3">Gráfico Diario de Gastos</h6>
            <GastosChef
              datos={gastoDatos}
              ancho={800}
              alto={250}
              rol="encargado"
              xAxisProps={{ dataKey: "name", interval: 0 }}
              yAxisProps={{ domain: [0, 100], tickFormatter: v => `${v}%` }}
              tooltipProps={{ formatter: v => `${v}%` }}
              lineProps={{ dataKey: "porcentaje", stroke: "#82ca9d", strokeWidth: 2, dot: { r: 3 } }}
            />
          </div>
        </div>
      </div>



      <div className="card mt-4 shadow-sm border rounded p-4 px-0 pt-0">
        {/* === CAMBIO: PASAR FUNCION PARA ABRIR MODAL EN QuickActionsEncargado === */}
        <QuickActionsEncargado onNuevaVenta={() => setMostrarModal(true)} />
      </div>

      {/* Mensaje de confirmación */}
      {mensaje && (
        <div className={`alert mt-3 ${mensaje.includes("éxito") ? "alert-success" : "alert-danger"}`}>
          {mensaje}
        </div>
      )}

      {/* === RENDERIZAR MODAL SOLO SI mostrarModal ES TRUE === */}
      {mostrarModal && (
        <VentaModal
          onSave={guardarVenta} // FUNCION QUE GUARDA Y CIERRA MODAL
          onClose={() => setMostrarModal(false)} // CERRAR MODAL
        />
      )}
    </div>

  );
};
