import React, { useEffect, useMemo, useState } from "react";
import useGlobalReducer from "../../hooks/useGlobalReducer";
import ventaServices from "../../services/ventaServices";
import { MonedaSimbolo } from "../../services/MonedaSimbolo";
import VentaModal from "./VentaModal";
import { useNavigate } from "react-router-dom";
// Estilos ya incluidos en brand-unified.css

export const EncargadoVentas = () => {
  const simbolo = MonedaSimbolo();
  const { store } = useGlobalReducer();
  const user = store.user;
  const navigate = useNavigate();

  const hoy = new Date();
  const [mesSeleccionado, setMesSeleccionado] = useState(hoy.getMonth() + 1);
  const [anoSeleccionado, setAnoSeleccionado] = useState(hoy.getFullYear());

  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState("");
  const [mostrarModal, setMostrarModal] = useState(false);
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null);
  // inicializamos como string vacío para evitar warning en input type=number
  const [nuevoMonto, setNuevoMonto] = useState("");

  const cargarVentas = async () => {
    setLoading(true);
    try {
      const data = await ventaServices.getVentasEncargado(mesSeleccionado, anoSeleccionado);
      const filtradas = (data || [])
        .filter((v) => Number(v.restaurante_id) === Number(user?.restaurante_id))
        .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
      setVentas(filtradas);
    } catch (e) {
      setMensaje("Error al cargar ventas");
      setTimeout(() => setMensaje(""), 3000);
      setVentas([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarVentas();
    const el = document.getElementsByClassName("custom-sidebar")[0];
    if (el) el.scrollTo(0, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mesSeleccionado, anoSeleccionado]);

  const total = useMemo(
    () => ventas.reduce((acc, v) => acc + (parseFloat(v.monto) || 0), 0),
    [ventas]
  );
  const diasUnicos = useMemo(() => [...new Set(ventas.map((v) => v.fecha))], [ventas]);
  const promedio = diasUnicos.length ? total / diasUnicos.length : 0;

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

  const guardarVenta = async (form) => {
    try {
      await ventaServices.registrarVenta({ ...form, restaurante_id: user.restaurante_id });
      setMensaje("Venta registrada con éxito");
      setTimeout(() => setMensaje(""), 2000);
      setMostrarModal(false);
      cargarVentas();
    } catch (error) {
      // devolvemos error para que el modal lo maneje si quiere
      throw error;
    }
  };

  const nombreMes = useMemo(() => {
    const date = new Date(anoSeleccionado, mesSeleccionado - 1);
    return date.toLocaleString("es", { month: "long", year: "numeric" });
  }, [anoSeleccionado, mesSeleccionado]);

  return (
    <div className="min-vh-100" style={{ background: "var(--color-bg)" }}>
      {/* Header simplificado */}
      <div
        className="sticky-top"
        style={{ background: "var(--color-bg)", borderBottom: "1px solid var(--color-border)", zIndex: 10 }}
      >
        <div className="container-fluid px-4 py-3">
          <div className="d-flex align-items-center justify-content-between">
            <div>
              <h1 className="h4 fw-bold mb-0" style={{ color: "var(--color-text)" }}>
                💰 Ventas
              </h1>
              <p className="text-muted mb-0 small">Gestiona las ventas registradas</p>
            </div>

            <button
              className="btn d-flex align-items-center gap-2 px-4 py-2"
              style={{ 
                background: 'linear-gradient(135deg, var(--color-primary), color-mix(in srgb, var(--color-primary) 85%, var(--brand-600)))',
                border: 'none',
                borderRadius: '12px',
                color: 'white',
                fontWeight: '600',
                fontSize: '0.9rem',
                boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 4px 16px rgba(59, 130, 246, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 2px 8px rgba(59, 130, 246, 0.3)';
              }}
              onClick={() => setMostrarModal(true)}
            >
              ✨ Nueva Venta
            </button>
          </div>
        </div>
      </div>

      <div className="container-fluid px-4 py-4">
        {mensaje && (
          <div
            className={`alert alert-dismissible fade show ${/éxito|eliminad/i.test(mensaje) ? "alert-success" : "alert-danger"
              }`}
            role="alert"
            style={{ borderRadius: "12px" }}
          >
            {mensaje}
          </div>
        )}

        {/* ===== Filtro de mes centrado ===== */}
        <div className="d-flex align-items-center justify-content-center mb-4">
          <button
            className="btn d-flex align-items-center justify-content-center"
            style={{ 
              width: '44px', 
              height: '44px', 
              borderRadius: '12px',
              background: 'var(--color-bg-card)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text)',
              transition: 'all 0.2s ease',
              fontSize: '1.1rem'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'var(--color-bg-subtle)';
              e.target.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'var(--color-bg-card)';
              e.target.style.transform = 'translateY(0)';
            }}
            onClick={() => {
              const newMonth = mesSeleccionado === 1 ? 12 : mesSeleccionado - 1;
              const newYear = mesSeleccionado === 1 ? anoSeleccionado - 1 : anoSeleccionado;
              setMesSeleccionado(newMonth);
              setAnoSeleccionado(newYear);
            }}
          >
            ◀
          </button>
          <div 
            className="mx-4 px-5 py-3 fw-medium text-center" 
            style={{ 
              background: 'linear-gradient(135deg, var(--color-bg-card), var(--color-bg-subtle))', 
              border: '1px solid var(--color-border)', 
              borderRadius: '16px',
              minWidth: '220px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
              fontSize: '1.1rem',
              color: 'var(--color-text)',
              position: 'relative'
            }}
          >
            📅 {nombreMes}
          </div>
          <button
            className="btn d-flex align-items-center justify-content-center"
            style={{ 
              width: '44px', 
              height: '44px', 
              borderRadius: '12px',
              background: 'var(--color-bg-card)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text)',
              transition: 'all 0.2s ease',
              fontSize: '1.1rem'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'var(--color-bg-subtle)';
              e.target.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'var(--color-bg-card)';
              e.target.style.transform = 'translateY(0)';
            }}
            onClick={() => {
              const newMonth = mesSeleccionado === 12 ? 1 : mesSeleccionado + 1;
              const newYear = mesSeleccionado === 12 ? anoSeleccionado + 1 : anoSeleccionado;
              setMesSeleccionado(newMonth);
              setAnoSeleccionado(newYear);
            }}
          >
            ▶
          </button>
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
            <div style={{ fontSize: '3rem', opacity: 0.4 }}>💰</div>
            <h5 className="text-muted mb-3">No hay ventas registradas para este período</h5>
            <button className="btn btn-primary" onClick={() => setMostrarModal(true)}>
              + Registrar primera venta
            </button>
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
      </div>

      {/* FAB móvil */}
      <button
        className="fab d-sm-none"
        onClick={() => setMostrarModal(true)}
        title="Nueva venta"
      >
        ➕
      </button>

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

      {mostrarModal && <VentaModal onSave={guardarVenta} onClose={() => setMostrarModal(false)} />}
    </div>
  );
};

export default EncargadoVentas;
