import React, { useEffect, useState } from "react";
import useGlobalReducer from "../../hooks/useGlobalReducer";
import proveedorServices from "../../services/proveedorServices";
import ProveedorModal from "../../components/shared/ProveedorModal";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import InlineLoader from "../../components/InlineLoader";
// Estilos ya incluidos en brand-unified.css

export const Proveedores = () => {
  const { store } = useGlobalReducer();
  const restaurante_id = store.user.restaurante_id;

  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensajeError, setMensajeError] = useState("");
  const [mensajeExito, setMensajeExito] = useState("");
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modoEditar, setModoEditar] = useState(false);
  const [proveedorEditando, setProveedorEditando] = useState(null);

  const cargar = async () => {
    setLoading(true);
    try {
      const list = await proveedorServices.getProveedores(restaurante_id);
      setProveedores(list);
    } catch {
      setMensajeError("Error al cargar proveedores");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
    const el = document.getElementsByClassName("custom-sidebar")[0];
    if (el) el.scrollTo(0, 0);
  }, []);

  const eliminar = async (id) => {
    if (!window.confirm("¿Eliminar este proveedor?")) return;
    try {
      await proveedorServices.eliminarProveedor(id);
      setMensajeExito("Proveedor eliminado correctamente");
      cargar();
      setTimeout(() => setMensajeExito(""), 3000);
    } catch {
      setMensajeError("Error al eliminar proveedor");
    }
  };

  const abrirModalCrear = () => {
    setModoEditar(false);
    setProveedorEditando(null);
    setMostrarModal(true);
  };

  const abrirModalEditar = async (id) => {
    try {
      const proveedor = await proveedorServices.getProveedor(id);
      setModoEditar(true);
      setProveedorEditando(proveedor);
      setMostrarModal(true);
    } catch {
      setMensajeError("No se pudo cargar el proveedor");
    }
  };

  const cerrarModal = () => {
    setMostrarModal(false);
    setProveedorEditando(null);
  };

  const handleSuccess = () => {
    cerrarModal();
    cargar();
    setMensajeExito("Proveedor guardado exitosamente");
    setTimeout(() => setMensajeExito(""), 3000);
  };


  return (
    <div className="dashboard-container">
      {/* HEADER */}
      <div className="d-flex align-items-center justify-content-between gap-2 mb-4">
        <div>
          <h1 className="ag-title mb-1">🏢 Proveedores</h1>
          <p className="ag-subtitle mb-0">Gestiona los proveedores del restaurante</p>
        </div>

        {/* Botón en desktop */}
        <button className="btn-gastock d-none d-md-inline-flex" onClick={abrirModalCrear}>
          ➕ Nuevo Proveedor
        </button>
      </div>

      {mensajeError && (
        <div className="alert alert-danger d-flex align-items-center gap-2 mb-3">
          ⚠️ {mensajeError}
        </div>
      )}
      {mensajeExito && (
        <div className="alert alert-success d-flex align-items-center gap-2 mb-3">
          ✅ {mensajeExito}
        </div>
      )}

      {loading ? (
        <InlineLoader message="Cargando proveedores..." />
      ) : proveedores.length === 0 ? (
        <div className="empty-state text-center py-5">
          <div className="empty-icon mb-3">🏢</div>
          <h3 className="empty-title">Sin proveedores</h3>
          <p className="empty-text mb-4">No hay proveedores registrados en este restaurante</p>
          <button className="btn-gastock" onClick={abrirModalCrear}>
            ➕ Registrar Primer Proveedor
          </button>
        </div>
      ) : (
        <>
          {/* LISTA MÓVIL */}
          <div className="d-sm-none">
            {proveedores.map((p) => (
              <div key={p.id} className="ag-card p-3 mb-3">
                <div className="d-flex justify-content-between align-items-start">
                  <div className="flex-grow-1 pe-3">
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <span className="ag-icon">🏢</span>
                      <h6 className="mb-0 fw-bold">{p.nombre}</h6>
                    </div>
                    <div className="text-muted small mb-1">
                      📋 {p.categoria || "Sin categoría"}
                    </div>
                    {p.contacto && (
                      <div className="text-muted small mb-1">
                        👤 {p.contacto}
                      </div>
                    )}
                    {p.telefono && (
                      <div className="text-muted small mb-1">
                        📞 {p.telefono}
                      </div>
                    )}
                  </div>
                  <div className="d-flex flex-column gap-2">
                    <button
                      className="action-icon-button edit-button"
                      onClick={() => abrirModalEditar(p.id)}
                      title="Editar proveedor"
                    >
<FiEdit2 size={18} aria-hidden="true" focusable="false" />
                    </button>
                    <button
                      className="action-icon-button delete-button"
                      onClick={() => eliminar(p.id)}
                      title="Eliminar proveedor"
                    >
<FiTrash2 size={18} aria-hidden="true" focusable="false" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* TABLA DESKTOP */}
          <div className="table-responsive d-none d-sm-block">
            <table className="table ag-table mb-0">
              <thead>
                <tr>
                  <th>🏢 Proveedor</th>
                  <th>📋 Categoría</th>
                  <th>👤 Contacto</th>
                  <th>📞 Teléfono</th>
                  <th className="text-end">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {proveedores.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div className="fw-bold">{p.nombre}</div>
                      {p.direccion && (
                        <small className="text-muted">📍 {p.direccion}</small>
                      )}
                    </td>
                    <td>{p.categoria || "—"}</td>
                    <td>{p.contacto || "—"}</td>
                    <td>{p.telefono || "—"}</td>
                    <td className="text-end">
                      <button
                        className="action-icon-button edit-button me-2"
                        onClick={() => abrirModalEditar(p.id)}
                        title="Editar proveedor"
                      >
  <FiEdit2 size={18} aria-hidden="true" focusable="false" />
                      </button>
                      <button
                        className="action-icon-button delete-button"
                        onClick={() => eliminar(p.id)}
                        title="Eliminar proveedor"
                      >
  <FiTrash2 size={18} aria-hidden="true" focusable="false" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}



      <ProveedorModal
        show={mostrarModal}
        onHide={cerrarModal}
        onSuccess={handleSuccess}
        proveedor={proveedorEditando}
        modo={modoEditar ? "editar" : "crear"}
      />

      {/* FAB para móvil */}
      {!mostrarModal && (
        <button
          className="d-md-none"
          onClick={abrirModalCrear}
          title="Nuevo proveedor"
          style={{
            position: 'fixed',
            bottom: '120px',
            right: '24px',
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'rgba(135, 206, 235, 0.6)',
            backdropFilter: 'blur(15px)',
            border: 'none',
            color: 'white',
            fontSize: '1.5rem',
            boxShadow: '0 4px 16px rgba(135, 206, 235, 0.4)',
            zIndex: 1000,
            transition: 'all 0.3s ease',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'scale(1.1)';
            e.target.style.boxShadow = '0 6px 20px rgba(135, 206, 235, 0.6)';
            e.target.style.background = 'rgba(135, 206, 235, 0.8)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'scale(1)';
            e.target.style.boxShadow = '0 4px 16px rgba(135, 206, 235, 0.4)';
            e.target.style.background = 'rgba(135, 206, 235, 0.6)';
          }}
        >
          🏢
        </button>
      )}
    </div>
  );

};
