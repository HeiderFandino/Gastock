import React, { useState } from "react";
import "../../../styles/Ajustes.css";

export const CambiarContrasena = () => {
  const [actual, setActual] = useState("");
  const [nueva, setNueva] = useState("");
  const [confirmar, setConfirmar] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (nueva !== confirmar) {
      alert("Las contraseñas no coinciden");
      return;
    }
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/cambiar-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
        body: JSON.stringify({ actual, nueva }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.msg || "Error al cambiar la contraseña");
      alert(data.msg || "Contraseña cambiada correctamente");
      setActual(""); setNueva(""); setConfirmar("");
    } catch (error) {
      console.error("Error cambiando contraseña:", error);
      alert(error.message);
    }
  };

  return (
    <div className="aj-card mb-4">
      <h4>Cambiar contraseña</h4>
      <form onSubmit={handleSubmit} className="aj-row">
        <div className="mb-2">
          <label className="form-label aj-label">Contraseña actual</label>
          <input
            type="password"
            className="form-control"
            value={actual}
            onChange={(e) => setActual(e.target.value)}
            placeholder="••••••••"
          />
        </div>
        <div className="mb-2">
          <label className="form-label aj-label">Nueva contraseña</label>
          <input
            type="password"
            className="form-control"
            value={nueva}
            onChange={(e) => setNueva(e.target.value)}
            placeholder="••••••••"
          />
        </div>
        <div className="mb-2">
          <label className="form-label aj-label">Confirmar nueva contraseña</label>
          <input
            type="password"
            className="form-control"
            value={confirmar}
            onChange={(e) => setConfirmar(e.target.value)}
            placeholder="••••••••"
          />
        </div>
        <div className="mt-2">
          <button type="submit" className="btn-gastock">Actualizar contraseña</button>
        </div>
      </form>
    </div>
  );
};
