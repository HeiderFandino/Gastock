import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../../hooks/useGlobalReducer";
import ventaServices from "../../services/ventaServices";
import restauranteService from "../../services/restauranteServices";
import { MonedaSimbolo } from "../../services/MonedaSimbolo";
import { FiEdit2, FiTrash2, FiChevronLeft, FiChevronRight } from "react-icons/fi";
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
          <button className="btn btn-gastock" onClick={() => navigate('/admin/dashboard')}>Volver al Dashboard</button>
        </div>
      </div>
    );
  }

  const hoy = new Date();
  const mesInicial = mesFromUrl ? Number(mesFromUrl) : hoy.getMonth() + 1;
  const anoInicial = anoFromUrl ? Number(anoFromUrl) : hoy.getFullYear();
  
  const [mesAno, setMesAno] = useState(
    `${anoInicial}-${String(mesInicial).padStart(2, "0")}`
  );
  const [mes, setMes] = useState(mesInicial);
  const [ano, setAno] = useState(anoInicial);

  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null);
  const [nuevoMonto, setNuevoMonto] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [nombreRestaurante, setNombreRestaurante] = useState("");

  const cargarVentas = async () => {
    setLoading(true);
    try {
      const data = await ventaServices.getVentasDetalle(mes, ano, restaurante_id);
      const filtradas = (data || [])
        .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
      setVentas(filtradas);
    } catch (error) {
      setMensaje("Error al cargar ventas");
      setTimeout(() => setMensaje(""), 3000);
      setVentas([]);
    } finally {
      setLoading(false);
    }
  };

  const cargarNombreRestaurante = async () => {
    try {
      const data = await restauranteService.getRestaurante(restaurante_id);
      setNombreRestaurante(data.nombre || "");
    } catch (error) {
      console.log("Error al obtener restaurante:", error);
    }
  };

  useEffect(() => {
    const [y, m] = mesAno.split("-").map(Number);
    setMes(m);
    setAno(y);
  }, [mesAno]);

  useEffect(() => {
    cargarVentas();
    cargarNombreRestaurante();
    const el = document.getElementsByClassName("custom-sidebar")?.[0];
    if (el) el.scrollTo(0, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mes, ano]);

  const total = ventas.reduce((acc, v) => acc + parseFloat(v.monto), 0);
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
    year: "numeric"
  });

  const abrirModalEdicion = (venta) => {
    setVentaSeleccionada(venta);
    setNuevoMonto(venta.monto || "");
  };

  const guardarEdicion = async () => {
    try {
      await ventaServices.editarVenta(ventaSeleccionada.id, { monto: parseFloat(nuevoMonto) });
      setMensaje("✅ Venta actualizada con éxito");
      setTimeout(() => setMensaje(""), 3000);
      setVentaSeleccionada(null);
      cargarVentas();
    } catch {
      setMensaje("⚠️ Error al actualizar venta");
      setTimeout(() => setMensaje(""), 3000);
    }
  };

  const eliminarVenta = async (id) => {
    if (!window.confirm("¿Eliminar esta venta?")) return;
    try {
      await ventaServices.eliminarVenta(id);
      setMensaje("Venta eliminada correctamente");
      setTimeout(() => setMensaje(""), 2000);
      cargarVentas();
    } catch {
      setMensaje("Error al eliminar venta");
      setTimeout(() => setMensaje(""), 2000);
    }
  };

  return (
    <div className="dashboard-container admin-bb">
      {/* ===== Header compacto v2 ===== */}
      <div className="ag-header mb-3">
        <div className="ag-header-top">
          <div className="ag-brand-dot" />
          <button
            className="btn-gastock-outline btn-sm d-flex align-items-center gap-2 ms-auto"
            onClick={() => navigate(`/admin/restaurant-detail/${restaurante_id}?mes=${mes}&ano=${ano}`)}
            style={{ padding: '8px 12px' }}
          >
            ← Volver al Restaurante
          </button>
        </div>

        <div className="ag-title-wrap">
          <h1 className="ag-title">💰 Detalle de Ventas {nombreRestaurante ? `— ${nombreRestaurante}` : ""}</h1>
          <p className="ag-subtitle">Consulta las ventas registradas por período del restaurante.</p>
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

      {mensaje && (
        <div
          className={`alert alert-dismissible fade show mb-4 ${mensaje.includes("éxito") || mensaje.includes("eliminad") ? "alert-success" : "alert-danger"}`}
          role="alert"
          style={{ borderRadius: "12px" }}
        >
          {mensaje}
        </div>
      )}

        {loading ? (
          <div className="text-center py-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
            <p className="mt-3 text-muted">Cargando ventas...</p>
          </div>
        ) : ventas.length === 0 ? (
          <div className="text-center py-5">
            <div style={{ fontSize: '3rem', opacity: 0.4 }}>💰</div>
            <h5 className="text-muted mb-3">No hay ventas registradas para este período</h5>
          </div>
        ) : (
          <>


            {/* ===== Lista mobile (cards) ===== */}
            <ul className="list-unstyled d-sm-none">
              {ventas.map((v) => {
                const f = new Date(v.fecha);
                const dd = String(f.getDate()).padStart(2, "0");
                const mm = String(f.getMonth() + 1).padStart(2, "0");
                const yyyy = f.getFullYear();
                const fechaFormateada = `${dd}-${mm}-${yyyy}`;

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
                          {simbolo}{parseFloat(v.monto).toFixed(2)}
                        </div>
                      </div>
                    </div>
                    <div className="d-flex gap-2 justify-content-end">
                      <button
                        className="action-icon-button edit-button"
                        onClick={() => abrirModalEdicion(v)}
                        title="Editar"
                      >
                        ✏️
                      </button>
                      <button
                        className="action-icon-button delete-button"
                        onClick={() => eliminarVenta(v.id)}
                        title="Eliminar"
                      >
                        🗑️
                      </button>
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
                    <th className="text-end">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {ventas.map((v) => {
                    const f = new Date(v.fecha);
                    const dd = String(f.getDate()).padStart(2, "0");
                    const mm = String(f.getMonth() + 1).padStart(2, "0");
                    const yyyy = f.getFullYear();
                    const fechaFormateada = `${dd}-${mm}-${yyyy}`;

                    return (
                      <tr key={v.id}>
                        <td>{fechaFormateada}</td>
                        <td className="fw-bold text-success">{simbolo}{parseFloat(v.monto).toFixed(2)}</td>
                        <td>
                          {v.turno ? (
                            <span className="badge bg-secondary">{v.turno}</span>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                        <td className="text-end">
                          <button
                            className="action-icon-button edit-button me-2"
                            onClick={() => abrirModalEdicion(v)}
                            title="Editar"
                          >
                            ✏️
                          </button>
                          <button
                            className="action-icon-button delete-button"
                            onClick={() => eliminarVenta(v.id)}
                            title="Eliminar"
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Modal edición */}
        {ventaSeleccionada && (
          <div className="modal fade show brand-modal" style={{ display: 'block' }} tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered modal-sm">
              <div className="modal-content">
                <div className="modal-header">
                  <div className="modal-icon">✏️</div>
                  <h5 className="modal-title">Editar Venta</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setVentaSeleccionada(null)}
                    aria-label="Close"
                  ></button>
                </div>
                <div className="modal-body">
                  <label className="form-label">💰 Monto ({simbolo})</label>
                  <input
                    type="number"
                    className="form-control"
                    value={nuevoMonto}
                    onChange={(e) => setNuevoMonto(e.target.value)}
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                  />
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="modal-btn-secondary"
                    onClick={() => setVentaSeleccionada(null)}
                  >
                    ❌ Cancelar
                  </button>
                  <button
                    type="button"
                    className="modal-btn-primary"
                    onClick={guardarEdicion}
                  >
                    💾 Guardar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
