import React, { useState, useEffect } from "react";
import useGlobalReducer from "../../../hooks/useGlobalReducer";
import "../../../styles/Ajustes.css";

export const DatosPersonales = () => {
  const { store, dispatch } = useGlobalReducer();
  const user = store.user;

  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (user) {
      setNombre(user.nombre || "");
      setEmail(user.email || "");
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const updateData = { nombre, email };
      if (user.password) updateData.password = user.password;
      if (user.restaurante_id !== undefined) updateData.restaurante_id = user.restaurante_id;

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/usuarios/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) throw new Error("Error actualizando datos");
      const data = await response.json();

      dispatch({ type: "get_user_info", payload: { ...user, nombre, email } });
      alert("Datos personales actualizados correctamente");
    } catch (error) {
      console.error("Error al actualizar datos personales:", error);
      alert("Error al actualizar los datos");
    }
  };

  return (
    <div className="aj-card mb-4">
      <h4>Datos personales</h4>
      <form onSubmit={handleSubmit} className="aj-row">
        <div className="mb-2">
          <label className="form-label aj-label">Nombre</label>
          <input
            type="text"
            className="form-control"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Nombre y apellido"
          />
        </div>
        <div className="mb-2">
          <label className="form-label aj-label">Correo electrónico</label>
          <input
            type="email"
            className="form-control"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@correo.com"
          />
        </div>
        <div className="mt-2">
          <button type="submit" className="btn-gastock">Guardar cambios</button>
        </div>
      </form>
    </div>
  );
};
