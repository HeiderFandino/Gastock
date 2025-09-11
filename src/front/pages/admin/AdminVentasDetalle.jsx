import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../../hooks/useGlobalReducer";
import ventaServices from "../../services/ventaServices";
import restauranteService from "../../services/restauranteServices";
import { MonedaSimbolo } from "../../services/MonedaSimbolo";
import { FiEdit2, FiTrash2 } from "react-icons/fi";

import "../../styles/AdminGastos.css";

export const AdminVentasDetalle = () => {
  const simbolo = MonedaSimbolo();
  const navigate = useNavigate();
  const { store } = useGlobalReducer();
  const user = store.user;

  const query = new URLSearchParams(window.location.search);
  const restaurante_id = query.get("restaurante_id") || user?.restaurante_id;

  const fechaActual = new Date();
  const [mesSeleccionado, setMesSeleccionado] = useState(fechaActual.getMonth() + 1);
  const [anoSeleccionado, setAnoSeleccionado] = useState(fechaActual.getFullYear());

  const [selectedDate, setSelectedDate] = useState("");
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null);
  const [nuevoMonto, setNuevoMonto] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [nombreRestaurante, setNombreRestaurante] = useState("");

  const cargarVentas = async () => {
    try {
      const data = await ventaServices.getVentasDetalle(mesSeleccionado, anoSeleccionado, restaurante_id);
      let filtradas = selectedDate
        ? data.filter((v) => {
          const fechaObj = new Date(v.fecha);
          const yyyy = fechaObj.getFullYear();
          const mm = String(fechaObj.getMonth() + 1).padStart(2, "0");
          const dd = String(fechaObj.getDate()).padStart(2, "0");
          const fechaFormateada = `${yyyy}-${mm}-${dd}`;
          return fechaFormateada === selectedDate;
        })
        : data;
      filtradas.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
      setVentas(filtradas);
    } catch (error) {
      setMensaje("Error al cargar ventas");
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
    cargarVentas();
    cargarNombreRestaurante();
    const el = document.getElementsByClassName("custom-sidebar")[0];
    if (el) el.scrollTo(0, 0);
  }, [selectedDate, mesSeleccionado, anoSeleccionado]);

  const total = ventas.reduce((acc, v) => acc + parseFloat(v.monto), 0);
  const diasUnicos = [...new Set(ventas.map((v) => v.fecha))];
  const promedio = diasUnicos.length > 0 ? total / diasUnicos.length : 0;

  const abrirModalEdicion = (venta) => {
    setVentaSeleccionada(venta);
    setNuevoMonto(venta.monto);
    const modal = new bootstrap.Modal(document.getElementById("editarModal"));
    modal.show();
  };

  const guardarEdicion = async () => {
    try {
      await ventaServices.editarVenta(ventaSeleccionada.id, {
        monto: parseFloat(nuevoMonto),
      });
      setMensaje("Venta actualizada con éxito");
      setTimeout(() => setMensaje(""), 2000);
      const modal = bootstrap.Modal.getInstance(document.getElementById("editarModal"));
      modal.hide();
      setVentaSeleccionada(null);
      cargarVentas();
    } catch (error) {
      setMensaje("Error al actualizar venta");
      setTimeout(() => setMensaje(""), 2000);
    }
  };

  const eliminarVenta = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar esta venta?")) return;
    try {
      await ventaServices.eliminarVenta(id);
      setMensaje("Venta eliminada correctamente");
      setTimeout(() => setMensaje(""), 2000);
      cargarVentas();
    } catch (error) {
      setMensaje("Error al eliminar venta");
      setTimeout(() => setMensaje(""), 2000);
    }
  };

  return (
    <div className="dashboard-container">
      {/* ===== Header compacto v2 ===== */}
      <div className="ag-header mb-3">
        <div className="ag-header-top">

          <div className="ag-brand-dot" />
        </div>

        <div className="ag-title-wrap">
          <h1 className="ag-title">
            Ventas {nombreRestaurante ? `- ${nombreRestaurante}` : ""}
          </h1>
          <p className="ag-subtitle">Consulta y gestiona las ventas registradas por fecha.</p>
        </div>
      </div>

      {mensaje && (
        <div className={`alert text-center ${mensaje.includes("éxito") || mensaje.includes("eliminada") ? "alert-success" : "alert-danger"}`} role="alert">
          {mensaje}
        </div>
      )}

      {/* ===== Filtros responsive ===== */}
      <div className="ag-card mb-3">
        <div className="ag-card-header">
          <div className="ag-icon">📅</div>
          <h5 className="mb-0">Filtros de Fecha</h5>
        </div>
        <div className="p-3">
          <div className="row g-2">
            <div className="col-12 col-sm-6">
              <label className="form-label small fw-bold">Seleccionar mes:</label>
              <input
                type="month"
                className="form-control"
                value={`${anoSeleccionado}-${String(mesSeleccionado).padStart(2, "0")}`}
                onChange={(e) => {
                  const [yy, mm] = e.target.value.split("-");
                  setAnoSeleccionado(parseInt(yy));
                  setMesSeleccionado(parseInt(mm));
                }}
              />
            </div>
            <div className="col-12 col-sm-6">
              <label className="form-label small fw-bold">Filtrar por fecha específica:</label>
              <div className="input-group">
                <input
                  type="date"
                  className="form-control"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
                <button className="btn btn-outline-success" onClick={() => setSelectedDate("")}>
                  Todo el mes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-4">
          <div className="ag-icon mx-auto mb-2" style={{ width: 48, height: 48, fontSize: '1.5rem' }}>⏳</div>
          Cargando...
        </div>
      ) : ventas.length === 0 ? (
        <div className="text-center py-4">
          <div className="ag-icon mx-auto mb-2" style={{ width: 48, height: 48, fontSize: '1.5rem' }}>📊</div>
          <p className="text-muted">No hay ventas registradas para este período.</p>
        </div>
      ) : (
        <>
          {/* ===== Resumen KPIs ===== */}
          <div className="ag-card mb-3">
            <div className="ag-card-header">
              <div className="ag-icon">📈</div>
              <h5 className="mb-0">Resumen del Período</h5>
            </div>
            <div className="p-3">
              <div className="row g-3">
                <div className="col-6 col-sm-4">
                  <div className="text-center">
                    <div className="fw-bold text-success" style={{ fontSize: '1.3rem' }}>
                      {simbolo}{total.toFixed(2)}
                    </div>
                    <div className="text-muted small">Total</div>
                  </div>
                </div>
                <div className="col-6 col-sm-4">
                  <div className="text-center">
                    <div className="fw-bold text-info" style={{ fontSize: '1.3rem' }}>
                      {simbolo}{promedio.toFixed(2)}
                    </div>
                    <div className="text-muted small">Promedio diario</div>
                  </div>
                </div>
                <div className="col-12 col-sm-4">
                  <div className="text-center">
                    <div className="fw-bold text-primary" style={{ fontSize: '1.3rem' }}>
                      {ventas.length}
                    </div>
                    <div className="text-muted small">Ventas registradas</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

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
                      aria-label="Editar"
                    >
                      <FiEdit2 size={18} />
                    </button>
                    <button
                      className="action-icon-button delete-button"
                      onClick={() => eliminarVenta(v.id)}
                      title="Eliminar"
                      aria-label="Eliminar"
                    >
                      <FiTrash2 size={18} />
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
                          <FiEdit2 size={18} />
                        </button>
                        <button
                          className="action-icon-button delete-button"
                          onClick={() => eliminarVenta(v.id)}
                          title="Eliminar"
                        >
                          <FiTrash2 size={18} />
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
      <div className="modal fade" id="editarModal" tabIndex="-1" aria-labelledby="editarModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="editarModalLabel">Editar Monto</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
            </div>
            <div className="modal-body">
              <label>Monto ({simbolo})</label>
              <input
                type="number"
                className="form-control"
                value={nuevoMonto}
                onChange={(e) => setNuevoMonto(e.target.value)}
              />
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
              <button type="button" className="btn btn-primary" onClick={guardarEdicion}>Guardar cambios</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
