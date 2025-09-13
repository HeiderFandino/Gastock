import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../../hooks/useGlobalReducer";
import ventaServices from "../../services/ventaServices";
import restauranteService from "../../services/restauranteServices";
import { MonedaSimbolo } from "../../services/MonedaSimbolo";
import "../../styles/EncargadoDashboard.css";
import "../../styles/AdminGastos.css";

export const AdminVentasDetalle = () => {
  const simbolo = MonedaSimbolo();
  const navigate = useNavigate();
  const { store } = useGlobalReducer();
  const user = store.user;

  const query = new URLSearchParams(window.location.search);
  const restaurante_id = query.get("restaurante_id");
  const mesFromUrl = query.get("mes");
  const anoFromUrl = query.get("ano");

  if (!restaurante_id) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ background: "var(--color-bg)" }}>
        <div className="text-center">
          <h4 className="text-danger mb-3">⚠️ Error de Parámetros</h4>
          <p className="text-muted">No se ha especificado el ID del restaurante en la URL.</p>
          <button className="btn btn-gastock" onClick={() => navigate('/admin/dashboard')}>Ir al Dashboard</button>
        </div>
      </div>
    );
  }

  const hoy = new Date();
  const mesInicial = mesFromUrl ? Number(mesFromUrl) : hoy.getMonth() + 1;
  const anoInicial = anoFromUrl ? Number(anoFromUrl) : hoy.getFullYear();

  const [mesAno, setMesAno] = useState(`${anoInicial}-${String(mesInicial).padStart(2, "0")}`);
  const [mes, setMes] = useState(mesInicial);
  const [ano, setAno] = useState(anoInicial);

  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nombreRestaurante, setNombreRestaurante] = useState("");

  // Cargar ventas para mes/ano/restaurante
  const cargarVentas = async (m, a, id, signal) => {
    setLoading(true);
    try {
      const data = await ventaServices.getVentasDetalle(m, a, id);
      if (signal && signal.aborted) return;
      const filtradas = (data || []).sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
      setVentas(filtradas);
    } catch (error) {
      console.error("Error cargando ventas:", error);
      setMensaje("Error al cargar ventas");
      setTimeout(() => setMensaje(""), 3000);
      setVentas([]);
    } finally {
      setLoading(false);
    }
  };

  const cargarNombreRestaurante = async (id) => {
    try {
      const data = await restauranteService.getRestaurante(id);
      setNombreRestaurante(data?.nombre || "");
    } catch (error) {
      console.log("Error al obtener restaurante:", error);
      setNombreRestaurante("");
    }
  };

  // Cuando cambia el input month (value "YYYY-MM") actualizar mes y año.
  useEffect(() => {
    const [y, m] = mesAno.split("-").map(Number);
    // CORRECCIÓN: y -> año, m -> mes
    if (!Number.isNaN(y) && !Number.isNaN(m)) {
      setAno(y);
      setMes(m);
    }
  }, [mesAno]);

  // Cargar datos cuando mes o año cambian. Incluimos restaurante_id en deps.
  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    cargarVentas(mes, ano, restaurante_id, signal);
    cargarNombreRestaurante(restaurante_id);

    const el = document.getElementsByClassName("custom-sidebar")?.[0];
    if (el) el.scrollTo(0, 0);

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mes, ano, restaurante_id]);

  const total = ventas.reduce((acc, v) => acc + (Number(v.monto) || 0), 0);
  const diasUnicos = [...new Set(ventas.map((v) => v.fecha))];
  const promedio = diasUnicos.length > 0 ? total / diasUnicos.length : 0;

  const retrocederMes = () => {
    const newMonth = mes === 1 ? 12 : mes - 1;
    const newYear = mes === 1 ? ano - 1 : ano;
    setMes(newMonth);
    setAno(newYear);
    setMesAno(`${newYear}-${String(newMonth).padStart(2, "0")}`);
  };

  const avanzarMes = () => {
    const newMonth = mes === 12 ? 1 : mes + 1;
    const newYear = mes === 12 ? ano + 1 : ano;
    setMes(newMonth);
    setAno(newYear);
    setMesAno(`${newYear}-${String(newMonth).padStart(2, "0")}`);
  };

  const nombreMes = new Date(ano, mes - 1).toLocaleDateString("es-ES", {
    month: "long",
    year: "numeric",
  });


  return (
    <div className="dashboard-container admin-bb">
      {/* ===== Header compacto v2 ===== */}
      <div className="ag-header mb-3">

        <div className="ag-title-wrap">
          <div className="d-flex align-items-center gap-3">
            <button
              className="btn d-flex align-items-center justify-content-center"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'var(--color-bg-card)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text)',
                transition: 'all 0.2s ease',
                fontSize: '14px'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'var(--color-bg-subtle)';
                e.target.style.transform = 'translateX(-2px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'var(--color-bg-card)';
                e.target.style.transform = 'translateX(0)';
              }}
              onClick={() => navigate(`/admin/restaurante/${restaurante_id}?mes=${mes}&ano=${ano}`)}
              title="Volver al restaurante"
            >
              ←
            </button>
            <div>
              <h1 className="ag-title">💰 Detalle de Ventas {nombreRestaurante ? `— ${nombreRestaurante}` : ""}</h1>
              <p className="ag-subtitle">Consulta las ventas registradas por período del restaurante.</p>
            </div>
          </div>
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
              value={mesAno}
              onChange={(e) => setMesAno(e.target.value)}
              aria-label="Seleccionar mes"
            />
          </div>

          <button className="ag-monthbtn" onClick={avanzarMes} aria-label="Mes siguiente">→</button>
        </div>
      </div>


      {loading ? (
        <div className="text-center py-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-3 text-muted">Cargando ventas...</p>
        </div>
      ) : ventas.length === 0 ? (
        <div className="text-center py-5">
          <div style={{ fontSize: "3rem", opacity: 0.4 }}>💰</div>
          <h5 className="text-muted mb-3">No hay ventas registradas para este período</h5>
        </div>
      ) : (
        <>
          {/* ===== Lista mobile (cards) ===== */}
          <ul className="list-unstyled d-sm-none">
            {ventas.map((v) => {
              const f = new Date(v.fecha);
              const fechaFormateada = f.toLocaleDateString("es-ES");

              return (
                <li key={v.id} className="ag-card p-3 mb-2">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div className="flex-grow-1">
                      <div className="fw-bold" style={{ fontSize: "1.05rem" }}>{fechaFormateada}</div>
                      <div className="text-muted" style={{ fontSize: ".9rem" }}>
                        {v.turno ? (
                          <span className="badge bg-secondary me-2">{v.turno}</span>
                        ) : (
                          <span className="text-muted">Sin turno especificado</span>
                        )}
                      </div>
                    </div>
                    <div className="text-end">
                      <div className="fw-bold text-success" style={{ fontSize: "1.1rem" }}>
                        {simbolo}{Number(v.monto || 0).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          {/* ===== Tabla desktop ===== */}
          <div className="table-responsive d-none d-sm-block">
            <table className="table users-table mt-2 mb-0">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Monto ({simbolo})</th>
                  <th>Turno</th>
                </tr>
              </thead>
              <tbody>
                {ventas.map((v) => {
                  const f = new Date(v.fecha);
                  const fechaFormateada = f.toLocaleDateString("es-ES");

                  return (
                    <tr key={v.id}>
                      <td>{fechaFormateada}</td>
                      <td className="fw-bold text-success">{simbolo}{Number(v.monto || 0).toFixed(2)}</td>
                      <td>
                        {v.turno ? (
                          <span className="badge bg-secondary">{v.turno}</span>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

    </div>
  );
};

export default AdminVentasDetalle;
