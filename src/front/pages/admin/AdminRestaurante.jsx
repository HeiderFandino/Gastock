import React, { useState, useEffect } from "react";
import restauranteService from "../../services/restauranteServices";
import RestauranteModal from "../../components/RestauranteModal";
import PasswordModal from "../../components/usuarios/PasswordModal";
import ErrorModal from "./ErrorModal"; // :marca_de_verificación_blanca: NUEVA IMPORTACIÓN
import { FiEdit2, FiTrash2, FiPlus } from "react-icons/fi";
import "../../styles/UserModal.css";
import "../../styles/Usuarios.css";

const AdminRestaurante = () => {
  const [restaurantes, setRestaurantes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [currentRestaurante, setCurrentRestaurante] = useState(null);
  const [message, setMessage] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [restauranteToDelete, setRestauranteToDelete] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [showErrorModal, setShowErrorModal] = useState(false); // :marca_de_verificación_blanca: NUEVO
  const [errorModalMessage, setErrorModalMessage] = useState(""); // :marca_de_verificación_blanca: NUEVO
  const token = sessionStorage.getItem("token");
  const loadData = async () => {
    try {
      const data = await restauranteService.getRestaurantes(token);
      setRestaurantes(data);
    } catch (err) {
      console.error("Error al cargar restaurantes", err);
    }
  };
  useEffect(() => {
    loadData();
  }, []);
  const filteredRestaurantes = restaurantes.filter((r) =>
    r.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const handleSave = async (data) => {
    try {
      if (currentRestaurante) {
        await restauranteService.updateRestaurante(currentRestaurante.id, data, token);
        setMessage(":marca_de_verificación_blanca: Restaurante actualizado correctamente.");
      } else {
        await restauranteService.createRestaurante(data, token);
        setMessage(":marca_de_verificación_blanca: Restaurante creado correctamente.");
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
        setErrorModalMessage(" No se puede eliminar un restaurante con ventas asociadas.");
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
      setMessage(":papelera: Restaurante eliminado correctamente.");
      loadData();
      setTimeout(() => setMessage(""), 4000);
    } catch (err) {
      console.error("Error al eliminar restaurante", err);
      setErrorMessage(err.message || ":x: No se pudo eliminar el restaurante.");
    }
  };
  return (
    <div className="dashboard-container users-container">
      <div className="users-header">
        <div className="header-text">
          <h1>Restaurantes</h1>
          <p>Gestiona los restaurantes registrados</p>
        </div>
        <button className="add-user-button" onClick={() => {
          setModalOpen(true);
          setCurrentRestaurante(null);
        }}>
          <FiPlus className="me-2" /> Añadir Restaurante
        </button>
      </div>
      {message && (
        <div className="alert alert-success text-center" role="alert">
          {message}
        </div>
      )}
      <div className="users-filters">
        <input
          type="text"
          placeholder="Buscar por nombre..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="filter-search-input col-12 col-sm-12 col-md-12 col-lg-6 col-xl-4"
        />
      </div>
      <table className="users-table mt-3">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Dirección</th>
            <th>Teléfono</th>
            <th>Email</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filteredRestaurantes.length === 0 ? (
            <tr>
              <td colSpan="5" className="text-center">No hay restaurantes encontrados.</td>
            </tr>
          ) : (
            filteredRestaurantes.map((r) => (
              <tr key={r.id}>
                <td>{r.nombre}</td>
                <td>{r.direccion || "-"}</td>
                <td>{r.telefono || "-"}</td>
                <td>{r.email_contacto || "-"}</td>
                <td className="actions-cell">
                  <button className="action-icon-button edit-button" onClick={() => handleEdit(r)} title="Editar">
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
          onClose={() => {
            setShowPasswordModal(false);
            setRestauranteToDelete(null);
          }}
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
