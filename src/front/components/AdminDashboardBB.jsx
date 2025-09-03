import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import adminService from "../services/adminService";
import "../styles/AdminDashboardBB.css";
import { QuickActionsAdmin } from "../components/QuickActionsAdmin";
import { MonedaSimbolo } from "../services/MonedaSimbolo"; // símbolo dinámico (EUR/USD/GBP)


const AdminDashboardBB = () => {
  const navigate = useNavigate();
  const simbolo = MonedaSimbolo();

  const [resumenes, setResumenes] = useState([]);
  const [ultimaVentaPorRest, setUltimaVentaPorRest] = useState({});
  const [cargando, setCargando] = useState(false);

  // Control de mes/año (selector + flechas)
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
        // 1) Resumen por restaurante del mes seleccionado
        const data = await adminService.getResumenGeneral(mes, ano);
        const lista = Array.isArray(data) ? data : [];
        setResumenes(lista);

        // 2) Para cada restaurante, obtener ventas diarias y tomar la fecha más reciente
        const packs = await Promise.all(
          lista.map((r) =>
            adminService.getVentasDiarias(r.restaurante_id, mes, ano).then((ventas) => ({
              restaurante_id: r.restaurante_id,
              lastDate: getUltimaFecha(ventas),
            }))
          )
        );
        const mapa = {};
        packs.forEach(({ restaurante_id, lastDate }) => (mapa[restaurante_id] = lastDate));
        setUltimaVentaPorRest(mapa);
      } catch (e) {
        console.error("Error cargando la vista admin:", e);
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, [mes, ano]);

  const getColorClasses = (porcentaje) => {
    // Colores sutiles (sin headers ni outlines especiales)
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

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-welcome text-center mb-3">Vista General</h1>

      {/* Selector de mes */}
      <div className="selector-mes d-flex align-items-center justify-content-center gap-2 mb-4 mx-auto">
        <label className="fw-bold mb-0">Fecha:</label>
        <button className="btn btn-sm btn-naranja" aria-label="Mes anterior" onClick={retrocederMes}>←</button>
        <input
          type="month"
          className="form-control text-center selector-mes__input"
          value={fechaSeleccionada}
          onChange={(e) => setFechaSeleccionada(e.target.value)}
        />
        <button className="btn btn-sm btn-naranja" aria-label="Mes siguiente" onClick={avanzarMes}>→</button>
      </div>

      {/* Un solo contenedor que agrupa todo */}
      <div className="card shadow-sm border rounded-4 p-3 p-md-4 mb-4">
        {cargando && <div className="w-100 text-center py-3">Cargando…</div>}

        {/* Bloques visuales por restaurante, simulando cards separadas */}
        <div className="rest-list">
          {[...resumenes]
            .sort((a, b) => b.venta_total - a.venta_total)
            .map((r) => {
              const [bgClass, textClass, icono] = getColorClasses(r.porcentaje_gasto);
              const lastDate = ultimaVentaPorRest[r.restaurante_id] || null;

              return (
                <div key={r.restaurante_id} className="rest-block">
                  <h4 className="text-center fw-bold rest-block__title mb-1">
                    <span title={r.nombre}>{r.nombre}</span>
                  </h4>

                  {/* mini leyenda */}
                  <p className="text-center text-muted mb-3 rest-block__legend">
                    Últ. venta: {formateaFechaCorta(lastDate)}
                  </p>

                  <div className="d-flex flex-column flex-sm-row gap-2 gap-md-3 justify-content-between text-center">
                    {/* Ventas */}
                    <div className="rest-stat bg-info-subtle">
                      <div className="icono-circular">💰</div>
                      <p className="fw-bold text-info mb-1 small">Ventas</p>
                      <p className="fw-bold mb-0 rest-stat__value">
                        {r.venta_total.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {simbolo}
                      </p>
                    </div>

                    {/* % Gasto */}
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
                      className="btn btn-sm enlacevertodo"
                      onClick={() => navigate(`/admin/restaurante/${r.restaurante_id}?mes=${mes}&ano=${ano}`)}
                    >
                      Ver todo
                    </button>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Acciones rápidas */}
      <div className="card mt-4 shadow-sm border rounded p-4 px-0 pt-0">
        <QuickActionsAdmin />
      </div>
    </div>
  );
};


// Helpers
function getUltimaFecha(ventas = []) {
  if (!Array.isArray(ventas) || ventas.length === 0) return null;
  const fechas = ventas.map((v) => (v.fecha ? new Date(v.fecha) : null)).filter(Boolean);
  if (fechas.length === 0) return null;
  return new Date(Math.max(...fechas.map((d) => d.getTime())));
}

export default AdminDashboardBB;
