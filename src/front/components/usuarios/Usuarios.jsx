import React, { useState, useEffect } from 'react';
import UserModal from "../../components/usuarios/UserModal.jsx";
import PasswordModal from "../../components/usuarios/PasswordModal.jsx";
import { FiPlus, FiUser, FiEdit2, FiTrash2 } from 'react-icons/fi';
import "../../styles/Usuarios.css";
import "../../styles/UserModal.css";

const Users = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('All Roles');
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [message, setMessage] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [userToToggle, setUserToToggle] = useState(null);

  const backend = import.meta.env.VITE_BACKEND_URL;
  const token = sessionStorage.getItem("token");

  const loadData = async () => {
    if (!token) return;
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const [usersRes, restaurantsRes] = await Promise.all([
        fetch(`${backend}/api/usuarios`, { headers }),
        fetch(`${backend}/api/restaurantes`, { headers })
      ]);

      const usersData = await usersRes.json();
      const restaurantsData = await restaurantsRes.json();

      if (usersRes.ok) setUsers(usersData);
      if (restaurantsRes.ok) setRestaurants(restaurantsData);
    } catch (err) {
      console.error("❌ Error al cargar datos", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredUsers = users.filter(user => {
    const nombre = (user.nombre || "").toLowerCase();
    const email = (user.email || "").toLowerCase();
    const rol = (user.rol || "").toLowerCase();
    const status = (user.status || "").toLowerCase();

    const searchMatch =
      nombre.includes(searchTerm.toLowerCase()) ||
      email.includes(searchTerm.toLowerCase());

    const roleMatch = selectedRole === 'All Roles' || rol === selectedRole.toLowerCase();
    const statusMatch = selectedStatus === 'All Status' || status === selectedStatus.toLowerCase();

    return searchMatch && roleMatch && statusMatch;
  });

  const handleSaveUser = async (userData) => {
    const payload = {
      nombre: userData.nombre,
      email: userData.email,
      password: userData.password,
      rol: userData.rol,
      status: userData.status,
      restaurante_id: userData.restaurante_id
    };

    try {
      const res = await fetch(currentUser ? `${backend}/api/usuarios/${currentUser.id}` : `${backend}/api/register`, {
        method: currentUser ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const result = await res.json();
      if (!res.ok) return alert(result.error || "Error al guardar usuario");

      setIsModalOpen(false);
      setCurrentUser(null);
      await loadData();
      setMessage(currentUser ? "✅ Usuario actualizado con éxito." : "✅ Usuario creado con éxito.");
      setTimeout(() => setMessage(""), 4000);
    } catch (err) {
      console.error("Error al guardar usuario", err);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("¿Eliminar este usuario?")) return;
    try {
      const res = await fetch(`${backend}/api/usuarios/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await res.json();
      if (!res.ok) return alert(result.error || "Error al eliminar usuario");

      await loadData();
      setMessage("🗑️ Usuario eliminado correctamente.");
      setTimeout(() => setMessage(""), 4000);
    } catch (err) {
      console.error("Error eliminando usuario", err);
    }
  };

  const handleToggleClick = (user) => {
    setUserToToggle(user);
    setShowPasswordModal(true);
  };

  const handlePasswordConfirm = async (adminPassword) => {
    if (!userToToggle || !adminPassword) return;
    const newStatus = userToToggle.status === "active" ? "inactive" : "active";

    try {
      const res = await fetch(`${backend}/api/usuarios/${userToToggle.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre: userToToggle.nombre,
          email: userToToggle.email,
          rol: userToToggle.rol,
          restaurante_id: userToToggle.restaurante_id,
          status: newStatus,
          adminPassword,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        alert(result.error || "Error al actualizar estado");
        return;
      }

      await loadData();
      setMessage(`🔁 Usuario "${userToToggle.nombre}" actualizado a "${newStatus}".`);
      setTimeout(() => setMessage(""), 4000);
      setShowPasswordModal(false);
      setUserToToggle(null);
    } catch (err) {
      console.error("Error al actualizar estado del usuario", err);
      alert("Error en la solicitud");
    }
  };

  const handleAddUser = () => {
    setCurrentUser(null);
    setIsModalOpen(true);
  };

  const handleEditUser = (user) => {
    setCurrentUser(user);
    setIsModalOpen(true);
  };

  return (
    <div className="dashboard-container users-container">
      <div className="users-header">
        <div className="header-text">
          <h1>Usuarios</h1>
          <p>Maneja todos tus usuarios</p>
        </div>
        <button className="add-user-button" onClick={handleAddUser}>
          <FiPlus className="me-2" /> Añadir Usuario
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
          placeholder="Buscar usuarios..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="filter-search-input"
        />
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          className="filter-dropdown"
        >
          <option value="All Roles">Todos los Roles</option>
          <option value="encargado">Encargado</option>
          <option value="chef">Chef</option>
        </select>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="filter-dropdown"
        >
          <option value="All Status">Todos los Estados</option>
          <option value="active">Activo</option>
          <option value="inactive">Inactivo</option>
        </select>
      </div>

      <table className="table table-responsive users-table mt-3 ps-0">
        <thead>
          <tr>
            <th>User</th>
            <th>Role</th>
            <th>Status</th>
            <th>Restaurant</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.length === 0 ? (
            <tr>
              <td colSpan="5" className="text-center">No se encontraron usuarios.</td>
            </tr>
          ) : (
            filteredUsers.map(user => (
              <tr key={user.id}>
                <td>
                  <div className="user-info">
                    <div className="user-avatar">
                      <FiUser size={20} />
                    </div>
                    <div className="user-details">
                      <div className="user-name">{user.nombre}</div>
                      <div className="user-email">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span className={`badge badge-${user.rol}`}>{user.rol}</span>
                </td>
                <td>
                  <button
                    className={`badge border-0 text-white px-2 py-1 rounded-pill ${user.status === 'active' ? 'bg-success' : 'bg-secondary'
                      }`}
                    onClick={() => handleToggleClick(user)}
                    style={{ cursor: "pointer" }}
                    title="Cambiar estado del usuario"
                  >
                    {user.status === 'active' ? 'Activo' : 'Inactivo'}
                  </button>
                </td>
                <td>
                  {restaurants.find(r => r.id === user.restaurante_id)?.nombre || "-"}
                </td>
                <td className="actions-cell">
                  <button className="action-icon-button edit-button" onClick={() => handleEditUser(user)} title="Editar">
                    <svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" strokeLinejoin="round" height="18" width="18" xmlns="http://www.w3.org/2000/svg"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                  </button>
                  <button className="action-icon-button delete-button" onClick={() => handleDeleteUser(user.id)} title="Eliminar">
                    <FiTrash2 size={18} />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {isModalOpen && (
        <UserModal
          user={currentUser}
          onSave={handleSaveUser}
          onClose={() => setIsModalOpen(false)}
          restaurants={restaurants}
          hideAdminOption={true}
        />
      )}

      <PasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onConfirm={handlePasswordConfirm}
      />
    </div>
  );
};

export default Users;
