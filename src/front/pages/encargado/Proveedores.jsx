import React, { useEffect, useState } from "react";
import useGlobalReducer from "../../hooks/useGlobalReducer";
import proveedorServices from "../../services/proveedorServices";
import { ProveedorForm } from "../../components/shared/ProveedorForm";
import "../../styles/Encargado.css";

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
      <div className="d-flex align-items-center justify-content-between gap-2 mb-3">
        <h1 className="dashboard-title m-0">Proveedores</h1>

        {/* Botón en desktop */}
        <button className="btn-gastock d-none d-sm-inline-flex" onClick={abrirModalCrear}>
          <i className="bi bi-plus-circle me-2"></i> Nuevo Proveedor
        </button>
      </div>

      {/* Botón ancho en móvil */}
      <div className="d-grid d-sm-none mb-2">
        <button className="btn-gastock" onClick={abrirModalCrear}>
          <i className="bi bi-plus-circle me-2"></i> Nuevo Proveedor
        </button>
      </div>

      {mensajeError && <div className="alert alert-danger">{mensajeError}</div>}
      {mensajeExito && <div className="alert alert-success">{mensajeExito}</div>}

      {loading ? (
        <p>Cargando...</p>
      ) : proveedores.length === 0 ? (
        <p>No hay proveedores registrados.</p>
      ) : (
        <>
          {/* LISTA MÓVIL (xs–sm) */}
          <ul className="prov-list list-unstyled d-sm-none">
            {proveedores.map((p) => (
              <li key={p.id} className="prov-item">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <div className="prov-name">{p.nombre}</div>
                    <div className="prov-cat">{p.categoria || "—"}</div>
                  </div>
                  <div className="d-flex gap-2">
                    <button
                      className="action-icon-button edit-button"
                      onClick={() => abrirModalEditar(p.id)}
                      aria-label="Editar proveedor"
                      title="Editar"
                    >
                      <i className="bi bi-pencil-square"></i>
                    </button>
                    <button
                      className="action-icon-button delete-button"
                      onClick={() => eliminar(p.id)}
                      aria-label="Eliminar proveedor"
                      title="Eliminar"
                    >
                      <i className="bi bi-trash"></i>
                    </button>

                  </div>
                </div>
              </li>
            ))}
          </ul>

          {/* TABLA DESKTOP (≥ md) */}
          <div className="table-responsive d-none d-sm-block">
            <table className="table table-striped users-table mb-0">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Categoría</th>
                  <th className="text-end">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {proveedores.map((p) => (
                  <tr key={p.id}>
                    <td>{p.nombre}</td>
                    <td>{p.categoria}</td>
                    <td className="text-end">
                      <button
                        className="action-icon-button edit-button me-2"
                        onClick={() => abrirModalEditar(p.id)}
                        title="Editar"
                      >
                        <i className="bi bi-pencil-square"></i>
                      </button>
                      <button
                        className="action-icon-button delete-button"
                        onClick={() => eliminar(p.id)}
                        title="Eliminar"
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}



      {mostrarModal && (
        <div className="modal d-block prov-modal-backdrop">
          <div className="modal-dialog prov-modal-dialog">
            <div className="modal-content p-3">
              <ProveedorForm
                proveedor={proveedorEditando}
                onSuccess={handleSuccess}
                onCancel={cerrarModal}
              />
            </div>
          </div>
        </div>
      )}
      {!mostrarModal && (
        <button
          className="fab-proveedor"
          onClick={abrirModalCrear}
          aria-label="Crear nuevo proveedor"
          title="Nuevo proveedor"
        >
          <span className="fab-plus">+</span>
        </button>
      )}
    </div>
  );

};
