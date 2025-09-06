import React, { useEffect, useMemo, useState } from "react";
import useGlobalReducer from "../../hooks/useGlobalReducer";
import ventaServices from "../../services/ventaServices";
import { MonedaSimbolo } from "../../services/MonedaSimbolo";
import VentaModal from "./VentaModal";
import "../../styles/Encargado.css";

export const EncargadoVentas = () => {
  const simbolo = MonedaSimbolo();
  const { store } = useGlobalReducer();
  const user = store.user;

  const hoy = new Date();
  const [mesSeleccionado, setMesSeleccionado] = useState(hoy.getMonth() + 1);
  const [anoSeleccionado, setAnoSeleccionado] = useState(hoy.getFullYear());

  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState("");
  const [mostrarModal, setMostrarModal] = useState(false);
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null);
  const [nuevoMonto, setNuevoMonto] = useState("");

  const cargarVentas = async () => {
    try {
      const data = await ventaServices.getVentasEncargado(mesSeleccionado, anoSeleccionado);
      const filtradas = data
        .filter(v => Number(v.restaurante_id) === Number(user?.restaurante_id))
        .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
      setVentas(filtradas);
    } catch (e) {
      setMensaje("Error al cargar ventas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarVentas();
    const el = document.getElementsByClassName("custom-sidebar")[0];
    if (el) el.scrollTo(0, 0);
  }, [mesSeleccionado, anoSeleccionado]);

  const total = useMemo(
    () => ventas.reduce((acc, v) => acc + parseFloat(v.monto), 0),
    [ventas]
  );
  const diasUnicos = useMemo(() => [...new Set(ventas.map(v => v.fecha))], [ventas]);
  const promedio = diasUnicos.length ? total / diasUnicos.length : 0;

  const abrirModalEdicion = (venta) => {
    setVentaSeleccionada(venta);
    setNuevoMonto(venta.monto);
    const modal = new bootstrap.Modal(document.getElementById("editarModal"));
    modal.show();
  };

  const guardarEdicion = async () => {
    try {
      await ventaServices.editarVenta(ventaSeleccionada.id, { monto: parseFloat(nuevoMonto) });
      setMensaje("Venta actualizada con éxito");
      setTimeout(() => setMensaje(""), 2000);
      const modal = bootstrap.Modal.getInstance(document.getElementById("editarModal"));
      modal.hide();
      setVentaSeleccionada(null);
      cargarVentas();
    } catch {
      setMensaje("Error al actualizar venta");
      setTimeout(() => setMensaje(""), 2000);
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

  const guardarVenta = async (form) => {
    try {
      await ventaServices.registrarVenta({ ...form, restaurante_id: user.restaurante_id });
      setMensaje("Venta registrada con éxito");
      setTimeout(() => setMensaje(""), 2000);
      setMostrarModal(false);
      cargarVentas();
    } catch (error) {
      throw error;
    }
  };

  return (
    <div className="dashboard-container">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="dashboard-title m-0">Ventas del restaurante</h1>
        <button className="btn-gastock" onClick={() => setMostrarModal(true)}>
          <i className="bi bi-plus-circle me-2"></i> Registrar nueva venta
        </button>
      </div>

      {mensaje && (
        <div className={`alert mt-2 ${/éxito|eliminad/i.test(mensaje) ? "alert-success" : "alert-danger"}`}>
          {mensaje}
        </div>
      )}

      <div className="ev-sticky">
        <div className="ev-toolbar d-md-none">
          <input
            type="month"
            className="form-control ev-month"
            value={`${anoSeleccionado}-${String(mesSeleccionado).padStart(2, "0")}`}
            onChange={(e) => {
              const [a, m] = e.target.value.split("-");
              setAnoSeleccionado(parseInt(a));
              setMesSeleccionado(parseInt(m));
            }}
            aria-label="Seleccionar mes"
          />
        </div>
        <div className="d-none d-md-flex align-items-center gap-2">
          <label className="fw-semibold">Mes:</label>
          <input
            type="month"
            className="form-control w-auto"
            value={`${anoSeleccionado}-${String(mesSeleccionado).padStart(2, "0")}`}
            onChange={(e) => {
              const [a, m] = e.target.value.split("-");
              setAnoSeleccionado(parseInt(a));
              setMesSeleccionado(parseInt(m));
            }}
          />
        </div>
      </div>
      <div className="ev-toolbar-spacer d-md-none" />

      <div className="d-none d-md-block rounded shadow-sm p-2 col-sm-12 col-md-7 col-lg-6 col-xl-4 col-xxl-3 text-center bg-info-subtle d-flex flex-direction-row mt-4">
        <div className="d-flex flex-column text-start">
          <h6 className="fw-bold text-info strong">
            Promedio diario: <span className="fw-bold">{simbolo}{promedio.toFixed(2)}</span>
          </h6>
          <div className="fs-5 text-info strong">
            Total: <span className="fw-bold">{simbolo}{total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="ev-kpis d-md-none">
        <div className="ev-chip">
          <div className="ev-chip-title text-info">Promedio diario</div>
          <div className="ev-chip-value text-info">
            {promedio.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{simbolo}
          </div>
        </div>
        <div className="ev-chip">
          <div className="ev-chip-title text-warning">Total del mes</div>
          <div className="ev-chip-value text-warning">
            {total.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{simbolo}
          </div>
        </div>
      </div>

      {/* Desktop */}
      <div className="d-none d-md-block">
        {loading ? (
          <p>Cargando...</p>
        ) : ventas.length === 0 ? (
          <p>No hay ventas registradas.</p>
        ) : (
          <div className="table-responsive">
            <table className="table users-table mt-3 ps-0">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Monto ({simbolo})</th>
                  <th>Turno</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {ventas.map((v) => (
                  <tr key={v.id}>
                    <td>{v.fecha}</td>
                    <td>{v.monto}</td>
                    <td>{v.turno || "-"}</td>
                    <td>
                      <button className="action-icon-button edit-button" onClick={() => abrirModalEdicion(v)} title="Editar venta">✏️</button>
                      <button className="action-icon-button delete-button" onClick={() => eliminarVenta(v.id)} title="Eliminar venta">🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Móvil */}
      <div className="d-md-none">
        {loading ? (
          <p className="px-2">Cargando...</p>
        ) : ventas.length === 0 ? (
          <p className="px-2">No hay ventas registradas.</p>
        ) : (
          <ul className="ev-list">
            {ventas.map((v) => (
              <li className="ev-item" key={v.id}>
                <div className="ev-item-main">
                  <div className="ev-item-date">{v.fecha}</div>
                  <div className="ev-item-amount">
                    {parseFloat(v.monto).toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{simbolo}
                  </div>
                </div>
                <div className="ev-item-sub">
                  <span className="ev-turno">{v.turno || "—"}</span>
                  <div className="ev-actions">
                    <button className="ev-icon-btn" aria-label="Editar" onClick={() => abrirModalEdicion(v)}>
                      <i className="bi bi-pencil"></i>
                    </button>
                    <button className="ev-icon-btn ev-danger" aria-label="Eliminar" onClick={() => eliminarVenta(v.id)}>
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* FAB móvil */}
      <button className="btn-fab d-md-none" onClick={() => setMostrarModal(true)} aria-label="Registrar venta">
        <i className="bi bi-plus-lg"></i>
      </button>

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
              <input type="number" className="form-control" value={nuevoMonto} onChange={(e) => setNuevoMonto(e.target.value)} />
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
              <button type="button" className="btn btn-primary" onClick={guardarEdicion}>Guardar cambios</button>
            </div>
          </div>
        </div>
      </div>

      {mostrarModal && (
        <VentaModal onSave={guardarVenta} onClose={() => setMostrarModal(false)} />
      )}
    </div>
  );
};
