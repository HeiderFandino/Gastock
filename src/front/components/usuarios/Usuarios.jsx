import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../../hooks/useGlobalReducer";
import UserModal from "../../components/usuarios/UserModal.jsx";
import PasswordModal from "../../components/usuarios/PasswordModal.jsx";
import { FiPlus, FiUser, FiTrash2, FiEdit2 } from "react-icons/fi";
import "../../styles/Usuarios.css";
const Users = () => {
  const navigate = useNavigate();
  const { store } = useGlobalReducer();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("All Roles");
  const [selectedStatus, setSelectedStatus] = useState("All Status");
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
        fetch(`${backend}/api/restaurantes`, { headers }),
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
    const el = document.getElementsByClassName("custom-sidebar")?.[0];
    if (el) el.scrollTo(0, 0);
  }, []);

  const currentRole = store?.user?.rol || null;

  const filteredUsers = users.filter((user) => {
    const nombre = (user.nombre || "").toLowerCase();
    const email = (user.email || "").toLowerCase();
    const rol = (user.rol || "").toLowerCase();
    const status = (user.status || "").toLowerCase();

    const searchMatch =
      nombre.includes(searchTerm.toLowerCase()) ||
      email.includes(searchTerm.toLowerCase());

    const roleMatch =
      selectedRole === "All Roles" || rol === selectedRole.toLowerCase();

    const statusMatch =
      selectedStatus === "All Status" ||
      status === selectedStatus.toLowerCase();

    // Filtro por jerarquía de roles en frontend (además de la del backend)
    if (currentRole === "super_admin" && !["admin", "super_admin"].includes(user.rol)) {
      return false;
    }
    if (currentRole === "admin" && !["director", "encargado", "chef"].includes(user.rol)) {
      return false;
    }
    if (currentRole === "director" && !["encargado", "chef"].includes(user.rol)) {
      return false;
    }

    return searchMatch && roleMatch && statusMatch;
  });

  const handleSaveUser = async (userData) => {
    const payload = {
      nombre: userData.nombre,
      email: userData.email,
      password: userData.password,
      rol: userData.rol,
      status: userData.status,
      restaurante_id: userData.restaurante_id,
      empresa_nombre: userData.empresa_nombre,
    };

    try {
      const res = await fetch(
        currentUser
          ? `${backend}/api/usuarios/${currentUser.id}`
          : `${backend}/api/register`,
        {
          method: currentUser ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );
      const result = await res.json();
      if (!res.ok) {
        setMessage(result.error || "Error al guardar usuario");
        setTimeout(() => setMessage(""), 6000);
        return;
      }

      setIsModalOpen(false);
      setCurrentUser(null);
      await loadData();
      setMessage(
        currentUser ? "✅ Usuario actualizado con éxito." : "✅ Usuario creado con éxito."
      );
      setTimeout(() => setMessage(""), 4000);
    } catch (err) {
      console.error("Error al guardar usuario", err);
      setMessage("Error de conexión al guardar usuario");
      setTimeout(() => setMessage(""), 6000);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("¿Eliminar este usuario?")) return;
    try {
      const res = await fetch(`${backend}/api/usuarios/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (!res.ok) {
        setMessage(result.error || "Error al eliminar usuario");
        setTimeout(() => setMessage(""), 6000);
        return;
      }

      await loadData();
      setMessage("Usuario eliminado correctamente.");
      setTimeout(() => setMessage(""), 4000);
    } catch (err) {
      console.error("Error eliminando usuario", err);
    }
  };

  const handleToggleClick = (user) => {
    // Para el super_admin no pedimos contraseña, solo cambiamos estado
    if (currentRole === "super_admin") {
      toggleStatusWithoutPassword(user);
    } else {
      setUserToToggle(user);
      setShowPasswordModal(true);
    }
  };

  const toggleStatusWithoutPassword = async (user) => {
    const newStatus = user.status === "active" ? "inactive" : "active";

    try {
      const res = await fetch(`${backend}/api/usuarios/${user.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre: user.nombre,
          email: user.email,
          rol: user.rol,
          restaurante_id: user.restaurante_id,
          status: newStatus,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        setMessage(result.error || "Error al actualizar estado");
        setTimeout(() => setMessage(""), 6000);
        return;
      }

      await loadData();
      setMessage(
        `Usuario "${user.nombre}" actualizado a "${newStatus}".`
      );
      setTimeout(() => setMessage(""), 4000);
    } catch (err) {
      console.error("Error al actualizar estado del usuario", err);
      setMessage("Error de conexión al actualizar estado");
      setTimeout(() => setMessage(""), 6000);
    }
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
        setMessage(result.error || "Error al actualizar estado");
        setTimeout(() => setMessage(""), 6000);
        setShowPasswordModal(false);
        setUserToToggle(null);
        return;
      }

      await loadData();
      setMessage(
        `Usuario "${userToToggle.nombre}" actualizado a "${newStatus}".`
      );
      setTimeout(() => setMessage(""), 4000);
      setShowPasswordModal(false);
      setUserToToggle(null);
    } catch (err) {
      console.error("Error al actualizar estado del usuario", err);
      setMessage("Error de conexión al actualizar estado");
      setTimeout(() => setMessage(""), 6000);
      setShowPasswordModal(false);
      setUserToToggle(null);
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

  const getDisplayOrg = (user) => {
    if (currentRole === "super_admin") {
      return user.empresa_nombre || "-";
    }
    return restaurants.find((r) => r.id === user.restaurante_id)?.nombre || "-";
  };

  const orgHeaderLabel = currentRole === "super_admin" ? "Empresa" : "Restaurante";

  return (
    <div className="dashboard-container users-container">
      {/* ===== Header compacto v2 (brand) ===== */}
      <div className="ag-header mb-3">

        <div className="ag-title-wrap">
          <h1 className="ag-title">Usuarios</h1>
          <p className="ag-subtitle">Maneja todos tus usuarios.</p>
        </div>

        {/* Filtros + CTA (desktop) */}
        <div className="d-none d-sm-flex align-items-center justify-content-between gap-2 mt-1">
          <div className="d-flex align-items-center gap-2">
            <input
              type="text"
              className="form-control"
              placeholder="Buscar por nombre o email…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ maxWidth: 320 }}
            />
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="form-select"
              style={{ maxWidth: 200 }}
            >
              <option value="All Roles">Todos los Roles</option>
              <option value="admin">Admin</option>
              <option value="director">Director</option>
              <option value="encargado">Encargado</option>
              <option value="chef">Chef</option>
            </select>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="form-select"
              style={{ maxWidth: 200 }}
            >
              <option value="All Status">Todos los Estados</option>
              <option value="active">Activo</option>
              <option value="inactive">Inactivo</option>
            </select>
          </div>

          <button className="btn ag-monthbtn" onClick={handleAddUser}>
            <FiPlus className="me-2" />
            Añadir Usuario
          </button>
        </div>

        {/* Filtros compactos (móvil) */}
        <div className="d-sm-none mt-2">
          <div className="d-flex flex-column gap-2">
            <input
              type="text"
              className="form-control"
              placeholder="Buscar…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="d-flex gap-2">
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="form-select"
              >
                <option value="All Roles">Roles</option>
                <option value="admin">Admin</option>
                <option value="director">Director</option>
                <option value="encargado">Encargado</option>
                <option value="chef">Chef</option>
              </select>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="form-select"
              >
                <option value="All Status">Estado</option>
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {message && (
        <div className="alert alert-success text-center" role="alert">
          {message}
        </div>
      )}

      {/* ===== Lista mobile (cards) ===== */}
      <ul className="list-unstyled d-sm-none">
        {filteredUsers.length === 0 ? (
          <li className="text-muted px-2">No se encontraron usuarios.</li>
        ) : (
          filteredUsers.map((user) => (
            <li key={user.id} className="ag-card p-3 mb-2">
              <div className="d-flex justify-content-between align-items-start gap-2">
                <div className="d-flex align-items-center gap-2">
                  <div className="user-avatar-pill">
                    <FiUser size={24} />
                  </div>
                  <div>
                    <div className="fw-bold" style={{ fontSize: "1.02rem" }}>
                      {user.nombre}
                    </div>
                    <div className="text-muted" style={{ fontSize: ".9rem" }}>
                      {user.email}
                    </div>
                    <div className="d-flex align-items-center gap-2 mt-1">
                      <span className={`badge-role badge-${user.rol}`}>{user.rol}</span>
                      <span className="dot-sep">.</span>
                      <span className="text-muted" style={{ fontSize: ".9rem" }}>
                        {getDisplayOrg(user)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-end">
                  {user.rol !== "super_admin" && (
                    <button
                      className={`badge border-0 text-white px-2 py-1 rounded-pill ${user.status === "active" ? "bg-success" : "bg-secondary"}`}
                      onClick={() => handleToggleClick(user)}
                      title="Cambiar estado del usuario"
                    >
                      {user.status === "active" ? "Activo" : "Inactivo"}
                    </button>
                  )}
                  <div className="d-flex justify-content-end gap-2 mt-2">
                    {user.rol !== "super_admin" && (
                      <>
                        <button
                          className="action-icon-button edit-button"
                          onClick={() => handleEditUser(user)}
                          title="Editar"
                          aria-label="Editar"
                        >
                          <FiEdit2 size={18} aria-hidden="true" focusable="false" />
                        </button>
                        <button
                          className="action-icon-button delete-button"
                          onClick={() => handleDeleteUser(user.id)}
                          title="Eliminar"
                          aria-label="Eliminar"
                        >
                          <FiTrash2 size={18} aria-hidden="true" focusable="false" />
                        </button>
                      </>
                    )}
                  </div>
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
              <th>User</th>
              <th>Role</th>
              <th>Status</th>
              <th>{orgHeaderLabel}</th>
              <th className="text-end">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center text-muted">
                  No se encontraron usuarios.
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="user-info d-flex align-items-center gap-2">
                      <div className="user-avatar-pill">
                        <FiUser size={22} />
                      </div>
                      <div className="user-details">
                        <div className="user-name">{user.nombre}</div>
                        <div className="user-email">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`badge-role badge-${user.rol}`}>{user.rol}</span>
                  </td>
                  <td>
                    {user.rol !== "super_admin" && (
                      <button
                        className={`badge border-0 text-white px-2 py-1 rounded-pill ${user.status === "active" ? "bg-success" : "bg-secondary"}`}
                        onClick={() => handleToggleClick(user)}
                        title="Cambiar estado del usuario"
                      >
                        {user.status === "active" ? "Activo" : "Inactivo"}
                      </button>
                    )}
                  </td>
                  <td>{getDisplayOrg(user)}</td>
                  <td className="actions-cell text-end">
                    {user.rol !== "super_admin" && (
                      <>
                        <button
                          className="action-icon-button edit-button me-2"
                          onClick={() => handleEditUser(user)}
                          title="Editar"
                        >
                          <FiEdit2 size={18} aria-hidden="true" focusable="false" />
                        </button>
                        <button
                          className="action-icon-button delete-button"
                          onClick={() => handleDeleteUser(user.id)}
                          title="Eliminar"
                        >
                          <FiTrash2 size={18} aria-hidden="true" focusable="false" />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* FAB solo móvil */}
      {!isModalOpen && (
        <button
          className="fab-users d-sm-none"
          onClick={handleAddUser}
          aria-label="Añadir usuario"
          title="Añadir usuario"
        >
          <span className="fab-plus">+</span>
        </button>
      )}

      {/* Modales */}
      {isModalOpen && (
        <UserModal
          user={currentUser}
          onSave={handleSaveUser}
          onClose={() => setIsModalOpen(false)}
          restaurants={restaurants}
          currentRole={currentRole}
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
