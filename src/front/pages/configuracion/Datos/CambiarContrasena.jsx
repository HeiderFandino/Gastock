import React, { useState } from "react";

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
      setActual("");
      setNueva("");
      setConfirmar("");
    } catch (error) {
      console.error("Error cambiando contraseña:", error);
      alert(error.message);
    }
  };

  return (
    <div className="card col-sm-12 col-md-12 col-lg-10 me-4 col-xl-4 p-4 mb-4">
      <h4>Cambiar contraseña</h4>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Contraseña actual</label>
          <input
            type="password"
            className="form-control"
            value={actual}
            onChange={(e) => setActual(e.target.value)}
            placeholder="Contraseña actual"
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Nueva contraseña</label>
          <input
            type="password"
            className="form-control"
            value={nueva}
            onChange={(e) => setNueva(e.target.value)}
            placeholder="Nueva contraseña"
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Confirmar nueva contraseña</label>
          <input
            type="password"
            className="form-control"
            value={confirmar}
            onChange={(e) => setConfirmar(e.target.value)}
            placeholder="Repite nueva contraseña"
          />
        </div>
        <button type="submit" className="btn text-white">Actualizar contraseña</button>
      </form>
    </div>
  );
};

