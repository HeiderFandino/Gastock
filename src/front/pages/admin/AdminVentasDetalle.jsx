import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../../hooks/useGlobalReducer";
import ventaServices from "../../services/ventaServices";
import restauranteService from "../../services/restauranteServices";
import { MonedaSimbolo } from "../../services/MonedaSimbolo";

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
      <div className="mb-2">
        <button className="btn btn-outline-secondary btn-sm" onClick={() => navigate("/admin/dashboard")}>
          ← Volver
        </button>
      </div>

      <h1 className="dashboard-title mb-3">
        Ventas {nombreRestaurante ? `${nombreRestaurante}` : ""}
      </h1>

      {mensaje && (
        <div className={`alert mt-2 ${mensaje.includes("éxito") || mensaje.includes("eliminada") ? "alert-success" : "alert-danger"}`}>
          {mensaje}
        </div>
      )}

      <div className="d-flex align-items-center gap-3 mb-3 flex-wrap">
        <div className="d-flex align-items-center gap-2">
          <label>Seleccionar mes:</label>
          <input
            type="month"
            className="form-control w-auto"
            value={`${anoSeleccionado}-${String(mesSeleccionado).padStart(2, "0")}`}
            onChange={(e) => {
              const [yy, mm] = e.target.value.split("-");
              setAnoSeleccionado(parseInt(yy));
              setMesSeleccionado(parseInt(mm));
            }}
          />
        </div>

        <div className="d-flex align-items-center gap-2">
          <label>Filtrar por fecha:</label>
          <input
            type="date"
            className="form-control w-auto"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
          <button className="btn btn-success" onClick={() => setSelectedDate("")}>
            Ver todo el mes
          </button>
        </div>
      </div>

      {loading ? (
        <p>Cargando...</p>
      ) : ventas.length === 0 ? (
        <p>No hay ventas registradas este mes.</p>
      ) : (
        <>
          <div className="rounded shadow-sm p-2 col-sm-12 col-md-7 col-lg-6 col-xl-4 col-xxl-3 text-center bg-info-subtle d-flex flex-direction-row">
            <div className="icono-circular ms-2 me-4 rounded-circle bg-white text-info mt-1">📈</div>
            <div className="d-flex flex-column text-start">
              <h6 className="fw-bold text-info">Promedio diario: <span className="fw-bold">€{promedio.toFixed(2)}</span></h6>
              <div className="fs-5 text-info">Total: <span className="fw-bold">€{total.toFixed(2)}</span></div>
            </div>
          </div>

          <div className="table-responsive mt-4">
            <table className="table table-striped users-table">
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
                    <td>
                      {(() => {
                        const f = new Date(v.fecha);
                        const dd = String(f.getDate()).padStart(2, "0");
                        const mm = String(f.getMonth() + 1).padStart(2, "0");
                        const yyyy = f.getFullYear();
                        return `${dd}-${mm}-${yyyy}`;
                      })()}
                    </td>
                    <td>{v.monto}</td>
                    <td>{v.turno || "-"}</td>
                    <td>
                      <button
  className="action-icon-button edit-button"
  onClick={() => abrirModalEdicion(v)}
  title="Editar"
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="feather feather-edit-2"
  >
    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
  </svg>
</button>
                      <button className="action-icon-button delete-button" onClick={() => eliminarVenta(v.id)} title="Eliminar">
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
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
