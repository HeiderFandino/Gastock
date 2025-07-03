import React, { useEffect, useState } from "react";
import "../../styles/UserModal.css";

const UserModal = ({ user, onSave, onClose, restaurants }) => {
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    password: "",
    rol: "chef",
    restaurante_id: "",
    status: "active"
  });

  useEffect(() => {
    if (user) {
      setFormData({
        nombre: user.nombre || "",
        email: user.email || "",
        password: "",
        rol: user.rol || "chef",
        restaurante_id: user.restaurante_id || "",
        status: user.status || "active"
      });
    } else {
      setFormData({
        nombre: "",
        email: "",
        password: "",
        rol: "chef",
        restaurante_id: "",
        status: "active"
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="modaal-backdrop">
      <div className="modaal">
        <h2 className="titulo">{user ? "Editar Usuario" : "Crear Usuario"}</h2>
        <form onSubmit={handleSubmit} className="modaal-form px-0">
          <input
            type="text"
            name="nombre"
            placeholder="Nombre"
            value={formData.nombre}
            onChange={handleChange}
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Correo electrónico"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder={user ? "Nueva contraseña (opcional)" : "Contraseña del nuevo usuario"}
            value={formData.password}
            onChange={handleChange}
            required={!user}
          />

          <select
            name="rol"
            value={formData.rol}
            onChange={handleChange}
            required
          >
            <option value="encargado">Encargado</option>
            <option value="chef">Chef</option>
          </select>

          <select
            name="restaurante_id"
            value={formData.restaurante_id}
            onChange={handleChange}
            required
          >
            <option value="">Selecciona un restaurante</option>
            {Array.isArray(restaurants) && restaurants.map((r) => (
              <option key={r.id} value={r.id}>
                {r.nombre}
              </option>
            ))}
          </select>

          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            required
          >
            <option value="active">Activo</option>
            <option value="inactive">Inactivo</option>
          </select>

          <div className="modaal-actions">
            <button type="button" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserModal;
