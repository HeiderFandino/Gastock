// src/front/pages/admin/AdminRestaurante.jsx
import React, { useState, useEffect } from "react";
import restauranteService from "../../services/restauranteServices";
import RestauranteModal from "../../components/RestauranteModal";
import PasswordModal from "../../components/usuarios/PasswordModal";
import ErrorModal from "./ErrorModal";
import { FiEdit2, FiTrash2, FiPlus } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import "../../styles/AdminGastos.css"; // layout/brand ag-*
import "../../styles/Usuarios.css";
import "../../styles/UserModal.css";

const AdminRestaurante = () => {
  const navigate = useNavigate();
  const [restaurantes, setRestaurantes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [currentRestaurante, setCurrentRestaurante] = useState(null);
  const [message, setMessage] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [restauranteToDelete, setRestauranteToDelete] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorModalMessage, setErrorModalMessage] = useState("");

  const token = sessionStorage.getItem("token");

  const loadData = async () => {
    try {
      const data = await restauranteService.getRestaurantes(token);
      setRestaurantes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error al cargar restaurantes", err);
    }
  };

  useEffect(() => {
    loadData();
    const el = document.getElementsByClassName("custom-sidebar")?.[0];
    if (el) el.scrollTo(0, 0);
  }, []);

  const filteredRestaurantes = restaurantes.filter((r) =>
    (r?.nombre || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = async (data) => {
    try {
      if (currentRestaurante) {
        await restauranteService.updateRestaurante(currentRestaurante.id, data, token);
        setMessage("Restaurante actualizado correctamente.");
      } else {
        await restauranteService.createRestaurante(data, token);
        setMessage("Restaurante creado correctamente.");
      }
      setModalOpen(false);
      setCurrentRestaurante(null);
      loadData();
      setTimeout(() => setMessage(""), 4000);
    } catch (err) {
      console.error("Error al guardar restaurante", err);
    }
  };

  const handleEdit = (restaurante) => {
    setCurrentRestaurante(restaurante);
    setModalOpen(true);
  };

  const handleRequestDelete = async (restaurante) => {
    try {
      const tieneVentas = await restauranteService.verificarVentas(restaurante.id, token);
      if (tieneVentas) {
        setErrorModalMessage("No se puede eliminar un restaurante con ventas asociadas.");
        setShowErrorModal(true);
        return;
      }
      setRestauranteToDelete(restaurante);
      setShowPasswordModal(true);
      setErrorMessage("");
    } catch (error) {
      console.error("Error al verificar ventas", error);
    }
  };

  const handleConfirmDelete = async (password) => {
    try {
      await restauranteService.eliminarRestaurante(restauranteToDelete.id, password, token);
      setShowPasswordModal(false);
      setRestauranteToDelete(null);
      setMessage("Restaurante eliminado correctamente.");
      loadData();
      setTimeout(() => setMessage(""), 4000);
    } catch (err) {
      console.error("Error al eliminar restaurante", err);
      setErrorMessage(err.message || "No se pudo eliminar el restaurante.");
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
          <h1 className="ag-title">Restaurantes</h1>
          <p className="ag-subtitle">Gestiona los restaurantes registrados.</p>
        </div>

        {/* Filtros + CTA (desktop visible) */}
        <div className="d-none d-sm-flex align-items-center justify-content-between gap-2 mt-1">
          <input
            type="text"
            className="form-control"
            placeholder="Buscar por nombre…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ maxWidth: 360 }}
          />
          <button
            className="ag-monthbtn"
            onClick={() => { setModalOpen(true); setCurrentRestaurante(null); }}
          >
            <FiPlus className="me-2" /> Añadir Restaurante
          </button>
        </div>

        {/* Filtro compacto en móvil */}
        <div className="d-sm-none mt-2">
          <input
            type="text"
            className="form-control"
            placeholder="Buscar…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {message && (
        <div className="alert alert-success text-center" role="alert">
          {message}
        </div>
      )}

      {/* ===== Lista mobile (cards) ===== */}
      <ul className="list-unstyled d-sm-none">
        {filteredRestaurantes.length === 0 ? (
          <li className="text-muted px-2">No hay restaurantes encontrados.</li>
        ) : (
          filteredRestaurantes.map((r) => (
            <li key={r.id} className="ag-card p-3 mb-2">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <div className="fw-bold" style={{ fontSize: "1.05rem" }}>{r.nombre}</div>
                  <div className="text-muted" style={{ fontSize: ".9rem" }}>
                    {r.direccion || "-"} · {r.telefono || "-"}
                  </div>
                  <div className="text-muted" style={{ fontSize: ".9rem" }}>{r.email_contacto || "-"}</div>
                </div>
                <div className="d-flex gap-2">
                  <button
                    className="action-icon-button edit-button"
                    onClick={() => handleEdit(r)}
                    title="Editar"
                    aria-label="Editar"
                  >
                    <FiEdit2 size={18} />
                  </button>
                  <button
                    className="action-icon-button delete-button"
                    onClick={() => handleRequestDelete(r)}
                    title="Eliminar"
                    aria-label="Eliminar"
                  >
                    <FiTrash2 size={18} />
                  </button>
                </div>
              </div>
            </li>
          ))
        )}
      </ul>

      {/* ===== Tabla desktop ===== */}
      <div className="table-responsive d-none d-sm-block">
        <table className="table users-table mt-2 mb-0">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Dirección</th>
              <th>Teléfono</th>
              <th>Email</th>
              <th className="text-end">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredRestaurantes.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center text-muted">No hay restaurantes encontrados.</td>
              </tr>
            ) : (
              filteredRestaurantes.map((r) => (
                <tr key={r.id}>
                  <td>{r.nombre}</td>
                  <td>{r.direccion || "-"}</td>
                  <td>{r.telefono || "-"}</td>
                  <td>{r.email_contacto || "-"}</td>
                  <td className="text-end">
                    <button className="action-icon-button edit-button me-2" onClick={() => handleEdit(r)} title="Editar">
                      <FiEdit2 size={18} />
                    </button>
                    <button className="action-icon-button delete-button" onClick={() => handleRequestDelete(r)} title="Eliminar">
                      <FiTrash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* FAB solo móvil */}
      {!modalOpen && (
        <button
          className="fab-rest"
          onClick={() => { setModalOpen(true); setCurrentRestaurante(null); }}
          aria-label="Añadir restaurante"
          title="Añadir restaurante"
        >
          <span className="fab-plus">+</span>
        </button>
      )}

      {/* Modales */}
      {modalOpen && (
        <RestauranteModal
          restaurante={currentRestaurante}
          onSave={handleSave}
          onClose={() => setModalOpen(false)}
        />
      )}

      {showPasswordModal && restauranteToDelete && (
        <PasswordModal
          isOpen={showPasswordModal}
          onClose={() => { setShowPasswordModal(false); setRestauranteToDelete(null); }}
          onConfirm={handleConfirmDelete}
          error={errorMessage}
        />
      )}

      <ErrorModal
        show={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        mensaje={errorModalMessage}
      />
    </div>
  );
};

export default AdminRestaurante;
