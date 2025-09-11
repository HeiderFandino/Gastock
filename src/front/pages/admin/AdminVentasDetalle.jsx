import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../../hooks/useGlobalReducer";
import ventaServices from "../../services/ventaServices";
import restauranteService from "../../services/restauranteServices";
import { MonedaSimbolo } from "../../services/MonedaSimbolo";
import { FiEdit2, FiTrash2, FiChevronLeft, FiChevronRight } from "react-icons/fi";

// Estilos ya incluidos en brand-unified.css

export const AdminVentasDetalle = () => {
  const simbolo = MonedaSimbolo();
  const navigate = useNavigate();
  const { store } = useGlobalReducer();
  const user = store.user;

  const query = new URLSearchParams(window.location.search);
  const restaurante_id = query.get("restaurante_id");

  if (!restaurante_id) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ background: "var(--color-bg)" }}>
        <div className="text-center">
          <h4 className="text-danger mb-3">⚠️ Error de Parámetros</h4>
          <p className="text-muted">No se ha especificado el ID del restaurante en la URL.</p>
          <button className="btn btn-gastock" onClick={() => navigate('/admin/ventas')}>Volver a Ventas</button>
        </div>
      </div>
    );
  }

  const hoy = new Date();
  const [mesAno, setMesAno] = useState(
    `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}`
  );
  const [mes, setMes] = useState(hoy.getMonth() + 1);
  const [ano, setAno] = useState(hoy.getFullYear());

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
    <div className="min-vh-100" style={{ background: "var(--color-bg)" }}>
      {/* Header simplificado */}
      <div
        className="sticky-top"
        style={{ background: "var(--color-bg)", borderBottom: "1px solid var(--color-border)", zIndex: 10 }}
      >
        <div className="container-fluid px-4 py-3">
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center">
              <button
                className="btn d-flex align-items-center justify-content-center me-3"
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  background: 'var(--color-bg-card)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-secondary)',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'var(--color-bg-subtle)';
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.color = 'var(--color-text)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'var(--color-bg-card)';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.color = 'var(--color-text-secondary)';
                }}
                onClick={() => navigate('/admin/ventas')}
                title="Volver a Ventas"
                aria-label="Volver a Ventas"
              >
                ←
              </button>
              <div>
                <h1 className="h4 fw-bold mb-0" style={{ color: "var(--color-text)" }}>
                  💰 Detalle de Ventas {nombreRestaurante ? `— ${nombreRestaurante}` : ""}
                </h1>
                <p className="text-muted mb-0 small">Consulta las ventas registradas por período</p>
              </div>
            </div>
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
            onClick={retrocederMes}
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
            onClick={avanzarMes}
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
          </div>
        ) : (
          <>
            {/* Resumen del período */}
            <div className="row g-3 mb-4">
              <div className="col-md-4">
                <div className="ag-card p-3 text-center">
                  <div className="fw-bold text-success mb-1" style={{ fontSize: '1.4rem' }}>
                    {simbolo}{total.toFixed(2)}
                  </div>
                  <div className="text-muted small">Total Ventas</div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="ag-card p-3 text-center">
                  <div className="fw-bold text-info mb-1" style={{ fontSize: '1.4rem' }}>
                    {simbolo}{promedio.toFixed(2)}
                  </div>
                  <div className="text-muted small">Promedio Diario</div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="ag-card p-3 text-center">
                  <div className="fw-bold text-primary mb-1" style={{ fontSize: '1.4rem' }}>
                    {ventas.length}
                  </div>
                  <div className="text-muted small">Ventas Registradas</div>
                </div>
              </div>
            </div>
            {/* Resumen del período */}
            <div 
              className="mb-4" 
              style={{ 
                background: "var(--color-bg-card)", 
                border: "1px solid var(--color-border)", 
                borderRadius: "16px", 
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)" 
              }}
            >
              <div 
                className="d-flex align-items-center px-4 py-3" 
                style={{ borderBottom: "1px solid var(--color-border)" }}
              >
                <div 
                  className="d-flex align-items-center justify-content-center me-3"
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #00b894, #00a085)",
                    color: "white"
                  }}
                >
                  📈
                </div>
                <h5 className="mb-0 fw-bold" style={{ color: "var(--color-text)" }}>
                  Resumen del Período
                </h5>
              </div>
              <div className="p-4">
                <div className="row g-4">
                  <div className="col-6 col-md-4">
                    <div className="text-center">
                      <div className="fw-bold text-success mb-1" style={{ fontSize: '1.4rem' }}>
                        {simbolo}{total.toFixed(2)}
                      </div>
                      <div className="text-muted small fw-medium">Total Ventas</div>
                    </div>
                  </div>
                  <div className="col-6 col-md-4">
                    <div className="text-center">
                      <div className="fw-bold text-info mb-1" style={{ fontSize: '1.4rem' }}>
                        {simbolo}{promedio.toFixed(2)}
                      </div>
                      <div className="text-muted small fw-medium">Promedio Diario</div>
                    </div>
                  </div>
                  <div className="col-12 col-md-4">
                    <div className="text-center">
                      <div className="fw-bold text-primary mb-1" style={{ fontSize: '1.4rem' }}>
                        {ventas.length}
                      </div>
                      <div className="text-muted small fw-medium">Ventas Registradas</div>
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
