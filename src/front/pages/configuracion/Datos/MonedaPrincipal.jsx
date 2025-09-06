import React, { useState, useEffect } from "react";
import "../../../styles/Ajustes.css";

export const MonedaPrincipal = () => {
  const restaurante_id = sessionStorage.getItem("restaurante_id");
  const [moneda, setMoneda] = useState(sessionStorage.getItem("restaurante_moneda") || "");

  useEffect(() => {
    const monedaGuardada = sessionStorage.getItem("restaurante_moneda");
    if (monedaGuardada) setMoneda(monedaGuardada);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const resp = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/restaurantes/${restaurante_id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + sessionStorage.getItem("token"),
        },
        body: JSON.stringify({ moneda }),
      });
      if (!resp.ok) throw new Error("Error al actualizar la moneda");
      await resp.json();
      sessionStorage.setItem("restaurante_moneda", moneda);
      alert("Moneda actualizada correctamente");
    } catch (error) {
      console.error("Error al guardar la moneda:", error);
      alert("Hubo un problema al guardar la moneda");
    }
  };

  return (
    <div className="aj-card mb-4">
      <h4>Moneda principal</h4>
      <form onSubmit={handleSubmit} className="aj-row">
        <div className="mb-2">
          <label className="form-label aj-label">Selecciona tu moneda</label>
          <select className="form-select" value={moneda} onChange={(e) => setMoneda(e.target.value)}>
            <option value="">Selecciona</option>
            <option value="EUR">€ Euro</option>
            <option value="USD">$ Dólar</option>
            <option value="GBP">£ Libra</option>
          </select>
        </div>
        <div className="mt-2">
          <button type="submit" className="btn-gastock">Guardar cambio</button>
        </div>
      </form>
    </div>
  );
};
