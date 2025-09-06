import React, { useState } from "react";
import "../../../styles/Ajustes.css";

export const Personalizacion = () => {
  const [tema, setTema] = useState("claro");
  const handleChange = (e) => setTema(e.target.value);

  return (
    <div className="aj-card mb-4">
      <h4>Personalización</h4>
      <div className="mb-2">
        <label className="form-label aj-label">Tema visual</label>
        <select className="form-select" value={tema} onChange={handleChange}>
          <option value="claro">Claro</option>
          <option value="oscuro">Oscuro</option>
        </select>
      </div>
      <button className="btn-gastock mt-2">Aplicar cambios</button>
    </div>
  );
};
